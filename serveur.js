console.log('Bienvenue dans Node.js !');


var http = require('http');
var format_date = require('date-format');


var instructionsNouveauVisiteur = function(req, res) {
 
 res.writeHead(200);
  res.end('Salut tout le monde !');
console.log (format_date.asString() + " " + req.url); 

}

var server = http.createServer(instructionsNouveauVisiteur);

server.listen(8080);