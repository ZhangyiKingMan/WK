var fs = require('fs');
var process = require('process');
var cf = require('../../CommonFunction/CommonFunction');

class HTML {

    constructor() {
        this.startNum = [];
        this.fid = -1;
        this.TemplateInfo = '<!DOCTYPE html>\n';
    }
    writeTemplateInfo() {
        fs.writeFileSync(this.fid, this.TemplateInfo);
    }

    //写入一个元素
    CreatHtml (path, name = null, overCreate = false) {
        try {
            if (name === null && (path === null || path === '')) {
                throw 'CreatHtml\'s path is null. The process exit !!!!!!!!';
            }
            else if (name !== null && path === '') {
                path = cf.StandPath(path);
                if (path[path.length - 1] === '/')
                    throw 'CreatHtml\'s no file to create. The process exit !!!!!!!!';
            }
            path = cf.StandPath(path);
            if (name === null) {
                var pathArr = path.split('.');
                if (pathArr.length === 2 && pathArr[1] !== 'html')
                    console.log('CreatHtml\'s create file type is not html ......');
                if (overCreate === false && fs.existsSync(path) === true) {
                    console.log(path, ' is already existed');
                    return null;
                }
                try {
                    if (fs.existsSync(path)) {
                        fs.unlink(path, (err) => {
                            console.log(err);
                        });
                    }
                    this.fid = fs.openSync(path, 'a');
                    this.writeTemplateInfo();
                }
                catch (err) {
                    console.log(err);
                }
            }
            else {
                var pathName = '';
                name = cf.StandPath(name);
                if (path[path.length - 1] === '/')
                    pathName = path + name;
                else
                    pathName = path + '/' + name;
                if (overCreate === false && fs.existsSync(pathName) === true) {
                    console.log(pathName, ' is already existed');
                    return null;
                }
                else if (overCreate === true) {
                    if (fs.existsSync(path)) {
                        fs.unlink(path, (err) => {
                            console.log(err);
                        });
                    }
                    this.fid = fs.openSync(pathName, 'a');
                    writeTemplateInfo();
                }

            }
        }
        catch (err) {
            console.log(err);
            process.exit();
        }
    }

    //一个元素开始
    StartElem (elem, info = null, autoEnd = 0) {
        this.startNum[this.startNum.length] = elem;
        var buf = '<' + elem + ' ';
        if (info !== null) {
            if (cf.isArray(info)) {
                for (var i in info) {
                    //判断是否有双引号
                    var tmp = info[i];
                    var tmpArr = tmp.split('=');
                    if (tmpArr[1][0].trim() === '"' && tmpArr[1][tmpArr[1].length - 1].trim() === '"')
                        buf += info[i] + ' ';
                    else {
                        if (tmpArr[1][0].trim() !== '"')
                            buf += tmpArr[0] + '="';
                        buf += tmpArr[1];
                        if (tmpArr[1][tmpArr[1].length - 1].trim() === '"')
                            buf += '"';
                        buf += ' ';
                    }
                }
                buf += '>\n';
            }
            else if (cf.isObj(info)) {
                for (var index in info) {
                    buf += index + '=';
                    if (cf.isObj(info[index]) || cf.isArray(info[index])) {
                        console.log('The html elem attrit is object or array, We can\'t deal it');
                        process.exit();
                    }
                    else {
                        buf += '"' + info[index] + '" ';
                    }
                }
                buf += '>\n';
            }
            else if (typeof info === 'string') {
                buf += info + '>\n';
            }
        }
        else {
            buf += '>\n';
        }
        fs.writeFileSync(this.fid, buf,);
        if (autoEnd !== 0) {
            for (var j = 0; j < autoEnd; j++)
                this.AutoEndElem();
        }
    }
    //元素文本
    ContextElem (buf, autoEnd = 0) {
        fs.writeFileSync(this.fid, buf);
        if (autoEnd !== 0) {
            for (var j = 0; j < autoEnd; j++)
                this.AutoEndElem();
        }
    }
    //元素结束
    EndElem (elem) {
        var buf = '</' + elem + '>\n';
        fs.writeFileSync(this.fid, buf);
    }
    //关闭文件描述符
    CloseHtml () {
        fs.closeSync(this.fid);
        this.fid = -1;
    }
    //自动追加结尾
    AutoEndElem (times=null) {
        if (this.startNum.length > 0) {
            this.EndElem(this.startNum[this.startNum.length - 1]);
            if (this.startNum.length > 0)
                this.startNum.pop();
            else
                return;
            if (this.startNum.length === 0)
                this.CloseHtml(this.fid);

            if (typeof times === 'number' && times > 1) {
                this.AutoEndElem(times - 1);
            }
            else if (typeof times === 'string' && times === 'end') {
                this.AutoEndElem('end');
            }
            else {
                return;
            }
        }
    }
    //单行元素
    SingleElem(elem, info= null) {
        var buf = '<' + elem + ' ';
        if (info !== null) {
            if (cf.isArray(info)) {
                for (var i in info) {
                    //判断是否有双引号
                    var tmp = info[i];
                    var tmpArr = tmp.split('=');
                    if (tmpArr[1][0] === '"' && tmpArr[1][tmpArr[1].length - 1] === '"')
                        buf += info[i] + ' ';
                    else {
                        if (tmpArr[1][0] !== '"')
                            buf += tmpArr[0] + '="';
                        buf += tmpArr[1];
                        if (tmpArr[1][tmpArr[1].length - 1] === '"')
                            buf += '"';
                        buf += ' ';
                    }
                }
                buf += '/>\n';
            }
            else if (cf.isObj(info)) {
                for (var index in info) {
                    buf += index + '=';
                    if (cf.isObj(info[index]) || cf.isArray(info[index])) {
                        console.log('The html elem attrit is object or array, We can\'t deal it');
                        process.exit();
                    }
                    else {
                        buf += '"' + info[index] + '" ';
                    }
                }
                buf += '/>\n';
            }
            else if (typeof info === 'string') {
                buf += info + '/>\n';
            }
        }
        else {
            buf += '/>\n';
        }
        fs.writeFileSync(this.fid, buf);
    }

}
module.exports =  HTML;
