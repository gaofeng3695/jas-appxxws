/***
 * 保存设备检查记录
 * @param {Array} arrayData 检查记录数组
 * @param {function} callBack 回调函数
 * arrayData = [{
 *     objectId:"",//检查记录ID
 *     facilityId:"",//设备ID
 *     facilityName:"",//设备名称
 *     address:"",//设备地址
 *     facilityTypeCode:"",//设备类型编号
 *     facilityTypeName:"",//设备类型名称
 *     facilityCheckTime:"",//检查时间
 *     facilityCheckResult:"",//检查结果
 *     postData:""//数据体
 * }]
 */
function saveOfflineFacilityRecord(arrayData, callBack) {
    var result = {
        success : "",
        msg : ""
    };
    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    var sql = "insert into plf_facility_record (objectId,facilityId,facilityCheckTime,createUserId,createUserName,enterpriseId,facilityCheckResult,postData,facilityName,facilityTypeCode,facilityTypeName,address)";
    for (var i = 0; i < arrayData.length; i++) {
        var obj = arrayData[i];
        var sqlparams = " select '" + obj.objectId + "','" + obj.facilityId + "','" + obj.facilityCheckTime + "','" + userBo.objectId + "','" + userBo.userName + "','" + userBo.enterpriseId + "',";
        sqlparams += "" + obj.facilityCheckResult + ",'" + obj.postData + "','" + obj.facilityName + "','" + obj.facilityTypeCode + "','" + obj.facilityTypeName + "','" + obj.address + "'";
        if (i == 0) {
            sql += sqlparams;
        } else {
            sql += " union all " + sqlparams;
        }
    }
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql, function(err, data) {
        if (err == null && data == 0) {
            result.success = 1;
            result.msg = "保存成功";
        } else {
            result.success = 0;
            result.msg = "保存失败";
        }
        callBack(result);
    });
}

/**
 * 修改设备检查信息
 * @param {Object} objData
 * @param {function} callBack
 * objData={
 *     objectId:"",//检查记录ID
 *     facilityId:"",//设备ID
 *     facilityName:"",//设备名称
 *     address:"",//设备地址
 *     facilityTypeCode:"",//设备类型编号
 *     facilityTypeName:"",//设备类型名称
 *     facilityCheckTime:"",//检查时间
 *     facilityCheckResult:"",//检查结果
 *     postData:""//数据体
 * }
 */
function updateOfflineFacilityRecord(objData, callBack) {
    var result = {
        success : "",
        msg : ""
    };
    var sql = "update plf_facility_record set facilityId='" + objData.facilityId + "',facilityCheckTime='" + objData.facilityCheckTime + "',facilityCheckResult='" + objData.facilityCheckResult + "',address='" + objData.address + "'";
    sql += ",postData='" + objData.postData + "',facilityName='" + objData.facilityName + "',facilityTypeCode='" + objData.facilityTypeCode + "',facilityTypeName='" + objData.facilityTypeName + "' where objectId='" + objData.objectId + "'";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql, function(err, data) {
        if (err == null && data == 0) {
            result.success = 1;
            result.msg = "修改成功";
        } else {
            result.success = 0;
            result.msg = "修改失败";
        }
        callBack(result);
    });
}

/**
 * 查询设备检查记录详细
 * @param {string} objectId
 * @param {function} callBack
 */
function selectOfflineFacilityRecord(objectId, callBack) {
    var result = {
        success : "",
        msg : "",
        data : ""
    };
    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    var userId = userBo.objectId;
    var enterpriseId = userBo.enterpriseId;
    // var sql = "select r.*,p.facilityName,p.address,p.facilityTypeCode,p.facilityTypeName from plf_facility_record r,(select objectId,facilityName,address,facilityTypeCode,(select valueColumn from domain_table where codeColumn=p.facilityTypeCode)as facilityTypeName from plf_facility) p ";
    // sql += " where r.objectI='" + objectId + "' and r.failityId=p.objectId and r.createUserId='" + userId + "' and r.enterpriseId='" + enterpriseId + "'";
    var sql = "select * from plf_facility_record where objectId='" + objectId + "' and createUserId='" + userId + "' and enterpriseId='" + enterpriseId + "'";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbSelect(sql, function(err, data) {
        if (err == null) {
            var resultData = JSON.parse(data[0].postData);
            resultData["facilityName"] = data[0].facilityName;
            resultData["address"] = data[0].address;
            resultData["facilityTypeCode"] = data[0].facilityTypeCode;
            resultData["facilityTypeName"] = data[0].facilityTypeName;

            result.success = 1;
            result.msg = "查询成功";
            result.data = resultData;
        } else {
            result.success = 0;
            result.msg = "查询失败";
        }
        callBack(result);
    });
}

/**
 * 获取本地设备检查记录列表
 * @param {Object} params
 * @param {function} callBack
 * params = {
 *     queryParam:"",//关键词
 *     facilityTypeCode:"",//设备类型编号
 *     startTime:"",//开始时间
 *     endTime:""//结束时间
 * }
 */
function getOfflineFacilityRecordList(params, callBack) {
    var result = {
        success : "",
        msg : "",
        data : ""
    };
    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    var userId = userBo.objectId;
    var enterpriseId = userBo.enterpriseId;

    var queryParam = "";
    var facilityTypeCode = "";
    var startTime = "";
    var endTime = "";

    var sql = "select * from plf_facility_record where createUserId='" + userId + "' and enterpriseId='" + enterpriseId + "'";
    if (params != null) {
        if (params.queryParam != null && params.queryParam != "") {
            sql += " and (createUserName like '%" + params.queryParam + "%' or address like '%" + params.queryParam+ "%' or facilityName like '%" + params.queryParam + "%')";
        }
        if (params.facilityTypeCode != null && params.facilityTypeCode != "") {
            sql += " and facilityTypeCode= '" + params.facilityTypeCode+"'";
        }
        if (params.startTime != null && params.startTime != "" && params.endTime != null && params.endTime != "") {
            sql += " and (date(facilityCheckTime)>=date('" + params.startTime + "') and date(facilityCheckTime)<=date('" + params.endTime + "'))";
        }
    }
    sql += " order by facilityCheckTime desc";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbSelect(sql, function(err, data) {
        if (err == null) {
            var arrayData = new Array();
            for (var i = 0; i < data.length; i++) {
                var resultData = JSON.parse(data[i].postData);
                resultData["facilityName"] = data[i].facilityName;
                resultData["address"] = data[i].address;
                resultData["facilityTypeCode"] = data[i].facilityTypeCode;
                resultData["facilityTypeName"] = data[i].facilityTypeName;
                resultData["createUserName"] = userBo.userName;
                resultData["facilityCheckResultName"]=data[i].facilityCheckResult==1?"异常":"正常";
                arrayData.push(resultData);
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
 *
 * @param {string} facilityId
 * @param {funcation} callBack
 */
function getOfflineListByFacilityId(facilityId, callBack) {
    var result = {
        success : "",
        msg : "",
        data : ""
    };
    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    var userId = userBo.objectId;
    var enterpriseId = userBo.enterpriseId;

    var sql = "select * from plf_facility_record where facilityId='" + facilityId + "' and createUserId='" + userId + "' and enterpriseId='" + enterpriseId + "' order by facilityCheckTime desc";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbSelect(sql, function(err, data) {
        if (err == null) {
            var arrayData = new Array();
            for (var i = 0; i < data.length; i++) {
                var resultData = JSON.parse(data[0].postData);
                resultData["facilityName"] = data[0].facilityName;
                resultData["address"] = data[0].address;
                resultData["facilityTypeCode"] = data[0].facilityTypeCode;
                resultData["facilityTypeName"] = data[0].facilityTypeName;
                arrayData.push(resultData);
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
 * 删除本地检查记录
 * @param {Array} objectIds 设备记录IDs
 * @param {function} callBack 回调函数
 */
function deleteOfflineFacilityRecord(objectIds, callBack) {
    var result = {
        success: "",
        msg: ""
    };
    var ids = "";
    for (var i = 0; i < objectIds.length; i++) {
        if (i == objectIds.length - 1) {
            ids += "'" + objectIds[i] + "'";
        } else {
            ids += "'" + objectIds[i] + "',";
        }
    }
    var sql = "delete from plf_facility_record where objectId in(" + ids + ")";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql, function(err, data) {
        if (err == null && data == 0) {
            result.success = 1;
            result.mgs = "删除成功";
        } else {
            result.success = 0;
            result.mgs = "删除失败";
        }
        callBack(result);
    });
}
