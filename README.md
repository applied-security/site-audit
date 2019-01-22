# site-audit
Chrome extension to passively audit visited websites for vulnerabilities


# Comparing common libraries for alterations
The initial goal was to create a list of hashes of commonly used libraries across multiple versions to be able to verify the authenticity of certain libraries that are loaded by sites. This would warn the user against libraries that are being loaded that could have perhaps been modified with vulnerabilities intentionally or not.

Collecting hashes for popular libraries across all versions would take a significant amount of time even with automation. It also introduces a list of hashes that we must store in memory. Instead we decided to dynamically look for the version of the library that is being loaded by a target site by looking within the library and verify it against the corresponding library from a trusted CDN.

For example if a site has decided to load “http://example.com/jquery.min.js”, our extension will intercept the http request using chrome.webRequest.onCompleted and notice that this script is a jquery.min.js library and look for the version within the loaded library “/*! jQuery v2.1.3 | (c) 2005...”. We then fetch the corresponding script from a trusted CDN “https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js” and compare this against the target library to verify that it is unaltered.

Adding new libraries to check against is as simple as finding a trusted CDN for the library and adding it to the libraryToCDN map within background.js.

This feature can be further extended to parse, remove comments and minify both the libraries being checked to remove any modifications that do not affect the behavior of libraries. We could also measure the difference between the libraries and present it to the user for closer inspection.
