﻿var fs = require('fs');
var currPath = require("path").resolve('./');
//console.log("currPath:", currPath);
//相对于当前文件的相对路径
var cf = require('../../CommonFunction/CommonFunction.js');
var sql = require('../SQL/SQLServer.js');
var Configstr = currPath + "/Config/DBconfig.json";
//console.log("currPath:", Configstr);
var Json = JSON.parse(cf.CheckBuffer(fs.readFileSync(cf.StandPath(Configstr), { encoding: 'utf8' })));

function canFind(str, json) {
    for (var index in json) {
        if (str === index) {
            return json[index];
        }
    }
    return null;
}

function DoXmlSQL(arr, DB) {
    //只允许接受数组
    if (Array.isArray(arr) === true && arr.length > 1) {
        var baseJson = {};
        for (var index in Json) {
            //找到对应的数据库,并且对应的提交的方法等于对应的方法，那么Json[index].method[1]
            //就等于对应的存储过程
            if (index === DB && Json[index].method[0] === arr[arr.length - 1].split('=')[0]) {
                for (var i = 0; i < arr.length - 1; i++) {
                    var arrTmp = arr[i].split('=');
                    var backArr = canFind(arrTmp[0], Json[index].data);
                    if (backArr === null) {
                        console.error("in ParaseClientData Funtion  Parse2Json the input Param one err");
                        return null;
                    }
                    else {
                        var returnJson = {};
                        if (backArr.length === 1) {
                            returnJson.sqlType = backArr[0];
                            returnJson.direction = "input";
                            //添加一个判断对于输入的值，或许可以在html中判断
                            returnJson.inputValue = arrTmp[1];
                            baseJson[arrTmp[0]] = returnJson;
                        }
                        else if (backArr.length === 2) {
                            if (backArr[1].toUpperCase() === 'I' || backArr[1].toUpperCase() === 'INPUT') {
                                returnJson.sqlType = backArr[0];
                                returnJson.direction = "input";
                                //添加一个判断对于输入的值，或许可以在html中判断
                                returnJson.inputValue = arrTmp[1];
                                baseJson[arrTmp[0]] = returnJson;
                            }
                            else if (backArr[1].toUpperCase() === 'O' || backArr[1].toUpperCase() === 'OUTPUT' || backArr[1] === undefined || backArr[1]===null) {
                                returnJson.sqlType = backArr[0];
                                returnJson.direction = "input";
                                baseJson[arrTmp[0]] = returnJson;
                            }
                        }

                    }
                }
                console.log(JSON.parse(JSON.stringify(baseJson), { encoding: 'utf8' }));
                //实现执行SQL----->有问题？？？-->没试过
                if (arguments.length >= 3) {
                    var func = 'sql.ExecuteUseJson(' + DB + ',' + Json[index].method[1] +','+ baseJson;
                    for (i = 3; i < arguments.length; i++) {
                        func += ', ' + arguments[i];
                    }
                    func += ')';
                    eval(func);
                }
                else {
                    sql.ExecuteUseJson(DB, Json[index].method[1], baseJson);
                }
            }
        }

    }
    else {
        return null;
    }

}
//DoJsonSQL 固定参数为4个，可变动参数最多6个
function DoJsonSQL(baseJson, DB, proc, res) {
    //eval 
    //构造函数
    if (arguments.length <= 4) {
        sql.ExecuteUseJson(DB, proc, baseJson, res);
    }
    else if (arguments.length === 5) {
        sql.ExecuteUseJson(DB, proc, baseJson, res, arguments[4]);
    }
    else {
        var func = 'sql.ExecuteUseJson(' + DB+','+ proc+','+ baseJson+','+ res;
        for (var i = 4; i < arguments.length; i++) {
            func += ', ' + arguments[i];
        }
        func += ')';
        eval(func);
    }
}

function DoJsonSQLSync(baseJson, DB, proc) {
    return sql.ExecuteUseJsonSync(DB, proc, baseJson);
}

exports.DoXmlSQL = DoXmlSQL;
exports.DoJsonSQL = DoJsonSQL;
exports.DoJsonSQLSync = DoJsonSQLSync;
