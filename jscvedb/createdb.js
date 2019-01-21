var request = require("request-promise-native");
var fs = require('fs');

var popularLibraries = [
  "jquery",
  "bootstrap",
  "modernizr",
  "underscore",
  "mootools",
  "moment",
  "prototype",
  "backbone",
  "popper",
  "gsap",
  "angular",
  "yui",
  "shadowbox",
  "polyfillio",
  "spry",
  "react",
  "lodash",
  "vue",
  "mathjax",
  "knockout",
  "dojo",
  "socketio",
  "extjs",
  "semanticui",
  "lightbox",
  "prettyphoto",
  "fancybox",
  "select2",
];

var vulnerabilities = []

var vulnerability = {
  "libary": "",
  "id": "",
  "versions": [],
  "references": [],
  "summary": "",
  "access": {},
  "impact": {},
};

function getLibraryCVEs() {
  var notMatched = 0;
  var reqs = [];
  for (var i = 0; i < popularLibraries.length; i++) {
    let lib = popularLibraries[i];

    let lookupUrl = "http://cve.circl.lu/api/search/" + lib;
    var lookupRq = request(lookupUrl, function(error, response, body) {
      var results = JSON.parse(body);
      if ('data' in results) {
        var cves = results.data;
        for (var j = 0; j < cves.length; j++) {
          var cve = cves[j];

          if (!('vulnerable_configuration' in cve)) {
            return;
          }


          var foundConfig = false;
          var versions = [];
          for (var k = 0; k < cve['vulnerable_configuration'].length; k++) {
            var config = cve['vulnerable_configuration'][k]
            var configParts = config.split(":");
            if (config.indexOf(lib) !== -1) {
              foundConfig = true;
              versions.push(configParts[configParts.length - 1]);
            } else {
              notMatched++;
              // console.log(cve);
            }
          }

          if (foundConfig) {
            var vun = {
              "libary": lib,
              "id": cve['id'],
              "versions": versions,
              "references": cve['references'],
              "summary": cve['summary'],
              "access": cve['access'],
              "impact": cve['impact'],
            }

            vulnerabilities.push(vun);
          }
        }
      }

    });

    reqs.push(lookupRq);
  }

  Promise.all(reqs).then(function (values) {
    console.log('---------------------------------------');
    console.log('Found ' + vulnerabilities.length + '');
    console.log('---------------------------------------');

    fs.writeFileSync("jscves.json", JSON.stringify(vulnerabilities))
    console.log("Done!")
  });
}

getLibraryCVEs();

