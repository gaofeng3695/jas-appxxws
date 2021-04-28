
    /*
    *
    * */

appcan.ready(function() {
    var titHeight = $('#header').offset().height;
    appcan.locStorage.setVal("task_content_titHeight", titHeight);
    appcan.frame.open("content", "task_all_content.html", 0, titHeight,"task_all_content");
    window.onorientationchange = window.onresize = function() {
        resizeWindowSize();
    };

   //物理返回键监听
    uexWindow.setReportKey(0,1);
    uexWindow.onKeyPressed =function(keyCode){
        if(keyCode==0){
            appcan.window.evaluatePopoverScript('index','index_content','refresTasks()');//刷新主界面的任务列表
            appcan.window.close(-1);
        }
    };
});

appcan.button("#nav-left","btn-act", function() {
    appcan.window.evaluatePopoverScript('index','index_content','refresTasks()');//刷新主界面的任务列表
    appcan.window.close(-1);
});

/*打开事件上报*/
/*appcan.button(".event_add", function() {
    appcan.openWinWithUrl("event_report","event_report.html");
});*/
/*打开事件地图*/
appcan.button("#nav-right","btn-act", function() {
    // appcan.window.open("task_all","task_all_content.html",aniId,type,dataType,width,height,animDuration,extraInfo)
    appcan.openWinWithUrl("task","task.html","9","0","200");
    setTimeout(function() {
        appcan.window.close("9","500");
    }, 500);
});

/*控制foot*/
function showNewsFooter(){
    $("#footer").addClass("ub").show();
    resizeWindowSize();
}
function hideNewsFooter(){
    $("#footer").removeClass("ub").hide();
    resizeWindowSize();
}




/*改变主窗口的大小*/
function resizeWindowSize(){
    //setTimeout(function(){
        var width=$('body').width();
        var height=$("#content").height();
        var titHeight = $('#header').offset().height;
        appcan.window.resizePopover({
            name:'task_content',
            left:0,
            top:titHeight,
            width:width,
            height:height
        });
    //},200);
    //uexWindow.evaluatePopoverScript("","news_content","resizeWidow()");
}

/*全选*/
function allCheck(e){
    if($(e).hasClass("for_on_check")){
        $(e).removeClass("for_on_check");
        appcan.window.evaluatePopoverScript('task','task_content','close_check()');
    }else{
        $(e).addClass("for_on_check");
        appcan.window.evaluatePopoverScript('task','task_content','open_check()');
    }
}
/*取消全选样式*/
function all_check(){
    $(".for_check").removeClass("for_on_check");
    $("#event_check").prop("checked",false);
}

/*关闭任务*/
function close_task() {

    appcan.window.evaluatePopoverScript('task','task_content','close_task()');

}
/*刷新已结束页面*/
function refreshEnd(){
    appcan.window.evaluatePopoverScript('task','task_content','refreshEnd()');
}
/*上报*/
/*$(".event_report").click(function() {
    appcan.window.confirm({
        title:'提示',
        content:'小提示',
        buttons:['确定','取消'],
        callback:function(err,data,dataType,optId){
            if(err || data ===1){
                //如果出错了
                return;
            }
            if(data===0){
//                        appcan.window.evaluatePopoverScript('event_management','content','remove()');
            }
            //data 按照按钮的索引返回值
        }
    });
});*/


appcan.button("#allTask","btn-act", function() {
    //baseOperation.alertToast("此功能暂未开放");
});
