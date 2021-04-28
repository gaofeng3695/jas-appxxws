var localServer = {
    num : 0,
    deleteIds : [],
    save : function(objData, state, callback) {
        objData.state = state;
        this.saveOfflineMaintenanceData(objData, callback);
    },
    get : function(sObjectId, callback) {
        if ( sObjectId instanceof Array) {
            this.selectOfflineMaintenanceDataByIds(sObjectId, callback);
        } else {
            this.selectOfflineMaintenanceData(sObjectId, callback);
        }
    },
    queryList : function(sKeyword, nState, callback) {//query
        var query = {
            keyword : sKeyword,
            state : nState
        };
        this.queryMaintenanceList(query, callback);
    },
    delete : function(sObjectId, callback) {
        if ( sObjectId instanceof Array) {
            this.deleteMaintanceByIds(sObjectId, callback);
        } else {
            this.deleteOfflineMaintenanceData(sObjectId, callback);
        }

    },
    /*
     * 保存离线数据(入户安检记录) 多条
     *
     */
    saveOfflineMaintenanceDatas : function(arrayData, callback) {
        var result = {
            success : "",
            msg : "",
            workId : ""
        };
        var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
        var enterpriseId = userBo.enterpriseId;
        var userId = userBo.objectId;
        var userName = userBo.userName;
        var sql = "insert into maintenance (workId,objectId,maintenanceData,userId,userName,enterpriseId,originTypeCode,remediationTime,address,reason,createUserName,relationshipPersonNames,state)";
        for (var i = 0; i < arrayData.length; i++) {
            var obj = arrayData[i];
            var maintenanceData = JSON.stringify(obj);
            var sqlparams = " select '" + obj.workId + "','" + obj.objectId + "','" + maintenanceData + "','" + userId + "','" + userName + "','" + enterpriseId + "','" + obj.originTypeCode + "',";
            sqlparams += "'" + obj.remediationTime + "','" + obj.address + "','" + obj.reason + "','" + userName + "','" + obj.relationshipPersonNames + "'," + obj.state + " ";
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
                result.workId = "";
            } else {
                result.success = -1;
                result.msg = "本地保存成失败";
                result.workId = "";
            }
            callback(result);
        });
    },

    /***
     * 保存离线数据单条，如果是已经存在的进行更新，不然进行存储
     */
    saveOfflineMaintenanceData : function(objData, callback) {
        var that = this;
        var workId = objData.workId;
        var sql = "select count(*) as num from maintenance where workId ='" + workId + "';";
        var dbOperation = new DataBaseOperation();
        dbOperation.dbSelect(sql, function(err, data) {
            if (err == null) {
                if (data[0].num > 0) {
                    that.updateOfflineMaintenanceData(objData, callback);
                } else {
                    var tep = new Array();
                    tep.push(objData);
                    that.saveOfflineMaintenanceDatas(tep, callback);
                }
            }
        });
    },

    /***
     * 根据记录ID更新  workId,objectId,maintenanceInfo,maintenanceCost,userId,userName,enterpriseId,originTypeCode,state
     */
    updateOfflineMaintenanceData : function(objData, callback) {
        var result = {
            success : "",
            msg : "",
            localid : ""
        };
        var maintenanceData = JSON.stringify(objData);
        var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
        var enterpriseId = userBo.enterpriseId;
        var userId = userBo.objectId;
        var userName = userBo.userName;
        var sql = "update maintenance set maintenanceData='" + maintenanceData + "',userId='" + userId + "',enterpriseId='" + enterpriseId + "',userName='" + userName + "',";
        sql += "reason='" + objData.reason + "',createUserName='" + userName + "',relationshipPersonNames='" + objData.relationshipPersonNames + "',";
        sql += "originTypeCode='" + objData.originTypeCode + "',state='" + objData.state + "',remediationTime='" + objData.remediationTime + "',address='" + objData.address + "',objectId='" + objData.objectId + "' where workId='" + objData.workId + "'";
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
    },

    /***
     * 根据工单 查询离线数据 所有的数据
     */
    selectOfflineMaintenanceData : function(objectId, callback) {
        var result = {
            success : "",
            msg : "",
            data : []
        };
        var sql = "select * from maintenance where workId='" + objectId + "';";
        var dbOperation = new DataBaseOperation();
        dbOperation.dbSelect(sql, function(err, data) {
            if (err == null) {
                if (data.length > 0) {
                    var resultData = new Array();
                    resultData = JSON.parse(data[0].maintenanceData);
                    result.success = 1;
                    result.msg = "维修维护工单详情查询成功";
                    result.data = resultData;
                } else {
                    result.success = 1;
                    result.msg = "没有查到记录";
                    result.data = [];
                }
            } else {
                result.success = -1;
                result.msg = "维修维护工单详情查询失败";
                result.data = "";
            }
            callback(result);
        });
    },
    /*
     *根据工单数组 查询离线数据 所有的数据
     * */
    selectOfflineMaintenanceDataByIds : function(ids, callback) {
        var result = {
            success : "",
            msg : "",
            data : []
        };
        var sql = "select * from maintenance where 1=1  and workId in (";
        if (ids.length > 0) {
            for (var i = 0; i < ids.length; i++) {
                sql += "'" + ids[i] + "',";
                if (i == ids.length - 1) {
                    sql += "'" + ids[i] + "');";
                }
            }
        }
        var dbOperation = new DataBaseOperation();
        dbOperation.dbSelect(sql, function(err, data) {
            if (err == null) {
                if (data.length > 0) {
                    var resultData = new Array();
                    data.forEach(function(item) {
                        resultData.push(JSON.parse(item.maintenanceData))
                    });
                    result.success = 1;
                    result.msg = "维修维护工单查询成功";
                    result.data = resultData;
                } else {
                    result.success = 1;
                    result.msg = "没有查到记录";
                    result.data = [];
                }
            } else {
                result.success = -1;
                result.msg = "维修维护工单查询失败";
                result.data = "";
            }
            callback(result);
        });
    },
    queryMaintenanceList : function(queryParam, callback) {
        var result = {
            success : "",
            msg : "",
            data : ""
        };
        var sql = "select * from maintenance where 1=1 and state= " + queryParam.state + " ";
        var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
        var enterpriseId = userBo.enterpriseId;
        var userId = userBo.objectId;
        if (queryParam.originTypeCode != "" && queryParam.originTypeCode != null) {
            sql += " and originTypeCode='" + queryParam.originTypeCode + "'";
        }
        if (queryParam.startDate != null && queryParam.startDate != "" && queryParam.endDate != null && queryParam.endDate != "") {
            sql += "and remediationTime > '" + queryParam.startDate + "' and remediationTime< '" + queryParam.endDate + "'";
        }
        if (queryParam.keyword != "" && queryParam.keyword != null) {
            sql += "and (remediationTime like '%" + queryParam.keyword + "%' or address like '%" + queryParam.keyword + "%' or reason like '%" + queryParam.keyword + "%' or createUserName like '%" + queryParam.keyword + "%' or relationshipPersonNames like '%" + queryParam.keyword + "%') ";
        }
        sql += " and userId = '" + userId + "' and enterpriseId ='" + enterpriseId + "' order by remediationTime desc ;";
        var dbOperation = new DataBaseOperation();
        dbOperation.dbSelect(sql, function(err, data) {
            if (err == null) {
                var resultData = new Array();
                for (var i = 0; i < data.length; i++) {
                    var resultObj = JSON.parse(data[i].maintenanceData);
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
    },
    /**
     *  本地记录删除  根据记录Id
     */
    deleteOfflineMaintenanceData : function(objectId, callback) {
        var result = {
            success : "",
            msg : "",
            workId : ""
        };
        var sql = "delete from maintenance where workId ='" + objectId + "';";

        var dbOperation = new DataBaseOperation();
        dbOperation.dbExec(sql, function(err, data) {
            if (err == null && data == 0) {
                result.success = 1;
                result.msg = "维修维护删除成功";
                result.workId = "";
            } else {
                result.success = -1;
                result.msg = "维修维护删除失败";
                result.workId = "";
            }
            callback(result);
        });
    },

    /***
     * 根据id更新记录状态 是草稿箱还是未上传
     */
    updateOfflineMaintenanceState : function(objectId, state, callback) {
        var result = {
            success : "",
            msg : "",
            workId : ""
        };
        var sql = "update maintenance set state=" + state + " where workId='" + objectId + "'";
        var dbOperation = new DataBaseOperation();
        dbOperation.dbExec(sql, function(err, data) {
            if (err == null && data == 0) {
                result.success = 1;
                result.msg = "状态更改成功";
                result.workId = "";
            } else {
                result.success = -1;
                result.msg = "状态更改成失败";
                result.workId = "";
            }
            callback(result);
        });
    },
    /***
     * 批量删除
     * @param {Array} objects
     * @param {function} callback
     */
    deleteMaintanceByIds : function(objectIds, callback) {
        this.deleteIds = this.deleteIds.concat(objectIds);
        this.deleteMaintance(this.deleteIds[this.num], callback);
    },
    deleteMaintance : function(objectId, callback) {
        var that = this;
        var resultData = {
            success : "",
            msg : "",
            data : ""
        };
        that.deleteOfflineMaintenanceData(objectId, function(result) {
            if (result.success == 1) {
                that.num++;
                if (that.num < that.deleteIds.length) {
                    that.deleteMaintance(that.deleteIds[that.num], callback);
                } else {
                    resultData.success = 1;
                    resultData.msg = "删除成功";
                    resultData.data = resultData;
                    that.num = 0;
                    that.deleteIds = new Array();
                    callback(resultData);
                }
            } else {
                resultData.success = -1;
                resultData.msg = "删除失败";
                resultData.data = resultData;
                that.num = 0;
                that.deleteIds = new Array();
                callback(resultData);
            }
        });
    },
    /***
     * 获取本地记录总数
     * @param {Object} planId
     * @param {function} callback
     */
    getAllRecord: function(callback) {
        var result = {
            success : "",
            msg : "",
            num : "",
            rows:[],
        }
        var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
        var sql = "select workId,state from maintenance where userId='" + userBo.objectId + "' and enterpriseId ='" + userBo.enterpriseId + "';";
        var dbOperation = new DataBaseOperation();
        dbOperation.dbSelect(sql, function(err, data) {
            if (err == null) {
                result.success = 1;
                result.msg = "成功";
                result.num = data.length;
                result.rows=data;
            } else {
                result.success = -1;
                result.msg = "失败";
                result.num = "-1";
                result.rows=[];
            }
            callback(result);
        });
    }
};

/* data数据：和服务器上传数据一致 需要将所有的字段进行传入
* state:1(未上传)  0(草稿箱)
*/
// function saveOfflineData() {
// var data = {
// "objectId" : 'cf22a856-e1f9-42d3-8f2a-5492f47b50e4', //维修维护工单id
// "workId" : "3333333", // 维修工单整改记录id
// "originTypeName" : "管网设施", //来源类型（maintenance_orgin）MO_01（入户整改）、MO_02（管道设施）、MO_03（巡检事件）、MO_99（其他维修）
// "originTypeCode" : "MO_02", //来源类型（maintenance_orgin）MO_01（入户整改）、MO_02（管道设施）、MO_03（巡检事件）、MO_99（其他维修）
// "createUserName" : "代旋", //创建人
// "typeCode" : "FT_03", //设施类型（管道设施）、事件类型（日常巡检）
// "typeName" : "阀门", //设施类型（管道设施）、事件类型（日常巡检）
// "maintenanceName" : "李四", //用户名称（入户整改）、设施名称（管道设施）、事件编号（巡检事件）、联系人（其他维修）
// "maintenanceCode" : "20170904", //维修维护编码   日期自动生成的
// "contactPhone" : "15029207550", //联系方式（入户整改）、联系电话（其他维修）
// "address" : "海淀区学院路科大天工大厦A座13层", // 用户地址（入户整改）、设施位置（管道设施）、事件地点（巡检事件）、地址（其他维修）
// "relationshipPersonNames" : "王五,赵平", //维修人名称
// "relationshipPersonIds" : "1111,2222", //维修人
// "remediationTime" : "2017-09-09", // 维修期限
// "maintenanceRecordTime" : "2017-09-09", // 维修（完成）时间
// "status" : 1, // 维修状态（1：待维修，2：已完成）默认值 1
// "reason" : "软管老化：接口漏气;色是叔叔婶婶所所", // 维修原因
//
// "workRecordCost" : [// 维修费用
// {
// "name" : "软管",
// "price" : 1,
// "amount" : 100
// }, {
// "name" : "胶带",
// "price" : 5,
// "amount" : 45
// }, {
// "name" : "接头",
// "price" : 7,
// "amount" : 56
// }],
// "totalCost" : 62.00,
// "captialTotalCost" : "陆拾贰元整", //大写费用总额
// "content" : "换了老化的胶管",
// "satisfaction" : "5",
// "pic" : [],
// "signature" : [],
// "state" : 1
// };
// localService.save(data, function(result) {
// if (result.success == "1") {
// baseOperation.alertToast("保存成功", 2000);
// }
// });
// }

/*
* 根据记录Id查询 维修记录的详情
*/
// function selectOfflineData() {
// var objectId = 'cf22a856-e1f9-42d3-8f2a-5492f47b50e4';
// localService.get(objectId, function(result) {
// if (result.success == "1") {
// baseOperation.alertToast("查询成功", 2000);
// }
// });
// }
/*
* 根据记录Id进行数据的删除，此处以数组的形式入参
*/
// function deleteOfflineData() {
// var objectIds = ['45f2fd1e-637f-41f5-8690-35f8cae94d9a', '45f2fd1e-637f-41f5-8690-35f8cae94d9'];
// localService.delete(objectIds, function(result) {
// if (result.success == "1") {
// baseOperation.alertToast("删除成功", 2000);
// }
// });
// }
/*
* 根据查询条件 进行列表的展示
*/
// function selectOfflineDataList() {
// var query = {
// originTypeCode : "",
// state : '1',
// keywork : "",
// startDate : "2017-09-02",
// endDate : "2017-09-13",
// };
// localService.queryList(query, function(result) {
// alert(JSON.stringify(result));
// if (result.success == "1") {
// baseOperation.alertToast("保存成功", 2000);
// }
// });
// }