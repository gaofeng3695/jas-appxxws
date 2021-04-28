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
        label : "事件信息"
    }, {
        label : "处置信息"
    }]
});
tabview.on("click",function(obj, index){ /*TAB变更时切换多浮动窗口*/
    detailFooter(index);
    appcan.window.selectMultiPopover("detailsListContent",index);
});

appcan.ready(function() {
    var tabIndex=appcan.locStorage.getVal("tabIndex_param");
    if(tabIndex=="1"){
        tabview.moveTo(Number(tabIndex));
        //showNewsFooter(Number(tabIndex));
    }
    var parentTitHeight=appcan.locStorage.getVal("task_details_content_titHeight");
    titHeight = parseInt(parentTitHeight)+$('#tabview').offset().height;
    appcan.locStorage.remove("task_details_content_titHeight");
    appcan.frame.open({/*创建多浮动窗口*/
        id : "content",
        url : [ {
            "inPageName" : "task_event",//事件信息
            "inUrl" : "task_list/task_event.html"
        }, {
            "inPageName" : "task_disposal",  //处置信息
            "inUrl" : "task_list/task_disposal.html"
        }],
        top : titHeight,
        left : 0,
        index : Number(tabIndex),
        name : "detailsListContent",
        change : function(index, res) {/*浮动窗口推拽变更时回调，可控制tab进行同步变更*/
           
            /*
             * 切换tab页面后 -隐藏分享工具条
             * sf 2017-05-17 新增
             */
            uexWindow.evaluateMultiPopoverScript("", "detailsListContent", "task_event", "hideShareTools()");
            uexWindow.evaluateMultiPopoverScript("", "detailsListContent", "task_disposal", "hideShareTools()");
            
            detailFooter(res.multiPopSelectedIndex);
            tabview.moveTo(res.multiPopSelectedIndex);
            if(numOpen==0){
                if(tabIndex=='1'){
                    uexWindow.evaluateMultiPopoverScript("", "detailsListContent", "task_event", "initEventData()");
                }else{
                    uexWindow.evaluateMultiPopoverScript("", "detailsListContent", "task_disposal", "refreshList()");
                }
                numOpen++;
            }else{
                numOpen++;
            }
        }
    });
    window.onorientationchange = window.onresize = function() {
        resizeWidow();
        //appcan.frame.resize("content", 0, top);
    };

    var pageNumber=appcan.locStorage.getVal("page_num");
    appcan.locStorage.remove("page_num");
    if(pageNumber==1){
        refresh(1);
    }else{
        return false;
    }

});

function detailFooter(index){
    appcan.window.evaluateScript("task_details","detailFooter("+index+")");
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
    uexWindow.setMultiPopoverFrame("detailsListContent",0,titHeight,width,height);
}
/*打开第几个页面*/
function refresh(eventStatus){
    if(eventStatus=="1"){
        appcan.window.selectMultiPopover("detailsListContent",1);
        uexWindow.evaluateMultiPopoverScript("", "detailsListContent", "task_disposal", "refreshList()");
    }else if(eventStatus=="0"){
        appcan.window.selectMultiPopover("detailsListContent",0);
    }
}

