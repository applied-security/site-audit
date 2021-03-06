// // chrome.webNavigation.onCompleted.addListener(function(details) {
// //   console.log("crazy things may happen here!");
// //   console.log(details.url);
// // }, {url: [{urlMatches : "*"}]});
// // That didn't work
// //
// //
// //chrome.webRequest.onHeadersReceived.addListener(function(e){
// //    console.log(e);},
// //    {urls: ["http://*/*", "https://*/*"]},
// //    ["blocking"]
// //);

// // chrome.devtools.network.onRequestFinished.addListener(
// // 	function(request) {
// // 		console.log(1)
// // 	// if (request.response.bodySize > 40) {
// // 		// chrome.devtools.inspectedWindow.eval('console.log("Large image: " + unescape("' + escape(request.request.url) + '"))');
// // 	// }
// // });

// chrome.webRequest.onHeadersReceived.addListener(function(details){
//   console.log(details.responseHeaders);
// },
// {urls: ["http://*/*"]},["responseHeaders"]);


/******script verification start*******/

var VERSION_MASK = ' VERSION '

// example site that fails: https://minaleandmann.com -> update: not anymore (ignores comments)
// add more libraries
var libraryToCDN = {
                        "jquery.min.js": "https://ajax.googleapis.com/ajax/libs/jquery/" + VERSION_MASK + "/jquery.min.js",
                        "angular.min.js": "https://ajax.googleapis.com/ajax/libs/angularjs/" + VERSION_MASK + "/angular.min.js",
                        "bootstrap.bundle.min.js": "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/" + VERSION_MASK + "/js/bootstrap.bundle.min.js",
                        "d3.min.js": "https://ajax.googleapis.com/ajax/libs/d3js/" + VERSION_MASK + "/d3.min.js",
                        "hammer.min.js": "https://ajax.googleapis.com/ajax/libs/hammerjs/" + VERSION_MASK + "/hammer.min.js",
                        "jquery-ui.css": "https://ajax.googleapis.com/ajax/libs/jqueryui/" + VERSION_MASK + "/themes/smoothness/jquery-ui.css",
                        "jquery-ui.min.js": "https://ajax.googleapis.com/ajax/libs/jqueryui/" + VERSION_MASK + "/jquery-ui.min.js"
                   }

// keep track of libraries already inspected
var checkedURLs = []

// find version of script from its body
function extractVersion(code) {
    return code.split('v')[1].split(' ')[0];
}

// given a piece of code, will remove white space and single line comments
function removeCommentsAndMinify(code) {
    var newCode = ""
    var lines = code.split(/\r|\n/)
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i]

        // remove comment if it exists
        var indexCommentStart = line.indexOf('//')
        if (indexCommentStart != -1) {
            line = line.substring(0, indexCommentStart)
        }
        newCode += line
    }

    // remove all white space
    return newCode.replace(/\s/g,'')
}

// compare expected script vs actual script
function fnVerifyScript(actualScriptUrl, actualScript) {
    return function() {
        var expectedScript = this.responseText  
        var isScriptValid = removeCommentsAndMinify(actualScript) == removeCommentsAndMinify(this.responseText);
        console.log(actualScript)
        console.log(this.responseText)
        if (!isScriptValid)
        {
          var message = {
            type: 'add',
            body: 'Script integrity violation - actual=' + actualScriptUrl + ' expected=' + this.responseURL
          }

          handleMessage(message, null, null)
        }

      // logged in background console
      console.log("[~] SCRIPT VERIFICATION : " + isScriptValid)
    }
}

// fetch expected script
function requestCDNScript() {
    var version = extractVersion(this.responseText)
    var library = findLibraryNameFromUrl(this.responseURL)
    if (library != null && version != null)
    {
        // fetch the code of expected script
        var cdnUrl = libraryToCDN[library].replace(VERSION_MASK, version)
        var oReq = new XMLHttpRequest();
        oReq.addEventListener("load", fnVerifyScript(this.responseURL, this.responseText));
        oReq.open("GET", cdnUrl);
        oReq.send();  
    }
}

// e.g. look for jquery.min.js -> return jquery
function findLibraryNameFromUrl(url) {
    for (library in libraryToCDN)
    {
        if (url.indexOf(library) != -1)
        {
            return library
        }
    }
    return null
}

// intercepts all script stuff in background console
chrome.webRequest.onCompleted.addListener(
function(details) {
    var url = details.url.toLowerCase()
    var library = findLibraryNameFromUrl(url)
    if (library != null && !checkedURLs.includes(url))
    {
        // keep track
        checkedURLs.push(url)

        // fetch the code of script
        var oReq = new XMLHttpRequest();
        oReq.addEventListener("load", requestCDNScript);
        oReq.open("GET", url);
        oReq.send();
    }
}, 
{
    urls: [
        "<all_urls>"
    ],
    types: ["script"]
},
["responseHeaders"]);



/******script verification end*******/

var vulnerabilities = {};

//var vulnerability = {
//  "library": "",
//  "id": "",
//  "versions": [],
//  "references": [],
//  "summary": "",
//  "access": {},
//  "impact": {},
//};

function handleMessage(request, sender, sendResponse) {
    let type = request['type'];
    let body = request['body'];
    if (type == 'add') {
        let vul = body['summary']
        let lvl = request['lvl'];
        let url = request['url'];
        let obj = {}
        if ('access' in body) {
            obj = {
                'vul': vul,
                'lvl': lvl,
                'access': body['access'],
                'references': body['references']
            };
        } else {
            obj = {
                'vul': vul,
                'lvl': lvl,
            }
        }
        if (url in vulnerabilities) {
            vulnerabilities[url].push(obj);
        } else {
            vulnerabilities[url] = [obj];
        }

        chrome.browserAction.setIcon({
            path: "nomustard_pop.png"
        });
    } else if (type == 'getvuln') {
        sendResponse({
            response: vulnerabilities
        });
        chrome.browserAction.setIcon({
            path: "nomustard.png"
        });
    }
}

chrome.runtime.onMessage.addListener(handleMessage);
