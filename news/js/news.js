appcan.ready(function() {
    appcan.window.disableBounce();
    var titHeight = $('#header').offset().height;
    appcan.locStorage.setVal("news_content_titHeight", titHeight);
    appcan.frame.open("content", "news_content.html", 0, titHeight,"news_content");
    window.onorientationchange = window.onresize = function() {
        resizeWindowSize();
    }
    
    resizeWindowSize();
    //物理返回键监听
    uexWindow.setReportKey(0,1);
    uexWindow.onKeyPressed =function(keyCode){
        if(keyCode==0){
            appcan.window.evaluateScript('index','refresNewsNumber()');
            appcan.window.close(-1);
        }
    };
    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    if(!(userBo!= undefined && userBo.isSysadmin!=undefined && userBo.isSysadmin=="1")){
        hideNewsFooter();
    }
});
$("#nav-left").on('click', function() {
    appcan.window.evaluateScript('index','refresNewsNumber()');
    appcan.window.close(-1);
});
appcan.button("#enitNews","btn-act", function() {
    //uexLog.sendLog(1);
    appcan.openWinWithUrl("enitNews","editnews/editnews.html");
});
function showNewsFooter(){
    $("#footer").addClass("ub");
    $("#footer").show();
    resizeWindowSize();
}
function hideNewsFooter(){
    $("#footer").removeClass("ub");
    $("#footer").hide();
    resizeWindowSize();
}
function resizeWindowSize(){

        var width=$('body').width();
        var height=$("#content").height();
        var titHeight = $('#header').offset().height;
        appcan.window.resizePopover({
            name:'news_content',
            left:0,
            top:titHeight,
            width:width,
            height:height
        });

   //uexWindow.evaluatePopoverScript("","news_content","resizeWidow()");
}
