
function checkForInsecureScriptLoading() {
  let scriptElems = document.getElementsByTagName("script");

  for (let i = 0; i < scriptElems.length; i++) {
    let scriptElem = scriptElems[i];
    let srcUrl = scriptElem.getAttribute("src");
    if (srcUrl !== null) {
      let lowerUrl = srcUrl.toLowerCase();
      if (lowerUrl.indexOf("http://") === 0) {
        vunerability = "Script loaded over unsafe http: " + lowerUrl;
        logSecurityVunerability(vunerability, 2);
      }
    }
  }
}


function logSecurityVunerability(vunerability, level) {
  // TODO: send a message to the popup
  console.log("Found vunerability: " + vunerability + ". Level is: " + level);
}

// Begin vunerability testing
checkForInsecureScriptLoading()
