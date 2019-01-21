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


// intercepts all script stuff in background console
chrome.webRequest.onCompleted.addListener(
function(details) {
    console.info("URL :" + details.url);
}, 
{
    urls: [
        "<all_urls>"
    ],
    types: ["script"]
},
["responseHeaders"]);


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
