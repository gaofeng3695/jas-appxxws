/**
 * Created by Administrator on 2016/10/31.
 */
var pageSize = 10;
var pageNum = 1;
var bindData = [];
var _index = 1;
var data_all = null;

var jasHttpRequest = new JasHttpRequest();
var partURL = 'cloudlink-inspection-event/eventInfo/getPageList';
var queryParam = "";
var lv = appcan.listview({
    selector : "#systemEventList",
    type : "thinLine",
    hasIcon : false, //是否图片
    hasAngle : false, //是否箭头
    hasSubTitle : false,
    myList : false,
    // hasRadiobox:true,
    multiLine : 4
});
appcan.ready(function() {
    refreshBounce(refreshList, more);
    //        initData();
    //        baseOperation.alertToast("正在请求已完成数据");

});
/**
 * 根据查询条件请求数据
 */
$("#search").on('click', function() {
    pageNum = 1;
    queryParam = $("#queryParam").val().trim();
    // if(queryParam==undefined || queryParam==""){
    // baseOperation.alertToast('请填写查询条件！');
    // return ;
    // }
    initData();
});
lv.on("checkbox:change", function(obj, data) {
    console.log(obj);
    console.log(data);
});
/*向后台请求数据*/
function initData() {
    baseOperation.londingToast("数据加载中，请稍候...");
    if (queryParam != "") {
        dataObj = {
            "status" : "21,30",
            "pageNum" : pageNum,
            "pageSize" : pageSize,
            "queryParam" : queryParam
        };
    } else {
        dataObj = {
            "status" : "21,30",
            "pageNum" : pageNum,
            "pageSize" : pageSize
        };
    }
    jasHttpRequest.jasHttpPost(partURL, onDataCallback, JSON.stringify(dataObj));
}

/*请求json，遍历返回值*/
function onDataCallback(id, state, dbSource) {
    bindData = [];
    if (dbSource.length == 0) {
        baseOperation.alertToast("网络繁忙，请稍候再试...");
        return;
    }
    var resultData = JSON.parse(dbSource);
    var tempData = [];
    if (resultData.success == "1") {
        data_all = resultData.rows;
        if (data_all.length == 0) {
            if (queryParam == "" && pageNum == 1) {
                $("#systemEventList").html("<p class='tx-c'>暂无数据</p>");
                baseOperation.closeToast();
            } else if (queryParam != "" && pageNum == 1) {
                $("#systemEventList").html("<p class='tx-c'>没有找到搜索结果</p>");
                baseOperation.closeToast();
            } else {
                setTimeout(function() {
                    baseOperation.alertToast("没有更多的数据...");
                }, 1000);
            }
        } else {
            for (var i = 0; i < data_all.length; i++) {
                var _item = {
                    title : ""
                };
                if(data_all[i].eventIconName =="" || data_all[i].eventIconName == null){
                    data_all[i].eventIconName = "D01.png";
                }
                _item.title = '<div class="event_list us1" onclick="enter_list(this);">' + '<input type="hidden" name="objectId" value="' + data_all[i].objectId + '" />' + '<input type="hidden" name="disposeTime" value="' + data_all[i].disposeTime + '" />' + '<div class="event_title">' + '<h1>事件号：<span class="event_mun">' + data_all[i].eventCode + '</span>' + '<span class="ufr line1 userName line_hidden">' + data_all[i].inspectorName + '</span>' + '</h1></div>' + '<div class="event_main ub ub-ac">' + '<div class="ub-ac ub-fv event_checkP">' + '<div class="event_img ub-f1"><img src="../index/icons/'+data_all[i].eventIconName+'"/></div>' + '</div><div class="ub-f1">' + '<dl class="ub-fh event_jump"><dt class="line1">' + data_all[i].fullTypeName + '</dt>' + '<dd class="line2 line_hidden">' + data_all[i].description + '</dd>' + '</dl>' + '<p class="ub-fh event_list_address line1 line_hidden">' + data_all[i].address + '</p>' + '</div></div></div>';
                tempData.push(_item);
            }
            bindData = bindData.concat(tempData);
            if (pageNum > 1) {
                lv.add(bindData, 1);
            } else {
                lv.set(bindData);
            }
            baseOperation.closeToast();
        }
    } else {
        baseOperation.alertToast("网络繁忙，请稍候再试...");
        setTimeout(function() {
            $("#systemEventList").html("<p class='tx-c'>暂无数据</p>");
        }, 2000);
        return;
    }
}

/*跳转到详情页面*/
function enter_list(e) {
    removeParam();
    var eventId = $(e).find("input[type='hidden']").val();
    appcan.locStorage.setVal("event_Id", eventId);
    appcan.locStorage.setVal("bottom_operation", "bottom");
    appcan.locStorage.setVal("tabIndex_param", "0");
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
    appcan.locStorage.remove("isShowMap");
    appcan.locStorage.setVal("isShowMap","true");
    appcan.openWinWithUrl("task_details", "../../task/task_details.html");
}

/*向上拉，重新加载*/
function refreshList() {
    queryParam = $("#queryParam").val().trim();
    pageNum = 1;
    initData();
}

/*向下拉，重新加载*/
function more() {
    pageNum = pageNum + 1;
    initData();
}

/*
 function updateState(id){
 var partURL = 'cloudlink-inspection-message/updateState?msgId='+id;
 jasHttpRequest.jasHttpGet(partURL,function(id,state,resultData){
 refreshList();
 });
 }*/
function removeParam() {
    appcan.locStorage.remove("event_Id");
    appcan.locStorage.remove("bottom_operation");
    appcan.locStorage.remove("tabIndex_param");
}
