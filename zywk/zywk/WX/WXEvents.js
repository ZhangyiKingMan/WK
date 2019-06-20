var str = require('string-format');
var xml = require('xmlreader');

var menu = require("../Menu/Menu");
var sql = require('../SQL/ParaseClientData.js');
var cf = require('../../CommonFunction/CommonFunction.js');
var zywkC = require('../Zywk/ZywkClickEvents');
var zywkV = require('../Zywk/ZywkViewEvents');

//获取zywk公众号ID
function GetManPublic(){
    return 'gh_de33b437883c';
}

function WeiXinEvents(req, res) {
    var xmlData = "";
    //接受post数据
    req.addListener("data", function (data) {
        xmlData += data;
    });
    //解析post数据
    req.addListener("end", function () {
        xmlData = decodeURI(xmlData);
        //console.log(xmlData);
        xml.read(xmlData, res, (res, err, resulte) => {
            if (err) {
                console.log("In WeiXinEvents.js read xml data Error");
            }
            else {
                //微信xml文档打印
                //console.log(resulte);
                /* <xml>
                 * <ToUserName><![CDATA[gh_de33b437883c]]></ToUserName> 
                 * <FromUserName><![CDATA[odB9V5wY0iSoMOPq90DJQljYq4ic]]></FromUserName>
                 * <CreateTime>1553091125</CreateTime>
                 * <MsgType><![CDATA[text]]></MsgType>
                 * <Content><![CDATA[/::d/::d]]></Content>
                 * <MsgId>22234918607353935</MsgId> 
                 * </xml>
                 */
                //console.log(json.elements[0].elements[5]);
                var hasRes = false;
                //处理接受消息
                for (var index in resulte.xml) {
                    switch (index) {
                        case 'ToUserName':
                            console.log("访问公众号ID:", resulte.xml[index].text());
                            break;
                        case 'FromUserName':
                            console.log("访问微信号ID:", resulte.xml[index].text());
                            break;
                        case 'CreateTime':
                            console.log('发送消息时间:', resulte.xml[index].text());
                            break;
                        case 'MsgType':
                            {
                                var MsgType = resulte.xml[index].text();
                                console.log('消息类型', MsgType);
                                switch (MsgType) {
                                    // MsgId 所以消息都有的字段 微信设计主要用过消息排重
                                    case 'text':
                                        {
                                            //文本消息要接受Content与MsgId
                                            console.log(resulte.xml.Content.text());
                                            console.log(resulte.xml.MsgId.text());
                                        }
                                        break;
                                    case 'image':
                                        {
                                            /*
                                             * PicUrl	图片链接（由系统生成）
                                             * MediaId	图片消息媒体id，可以调用获取临时素材接口拉取数据。
                                             */
                                            console.log(resulte.xml.PicUrl.text());
                                        }
                                        break;
                                    case 'voice':
                                        {
                                            /*
                                             *  MsgType	语音为voice
                                             *  MediaId	语音消息媒体id，可以调用获取临时素材接口拉取数据。
                                             *  Format	语音格式，如amr，speex等
                                             */
                                             // Recognition	语音识别结果，UTF8编码
                                             // 开通语音识别后，用户每次发送语音给公众号时，微信会在推送的语音消息XML数据包中，增加一个Recognition字段
                                            console.log(resulte.xml.MediaId.text());
                                        }
                                        break;
                                    case 'video':
                                        {
                                            /*
                                             * MediaId	视频消息媒体id，可以调用获取临时素材接口拉取数据。
                                             * ThumbMediaId	视频消息缩略图的媒体id，可以调用多媒体文件下载接口拉取数据。
                                             */
                                        }
                                        break;
                                    case 'shortvideo':
                                        {
                                            /*
                                             * MediaId	视频消息媒体id，可以调用获取临时素材接口拉取数据。
                                             * ThumbMediaId	视频消息缩略图的媒体id，可以调用获取临时素材接口拉取数据。
                                             */
                                        }
                                        break;
                                    case 'location':
                                        {
                                            /*
                                             * Location_X	地理位置维度
                                             * Location_Y	地理位置经度
                                             * Scale	地图缩放大小
                                             * Label	地理位置信息
                                             */
                                        }
                                        break;
                                    case 'link':
                                        {
                                            /*
                                             * Title	消息标题
                                             * Description	消息描述
                                             * Url	消息链接
                                             */
                                        }
                                        break;
                                    // 关注/取消关注事件，无MsgId
                                    case "event":
                                        {
                                            switch (resulte.xml.Event.text()) {
                                                //点击菜单拉取消息时的事件推送
                                                case 'CLICK':
                                                    {
                                                        /*
                                                         * Event	事件类型，CLICK
                                                         * EventKey	事件KEY值，与自定义菜单接口中KEY值对应
                                                         */
                                                        console.log("MenuKey: ", resulte.xml.EventKey.text());
                                                        json = {};
                                                        json.from = resulte.xml.FromUserName.text();
                                                        json.to = resulte.xml.ToUserName.text();
                                                        json.key = resulte.xml.EventKey.text();
                                                        if (resulte.xml.ToUserName.text() === GetManPublic()) {
                                                            hasRes=zywkC.ZywkClickEvents(req, res, json);
                                                        }
                                                    }
                                                    break;
                                                case 'VIEW':
                                                    {
                                                        console.log("MenuURL: ", resulte.xml.EventKey.text());
                                                        if (resulte.xml.ToUserName.text() === GetManPublic()) {
                                                            hasRes = zywkV.ZywkViewEvents(req, res, resulte.xml.EventKey.text());
                                                        }
                                                    }
                                                    break;
                                                //关注-->收集必要信息，根据关注对象更新必要信息
                                                case 'subscribe':
                                                    {
                                                        //生成界面菜单,对应关注人数，获取关注者相关信息
                                                        // 以下是未关注前扫描二维码时发送的
                                                        // <EventKey><![CDATA[qrscene_123123]]></EventKey>
                                                        // <Ticket><![CDATA[TICKET]]></Ticket>
                                                         /*
                                                         * EventKey	事件KEY值，qrscene_为前缀，后面为二维码的参数值
                                                         * Ticket	二维码的ticket，可用来换取二维码图片
                                                         */
                                                        // var TestStr = '{"p1":{"sqlType":"int", "direction":"input", "inputValue":3},"p2":{"sqlType":"int", "direction":"output"}}';
                                                        //获取用户信息
                                                        var public_ID = resulte.xml.ToUserName.text();
                                                        var weixin_ID = resulte.xml.FromUserName.text();
                                                        var jsonSecret = cf.ParseArr2Json([
                                                            'PublicID,string,input,' + public_ID,
                                                            'PublicToken,string,output',
                                                            'AppID,string,output',
                                                            'AppSecret,string,output']);
                                                        sql.DoJsonSQLSync(jsonSecret, 'zywk_PublicNumber', 'SelectWeiXinToken')
                                                            //获取用户信息，并且适当更新token
                                                            .then((result) => {
                                                                for (index in jsonSecret) {
                                                                    if (jsonSecret[index].direction === 'output') {
                                                                        jsonSecret[index].outputValue = result.output[index];
                                                                    }
                                                                }
                                                                var PublicToken = jsonSecret.PublicToken.outputValue;
                                                                var AppID = jsonSecret.AppID.outputValue;
                                                                var AppSecret = jsonSecret.AppSecret.outputValue;
                                                       
                                                                //获取微信人物信息
                                                                if (PublicToken === null) {
                                                                    console.log('PublicToken is Null');
                                                                    PublicToken = 'error';
                                                                }
                                                                return new Promise((resolve) => {
                                                                    menu.GetUserInfo(PublicToken.trim(), weixin_ID)
                                                                        .then((ManInfoStr) => {
                                                                            var ManInfo = JSON.parse(ManInfoStr);
                                                                            if (ManInfo.hasOwnProperty("errcode")) {
                                                                                //获取失败，再次获取
                                                                                menu.GetToken(AppID, AppSecret)
                                                                                    .then((data) => {
                                                                                        if (data === null)
                                                                                            console.log('获取token失败');
                                                                                        else {
                                                                                            jsonSecret.PublicToken = data;
                                                                                            menu.UpdateToken(public_ID, data);
                                                                                            menu.GetUserInfo(data, weixin_ID)
                                                                                                .then((UserInfoStr) => {
                                                                                                        resolve(JSON.parse(UserInfoStr));
                                                                                                });
                                                                                        }
                                                                                    });
                                                                            }
                                                                            else {
                                                                                if (ManInfo.subscribe === 0) {
                                                                                    //用户没有关注该公众号
                                                                                    console.log('用户没有关注公众号：', public_ID);
                                                                                }
                                                                                else {
                                                                                    resolve(ManInfo);
                                                                                }
                                                                            }
                                                                        });
                                                                });

                                                            })
                                                            //执行关注存储过程
                                                            .then((userInfo) => {
                                                                var arr = [
                                                                    'openid,string,input,' + userInfo.openid,
                                                                    'nickname,string,input,' + userInfo.nickname,
                                                                    'sex,bool,input,' + userInfo.sex,
                                                                    'language,string,input,' + userInfo.language,
                                                                    'city,string,input,' + userInfo.city,
                                                                    'province,string,input,' + userInfo.province,
                                                                    'country,string,input,' + userInfo.country,
                                                                    'headIMG,string,input,' + userInfo.headIMG,
                                                                    'subscribe_scene,stirng,input,' + userInfo.subscribe_scene,
                                                                    'publicID,string,input,' + public_ID
                                                                ];
                                                                sql.DoJsonSQLSync(cf.ParseArr2Json(arr), 'zywk_PublicNumber', 'CareAbout')
                                                                    .then((data) => {
                                                                        if (data.returnValue === 2) {
                                                                            console.log('执行sql CareAbout 未找公众号', public_ID, ' 对应的表格');
                                                                        }
                                                                    });
                                                            });
                                                    }
                                                    break;
                                                //取消关注
                                                case 'unsubscribe':
                                                    {
                                                        var arr = [
                                                            'openid,string,input,' + userInfo.openid,
                                                            'publicID,string,input,' + public_ID
                                                        ];
                                                        sql.DoJsonSQLSync(cf.ParseArr2Json(arr), 'zywk_PublicNumber', 'CancelCareAbout');
                                                    }
                                                    break;
                                                //扫描带参数二维码事件
                                                case 'SCAN':
                                                    {
                                                        //支付相关
                                                        /*
                                                         * EventKey	事件KEY值，qrscene_为前缀，后面为二维码的参数值
                                                         * Ticket	二维码的ticket，可用来换取二维码图片
                                                         */
                                                    }
                                                    break;
                                                default:
                                                    {
                                                        console.log("未处理事件：--------->>>>>", resulte.xml.Event.text());
                                                    }
                                                    break;
                                            }
                                        }
                                        break;
                                    default:
                                        break;
                         
                                }
                            }
                            break;
                        default:
                            break;
                    }
                }

                //console.log(WeiXinMsg);
                ////返回消息结果
                //var SendMsg = "<xml>";
                //var GoNext = true;
                //SendMsg += str("<ToUserName>{}</ToUserName>", FromUserName);
                //SendMsg += str("<FromUserName>{}</FromUserName>", ToUserName);
                //SendMsg += str("<CreateTime>{}</CreateTime>", new Date().getTime());
                //SendMsg += str("<MsgType>{}</MsgType>", MsgType);
                //switch (MsgType.toUpperCase()) {
                //    case "TEXT":
                //        SendMsg += str("<Content>{}</Content>", Content);
                //        break;
                //    case "IMAGE":
                //        SendMsg += str("<Image><MediaId>{}</MediaId></Image>", MediaId);
                //        break;
                //    case "EVENT":
                //        GoNext = false;
                //        res.end("success");
                //        break;
                //}
                //if (GoNext) {
                //    SendMsg += "</xml>";
                //    res.write(SendMsg);
                //    console.log(SendMsg);
                //    res.end();
                //}
                if (!hasRes)
                    console.log('Send success');
                    res.end("success");
            }
        });
    });
}



exports.WeiXinEvents = WeiXinEvents;