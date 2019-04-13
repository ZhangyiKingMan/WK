var url = require('url');
var fs = require('fs');
var currPath = require("path").resolve('./');
//相对于当前文件的相对路径
var cf = require('../../CommonFuntion/CommonFuntion.js');
var pcd = require('../SQL_Server/ParaseClientData.js');

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
            //console.log(postData);
             /*
              * 注意！ 所有表单submit都必须为form最后一个参数，若不是将解析不出来
              * 所有submit那么若用到数据库对应的方法，都应当在config.json中写出对应的存储方法
              * 格式为 数据库名称BD_Name ｛submit名称：对应的存储方法proc｝
              */
            var arr = postData.split('&');
            //console.log(arr);
            pcd.DoSQL(arr, "zywk_PublicNumber", null);
        });
    }
}

function EventsGET(req, res) {
    //console.log(currPath);
    //验证该方法只为get方法，所有url都由该方法
    if (req.method.toUpperCase() === "GET") { 
        var a = url.parse(req.url);
        console.info("收到原始url: ", a.pathname);
        if (a.pathname !== '/') {
            //相对于registe_http.js的相对路径
            var filePath = "./HTML" + a.pathname;
            if (cf.CheckURL(filePath) === null) {
                console.error("检测url返回404:");
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end("INVALID FILE PATH");
            }
            filePath = cf.StandPath(filePath);
            //console.log("标准化之后url: ", filePath);
            var arrNameType = filePath.split('/');
            var arrType = arrNameType[arrNameType.length - 1].split('.');
            var absoultFilePath = cf.CombinationPath(currPath, filePath);
            //判断有没一这样的文件
            fs.access(absoultFilePath, (err) => {
                if (err) {
                    console.error("检测到没有对应文件返回404:");
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end("No SUCH FILE");
                }
                else {
                    switch (arrType[arrType.length - 1]) {
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
                    var html = fs.readFileSync(filePath);
                    res.end(html);
                }
            });
        }
        else {
            //默认主页
            var Registe = fs.readFileSync("./HTML/Registe.html");
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(Registe);
        }
    }
    else {
        res.end("ERROR");
    }
}


exports.EventsPOST = EventsPOST;
exports.EventsGET = EventsGET;