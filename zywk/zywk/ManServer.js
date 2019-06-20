'use strict';
//导入系统模块
//var str = require('string-format');
var child = require('child_process');
var os = require('os');
var net = require('net');
var fs = require('fs');
//导入本地模块
var menu = require("./Menu/Menu");
var wxT = require('./WX/WXToken');
var Env = require('./build/Release/environment_cpp.node');
var cf = require('../CommonFunction/CommonFunction');
//基本设置相关常量
global.currPath = require("path").resolve('./');
var Configstr = global.currPath + "./Config/config.json";
var Menustr = global.currPath + './Config/Menu.json';

//服务启动信息
var port = 8080, host = "127.0.0.1";
var starStr = '欢迎启动微科技服务';
var osInfo = '运行操作系统:' + os.platform();
var cpuNum = 'cpu数量为:' + os.cpus().length;
var childWorks = [];

//读取配置文件相关信息
global.configJson = JSON.parse(cf.CheckBuffer(fs.readFileSync(cf.DealPoint(cf.StandPath(Configstr)), { encoding: 'utf8' })));
var MenuJson = JSON.parse(cf.CheckBuffer(fs.readFileSync(cf.DealPoint(cf.StandPath(Menustr)), { encoding: 'utf8' })));
var isDebug = Env.IsDebug(global.configJson.isDebug);

global.configUrl = cf.GetMenuMethod(MenuJson, 'url');
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

var netServer = net.createServer();

netServer.on('connection', (socket) => {
    //处理tcp连接问题 失败了才进入
    //记录重新连接次数与规避web连接攻击
    var str = 'family:' + socket.address().family + ' ' +
        'address:' + socket.address().address + ' ' +
        'port:' + socket.address().port;
    console.log(str);
    // 利用setTimeout模拟处理请求时的操作耗时

    //socket.setTimeout(10, () => {
    //    socket.end('Request handled by master');
    //});
});

netServer.listen(port, host, () => {
    updateMenu();
    //打印启动信息
    var arr = [starStr, osInfo, cpuNum, 'host:' + host, 'port' + port];
    starInfo(arr, '#');
    //创建子进程
    subServer(netServer);
    //netServer.close();
});



function subServer(netServer) {
    //创建子进程
    global.processNum = isDebug ? 1 : os.cpus().length;
    //测试
    //global.processNum += 1;
    for (var i = 0; i < processNum; i++) {
        childWorks.push(child.fork('./subServer.js'));
        console.log('启动子进程id:' + childWorks[i].pid);
        childWorks[i].send('netServer', netServer);
        //监听子进程活动
        childWorks[i].on('exit', (i) => {
            return () => {
                console.log('子进程id', childWorks[i].pid + '退出');
                //设置5秒后重启子进程
                console.log('新子进程5秒后将重启!');
                setTimeout(() => {
                    childWorks[i] = child.fork('./subServer.js');
                    console.log('启动新子进程id:' + childWorks[i].pid);
                }, 5 * 1000);
            };
        });
        childWorks[i].on('message', (m) => {
            console.log('父进程收到消息', m);
        });
    }
}

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
                            menu.CreateMenu('gh_de33b437883c', token);
                        }
                    }
                    else {
                        //console.log('现有没有菜单!');
                        //创建菜单
                        menu.CreateMenu('gh_de33b437883c', token);
                    }
                });
        });

}
