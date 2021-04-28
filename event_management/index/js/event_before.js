/**
 * Created by Administrator on 2016/10/31.
 */
var rows = 0;
var bindData = [];
var _index = 1;
var data_all = null;
var dbOperation = null;
var titleModel = "<div>{0}<br/>{1}<br/>{2}</div>";
var jasHttpRequest = null;
var userBo = null;
var queryParam = "";

var number = 0;
var offlineEventDatas = [];
var offlineEventDatasNumber = 0;
var eventData = null;
var eventAttaData = [];

var objArray = null;
var deleteNumber = 0;

var lv = appcan.listview({
    selector : "#systemEventList",
    type : "thinLine",
    hasIcon : false, //是否图片
    hasAngle : false, //是否箭头
    hasSubTitle : false,
    myList : true,
    // hasRadiobox:true,
    multiLine : 4
});
appcan.ready(function() {
    jasHttpRequest = new JasHttpRequest();
    dbOperation = new DataBaseOperation();
    // initData();
    uexUploaderMgr.onStatus = function(opCode, fileSize, percent, serverPath, status) {
        //uexLog.sendLog("status:"+status);
        switch (status) {
        case 0:
            //alert("上传进度："+percent+"%");
            break;
        case 1:
            uexUploaderMgr.closeUploader(opCode);
            uploadSuccess();
            break;
        case 2:
            uexUploaderMgr.closeUploader(opCode);
            ubaseOperation.alertToast("第" + number + "张照片上传失败");
            appcan.window.evaluateScript('event_report', "changeButton()");
            break;
        }

    };
    /*创建判断*/
    uexUploaderMgr.cbCreateUploader = function(opCode, dataType, data) {
        if (data == 0) {
        } else {
        }

    };
    /*坐标转地址回调*/
    uexLocation.cbGetAddress = function(opCode, dataType, data) {
        try {
            var objData = JSON.parse(data);
            // baseOperation.alertToast("333:"+objData.location.lng+","+objData.location.lat);
            //$("#address").val(objData.formatted_address);
            //uexLocation.closeLocation();
            // $("#address").removeAttr("readonly");
            var newAddress = objData.formatted_address;
            eventData.address = newAddress;
            submintData();
        } catch(e) {
            alert(e)
        }
    };
});
/*lv.on("click",function(obj,data,subObj){
 alert("a")
 });*/
lv.on("checkbox:change", function(obj, data) {
    console.log(obj);
    console.log(data);
});

/**
 * 请求本地数据
 */
function initData() {
    baseOperation.londingToast("数据加载中，请稍候...");
    bindData = [];
    userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    var sql = "";
    if (queryParam != undefined && queryParam != null && queryParam != "") {
        sql = "select * from eventlist where enterpriseId='" + userBo.enterpriseId + "' and userId='" + userBo.objectId + "' and postdata like '%" + queryParam + "%' order by localId desc";
    } else {
        sql = "select * from eventlist where enterpriseId='" + userBo.enterpriseId + "' and userId='" + userBo.objectId + "' order by localId desc";
    }
    dbOperation.dbSelect(sql, function(err, resultData) {
        if (err == null) {
            onDataCallback(resultData);
        }
    });
}

/*请求json，遍历返回值*/
function onDataCallback(resultData) {
    if (resultData.length == 0) {
        // $("#systemEventList").html("<p class='tx-c'>暂无数据</p>");
        // baseOperation.closeToast();
        if (queryParam == "") {
            $("#systemEventList").html("<p class='tx-c'>暂无数据</p>");
            baseOperation.closeToast();
        } else if (queryParam != "") {
            $("#systemEventList").html("<p class='tx-c'>没有找到搜索结果</p>");
            baseOperation.closeToast();
        }
    } else {
        var tempData = [];
        for (var i = 0; i < resultData.length; i++) {
            var data = resultData[i].postdata;
            data = JSON.parse(data);
            var _item = {
                title : ""
            };
            if(data.eventIconName == "" || data.eventIconName == null)
            {
                data.eventIconName = "D01.png"
            }
            _item.title = '<div class="event_list us1" onclick="enter_list(this);">' + '<input type="hidden" name="objectId" value="' + data.objectId + '" />' + '<div class="event_title">' + '<h1>事件号：<span class="event_mun">' + data.eventCode + '</span>' + '<span class="ufr line1 userName line_hidden">' + data.userName + '</span>' + '</h1></div>' + '<div class="event_main ub ub-ac">' + '<div class="ub-ac ub-fv event_check">' + '<div class="piaochecked"  onclick="selected_on(this);">' + '<input type="checkbox" id="' + data.objectId + '" class="checkClass" name="event_li" />' + '</div>' + '<div class="event_img ub-f1"><img src="../index/icons/'+data.eventIconName+'"/></div>' + '</div><div class="ub-f1">' + '<dl class="ub-fh event_jump"><dt class="line3">' + data.fullTypeName + '</dt>' + '<dd class="line2 line_hidden">' + data.description + '</dd></dl>' + '<p class="ub-fh event_list_address line1 line_hidden">' + data.address + '</p>' + '</div></div></div>';
            tempData.push(_item);
        }
        // $("#systemNewsList").append(option);
        bindData = bindData.concat(tempData);
        lv.set(bindData);
        baseOperation.closeToast();
    }
}

/*跳转到详情页面*/
function enter_list(e) {
    var eventId = $(e).find("input[type='hidden']").val();
    appcan.locStorage.setVal("offlineEvent_Id", eventId);

    /*清空联系人的本地存储*/
    appcan.locStorage.remove("userSelect");

    if (tjSwitch == 1) {
        try {
            var zhuge_param = {
                "eventName" : "事件详情查看",
                "info" : {
                    "入口" : "事件管理",
                    "事件id" : eventId
                }
            };
            uexTianji.track(zhuge_param);
        } catch(e) {
        }
    }
    appcan.openWinWithUrl("drafts_report", "../drafts_report.html");
}

/*向上拉，重新加载*/
function refreshList() {
    initData();
    appcan.window.evaluateScript('event', 'all_check(0)');
}

/*向下拉，重新加载*/
function more() {
    initData();
    appcan.window.evaluateScript('event', 'all_check(0)');
}

/*全选中*/
function open_check() {
    $(".event_all").find(".piaochecked").addClass("on_check");
    $(".event_all").find(".checkClass").prop("checked", true);
}

/*取消全选*/
function close_check() {
    $(".event_all").contents().find(".piaochecked").removeClass("on_check");
    $(".event_all").find(".checkClass").prop('checked', false);
}

function selected_on(e) {
    if ($(e).hasClass("on_check")) {//取消
        $(e).removeClass("on_check");
        appcan.window.evaluateScript('event', 'all_check(0)');
    } else {//选中
        $(e).addClass("on_check");
        var checkNum = $("input[type='checkbox']:checked").length;
        rows = $("input[type='checkbox']").length;
        if (checkNum == rows) {
            appcan.window.evaluateScript('event', 'all_check(1)');
        }
    }
    eventObj.stopEvent(e);
}

/*删除事件*/
function event_remove() {
    if ($("input[type='checkbox']:checked").length == 0) {
        baseOperation.alertToast("请选择您要删除的事件！");
        appcan.window.evaluateScript("event", "changeButton()");
    } else {
        appcan.window.confirm({
            title : '提示',
            content : '您好，是否确认删除？',
            buttons : ['确定', '取消'],
            callback : function(err, data, dataType, optId) {
                if (err || data === 1) {
                    //如果出错了
                    appcan.window.evaluateScript("event", "changeButton()");
                    return;
                }
                if (data === 0) {
                    var objIds = "";
                    $("input[type='checkbox']").each(function() {
                        if ($(this).is(':checked')) {
                            objIds += this.id + ",";
                        }
                    });
                    initParam();
                    objIds = objIds.substring(0, objIds.length - 1)
                    objArray = objIds.split(",");
                    deleteEventData();
                }
                //data 按照按钮的索引返回值
            }
        });
    }
}

/**
 * 离线事件上报
 */
function event_report() {
    if ($("input[type='checkbox']:checked").length == 0) {
        baseOperation.alertToast("请选择您要上报的事件！");
        appcan.window.evaluateScript("event", "changeButton()");
    } else {
        var objIds = "";
        $("input[type='checkbox']:checked").each(function() {
            //alert(this.id);
            objIds += this.id + ",";
        });
        JasDevice.getConnectStatus(function(params) {
            if (params == -1) {
                baseOperation.alertToast("您好，当前无网络，事件无法上报!");
                appcan.window.evaluateScript("event", "changeButton()");
            } else {
                number = 0;
                getOfflineData(objIds.substring(0, objIds.length - 1));
            }
        });
    }
}

/**
 * 封装要提交的业务数据
 */
function getOfflineData(eventId) {
    try {
        var eventIdArray = eventId.split(",");
        var eventIds = "";
        for (var i = 0; i < eventIdArray.length; i++) {
            eventIds += "'" + eventIdArray[i] + "',";
        }
        eventIds = eventIds.substring(0, eventIds.length - 1);
        var sql = "select * from eventlist where eventId in (" + eventIds + ");";
        dbOperation.dbSelect(sql, function(err, result) {
            if (err == null) {
                for (var i = 0; i < result.length; i++) {
                    var obj = {
                        "eventId" : "",
                        "jsonData" : "",
                        "attaData" : ""
                    };
                    obj.eventId = result[i].eventId;
                    obj.jsonData = JSON.parse(result[i].postdata);
                    offlineEventDatas.push(obj);
                }
                getOfflineAttaData();
            }
        });
    } catch(e) {
        alert(e);
    }
}

/**
 * 封装要提交的附件信息
 */
function getOfflineAttaData() {
    if (offlineEventDatasNumber < offlineEventDatas.length) {
        var eventId = offlineEventDatas[offlineEventDatasNumber].eventId;
        var sql = "select * from event_attachment where eventid='" + eventId + "'";
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
                offlineEventDatas[offlineEventDatasNumber].attaData = attaData;
                offlineEventDatasNumber++;
                getOfflineAttaData();
            }
        });
    } else {
        offlineEventDatasNumber = 0;
        saveEventData();
    }
}

function saveEventData() {
    if (offlineEventDatasNumber < offlineEventDatas.length) {
        eventData = offlineEventDatas[offlineEventDatasNumber].jsonData;
        eventAttaData = offlineEventDatas[offlineEventDatasNumber].attaData;
        offlineEventDatasNumber++;
        if (eventAttaData.length == 0) {
            checkEvent();
        } else {
            number = 0;
            uploadData();
        }
    } else {
        initParam();
        baseOperation.alertToast("数据提交完成！");
        appcan.window.evaluateScript("event", "changeButton()");
        appcan.window.evaluatePopoverScript("event", "list_content", "refresh(20)");
    }
}

function initParam() {
    number = 0;
    offlineEventDatas = [];
    offlineEventDatasNumber = 0;
    eventData = null;
    eventAttaData = [];
    deleteNumber = 0;
    objArray = null;
}

function checkEvent() {
    var address = eventData.address;
    //离线状态下保存的事件上报
    if (address.indexOf('信号差') > -1) {
        var lat = eventData.lat;
        var lon = eventData.lon;
        var params = {
            latitude : Number(lat),
            longitude : Number(log),
            type : "wgs84",
            flag : 1
        };
        /*坐标转地址*/
        uexLocation.getAddressByType(JSON.stringify(params));
    } else {
        submintData();
    }
}

/***
 * 开始提交业务数据
 */
function submintData() {
    baseOperation.alertToast("开始提交数据！");
    /*上传数据*/
    var partURL = "cloudlink-inspection-event/eventInfo/saveBatch";
    var tep = [];
    tep.push(eventData);
    jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
        var resultData = JSON.parse(dbSource);
        if (resultData.success == "1") {
            deleteData(eventData.objectId);
            // refreshList();
            saveEventData();
        } else {
            baseOperation.alertToast("数据提交失败！");
            appcan.window.evaluateScript("event", "changeButton()");
        }
    }, JSON.stringify(tep));
}

/**
 *  开始上传附件数据
 */
function uploadData() {
    var event_id = eventData.objectId;
    var uploadHttp = "";
    var dataImgObj = eventAttaData[number];
    var dataImg = dataImgObj.path;
    var dataType = dataImgObj.type;
    if (dataType == "pic") {
        baseOperation.alertToast("开始上传图片...", -1);
        uploadHttp = serverURL + "cloudlink-core-file/attachment/save?businessId=" + event_id + "&bizType=pic";
    } else if (dataType == "audio") {
        baseOperation.alertToast("开始上传语音...", -1);
        uploadHttp = serverURL + "cloudlink-core-file/attachment/save?businessId=" + event_id + "&bizType=audio";
    }
    if (appcan.locStorage.getVal("token") != null && appcan.locStorage.getVal("token").length > 0) {
        var token = appcan.locStorage.getVal("token");
        if (uploadHttp.indexOf("?") != -1) {
            uploadHttp += "&token=" + token;
        } else {
            uploadHttp += "?token=" + token;
        }
    }
    
    appcan.file.exists({
        filePath : dataImg,
        callback : function(err, data, dataType, optId) {
            if (!err && data == 1) {
                var headJson = '{"Content-type":"Multipart/form-data;charset=utf-8"}';
                var id = Number(Math.floor(Math.random() * (100000 + 1)));
                uexUploaderMgr.setHeaders(id, headJson);
                uexUploaderMgr.createUploader(id, uploadHttp);
                uexUploaderMgr.uploadFile(id, dataImg, "file", 0);
            }else{
                //附件丢失，上传下一个附件
                uploadSuccess();
            }
        }
    }); 
}

/**
 * 文件上传回调函数
 */
function uploadSuccess() {
    baseOperation.alertToast("第" + number + "张照片上传成功", -1);
    number++;
    if (number < eventAttaData.length) {
        uploadData();
    } else {
        checkEvent();
    }
}

/**
 * 删除本地数据
 * @param {Object} eventid
 */
function deleteData(eventid) {
    deleteOfflineEventData(eventid, function(result) {
        if (result.success == "1") {
            deleteOfflineEventAttaData(eventid, function(resultData) {
                if (resultData.success == "1") {
                    baseOperation.alertToast("本地数据删除成功");
                    refreshList();
                    deleteEventData();
                }
            });
        }
    });
}

/**
 * 删除本地数据
 */
function deleteEventData() {
    if (deleteNumber < objArray.length) {
        deleteData(objArray[deleteNumber]);
        deleteNumber++;
    } else {
        initParam();
        baseOperation.alertToast("本地缓存数据清除成功");
        appcan.window.evaluateScript("event", "changeButton()");
    }
}


$("#search").on("click", function() {
    queryParam = $("#queryParam").val();
    initData();
});
