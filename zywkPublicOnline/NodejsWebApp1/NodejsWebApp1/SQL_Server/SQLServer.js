var sql = require('mssql');
var fs = require('fs');

//基本设置相关常量
var Configstr = "./Config/config.json";

var sqlData = JSON.parse(fs.readFileSync(Configstr));

var sql_Accoutns = sqlData.SQL.Accounts;
var sql_Passwords = sqlData.SQL.Passwords;
var sql_HostName = sqlData.SQL.HostName;
var sql_Port = sqlData.SQL.Port;
var sql_MaxConNum = sqlData.SQL.PoolMax;
var sql_TimeOutMS = sqlData.SQL.Timeout;

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
}

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

var TestJson = {
    "p1": {
        sqlType: "int",
        direction: "input",
        inputValue: 3
    },
    "p2": {
        sqlType: "int",
        direction: "output",
        outputValue: null
    }
};

var TestStr = '{"p1":{"sqlType":"int", "direction":"input", "inputValue":3},"p2":{"sqlType":"int", "direction":"output"}}';
var TestDB = "zywk_PublicNumber";
var TestProc = "TestProc";

//执行的存贮过程
function Execute(sqlDB, procedure, paramStr, func) {
    try {
        initConnect(sqlDB);
        //解析str到JSON要求str格式如下
        // "index：｛sqlType:int, direction:"input|output|return"，inputValue:value｝"
        var params = JSON.parse(paramStr);
        var pool = new sql.ConnectionPool(config, function (err) {
            let request = pool.request();
            if (params !== null) {
                //初始化sql存储过程参数
                for (let index in params) {
                    if (params[index].direction === direction.Output) {
                        switch (params[index].sqlType.toUpperCase()) {
                            case "INT":
                                request.output(index, sql.TinyInt);
                                break;

                        }
                    }
                    else if (params[index].direction === direction.Input) {
                         switch (params[index].sqlType.toUpperCase()) {
                            case "INT":
                                 request.input(index, sql.TinyInt, params[index].inputValue);
                                break;
                         }
                    }
                    else {
                        console.log("SQL_Server Params Direction Eerror!");
                    }
                }
            }
            request.execute(procedure, function (error, recordsets, returnValue, affected) {
                if (error) {
                    console.log(error);
                    doRelease(pool);//关闭连接池
                }
                else {
                    for (let index in params) {
                        if (params[index].direction === direction.Output) {
                            params[index].outputValue = request.parameters[index].value;
                        }
                    }
                    func(error, recordsets, returnValue, affected);//回调函数
                }
                doRelease(pool);//关闭连接池
            });
        });
        relaseConnect();
    }
    catch (err) {
        doRelease(pool);
        func(err);
    }
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

function sqlTestLog(err, records, returnValue, affected) {
    console.log("err :", err);
    console.log("records :", records);
    console.log("returnValue :", returnValue);
    console.log("affected :", affected);
}

var obj = {
    name: {
        nihao: "dfas",
        wohao: 11111,
        tahao:2222
    },
    "age": 22,
    "sex": "F"
};

function sqlTest() {
    var print = false;
    if (print) {
        var str = JSON.stringify(TestJson);
        console.log(str);

        var obj2 = JSON.parse(str);
        console.log(obj2);
    }
    Execute(TestDB, TestProc, TestStr, sqlTestLog);
}

exports.Execute = Execute;
exports.SqlTest = sqlTest;

