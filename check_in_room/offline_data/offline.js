/*
 * 保存离线数据(入户安检记录) 多条
 *
 */
function saveOfflineEhscRecordDatas(arrayData, callback) {
    var result = {
        success : "",
        msg : "",
        localid : ""
    };
    var sql = "insert into ehscRecord (localId,objectId,planId,postData,userId,userName,enterpriseId,enterhomeAddress,enterhomeUserName,securityCheckTime,state,groupId)";
    for (var i = 0; i < arrayData.length; i++) {
        var obj = arrayData[i];

        var sqlparams = " select '" + obj.localId + "','" + obj.objectId + "','" + obj.planId + "','" + obj.postData + "','" + obj.userId + "','" + obj.userName + "',";
        sqlparams += "'" + obj.enterpriseId + "','" + obj.enterhomeAddress + "','" + obj.enterhomeUserName + "','" + obj.securityCheckTime + "'," + obj.state+",'"+obj.groupId+"'";
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
            result.msg = "本地保存成功";
            result.localid = "";
        } else {
            result.success = -1;
            result.msg = "本地保存成失败";
            result.localid = "";
        }
        callback(result);
    });
}

/***
 * 查询入户记录详情信息
 */
function selectOfflineEhscRecordData(objectId, callback) {
    var result = {
        success : "",
        msg : "",
        data : ""
    };
    var sql = "select * from ehscRecord where objectId='" + objectId + "';";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbSelect(sql, function(err, data) {
        if (err == null) {
            if (data.length > 0) {
                var resultData = JSON.parse(data[0].postData);
                resultData["createUserName"] = data[0].userName;
                result.success = 1;
                result.msg = "入户详情查询成功";
                result.data = resultData;
            } else {
                result.success = 1;
                result.msg = "入户详情查询成功";
                result.data = null;
            }
        } else {
            result.success = -1;
            result.msg = "入户详情查询失败";
            result.data = "";
        }
        callback(result);
    });
}

/***
 * 保存离线数据(入户安检记录) 单条
 */
function saveOfflineEhscRecordData(objData, callback) {
    var objectId = objData.objectId;
    var sql = "select count(*) as num from ehscRecord where objectId ='" + objectId + "';";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbSelect(sql, function(err, data) {
        if (err == null) {
            if (data[0].num > 0) {
                updateOfflineEhscRecordData(objData, callback);
            } else {
                var tep = new Array();
                tep.push(objData);
                saveOfflineEhscRecordDatas(tep, callback);
            }
        }
    });
}

/**
 *  本地入户安检记录删除
 */
function deleteOfflineEhscRecordData(objectId, callback) {
    var result = {
        success : "",
        msg : "",
        localid : ""
    };
    var sql = "delete from ehscRecord where objectId ='" + objectId + "';";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql, function(err, data) {
        if (err == null && data == 0) {
            result.success = 1;
            result.msg = "入户安检记录删除成功";
            result.localid = "";
        } else {
            result.success = -1;
            result.msg = "入户安检记录删除失败";
            result.localid = "";
        }
        callback(result);
    });
}

/***
 * 根据记录ID更新入户安检记录
 */
function updateOfflineEhscRecordData(objData, callback) {
    var result = {
        success : "",
        msg : "",
        localid : ""
    };
    var sql = "update ehscRecord set postData='" + objData.postData + "',userId='" + objData.userId + "',enterpriseId='" + objData.enterpriseId + "',enterhomeAddress='" + objData.enterhomeAddress + "',";
    sql += "enterhomeUserName='" + objData.enterhomeUserName + "',securityCheckTime='" + objData.securityCheckTime + "',userName='" + objData.userName + "',planId='" + objData.planId + "',groupId='"+objData.groupId+"' where objectId='" + objData.objectId + "'";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql, function(err, data) {
        if (err == null && data == 0) {
            result.success = 1;
            result.msg = "本地更改成功";
            result.localid = "";
        } else {
            result.success = -1;
            result.msg = "本地更改成失败";
            result.localid = "";
        }
        callback(result);
    });
}

/***
 * 根据入户安检id更新记录状态
 */
function updateOfflineEhscRecordState(objectId, state, callback) {
    var result = {
        success : "",
        msg : "",
        localid : ""
    };
    var sql = "update ehscRecord set state=" + state + " where objectId='" + objectId + "'";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql, function(err, data) {
        if (err == null && data == 0) {
            result.success = 1;
            result.msg = "状态更改成功";
            result.localid = "";
        } else {
            result.success = -1;
            result.msg = "状态更改成失败";
            result.localid = "";
        }
        callback(result);
    });
}

/***
 * 入户安检记录附件保存
 * @param {Object} arrayData
 * @param {Object} callback
 *
 */
function saveOfflineEhscRecordAttaData(arrayData, recordId, callback) {
    var result = {
        success : "",
        msg : "",
        localid : ""
    };
    var sqldelete = "delete from ehscRecord_attachment where recordId='" + recordId + "';";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sqldelete, function(err, data) {
        if (arrayData != null && arrayData != "" && arrayData.length > 0) {
            if (err == null && data == 0) {
                var sql = "insert into ehscRecord_attachment (localId,recordId,attaType,postData)";
                for (var i = 0; i < arrayData.length; i++) {
                    var obj = arrayData[i];
                    var sqlparams = " select '" + obj.localId + "','" + obj.recordId + "','" + obj.attaType + "','" + obj.postData + "'";
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
                        result.msg = "本地保存成功";
                        result.localid = "";
                    } else {
                        result.success = -1;
                        result.msg = "本地保存成失败";
                        result.localid = "";
                    }
                    callback(result);
                });
            }
        } else {
            result.success = 1;
            result.msg = "本地保存成功";
            result.localid = "";
            callback(result);
        }
    });
}

/**
 * 根据入户安检ID查询附件详情
 */
function selectOfflineEhscRecordAttaData(recordId, callback) {
    var result = {
        success : "",
        msg : "",
        data : ""
    };
    var sql = "select * from ehscRecord_attachment where recordId ='" + recordId + "';";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbSelect(sql, function(err, data) {
        if (err == null) {
            var resultData = new Array();
            for (var i = 0; i < data.length; i++) {
                appcan.logs(JSON.stringify(data[i]));
            }
            result.success = 1;
            result.msg = "附件信息查询成功";
            result.data = data;
        } else {
            result.success = -1;
            result.msg = "附件信息查询失败";
            result.data = "";
        }
        callback(result);
    });
}

/***
 * 根据入户安检记录id删除附件信息
 */
function deleteOfflineEhscRecordAttaData(recordId, callback) {
    var result = {
        success : "",
        msg : "",
        localid : ""
    };
    var sql = "delete from ehscRecord_attachment where recordId ='" + recordId + "';";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql, function(err, data) {
        if (err == null && data == 0) {
            result.success = 1;
            result.msg = "入户安检记录附件删除成功";
            result.localid = "";
        } else {
            result.success = -1;
            result.msg = "入户安检记录附件删除失败";
            result.localid = "";
        }
        callback(result);
    });
}

function deleteAttaData(recordId, callback, attaPath) {
    var result = {
        success : "",
        msg : "",
        localid : ""
    };
    var sql = "delete from ehscRecord_attachment where recordId ='" + recordId + "';";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql, function(err, data) {
        if (err == null && data == 0) {
            result.success = 1;
            result.msg = "入户安检记录附件删除成功";
            result.localid = "";
        } else {
            result.success = -1;
            result.msg = "入户安检记录附件删除失败";
            result.localid = "";
        }
        callback(result);
    });
}

/***
 * 根据附件id删除附件信息
 */
function deleteOfflineEhscRecordAttaDataById(localId, callback) {
    var result = {
        success : "",
        msg : "",
        localid : ""
    };
    var sql = "delete from ehscRecord_attachment where localId ='" + localId + "';";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql, function(err, data) {
        if (err == null && data == 0) {
            result.success = 1;
            result.msg = "入户安检记录附件删除成功";
            result.localid = "";
        } else {
            result.success = -1;
            result.msg = "入户安检记录附件删除失败";
            result.localid = "";
        }
        callback(result);
    });
}

/***
 * 获取本地入户安检记录总数
 * @param {Object} planId
 * @param {function} callback
 */
function getAllOfflineEhscRecordNum(planId,callback) {
    var result = {
        success : "",
        msg : "",
        num : ""
    }
    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    var sql = "select count(*) as num from ehscRecord where userId='" + userBo.objectId + "' and enterpriseId ='" + userBo.enterpriseId + "' and planId='"+planId+"';";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbSelect(sql, function(err, data) {
        if (err == null) {
            result.success = 1;
            result.msg = "成功";
            result.num = data[0].num;
        } else {
            result.success = -1;
            result.msg = "失败";
            result.num = "-1";
        }
        callback(result);
    });
}

/***
 * 查询入户地址是否重复
 * @param {Object} objectId
 * @param {Object} planId
 * @param {Object} enterhomeAddress
 * @param {function} callback
 */
function isExistEnterhomeAddress(objectId, planId, enterhomeAddress, callback) {
    var result = {
        success : "",
        msg : "",
        isExist : false
    };
    var sql = "select count(*) as num from ehscRecord where enterhomeAddress='" + enterhomeAddress + "' and planId ='" + planId + "' and objectId<>'" + objectId + "' and state=1;";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbSelect(sql, function(err, data) {
        if (err == null) {
            if (data[0].num > 0) {
                result.success = 1;
                result.msg = "成功";
                result.isExist = true;
            } else {
                result.success = "1";
                result.msg = "成功";
                result.isExist = false;
            }
        } else {
            result.success = -1;
            result.msg = "失败";
            result.isExist = true;
        }
        callback(result);
    });
}

/***
 * 根据入户安检记录Id获取详情
 * @param {Object} objectId
 * @param {Object} callback
 */
function selectEhscRecordInfo(objectId, callback) {
    try {
        var obj = null;
        selectOfflineEhscRecordData(objectId, function(result) {
            if (result.success == 1) {
                if (result.data != null && result.data != "") {
                    obj = result.data;
                    var resultData = {
                        success : 1,
                        msg : "查询成功",
                        data : obj
                    };
                    callback(resultData);
                } else {
                    callback(result);
                }
            } else {
                callback(result);
            }
        });
    } catch(e) {
        alert(e);
    }
}

function queryEhscRecordList(state, planId,queryParam, callback) {
    var result = {
        success : "",
        msg : "",
        data : ""
    };
    var sql = "";
    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    var enterpriseId = userBo.enterpriseId;
    var userId = userBo.objectId;
    if (queryParam != null && queryParam != "") {
        sql = "select * from ehscRecord where state = " + state + " and userId = '" + userId + "' and enterpriseId ='" + enterpriseId + "' and planId ='"+planId+"' and (enterhomeAddress like '%" + queryParam + "%' or enterhomeUserName like '%" + queryParam + "%') order by securityCheckTime desc;";
    } else {
        sql = "select * from ehscRecord where state = " + state + " and userId = '" + userId + "' and enterpriseId ='" + enterpriseId + "' and planId ='"+planId+"' order by securityCheckTime desc;";
    }
    var dbOperation = new DataBaseOperation();
    dbOperation.dbSelect(sql, function(err, data) {
        if (err == null) {
            var resultData = new Array();
            for (var i = 0; i < data.length; i++) {
                var resultObj = JSON.parse(data[i].postData);
                resultObj["createUserName"] = data[i].userName;
                resultData.push(resultObj);
            }
            result.success = 1;
            result.msg = "查询成功";
            result.data = resultData;
        } else {
            result.success = -1;
            result.msg = "查询失败";
            result.data = "";
        }
        callback(result);
    });
}

var num = 0;
var deleteIds = new Array();
/***
 * 删除入户安检记录及其他的信息
 * @param {Array} objects
 * @param {function} callback
 */
function deleteEhscRecordByIds(objectIds, callback) {
    deleteIds = deleteIds.concat(objectIds);
    deleteEhscRecord(deleteIds[num], callback);
}

function deleteEhscRecord(objectId, callback) {
    var resultData = {
        success : "",
        msg : "",
        data : ""
    };
    deleteOfflineEhscRecordData(objectId, function(result) {
        if (result.success == 1) {
            num++;
            if (num < deleteIds.length) {
                deleteEhscRecord(deleteIds[num], callback);
            } else {
                resultData.success = 1;
                resultData.msg = "删除成功";
                resultData.data = resultData;
                num = 0;
                deleteIds = new Array();
                callback(resultData);
            }
        } else {
            resultData.success = -1;
            resultData.msg = "删除失败";
            resultData.data = resultData;
            num = 0;
            deleteIds = new Array();
            callback(resultData);
        }
    });
}

/***
 * 入户安检信息保存
 * @param {Object} objectData
 * @param {Object} callback
 */
function saveOfflineData(objectData, callback) {
    //delete formArry.parentTypeId;
    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    var businessId = objectData.objectId;

    var ehscRecordData = {
        localId : new Date().Format("yyyyMMddHHmmssS"),
        objectId : businessId,
        postData : JSON.stringify(objectData),
        userId : userBo.objectId,
        userName : userBo.userName,
        enterpriseId : userBo.enterpriseId,
        enterhomeAddress : objectData.enterhomeAddress || "",
        enterhomeUserName : objectData.enterhomeUserName || "",
        securityCheckTime : objectData.securityCheckTime || "",
        planId : objectData.planId || "",
        state : objectData.state || 0,
        groupId:objectData.groupId
    }
    mysaveData(ehscRecordData, callback);
}

/***
 * 开始保存数据
 * @param {Object} ehscRecordData 安检记录
 * @param {function} callback 回调函数
 */
function mysaveData(ehscRecordData, callback) {
    var resultData = {
        success : "",
        msg : "",
        data : ""
    };
    var businessId = ehscRecordData.objectId;
    saveOfflineEhscRecordData(ehscRecordData, function(result) {
        if (result.success == "1") {
            resultData.success = 1;
            resultData.msg = "保存成功";
            callback(resultData);
        } else {
            resultData.success = -1;
            resultData.msg = "保存失败";
            callback(resultData);
        }
    });
}
/***
 * 获取该企业下离线保存数据的用户档案ID 
 * @param {Object} callback
 */
function queryOfflineGroupId(planId,callback){
    var resultData = {
        success : "",
        msg : "",
        data : ""
    };
    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    var enterpriseId = userBo.enterpriseId;
    var userId = userBo.objectId;
    var sql = "select distinct groupId from ehscRecord where planId='"+planId+"' and enterpriseId='"+enterpriseId+"' and userId='"+userId+"'";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbSelect(sql, function(err, data) {
        if (err == null) {
            resultData.success = 1;
            resultData.msg = "查询成功";
            resultData.data = data;
        } else {
            resultData.success = -1;
            resultData.msg = "查询失败";
            resultData.data = "";
        }
        callback(resultData);
    });
}
