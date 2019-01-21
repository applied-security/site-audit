// chrome.webNavigation.onCompleted.addListener(function(details) {
//   console.log("crazy things may happen here!");
//   console.log(details.url);
// }, {url: [{urlMatches : "*"}]});
// That didn't work
//
//
//chrome.webRequest.onHeadersReceived.addListener(function(e){
//    console.log(e);},
//    {urls: ["http://*/*", "https://*/*"]},
//    ["blocking"]
//);
//
var vulnerabilities = [];

function handleMessage(request, sender, sendResponse) {
    let type = request['type'];
    let body = request['body'];
    if (type == 'add') {
        vulnerabilities.push(body);
        console.log(vulnerabilities);
    }
    sendResponse({
        response: vulnerabilities 
    });
}

chrome.runtime.onMessage.addListener(handleMessage);
