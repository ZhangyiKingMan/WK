var str = require('string-format');
var fs = require('fs');

function OtherEvents(serIn, serOut) {

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


exports.OtherEvents = OtherEvents;