var parseXML = require('xml-js');
var str = require('string-format');
var menu = require("../Menu/Menu");

function WeiXinEvents(req, res) {
    var postData = "";
    //接受post数据
    req.addListener("data", function (data) {
        postData += data;
    });
    //解析post数据
    req.addListener("end", function () {
        postData = decodeURI(postData);
        console.log(postData);
        var json = parseXML.xml2js(postData);
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
        var ToUserName = json.elements[0].elements[0].elements[0].cdata;        //公众号
        var FromUserName = json.elements[0].elements[1].elements[0].cdata;      //粉丝号
        var CreateTime = json.elements[0].elements[2].elements[0].text;         //微信公众平台记录粉丝发送该消息的具体时间
        var MsgType = json.elements[0].elements[3].elements[0].cdata;           //信息类型

        var Content, MsgId, MediaId, Event, EventKey, PicUrl;
        var WeiXinMsg = str("公众号: {}\n粉丝号: {}\n时间: {}\n信息类型: {}\n", ToUserName, FromUserName, CreateTime, MsgType);
        switch (MsgType.toUpperCase()) {
            case "IMAGE":
                PicUrl = json.elements[0].elements[4].elements[0].cdata;           //内容为text:用于标记该xml是文本消息
                MsgId = json.elements[0].elements[5].elements[0].text;              //公众平台为记录识别 消息 的一个标记数值
                MediaId = json.elements[0].elements[6].elements[0].cdata;             //公众平台为记录识 图片 的一个标记数值
                WeiXinMsg += str("图片URL: {}\n消息ID: {} \n图片ID: {}\n", PicUrl, MsgId, MediaId);
                break;
            case "TEXT":
                Content = json.elements[0].elements[4].elements[0].cdata;           //内容为text:用于标记该xml是文本消息
                MsgId = json.elements[0].elements[5].elements[0].text;              //公众平台为记录识别 消息 的一个标记数值
                WeiXinMsg += str("消息ID: {}\n内容: {}\n", Content, MsgId);
                break;
            case "EVENT":
                Event = json.elements[0].elements[4].elements[0].cdata;
                switch (Event.toUpperCase()) {
                    //取消关注
                    case "UNSUBSCRIBE": 
                        break;
                    //关注
                    case "SUBSCRIBE":
                        var MenuInfo = "menuRegiste";
                        menu.CreateMenu(MenuInfo);
                        //getUserInfo();
                        break;
                }
                EventKey = json.elements[0].elements[5].name;
                WeiXinMsg += str("事件: {}\n事件Key: {}\n", Event, EventKey);
                break;
        }
        console.log(WeiXinMsg);
        //返回消息
        var SendMsg = "<xml>";
        var GoNext = true;
        SendMsg += str("<ToUserName>{}</ToUserName>", FromUserName);
        SendMsg += str("<FromUserName>{}</FromUserName>", ToUserName);
        SendMsg += str("<CreateTime>{}</CreateTime>", new Date().getTime());
        SendMsg += str("<MsgType>{}</MsgType>", MsgType);
        switch (MsgType.toUpperCase()) {
            case "TEXT":
                SendMsg += str("<Content>{}</Content>", Content);
                break;
            case "IMAGE":
                SendMsg += str("<Image><MediaId>{}</MediaId></Image>", MediaId);
                break;
            case "EVENT":
                GoNext = false;
                res.end("success");
                break;
        }
        if (GoNext) {
            SendMsg += "</xml>";
            res.write(SendMsg);
            console.log(SendMsg);
            res.end();
        }
    });
}



exports.WeiXinEvents = WeiXinEvents;