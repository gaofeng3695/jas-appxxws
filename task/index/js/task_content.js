/**
 * Created by Administrator on 2016/10/31.
 */
var titHeight=0;
var numOpen=0;
var tabview = appcan.tab({
    selector : "#tabview",
    hasIcon : false,
    hasAnim : true,
    hasLabel : true,
    hasBadge : true,
    data : [ {
        label : "处理中"
    }, {
        label : "已结束"
    }]
});
tabview.on("click",function(obj, index){ /*TAB变更时切换多浮动窗口*/
    //showNewsFooter(index);
    appcan.window.selectMultiPopover("taskListContent",index);
});

appcan.ready(function() {
    var parentTitHeight=appcan.locStorage.getVal("task_content_titHeight");
    titHeight = parseInt(parentTitHeight)+$('#tabview').offset().height;
    appcan.locStorage.remove("task_content_titHeight");
    appcan.frame.open({/*创建多浮动窗口*/
        id : "content",
        url : [ {
            "inPageName" : "task_processing",//处理中
            "inUrl" : "task_list/task_processing.html"
        }, {
            "inPageName" : "task_end",
            "inUrl" : "task_list/task_end.html"
        }],
        top : titHeight,
        left : 0,
        index : 0,
        name : "taskListContent",
        change : function(index, res) {/*浮动窗口推拽变更时回调，可控制tab进行同步变更*/
            showNewsFooter(res.multiPopSelectedIndex);
            tabview.moveTo(res.multiPopSelectedIndex);
            if(numOpen==0){
                uexWindow.evaluateMultiPopoverScript("", "taskListContent", "task_end", "refreshList()");
                numOpen++;
            }
        }
    });
    window.onorientationchange = window.onresize = function() {
        resizeWidow();
        //appcan.frame.resize("content", 0, top);

    }
});

function showNewsFooter(index){
    if(index==0){
        appcan.window.evaluateScript("task","showNewsFooter()");
    }else{
        appcan.window.evaluateScript("task","hideNewsFooter()");
    }
}
function resizeWidow(){
    var width=$('body').width();
    var height=$("#content").height();
    /*appcan.window.resizePopover({
     name:'newsListContent',
     left:0,
     top:titHeight,
     width:width,
     height:height
     });*/
    uexWindow.setMultiPopoverFrame("taskListContent",0,titHeight,width,height);
}

/*全选中*/
function open_check(){
    uexWindow.evaluateMultiPopoverScript('','taskListContent','task_processing','open_check()');
}
/*取消全选*/
function close_check(){
    uexWindow.evaluateMultiPopoverScript('','taskListContent','task_processing','close_check()');
}

/*孙页面取消主页面全选*/
function all_check(){
    appcan.window.evaluateScript('task','all_check()');
}

/*关闭任务*/
function close_task(){
    uexWindow.evaluateMultiPopoverScript('','taskListContent','task_processing','close_task()');
}

/*刷新已结束页面*/
function refreshEnd(){
    uexWindow.evaluateMultiPopoverScript("", "taskListContent", "task_end", "refreshList()");
}

/*上报事件*/
/*function event_report(){
    uexWindow.evaluateMultiPopoverScript('','taskListContent','task_processing','event_report()');
}*/

function refresh(eventStatus){
    if(eventStatus=="21"){
        appcan.window.selectMultiPopover("taskListContent",1);
        uexWindow.evaluateMultiPopoverScript("", "taskListContent", "task_end", "refreshList()");
    }else if(eventStatus=="20"){
        appcan.window.selectMultiPopover("taskListContent",0);
        uexWindow.evaluateMultiPopoverScript("", "taskListContent", "task_processing", "refreshList()");
    }
}
/*关闭任务删除处理中*/
function taskID_remover(e){
    uexWindow.evaluateMultiPopoverScript('','taskListContent','task_processing','taskID_remover("'+e+'")');
}
