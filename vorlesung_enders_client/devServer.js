var express = require('express')
var httpProxy = require('http-proxy')

var app = express()

var proxy = new httpProxy.createProxyServer();

var apiProxy = function (host, port) {
  return function(req, res, next) {
    if (req.url.match(new RegExp('^\/data\/'))) {
      proxy.web(req, res, {target: 'http://' + host + ':' + port});
    } else {
      next();
    }
  }
}


app.use(apiProxy('localhost', 8000));

app.use(express.static(__dirname));

app.listen(8080, function () {
  console.log('Development server listening on port 8080!')
})
