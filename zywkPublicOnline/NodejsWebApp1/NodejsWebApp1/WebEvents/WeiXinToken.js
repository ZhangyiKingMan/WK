var crypto = require('crypto');
var url = require('url');

var WeiXinToken = "weixin";
//检测微信Token
 function checkWeiXinToken(req) {
    var query = url.parse(req.url, true).query;
    //微信url打印
     console.log("微信url打印", query);
    var signature = query.signature;
    var timestamp = query.timestamp;
    var nonce = query.nonce;
    var echostr = query.echostr;
    if (check(timestamp, nonce, signature, WeiXinToken)) {
        return echostr;
     }
    else {
        return null;
     }
     
}
//设置微信
function setWeiXinToken(name) {
    WeiXinToken = name;
}
//微信解密
function check(timestamp, nonce, signature, token) {
    var currSign, tmp;
    tmp = [token, timestamp, nonce].sort().join("");
    currSign = crypto.createHash("sha1").update(tmp).digest("hex");
    console.log(currSign);
    return currSign === signature;
}


exports.checkWeiXinToken = checkWeiXinToken;
exports.setWeiXinToken = setWeiXinToken;