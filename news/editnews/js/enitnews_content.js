var titHeight=0;
var openNum=0;
var tabview = appcan.tab({
    selector : "#tabview",
    hasIcon : false,
    hasAnim : true,
    hasLabel : true,
    hasBadge : true,
    data : [{
        label : "已发送",
    },{
        label : "草稿箱",
    }]
});
/**
 * tab点击事件 
 */
tabview.on("click",function(obj, index){ /*TAB变更时切换多浮动窗口*/
    appcan.window.selectMultiPopover("sentNewWin",index);
});
/**
 * 初始化界面 
 */
appcan.ready(function() {
    appcan.initBounce();
    var parentTitHeight=appcan.locStorage.getVal("editNews_content_titHeight");
    titHeight = parseInt(parentTitHeight)+$('#tabview').offset().height;
    //打开多浮动窗口
    appcan.frame.open({
        id : "content",
        url : [{
            "inPageName" : "sent_news",//已发消息
            "inUrl" : "sentnews_content.html"
        },{
            "inPageName" : "unsent_new",//草稿箱
            "inUrl" : "unsentnews_content.html"
        }],
        top : titHeight,
        left : 0,
        index : 0,
        name:"sentNewWin",
        change : function(index, res) {
           tabview.moveTo(res.multiPopSelectedIndex);
           showOrHideButton(res.multiPopSelectedIndex);
           if(openNum==0){
                uexWindow.evaluateMultiPopoverScript("", "sentNewWin", "unsent_new", "initData()");
                openNum++;
            }
        }
    });
    // 界面大小改变时，改变浮动窗口的大小
    window.onorientationchange = window.onresize = function() {
        //appcan.frame.resize("content", 0, top);
        var width=$('body').width();
        var height=$("#content").height();
        /*appcan.window.resizePopover({
            name:'sentNewWin',
            left:0,
            top:titHeight,
            width:width,
            height:height
        });*/
       // 多浮动窗口大小改变
       uexWindow.setMultiPopoverFrame("sentNewWin",0,titHeight,width,height);
    }
}); 
/**
 * 当点击tab或者滑动切换页面是，显示底部的按钮 
 * @param {Object} index
 */
function showOrHideButton(index){
    if(index==1){
        appcan.window.evaluateScript("enitNews","showFooter()");
    }else if(index==0){
        appcan.window.evaluateScript("enitNews","hideFooter()");
    }
}
/**
 * 删除未发布的消息 
 */
function deleteUnsentNews(){
    // 多页面浮动窗口中执行js脚本
    uexWindow.evaluateMultiPopoverScript("","sentNewWin","unsent_new","deleteUnsentNews()");
}
/**
 * 删除未发布的消息 
 */
function publishUnsentNews(){
    // 多页面浮动窗口中执行js脚本
    uexWindow.evaluateMultiPopoverScript("","sentNewWin","unsent_new","publishUnsentNews()");
}

function close_check(){
    uexWindow.evaluateMultiPopoverScript("","sentNewWin","unsent_new","close_check()");
}
function open_check(){
    uexWindow.evaluateMultiPopoverScript("","sentNewWin","unsent_new","open_check()");
}

function refresh(state){
    if(state=="1"){
        appcan.window.selectMultiPopover("sentNewWin",1);
        uexWindow.evaluateMultiPopoverScript("","sentNewWin","unsent_new","initData()");
    }else if(state=="0"){
       appcan.window.selectMultiPopover("sentNewWin",0);
       uexWindow.evaluateMultiPopoverScript("","sentNewWin","sent_news","refreshList()"); 
    }else if(state=="2"){
        uexWindow.evaluateMultiPopoverScript("","sentNewWin","sent_news","refreshList()"); 
    }
}
