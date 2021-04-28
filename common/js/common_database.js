/*
 * 初始化创建数据库对象的方法(获取数据库操作的对象)
 */
function DataBaseOperation(){
    //数据库名称
    dbName = "ZYXXWSDB1";
    //数据库的对象
    dbObj = null;
    //初始化数据库
    dbObj = uexDataBaseMgr.open(dbName);
    //数据库状态判断
    if (!dbObj) {
        alert("创建数据库失败！");
        return;
    }
}
/*
 * 操作数据库的方法
 */
DataBaseOperation.prototype = {
    constructor: DataBaseOperation,
    //数据库查询的方法
    dbSelect:function(sql,callback){
        uexDataBaseMgr.select(dbObj, sql, function (error, data) {
            // uexDataBaseMgr.close(dbObj);
            var result = "";
            if (error!=0) {
                callback(error, result);
            } else {
                if(data!=''){
                   result = data;
                }
                if (appcan.isFunction(callback)) {
                    callback(null, result);
                }
            }
        });
    },
    //数据库创建Table的方法
    dbCreateTable:function(sql,callback){
        uexDataBaseMgr.sql(dbObj, sql, function (error) {
            // uexDataBaseMgr.close(dbObj);
            if (error) {
                alert("创建数据库表失败！");

            }
            if (appcan.isFunction(callback)) {
                callback(error); //0:表示成功  1:表示失败 2：表示重复
            }
        });
    },
    //数据库执行的方法（insert、update、delete）
    dbExec:function(sql,callback){
        uexDataBaseMgr.sql(dbObj, sql, function (error) {
            // uexDataBaseMgr.close(dbObj);
            var result = "";
            if (error!=0) {
                callback(error, "error");
            } else {
                if (appcan.isFunction(callback)) {
                    callback(null, 0);
                }
            }
        });
    },
    //数据库批量事务执行
    dbTrans: function (sqls, callback) {
        uexDataBaseMgr.transactionEx(dbObj, JSON.stringify(sqls), function (error) {
            // uexDataBaseMgr.close(dbObj);
            if (error) {
                // alert("执行失败！");
            }
            if (appcan.isFunction(callback)) {
                callback(error); //0:表示成功  1:表示失败
            }
        });
    },
    dbGetBaseName: function () {
        return dbName;
    }
}
