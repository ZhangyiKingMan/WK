var https = require('https');
var request = require('request');
var Promise = require('promise');


//涉及到获取access_token
var appId = 'wx31cba258e1ec7277'; 
var appSecret = 'afa4e8bf1e96890d4ba54708e2de6e8b';

//click、view、media_id菜单类型
var menuTest = {
    "button": [{

        "name": "ClickButtn",
        "sub_button": [{
            "type": "click",
            "name": "苡",
            "key": "V1001_MY_ACCOUNT"
        }, {
            "type": "click",
            "name": "张",
            "key": "V1002_BID_PROJECTS"
        }
        ]
    }, {
        "type": "view",
        "name": "百度",
        "url": "http://www.baidu.com/"
    }, {

        "type": "view",
        "name": "个人博客",
        "url": "http://blog.csdn.net/yezhenxu1992/"
    }
    ]
};

//未注册之前的微信菜单
var menuRegiste = {
    "button": [{
        "name": "注册",
        "type": "view",
        "url": "http://2957705a.ngrok.io"
    }, {
        "name": "简介",
        "type": "view",
        "url":"http://f7875fec.ngrok.io?intro"
    }
    ]
};
//注册之后的微信菜单
var menuWorking = {
    "button": [{
        "name": "我",
        "sub_button": [{
            //用户在weike公众号设置自己公众号相关功能
            //返回一个网页，跟着提示与现有提供的功能设置，并且能动态模拟微信菜单界面
            "type": "click",
            "name": "菜单设置",
            "key": "SET_MENU"
        }, {
            //返回用户相关信息，比如什么时候到期，缴费多少，本月能设置菜单的次数等 
            "type": "click",
            "name": "信息查询",
            "key": "FIND_INFO"
        }, {
            //这里应该直接返回一个缴费链接或者直接跳转到缴费界面
            "type": "click",
            "name": "费用缴纳",
            "key": "PAY_MONEY"
        }
        ]
    }, {
        //通过网页链接快速编辑公众号推广文章
        "name": "文章编辑",
        "type": "click",
        "key": "TEXT_EDIT"
        }, {
            //更多服务，用于客服或者其他备注相关服务
            "name": "更多服务",
            "sub_button": [{
                //这里应该直接返回一个缴费链接或者直接跳转到缴费界面
                "type": "click",
                "name": "反馈意见",
                "key": "FEEDBACK"
            }, {
                //返回一个申请列表，其中有申请需求，自己属于什么行业想要定制什么服务功能
                "type": "click",
                "name": "定制服务",
                "key": "FEEDBACK"
                }, {
                //公司简介中可以添加以后用户转移链接
                "type": "view",
                "name": "公司简介",
                "url": "http://f7875fec.ngrok.io?intro"
            }
            ]
        }
    ]

};

function getToken(appId, appSecret) {

   return new Promise(function (resolve, reject) {

        var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appId + '&secret=' + appSecret;
        return request({ uri: url }, function (err, res, data) {
            if (!err) {
                var result = JSON.parse(data);
                console.log("result.access_token: ", result.access_token);
                //确保有效返回获取的access_token
                resolve(result.access_token);
            }
            else {
                console.log("In File Menu.js Funtion getToken request access_token error!");
            }
        });

    });

}

//设置菜单
function setMenu(info) { 
    switch (info.toUpperCase()) {
        case "MENUREGISTE":
            return JSON.stringify(menuRegiste);
        case "MENUWORKING":
            return JSON.stringify(menuWorking);
        default:
            return JSON.stringify(menuTest);
    }
}

//创建菜单
function CreateMenu(MenuInfo) {
    var post_str;
    if (MenuInfo === null)
        post_str = setMenu();
    else
        post_str = setMenu(MenuInfo);
    getToken(appId, appSecret).then((access_token) => {
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
    });
}

//获取用户信息
function GetUserInfo() {
    console.log("开始获取用户信息");
    var url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN';
    return request({ uri: url }, (err, res, data) => {
        if (!err) {
            var result = JSON.parse(data);
            console.log("获取用户信息：", result);
        }
        else {
            console.log("获取用户信息 Error!");
        }
    });

}
exports.CreateMenu = CreateMenu;