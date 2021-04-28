/**
 * 获取设备类型
 * @param {function} callBack
 */
function getOfflineFacilityType(callBack) {
    var result = {
        success : "",
        msg : "",
        data : ""
    };
    var sql = "select * from domain_table where domainName='facility_type' order by rowIndex desc";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbSelect(sql, function(err, data) {
        if (err == null) {
            var arrayData = new Array();
            for (var i = 0; i < data.length; i++) {
                var obj = {
                    "code" : data[i].domainCode,
                    "value" : data[i].domainValue
                };
                arrayData.push(obj);
            }
            result.success = 1;
            result.msg = "查询成功";
            result.data = arrayData;
        } else {
            result.success = 0;
            result.msg = "查询失败";
        }
        callBack(result);
    });
}
/**
 * 获取管网类型
 * @param {function} callBack
 */
function getOfflinePipelineType(callBack){
    var result = {
        success : "",
        msg : "",
        data : ""
    };
    var sql = "select * from domain_table where domainName='pipeline_type' order by rowIndex desc";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbSelect(sql, function(err, data) {
        if (err == null) {
            var arrayData = new Array();
            for (var i = 0; i < data.length; i++) {
                var obj = {
                    "code" : data[i].domainCode,
                    "value" : data[i].domainValue
                };
                arrayData.push(obj);
            }
            result.success = 1;
            result.msg = "查询成功";
            result.data = arrayData;
        } else {
            result.success = 0;
            result.msg = "查询失败";
        }
        callBack(result);
    });
}
/***
 * 获取设备状态类型 
 * @param {Object} callBack
 */
function getOfflineFacilityStatus(callBack){
    var result = {
        success : "",
        msg : "",
        data : ""
    };
    var sql = "select * from domain_table where domainName='facility_status' order by rowIndex desc";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbSelect(sql, function(err, data) {
        if (err == null) {
            var arrayData = new Array();
            for (var i = 0; i < data.length; i++) {
                var obj = {
                    "code" : data[i].domainCode,
                    "value" : data[i].domainValue
                };
                arrayData.push(obj);
            }
            result.success = 1;
            result.msg = "查询成功";
            result.data = arrayData;
        } else {
            result.success = 0;
            result.msg = "查询失败";
        }
        callBack(result);
    });
}
