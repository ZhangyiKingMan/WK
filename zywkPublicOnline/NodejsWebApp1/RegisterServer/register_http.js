'use strict';
var http = require('http');
var fs = require('fs');
var str = require('string-format');

//当前路径
var currPath = require("path").resolve('./');
var cf = require('../CommonFuntion/CommonFuntion.js');
var event = require('./Events/Events.js');
var httpPort = 0, host = "127.0.0.1";

var Configstr = currPath + "/Config/config.json";
//标准化路径
var httpJson = JSON.parse(cf.CheckBuffer(fs.readFileSync(cf.StandPath(Configstr), { encoding: 'utf8' })));

if (httpJson.http.Invail === true) {
    //获取主机地址与端口号
    httpPort = httpJson.http.port;
    host = httpJson.http.host;
}
//注册服务器主要完成用户注册相关操作
http.createServer(function (req, res) {

    switch (req.method.toUpperCase()) {
        case "GET":
            event.EventsGET(req, res);
            break;
        case "POST":
            event.EventsPOST(req, res);
            break;
        case "HEAD":
        case "PATCH":
        case "DELETE":
        case "TRACE":
        case "CONNECT":
        default:
            res.end("No Such Method");
    }
}).listen(httpPort, host, () => {
    var serverInfo = str("host:{}, port:{} is working ...", host, httpPort);
    console.log(serverInfo);
});
