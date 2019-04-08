'use strict';
var http = require('http');
var fs = require('fs');
var url = require('url');
var str = require('string-format');

//当前路径
var currPath = require("path").resolve('./');
var cf = require('../CommonFuntion/CommonFuntion.js');
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
    var a = url.parse(req.url);
    if (req.method === "post") {
        console.log("Recive post data");
    }
    console.log("收到原始url: ",a.pathname);
    if (a.pathname !== '/') {
        var filePath = "./HTML" + a.pathname;
        if (cf.CheckURL(filePath) === null) {
            console.log("检测url返回404:", );
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end("INVALID FILE PATH");
        }
        else {
            //获取post事件所有方法
            if (req.method.toUpperCase() === "POST") {

                var postData = "";
                //接受post数据
                req.addListener("data", function (data) {
                    postData += data;
                });
                //解析post数据
                req.addListener("end", function () {
                    postData = decodeURI(postData);
                    var arr = postData.split('&');

                    console.log(arr);
                    res.end();
                });
            }
            filePath = cf.StandPath(filePath);
            console.log("标准化之后url: ", filePath);
            var arrNameType = filePath.split('/');
            var arrType = arrNameType[arrNameType.length - 1].split('.');
            var absoultFilePath = cf.CombinationPath(currPath, filePath);
            //判断有没一这样的文件
            fs.access(absoultFilePath, (err) => {
                if (err) {
                    console.log("检测到没有对应文件返回404:");
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end("No SUCH FILE");
                }
                else {
                    switch (arrType[arrType.length - 1]) {
                        case "css":
                            res.writeHead(200, { 'Content-Type': 'text/css' });
                            break;
                        case "html":
                        case "asp":
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            break;
                        default:
                            break;
                    }
                    var html = fs.readFileSync(filePath);
                    res.end(html);
                }
            });
        }
    } else {
        //默认主页
        var Registe = fs.readFileSync("./HTML/Registe.html");
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(Registe);
    }
}).listen(httpPort, host, () => {
    var serverInfo = str("host:{}, port:{} is working ...", host, httpPort);
    console.log(serverInfo);
});
