var request = require('request');
var str = require('string-format');

function ZywkClickEvents(req, res, json) {
    try {
        console.log(json);
        switch (json.key) {
            case 'Payfor': {
                var file = '/html/zywkPayforMsg.html';
                var payforUrl = global.configJson.impower + file + '?' + "\"from=" + json.from  + ' to=' + json.to+"\"";
                console.log('payforUrl:---->', payforUrl);
                var imgUrl = global.configJson.impower + "/html/picture/welcome.jpg";
                //console.log('imgUrl:---->', imgUrl);
                var SendMsg = "<xml>";
                SendMsg += str("<ToUserName>{}</ToUserName><FromUserName>{}</FromUserName><CreateTime>{}</CreateTime>", json.from, json.to, new Date().getTime());
                SendMsg += "<MsgType>news</MsgType><ArticleCount>1</ArticleCount><Articles><item>";
                SendMsg += str("<Title>{}</Title><Description>{}</Description><PicUrl>{}</PicUrl><Url>{}</Url>", "欢迎使用微科服务", "请点击进入支付界面", imgUrl, payforUrl);
                SendMsg += "</item></Articles></xml>";
                console.log(SendMsg);
                res.write(SendMsg);
                res.end();
                return true;
            }
        }
    }
    catch (err) {
        console.log("File ZywkClickEvents.js Error:\n", err);
    }
}


exports.ZywkClickEvents = ZywkClickEvents;