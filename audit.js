function getVulnerabilities() {
  var message = {
    type: 'getvuln',
    body: 'all'
  }
  chrome.runtime.sendMessage(message, function(response) {
  	  var htmlBuilder = "<ul>"
  	  for (var i = 0; i < response.response.length; i++) {
		htmlBuilder += "<li><a style=\"color: orange\">" + response.response[i] + "</a></li>"  	  	
  	  }
      htmlBuilder += "</ul>"
      document.body.innerHTML = htmlBuilder
  });
}

getVulnerabilities();
