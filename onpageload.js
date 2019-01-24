function checkForInsecureScriptLoading() {
  let scriptElems = document.getElementsByTagName("script");

  if (document.URL.indexOf("http://") === 0) {
    vulnerability = "You are loading your site over http, consider using https";
    logSecurityVulnerability({'summary': vulnerability}, 2)
    return;
  }

  for (let i = 0; i < scriptElems.length; i++) {
    let scriptElem = scriptElems[i];
    let srcUrl = scriptElem.getAttribute("src");
    if (srcUrl !== null) {
      let lowerUrl = srcUrl.toLowerCase();
      if (lowerUrl.indexOf("http://") === 0) {
        vulnerability = "Script loaded over unsafe http: " + lowerUrl;
        logSecurityVulnerability({'summary': vulnerability}, 2);
      }
    }
  }
}

function cleanName(filename) {
  let nojs = "";
  if (filename.indexOf(".min.js") !== -1) {
    nojs = filename.substring(0, filename.length - ".min.js".length)
  } else {
    nojs = filename.substring(0, filename.length - ".js".length)
  }

  let nonumbers = nojs.replace(/[0-9]/g, '');
  let nodots = nonumbers.replace(/\./g, '');

  if (nodots.indexOf('-') !== -1) {
    // things like modernizer-latest
    let dashAt = nodots.indexOf('-');
    nodots = nodots.substring(0, dashAt);
  }

  return nodots.toLowerCase();
}

function matchCVEtoLibs(cves) {
  let scriptElems = document.getElementsByTagName("script");
  let scripts = [];
  let scriptPromises = [];

  for (let i = 0; i < scriptElems.length; i++) {
    let script = {
      names: [],
      versions: []
    };
    let hasName = false;
    let hasVersion = false;

    let elem = scriptElems[i];
    let url = elem.getAttribute("src");
    if (!url) {
      continue;
    }

    let versionnumberregex  = /\d+(\.\d+){0,2}/g
    let found = url.match(versionnumberregex);
    if (found) {
      hasVersion = true;
      found.forEach((version) => {
        script.versions.push(version);
      })
    }

    let nameregex = /([a-zA-Z0-9\-\.]+)(.js|.min.js)/g;
    found = url.match(nameregex);
    if (found) {
      hasName = true;
      found.forEach((name) => {
        let clean = cleanName(name);
        script.names.push(clean);
      })
    }

    if (url) {
      let scriptPromise = fetch(url).then(function (response) {
        return response.text();
      }).then(function (text) {
        let versionregex  = /v\d+(\.\d+){0,2}/g
        found = text.match(versionregex);
        if (found) {
          hasVersion = true;
          found.forEach((version) => {
            script.versions.push(version.substring(1, version.length));
          })
        }

        if (hasVersion && hasName) {
          scripts.push(script);
        }
      })

      scriptPromises.push(scriptPromise);
    }
  }

  const handleErrors = function(p) {
    return p.catch((e) => {return;})
  }
  Promise.all(scriptPromises.map(handleErrors)).then(function (data) {

    // Crazy double matching
    for (let i = 0; i < cves.length; i++) {
      let cve = cves[i];
      let nameMatch = false;
      let versionMatch = false;

      for (let j = 0; j < scripts.length; j++) {
        let script = scripts[j];

        for (let k = 0; k < script.names.length; k++) {
          let sName = script.names[k];
          if (sName === cve.library) {
            nameMatch = true;
          }
        }

        for (let k = 0; k < script.versions.length; k++) {
          let vName = script.versions[k];
          for (let l = 0; l < cve.versions.length; l++) {
            let cveName = cve.versions[l];
            if (cveName.indexOf(":" + vName) !== -1) {
              versionMatch = true;
            }
          }
        }

        if (!(nameMatch && versionMatch)) {
          // Both have to match at the same time
          nameMatch = false;
          versionMatch = false;
        }
      }

      if (nameMatch && versionMatch) {
        // Finally!!
        logSecurityVulnerability(cve, 8);
      }
    }
  })
}

function loadJsCVEs() {
  let url = chrome.runtime.getURL('jscvedb/jscves.json');

  fetch(url).then(function (response) {
    return response.json()
  }).then(function(json) {
    matchCVEtoLibs(json);
  })
}


function logSecurityVulnerability(vulnerability, level) {
  // TODO: send a message to the popup
  console.log("Found vulnerability: " + vulnerability + ". Level is: " + level);
  var message = {
    type: 'add',
    body: vulnerability,
    lvl: level,
    url: document.URL
  }
  chrome.runtime.sendMessage(message);
}

// Begin vulnerability testing
checkForInsecureScriptLoading()
loadJsCVEs()
