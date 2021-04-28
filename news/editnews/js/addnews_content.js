/**
 * 初始化界面
 */
var jasHttpRequest = null;
var imagesNumber=0;
var isSaveOnLine=true;
var imagesArray = [];
var number=0;
var submitNewsData = null;
var eventStatus=0;
appcan.ready(function() {
    appcan.window.disableBounce();
    jasHttpRequest = new JasHttpRequest();
    appcan.initBounce();
    /**
     * 打开相册回调
     */
    uexImage.onPickerClosed = function(info) {
        var objData = JSON.parse(info);
        if (!objData.isCancelled) {
            var imgPaths = objData.data;
            for (var i = 0; i < imgPaths.length; i++) {
                var mun = parseInt($(".img_mun").text());
                $(".img_mun").text(mun + 1);
                var option  = '<div class="ufl" id="preview_' + imagesNumber + '">' + '<img src="' + imgPaths[i] + '" ontouchstart="gtouchstart(this)"  ontouchend="gtouchend(this)" onclick="previewPicture(this)" height="260px" width="260px"  alt=""/>' + '</div>';
                $("#camera_img").append(option);
                imagesNumber++;
            }
        }
    };
    /*拍照回调*/
       // uexCamera.cbOpen = function(opCode, dataType, data){
    uexCamera.cbOpenInternal = function(opCode, dataType, data) {
        var mun = parseInt($(".img_mun").text());
        $(".img_mun").text(mun + 1);
        var option = "";
        option = '<div class="ufl" id="preview_' + imagesNumber + '">' + '<img src="' + data + '" onclick="previewPicture(this)" ontouchstart="gtouchstart(this)"  ontouchend="gtouchend(this)" onclick="previewPicture(this)" height="260px" width="260px" alt=""/>' + '</div>';
        setTimeout(function(){
            $("#camera_img").append(option);
        },2000);
        imagesNumber++;
    }; 
    uexUploaderMgr.onStatus = function(opCode, fileSize, percent, serverPath, status) {
        // uexLog.sendLog("status:"+status);
        switch (status) {
        case 0:
            //alert("上传进度："+percent+"%");
            break;
        case 1:
            uexUploaderMgr.closeUploader(opCode);
            uploadSuccess();
            break;
        case 2:
            uexUploaderMgr.closeUploader(opCode);
            ubaseOperation.alertToast("第" + number + "张照片上传失败");
            appcan.window.evaluateScript('event_report', "changeButton()");
            break;
        }

    };

    baseOperation.addEmojiFliterEvent('input[type="text"]'); //绑定过滤emoji的事件
    baseOperation.addEmojiFliterEvent('#content',checkLen); //绑定过滤emoji的事件

    $('body').on('click', function(event) {
        if (event.target.id != "delete_div") {
            $("#bubble").remove();
        }
    });
});
/**
 * 打开底部弹窗
 */
function opensheet_tsend() {
    var mun = parseInt($(".img_mun").text());
    if(mun==5){
        baseOperation.alertToast('照片最多上传5张...');
        return ;
    }
    var x = 0;
    var y = 0;
    var width = 0;
    var height = 0;
    var JsonData = {
        "actionSheet_style" : {
            "frameBgColor" : "#00000000",
            "frameBroundColor" : "#00000000",
            "frameBgImg" : "",
            "btnSelectBgImg" : "res://btn.png",
            "btnUnSelectBgImg" : "res://btn.png",
            "cancelBtnSelectBgImg" : "res://btn.png",
            "cancelBtnUnSelectBgImg" : "res://btn.png",
            "textSize" : "17",
            "textNColor" : "#333",
            "textHColor" : "#333",
            "cancelTextNColor" : "#333",
            "cancelTextHColor" : "#333",
            "actionSheetList" : [{
                "name" : "拍照"
            }, {
                "name" : "从相册选择"
            }]
        }
    };
    uexActionSheet.open(x, y, width, height, JSON.stringify(JsonData));
    uexActionSheet.onClickItem = function(data) {
        if (data == 1) {
            openAlbum();
        } else if (data == 0) {
            // uexCamera.open();
            uexCamera.openInternal(0, 80);
        }

    }
}

/**
 * 打开相册
 */
function openAlbum() {
    var mun = parseInt($(".img_mun").text());
    var data = {
        min : 1,
        max : (5-mun),
        quality : 0.5,
        detailedInfo : false
    }
    var json = JSON.stringify(data);
    uexImage.openPicker(json)
}

/**
 * 图片预览
 * @param {Object} thisObj
 */
function previewPicture(thisObj) {
    var i = 0;
    var index = 0;
    var data = [];
    $("#camera_img img").each(function() {
        var obj = {
            "src" : $(this).attr("src")
        }
        if ($(this).attr("src") == $(thisObj).attr("src")) {
            index = i;
        }
        data.push(obj);
        i++;
    });
    var data = {
        displayActionButton : true,
        displayNavArrows : true,
        enableGrid : false,
        startOnGrid : false,
        startIndex : index,
        data : data
    }
    var json = JSON.stringify(data);
    uexImage.openBrowser(json);
}

var timeOutEvent = 0;
//定时器
//开始按
function gtouchstart(obj) {
    timeOutEvent = setTimeout(function() {
        longPress(obj);
    }, 500);
    //这里设置定时器，定义长按500毫秒触发长按事件，时间可以自己改，个人感觉500毫秒非常合适
    return false;
};
//手释放，如果在500毫秒内就释放，则取消长按事件，此时可以执行onclick应该执行的事件
function gtouchend() {
    clearTimeout(timeOutEvent);
    //清除定时器
    if (timeOutEvent != 0) {
        //这里写要执行的内容（尤如onclick事件）
        //alert("你这是点击，不是长按");
    }
    return false;
};

//真正长按后应该执行的内容
function longPress(obj) {
    $("#bubble").remove();
    timeOutEvent = 0;
    var left = $(obj).position().left;
    var top = $(obj).position().top;
    var width = $(obj).width() / 2;
    var divId = $(obj).parent().attr("id");
    var htmlTemp = "<div id='bubble' class='bubble' style='left:" + width + "px;'><span id='delete_div' onclick=\"deletePreview('" + divId + "')\">删除</span></div>";
    $(obj).parent().append(htmlTemp);
    var x = width - $("#bubble").width() / 2+left;
    var y=top-$("#bubble").height()-2;
    $("#bubble").css("left", x + "px");
    $("#bubble").css("top", y + "px");
}

function deletePreview(id) {
    var mun = parseInt($(".img_mun").text());
    $(".img_mun").text(mun - 1);
    $("#" + id).remove();
    $("#bubble").remove();
}

/**
 * 打开用户选择界面
 */
function openUserInfo() {
    var windowParam = {
        "parentWidowId" : "addNews",
        "windowId" : "addnews_content",
        "functionName" : "setUserInfo()"
    };
    appcan.locStorage.setVal("useSelectList_param", windowParam);
    appcan.openWinWithUrl("users-select", "../../common/page/users_select_all/users_select_all.html");
}

var listUser = [];
/**
 *  设置发送人信息
 */
function setUserInfo() {
    var people_select = appcan.locStorage.getVal("userSelect");
    var peoData = JSON.parse(people_select);
    $("#people").val(peoData.peo_name);
    listUser = peoData.peo_data;
}


/**
 * 保存消息到本地库
 */
function saveNews() {
    eventStatus=1;
    checkForm();
}

/**
 * 发布消息
 */
function publishNews() {
    eventStatus=0;
    checkForm();
}
/***
 * 检查表单
 */
function checkForm() {
    submitNewsData = formOperation.getFormJson("#news_info");
    if (submitNewsData.title == "") {
        baseOperation.alertToast("请填写标题");
        appcan.window.evaluateScript('addNews',"changeButtonStatus()");
        return;
    }
    if (submitNewsData.content == "") {
        baseOperation.alertToast("请填写内容");
        appcan.window.evaluateScript('addNews',"changeButtonStatus()");
        return;
    }
    if (submitNewsData.people == "") {
        baseOperation.alertToast("请选择发送人");
        appcan.window.evaluateScript('addNews',"changeButtonStatus()");
        return;
    }
    var objectId=baseOperation.createuuid();
    submitNewsData["objectId"] = objectId;
    submitNewsData["listUser"] = listUser;
    submitNewsData["type"]=1;
    submitNewsData["receiverNames"]=submitNewsData.people;
    submitNewsData["sendTime"]=(new Date()).Format("yyyy-MM-dd HH:mm:ss");
    // uexLog.sendLog(JSON.stringify(submitData));
    $("#camera_img").find(".ufl").each(function() {
        var dataImg = $(this).find("img").attr("src");
        var obj = {
            "path" : dataImg,
            "type" : "pic"
        }
        imagesArray.push(obj);
    });
    if(eventStatus==0){ //
        appcan.window.confirm({
            title:'提示',
            content:'您好,您确定发布消息?',
            buttons:['确定','取消'],
            callback:function(err,data,dataType,optId){
                if(err || data == 1){ //取消
                    //如果出错了
                    imagesArray=[];//清空附件列表
                    appcan.window.evaluateScript('addNews',"changeButtonStatus()");
                    return;
                }else if(data == 0){
                    // subimtData();
                    isSaveOnLine=true;
                    saveOfflineAttaData(objectId);
                }
                //data 按照按钮的索引返回值
            }
        });
    }else{
        isSaveOnLine=false;
        saveOfflineAttaData(objectId);
    }
}
/**
 * 保存附件信息到本地库 
 */
function saveOfflineAttaData(objectId){
    try{
    var arrayData=[];
    if(imagesArray.length>0){
        for(var i=0;i<imagesArray.length;i++){
            var localid = new Date().Format("yyyyMMddHHmmssS");
            var url="cloudlink-core-file/attachment/save";
            var obj={"localId":localid,"objectId":objectId,"attaType":imagesArray[i].type,"localUrl":url,"postData":imagesArray[i].path,"state":"0"};
            arrayData.push(obj);
        }
        saveOfflineNewsAtta(arrayData,function(result){
            if(result.success=="1"){
                baseOperation.alertToast("附件本地保存成功！");
                savaOfflineData();
            }else{
                baseOperation.alertToast("附件本地保存失败！");
            }
        });
    }else{
        savaOfflineData();
    }
    }catch(e){
        alert(e);
    }
}

/***
 * 保存消息到本地库
 */
function savaOfflineData() {
    try {
        var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
        var newsData = [];
        var localid = new Date().Format("yyyyMMddHHmmssS");
        var jsonData = JSON.stringify(submitNewsData);
        // var url="cloudlink-inspection-message/message/sendMsg";
        // var data={"localId":localid,"eventId":formArry.objectId,"partUrl":url,"postData":jsonData,"state":"0","userId":userBo.objectId,"enterpriseId":userBo.enterpriseId};
        var data = {
            "localId" : localid,
            "objectId" : submitNewsData.objectId,
            "userId" : userBo.objectId,
            "enterpriseId" : userBo.enterpriseId,
            "postData" : jsonData,
            "state" : "0"
        }
        newsData.push(data);
        saveOfflineNews(newsData, function(result) {
            if (result.success == "1") {
                baseOperation.alertToast(result.msg);
                if (isSaveOnLine) {
                    subimtData();
                } else {
                    baseOperation.alertToast("数据保存完成！");
                    appcan.window.evaluateScript('addNews', "closeWindow('" + eventStatus + "')");
                }
            } else {
                baseOperation.alertToast("数据保存失败！");
                appcan.window.evaluateScript('addNews', "changeButtonStatus()");
            }
        });
    } catch(e) {
        alert(e);
    }
}

/**
 * 提交数据
 */
function subimtData() {
    if (imagesArray.length == 0) {//没有上传图片时，直接提交数据
        saveData();
    } else {
        uploadImg();
    }
}

/**
 * 上传图片
 */
function uploadImg() {
    var uploadHttp = "";
    var dataImgObj = imagesArray[number];
    var dataImg = dataImgObj.path;
    var dataType = dataImgObj.type;
    if (dataType == "pic") {
        baseOperation.alertToast("开始上传图片...", -1);
        uploadHttp = serverURL + "cloudlink-core-file/attachment/save?businessId=" + submitNewsData.objectId + "&bizType=pic";
    }
    if (appcan.locStorage.getVal("token") != null && appcan.locStorage.getVal("token").length > 0) {
        var token = appcan.locStorage.getVal("token");
        if (uploadHttp.indexOf("?") != -1) {
            uploadHttp += "&token=" + token;
        } else {
            uploadHttp += "?token=" + token;
        }
    }
    appcan.file.exists({
        filePath:dataImg,
        callback:function(err, data, dataType, optId){
            if(!err && data == 1){
                var headJson = '{"Content-type":"Multipart/form-data;charset=utf-8"}';
                var id = Number(Math.floor(Math.random() * (100000 + 1)));
                uexUploaderMgr.setHeaders(id, headJson);
                uexUploaderMgr.createUploader(id, uploadHttp);
                uexUploaderMgr.uploadFile(id, dataImg, "file", 0);
            }else{
                //附件丢失，上传下一个附件
                uploadSuccess();
            }
        }
    });
}

/**
 * 图片是否上传完成
 */
function uploadSuccess() {
    baseOperation.alertToast("第" + (number + 1) + "张照片上传成功", -1);
    number++;
    if (number < imagesArray.length) {
        uploadImg();
    } else {
        baseOperation.alertToast("开始提交数据！");
        saveData();
    }
}

/***
 * 提交数据到后台
 */
function saveData() {
    // var partURL = "cloudlink-inspection-message/message/sendMsg";
    var partURL = "cloudlink-inspection-message/message/send";
    jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
        var resultData = JSON.parse(dbSource);
        if (resultData.success == "1") {
            deleteOfflineData(submitNewsData.objectId);
            baseOperation.alertToast("数据提交完成！");
            appcan.window.evaluateScript('addNews', "closeWindow('" + eventStatus + "')");
        } else {
            baseOperation.alertToast("数据提交失败！");
            appcan.window.evaluateScript('addNews', "changeButtonStatus()");
        }
    }, JSON.stringify(submitNewsData));
}

/**
 * 删除本地数据
 * @param {Object} eventid
 */
function deleteOfflineData(objectId) {
    deleteOfflineNews(objectId, function(result) {
        if (result.success == "1") {
            deleteOfflineNewsAtta(objectId, function(resultData) {
                if (resultData.success == "1") {
                    // baseOperation.alertToast("本地缓存数据清除成功");
                }    
            });
        }
    });
}

function checkLen(obj){
    var len = $(obj).val().length;
    if(len > 159){
        $(obj).val($(obj).val().substring(0,160));
    }
    var num = 160 - len;
    if(num<0){
        num = 0;
    }
    $("#word").text('('+num+'字)');
}
