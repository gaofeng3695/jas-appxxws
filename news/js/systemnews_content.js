var pageNumber=1;
var pageSize=20;
var bindData = [];
var _index = 1;
var jasHttpRequest = null;
var queryParam="";
var lv = appcan.listview({
    selector : "#systemNewsList",
    type : "thinLine",
    hasIcon : false,//是否图片
    hasAngle : false,//是否箭头
    hasSubTitle : false,
    myList : false,
      // hasRadiobox:true,
     multiLine : 4
});

function initData(){
    baseOperation.londingToast("数据加载中，请稍候...");
    // var partURL = 'cloudlink-inspection-message/message/queryListMsgToMe';
    var partURL = 'cloudlink-inspection-message/message/getPageListToMe';
    var dataObj=null;
    if(queryParam!=undefined && queryParam!=""){
        dataObj={"type":"0","pageSize":pageSize,"pageNum":pageNumber,"queryParam":queryParam};
    }else{
        dataObj={"type":"0","pageSize":pageSize,"pageNum":pageNumber};
    }
    jasHttpRequest.jasHttpPost(partURL,onDataCallback,JSON.stringify(dataObj));
    // testData();
}
function onDataCallback(id, state, dbSource){
    if(dbSource.length==0){
        baseOperation.alertToast("网络繁忙，请稍候再试...");
        return ;
    }
    bindData=[];
    var resultData=JSON.parse(dbSource);
    var tempData = [];
    if(resultData.success=="1"){
        var data=resultData.rows;
        if(data.length==0){
            if(queryParam == "" && pageNumber==1){
                $("#systemNewsList").html("<p class='tx-c'>暂无数据</p>");
            }else if( queryParam !="" && pageNumber==1){
                $("#systemNewsList").html("<p class='tx-c'>没有找到搜索结果</p>");
            }else{
                baseOperation.alertToast("没有更多的数据...");
            }
            baseOperation.closeToast();
        }else{
            for(var i=0;i<data.length;i++){
                var _item = {title:"",eventid:"","content":""};
                var content=JSON.stringify(data[i]);
                _item.title='<div class="news_list us1">'+
                            '<div class="ubb sc-border-cor news_title">'+
                                '<span>'+ data[i].sendTime+'</span>'+
                                '<span class="ufr news_state'+ data[i].readStatus+'" id="readStatus">未读</span>'+
                                '<span class="ufr line1 line_hidden news_user_name">发起人：'+ data[i].senderName+'</span>'+
                            '</div>'+
                            '<div class="news_main" onclick="viewInfo(this)">'+
                                '<dl class="">'+
                                    '<dt class="ulev0 uof">'+
                                        '<span class="news_head line1">'+data[i].title+'</span>'+
                                    '</dt>'+
                                    '<dd class="ulev0 line2">'+ data[i].content+'</dd>'+
                                    '<span class="contentData" style="display:none;">'+JSON.stringify(data[i])+'</span>'+
                                '</dl>'+
                            '</div>'+
                        '</div>';
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
    pageNumber=pageNumber+1;
    initData();
}
function updateState(obj,id){
    var partURL = 'cloudlink-inspection-message/message/updateReadState?msgId='+id;
    jasHttpRequest.jasHttpGet(partURL,function(id,state,resultData){
        // refreshList();
        // $(obj).removeClass("news_state0").addClass("news_state1");
        $(obj).parent().find("#readStatus").removeClass("news_state0").addClass("news_state1");
    });
}
function viewInfo(obj){
    var content=$(obj).find('.contentData').html();
    appcan.locStorage.setVal("newsContent_param",content);
    appcan.openWinWithUrl("news_details","news_details_tome.html");
    var contentJson=JSON.parse(content);
    if(contentJson.readStatus=="0"){
        updateState(obj,contentJson.objectId);
    }
}
/**
 * 根据查询条件请求数据
 */
$("#search").on('click',function(){
    queryParam=$("#queryParam").val().trim();
    
    pageNumber=1;
    initData();
});

appcan.ready(function() {
    jasHttpRequest = new JasHttpRequest();
    appcan.initBounce();
    refreshBounce(refreshList,more);
    //initData();
});
function deleteQueryParam(obj){
    queryParam="";
    $(obj).parent().find('input').val('');
    $(obj).css('visibility','hidden')
}
