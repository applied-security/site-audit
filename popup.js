function getVulnerabilities() {
  var message = {
    type: 'get',
    body: 'all' 
  }
  chrome.runtime.sendMessage(message, function(response) {
      document.body.innerHTML = response.response;
  });
}

getVulnerabilities();
