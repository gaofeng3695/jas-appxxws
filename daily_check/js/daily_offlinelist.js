var jasHttpRequest = null;
var dbOperation = null;
var bindData = [];
var titleModel = "<div class='myListViewTitle'>{0}<br/>{1}</div>";
var subTitleModel = "<div class='myListViewSubTitle'><span>{0}</span><br/><span>{1}</span></div>";
//定义listview对象
var objectId = "";
var lv = appcan.listview({
    selector : "#offlienList",
    type : "thinLine",
    hasIcon : false, //是否图片
    hasAngle : false, //是否箭头
    hasSubTitle : false,
    myList : false,
    hasRadiobox : true,
    hasSubTitle : true,
    multiLine : 4
});
/**
 * listview单选事件
 */
lv.on("radio:change", function(obj, data) {
    objectId = data.recordID;
});

lv.on("click", function(obj, data) {
    objectId = data.recordID;
});

appcan.ready(function() {
    dbOperation = new DataBaseOperation();
    jasHttpRequest = new JasHttpRequest();
    initData();
});
/**
 * 初始化页面数据
 */
function initData() {
    baseOperation.londingToast("数据加载中，请稍候...");
    var tempData = [];
    var sql = "select * from InsRecord where flag = 0;"
    dbOperation.dbSelect(sql, function(err, data) {
        baseOperation.closeToast();
        try{
            if (err == null && data.length > 0) {
                var beginTime =  "";
                var endTime = "";
                var distance = "";
                var wholeTime = "";
                for (var i = 0; i < data.length; i++) {
                    var _item = {
                        title : "",
                        subTitle : "",
                        recordID : ""
                    };
                    _item.recordID = data[i].recordID;
                    var postData = JSON.parse(data[i].postdata);
                    
                    beginTime =  postData.beginTime;
                    endTime = postData.endTime;
                    distance = postData.distance;
                    wholeTime = postData.wholeTime;
                    
                    _item.title = titleModel;
                    if(beginTime != undefined && beginTime != null && beginTime!=""){
                        _item.title = _item.title.replace("{0}", "开始时间：" + (new Date(postData.beginTime)).Format("yyyy-MM-dd HH:mm:ss"));
                    }else{
                        _item.title = _item.title.replace("{0}", "开始时间：--");
                    }
                    if(endTime != undefined && endTime != null && endTime !=""){
                        _item.title = _item.title.replace("{1}", "结束时间：" + (new Date(postData.endTime)).Format("yyyy-MM-dd HH:mm:ss"));
                    }else{
                        _item.title = _item.title.replace("{1}", "结束时间：--");
                    }
                    _item.subTitle = subTitleModel;
                    if(distance != undefined && distance != null && distance != ""){
                        _item.subTitle = _item.subTitle.replace("{0}", "巡检里程：" + distance + "m");
                    }else{
                        _item.subTitle = _item.subTitle.replace("{0}", "巡检里程：--");
                    }
                    if(wholeTime != undefined && wholeTime != null && wholeTime !=""){
                        _item.subTitle = _item.subTitle.replace("{1}", "巡检时长：" + wholeTime);
                    }else{
                        _item.subTitle = _item.subTitle.replace("{1}", "巡检时长：--");
                    }
                    tempData.push(_item);
                }
                bindData = bindData.concat(tempData);
                lv.set(bindData);
            }
            else if(err == null && data.length == 0){
                lv.set(bindData);
                appcan.window.confirm({
                    title : '提示',
                    content : '您好，离线数据已处理完成，是否进入【日常巡检】？',
                    buttons : ['确定', '取消'],
                    callback : function(err, data, dataType, optId) {
                        if (err || data === 1) {
                            
                            return;
                        }
                        if (data === 0) {
                            //确定操作
                            appcan.window.evaluateScript("daily_offlinelist", "currentPageClose()");
                        }
                    }
                });
            }
        }catch(e){
            alert(e);
        }
    });
}

/***
 * 删除巡检记录
 */
function deleteOfflineData() {
    if (objectId != "") {
        appcan.window.confirm({
            title : '提示',
            content : '您好，是否确认删除？',
            buttons : ['确定', '取消'],
            callback : function(err, data, dataType, optId) {
                if (err || data === 1) {
                    //如果出错了
                    appcan.window.evaluateScript("daily_offlinelist", "changeButtonStatus()");
                    return;
                }
                if (data === 0) {
                    //删除操作
                    delInsRecordOffline(objectId);
                }
            }
        });
    } else {
        baseOperation.alertToast("请选择一条记录...");
        appcan.window.evaluateScript("daily_offlinelist", "changeButtonStatus()");
    }
}

/**
 * 提交巡检记录
 */
function submitOfflineData() {
    if (objectId != "") {
        appcan.window.confirm({
            title : '提示',
            content : '您好，是否确认提交数据？',
            buttons : ['确定', '取消'],
            callback : function(err, data, dataType, optId) {
                if (err || data === 1) {
                    //如果出错了
                    appcan.window.evaluateScript("daily_offlinelist", "changeButtonStatus()");
                    return;
                }
                if (data === 0) {
                    //提交操作
                    referInsRecordOfflineData(objectId);
                }
            }
        });
    } else {
        baseOperation.alertToast("请选择一条记录...");
    }
}

function refreshList(){
    baseOperation.closeToast();
    bindData=[];
    objectId="";
    initData();
}

/*
 * 提交本地数据-巡检记录离线数据
 */
function referInsRecordOfflineData(_recordId)
{
    baseOperation.alertToast('数据提交中，请稍候...',10000);
    var sql = "select * from InsRecord where flag = 0 and recordID = '" + _recordId + "';";
    dbOperation.dbSelect(sql, function(err, data) {
        if (err == null && data.length == 1) {
            var recordObj = data[0];
            var _postdata = JSON.parse(recordObj.postdata);
            _postdata.flag = 1;
            jasHttpRequest.jasHttpPost(recordObj.partURL, function(id, state, dbSource) {
                if (dbSource.length == 0) {
                    baseOperation.alertToast('网络异常，提交失败，请重试...');
                    return;
                }
                var dbObj = JSON.parse(dbSource);
                if (dbObj.success == 1) {
                    var sql2 = "update InsRecord set flag = 1 where recordID = '" + _recordId + "';";
                    dbOperation.dbExec(sql2, function(err2, data2) {
                        referInsTrajectoryOfflineData(_recordId);
                    });
                }
            }, JSON.stringify(_postdata));
        }
    });
}

/*
 * 提交本地数据-巡检轨迹离线数据
 */
function referInsTrajectoryOfflineData(_recordId){
    var sql1 = "select * from InsTrajectory where flag = 0 and recordID = '" + _recordId + "';";
    var partURL1 = "cloudlink-inspection-trajectory/trajectory/saveBatch";
    dbOperation.dbSelect(sql1, function(err, data) {
        if (err == null && data.length > 0) {
            var postData = [];
            var localIDs = "";
            for (var i = 0; i < data.length; i++) {
                var item = JSON.parse(data[i].postdata);
                postData.push(item);
                localIDs += "'" + data[i].localID + "',";
            }
            localIDs = localIDs.substring(0, localIDs.length - 1);
            jasHttpRequest.jasHttpPost(partURL1, function(id, state, dbSource) {
                if (dbSource.length == 0) {
                    baseOperation.alertToast('网络异常，提交失败，请重试...');
                    return;
                }
                var dbObj = JSON.parse(dbSource);
                if (dbObj.success == 1) {
                    var sql2 = "update InsTrajectory set flag = 1 where recordID = '" + _recordId + "' and localID in (" + localIDs + ");";
                    dbOperation.dbExec(sql2, function(err2, data2) {
                        baseOperation.alertToast('数据提交成功');
                        refreshList();
                        appcan.window.evaluateScript("daily_offlinelist", "changeButtonStatus()");
                    });
                }
            }, JSON.stringify(postData));
        }
        else{
            baseOperation.alertToast('数据提交成功');
            refreshList();
            appcan.window.evaluateScript("daily_offlinelist", "changeButtonStatus()");
        }
    });
}

/*
 * 删除本地数据-删除巡检轨迹离线数据
 */
function delInsRecordOffline(_recordId){
    baseOperation.londingToast("正在删除记录，请稍后...");
    var partURL1 = 'cloudlink-inspection-event/inspectionRecord/delete';
        var dataObj = {
            "objectId": _recordId
        };
        jasHttpRequest.jasHttpPost(partURL1, function(id, state, dbSource) {
            removeLocalDBSourceForCancelIns(_recordId);
            setTimeout('refreshList()',1000);
            appcan.window.evaluateScript("daily_offlinelist", "changeButtonStatus()");
        }, JSON.stringify(dataObj));
}


