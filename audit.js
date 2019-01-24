function getVulnerabilities() {
  var message = {
    type: 'getvuln',
    body: 'all'
  }
  chrome.runtime.sendMessage(message, function(response) {
  	  var ul = document.createElement('ul');
      var html = '';
  	  for (var i = 0; i < response.response.length; i++) {
		html += "<li><a style=\"color: orange\">" + response.response[i] + "</a></li>";
  	  }
      ul.innerHTML = html;
      document.getElementById('vulnerabilities').appendChild(ul);
  });
}

getVulnerabilities();
