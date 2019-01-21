
function checkForInsecureScriptLoading() {
  let scriptElems = document.getElementsByTagName("script");

  for (let i = 0; i < scriptElems.length; i++) {
    let scriptElem = scriptElems[i];
    let srcUrl = scriptElem.getAttribute("src");
    if (srcUrl !== null) {
      let lowerUrl = srcUrl.toLowerCase();
      if (lowerUrl.indexOf("http://") === 0) {
        vulnerability = "Script loaded over unsafe http: " + lowerUrl;
        logSecurityVulnerability(vulnerability, 2);
      }
    }
  }
}


function logSecurityVulnerability(vulnerability, level) {
  // TODO: send a message to the popup
  console.log("Found vulnerability: " + vulnerability + ". Level is: " + level);
  var message = {
    type: 'vulnerability',
    body: vulnerability
  }
  chrome.runtime.sendMessage(message);
}

// Begin vulnerability testing
checkForInsecureScriptLoading()
