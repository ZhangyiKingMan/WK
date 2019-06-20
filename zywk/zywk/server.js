'use strict';
//导入系统模块
//var str = require('string-format');
var os = require('os');
var http = require('http');
var fs = require('fs');
//导入本地模块
var menu = require("./Menu/Menu");
var wxT = require('./WX/WXToken');
var web = require('./WX/WebEvents');
var wxE = require('./WX//WXEvents');
var Env = require('./build/Release/environment_cpp.node');
var cf = require('../CommonFunction/CommonFunction');
var n2h = require('./Html/js/nodejs2html');
var html = require('./JsHtml/dealUrlReq');
//基本设置相关常量
global.currPath = require("path").resolve('./');
var Configstr = global.currPath + "./Config/config.json";
var Menustr = global.currPath + './Config/Menu.json';

var webUrl = 'http://f94e2a9d.ngrok.io/';

//服务启动信息
//读取配置文件相关信息
var starStr = '欢迎启动微科技服务';
var osInfo = '运行操作系统:' + os.platform();
var cpuNum = 'cpu数量为:' + os.cpus().length;
var MenuJson = JSON.parse(cf.CheckBuffer(fs.readFileSync(cf.DealPoint(cf.StandPath(Menustr)), { encoding: 'utf8' })));
cf.ReplaceUrl(webUrl, MenuJson, 'url');

var port = 8080, host = "127.0.0.1";
var text = fs.readFileSync('./Html/config/useful.json');
var json = JSON.parse(text);

global.configJson = JSON.parse(cf.CheckBuffer(fs.readFileSync(cf.DealPoint(cf.StandPath(Configstr)), { encoding: 'utf8' })));
cf.ReplaceUrl(webUrl, global.configJson, 'impower');
global.priceArr = { 'jd': 100 * 3, 'bn': 88 * 6, 'yn': 66 * 12, 'nn': 50 * 24 };
global.isDebug = Env.IsDebug(global.configJson.isDebug);
global.configUrl = cf.GetMenuMethod(MenuJson, 'url');
//参数验证
if (!cf.CompareJson(global.priceArr, json)) {
    //写入配置文件
    fs.writeFileSync('./Html/config/useful.json', JSON.stringify(global.priceArr), (err) => {
        console.log('WriteFile\n', err);
    });
}

n2h.SetPrice(global.priceArr);

if (global.configJson.http.Invail === true) {
    //获取主机地址与端口号
    port = global.configJson.http.port;
    host = global.configJson.http.host;
    //读取微信token
    var WeiXinToken = global.configJson.WeiXinToken;
    if (WeiXinToken.trim() !== "") {
        wxT.setWeiXinToken(WeiXinToken);
    }
}

var server = http.createServer(function (req, res) {
    //分配任务
    dealEvents(req, res);
});

server.listen(port, host, () => {
    updateMenu();
    //打印启动信息
    var arr = [starStr, osInfo, cpuNum, 'host:' + host, 'port' + port];
    starInfo(arr, '#');
    html.init();
});


function getMaxNum(arr) {
    var num = 0;
    if (arr.length !== 0) {
        for (var index in arr) {
            num = num > arr[index].length ? num : arr[index].length;
        }
    }
    return num * 2 + 16;
}
function printLine(num, flag = "*") {
    var str = '';
    for (var i = 0; i < num; i++) {
        str += flag;
    }
    console.log(str);
}
function starInfo(arr, flag = "=") {
    var num = getMaxNum(arr);
    var space = '';
    for (var i = 0; i < 8; i++) {
        space += ' ';
    }
    printLine(num, flag);
    for (var index in arr) {
        var str = '';
        //添加空白
        str = space + arr[index];
        console.log(str);
    }
    printLine(num, flag);
}
function updateMenu() {
    //创建菜单之前看一下是否存在菜单，若存在菜单且与现在的菜单相等则使用菜单，若不相等则跟新菜单
    global.appId = 'wx31cba258e1ec7277';
    global.appSecret = 'afa4e8bf1e96890d4ba54708e2de6e8b';
    //var openid = 'odB9V5wY0iSoMOPq90DJQljYq4ic';
    menu.GetToken(global.appId, global.appSecret)
        .then((token) => {
            //menu.GetUserTag(token, openid);
            menu.GetAllTag(token);
            //查询菜单
            menu.SerchAddContional(token).
                then((menuJsonStr) => {
                    //console.log(menuJsonStr);
                    //没有菜单创建菜单
                    var Json = JSON.parse(menuJsonStr);
                    if (Json.hasOwnProperty('menu')) {
                        var menuJson = Json.menu;
                        //对比菜单
                        if (!cf.CompareJson(MenuJson.gh_de33b437883c, menuJson)) {
                            //删除菜单
                            //menu.DeleteAllMenu(token);
                            //创建菜单
                            menu.CreateMenu('gh_de33b437883c', token, MenuJson.gh_de33b437883c);
                        }
                    }
                    else {
                        //console.log('现有没有菜单!');
                        //创建菜单
                        menu.CreateMenu('gh_de33b437883c', token, MenuJson.gh_de33b437883c);
                    }
                });
        });

}
function dealEvents(req, res) {
    var resulte = wxT.checkWeiXinToken(req);
    if (resulte !== null) {
        /***此处处理来自微信的消息***/
        switch (req.method.toUpperCase()) {
            case "GET":
                console.log("GET:", resulte);
                res.end(resulte);
                break;
            case "POST":
                wxE.WeiXinEvents(req, res);
                break;
            case "HEAD":
            case "PATCH":
            case "DELETE":
            case "TRACE":
            case "CONNECT":
            default:
                res.end("success");
        }
    }
    else {
        /***此处处理不是来自微信的消息***/
        web.WebEvents(req, res);
    }
}