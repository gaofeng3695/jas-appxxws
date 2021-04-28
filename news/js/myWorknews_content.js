var rows = 20;
var bindData = [];
var _index = 1;
var jasHttpRequest = null;
var lv = appcan.listview({
    selector : "#myWorkNewsList",
    type : "thinLine",
    hasIcon : false,//是否图片
    hasAngle : false,//是否箭头
    hasSubTitle : false,
    myList : true,
      // hasRadiobox:true,
     multiLine : 4
});
lv.on("click",function(obj,data,subObj){
    // uexLog.sendLog(JSON.stringify(data));
})
appcan.ready(function() {
    jasHttpRequest = new JasHttpRequest();
    appcan.initBounce();
    refreshBounce(refreshList,more);
    initData();
});
function initData(){
    //$("#myWorkNewsList").html("");
    // var partURL = 'cn-cloudlink-inspection-event/inspection/saveInspection';
    // var partURL = 'cloudlink-inspection-message/queryListMsgToMe';
    var partURL = 'cloudlink-inspection-message/message/getPageListToMe';
    var dataObj={"type":"3","rows":rows};
    jasHttpRequest.jasHttpPost(partURL,onDataCallback,JSON.stringify(dataObj));
}
function onDataCallback(id, state, dbSource){
    var tempData=[];
   /* var resultData=JSON.parse(dbSource);
    if(resultData.success=="1"){
        var data=resultData.rows;
        var option="";
        for(var i=0;i<data.length;i++){
            var _item={title:"",eventid:""};
            _item.title='<div class="news_list us1">'+
                        '<div class="ubb sc-border-cor news_title">'+
                            '<span>'+ data[i].sendTime+'</span>'+
                            '<span class="ufr news_state'+ data[i].readStatus+'">未读</span>'+
                            '<span class="ufr">发起人：'+ data[i].senderName+'</span>'+
                        '</div>'+
                        '<div class="news_main ub-f1">'+
                            '<dl class="ub-f2">'+
                                '<dt class="ulev0 uof">'+
                                    '<span class="news_head line1">'+data[i].title+'</span>'+
                                '</dt>'+
                                '<dd class="ulev0 line2">'+ data[i].content+'</dd>'+
                            '</dl>'+
                        '</div>'+
                    '</div>';
            tempData.push(_item);
        }
        //$("#myWorkNewsList").append(option);
        bindData = bindData.concat(tempData);
        lv.set(bindData);
    }*/
    // $.getJSON("index/css/main.json", function (data) {
        // var option="";
        // for(var i=0;i<data.length;i++){
            // var _item = {title:"",eventid:""};
            // _item.title='<div>'+
                        // '<div class="ubb sc-border-cor news_title">'+
                            // '<span>'+ data[i].date+'</span>'+
                            // '<span class="ufr news_state'+ data[i].whether+'">未读</span>'+
                            // '<span class="ufr">发起人：'+ data[i].name+'</span>'+
                    // '</div>'+
                    // '<div class="news_main">'+
                        // '<dl>'+
                            // '<dt class="ulev1">'+ data[i].title+'</dt>'+
                            // '<dd class="ulev0 line2">'+ data[i].content+'</dd>'+
                    // '</dl></div></div>';
            // tempData.push(_item);
        // }
        // bindData = bindData.concat(tempData);
        // lv.set(bindData);
        //$("#myWorkNewsList").append(option);
    //});
}
function refreshList(){
    rows=20;
    initData();
}
function more(){
    rows=rows+20;
    initData();
}