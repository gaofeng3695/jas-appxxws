var titHeight=0;
var isSysadmin=false;
var openNum=0;
var tabview = appcan.tab({
    selector : "#tabview",
    hasIcon : false,
    hasAnim : true,
    hasLabel : true,
    hasBadge : true,
    data : [{
        label : "企业消息",
    },{
        label : "系统消息",
    }]
});
tabview.on("click",function(obj, index){ /*TAB变更时切换多浮动窗口*/
    appcan.window.selectMultiPopover("newsListContent",index);
});

appcan.ready(function() {
    appcan.initBounce();
    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    if(userBo!= undefined && userBo.isSysadmin!=undefined && userBo.isSysadmin=="1"){
        isSysadmin=true;
    }
    var parentTitHeight=appcan.locStorage.getVal("news_content_titHeight");
    titHeight = parseInt(parentTitHeight)+$('#tabview').offset().height;
    appcan.locStorage.remove("news_content_titHeight");
    appcan.frame.open({/*创建多浮动窗口*/
        id : "content",
        // url : [{
            // "inPageName" : "system_news",//系统消息
            // "inUrl" : "systemnews_content.html",
        // }, {
            // "inPageName" : "enterprise_news",//企业消息
            // "inUrl" : "enterprisenews_content.html",
        // }, {
            // "inPageName" : "myWork_news",
            // "inUrl" : "myworknews_content.html",
        // }],
        url : [{
            "inPageName" : "enterprise_news",//企业消息
            "inUrl" : "enterprisenews_content.html"
        },{
            "inPageName" : "system_news",//系统消息
            "inUrl" : "systemnews_content.html"
        }],
        top : titHeight,
        left : 0,
        index : 0,
        name : "newsListContent",
        change : function(index, res) {/*浮动窗口推拽变更时回调，可控制tab进行同步变更*/
            showNewsFooter(res.multiPopSelectedIndex);
            tabview.moveTo(res.multiPopSelectedIndex);
            if(openNum==0){
                uexWindow.evaluateMultiPopoverScript("", "newsListContent", "system_news", "refreshList()");
                openNum++;
            }
        }
    });
    window.onorientationchange = window.onresize = function() {
        resizeWidow();
        //appcan.frame.resize("content", 0, top);
        
    }
}); 
function showNewsFooter(index){
    if(!isSysadmin){
        return ;
    }
    if(index==0){
        appcan.window.evaluateScript("news","showNewsFooter()");
    }else{
        appcan.window.evaluateScript("news","hideNewsFooter()");
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
    uexWindow.setMultiPopoverFrame("newsListContent",0,titHeight,width,height);
}
function refreshList(){
    uexWindow.evaluateMultiPopoverScript("","newsListContent","enterprise_news","refreshList()");
}
