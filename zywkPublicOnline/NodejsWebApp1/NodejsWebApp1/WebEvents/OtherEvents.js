var str = require('string-format');
var fs = require('fs');
var cf = require('../../CommonFuntion/CommonFuntion.js')

function OtherEvents(serIn, serOut) {

    var a = url.parse(req.url);
    //检测路径的安全性对有所请求的路径进行格式化操作
    //限定所有html页面必须在HTML下才能通过url访问
    if (cf.CheckURL(a.pathname) === null) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end("BAD ERROR!");
    }
    else {
        //通过特定url访问特定页面
        if (a.pathname !== '/special/') {
            //打印客户端相关信息
            var msg = str("{}: {}:{}\n", serIn.connection.address().family, serIn.connection.address().address, serIn.connection.address().port);
            console.log(msg);
            serOut.writeHead(200, { 'Content-Type': 'text/html' });
            if (serIn.url === "/") {
                fs.readFile('./../../../zywkWebRoot/zywkMan.html', 'UTF-8', function (err, data) {
                    if (err) {
                        throw err;
                    }
                    serOut.end(data);
                });
            }
            else if (serIn.url === "/zywkContext.html") {
                var url = './../../../zywkWebRoot/' + serIn.url;
                fs.readFile(url, 'UTF-8', function (err, data) {
                    if (err) {
                        throw err;
                    }
                    serOut.end(data);
                });
            }
        }
        //非指定url页面
        else {
            //打印路径
            //console.log(a.pathname);
            //依据路径返回相关信息
            if (a.pathname !== '/') {
                var filePahh = "./../NodejsWebApp1/HTML" + a.pathname;
                console.log(filePahh);
                var html = fs.readFileSync(filePahh);
                if (filePahh === "./../NodejsWebApp1/HTML/CSS/register.css") {
                    res.writeHead(200, { 'Content-Type': 'text/css' });
                }
                else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                }
                res.end(html);
            } else {
                //默认主页

                res.end();
            }
        }
    }
}


exports.OtherEvents = OtherEvents;