var pageNumber=1;
var pageSize=20;
var bindData = [];
var _index = 1;
var queryParam="";
var totalPages="0";
var jasHttpRequest = new JasHttpRequest();

var lv = appcan.listview({
    selector : "#sentNewsList",
    type : "thinLine",
    hasIcon : false,//是否图片
    hasAngle : false,//是否箭头
    hasSubTitle : false,
    myList : true,
      // hasRadiobox:true,
     multiLine : 4
});

lv.on("click",function(obj,data,subObj){
    appcan.locStorage.setVal("newsContent_param",data.content);
    appcan.openWinWithUrl("news_details","../news_details.html");
});

appcan.ready(function() {
    appcan.initBounce();
    refreshBounce(refreshList,more);
    initData();
});
/**
 * 获取数据 
 */
function initData(){
    baseOperation.londingToast("数据加载中，请稍候...");
    // var partURL = 'cloudlink-inspection-message/message/queryListMsgFromMe';
    var partURL = 'cloudlink-inspection-message/message/getPageListFromMe';
    var dataObj=null;
    if(queryParam!=undefined && queryParam!=""){
        dataObj={"type":"1","pageSize":pageSize,"pageNum":pageNumber,"queryParam":queryParam};
    }else{
        dataObj={"type":"1","pageSize":pageSize,"pageNum":pageNumber,"queryParam":queryParam};
    }
    jasHttpRequest.jasHttpPost(partURL,onDataCallback,JSON.stringify(dataObj));
}
function onDataCallback(id, state, dbSource){
    if(dbSource.length==0){
        baseOperation.alertToast("已发消息列表返回值：网关异常");
        return ;
    }
    bindData=[];
    // uexLog.sendLog(dbSource);
    var tempData=[];
    var resultData=JSON.parse(dbSource);
    if(resultData.success=="1"){
        var data=resultData.rows;
        totalPages=resultData.totalPages;
        if(data.length==0){
            if(queryParam == "" && pageNumber==1){
                $("#sentNewsList").html("<p class='tx-c'>暂无数据</p>");
                baseOperation.closeToast();
            }else if( queryParam !="" && pageNumber==1){
                $("#sentNewsList").html("<p class='tx-c'>没有找到搜索结果</p>");
                baseOperation.closeToast();
            }else{
                baseOperation.alertToast("没有更多的数据...");
            }
        }else{
            for(var i=0;i<data.length;i++){
                var _item={title:"",eventid:"","content":""};
                _item.title='<div>'+
                            '<div class="ub ub-ac news_list_p">'+
                                '<div class="news_main ub-f1">'+
                                    '<dl class="ub-f1">'+
                                        '<dt class="ulev0 ub ub-ac uof">' + 
                                            '<span class="news_head ub-f1 line1">'+data[i].title+'</span>'+
                                            '<span class="news_time">'+ data[i].sendTime+'</span>'+
                                        '</dt>'+
                                        '<dd class="line2">'+ data[i].content+'</dd>'+
                                    '</dl>'+
                                '</div>'+
                            '</div>'+
                        '</div>';
                _item.content=data[i];
                tempData.push(_item);
            }
            bindData = bindData.concat(tempData);
            if(pageNumber>1){
                lv.add(bindData,1);
            }else{
                lv.set(bindData);
            }
            baseOperation.closeToast();
        }
    }else{
        baseOperation.alertToast("网络繁忙，请稍候再试...");
        setTimeout(function(){
            $("#systemEventList").html("<p class='tx-c'>暂无数据</p>");
        },2000);
        return ;
    }
}
function refreshList(){
    queryParam=$("#queryParam").val().trim();
    pageNumber=1;
    initData();
}
function more(){
    if(parseInt(totalPages)==pageNumber){
        baseOperation.alertToast("没有更多的数据了...");
    }
    pageNumber=pageNumber+1;
    initData();
}
$("#search").on('click',function(){
    queryParam=$("#queryParam").val().trim();
    pageNumber=1;
    initData();
});
function deleteQueryParam(obj){
    queryParam="";
    $(obj).parent().find('input').val('');
    $(obj).css('visibility','hidden')
}