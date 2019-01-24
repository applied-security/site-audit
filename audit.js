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
      Object.keys(response.response).forEach(function(key) {
          var url_html = document.createElement('h3');
          url_html.innerHTML = key;
          vuls = response.response[key];
          console.log(vuls);
          var ul = document.createElement('ul');
          var html = '';
          for (var i = 0; i < vuls.length; i++) {
            col = getColour(vuls[i]['lvl']);
            html += "<li><a style=\"color: " + col + "; font-size: 12pt\">" + vuls[i]['vul'] + "</a></li>";
            if ('access' in vuls[i]) {
                html += "<ul><li>Reference: <a href=\"" + vuls[i]['references'][0]
                    + "\">" + vuls[i]['references'][0] + "</a></li>";
                let acc = vuls[i]['access'];
                html += "<li>Access: <ul><li>Authentication = " + acc['authentication'] + "</li>"; 
                html += "<li>Complexity = " + acc['complexity'] + "</li>";
                html += "<li>Vector = " + acc['vector'] + "</ul></li></ul>";
            }
          }
          ul.innerHTML = html;
          document.getElementById('vulnerabilities').appendChild(url_html);
          document.getElementById('vulnerabilities').appendChild(ul);
    });
  });
}

getVulnerabilities();
