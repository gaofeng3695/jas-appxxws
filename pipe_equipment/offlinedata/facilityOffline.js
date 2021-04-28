/**
 * 离线保存管网设施数据
 * @param {Array} arrayData 设备数据json对象数组
 * @param {function} callBack 回调函数
 * var arrayData = [{
 *     objectId:"",//数据ID
 *     facilityName:"",//设备名称
 *     facilityCode:"",//设备编号
 *     facilityTypeCode:"",//设备类型编号
 *     pipelineTypeCode:"",//管网类型编号
 *     facilityStatusCode:"",//设备状态
 *     address:"",//设备详细地址
 *     postData:"",//数据体
 *     createTime:""//创建时间
 * }]
 */
function saveOfflineFacility(arrayData, callBack) {
    var result = {
        success: "",
        msg: ""
    }
    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    var sql = "insert into plf_facility (objectId,facilityName,facilityCode,facilityTypeCode,pipelineTypeCode,facilityStatusCode,address,postData,createUserId,createUserName,enterpriseId,createTime)";
    for (var i = 0; i < arrayData.length; i++) {
        var obj = arrayData[i];
        var sqlparams = " select '" + obj.objectId + "','" + obj.facilityName + "','" + obj.facilityCode + "','" + obj.facilityTypeCode + "','" + obj.pipelineTypeCode + "','" + obj.facilityStatusCode + "','" + obj.address + "',";
        sqlparams += "'" + obj.postData + "','" + userBo.objectId + "','" + userBo.userName + "','" + userBo.enterpriseId + "','" + obj.createTime + "'";
        if (i == 0) {
            sql += sqlparams;
        } else {
            sql += " union all " + sqlparams;
        }
        var dbOperation = new DataBaseOperation();
        dbOperation.dbExec(sql, function(err, data) {
            if (err == null && data == 0) {
                result.success = 1;
                result.msg = "添加成功";
            } else {
                result.success = 0;
                result.msg = "添加失败";
            }
            callBack(result);
        });
    }
}

/**
 * 管网信息修改
 * @param {Object} objData 设备数据json对象
 * @param {function} callBack 回调函数
 * var objData = {
 *     objectId:"",//数据ID
 *     facilityName:"",//设备名称
 *     facilityCode:"",//设备编号
 *     facilityTypeCode:"",//设备类型编号
 *     pipelineTypeCode:"",//管网类型编号
 *     facilityStatusCode:"",//设备状态
 *     address:"",//设备详细地址
 *     postData:"",//数据体
 *     createTime:""//创建时间
 * }
 */
function updateOfflineFacility(objData, callBack) {
    var result = {
        success: "",
        mgs: ""
    };
    var sql = "update plf_facility set facilityName='" + objData.facilityName + "',facilityCode='" + objData.facilityCode + "',facilityTypeCode='" + objData.facilityTypeCode + "',pipelineTypeCode='" + objData.pipelineTypeCode;
    sql += "',facilityStatusCode='" + facilityStatusCode + "',address='" + objData.address + "',postData='" + objData.postData + "' where objectId='" + objData.objectId + "'";
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
 * 删除本地设备信息
 * @param {Array} objectIds 设备IDs
 * @param {function} callBack 回调函数
 */
function deleteOfflineFacility(objectIds, callBack) {
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
    var sql = "delete from plf_facility where objectId in(" + ids + ")";
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

/***
 * 查询设备信息
 * @param {string} objectId 设备ID
 * @param {function} callBack 回调函数
 * 注：返回的数据中新增两个字段，facilityTypeName(设备类型名称),pipelineTypeName(管网类型名称)和facilityStatusName(设备状态)
 */
function selectOfflineFacility(objectId, callBack) {
    var result = {
        success: "",
        msg: "",
        data: ""
    };
    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    var sql = "select p.*, (select domainValue from domain_table where domainCode=p.facilityTypeCode)as facilityTypeName,(select domainValue from domain_table where domainCode=p.pipelineTypeCode) as pipelineTypeName,";
    sql += "(select domainValue from domain_table where domainCode=p.facilityStatusCode) as facilityStatusName from plf_facility p where p.objectId ='" + objectId + "' and createUserId ='" + userBo.objectId + "' and enterpriseId='" + userBo.enterpriseId + "'";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbSelect(sql, function(err, data) {
        if (err == null && data.length>0) {
            var resultData = JSON.parse(data[0].postData);
            resultData["facilityTypeName"] = data[0].facilityTypeName;
            resultData["pipelineTypeName"] = data[0].pipelineTypeName;
            resultData["facilityStatusName"] = data[0].facilityStatusName;
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
 * 设备列表查询
 * @param {string} facilityTypeCode 设备类型编号
 * @param {string} pipelineTypeCode 管网类型编号
 * @param {string} queryParam 查询条件
 * @param {function} callBack 回调函数
 */
function queryOfflineFacilityList(facilityTypeCode, pipelineTypeCode, queryParam, callBack) {
    var result = {
        success: "",
        msg: "",
        data: ""
    };
    var facilityTypeCodeSql = "";
    if (facilityTypeCode != null && facilityTypeCode != "") {
        facilityTypeCodeSql = " and facilityTypeCode ='" + facilityTypeCode+"'";
    }
    var pipelineTypeCodeSql = "";
    if (pipelineTypeCode != null && pipelineTypeCode != "") {
        pipelineTypeCodeSql = " and pipelineTypeCode='" + pipelineTypeCode+"'";
    }

    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));

    var sql = "";
    if (queryParam != null && queryParam != "") {
        sql = "select p.*, (select domainValue from domain_table where domainCode=p.facilityTypeCode) as facilityTypeName,(select domainValue from domain_table where domainCode=p.pipelineTypeCode) as pipelineTypeName,";
        sql += "(select domainValue from domain_table where domainCode=p.facilityStatusCode) as facilityStatusName from plf_facility p where createUserId ='" + userBo.objectId + "' and enterpriseId='" + userBo.enterpriseId + "'";
        sql += " and (facilityName like '%" + queryParam + "%' or facilityCode like '%" + queryParam + "%' or address like '%" + queryParam + "%')";
    } else {
        sql = "select p.*, (select domainValue from domain_table where domainCode=p.facilityTypeCode) as facilityTypeName,(select domainValue from domain_table where domainCode=p.pipelineTypeCode) as pipelineTypeName,";
        sql += "(select domainValue from domain_table where domainCode=p.facilityStatusCode) as facilityStatusName from plf_facility p where createUserId ='" + userBo.objectId + "' and enterpriseId='" + userBo.enterpriseId + "'";
    }
    sql += facilityTypeCodeSql + pipelineTypeCodeSql + " order by createTime desc";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbSelect(sql, function(err, data) {
        if (err == null) {
            var resultArray = new Array();
            for (var i = 0; i < data.length; i++) {
                var resultData = JSON.parse(data[i].postData);
                resultData["facilityTypeName"] = data[i].facilityTypeName;
                resultData["pipelineTypeName"] = data[i].pipelineTypeName;
                resultData["facilityStatusName"] = data[i].facilityStatusName;
                resultArray.push(resultData);
            }
            result.success = 1;
            result.msg = "查询成功";
            result.data = resultArray;
        } else {
            result.success = 0;
            result.msg = "查询失败";
        }
        callBack(result);
    });
}