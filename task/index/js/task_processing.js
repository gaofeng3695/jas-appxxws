/**
 * Created by Administrator on 2016/10/31.
 */
var pageSize = 10;
var pageNum = 1;
var bindData = [];
var _index = 1;
var data_all = null;
var rows = 0;

var titleModel = "<div>{0}<br/>{1}<br/>{2}</div>";
var jasHttpRequest = null;
var queryParam = "";

var lv = appcan.listview({
    selector : "#systemEventList",
    type : "thinLine",
    hasIcon : false, //是否图片
    hasAngle : false, //是否箭头
    hasSubTitle : false,
    myList : true,
    //    hasRadiobox:true,
    multiLine : 4
});
appcan.ready(function() {
    jasHttpRequest = new JasHttpRequest();
    refreshBounce(refreshList, more);
    initData();
});

/**
 * 根据查询条件请求数据
 */
$("#search").on('click', function() {
    pageNum = 1;
    queryParam = $("#queryParam").val().trim();
    initData();
});
lv.on("checkbox:change", function(obj, data) {
    console.log(obj);
    console.log(data);
});
/*向后台请求数据*/
function initData() {
    //uexLog.sendLog("个人处置中");
    baseOperation.londingToast("数据加载中，请稍候...");
    bindData = [];
    var dataObj = null;
    if (queryParam != "") {
        // dataObj="?pageNum="+pageNum+"&pageSize="+pageSize+"&queryCondition="+queryParam;
        dataObj = {
            "pageNum" : pageNum,
            "pageSize" : pageSize,
            "disposeState" : "20",
            "queryCondition" : queryParam
        };
    } else {
        // dataObj="?pageNum="+pageNum+"&pageSize="+pageSize;
        dataObj = {
            "pageNum" : pageNum,
            "pageSize" : pageSize,
            "disposeState" : "20"
        };
    }

    var partURL = 'cloudlink-inspection-task/task/getPageListForPerson';
    // partURL=partURL+dataObj;
    //    uexLog.sendLog(JSON.stringify(dataObj));
    //uexLog.sendLog(partURL);
    jasHttpRequest.jasHttpPost(partURL, onDataCallback, JSON.stringify(dataObj));

}

/*请求json，遍历返回值*/
function onDataCallback(id, state, dbSource) {
    //uexLog.sendLog("data2:"+dbSource);
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
                if(data_all[i].eventIconName =="" || data_all[i].eventIconName == null){
                    data_all[i].eventIconName = "D01.png";
                }
                var _item = {
                    title : ""
                };
                _item.title = '<div class="event_list us1" onclick="enter_list(this);">' + '<input type="hidden" name="taskId" value="' + data_all[i].taskId + '" />' + '<input type="hidden" name="eventId" value="' + data_all[i].eventId + '" />' + '<input type="hidden" name="disposeTime" value="' + data_all[i].disposeTime + '" />' + '<div class="event_title">' + '<h1>任务号：<span class="event_mun">' + data_all[i].code + '</span>' + '<span class="ufr userName  line1 line_hidden">' + data_all[i].inspectorName + '</span>' + '</h1></div>' + '<div class="event_main ub ub-ac">' + '<div class="ub-ac ub-fv event_check">' + '<div class="piaochecked"  onclick="selected_on(this);">' + '<input type="checkbox" class="checkClass" name="event_li" />' + '</div>' + '<div class="event_img ub-f1"><img src="../index/icons/'+data_all[i].eventIconName+'"/></div>' + '</div>' + '<dl class="ub-f1 event_jump"><dt class="line3">' + data_all[i].description + '</dt>' + '<dd><span class="event_userName line1 line_hidden">最新处置：' + data_all[i].disposeUserName + '</span>&nbsp;&nbsp;<span class="event_date">' + data_all[i].disposeTime + '</span></dd>' + '</dl></div></div>';
                tempData.push(_item);
            }
            bindData = bindData.concat(tempData);
            if (pageNum > 1) {
                lv.add(bindData, 1);
                appcan.window.evaluateScript('task', 'all_check(0)');
            } else {
                lv.set(bindData);
                appcan.window.evaluateScript('task', 'all_check(0)');
            }
            baseOperation.closeToast();
        }
    } else {
        baseOperation.alertToast("网络繁忙，请稍候再试...");
        return;
    }
}

/*复选框选择*/

function selected_on(e) {
    if ($(e).hasClass("on_check")) {
        $(e).removeClass("on_check");
        appcan.window.evaluateScript('task', 'all_check(0)');
    } else {
        $(e).addClass("on_check");
        var checkNum = $("input[type='checkbox']:checked").length;
        rows = $("input[type='checkbox']").length;
        if (checkNum == rows) {
            appcan.window.evaluateScript('task', 'all_check(1)');
        }
    }
    eventObj.stopEvent(e);
}

/*跳转到详情页面*/
function enter_list(e) {
    var taskId = $(e).find("input[name='taskId']").val();
    var eventId = $(e).find("input[name='eventId']").val();
    var disposeTime = $(e).find("input[name='disposeTime']").val();
    var params = {
        "taskId" : taskId,
        "eventId" : eventId
    };
    appcan.locStorage.setVal("event_Id", eventId);
    appcan.locStorage.setVal("task_only_id", taskId);
    appcan.locStorage.remove("tabIndex_param");
    appcan.locStorage.setVal("tabIndex_param", "1");
    appcan.locStorage.remove("disposeTime_param");
    appcan.locStorage.setVal("disposeTime_param", disposeTime);
    //    eventObj.obtain(data_all,parent);
    appcan.openWinWithUrl("task_details", "../task_details.html");
}

/*向上拉，重新加载*/
function refreshList() {
    pageNum = 1;
    queryParam = $("#queryParam").val().trim();
    initData();
}

/*向下拉，重新加载*/
function more() {
    pageNum = pageNum + 1;
    initData();
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

var task_id = [];
/*关闭事件*/
function close_task() {
    task_id = [];
    if ($("input[type='checkbox']:checked").length == 0) {
        baseOperation.alertToast("请选择您要关闭的任务！");
    } else {
        appcan.window.confirm({
            title : '提示',
            content : '您好，是否关闭所选任务？',
            buttons : ['确定', '取消'],
            callback : function(err, data, dataType, optId) {
                if (err || data === 1) {
                    return;
                }
                if (data === 0) {
                    $("input[type='checkbox']").each(function() {
                        if ($(this).is(':checked')) {
                            var task = $(this).closest(".event_list").find("input[name='taskId']").val();
                            task_id.push(task);
                        }
                    });
                    //uexLog.sendLog(JSON.stringify(task_id));
                    var partURL = "cloudlink-inspection-task/task/close";
                    jasHttpRequest = new JasHttpRequest();
                    jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
                        //uexLog.sendLog(dbSource);
                        if (dbSource.length == 0) {
                            baseOperation.alertToast("网络繁忙，请稍候再试...");
                            if (tjSwitch == 1) {
                                try {
                                    var zhuge_param = {
                                        "eventName" : "点击关闭任务失败",
                                        "info" : {
                                            "失败原因" : "网关异常"
                                        }
                                    };
                                    uexTianji.track(zhuge_param);
                                } catch (e) {
                                }
                            }
                            return;
                        } else {
                            var resultData = JSON.parse(dbSource);
                            if (resultData.success == "1") {
                                appcan.window.evaluateScript("task", "refreshEnd()");
                                /*$("input[type='checkbox']").each(function() {
                                    if ($(this).is(':checked')) {
                                        $(this).closest(".ubb.ub.bc-border.bc-text.ub-ac.lis").remove();
                                    }
                                });*/
                                refreshList();
                                appcan.window.evaluateScript('task', 'all_check(0)');
                                if (tjSwitch == 1) {
                                    try {
                                        var zhuge_param = {
                                            "eventName" : "点击关闭任务",
                                            "info" : {
                                                'taskId' : task_id
                                            }
                                        };
                                        uexTianji.track(zhuge_param);
                                    } catch (e) {
                                    }
                                }
                            } else {
                                baseOperation.alertToast("网络繁忙，请稍候再试...");
                                if (tjSwitch == 1) {
                                    try {
                                        var zhuge_param = {
                                            "eventName" : "点击关闭任务失败",
                                            "info" : {
                                                '失败原因' : 'code =' + resultData.code
                                            }
                                        };
                                        uexTianji.track(zhuge_param);
                                    } catch (e) {
                                    }
                                }
                                return;
                            }
                        }
                    }, JSON.stringify(task_id));

                }
            }
        });
    }
}

/*关闭任务删除处理中*/
function taskID_remover(e) {
    $("#systemEventList input[name='taskId']").each(function() {
        if ($(this).val() == e) {
            $(this).closest(".ubb.ub.bc-border.bc-text.ub-ac.lis").remove();
        }
    })
}
