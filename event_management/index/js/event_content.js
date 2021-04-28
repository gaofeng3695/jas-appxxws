/**
 * Created by Administrator on 2016/10/31.
 */
var titHeight = 0;
var numOpen = 0;
var eventBefore = true;
var eventEnd = true;

var tabview = appcan.tab({
    selector : "#tabview",
    hasIcon : false,
    hasAnim : true,
    hasLabel : true,
    hasBadge : true,
    data : [{
        label : "处理中"
    }, {
        label : "已结束"
    }, {
        label : "草稿箱"
    }]
});
tabview.on("click", function(obj, index) {/*TAB变更时切换多浮动窗口*/
    showNewsFooter(index);
    appcan.window.selectMultiPopover("eventListContent", index);

});

appcan.ready(function() {
    var parentTitHeight = appcan.locStorage.getVal("event_content_titHeight");
    titHeight = parseInt(parentTitHeight) + $('#tabview').offset().height;
    appcan.locStorage.remove("event_content_titHeight");
    appcan.frame.open({/*创建多浮动窗口*/
        id : "content",
        url : [{
            "inPageName" : "event_processing", //处理中
            "inUrl" : "event/event_processing.html"
        }, {
            "inPageName" : "event_end",
            "inUrl" : "event/event_end.html"
        }, {
            "inPageName" : "event_before", //草稿箱
            "inUrl" : "event/event_before.html"
        }],
        top : titHeight,
        left : 0,
        index : 0,
        name : "eventListContent",
        change : function(index, res) {/*浮动窗口推拽变更时回调，可控制tab进行同步变更*/
            showNewsFooter(res.multiPopSelectedIndex);
            tabview.moveTo(res.multiPopSelectedIndex);

            if (numOpen == 0) {
                if (res.multiPopSelectedIndex == 1 && eventEnd) {
                    uexWindow.evaluateMultiPopoverScript("", "eventListContent", "event_end", "refreshList()");
                    eventEnd = false;
                } else if (res.multiPopSelectedIndex == 2 && eventBefore) {
                    uexWindow.evaluateMultiPopoverScript("", "eventListContent", "event_before", "refreshList()");
                    eventBefore = false;
                }
            } else {
                numOpen++;
            }
        }
    });
    window.onorientationchange = window.onresize = function() {
        resizeWidow();
        //appcan.frame.resize("content", 0, top);

    }
});

function showNewsFooter(index) {
    if (index == 2) {
        appcan.window.evaluateScript("event", "showNewsFooter()");
    } else {
        appcan.window.evaluateScript("event", "hideNewsFooter()");
    }
}

function resizeWidow() {
    var width = $('body').width();
    var height = $("#content").height();
    /*appcan.window.resizePopover({
     name:'newsListContent',
     left:0,
     top:titHeight,
     width:width,
     height:height
     });*/
    uexWindow.setMultiPopoverFrame("eventListContent", 0, titHeight, width, height);
}

/*全选中*/
function open_check() {
    uexWindow.evaluateMultiPopoverScript('', 'eventListContent', 'event_before', 'open_check()');
}

/*取消全选*/
function close_check() {
    uexWindow.evaluateMultiPopoverScript('', 'eventListContent', 'event_before', 'close_check()');
}

/*孙页面取消主页面全选*/
function all_check() {
    appcan.window.evaluateScript('event_management', 'all_check()');
}

/*删除事件*/
function event_remove() {
    uexWindow.evaluateMultiPopoverScript('', 'eventListContent', 'event_before', 'event_remove()');
}

/*上报事件*/
function event_report() {
    uexWindow.evaluateMultiPopoverScript('', 'eventListContent', 'event_before', 'event_report()');
}

function refresh(eventStatus) {
    if (eventStatus == "30" || eventStatus == "21") {
        appcan.window.selectMultiPopover("eventListContent", 1);
        uexWindow.evaluateMultiPopoverScript("", "eventListContent", "event_end", "refreshList()");
    } else if (eventStatus == "20") {
        appcan.window.selectMultiPopover("eventListContent", 0);
        uexWindow.evaluateMultiPopoverScript("", "eventListContent", "event_processing", "refreshList()");
    } else if (eventStatus == "90") {// 刷新草稿箱列表
        appcan.window.selectMultiPopover("eventListContent", 2);
        uexWindow.evaluateMultiPopoverScript("", "eventListContent", "event_before", "refreshList()");
    }
}
