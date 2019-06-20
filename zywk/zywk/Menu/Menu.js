var https = require('https');
var request = require('request');
var Promise = require('promise');
var fs = require('fs');
var currPath = require("path").resolve('./');
var Configstr = currPath + "/Config/Menu.json";

var sql = require('../SQL/SQLServer.js');
var cf = require('../../CommonFunction/CommonFunction');

//涉及到获取access_token
//var appId = 'wx31cba258e1ec7277'; 
//var appSecret = 'afa4e8bf1e96890d4ba54708e2de6e8b';

//读取菜单配置文件
var Json = JSON.parse(cf.CheckBuffer(fs.readFileSync(cf.StandPath(Configstr), { encoding: 'utf8' })));
var menuJsonStatu;
fs.stat(cf.StandPath(Configstr), (err, stars) => {
    if (err)
        console.log(err);
    else {
        menuJsonStatu = stars.mtime.toLocaleString();
    }
});

//返回appID与appSecret获取到的access_Token
function getToken(appId, appSecret) {
    return new Promise(function (resolve, reject) {
        var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appId.trim() + '&secret=' + appSecret.trim();
        request({ uri: url }, function (err, res, data) {
            if (!err) {
                var result = JSON.parse(data);
                //console.log("result.access_token: ", result.access_token);
                //确保有效返回获取的access_token
                resolve(result.access_token);
            }
            else {
                console.log("In File Menu.js Funtion getToken request access_token error!");
            }
        });
    });
}
//跟新数据库的access_token
function updateToken(publicID, access_token) {
    var arr = ['publicID,string,input,' + publicID.trim(), 'access_token,string,input,' + access_token.trim()];
    var json = cf.ParseArr2Json(arr);
    sql.ExecuteUseJsonSync('zywk_PublicNumber', 'UpdateWeiXinToken', json);
}
//设置菜单(更具publicID自动选择菜单)
function setMenu(publicID) { 
    //检测是否需要刷新读取文件
    
    if (fs.statSync(cf.StandPath(Configstr)).mtime.toLocaleString() !== menuJsonStatu) {
        menuJsonStatu = cf.StandPath(Configstr).mtime.toLocaleString();
        Json = JSON.parse(cf.CheckBuffer(fs.readFileSync(cf.StandPath(Configstr), { encoding: 'utf8' })));
    }
    return JSON.stringify(Json[publicID]);
}
//创建菜单通过publicID+1/2 与access_token创建对应菜单
function CreateMenu(MenuInfo, access_token, MenuJson = null) {
    var post_str;
    if (MenuJson === null) {
        if (MenuInfo === null)
            post_str = setMenu();
        else
            post_str = setMenu(MenuInfo);
    }
    else if (cf.isObj(MenuJson))
        post_str = JSON.stringify(MenuJson);
    if (access_token !== null) {
        var post_options = {
            host: 'api.weixin.qq.com',
            port: '443',
            path: '/cgi-bin/menu/create?access_token=' + access_token,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_str)
            }
        };

        var post_req = https.request(post_options, (res) => {
            var postData = "";
            res.on('data', function (post_str) {
                postData += post_str;
            });
            res.on('end', function () {
                console.log("创建默认菜单postData: ", postData);
                //console.log("创建默认菜单:", MenuInfo);
            });
            res.on('error', (err) => {
                console.log(err);
            });
        });
        post_req.write(post_str);
        post_req.end();
    }
}
//默认菜单管理 Method  delete get create
function DefMenuSet(Method, access_token, MenuInfo) {
    if (access_token !== null) {
        var post_req,url;
        switch (Method) {
            case 'get':
                url = 'https://api.weixin.qq.com/cgi-bin/menu/' + Method.trim() + '?access_token=' + access_token;
                post_req = request(url, function (err, res, data) {
                    if (err)
                        console.log(err);
                    else {
                        console.log(data);
                    }
                });
                break;
            case 'delete':
                url = 'https://api.weixin.qq.com/cgi-bin/menu/' + Method.trim() + '?access_token=' + access_token;
                post_req = request(url, function (err, res, data) {
                    if (err)
                        console.log(err);
                    else {
                        console.log(data);
                    }
                });
                break;
            case 'create':
                {
                    var post_str;
                    if (MenuInfo === null)
                        post_str = setMenu();
                    else
                        post_str = setMenu(MenuInfo);
                    var post_options = {
                        host: 'api.weixin.qq.com',
                        port: '443',
                        path: '/cgi-bin/menu/create?access_token=' + access_token,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Content-Length': Buffer.byteLength(post_str)
                        }
                    };
                    post_req = https.request(post_options, (res) => {
                        var postData = "";
                        res.on('data', function (post_str) {
                            postData += post_str;
                        });
                        res.on('end', function () {
                            console.log("postData: ", postData);
                            console.log("The Menu has Updated!");
                        });
                        res.on('error', (err) => {
                            console.log(err);
                        });
                    });
                    post_req.write(post_str);
                    post_req.end();
                }
                break;
            default:
                console.log('菜单操作method:', Method, '没有对应方法！');
                return;
        }
    }
}
//创建个性化菜单
function CreateAddContional(MenuInfo, access_token) {
    var post_str;
    if (MenuInfo === null)
        post_str = setMenu();
    else
        post_str = setMenu(MenuInfo);
    if (access_token !== null) {
        var post_options = {
            host: 'api.weixin.qq.com',
            port: '443',
            path: '/cgi-bin/menu/addconditional?access_token=' + access_token,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_str)
            }
        };

        var post_req = https.request(post_options, (res) => {
            var postData = "";
            res.on('data', function (post_str) {
                postData += post_str;
            });
            res.on('end', function () {
                console.log("创建个性化菜单postData: ", postData);
                //console.log("创建个性化菜单:", MenuInfo);
            });
            res.on('error', (err) => {
                console.log(err);
            });
        });
        post_req.write(post_str);
        post_req.end();
    }
}
//查询个性化菜单
function SerchAddContional(access_token) {
    return new Promise((resolve, reject)=> {
        url = 'https://api.weixin.qq.com/cgi-bin/menu/get?access_token=' + access_token;
        request({ uri: url }, function(err, res, data) {
            if (err)
                console.log(err);
            else {
                //console.log('查询个性化菜单:', data);
                resolve(data);
            }
        });
    });
}
//删除个性化菜单
function DeleteAddContional(access_token, menuID) {
    var MenuJson = {};
    MenuJson.menuid = menuID.trim();
    var post_str = JSON.stringify(MenuJson);
    var post_options = {
        host: 'api.weixin.qq.com',
        port: '443',
        path: '/cgi-bin/menu/delconditional?access_token=' + access_token,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_str)
        }
    };
    post_req = https.request(post_options, (res) => {
        var postData = "";
        res.on('data', function (post_str) {
            postData += post_str;
        });
        res.on('end', function () {
            console.log("postData: ", postData);
            console.log("删除个性化菜单 OK");
        });
        res.on('error', (err) => {
            console.log(err);
        });
    });
    post_req.write(post_str);
    post_req.end();
}
//删除所有菜单
function DeleteAllMenu(access_token) {
    DefMenuSet('delete', access_token);
}
//为用户添加个性化菜单
function DramAddContional(weixinID) {
    var MenuJson = {};
    MenuJson.user_id = weixinID.trim();
    var post_str = JSON.stringify(MenuJson);
    var post_options = {
        host: 'api.weixin.qq.com',
        port: '443',
        path: '/cgi-bin/menu/delconditional?access_token=' + access_token,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_str)
        }
    };
    post_req = https.request(post_options, (res) => {
        var postData = "";
        res.on('data', function (post_str) {
            postData += post_str;
        });
        res.on('end', function () {
            console.log("postData: ", postData);
            console.log("添加个性化菜单 OK");
        });
        res.on('error', (err) => {
            console.log(err);
        });
    });
    post_req.write(post_str);
    post_req.end();
}
//个性化菜单管理
function ContMenSet(Method, access_token, MenuInfo) {
    if (access_token !== null) {
        var post_req, url;
        switch (Method) {
            case 'get':
                url = 'https://api.weixin.qq.com/cgi-bin/menu/' + Method.trim().toUpperCase() + '?access_token=' + access_token;
                post_req = request(url, (res) => {
                    var postData = "";
                    res.on('data', function (post_str) {
                        postData += post_str;
                    });
                    res.on('end', function () {
                        console.log("postData: ", postData);
                        console.log("The Menu has Geted!");
                    });
                    res.on('error', (err) => {
                        console.log(err);
                    });
                });
                break;
            case 'delete':
                url = 'https://api.weixin.qq.com/cgi-bin/menu/' + Method.trim().toUpperCase() + '?access_token=' + access_token;
                post_req = request(url, (res) => {
                    var postData = "";
                    res.on('data', function (post_str) {
                        postData += post_str;
                    });
                    res.on('end', function () {
                        console.log("postData: ", postData);
                        console.log("The Menu has Deleted!");
                    });
                    res.on('error', (err) => {
                        console.log(err);
                    });
                });
                break;
            case 'create':
                {
                    var post_str;
                    if (MenuInfo === null)
                        post_str = setMenu();
                    else
                        post_str = setMenu(MenuInfo);
                    var post_options = {
                        host: 'api.weixin.qq.com',
                        port: '443',
                        path: '/cgi-bin/menu/addconditional?access_token=' + access_token,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Content-Length': Buffer.byteLength(post_str)
                        }
                    };
                    post_req = https.request(post_options, (res) => {
                        var postData = "";
                        res.on('data', function (post_str) {
                            postData += post_str;
                        });
                        res.on('end', function () {
                            console.log("postData: ", postData);
                            console.log("The Menu has Updated!");
                        });
                        res.on('error', (err) => {
                            console.log(err);
                        });
                    });
                    post_req.write(post_str);
                    post_req.end();
                }
                break;
            default:
                console.log('菜单操作method:', Method, '没有对应方法！');
                return;
        }
    }
}
//获取用户信息返回用户信息
function GetUserInfo(access_token, openeid) {
    //console.log("开始获取用户信息");
    return new Promise(async (resolve) => {
        var url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + access_token.trim() + '&openid=' + openeid + '&lang=zh_CN';
        await request({ uri: url }, (err, res, data) => {
            if (!err) {
                var result = JSON.parse(data);
                //console.log("获取用户信息：", result);
                resolve(data);
            }
            else {
                console.log("获取用户信息 Error!");
            }
        });
    });


}

//===============用户标签管理===============//
//创建标签
function CreateTag(access_token, tagName) {
    var post_str_JS = {};
    post_str_JS.tag = {
        'name': tagName
    };
    var post_str = JSON.stringify(post_str_JS);
    var post_options = {
        host: 'api.weixin.qq.com',
        port: '443',
        path: '/cgi-bin/tags/create?access_token=' + access_token,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_str)
        }
    };
    var post_req = https.request(post_options, (res) => {
        var postData = "";
        res.on('data', function (data) {
            postData += data;
        });
        res.on('end', function () {
            //console.log("postData: ", postData);
            console.log(" 创建标签返回数据: " + postData);
        });
        res.on('error', (err) => {
            console.log(err);
        });
    });
    post_req.write(post_str);
    post_req.end();
}
//获取公众号已创建的标签
function GetAllTag(access_token) {
    url = 'https://api.weixin.qq.com/cgi-bin/tags/get?access_token=' + access_token;
    request({ uri: url }, function (err, res, data) {
        if (err)
            console.log(err);
        else {
            console.log('获取公众号已创建的标签', data);
        }
    });
}
//编辑标签
function EditTag(access_token, tagId, EditContext) {
    var post_str = {};
    post_str.tag = {
        'id': tagId,
        'name': EditContext
    };
    var post_options = {
        host: 'api.weixin.qq.com',
        port: '443',
        path: '/cgi-bin/tags/update?access_token=' + access_token,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_str)
        }
    };
    var post_req = https.request(post_options, (res) => {
        var postData = "";
        res.on('data', function (data) {
            postData += data;
        });
        res.on('end', function () {
            //console.log("postData: ", postData);
            console.log("编辑标签返回数据：" + postData);
        });
        res.on('error', (err) => {
            console.log(err);
        });
    });
    post_req.write(post_str);
    post_req.end();
}
//删除标签
function DeleteTag(access_token, tagId) {
    var post_str = {};
    post_str.tag = {
        'id': tagId,
    };
    var post_options = {
        host: 'api.weixin.qq.com',
        port: '443',
        path: '/cgi-bin/tags/delete?access_token=' + access_token,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_str)
        }
    };
    var post_req = https.request(post_options, (res) => {
        var postData = "";
        res.on('data', function (data) {
            postData += data;
        });
        res.on('end', function () {
            //console.log("postData: ", postData);
            console.log("删除标签返回数据：" + postData);
        });
        res.on('error', (err) => {
            console.log(err);
        });
    });
    post_req.write(post_str);
    post_req.end();
}
//为用户打标签
function MakeTagForUser(access_token, userWeiXinID, tagID) {
    var post_str_js = {};
    var arr =[];
    arr[0] = userWeiXinID.trim();
    post_str_js.openid_list = arr;
    post_str_js.tagid = tagID.trim();
    var post_str = JSON.stringify(post_str_js);
    var post_options = {
        host: 'api.weixin.qq.com',
        port: '443',
        path: '/cgi-bin/tags/members/batchtagging?access_token=' + access_token,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_str)
        }
    };
    var post_req = https.request(post_options, (res) => {
        var postData = "";
        res.on('data', function (data) {
            postData += data;
        });
        res.on('end', function () {
            console.log("为用户打标签返回数据：" + postData);
        });
        res.on('error', (err) => {
            console.log(err);
        });
    });
    post_req.write(post_str);
    post_req.end();
}
//为用户取消标签
function DelTagForUser(access_token, userWeiXinID) {
    var post_str_js= {};
    post_str_js.tag = {
        'openid': userWeiXinID
    };
    var post_str = JSON.stringify(post_str_js);
    var post_options = {
        host: 'api.weixin.qq.com',
        port: '443',
        path: '/cgi-bin/tags/getidlist?access_token=' + access_token,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_str)
        }
    };
    var post_req = https.request(post_options, (res) => {
        var postData = "";
        res.on('data', function (data) {
            postData += data;
        });
        res.on('end', function () {
            //console.log("postData: ", postData);
            console.log("删除标签返回数据：" + MenuInfo);
        });
        res.on('error', (err) => {
            console.log(err);
        });
    });
    post_req.write(post_str);
    post_req.end();
}
//查看用户标签
function GetUserTag(access_token, userWeiXinID) {
    var post_str_JS = {};
    post_str_JS.tag = {
        'openid': userWeiXinID
    };
    var post_str = JSON.stringify(post_str_JS);
    var post_options = {
        host: 'api.weixin.qq.com',
        port: '443',
        path: '/cgi-bin/tags/getidlist?access_token=' + access_token,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_str)
        }
    };
    var post_req = https.request(post_options, (res) => {
        var postData = "";
        res.on('data', function (data) {
            postData += data;
        });
        res.on('end', function () {
            //console.log("postData: ", postData);
            console.log(" 查看用户标签: " + postData);
        });
        res.on('error', (err) => {
            console.log(err);
        });
    });
    post_req.write(post_str);
    post_req.end();
}


exports.CreateMenu = CreateMenu;
exports.GetUserInfo = GetUserInfo;
exports.GetToken = getToken;
exports.UpdateToken = updateToken;
exports.CreateAddContional = CreateAddContional;
exports.SerchAddContional = SerchAddContional;
exports.DeleteAddContional = DeleteAddContional;
exports.DeleteAllMenu = DeleteAllMenu;
exports.DramAddContional = DramAddContional;

exports.DelTagForUser = DelTagForUser;
exports.MakeTagForUser = MakeTagForUser;
exports.DeleteTag = DeleteTag;
exports.EditTag = EditTag;
exports.GetAllTag = GetAllTag;
exports.CreateTag = CreateTag;
exports.GetUserTag = GetUserTag;