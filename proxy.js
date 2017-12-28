// Serveur Proxy
// 28-12-2017

var httpProxy = require('http-proxy');
var express = require('express');
var throttle = require("express-throttle");
var format_date = require('date-format');

//
// Framework Express
//
var app = express();


//
// Creation du serveur Proxy 
//
var proxy = httpProxy.createProxyServer({});

//
// Fonction de reponse en cas d'activation du throttle
//

var reponse_throttle = function(req, res, next, bucket) {
    console.log(format_date.asString() +  " " + req.url + " throttle activé ")
    res.set("X-Rate-Limit-Limit", 5);
    res.set("X-Rate-Limit-Remaining", 0);
    // bucket.etime = expiration time in Unix epoch ms, only available 
    // for fixed time windows 
    res.set("X-Rate-Limit-Reset", bucket.etime);
    res.status(503).send("System overloaded, try again at a later time.");
  }

//
// Listen for the `error` event on `proxy`.
proxy.on('error', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  console.log (format_date.asString() + " " + req.url +" " + err );
  res.end('Something went wrong. And we are reporting a custom error message.');
});

//
// traitement des requetes 
//

app.all("/search*", throttle({ "burst": 5, "period": "10s", "on_throttled":reponse_throttle }), function(req, res, next) {
  
 	proxy.web(req, res, { target: 'http://localhost:8080' });
console.log (format_date.asString() + " " + req.url );

});

app.all("/list*", throttle({ "burst": 2, "period": "10s", "on_throttled":reponse_throttle }), function(req, res, next) {
  console.log (format_date.asString() +  " " + req.url);
  proxy.web(req, res, { target: 'http://localhost:8080' });
});

app.all("/*", function(req, res) {
  console.log (format_date.asString() + " " + req.url);
  proxy.web(req, res, { target: 'http://localhost:8080' });
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


app.listen(8000);

console.log("listening on port 8000")
