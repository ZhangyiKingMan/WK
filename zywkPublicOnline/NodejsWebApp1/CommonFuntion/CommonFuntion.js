// JavaScript source code
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

//检测url合法性
exports.CheckURL = CheckURL;
//标准化所有路径
exports.StandPath = StandPath;
//防止读取文件时有文件类型表示，影响程序正常工作
exports.CheckBuffer = CheckBuffer;
//把当前路径与一个相对路径组合为绝对路径
exports.CombinationPath = CombinationPath;
