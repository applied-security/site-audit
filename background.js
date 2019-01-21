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

function handleMessage(request, sender, sendResponse) {
    alert('Message received'); 
}

chrome.runtime.onMessage.addListener(handleMessage);
