var str = require('string-format');
var fs = require('fs');
var url = require('url');
var request = require('request');
//var querystring = require("querystring");

var cf = require('../../CommonFunction/CommonFunction.js');
var pcd = require('../SQL/ParaseClientData.js');

function WebEvents(req, res) {
    //判断访问网页来源是什么端
    var dev = req.headers['user-agent'].toLowerCase();
    //console.log('dev:', dev);
    var agentID = dev.match(/iphone|ipod|ipad|android/);
    //console.log('agentID:', agentID);
    //console.log('global.isDebug:', global.isDebug);
    if (global.isDebug === 1)
        agentID = 1;
    if (agentID) {
        switch (req.method.toUpperCase()) {
            case "GET":
                EventsGET(req, res);
                break;
            case "POST":
                EventsPOST(req, res);
                break;
            case "HEAD":
            case "PATCH":
            case "DELETE":
            case "TRACE":
            case "CONNECT":
            default:
                res.end("No Such Method");
        }
    }
    else {
        //console.log('访问方式为PC端：\t', dev);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end("ACCESS FORBIDDEN.");
    }
    
}

function EventsPOST(req, res) {
    //验证该方法只为post方法，所有数据传输通过post
    if (req.method.toUpperCase() === "POST") {

        var postData = "";
        //接受post数据
        req.addListener("data", function (data) {
            postData += data;
        });
        //解析post数据
        req.addListener("end", function () {
            postData = decodeURI(postData);
            console.log(postData);
            /*
             * 注意！ 所有表单submit都必须为form最后一个参数，若不是将解析不出来
             * 所有submit那么若用到数据库对应的方法，都应当在config.json中写出对应的存储方法
             * 格式为 数据库名称BD_Name ｛submit名称：对应的存储方法proc｝
             */
            var arr = postData.split('&');
            //console.log(arr);
            pcd.DoXmlSQL(arr, "zywk_PublicNumber", null);
        });
    }
}

function EventsGET(req, res) {

    //console.log(currPath);
    //验证该方法只为get方法，所有url都由该方法
    if (req.method.toUpperCase() === "GET") {
        var a = url.parse(req.url);
        req.url = decodeURIComponent(req.url);
        console.info("收到rul参数: ", req.url);

        var urlInConfiger = global.configUrl.includes(req.url) || req.url.match(/code/) !== null;
        if (req.url !== '/') {
            //相对于server.js的相对路径
            var filePath = cf.StandPath(global.currPath + a.pathname);
            console.log('URL pathName:---->', a.pathname);
            if (cf.CheckURL(filePath) === null && !urlInConfiger) {
                console.error("检测url返回404:");
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end("INVALID FILE PATH");
            }
            else {
                //处理注册的事情
                if (urlInConfiger) {
                    if (global.configUrl.includes(req.url))
                        GetImpower(global.appId, global.configJson.impower, res);
                    else if (req.url.match(/code/) !== null) {
                        var arr = req.url.split('&');
                        var code = arr[0].split('=');
                        GetAccessTokenByCode(global.appId, global.appSecret, code[1], res)
                            .then((data) => {
                                return GetUserInfo(data.openid, data.access_token);
                            })
                            .then((data) => {
                                console.log('data:---->', data);
                                //p1=openid,p2=nickname,p3=sex,p4=province,p5=city,p6=country
                                var url = '', dic = {}, redirectUrl='';

                                switch (req.url) {
                                    case 'Registe': {
                                        url = global.configJson.impower + '/html/Registe.html';
                                        dic = { openid: data.openid, nickname: data.nickname, province: data.province, city: data.city, country: data.country };
                                        redirectUrl = cf.JoinParms(url, dic);
                                        //console.log('重新定向为:',redirectUrl);
                                        //重新定向为
                                        res.writeHead(302, { 'Location': redirectUrl });
                                        
                                    }
                                        break;
                                    case 'ZywkPayforMsg': {
                                        url = global.configJson.impower + '/html/ZywkPayforMsg.html';
                                        //判断是否存在unionid
                                        if (data.hasOwnProperty('unionid'))
                                            dic = { openid: data.openid, nickname: data.nickname, unionid: data.unionid };
                                        else
                                            dic = { openid: data.openid, nickname: data.nickname};
                                        redirectUrl = cf.JoinParms(url, dic);
                                        console.log('重新定向为:', redirectUrl);
                                        res.writeHead(302, { 'Location': redirectUrl });
                                    }
                                }
                                res.end();
                            });
                    }

                }
                //处理一般网页
                else {
                    try {
                        //判断有没一这样的文件
                        console.log('filePath', filePath);
                        fs.access(filePath, (err) => {
                            if (err) {
                                switch (a.pathname.toLowerCase()) {
                                    case '/payfor': {
                                        //解析URL
                                        var urlArr = req.url.split('?')[1].split('&');
                                        var number = urlArr[0].split('=')[1].substring(0, urlArr[0].split('=')[1].length - 2);
                                        console.log('number', number);
                                        var from = urlArr[1].split('=')[1];
                                        var to = urlArr[2].split('=')[1];
                                        console.log('href--->', req.url);
                                    }
                                        break;
                                    default:
                                        console.error("检测到没有对应文件返回404:");
                                        res.writeHead(200, { 'Content-Type': 'text/html' });
                                        res.end("No SUCH FILE");
                                        break;
                                }
                                res.end("No SUCH FILE");
                            }
                            else {
                                var arrType = filePath.split('.');
                                switch (arrType[arrType.length - 1].toLowerCase()) {
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
                                fs.readFile(filePath, (err, html) => {
                                    if (err)
                                        console.log('WebEvents.js fs.readFile Error!\n', err);
                                    else {
                                        console.log(a.pathname);
                                        //解析url
                                        var parseUrl = req.url.split('?');
                                        if (parseUrl[0] === '/html/Registe.html') {
                                            var parmsJson = cf.ParseParms(decodeURIComponent(parseUrl[1]));
                                            //用正则修改对应的值
                                            //html = querystring.parse(html);
                                            html = cf.ReplaceContext(html, parmsJson);
                                            //console.log(html);
                                        }
                                        //修改对应html值
                                        res.end(html);
                                    }
                                });
                            }
                        });
                    }
                    catch (err) {
                        console.log(err);
                    }
                }
            }
        }
        else {
            //默认主页
            res.end('No Match Url');
        }
    }
    else {
        res.end("ERROR");
    }
}

//获取授权
function GetImpower(appID, backUrl, res) {
    if ((appID !== undefined || appID !== null || appID !== '') && (backUrl !== undefined || backUrl !== null || backUrl !== '')) {
        appID = appID.trim();
        backUrl = backUrl.trim();
        var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appID +
            '&redirect_uri=' + encodeURIComponent(backUrl) + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
        res.writeHead(302, { 'Location': url });
        res.end();
    }
    else {
        console.log('The GetImpower params is undefined or null or space');
    }
}

function GetAccessTokenByCode(appID, secret, code) {
    var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' +
        appID.trim() + '&secret=' +
        secret.trim() + '&code=' +
        code.trim() + '&grant_type=authorization_code';
    return new Promise((resolve) => {
        request({ uri: url }, function (err, res, data) {
            if (!err) {
                var result = JSON.parse(data);
                //console.log("result.access_token: ", result.access_token);
                //确保有效返回获取的access_token
                resolve(result);
            }
            else {
                console.log("In File WebEvents.js Funtion GetAccessTokenByCode request access_token error!");
            }
        });
    });
}

function GetUserInfo(openid, access) {
    var url = 'https://api.weixin.qq.com/sns/userinfo?access_token=' + access.trim() + '&openid=' + openid.trim() + '&lang=zh_CN';
    return new Promise((resolve) => {
        request({ uri: url }, function (err, res, data) {
            if (!err) {
                var result = JSON.parse(data);
                //console.log("result.access_token: ", result.access_token);
                //确保有效返回获取的access_token
                resolve(result);
            }
            else {
                console.log("In File WebEvents.js Funtion GetUserInfo error!");
            }
        });
    });
}

exports.WebEvents = WebEvents;
