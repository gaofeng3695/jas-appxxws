/**
 * Created by Administrator on 2016/11/2.
 */
var imageNumber = 0;
var voiceFileName = "";
var number = 0;
var arr = [];
var disposal_id = "";
var eventStatus = "";
var formArry = null;
var people_data = [];
var jasHttpRequest = null;
var isAudioTest = false;
var disposeTime = "";
var em = currentFontSize(document.getElementById('event_refer'));
appcan.ready(function() {
    jasHttpRequest = new JasHttpRequest();

   
    $("#time").val((new Date()).Format("yyyy-MM-dd HH:mm"));
    uexWindow.setWindowScrollbarVisible(false);
    testAudio();
    $(".pay_list_c1").each(function(e) {
        $(this).click(function() {
            $(this).addClass("on").siblings().removeClass("on");
            $(".radio_select").find(".report_list").eq(e).removeClass("yes_no").siblings().addClass("yes_no");
        })
    });
    uexWidgetOne.cbError = function(opCode, errorCode, errorInfo) {
        // alert(errorInfo);
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
    /*创建判断*/
    uexUploaderMgr.cbCreateUploader = function(opCode, dataType, data) {
        if (data == 0) {
            //uexLog.sendLog("创建成功");
        } else {
            //alert("上报失败");
            //uexLog.sendLog("dd:创建失败");
        }

    };
    /*拍照回调*/
    // uexCamera.cbOpen = function(opCode, dataType, data){
    uexCamera.cbOpenInternal = function(opCode, dataType, data) {
        var mun = parseInt($(".img_mun").text());
        $(".img_mun").text(mun + 1);
        var option = "";
        option = '<div class="ufl pic_list" id="preview_' + imageNumber + '">' + '<img src="' + data + '" onclick="previewPicture(this)" ontouchstart="gtouchstart(this)" ontouchmove="gtouchmove(this)" ontouchend="gtouchend(this)"  height="260px" width="260px" alt=""/>' + '</div>';
        setTimeout(function() {
            $("#camera_img").append(option);
        }, 2000);
        imageNumber++;
    };

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
                var option = "";
                option = '<div class="ufl pic_list" id="preview_' + imageNumber + '">' + '<img src="' + imgPaths[i] + '" ontouchstart="gtouchstart(this)" ontouchmove="gtouchmove(this)" ontouchend="gtouchend(this)" onclick="previewPicture(this)" height="260px" width="260px"  alt=""/>' + '</div>';
                $("#camera_img").append(option);
                imageNumber++;
            }
        }
    };
    /**
     * 日期选择回调
     */
    uexControl.cbOpenDatePicker = function(opId, dataType, data) {
        var dateObj = JSON.parse(data);
        var dateStr = dateObj.year + "-" + dateObj.month + "-" + dateObj.day;
        $("#time").val(dateStr);
    };
    /**
     * 录音回调
     */
    uexAudio.cbRecord = function(opId, dataType, data) {
        $("#voiceFile").val(data);
        $("#voiceFiles").show();
        $("#voice").hide();
    };
    /**
     * 录音文件刪除回调
     */
    uexFileMgr.cbDeleteFileByPath = function(opId, dataType, data) {
        if (data == 0) {
        } else {
        }
    };

    //背景录音结束回调
    uexAudio.cbBackgroundRecord = function(opId, dataType, data) {
        if (isAudioTest) {
            uexFileMgr.deleteFileByPath(data);
        } else {
            $("#voiceFile").val(data);
        }
    };
    /**
     * 录音播放完成回调
     */
    uexAudio.onPlayFinished = function(loopTime) {
        isPalyVoice = true;
        $("#audio_img").removeClass("audio_img_animation");
    };
    $('body').on('click', function(event) {
        if (event.target.id != "delete_div") {
            $("#bubble").remove();
        }
    });
    // initDateRange();
    baseOperation.addEmojiFliterEvent('input[type="text"]'); //绑定过滤emoji的事件
    baseOperation.addEmojiFliterEvent('#introduce_text',checkLen); //绑定过滤emoji的事件 
    //绑定过滤emoji的事件
    disposeTime = appcan.locStorage.getVal("disposeTime_param");
});

/*上传文件方法*/
function upload() {
    if (arr.length == 0) {//没有上传图片时，直接提交数据
        /*上传数据*/
        baseOperation.alertToast("开始提交数据！");
        /*上传数据*/
        var partURL = "cloudlink-inspection-task/dispose/save";
        var tep = [];
        tep.push(formArry);
        jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
            if (dbSource.length == 0) {
                baseOperation.alertToast("网络繁忙，请稍候再试...");
                appcan.window.evaluateScript('disposal_report', "changeButton()");
                return;
            }
            var resultData = JSON.parse(dbSource);
            if (resultData.success == "1") {
                if (tjSwitch == 1) {
                    try {
                        var zhuge_param = {
                            "eventName" : "提交任务处置信息",
                            "info" : {
                                "taskId" : formArry.taskId,
                                "信息类型" : formArry.type
                            }
                        };
                        uexTianji.track(zhuge_param);
                    } catch (e) {
                    }
                }
                baseOperation.alertToast("数据提交完成！");
                appcan.window.evaluateScript('disposal_report', "utn_return(1)");
            } else {
                baseOperation.alertToast("数据提交失败！");
                appcan.window.evaluateScript('disposal_report', "changeButton()");
            }
        }, JSON.stringify(formArry));
    } else {
        uploadImg();
    }
}

function uploadSuccess() {
    baseOperation.alertToast("第" + number + "张照片上传成功", -1);
    //uexLog.sendLog("dd:上传成功");
    number++;
    if (number < arr.length) {
        uploadImg();
    } else {
        baseOperation.alertToast("开始提交数据！");
        /*上传数据*/
        var partURL = "cloudlink-inspection-task/dispose/save";
        var tep = [];
        tep.push(formArry);
        //uexLog.sendLog(JSON.stringify(formArry));
        jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
            if (dbSource.length == 0) {
                baseOperation.alertToast("网络繁忙，请稍候再试...");
                appcan.window.evaluateScript('disposal_report', "changeButton()");
                return;
            }
            var resultData = JSON.parse(dbSource);
            if (resultData.success == "1") {
                if (tjSwitch == 1) {
                    try {
                        var zhuge_param = {
                            "eventName" : "提交任务处置信息",
                            "info" : {
                                'taskId' : formArry.taskId,
                                '信息类型' : formArry.type
                            }
                        };
                        uexTianji.track(zhuge_param);
                    } catch (e) {
                    }
                }
                baseOperation.alertToast("数据提交完成！");
                appcan.window.evaluateScript('disposal_report', "utn_return(1)");
            } else {
                baseOperation.alertToast("数据提交失败！");
                appcan.window.evaluateScript('disposal_report', "changeButton()");
            }
        }, JSON.stringify(formArry));
    }
}

function uploadImg() {
    var uploadHttp = "";
    var dataImgObj = arr[number];
    var dataImg = dataImgObj.path;
    var dataType = dataImgObj.type;
    if (dataType == "pic") {
        baseOperation.alertToast("开始上传图片...", -1);
        uploadHttp = serverURL + "cloudlink-core-file/attachment/save?businessId=" + disposal_id + "&bizType=pic";
    } else if (dataType == "audio") {
        baseOperation.alertToast("开始上传语音...", -1);
        uploadHttp = serverURL + "cloudlink-core-file/attachment/save?businessId=" + disposal_id + "&bizType=audio";
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

/*联系人的名字导入*/
function import_name() {
    if (appcan.locStorage.getVal("userSelect") == "" || appcan.locStorage.getVal("userSelect") == null || appcan.locStorage.getVal("userSelect") == "undefined") {
        people_data = [];
        $("input[name='people']").val("");
    } else {
        var people_select = appcan.locStorage.getVal("userSelect");
        people_data = JSON.parse(people_select).peo_data;
        $("input[name='people']").val(JSON.parse(people_select).peo_name);
    }

}

/*表单提交*/
function on_submit() {
    var taskId = appcan.locStorage.getVal("task_only_id");
    formArry = formOperation.getFormJson("#event_refer");
    formArry.taskId = taskId;
    formArry.content = formArry.content.trim();

    var partURL = "cloudlink-inspection-task/task/getTaskStatus?taskId=" + taskId;
    /*验证任务是否已关闭*/
    jasHttpRequest.jasHttpGet(partURL, function(id, state, dbSource) {
        if (dbSource.length == 0) {
            baseOperation.alertToast("网络繁忙，请稍候再试...");
            appcan.window.evaluateScript('disposal_report', "changeButton()");
            return false;
        } else {
            var resultData = JSON.parse(dbSource);
            if (resultData.success == "1") {
                var taskState = resultData.rows;
                if (taskState[0].status == 21) {
                    appcan.window.confirm({
                        title : '提示',
                        content : '您好，该任务已经关闭，无法继续填写处置信息',
                        buttons : ['确定'],
                        callback : function(err, data, dataType, optId) {
                            if (err) {
                                appcan.window.evaluateScript('disposal_report', "changeButton()");
                                return;
                            } else {
                                appcan.window.evaluateScript('disposal_report', "utn_return(1)");
                                appcan.window.evaluateScript('disposal_report', "footRemove()");
                            }
                        }
                    });
                    //baseOperation.alertToast("该任务已经关闭，无法继续填写处置信息");
                    return false;
                } else {
                    if (formArry.createTime == "") {
                        baseOperation.alertToast("请选择事件处置的时间");
                        appcan.window.evaluateScript('disposal_report', "changeButton()");
                        return false;
                    } else if (formArry.content == '') {
                        baseOperation.alertToast("请描述处置的信息");
                        appcan.window.evaluateScript('disposal_report', "changeButton()");
                        return false;
                    }
                    /*信息类型为请示时，必须选择接收人，特此说明*/
                    if (formArry.type == "20") {
                        if ($("#recipient").val() == "") {
                            baseOperation.alertToast("请选择【请示】消息的接收人！");
                            appcan.window.evaluateScript('disposal_report', "changeButton()");
                            return;
                        }
                    }

                    disposal_id = baseOperation.createuuid();
                    formArry.objectId = disposal_id;
                    //生成处置ID
                    //uexLog.sendLog(JSON.stringify(people_data))
                    formArry.receiveUserIds = people_data;

                    /*上传路径*/
                    $("#camera_img").find(".ufl").each(function() {
                        var dataImg = $(this).find("img").attr("src");
                        var obj = {
                            "path" : dataImg,
                            "type" : "pic"
                        };
                        arr.push(obj);
                    });
                    var audioFile = $("#voiceFile").val();
                    if (audioFile != undefined && audioFile != null && audioFile != "") {
                        var obj = {
                            "path" : audioFile,
                            "type" : "audio"
                        };
                        arr.push(obj)
                    }
                    appcan.window.confirm({
                        title : '提示',
                        content : '您好，是否确认提交？',
                        buttons : ['确定', '取消'],
                        callback : function(err, data, dataType, optId) {
                            if (err || data === 1) {
                                arr = [];
                                appcan.window.evaluateScript('disposal_report', "changeButton()");
                                return;
                            }
                            if (data === 0) {
                                upload();
                            }
                        }
                    });
                }
            } else {
                baseOperation.alertToast("网络繁忙，请稍候再试...");
                appcan.window.evaluateScript('disposal_report', "changeButton()");
                return false;
            }
        }
    });

}

/**

 * 打开相册
 */
function openAlbum() {
    var mun = parseInt($(".img_mun").text());
    var data = {
        min : 1,
        max : (5 - mun),
        quality : 0.5,
        detailedInfo : false
    };
    var json = JSON.stringify(data);
    uexImage.openPicker(json);
}

/*上传照片*/
function saveToPhotoAlbum() {
    var data = {
        localPath : "res://photo4.jpg",
        extraInfo : "wwwwww"
    };
    var json = JSON.stringify(data);
    uexImage.saveToPhotoAlbum(json);
}

/*打开日历插件*/
function openDate() {
    //  uexControl.openDatePicker();
}

var isPalyVoice = true;
/*播放录音*/
function playVoice() {
    if (isPalyVoice) {
        var recordPath = $("#voiceFile").val();
        if (recordPath == undefined || recordPath == null || recordPath == "") {
            return;
        }
        isPalyVoice = false;
        $("#audio_img").addClass("audio_img_animation");
        uexAudio.open(recordPath);
        uexAudio.setProximityState('1');
        uexAudio.play(0);
    } else {
        uexAudio.stop();
        isPalyVoice = true;
        $("#audio_img").removeClass("audio_img_animation");
    }
}

/*删除录音*/
function deleteVoice() {
    // baseOperation.alertToast("44",10000);
    $("#voiceFiles").hide();
    $("#voice").show();
    if (!isPalyVoice) {
        uexAudio.stop();
    }
    var recordPath = $("#voiceFile").val();
    uexFileMgr.deleteFileByPath(recordPath);
    // baseOperation.alertToast("55",10000);
    $("#voiceFile").val('');
}

/*浏览照片*/
function previewPicture(thisObj) {
    var i = 0;
    var index = 0;
    var data = [];
    $("#camera_img img").each(function() {
        var obj = {
            "src" : $(this).attr("src"),
            "thumb" : $(this).attr("src")
        }
        if ($(this).attr("src") == $(thisObj).attr("src")) {
            index = i;
        }
        data.push(obj);
        i++;
    });
    var dataParam = {
        displayActionButton : true,
        displayNavArrows : true,
        enableGrid : false,
        startOnGrid : false,
        startIndex : index,
        data : data
    }
    var json = JSON.stringify(dataParam);
    uexImage.openBrowser(json);
}

/*相册选择方法*/
function opensheet_tsend() {
    var mun = parseInt($(".img_mun").text());
    if (mun == 5) {
        baseOperation.alertToast('照片最多上传5张...');
        return;
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

var audioTimeOutEvent = 0;
//定时器
//开始按
function audioGtouchstart(obj) {
    audioTimeOutEvent = setTimeout(function() {
        audioLongPress(obj);
    }, 200);
    //这里设置定时器，定义长按500毫秒触发长按事件，时间可以自己改，个人感觉200毫秒非常合适
    return false;
};
//手释放，如果在500毫秒内就释放，则取消长按事件，此时可以执行onclick应该执行的事件
function audioGtouchend() {
    if (isAduioOvertime) {
        isAduioOvertime = false;
        return;
    }
    clearTimeout(audioTimeOutEvent);
    //清除定时器
    if (audioTimeOutEvent != 0) {
        //这里写要执行的内容（尤如onclick事件）
        //alert("你这是点击，不是长按");
        baseOperation.alertToast("请长按开始录音！");
    } else {
        clearTimeout(audioTimeOutEvent);
        clearInterval(intTimer);
        setAudioClass();
        uexAudio.stopBackgroundRecord();
    }
    return false;
};

/***
 * 长按结束录音
 */
function audioOntouchcancel() {
    clearTimeout(audioTimeOutEvent);
    clearInterval(intTimer);
    setAudioClass();
    setTimeout(function() {
        uexAudio.stopBackgroundRecord();
    }, 500);
}

//真正长按后应该执行的内容
function audioLongPress(obj) {
    isAudioTest = false;
    clearTimeout(audioTimeOutEvent);
    $("#speak").val("松开结束").css("background","#c3e4ff");
    audioTimeOutEvent = 0;
    var width = $(obj).width();
    var height = $(obj).height();
    var left = $(obj).offset().left;
    var top = parseFloat($(obj).offset().top) - parseFloat(height);
    var createTime = new Date().Format("yyyyMMddHHmm");
    voiceFileName = createTime;
    // baseOperation.alertToast("3333",10000);
    uexAudio.startBackgroundRecord(0, createTime);
    $("#kuai").css("left", left);
    $("#kuai").css("top", top);
    $("#kuai").css("width", width);
    $("#kuai").show();
    if (intTimer) {//开启定时器前先清除定时器 高峰 20161105
        clearInterval(intTimer);
    }
    intTimer = setInterval(Interval_handler, 1000);
}

var isAduioOvertime = false;
var intValue = 0;
var intTimer;
var objPro = $('#proDownFile');
var objTip = $('#pTip');
var audioStop = false;
function Interval_handler() {
    intValue++;
    objPro.val(intValue);
    if (intValue == parseInt(objPro.attr("max"))) {
        isAduioOvertime = true;
        $("#speak").trigger("touchend");
        appcan.window.confirm({
            title : '提示',
            content : '录音最长时长为30秒，是否重新录音？',
            buttons : ['确定', '取消'],
            callback : function(err, data, dataType, optId) {
                if (data == 0) {
                    deleteVoice();
                } else {
                    //$("#speak").trigger("touchend");
                }
            }
        });
    } else {
        if (intValue < 10) {
            objTip.html("0" + intValue + "秒");
        } else {
            objTip.html(intValue + "秒");
        }
    }
}

function setAudioClass() {
    $("#voiceTime").html(intValue + "''");
    $("#kuai").hide();
    // $("#voiceFile").val(data);
    $("#voiceFiles").show();
    $("#voice").hide();
    $("#speak").val("按住说话").css("background","#59b5fe");
    objPro.val(0);
    objTip.html('开始录音');
    intValue = 0;
    clearTimeout(intTimer);
    clearTimeout(audioTimeOutEvent);
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
//如果手指有移动，则取消所有事件，此时说明用户只是要移动而不是长按
function gtouchmove() {
    clearTimeout(timeOutEvent);
    //清除定时器
    timeOutEvent = 0;
    $("#bubble").remove();
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
    var x = width - $("#bubble").width() / 2 + left;
    var y = top - $("#bubble").height() - 2;
    $("#bubble").css("left", x + "px");
    $("#bubble").css("top", y + "px");
}

function deletePreview(id) {
    var mun = parseInt($(".img_mun").text());
    $(".img_mun").text(mun - 1);
    $("#" + id).remove();
    $("#bubble").remove();
}

/*
 * 选择审核人的跳转的方法
 */
function usersSelect() {
    var windowParam = {
        "parentWidowId" : "disposal_report",
        "windowId" : "disposal_report_content",
        "functionName" : "import_name()"
    };
    appcan.locStorage.setVal("useSelectList_param", windowParam);
    appcan.openWinWithUrl("users-select", "../common/page/users_select/users_select.html");
}

function setPointValue() {
    var pointParam = appcan.locStorage.getVal("point_param");
    pointParam = JSON.parse(pointParam);
    $("#address").val(pointParam.address);
    $("#lon").val(pointParam.GPSpoint.longitude);
    $("#lat").val(pointParam.GPSpoint.latitude);
    $("#lonBd").val(pointParam.baiduPoint.longitude);
    $("#latBd").val(pointParam.baiduPoint.latitude);
    appcan.locStorage.remove("point_param");
}

function initDateRange() {

    var width = $('body').width();
    var theme = "";
    if (uexWidgetOne.platformName.indexOf("android") > -1) {
        theme = "android-holo-light";
    } else {
        theme = "ios";
    }
    $("#time").mobiscroll().datetime({
        theme : theme,
        lang : "zh",
        display : "center",
        //min: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        // invalid: ['w0', 'w6', '5/1', '12/24', '12/25'],
        dateOrder : 'Mddyy',
        timeFormat : "HH:ii",
        //timeWheels: 'HHiiss',
        dateFormat : "yy-mm-dd",
        minWidth : 200,
        width : 250,
        maxWidth : width,
        height : 60,
        onBeforeShow : function(event, inst) {
            inst.clear();
            inst.settings.max = new Date();
        }
    });
}

/**
 * 录音测试
 */
function testAudio() {
    var voiceFileName = new Date().Format("yyyyMMddHHmm");
    uexAudio.startBackgroundRecord(0, voiceFileName);
    timeOutEvent = setTimeout(function() {
        isAudioTest = true;
        uexAudio.stopBackgroundRecord();
    }, 500);
}

/**
 * 打开时间日期选择对话框
 */

function showDataTime() {
    disposeTime = disposeTime.replace(/-/g, "/");
    var minDate = new Date(disposeTime);

    var theme = "";
    if (uexWidgetOne.platformName.indexOf("android") > -1) {
        theme = "material";
    } else {
        theme = "ios";
    }
    var inst = mobiscroll.datetime('#time', {
        theme : theme,
        lang : "zh",
        display : "center",
        min : minDate,
        max : new Date(),
        // invalid: ['w0', 'w6', '5/1', '12/24', '12/25'],
        dateOrder : 'Mddyy',
        timeFormat : "HH:ii",
        //timeWheels: 'HHiiss',
        dateFormat : "yy-mm-dd",
        headerText : '{value}',
        height : 2 * em,
        width : 3 * em
    });
    inst.show();
}
/*输入框验证*/
function checkLen(obj){
    var len = $(obj).val().length;
    if(len > 199){
        $(obj).val($(obj).val().substring(0,200));
    }
    var num = 200 - len;
    if(num<0){
        num=0;
    }
    $("#word").text('('+num+'字)');
}

