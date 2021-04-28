var rows = 0;
var bindData = [];
var _index = 1;
var jasHttpRequest = null;
var dbOperation = null;
var queryParam = "";
var userBo = null;

var number = 0;
// 控制附件数量
var offlineNewsDatasNumber = 0;
//控制消息个数
var offlineNewsDatas = [];
var newsData = null;
var newsAttaData = [];

var objArray = null;
var deleteNumber = 0;

var lv = appcan.listview({
    selector : "#unsentNewsList",
    type : "thinLine",
    hasIcon : false, //是否图片
    hasAngle : false, //是否箭头
    hasSubTitle : false,
    // hasCheckbox : true,
    myList : true,
    // hasRadiobox:true,
    multiLine : 4
});

/**
 * 初始化界面
 */
appcan.ready(function() {
    jasHttpRequest = new JasHttpRequest();
    dbOperation = new DataBaseOperation();
    // appcan.initBounce();
    // refreshBounce(refreshList,more);
    uexUploaderMgr.onStatus = function(opCode, fileSize, percent, serverPath, status) {
        // uexLog.sendLog("status:"+status);
        switch (status) {
        case 0:
            //alert("上传进度："+percent+"%");
            break;
        case 1:
            uexUploaderMgr.closeUploader(opCode);
            uploadNewsSuccess();
            break;
        case 2:
            uexUploaderMgr.closeUploader(opCode);
            ubaseOperation.alertToast("第" + number + "张照片上传失败");
            appcan.window.evaluateScript('event_report', "changeButton()");
            break;
        }

    };
    //initData();
    //消息通道
});
$("#search").on("click", function() {
    queryParam = $("#queryParam").val().trim();
    initData();
});
/**
 * 获取数据
 */
function initData() {
    // close_check();
    appcan.window.evaluateScript('enitNews', 'all_check(0)');
    rows=0;
    //$("#unsentNewsList").html('');
    baseOperation.londingToast("数据加载中，请稍候...");
    bindData = [];
    userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    var sql = "";
    if (queryParam != undefined && queryParam != null && queryParam != "") {
        sql = "select * from localnews where userId='" + userBo.objectId + "' and enterpriseId='" + userBo.enterpriseId + "' and postdata like '%" + queryParam + "%' order by localId desc";
    } else {
        sql = "select * from localnews where userId='" + userBo.objectId + "' and enterpriseId='" + userBo.enterpriseId + "' order by localId desc";
    }
    dbOperation.dbSelect(sql, function(err, result) {
        if (err == null) {
            onDataCallback(result);
        }
    });
}
/**
 * 数据库查询回调 
 */
function onDataCallback(resultData) {
    if (resultData.length == 0) {
        if(queryParam ==""){
            $("#unsentNewsList").html("<p class='tx-c'>暂无数据</p>");
        }else if(queryParam !=""){
            $("#unsentNewsList").html("<p class='tx-c'>没有找到搜索结果</p>");
        }
        baseOperation.closeToast();
        return;
    }
    var tempData = [];
    for (var i = 0; i < resultData.length; i++) {
        var data = resultData[i].postdata;
        data = JSON.parse(data);
        var _item = {
            title : ""
        };
        _item.title = '<div>' + '<div class="ub ub-ac news_list_p" onclick="enter_list(this);">' + '<input type="hidden" name="objectId" value="' + data.objectId + '" />' + '<div class="ub-ac ub-fv event_check">' + '<div class="piaochecked" onclick="selected_on(this);">' + '<input type="checkbox" class="checkClass" id="' + data.objectId + '" name="event_li" />' + '</div>' + '</div>' + '<div class="news_main ub-f1">' + '<dl class="ub-f1">' + '<dt class="ulev0 ub ub-ac uof">' + '<span class="news_head ub-f1 line1">' + data.title + '</span>' + '<span class="news_time">' + data.sendTime + '</span>' + '</dt>' + '<dd class="line2">' + data.content + '</dd>' + '</dl>' + '</div>' + '</div>' + '</div>';
        tempData.push(_item);
    }
    // $("#systemNewsList").append(option);
    bindData = bindData.concat(tempData);
    lv.set(bindData);
    baseOperation.closeToast();
}

/*全选中*/
function open_check() {
    $("#unsentNewsList").find(".piaochecked").addClass("on_check");
    $("#unsentNewsList").find(".checkClass").prop("checked", true);
}

/*取消全选*/
function close_check() {
    $("#unsentNewsList").contents().find(".piaochecked").removeClass("on_check");
    $("#unsentNewsList").find(".checkClass").prop('checked', false);
}


// /*跳转到详情页面*/
// function enter_list(e) {
    // var objectId = $(e).find("input[type='hidden']").val();
    // var sql = "select * from localnews where objectId='" + objectId + "'";
    // dbOperation.dbSelect(sql, function(err, resultData) {
        // var thisData = resultData[0].postdata
        // appcan.locStorage.setVal("newsContent_param", thisData);
        // appcan.openWinWithUrl("news_details", "../news_details.html");
    // });
// }
function enter_list(e){
    var objectId= $(e).find("input[type='hidden']").val();
    appcan.locStorage.setVal("updateNews_param",objectId);
    appcan.openWinWithUrl("updateNews","updatenews.html");
}
/**
 * 复选框点击效果
 * @param {Object} e
 */
function selected_on(e) {
    if ($(e).hasClass("on_check")) {//取消
        $(e).removeClass("on_check");
        appcan.window.evaluateScript('enitNews', 'all_check(0)');
    } else {//选中
        $(e).addClass("on_check");
        var checkNum = $("input[type='checkbox']:checked").length;
        rows = $("input[type='checkbox']").length;
        if (checkNum == rows) {
            appcan.window.evaluateScript('enitNews', 'all_check(1)');
        }
    }
    eventObj.stopEvent(e);
}

/***
 * 组织冒泡
 */
var eventObj = {
    stopEvent : function(event) {//阻止冒泡事件
        //取消事件冒泡
        var e = arguments.callee.caller.arguments[0] || event;
        if (e && e.stopPropagation) {
            e.stopPropagation();
        } else if (window.event) {
            window.event.cancelBubble = true;
        }
    }
};
/***
 * 删除未发布消息
 */
function deleteUnsentNews() {
    var newsCount = $("input[type='checkbox']:checked").length;

    if (newsCount == 0) {
        baseOperation.alertToast("请选择您要删除的消息！");
        appcan.window.evaluateScript('enitNews', "changeButtonStatus()");
    } else {
        appcan.window.confirm({
            title : '提示',
            content : '您好，是否确认删除？',
            buttons : ['确定', '取消'],
            callback : function(err, data, dataType, optId) {
                if (err || data === 1) {
                    //如果出错了
                    appcan.window.evaluateScript('enitNews', "changeButtonStatus()");
                    return;
                }
                if (data === 0) {
                    var objIds = "";
                    $("input[type='checkbox']").each(function() {
                        if ($(this).is(':checked')) {
                            // deleteOfflineData(this.id);
                            objIds += this.id + ",";
                        }
                    });
                    initParam();
                    objIds = objIds.substring(0, objIds.length - 1)
                    objArray = objIds.split(",");
                    deleteData();
                }
                //data 按照按钮的索引返回值
            }
        });
        
    }
}

/**
 * 发布本地消息
 */
function publishUnsentNews() {
    var newsCount = $("input[type='checkbox']:checked").length;
    if (newsCount == 0) {
        baseOperation.alertToast("请选择您要发布的消息！");
        appcan.window.evaluateScript('enitNews', "changeButtonStatus()");
    } else {
        var objIds = "";
        $("input[type='checkbox']").each(function() {
            if ($(this).is(':checked')) {
                objIds += this.id + ",";
            }
        });
        JasDevice.getConnectStatus(function(params) {
            if (params == -1) {
                baseOperation.alertToast("您好，当前无网络，消息无法发送!");
                appcan.window.evaluateScript('enitNews', "changeButtonStatus()");
            } else {
                initParam();
                getOfflineData(objIds.substring(0, objIds.length - 1));
            }
        });
    }
}

/**
 * 初始化参数
 */
function initParam() {
    number = 0;
    // 控制附件数量
    offlineNewsDatasNumber = 0;
    //控制消息个数
    offlineNewsDatas = [];
    newsData = null;
    newsAttaData = [];
    objArray = null;
    deleteNumber = 0;
}

/**
 * 获取要推送的消息
 */
function getOfflineData(objectId) {
    var objIds = '';
    var objIdArray = objectId.split(",");
    for (var i = 0; i < objIdArray.length; i++) {
        objIds += "'" + objIdArray[i] + "',"
    }
    objIds = objIds.substring(0, objIds.length - 1);
    var sql = "select * from localnews where objectId in(" + objIds + ")";
    dbOperation.dbSelect(sql, function(err, result) {
        if (err == null) {
            for (var i = 0; i < result.length; i++) {
                var obj = {
                    "objectId" : "",
                    "jsonData" : "",
                    "attaData" : ""
                };
                obj.objectId = result[i].objectId;
                obj.jsonData = JSON.parse(result[i].postdata);
                offlineNewsDatas.push(obj);
            }
            getOfflineAttaData();
        }
    });
}

/**
 * 获取消息的的附件信息
 */
function getOfflineAttaData() {
    if (offlineNewsDatasNumber < offlineNewsDatas.length) {
        var objectId = offlineNewsDatas[offlineNewsDatasNumber].objectId;
        var sql = "select * from localnewsatta where objectId='" + objectId + "'";
        dbOperation.dbSelect(sql, function(err, result) {
            if (err == null) {
                var attaData = [];
                for (var i = 0; i < result.length; i++) {
                    var data = result[i];
                    var attaType = data.attaType;
                    var obj = {
                        "path" : data.postdata,
                        "type" : data.attaType
                    };
                    attaData.push(obj);
                }
                offlineNewsDatas[offlineNewsDatasNumber].attaData = attaData;
                offlineNewsDatasNumber++;
                getOfflineAttaData();
            }
        });
    } else {
        offlineNewsDatasNumber = 0;
        saveData();
    }
}

/**
 * 开始上传数据
 */
function saveData() {
    number = 0;
    if (offlineNewsDatasNumber < offlineNewsDatas.length) {
        newsData = offlineNewsDatas[offlineNewsDatasNumber].jsonData;
        newsAttaData = offlineNewsDatas[offlineNewsDatasNumber].attaData;
        offlineNewsDatasNumber++;
        if (newsAttaData.length == 0) {
            saveNewsData();
        } else {
            uploadNewsImg();
        }
    } else {
        initParam();
        baseOperation.alertToast("数据提交完成！");
        appcan.window.evaluateScript('enitNews', "refreshList(2)");
    }
}

/***
 * 上传业务数据
 */
function saveNewsData() {
    // var partURL = "cloudlink-inspection-message/message/sendMsg";
    var partURL = "cloudlink-inspection-message/message/send";
    jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
        appcan.window.evaluateScript('enitNews', "changeButtonStatus()");
        var resultData = JSON.parse(dbSource);
        if (resultData.success == "1") {
            deleteOfflineData(newsData.objectId);
            saveData();
        } else {
            baseOperation.alertToast("数据提交失败！");
            appcan.window.evaluateScript('enitNews', "changeButtonStatus()");
        }
    }, JSON.stringify(newsData));
}

/**
 * 上传图片
 */
function uploadNewsImg() {
    var uploadHttp = "";
    var dataImgObj = newsAttaData[number];
    var dataImg = dataImgObj.path;
    var dataType = dataImgObj.type;
    if (dataType == "pic") {
        baseOperation.alertToast("开始上传图片...", -1);
        uploadHttp = serverURL + "cloudlink-core-file/attachment/save?businessId=" + newsData.objectId + "&bizType=pic";
    }
    if (appcan.locStorage.getVal("token") != null && appcan.locStorage.getVal("token").length > 0) {
        var token = appcan.locStorage.getVal("token");
        if (uploadHttp.indexOf("?") != -1) {
            uploadHttp += "&token=" +token;
        } else {
            uploadHttp += "?token=" +token;
        }
    }
    var headJson = '{"Content-type":"Multipart/form-data;charset=utf-8"}';
    var id = Number(Math.floor(Math.random() * (100000 + 1)));
    uexUploaderMgr.setHeaders(id, headJson);
    uexUploaderMgr.createUploader(id, uploadHttp);
    uexUploaderMgr.uploadFile(id, dataImg, "file", 0);
}

/**
 * 图片是否上传完成
 */
function uploadNewsSuccess() {
    baseOperation.alertToast("第" + (number + 1) + "张照片上传成功", -1);
    number++;
    if (number < newsAttaData.length) {
        uploadNewsImg();
    } else {
        baseOperation.alertToast("开始提交数据！");
        saveNewsData();
    }
}

/**
 * 删除本地数据
 * @param {Object} eventid
 */
function deleteOfflineData(objectId) {
    deleteOfflineNews(objectId, function(result) {
        if (result.success == "1") {
            deleteOfflineNewsAtta(objectId, function(resultData) {
                if (resultData.success == "1") {
                    initData();
                    deleteData();
                }
            });
        }
    });
}
/**
 * 删除本地数据
 */
function deleteData() {
    if (deleteNumber < objArray.length) {
        deleteOfflineData(objArray[deleteNumber]);
        deleteNumber++;
    } else {
        initParam();
        baseOperation.alertToast("本地缓存数据清除成功");
        appcan.window.evaluateScript('enitNews', "changeButtonStatus()");
    }
}
