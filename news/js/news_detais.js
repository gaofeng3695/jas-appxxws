var data = [];
var jasHttpRequest=null;
var receiverNames="";
appcan.ready(function() {
    jasHttpRequest = new JasHttpRequest();
    appcan.initBounce();
    var withAll=($(".img_details").width()-21)/3;
    var details_main=appcan.locStorage.getVal("newsContent_param");
    var details=JSON.parse(details_main);
    appcan.locStorage.remove("newsContent_param");
//    event_id=details.objectId;
    $("#content").find("p").text(details.content);    
    $("#sendTime").html(details.sendTime); 
    $("#title").html(details.title);
    if(details.receiverNames!=undefined && details.receiverNames!=""){
        $("#receiverNames").html(details.receiverNames);
        receiverNames=details.receiverNames;
    }else{
        $("#receiverNames").html('');
    }
//    $(".details_statusValue").text(details.statusValue);
    var url_id=details.pic;
    var pic_scr='';
    $(".img_details").html("");

    $(".camera_number").text(url_id.length);
    
    for(var i=0; i<url_id.length; i++){
        pic_scr += '<div class="ufl img_width ub-ac"><span>' +
            // '<img src="http://106.37.179.154:8050/cloudlink-core-file/file/getImageBySize?fileId=' + url_id[i] + '" width="100%" alt=""/>' +
            '<img  src="'+serverURL+'cloudlink-core-file/file/getImageBySize?fileId=' + url_id[i] + '&viewModel=fill&width='+parseInt(withAll)+'&hight='+parseInt(withAll)+'" onclick="previewPicture(this)" id="'+i+'" alt=""/>' +
            '</span></div>';
        var obj = {
            "src" : serverURL+'cloudlink-core-file//file/downLoad?fileId=' + url_id[i]
        };
        data.push(obj);
    }
    $(".img_details").append(pic_scr);
    $(".img_width").width(withAll-2);
    $(".img_width").height(withAll-2);

    if(details.parentTypeId==2){
        $(".parentTypeId").attr("src","index/images/disasters.png");
    }else if(details.parentTypeId==1){
        $(".parentTypeId").attr("src","index/images/construction.png");
    }else{
        $(".parentTypeId").attr("src","index/images/pipe.png");
    }
});

/*浏览照片*/
function previewPicture(thisObj) {
    var index=thisObj.id;
    var dataParam = {
        displayActionButton : true,
        displayNavArrows : true,
        enableGrid : false,
        startOnGrid : false,
        startIndex : Number(index),
        data : data
    };
    var json = JSON.stringify(dataParam);
    uexImage.openBrowser(json);
}
function showMove(obj){
    if(receiverNames!=""){
        try{
            $("#bubble1").remove();
            var left = $(obj).parent().position().left;
            var top = $(obj).position().top;
            var width = $(obj).parent().width() / 2;
            var htmlTemp = "<div id='bubble1' class='bubble1' style='left:" + width + "px;'><span class='ulev26' id='delete_div' >"+receiverNames+"</span></div>";
            $(obj).parent().append(htmlTemp);
            var x = width - $("#bubble1").width() / 2+left;
            var y=top+$(obj).height();
            $("#bubble1").css("left", x);
            $("#bubble1").css("top", y);
        }catch(e){
            alert(e);
        }
    }
    eventObj.stopEvent(obj);
}
$('body').on('click', function(event) {
    if(event.target.id =="people"){
        return ;
    }else if (event.target.id != "delete_div") {
        $("#bubble1").remove();
    }
});
var eventObj = {
    stopEvent : function(event){ //阻止冒泡事件
        //取消事件冒泡
        var e=arguments.callee.caller.arguments[0]||event;
        if (e && e.stopPropagation) {
            e.stopPropagation();
        } else if (window.event) {
            window.event.cancelBubble = true;
        }
    }
};
