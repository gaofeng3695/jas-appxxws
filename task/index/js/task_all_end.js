/**
 * Created by Administrator on 2016/10/31.
 */
var pageSize = 20;
var pageNum=1;
var bindData = [];
var _index = 1;
var data_all=null;

var jasHttpRequest = null;
var queryParam="";
var lv = appcan.listview({
    selector : "#systemEventList",
    type : "thinLine",
    hasIcon : false,//是否图片
    hasAngle : false,//是否箭头
    hasSubTitle : false,
    myList : true,
    // hasRadiobox:true,
    multiLine : 4
});
appcan.ready(function() {
    jasHttpRequest = new JasHttpRequest();
    refreshBounce(refreshList,more);
//    initData();
});
/**
 * 根据查询条件请求数据
 */
$("#search").on('click',function(){
    pageNum=1;
    queryParam=$("#queryParam").val().trim();
    initData();
});
lv.on("checkbox:change",function(obj,data){
    console.log(obj);
    console.log(data);
});
/*向后台请求数据*/
function initData(){
    //uexLog.sendLog("全部完成中");
    baseOperation.alertToast("数据加载中，请稍候...");
    bindData=[];
    var dataObj=null;
    if(queryParam!=""){
        dataObj={"pageNum":pageNum,"pageSize":pageSize,"disposeState":"21","queryCondition":queryParam};
    }else{
        dataObj={"pageNum":pageNum,"pageSize":pageSize,"disposeState":"21"};
    }
    var partURL = 'cloudlink-inspection-task/task/getPageListForEnterprise';
    jasHttpRequest.jasHttpPost(partURL,onDataCallback,JSON.stringify(dataObj));
}

/*请求json，遍历返回值*/
function onDataCallback(id, state, dbSource){
    //uexLog.sendLog("data1:"+dbSource);
    if(dbSource.length==0){
        baseOperation.alertToast("网络繁忙，请稍候再试...");
        return ;
    }
    var resultData=JSON.parse(dbSource);
    var tempData = [];
    if(resultData.success=="1"){
        data_all=resultData.rows;
        if(data_all.length==0){
            if(queryParam == "" && pageNum==1){
                $("#systemEventList").html("<p class='tx-c'>暂无数据</p>");
                baseOperation.closeToast();
            }else if( queryParam !="" && pageNum==1){
                $("#systemEventList").html("<p class='tx-c'>没有找到搜索结果</p>");
                baseOperation.closeToast();
            }else{
                baseOperation.alertToast("没有更多的数据...");
            }
        }else {
            for (var i = 0; i < data_all.length; i++) {
                if(data_all[i].eventIconName =="" || data_all[i].eventIconName == null){
                    data_all[i].eventIconName = "D01.png";
                }
                var _item = {title: ""};
                _item.title = '<div class="event_list us1" onclick="enter_list(this);">' +
                    '<input type="hidden" name="taskId" value="' + data_all[i].taskId + '" />' +
                    '<input type="hidden" name="eventId" value="' + data_all[i].eventId + '" />' +
                    '<div class="event_title">' +
                    '<h1>任务号：<span class="event_mun">' + data_all[i].code + '</span>' +
                    '<span class="ufr userName line1 line_hidden">' + data_all[i].inspectorName + '</span>' +
                    '</h1></div>' +
                    '<div class="event_main ub ub-ac">' +
                    '<div class="ub-ac ub-fv event_checkP">' +
                    '<div class="event_img ub-f1"><img src="../index/icons/'+data_all[i].eventIconName+'"/></div>' +
                    '</div>' +
                    '<dl class="ub-f1 event_jump"><dt class="line3">' + data_all[i].description + '</dt>' +
                    '<dd><span class="event_userName line1 line_hidden">最新处置：' + data_all[i].disposeUserName + '</span>&nbsp;&nbsp;<span class="event_date">' + data_all[i].disposeTime + '</span></dd>' +
                    '</dl></div></div>';
                tempData.push(_item);
            }
            bindData = bindData.concat(tempData);
            if (pageNum > 1) {
                lv.add(bindData,1);
            } else {
                lv.set(bindData);
            }
            baseOperation.closeToast();
        }
    }else{
            baseOperation.alertToast("网络繁忙，请稍候再试...");
            return ;
        }
}

/*跳转到详情页面*/
function enter_list(e){
    var taskId=$(e).find("input[name='taskId']").val();
    var eventId=$(e).find("input[name='eventId']").val();
    var params={
        "taskId":taskId,
        "eventId":eventId
    };
    appcan.locStorage.setVal("event_Id",eventId );
    appcan.locStorage.setVal("task_only_id",taskId );
    appcan.locStorage.remove("tabIndex_param");
    appcan.locStorage.setVal("tabIndex_param","1");
    appcan.locStorage.remove("bottom_operation");
    appcan.locStorage.setVal("bottom_operation","bottom");
    appcan.openWinWithUrl("task_details","../task_details.html");
}

/*向上拉，重新加载*/
function refreshList(){
    queryParam=$("#queryParam").val().trim();
    pageNum=1;
    initData();
}

/*向下拉，重新加载*/
function more(){
    pageNum=pageNum+1;
    initData();
}
