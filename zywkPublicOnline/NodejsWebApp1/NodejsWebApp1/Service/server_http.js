'use strict';
var http = require('http');
var fs = require('fs');
var str = require('string-format');
var URL = require('url');
var weiXinCheck = require("../WebEvents/WeiXinToken");
var weiXinEvents = require("../WebEvents/WeiXinEvents");
var otherEvents = require("../WebEvents/OtherEvents");
var Test = require("../SQL_Server/SQLServer");
//基本设置相关常量
var Configstr = "./Config/config.json";
var httpPort = 0, host = "127.0.0.1";
//读取配置文件相关信息
var httpJson = JSON.parse(fs.readFileSync(Configstr));
if (httpJson.http.Invail === true) {
    //获取主机地址与端口号
    httpPort = httpJson.http.port;
    host = httpJson.http.host;
    //读取微信token
    var WeiXinToken = httpJson.WeiXinToken;
    if (WeiXinToken.trim() !== "") {
        weiXinCheck.setWeiXinToken(WeiXinToken);
    }
}


 //创建web一个服务器
var server = http.createServer(function (serIn, serOut) {
    //console.log("Get coming!");
    //打印所有接受消息
    //console.log(serIn);
    //当服务器收到消息时候判断是否来自微信
    var resulte = weiXinCheck.checkWeiXinToken(serIn);
    if (resulte !== null) {
        /***此处处理来自微信的消息***/
        switch (serIn.method.toUpperCase()) {
            case "GET":
                console.log("GET:", resulte);
                serOut.end(resulte);
                break;
            case "POST":
                weiXinEvents.WeiXinEvents(serIn, serOut);
                break;
            case "HEAD":
            case "PATCH":
            case "DELETE":
            case "TRACE":
            case "CONNECT":
            default:
                serOut.end("success");
        }
    }
    else {
        /***此处处理不是来自微信的消息***/
        otherEvents.OtherEvents(serIn, serOut);
    }
    //打印所有返回消息
    //console.log(serOut);
});
//创建监听端口
server.listen(httpPort, host, () => {
    var serverInfo = str("host:{}, port:{} is working ...",host, httpPort);
    console.log(serverInfo);
    //Test.SqlTest();
});



