'use strict';
var http = require('http');
var fs = require('fs');
var url = require('url');
var port = 8090;

//注册服务器主要完成用户注册相关操作
http.createServer(function (req, res) {
    var a = url.parse(req.url);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    console.log(a);
        var html = fs.readFileSync("./../NodejsWebApp1/HTML/Registe.html");
        res.end(html);

}).listen(port);
