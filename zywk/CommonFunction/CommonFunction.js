// JavaScript source code
// JavaScript source code
//无效url字符集合
var invalidUrl = [
    'net user',
    'xp_cmdshell',
    '/ add',
    'exec master.dbo.xp_cmdshell',
    'net localgroup administrators',
    'select',
    'count',
    'Asc',
    'char',
    'mid',
    '"',
    ':',
    '"',
    'insert',
    'delete from',
    'drop table',
    'update',
    'truncate',
    'from',
    '   %',
    '  "',
    '\'',
    '<',
    '>',
    '%',
    '&',
    '(',
    ')',
    ';',
    '+',
    '-',
    '[',
    ']',
    '{',
    '}'];

//检测url合法性
function CheckURL(URL) {
    for (var i = 0, j = i + 1, k = j + 1; k < URL.length; i++ , j++ , k++) {
        if (URL[i] === '.' && URL[j] === '.' && (URL[k] === '/' || URL[k] === '\\'))
            return null;
    }
    return URL;
}

//标准化所有路径
function StandPath(path) {
    var pathTem = "";
    for (var i = 0; i < path.length; i++) {
        if (path[i] === '\\') {
            pathTem += '/';
        }
        else {
            pathTem += path[i];
        }
    }
    return pathTem;
}

//合成路径
function DealPoint(path) {
    if (path === '' || path === null)
        return null;
    var arrPath = path.split('/');
    var onePoint = 0;
    var twoPoint = 0;
    var newArr = [];
    for (var i = 0, j = 0; i < arrPath.length; i++) {
        if (arrPath[i] === '.') {
            onePoint++;
        }
        else if (arrPath[i] === '..') {
            twoPoint++;
        }
        else if (arrPath[i][arrPath[i].length - 1] === '.') {
            var strTmp = arrPath[i].slice(0, arrPath[i].length - 1);
            newArr[j] = strTmp;
            j++;
            continue;
        }
        else if (arrPath[i][arrPath[i].length - 1] === '.' && arrPath[i][arrPath[i].length - 2] === '.') {
            continue;
        }
        
        if (twoPoint !== 0) {
            j -= twoPoint;
            twoPoint = 0;
            continue;
        }
        if (onePoint !== 0) {
            onePoint = 0;
            continue;
        }
        newArr[j] = arrPath[i];
        j++;
    }
    var str='';
    for (var index = 0; index < newArr.length; index++) {
        if (index === newArr.length - 1)
            str += newArr[index];
        else {
            str += newArr[index] + '/';
        }
    }
    return str;
}

//防止读取文件时有文件类型表示，影响程序正常工作
function CheckBuffer(str) {
    if (str[0] !== '{') {
        str = str.slice(1, str.length);
    }
    return str;
}

//把当前路径与一个相对路径组合为绝对路径
function CombinationPath(pathCurrent, pathRelative) {
    pathRelative = StandPath(pathRelative);
    pathCurrent = StandPath(pathCurrent);
    if (pathRelative[0] === '.') {
        pathRelative = pathRelative.slice(1, pathRelative.length);
    }
    return pathCurrent + pathRelative;
}

//特定格式的数组转为Json数据
function ParseArr2Json(arr) {
    //['name,type,input/output,value', ...]
    //               ||
    //{"name":{"sqlType":"type", "direction":"input/output", "inputValue":value}, ...}
    //               ||
    //{"p1":{"sqlType":"int", "direction":"input", "inputValue":3}, ...}
    if (Array.isArray(arr) === true) {
        var Json = {};
        for (var i = 0; i < arr.length; i++) {
            var subJson = {};
            var arrTmp = arr[i].split(',');
            if (arrTmp.length === 4) {
                //type input
                subJson.sqlType = arrTmp[1];
                subJson.direction = arrTmp[2];
                subJson.inputValue = arrTmp[3];
                Json[arrTmp[0]] = subJson;
            }
            else {
                //type output
                subJson.sqlType = arrTmp[1];
                subJson.direction = arrTmp[2];
                subJson.outputValue = "";
                Json[arrTmp[0]] = subJson;
            }
        }
        return Json;
    }
    else {
        return null;
    }
}

//对比两个js数据
function isObj(object) {
    return object && typeof object === 'object' && Object.prototype.toString.call(object).toLowerCase() === "[object object]";
}

function isArray(object) {
    return object && typeof object === 'object' && object.constructor === Array;
}

function getLength(object) {
    var count = 0;
    for (var i in object) count++;
    return count;
}

function Compare(objA, objB) {
    if (!isObj(objA) || !isObj(objB)) return false; //判断类型是否正确
    if (getLength(objA) !== getLength(objB)) return false; //判断长度是否一致
    return CompareObj(objA, objB, true);//默认为true
}

function CompareObj(objA, objB, flag) {
    //console.log(objA);
    //console.log(objB);
    for (var key in objA) {
        if (!flag) //跳出整个循环
            break;
        if (!objB.hasOwnProperty(key)) { flag = false; break; }
        if (!isArray(objA[key])) { //子级不是数组时,比较属性值
            if (objB[key] !== objA[key]) { flag = false; break; }
        } else {
            if (!isArray(objB[key])) { flag = false; break; }
            var oA = objA[key], oB = objB[key];
            if (oA.length !== oB.length) { flag = false; break; }
            for (var k in oA) {
                if (!flag) //这里跳出循环是为了不让递归继续
                    break;
                flag = CompareObj(oA[k], oB[k], flag);
            }
        }
    }
    return flag;
}

//删除空格
function DelSpace(str) {
    if (str === undefined || str === null || typeof str !== "string")
        return null;
    var strTmp = "";
    for (var i = 0; i < str.length; i++) {
        if (str[i] === ' ')
            continue;
        else {
            strTmp += str[i];
        }
    }
    return strTmp;
} 

function viewJson(JsonData, LookKey, Values) {
    for (var index in JsonData) {
        if (!isObj(JsonData[index]) && !isArray(JsonData[index])) {
            if (index === LookKey) {
                Values.push(JsonData[index]);
            }
        }
        else {
            viewJson(JsonData[index], LookKey, Values);
        }
    }
}

//在json数据中找到所有对应key名称的值
function FindAllUrl(JsonData, LookKey) {
    var resulte = new Array;
    viewJson(JsonData, LookKey, resulte);
    return resulte;
}

//获取Menu.js中url后？的字符串包括？
function GetMenuMethod(JsonData, LookKey) {
    var arr = FindAllUrl(JsonData, LookKey);
    var returnArr=[];
    for (var value in arr) {
        var tmp = arr[value].split('/');
        returnArr[returnArr.length] = '/'+tmp[tmp.length - 1];
    }
    return returnArr;
}

//给指定url组合上参数
function JoinParms(url, parmsArr) {
    try {
        if (isObj(parmsArr)) {
            var newUrl = '';
            for (var key in parmsArr) {
                if (parmsArr[key] === ''|| invalidUrl.includes(parmsArr[key]))
                    parmsArr[key] = 'null';
                newUrl += key + '=' + parmsArr[key] + '&';
            }
            newUrl = newUrl.slice(0, newUrl.length - 1);
            console.log(newUrl);
            return url + '?'+encodeURIComponent(newUrl);
        }
        else {
            throw 'Function JoinParms\'s parms 2 the type must array';
        }
    }
    catch (err) {
        console.log(err);
        return url;
    }
}

//解码encodeurl为对应的json数据
function ParseParms(encodeUrlPart) {
    var parmStr = decodeURIComponent(encodeUrlPart);
    var parmArr = parmStr.split('&');
    var json = {};
    for (var i in parmArr) {
        var Tmp = parmArr[i].split('=');
        json[Tmp[0]] = Tmp[1];
    }
    return json;
}

//利用正则表达式替换html中的内容
function ReplaceContext(data, json) {
    data = data.toString();
    for (var index in json) {
        //构建正则表达式
        var reg = new RegExp(index);
        data = data.replace(reg, json[index]);
    }
    return data;
}

function GetFileName(path) {
    path = StandPath(path);
    var arr = path.split('/');
    return arr[arr.length - 1];
}

function ReplaceUrl(newUrl, json, str='url') {
    //检测newUrl最后一位是有没一/
    if (newUrl[newUrl.length - 1] === '/') {
        newUrl = newUrl.substring(0, newUrl.length - 1);
    }
    for (var i in json) {
        if (isArray(json[i]) || isObj(json[i])) {
            ReplaceUrl(newUrl, json[i], str);
        }
        else if (i === str) {
            var reg = new RegExp('^http://[^/]+');
            //console.log(json[i].match(reg));
            //console.log('replace befor:----->', json[i]);
            json[i] = json[i].replace(reg, newUrl);
            //console.log('replace after:----->', json[i]);
        }
    }
}

//替换json中url
exports.ReplaceUrl = ReplaceUrl;
//获取路径名称
exports.GetFileName = GetFileName;
//利用正则表达式替换html中的内容
exports.ReplaceContext = ReplaceContext;
//解码encodeurl为对应的json数据
exports.ParseParms = ParseParms;
//给指定url组合上参数
exports.JoinParms = JoinParms;
//获取Menu.js中url后？的字符串包括？
exports.GetMenuMethod = GetMenuMethod;
//在json数据中找到所有对应key名称的值
exports.FindAllUrl = FindAllUrl;
//检测url合法性  
exports.CheckURL = CheckURL;
//标准化所有路径
exports.StandPath = StandPath;
//防止读取文件时有文件类型表示，影响程序正常工作
exports.CheckBuffer = CheckBuffer;
//把当前路径与一个相对路径组合为绝对路径
exports.CombinationPath = CombinationPath;
//让固定字符串数组变为Json数据
exports.ParseArr2Json = ParseArr2Json;
//删除空格
exports.DelSpace = DelSpace;
//去除相对路径
exports.DealPoint = DealPoint;
//config与web文本比较
exports.CompareJson = Compare;
//判断知否是obj
exports.isObj = isObj;
//判断是否是数组
exports.isArray = isArray;