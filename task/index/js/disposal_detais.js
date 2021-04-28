var jasHttpRequest = null;
var data = [];
var detailsPeopleName="";
var audioFilePath="";
var audioFileId="";
appcan.ready(function() {
    jasHttpRequest = new JasHttpRequest();
    var withAll=($(".img_details").width()-21)/3;
    var typeCodeName='';

    var details_main=appcan.locStorage.getVal("disposal_details");
    var details=JSON.parse(details_main);
    appcan.locStorage.remove("disposal_details");
    $(".report_literal").find("p").text(details.content);    //处置内容
    $(".details_createTime").text(details.createTime);           //处理时间
    $(".details_people_Name").text(details.recevieUserName);         //接收人
    if(details.typeCode == 10){
        typeCodeName='记录';
    }else if(details.typeCode == 20){
        typeCodeName='请示';
    }else if(details.typeCode == 30){
        typeCodeName='意见';
    }
    
    $(".details_typeName").text(typeCodeName);                //信息类型
    
    detailsPeopleName=details.recevieUserName;
    var url_id=details.pic;
    var pic_scr='';
    $(".img_details").html("");

    $(".camera_number").text(url_id.length);
    
    for(var i=0; i<url_id.length; i++){
        pic_scr += '<div class="ufl img_width ub-ac"><span>' +
            '<img  src="'+serverURL+'cloudlink-core-file/file/getImageBySize?fileId=' + url_id[i] + '&viewModel=fill&width='+parseInt(withAll)+'&hight='+parseInt(withAll)+'" id="'+i+'" onclick="previewPicture(this)" alt=""/>' +
            '</span></div>';
        var obj = {
            "src" : serverURL+'cloudlink-core-file/file/downLoad?fileId=' + url_id[i]
        };
        data.push(obj);
    }
    $(".img_details").append(pic_scr);
    $(".img_width").width(withAll-2);
    $(".img_width").height(withAll-2);
    if(details.audio != undefined && details.audio.length>0 ){
        // var audioFile=serverURL+'cloudlink-core-file/file/downLoad?fileId='+ details.audio[0] +"&audioFileName="+baseOperation.getRandNum()+".amr";
        audioFileId=details.audio[0];
        $("#voiceFiles").show();
        $("#voiceFilesNo").hide();
        $("#audioFile").html(audioFile);
    }else{
        //$("#audio").removeClass("audio1").addClass("audio2");
        $("#voiceFilesNo").find("span").text('无');
        $("#voiceFiles").hide();
    }
    /**
     * 录音播放完成回调 
     */
    uexAudio.onPlayFinished=function(loopTime){
        isPalyVoice=true;
        $("#audio_img").removeClass("audio_img_animation");
    };
    /**
     * 文件下载监听
     */
    uexDownloaderMgr.onStatus = function(opCode,fileSize,percent,status){
        switch (status) {
            case 0:
                // document.getElementById('percentage').innerHTML ="文件大小:"+fileSize+"字节<br>下载进度:"+percent;
                // break;
            case 1:
                playVoice();
                uexDownloaderMgr.closeDownloader(opCode);
                break;
            case 2:
                uexDownloaderMgr.closeDownloader(opCode);
                break;
            case 3:
                break;
        }
    };
});

/*浏览照片*/
function previewPicture(thisObj) {
    //uexLog.sendLog(JSON.stringify(data));
    var index=thisObj.id;
    if(index == undefined || index=="" || index == null){
        index="0";
    }
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
var isPalyVoice=true;
function playVoice(){
    try{
        if(audioFilePath != undefined && audioFilePath != ""){
            if(isPalyVoice){
                isPalyVoice=false;
                $("#audio_img").addClass("audio_img_animation");
                baseOperation.londingToast("录音缓冲中...",1500);
                uexAudio.open(audioFilePath);
                uexAudio.setProximityState('1');
                setTimeout(function(){
                    uexAudio.play(0);
                },1500);
            }else{
                uexAudio.stop();
                isPalyVoice=true;
                $("#audio_img").removeClass("audio_img_animation");
            }
        }else{
            getAudioFilePath();
        }
    }catch(e){
        alert(e);
    }
}
function getAudioFilePath(){
    var url="cloudlink-core-file/file/getUrlByFileId?fileId="+audioFileId;
    // var url = "http://192.168.55.18:8905/file/getUrlByFileId?fileId="+audioFileId;
    jasHttpRequest.jasHttpGet(url,function(id, state, dbSource){
        if(dbSource.length==0){
            baseOperation.alertToast("网络繁忙，请稍候再试...");
            return ;
        }
        var resultData=JSON.parse(dbSource);
        if(resultData.success == "1"){
            var audioFils=resultData.rows;
            if(audioFils.length>0){
                audioFilePath=audioFils[0].fileUrl;
                playVoice();
            }else{
                baseOperation.alertToast("网络繁忙，请稍候再试...");
            }
        }
    });
}
/*function playVoice() {
    try{
        var url = $("#audioFile").html();
        if(url != undefined && url != ""){
        // if(savePath!=undefined && savePath != ""){
            if(isPalyVoice){
                isPalyVoice=false;
                $("#audio_img").addClass("audio_img_animation");
                baseOperation.londingToast("录音缓冲中...",1500);
                uexAudio.open(url);
                uexAudio.setProximityState('1');
                setTimeout(function(){
                    uexAudio.play(0);
                },1500);
            }else{
                uexAudio.stop();
                isPalyVoice=true;
                $("#audio_img").removeClass("audio_img_animation");
            }
        }else{
            // downloadAudio();
            baseOperation.alertToast("没有录音文件...");
        }
    }catch(e){
        alert(e);
    }
}
var savePath="";
function downloadAudio(){
    var url = $("#audioFile").html();
    if(url != undefined && url != ""){
        var id = baseOperation.getRandNum();
        uexDownloaderMgr.createDownloader(id);
        var fileName=new Date().Format("yyyyMMddHHmm");
        savePath="wgt://AudioFile/download/"+fileName+".amr";
        uexDownloaderMgr.download(id, url,savePath,0);
    }else{
        baseOperation.alertToast("没有录音文件...");
    }
}*/
function showMove(obj){
    if(detailsPeopleName!=undefined && detailsPeopleName!=null && detailsPeopleName!=""){
        try{
            $("#bubble1").remove();
            var left = $(obj).parent().position().left;
            var top = $(obj).position().top;
            var width = $(obj).parent().width() / 2;
            var htmlTemp = "<div id='bubble1' class='bubble1' style='left:" + width + "px;'><span class='ulev26' id='delete_div' >"+detailsPeopleName+"</span></div>";
            $(obj).parent().append(htmlTemp);
            var x = width - $("#bubble1").width() / 2+left;
            var y=top-$("#bubble1").height()-5;
            $("#bubble1").css("left", x);
            $("#bubble1").css("top", y);
        }catch(e){
            alert(e);
        }
    }
    eventObj.stopEvent(obj);
}
$('body').on('click', function(event) {
    // uexLog.sendLog(event.target.id);
    if(event.target.id =="people"){
        return ;
    }else if (event.target.id != "delete_div") {
        $("#bubble1").remove();
    }
});