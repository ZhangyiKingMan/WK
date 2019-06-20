//# sourceMappingURL=subServer.js.map
var http = require('http');
var fs = require('fs');
//导入本地模块
var cf = require('../CommonFunction/CommonFunction');
var wxT = require('./WX/WXToken');
var web = require('./WX/WebEvents');
var wxE = require('./WX//WXEvents');
var Env = require('./build/Release/environment_cpp.node');
var n2h = require('./Html/js/nodejs2html');

//基本设置相关常量
global.currPath = require("path").resolve('./');
var Configstr = global.currPath + "./Config/config.json";
var Menustr = global.currPath + './Config/Menu.json';

var curPid = process.pid;

global.priceArr = { 'jd': 100 * 3, 'bn': 88 * 6, 'yn': 66 * 12 };
var text = fs.readFileSync('./Html/config/useful.json');
var json = JSON.parse(text);
if (!cf.CompareJson(global.priceArr, json)) {
    //写入配置文件
    fs.writeFileSync('./Html/config/useful.json', JSON.stringify(global.priceArr), (err) => {
        console.log('WriteFile\n', err);
    });
}
n2h.SetPrice(global.priceArr);
//=============================<
//读取配置文件相关信息
global.configJson = JSON.parse(cf.CheckBuffer(fs.readFileSync(cf.DealPoint(cf.StandPath(Configstr)), { encoding: 'utf8' })));
var MenuJson = JSON.parse(cf.CheckBuffer(fs.readFileSync(cf.DealPoint(cf.StandPath(Menustr)), { encoding: 'utf8' })));
global.configUrl = cf.GetMenuMethod(MenuJson, 'url');
global.isDebug = Env.IsDebug(global.configJson.isDebug);
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
    console.log('当前线程' + curPid+'接受到http服务消息!');
    dealEvents(req, res);
});

process.on('message', (msg, netInfo) => {
    //执行事件
    //查看执行的
    if (cf.isObj(msg)) {
        //console.log('当前线程' + curPid + '接受到ObjMsg', msg);
    }
    else if (typeof msg === 'string') {
        console.log('当前线程' + curPid + '接受到msg:' + msg);
        if (msg === 'netServer' && netInfo) {
            console.log('-------------多进程启动模式为<<惊群模式>>-------------');
            console.log('---------该模式由多进程<<抢占式>>获取连接信息---------');
            netInfo.on('connection', (socket) => {
                server.emit('connection', socket);
            });
        }
        else if (msg === 'netSocet' && netInfo) {
            console.log('-------------多进程启动模式为<<主分配式>>-------------');
            console.log('---------该模式由多进程<<子等待>>获取连接信息---------');
            server.emit('connection', netInfo);
        }
    }
});



dealEvents = function(req, res) {
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