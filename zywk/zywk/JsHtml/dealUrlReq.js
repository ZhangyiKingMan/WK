var HTML = require('./html');
var cf = require('../../CommonFunction/CommonFunction');
var configJson = module.require('../Html/config/htmlConfig.json');
//根据configJson中内容创建初始的固定网页
//var configJson = JSON.parse(cf.CheckBuffer(fs.readFileSync('./Html/config/htmlConfig.json', { encoding: 'utf8' })));

//根据动态的数据库上的数据构造动态buffer

//创建html页面静态页面
function CreateHtml(path, info) {
    try {
        //是否日志中存在
        if (configJson.hasOwnProperty(path)) {
            if (cf.GetFileName(path).split('.')[1] === 'html') {
                var html = new HTML;
                if (html.CreatHtml('./Html/test.html', null, true) !== null) {
                    html.StartElem('html', ' xmlns="ZywkMsg"');
                    html.StartElem('header');
                    html.SingleElem('meta', { "http-equiv": "content-type", "content": "text/html", "charset": "utf-8" });
                    html.SingleElem('link', { href: "./css/ZywkPayforMsg.css", rel: "stylesheet", type: "text/css" });
                    html.SingleElem('link', { rel: "icon", href: "/html/favicon.ico", type: "image/x-icon" });
                    html.SingleElem('meta', { name: "viewport", content: "width=device-width,maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" });
                    html.StartElem('script', { type: "text/javascript", src: "./js/zywkPayforMsg.js" }, 2);
                    html.StartElem('body');
                    html.StartElem('h3', { id: 'text_info' });
                    html.ContextElem('欢迎使用微科服务', 1);
                    html.StartElem('form', ['id="payFrom"']);
                    html.StartElem('label', ['id="text_info"']);
                    html.ContextElem('请选择您需要的服务:', 1);
                    html.SingleElem('br');
                    for (var index in global.priceArr) {
                        html.SingleElem('input', { type: "button", id: "pay_form", name: index, values: global.priceArr[index] });
                    }
                    html.AutoEndElem('end');
                }
            }
        }
    }
    catch (err) {
        console.log(err);
    }
}

//['pathName', 'pathName'], 'pathName', 'all', number:x

function init(path=null) {
    CreateHtml('./Html/ZywkPayforMsg.html');
}

exports.init = init;
