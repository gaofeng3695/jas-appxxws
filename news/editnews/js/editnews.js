/**
 * 初始化界面 
 */
appcan.ready(function() {
    // appcan.initBounce();
    appcan.window.disableBounce();
    var titHeight = $('#header').offset().height;
    appcan.locStorage.setVal("editNews_content_titHeight", titHeight);
    appcan.frame.open("content", "enitnews_content.html", 0, titHeight,"enitNews_content");
    window.onorientationchange = window.onresize = function() {
        resizeWindowSize();
    }
    hideFooter();
    //物理返回键监听
    uexWindow.setReportKey(0,1);
    uexWindow.onKeyPressed =function(keyCode){
        if(keyCode==0){
            appcan.window.evaluatePopoverScript("news","news_content","refreshList()");
            appcan.window.close(-1);
        }
    };
});
/**
 * 返回按钮 
 */
appcan.button("#nav-left","btn-act", function() {
    appcan.window.evaluatePopoverScript("news","news_content","refreshList()");
    appcan.window.close(-1);
});
/**
 * 新增按钮 
 */
// appcan.button("#nav-right", function() {
    // uexLog.sendLog(1);
    // //appcan.openWinWithUrl("enitNews", "editnews/enitNews.html");
// });
function addNews(){
    appcan.locStorage.remove("userSelect");
    appcan.openWinWithUrl("addNews", "addnews.html");
}
/**
 * 删除未发布的消息 
 */
// appcan.button("#deleteUnsentNews",function(){
//     
// });
var flag=true;
function deleteUnsentNews(){
    if(flag){
        flag=false;
        appcan.window.evaluatePopoverScript("enitNews","enitNews_content","deleteUnsentNews()");
    }
}
/**
 * 发布消息
 */
function publishUnsentNews(){

    if(flag){
        flag=false;
        appcan.window.evaluatePopoverScript("enitNews","enitNews_content","publishUnsentNews()");
    }
}
function changeButtonStatus(){
    flag=true;
}
/**
 * 显示底部的按钮 
 */
function showFooter(){
    $("#footer").addClass("ub");
    $("#footer_center").addClass("ub");
    $("#footer").show();
    resizeWindowSize();
}
/**
 * 隐藏底部的按钮 
 */
function hideFooter(){
    $("#footer").removeClass("ub");
    $("#footer_center").removeClass("ub");
    $("#footer").hide();
    resizeWindowSize();
}
/**
 * 界面大小改变时，重置浮动窗口的位置和大小 
 */
function resizeWindowSize(){
    var width=$('body').width();
    var height=$("#content").height();
    var titHeight = $('#header').offset().height;
    appcan.window.resizePopover({
        name:'enitNews_content',
        left:0,
        top:titHeight,
        width:width,
        height:height
    });
}
/*全选*/
$(".for_check").on("click",function(){
    if($(this).hasClass("for_on_check")){
        $(this).removeClass("for_on_check");
        appcan.window.evaluatePopoverScript("enitNews","enitNews_content","close_check()");
    }else{
        $(this).addClass("for_on_check");
        appcan.window.evaluatePopoverScript("enitNews","enitNews_content","open_check()");
    }
});

/*取消全选样式*/
function all_check(state){
    if(state=='0'){
        $(".for_check").removeClass("for_on_check");
        $("#event_check").prop("checked",false); 
    }else if(state=="1"){
        $(".for_check").addClass("for_on_check");
        $("#event_check").prop("checked",true);
    }
}

function refreshList(state){
    appcan.window.evaluatePopoverScript("enitNews","enitNews_content","refresh('"+state+"')");
}
