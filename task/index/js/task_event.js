var address="";
var bdLongitude="";
var bdLatitude="";
var jasHttpRequest = null;
var data = [];
var isShowMap="";
var audioFilePath="";
var audioFileId="";
appcan.ready(function() {
    
    document.body.addEventListener('touchmove', function(event){
        if($("#mask").css('display') !== 'none'){
            event.preventDefault();
        }
    }, false);
    
    
    var tabIndex=appcan.locStorage.getVal("tabIndex_param");
    isShowMap = appcan.locStorage.getVal("isShowMap");
    if(isShowMap == "true"){
        $(".details_address").css("color","#58B5FC");
    }else{
        $(".details_address").css("color","#000");
    }
    if(tabIndex=="0"){
        initEventData();
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
var testFilePath="";
/**
 * 初始化数据 
 */
function initEventData(){
    jasHttpRequest = new JasHttpRequest();
    var withAll=($(".img_details").width()-21)/3;
    var eventId=appcan.locStorage.getVal("event_Id");
    baseOperation.londingToast("数据加载中，请稍候...");
    var partURL = 'cloudlink-inspection-event/eventInfo/get';
    partURL=partURL+"?eventId="+eventId;
    jasHttpRequest.jasHttpGet(partURL,function(id, state, dbSource){
        if(dbSource.length==0){
            baseOperation.alertToast("网络繁忙，请稍候再试...");
            return ;
        }
        var resultData=JSON.parse(dbSource);
        if(resultData.success=="1"){
            var data_all=resultData.rows;
            //shareEventObj.shareContent(data_all);//构建事件分享的obj sf 2017-05-18
            $(".report_literal").find("p").text(data_all[0].description);    //事件描述
            $(".details_address").text(data_all[0].address);                  //地址
            $(".details_inspectorId").text(data_all[0].inspectorName);          //上报人
            $(".details_typeName").text(data_all[0].fullTypeName);                //事件类型
            $(".details_eventCode").text(data_all[0].eventCode);              //事件号
            $(".details_occurrenceTime").text(data_all[0].occurrenceTime);       //事件时间
            var url_id=data_all[0].pic;
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
            if(data_all[0].audio != undefined && data_all[0].audio.length>0){
                var audioFile=serverURL+'cloudlink-core-file/file/downLoad?fileId='+ data_all[0].audio[0] +"&audioFileName="+baseOperation.getRandNum()+".amr";
                // testFilePath=serverURL+'cloudlink-core-file/file/downLoad?fileId='+data_all[0].audio[0]+"&name=a.amr";
                // audioFilePath=audioFile;
                audioFileId=data_all[0].audio[0];
                $("#voiceFiles").show()
                $("#voiceFilesNo").hide();
                $("#audioFile").html(audioFile);
            }else{
                //$("#audio").removeClass("audio1").addClass("audio2");
                $("#voiceFilesNo").find("span").text('无');
                $("#voiceFiles").hide();
            }
            $(".img_details").append(pic_scr);
            $(".img_width").width(withAll-2);
            $(".img_width").height(withAll-2);
            // if(details.parentTypeId==2){
                // $(".parentTypeId").attr("src","index/images/disasters.png");
            // }else if(details.parentTypeId==1){
                // $(".parentTypeId").attr("src","index/images/construction.png");
            // }else{
                // $(".parentTypeId").attr("src","index/images/pipe.png");
            // }
            address=data_all[0].address;
            bdLongitude=data_all[0].bdLon;
            bdLatitude=data_all[0].bdLat;
            baseOperation.closeToast();
        }else{
            baseOperation.alertToast("网络繁忙，请稍候再试...");
            return ;
        }

    });
}
/*浏览照片*/
function previewPicture(thisObj) {
//    uexLog.sendLog(JSON.stringify(data));
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
                // audioFilePath
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
    var url = $("#audioFile").html();
    try{
        // if(savePath!=undefined && savePath != ""){
        if(url != undefined && url !=""){
            if(isPalyVoice){
                isPalyVoice=false;
                $("#audio_img").addClass("audio_img_animation");
                //var test="http://sz-btfs.ftn.qq.com/ftn_handler/87e2c6c8109190a5c706b43133afb180a76f61cc260e3df6754bde36170e350352ffbdf3e703bceb1b5deae1fe57d3abd2534729f78cef95eb41b772632f09ca/?fname=test.mp3";
                baseOperation.londingToast("录音缓冲中...",1500);
                uexAudio.open(testFilePath);
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
            baseOperation.alertToast("没有录音文件...");
        }
    }catch(e){
        alert(e);
    }
}
var savePath="";
function downloadAudio(){
    var url = $("#audioFile").html();
    if(url != undefined && url !=""){
        var id = baseOperation.getRandNum();
        uexDownloaderMgr.createDownloader(id);
        var fileName=new Date().Format("yyyyMMddHHmm");
        savePath="wgt://AudioFile/download/"+fileName+".amr";
        uexDownloaderMgr.download(id, url,savePath,0);
    }else{
        baseOperation.alertToast("没有录音文件...");
    }
}*/

/***
 * 地图位置查看 
 */
function showAddress(){
    if(isShowMap == "true"){
        var bdPointObj={
           'bdLon':bdLongitude,
           'bdLat':bdLatitude,
           'address':address
        }
        appcan.locStorage.val('bdPointObj',bdPointObj);
        appcan.openWinWithUrl('maplocation', '../../pipe_equipment/detail_check/maplocation.html');
    }
}

function showShareTools(){
    $("#mask").show();
}

function hideShareTools(){
    $("#mask").hide();
}
