/*
 *
 * */

appcan.ready(function() {
    appcan.window.disableBounce();
    var titHeight = $('#header').offset().height;
    appcan.locStorage.setVal("event_content_titHeight", titHeight);
    appcan.frame.open("content", "event_content.html", 0, titHeight, "list_content");
    window.onorientationchange = window.onresize = function() {
        resizeWindowSize();
    };
    $("#footer").removeClass("ub").hide();
    resizeWindowSize();
    //物理返回键监听
    uexWindow.setReportKey(0, 1);
    uexWindow.onKeyPressed = function(keyCode) {
        if (keyCode == 0) {
            appcan.window.evaluatePopoverScript('index', 'index_content', 'refresTasks()');
            //刷新主界面的任务列表
            appcan.window.close(-1);
        }
    };
    
    appcan.button(".btn_return", "btn-act", function() {
        appcan.window.evaluatePopoverScript('index', 'index_content', 'refresTasks()');
        //刷新主界面的任务列表
        appcan.window.close(-1);
    });
    
    /*打开事件上报*/
    appcan.button(".event_add", "btn-act", function() {
        /*清空联系人的本地存储*/
        appcan.locStorage.remove("userSelect");
        /*设置进入事件类型的方式 */
        appcan.locStorage.setVal("enterEventModel", "");
        if (tjSwitch == 1) {
            try {
                var param = {
                    "eventName" : "事件新增",
                    "info" : {
                        "入口" : "事件管理"
                    }
                };
                uexTianji.track(param);
            } catch(e) {
            }
        }
        appcan.openWinWithUrl("event_report", "event_report.html");
    });
    /*打开事件地图*/
    appcan.button(".event_map", "btn-act", function() {
        if (tjSwitch == 1) {
            try {
                var zhuge_param = {
                    "eventName" : "事件管理查看地图",
                    "info" : {
                        "入口" : "事件管理"
                    }
                };
                uexTianji.track(zhuge_param);
            } catch(e) {
            }
        }
        appcan.locStorage.remove("isShowMap");
        appcan.locStorage.setVal("isShowMap","false");
        appcan.openWinWithUrl("event_map", "event_map.html");
    });
    
});



/*控制foot*/
function showNewsFooter() {
    $("#footer").addClass("ub").show();
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
            name : 'list_content',
            left : 0,
            top : titHeight,
            width : width,
            height : height
        });
    }, 200);
}

/*全选*/
function allCheck(e) {
    if ($(e).hasClass("for_on_check")) {
        $(e).removeClass("for_on_check");
        appcan.window.evaluatePopoverScript('event', 'list_content', 'close_check()');
    } else {
        $(e).addClass("for_on_check");
        appcan.window.evaluatePopoverScript('event', 'list_content', 'open_check()');
    }
}

/*取消全选样式*/
function all_check(state) {
    if (state == "0") {
        $(".for_check").removeClass("for_on_check");
        $("#event_check").prop("checked", false);
    } else if (state == "1") {
        $(".for_check").addClass("for_on_check");
        $("#event_check").prop("checked", true);
    }
}

/*删除*/
function event_delete() {
    if (flag) {
        flag = false;
        appcan.window.evaluatePopoverScript('event', 'list_content', 'event_remove()');
    }
};
var flag = true;
/*上报*/
$(".event_report").click(function() {
    if (flag) {
        flag = false;
        appcan.window.evaluatePopoverScript('', 'list_content', 'event_report()');
    }
});
function changeButton() {
    flag = true;
}
