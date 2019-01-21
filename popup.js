function getVulnerabilities() {
  var message = {
    type: 'getvuln',
    body: 'all'
  }
  chrome.runtime.sendMessage(message, function(response) {
      document.body.innerHTML = response.response;
  });
}

getVulnerabilities();
