/*
 *
 * */
var jasHttpRequest = null;
var task_id = [];
var flag=true;
var close_id = null;
var event_id =null;

appcan.ready(function() {
    jasHttpRequest = new JasHttpRequest();
    event_id = appcan.locStorage.getVal("event_Id");
    var titHeight = $('#header').offset().height;
    appcan.locStorage.setVal("task_details_content_titHeight", titHeight);
    appcan.frame.open("content", "task_details_content.html", 0, titHeight, "task_details_content");
    window.onorientationchange = window.onresize = function() {
        resizeWindowSize();
    };
    $("#footer").removeClass("ub").hide();
    resizeWindowSize();
    var bottom_operation = appcan.locStorage.getVal("bottom_operation");
    appcan.locStorage.remove("bottom_operation");
    if (bottom_operation == "bottom") {
        $("#footer").remove();
    }
    //物理返回键监听
    uexWindow.setReportKey(0, 1);
    uexWindow.onKeyPressed = function(keyCode) {
        if (keyCode == 0) {
            close_page();
        }
    };
});

appcan.button(".btn_return", "btn-act", function() {
    close_page();
});
/*关闭页面*/
function close_page() {
    appcan.locStorage.remove("event_Id");
    appcan.locStorage.remove("task_only_id");
    appcan.window.close(-1);
}

/*控制foot*/
function showNewsFooter(isRelaton) {
    if (isRelaton == 1) {
        $("#footer").addClass("ub").show();
    } else {
        $("#footer").remove();
    }

    resizeWindowSize();
}

/*tab切换控制foot显隐*/
function detailFooter(index) {
    if (index == 1) {
        $("#footer").addClass("ub").show();
    } else {
        $("#footer").removeClass("ub").hide();
    }
    resizeWindowSize();
}

function hideNewsFooter() {
    $("#footer").removeClass("ub").hide();
    resizeWindowSize();
}

/*改变主窗口的大小*/
function resizeWindowSize() {
    setTimeout(function() {
        var width = $('body').width();
        var height = $("#content").height();
        var titHeight = $('#header').offset().height;
        appcan.window.resizePopover({
            name : 'task_details_content',
            left : 0,
            top : titHeight,
            width : width,
            height : height
        });
    }, 200);
}

/*填写信息*/
function event_delete() {
    if (tjSwitch == 1) {
        try {
            var zhuge_param = {
                "eventName" : "点击填写任务信息",
                "info" : {}
            };
            uexTianji.track(zhuge_param);
        } catch (e) {
        }
    }
    appcan.openWinWithUrl("disposal_report", "disposal_report.html");
    appcan.locStorage.remove("userSelect");
}

function changeButton(){
    flag=true;
}
/*关闭任务*/
function close_task() {
    close_id = appcan.locStorage.getVal("task_only_id");
    if(flag){
        flag=false;
        var partURL = "cloudlink-inspection-task/task/getTaskStatus?taskId=" + close_id;
        /*验证任务是否已关闭*/
        jasHttpRequest.jasHttpGet(partURL, function(id, state, dbSource) {
            if (dbSource.length == 0) {
                baseOperation.alertToast("网络繁忙，请稍候再试...");
                changeButton();
                return false;
            } else {
                var resultData = JSON.parse(dbSource);
                if (resultData.success == "1") {
                    var taskState = resultData.rows;
                    if (taskState[0].status == 21) {
                        appcan.window.confirm({
                            title : '提示',
                            content : '您好，该任务已经关闭，无法继续关闭任务',
                            buttons : ['确定'],
                            callback : function(err, data, dataType, optId) {
                                if (err) {
                                    changeButton();
                                    return false;
                                } else {
                                    footRemove();
                                    appcan.window.evaluatePopoverScript('task_details', 'task_details_content', 'refresh(1)');
                                    appcan.window.evaluatePopoverScript("task", "task_content", "refreshEnd()");
                                    appcan.window.evaluatePopoverScript("task", "task_content", "refresh('20')");
                                    appcan.window.evaluatePopoverScript("task_all", "task_all_content", "refreshEnd()");
                                    appcan.window.evaluatePopoverScript("task_all", "task_all_content", "refresh('20')");
                                    appcan.window.evaluatePopoverScript("event", "list_content", "refresh('20')");
                                    appcan.window.evaluatePopoverScript('index','index_content','refresTasks()');
                                    appcan.window.evaluateScript("event_map","uploadMarkers('"+event_id+"')");
                                }
                            }
                        });
                        return false;
                    } else {
                        closeTask();
                    }
                } else {
                    baseOperation.alertToast("网络繁忙，请稍候再试...");
                    changeButton();
                    return false;
                }
            }
        });
    }
}

function closeTask(){
    appcan.window.confirm({
        title : '提示',
        content : '您好，是否关闭任务？',
        buttons : ['确定', '取消'],
        callback : function(err, data, dataType, optId) {
            if (err || data === 1) {
                //如果出错了
                changeButton();
                return;
            }
            if (data === 0) {
                task_id.push(close_id);
                var partURL = "cloudlink-inspection-task/task/close";
                jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
                    if (dbSource.length == 0) {
                        baseOperation.alertToast("网络繁忙，请稍候再试...");
                        changeButton();
                        if (tjSwitch == 1) {
                            try {
                                var zhuge_param = {
                                    "eventName" : "点击关闭任务失败",
                                    "info" : {
                                        '失败原因' : '网关异常'
                                    }
                                };
                                uexTianji.track(zhuge_param);
                            } catch (e) {
                            }
                        }
                        return;
                    }
                    var resultData = JSON.parse(dbSource);
                    if (resultData.success == "1") {
                        if (tjSwitch == 1) {
                            try {
                                var zhuge_param = {
                                    "eventName" : "点击关闭任务",
                                    "info" : {
                                        "taskId" : task_id
                                    }
                                };
                                uexTianji.track(zhuge_param);
                            } catch (e) {
                            }
                        }
                        appcan.window.evaluatePopoverScript("task", "task_content", "refreshEnd()");
                        appcan.window.evaluatePopoverScript("task", "task_content", "refresh('20')");
                        appcan.window.evaluatePopoverScript("task_all", "task_all_content", "refreshEnd()");
                        appcan.window.evaluatePopoverScript("task_all", "task_all_content", "refresh('20')");
                        appcan.window.evaluatePopoverScript("event", "list_content", "refresh('20')");
                        appcan.window.evaluatePopoverScript('index','index_content','refresTasks()');
                        appcan.window.evaluateScript("event_map","uploadMarkers('"+event_id+"')");
                        close_page();
                    } else {
                        baseOperation.alertToast("网络繁忙，请稍候再试...");
                        changeButton();
                        if (tjSwitch == 1) {
                            try {
                                var zhuge_param = {
                                    "eventName" : "点击关闭任务失败",
                                    "info" : {
                                        "失败原因" : 'code =' + resultData.code
                                    }
                                };
                                uexTianji.track(zhuge_param);
                            } catch (e) {
                            }
                        }
                        return;
                    }
                }, JSON.stringify(task_id));
            }
        }
    });
}

/*移除底部*/
function footRemove(){
    $("#footer").remove();
}


function showShareToolsEvent(){
    uexWindow.evaluateMultiPopoverScript("task_details", "detailsListContent", "task_event", "showShareTools()");
    uexWindow.evaluateMultiPopoverScript("task_details", "detailsListContent", "task_disposal", "showShareTools()");
}

