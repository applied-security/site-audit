function getColour(level) {
    if (level < 4) {
        return 'green';
    } else if (level < 7) {
       return 'orange';
    } else {
        return 'red';
    }
}

function getVulnerabilities() {
  var message = {
    type: 'getvuln',
    body: 'all'
  }
  chrome.runtime.sendMessage(message, function(response) {
      console.log(response);
  	  var ul = document.createElement('ul');
      var html = '';
  	  for (var i = 0; i < response.response.length; i++) {
        col = getColour(response.response[i]['lvl']);
		html += "<li><a style=\"color: " + col + "\">" + response.response[i]['vul'] + "</a></li>";
  	  }
      ul.innerHTML = html;
      document.getElementById('vulnerabilities').appendChild(ul);
  });
}

getVulnerabilities();
