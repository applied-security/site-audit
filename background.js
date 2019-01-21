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

// add more libraries
var libraryToCDN = {
                        "jquery.min.js": "https://ajax.googleapis.com/ajax/libs/jquery/" + VERSION_MASK + "/jquery.min.js",
                        "angular.min.js": "https://ajax.googleapis.com/ajax/libs/angularjs/" + VERSION_MASK + "/angular.min.js"
                   }

// keep track of libraries already inspected
var checkedURLs = []

function extractVersion(code) {
    return code.split('v')[1].split(' ')[0];
}

function fnVerifyScript(actualScriptUrl, actualScript) {
    return function() {
        var expectedScript = this.responseText  
        var isScriptValid = actualScript == this.responseText;
        if (!isScriptValid)
        {
          // TODO: NEED TO SEND A MESSAGE TO ACTUAL BROWSER INSTEAD OF BACKGRONUD CONSOLE
          var message = {
            type: 'add',
            body: 'Script validity check failed : ' + actualScriptUrl + ' ' + this.responseURL
          }
          chrome.runtime.sendMessage(message);
        }

      // logged in background console
      console.log("[~] SCRIPT VERIFICATION : " + isScriptValid)
    }
}

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

var vulnerabilities = [];

function handleMessage(request, sender, sendResponse) {
    let type = request['type'];
    let body = request['body'];
    if (type == 'add') {
        vulnerabilities.push(body);
        console.log(vulnerabilities);

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
