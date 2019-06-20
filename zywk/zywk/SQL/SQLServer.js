var sql = require('mssql');
var fs = require('fs');

var cf = require('../../CommonFunction/CommonFunction.js');

//基本设置相关常量
var Configstr = "./Config/config.json";

var sqlData = JSON.parse(cf.CheckBuffer(fs.readFileSync(cf.StandPath(Configstr), { encoding: 'utf8' })));

var sql_Accoutns = sqlData.SQL.Accounts;
var sql_Passwords = sqlData.SQL.Passwords;
var sql_HostName = sqlData.SQL.HostName;
var sql_Port = sqlData.SQL.Port;
var sql_MaxConNum = sqlData.SQL.PoolMax;
var sql_TimeOutMS = sqlData.SQL.Timeout;

//制作数据库连接信息
var config = {
    user: sql_Accoutns,
    password: sql_Passwords,
    server: sql_HostName,
    database: '...',
    port: sql_Port,
    options: {
        encrypt: true//使用windows azure，需要设置次配置。
    },
    pool: {
        max: sql_MaxConNum,
        min: 0,
        idleTimeoutMillis: sql_TimeOutMS
    }
};

//sql参数的类型
var direction = {
    //输入参数
    Input: "input",
    //输出参数
    Output: "output",
    //返回参数
    Return: "return"
};

//初始化链接信息
function initConnect(DB) {
    config.database = DB;
}
//释放链接信息
function relaseConnect() {
    config.database = '...';
}

//关闭数据库连接
function doRelease(connection) {
    if (connection) {
        connection.close(function (err) {
            if (err) {
                console.error(err.message);
            }
        });
    }
}

//执行的存贮过程
function ExecuteUseStr(sqlDB, procedure, paramStr) {
    try {
        //确定数据为string
        initConnect(sqlDB);
        //解析str到JSON要求str格式如下
        // "index：｛sqlType:int, direction:"input|output|return"，inputValue:value｝"
        var params = JSON.parse(paramStr);
        var pool = new sql.ConnectionPool(config, function (err) {
            if (err)
                console.log(err);
            var request = pool.request();
            if (params !== null) {
                //初始化sql存储过程参数
                for (var index in params) {
                    if (params[index].direction === direction.Output) {
                        switch (params[index].sqlType.toUpperCase()) {
                            case "INT":
                                request.output(index, sql.TinyInt);
                                break;
                            case "STRING":
                                request.output(index, sql.NVarChar);
                                break;
                            case "BOOL":
                                request.output(index, sql.Bit);
                                break;
                        }
                    }
                    else if (params[index].direction === direction.Input) {
                         switch (params[index].sqlType.toUpperCase()) {
                            case "INT":
                                 request.input(index, sql.TinyInt, params[index].inputValue);
                                 break;
                             case "STRING":
                                 request.input(index, sql.NVarChar, params[index].inputValue);
                                 break;
                             case "BOOL":
                                 request.input(index, sql.Bit, params[index].inputValue);
                                 break;
                         }
                    }
                }
            }
            request.execute(procedure, (error, recordsets, returnValue, affected) => {
                if (error) {
                    console.log(error);
                    doRelease(pool);//关闭连接池
                }
                else {
                    for (var index in params) {
                        if (params[index].direction === direction.Output) {
                            params[index].outputValue = request.parameters[index].value;
                        }
                    }
                }
                console.log('sql返回值', returnValue);
                doRelease(pool);//关闭连接池
            });
        });
        relaseConnect();
    }
    catch (err) {
        doRelease(pool);
    }
}

function ExecuteUseJson(sqlDB, procedure, paramsJson) {
    try {
        initConnect(sqlDB);
        var pool = new sql.ConnectionPool(config, function (err) {
            if (err) {
                console.log(err);
            }
            var request = pool.request();
            var params = paramsJson;
            if (params !== null) {
                //初始化sql存储过程参数
                for (var index in params) {
                    if (params[index].direction === direction.Output) {
                        switch (params[index].sqlType.toUpperCase()) {
                            case "INT":
                                request.output(index, sql.TinyInt);
                                break;
                            case "STRING":
                                request.output(index, sql.NVarChar);
                                break;
                            case "BOOL":
                                request.output(index, sql.Bit);
                                break;
                        }
                    }
                    else if (params[index].direction === direction.Input) {
                        switch (params[index].sqlType.toUpperCase()) {
                            case "INT":
                                request.input(index, sql.TinyInt, params[index].inputValue);
                                break;
                            case "STRING":
                                request.input(index, sql.NVarChar, params[index].inputValue);
                                break;
                            case "BOOL":
                                request.input(index, sql.Bit, params[index].inputValue);
                                break;
                         }
                    }
                }
            }
            request.execute(procedure, function (error, recordsets, returnvalue) {
                if (error) {
                    console.log(error);
                    dorelease(pool);//关闭连接池
                }
                else {
                    for (var index in params) {
                        if (params[index].direction === direction.output) {
                            params[index].outputvalue = request.parameters[index].value;
                        }
                    }
                }
                doRelease(pool);//关闭连接池
            });
            relaseConnect();
        });
    }
    catch (err) {
        doRelease(pool);
        console.log("数据库连接错误!", err);
    }
}

//同步执行存储过程
function ExecuteUseJsonSync(sqlDB, procedure, params) {
    return new Promise(async (resolve)=> {
        try {
            initConnect(sqlDB);
            //创建数据库连接池
            var pool = new sql.ConnectionPool(config);
            await pool.connect();//连接数据库
            let request = pool.request();
            if (params !== null) {
                //初始化sql存储过程参数
                for (var index in params) {
                    if (params[index].direction === direction.Output) {
                        switch (params[index].sqlType.toUpperCase()) {
                            case "INT":
                                request.output(index, sql.TinyInt);
                                break;
                            case "STRING":
                                request.output(index, sql.NVarChar);
                                break;
                            case "BOOL":
                                request.output(index, sql.Bit);
                                break;
                        }
                    }
                    else if (params[index].direction === direction.Input) {
                        switch (params[index].sqlType.toUpperCase()) {
                            case "INT":
                                request.input(index, sql.TinyInt, params[index].inputValue);
                                break;
                            case "STRING":
                                request.input(index, sql.NVarChar, params[index].inputValue);
                                break;
                            case "BOOL":
                                request.input(index, sql.Bit, params[index].inputValue);
                                break;
                        }
                    }
                    else {
                        console.log("SQL_Server Params Direction Eerror!");
                    }
                }
            }
            // result 成功返回该结构
            // {
            //     recordsets,
            //     recordset: recordsets && recordsets[0],
            //     output,
            //     rowsAffected,
            //     returnValue
            // }
            var result = await request.execute(procedure);
            //for (index in params) {
            //    if (params[index].direction === direction.Output) {
            //        params[index].outputValue = result.output[index];
            //    }
            //}
            resolve(result);
        } catch (err) {
            doRelease(pool);
            console.log("数据库连接错误!\n", err);
            return err;
        } finally {
            await doRelease(pool);
        }
    });
}

function ExecuteUseStrSync(sqlDB, procedure, paramStr) {
    var json = JSON.parse(paramStr);
    return ExecuteUseJsonSync(sqlDB, procedure, json);
}

async function ExecuteUseJsonWithSync(sqlDB, procedure, params) {
    try {
        initConnect(sqlDB);
        //创建数据库连接池
        var pool = new sql.ConnectionPool(config);
        await pool.connect();//连接数据库
        let request = pool.request();
        if (params !== null) {
            //初始化sql存储过程参数
            for (var index in params) {
                if (params[index].direction === direction.Output) {
                    switch (params[index].sqlType.toUpperCase()) {
                        case "INT":
                            request.output(index, sql.TinyInt);
                            break;
                        case "STRING":
                            request.output(index, sql.NVarChar);
                            break;
                        case "BOOL":
                            request.output(index, sql.Bit);
                            break;
                    }
                }
                else if (params[index].direction === direction.Input) {
                    switch (params[index].sqlType.toUpperCase()) {
                        case "INT":
                            request.input(index, sql.TinyInt, params[index].inputValue);
                            break;
                        case "STRING":
                            request.input(index, sql.NVarChar, params[index].inputValue);
                            break;
                        case "BOOL":
                            request.input(index, sql.Bit, params[index].inputValue);
                            break;
                    }
                }
                else {
                    console.log("SQL_Server Params Direction Eerror!");
                }
            }
        }
        // result 成功返回该结构
        // {
        //     recordsets,
        //     recordset: recordsets && recordsets[0],
        //     output,
        //     rowsAffected,
        //     returnValue
        // }
        let result = await request.execute(procedure);
        for (index in params) {
            if (params[index].direction === direction.Output) {
                params[index].outputValue = result.output[index];
            }
        }
        console.log("ExecuteUseJsonSync result:", result);
        return { state: true, data: result };
    } catch (err) {
        doRelease(pool);
        console.log("数据库连接错误!\n", err);
        return { state: false, data: err };
    } finally {
        await doRelease(pool);
    }
}


//用相应字符串格式进行sql
exports.ExecuteUseStr = ExecuteUseStr;
//用Json进行相应的sql
exports.ExecuteUseJson = ExecuteUseJson;
//用Json进去对应sql
exports.ExecuteUseJsonSync = ExecuteUseJsonSync;
//用Json的str格式执行sql
exports.ExecuteUseStrSync = ExecuteUseStrSync;

