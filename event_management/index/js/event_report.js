/**
 * Created by Administrator on 2016/11/2.
 */
var imageNumber = 0;
var voiceFileName = "";
var number = 0;
var arr = [];
var event_id = "";
var eventStatus = "";
var formArry = null;
var people_data = [];
var jasHttpRequest = null;
var isAudioTest = false;
var isSaveOnLine = true;
var em = currentFontSize(document.getElementById('event_refer'));


/**
 * 录音测试
 */
function testAudio() {
    var voiceFileName = new Date().Format("yyyyMMddHHmm");
    uexAudio.startBackgroundRecord(0, voiceFileName);
    timeOutEvent = setTimeout(function () {
        isAudioTest = true;
        uexAudio.stopBackgroundRecord();
    }, 500);
}
/**
 * 录音回调
 */
uexAudio.cbRecord = function (opId, dataType, data) {
    $("#voiceFile").val(data);
    $("#voiceFiles").show();
    $("#voice").hide();
};
//背景录音结束回调
uexAudio.cbBackgroundRecord = function (opId, dataType, data) {
    if (isAudioTest) {
        // baseOperation.alertToast(1111);
        //uexFileMgr.deleteFileByPath(data);
    } else {
        // baseOperation.alertToast("22",10000);
        // $("#voiceTime").html(intValue+"''");
        // $("#kuai").hide();
        $("#voiceFile").val(data);
        // $("#voiceFiles").show();
        // $("#voice").hide();
        // $("#speak").val("按住说话");
        // objPro.val(0);
        // objTip.html('开始录音');
        // intValue = 0;
        // clearTimeout(intTimer);
        //清除定时器
    }
};
/**
 * 录音播放完成回调
 */
uexAudio.onPlayFinished = function (loopTime) {
    isPalyVoice = true;
    $("#audio_img").removeClass("audio_img_animation");
};
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


var audioTimeOutEvent = 0;
//定时器
//开始按
function audioGtouchstart(obj) {
    audioTimeOutEvent = setTimeout(function () {
        audioLongPress(obj);
    }, 900);
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
    setTimeout(function () {
        uexAudio.stopBackgroundRecord();
    }, 500);
}

//真正长按后应该执行的内容
function audioLongPress(obj) {
    isAudioTest = false;
    clearTimeout(audioTimeOutEvent);
    $("#speak").val("松开结束").css("background", "#c3e4ff");
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
    if (intTimer) { //开启定时器前先清除定时器 高峰 20161105
        clearInterval(intTimer);
    }
    intTimer = setInterval(Interval_handler, 1000);
}



appcan.ready(function () {
    people_data = [];
    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    var userId = userBo.objectId;
    var userName = userBo.userName;
    var my = {
        'userId': userId,
        'userName': userName
    };

    people_data.push(my);
    jasHttpRequest = new JasHttpRequest();
    uexWindow.setWindowScrollbarVisible(false);
    testAudio();
    $(".pay_list_c1").each(function (e) {
        $(this).click(function () {
            $(".pay_list_c1").removeClass("on");
            $(this).addClass("on");
            $(this).find("input[type='radio']").prop("checked", true);
            if ($(this).find("input").val() == 30) {
                $('.whether_no').css("color", '#ff3f3f');
            } else {
                $('.whether_no').css("color", '#999');
            }
            //$(".report_whether_main").find(".report_list").eq(e).removeClass("yes_no").siblings().addClass("yes_no");
        })
    });
    uexWidgetOne.cbError = function (opCode, errorCode, errorInfo) {
        //alert(errorInfo);
    };
    uexUploaderMgr.onStatus = function (opCode, fileSize, percent, serverPath, status) {
        //uexLog.sendLog("status:"+status);
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
    uexUploaderMgr.cbCreateUploader = function (opCode, dataType, data) {
        if (data == 0) {
            //uexLog.sendLog("创建成功");
        } else {
            //alert("上报失败");
            //.sendLog("dd:创建失败");
        }

    };
    /*拍照回调*/
    // uexCamera.cbOpen = function(opCode, dataType, data){
    uexCamera.cbOpenInternal = function (opCode, dataType, data) {
        var mun = parseInt($(".img_mun").text());
        $(".img_mun").text(mun + 1);
        var option = "";
        option = '<div class="ufl pic_list" id="preview_' + imageNumber + '">' + '<img src="' + data + '" onclick="previewPicture(this)" ontouchstart="gtouchstart(this)" ontouchmove="gtouchmove(this)" ontouchend="gtouchend(this)"  height="260px" width="260px" alt=""/>' + '</div>';
        setTimeout(function () {
            $("#camera_img").append(option);
        }, 2000);
        imageNumber++;
    };

    /**
     * 打开相册回调
     */
    uexImage.onPickerClosed = function (info) {
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
    uexControl.cbOpenDatePicker = function (opId, dataType, data) {
        var dateObj = JSON.parse(data);
        var dateStr = dateObj.year + "-" + dateObj.month + "-" + dateObj.day;
        $("#time").val(dateStr);
    };


    /*坐标转地址回调*/
    uexLocation.cbGetAddress = function (opCode, dataType, data) {
        try {
            var objData = JSON.parse(data);
            // baseOperation.alertToast("333:"+objData.location.lng+","+objData.location.lat);
            $("#address").val(objData.formatted_address);
            // $("#lon").val(objData.location.lng);
            // $("#lat").val(objData.location.lat);
            uexLocation.closeLocation();
            // $("#address").removeAttr("readonly");
        } catch (e) {
            alert(e)
        }
    };

    /*获取坐标*/
    uexLocation.onChange = function (lat, log) {
        if (lat < 10 && log < 10) {
            return;
        }
        try {
            /*var params = {
                latitude: lat,
                longitude: log,
                type: "wgs84",
                flag: 1
            };
            var params1 = {
                latitude: lat,
                longitude: log,
                from: "wgs84",
                to: "bd09"
            };
            var dataBd = uexLocation.convertLocation(JSON.stringify(params1));
            var obj = JSON.parse(dataBd);
            $("#lonBd").val(obj.longitude);
            $("#latBd").val(obj.latitude);*/
            $("#lonBd").val(log);
            $("#latBd").val(lat);
            var params = {
                latitude : lat,
                longitude : log,
                type : "bd09",
                flag : 1
            };
            var params1 = {
                "latitude":lat,
                "longitude":log
            }
            var dataGCJ02=uexLockScreen.BD09LLT0GCJ02(JSON.stringify(params1));
            var objData = JSON.parse(dataGCJ02);
            $("#lat").val(objData.latitude);
            $("#lon").val(objData.longitude);
            /*坐标转地址*/
            uexLocation.getAddressByType(JSON.stringify(params));
        } catch (e) {
            alert(e);
        }
    };



    $('body').on('click', function (event) {
        if (event.target.id != "delete_div") {
            $("#bubble").remove();
        }
    });

    /*事件类型选择*/
    appcan.select(".select", function (ele, value) {
        var parentEle = ele[0].parentElement;
        var textEle = parentEle.getElementsByTagName("div")[0];
        $("#fullTypeName").val($(textEle).html());
        //2017-08-14 新增图片类型的值 sf
        $("#eventIconName").val($("#select_type option:selected").attr("iconname"));
    });

    /*
     * 事件加载下拉选
     */
    loadEventType(function () {
        initParams();
    });
    //baseOperation.addEmojiFliterEvent('input[type="text"]'); //绑定过滤emoji的事件
    baseOperation.addEmojiFliterEvent('#introduce_text', checkLen); //绑定过滤emoji的事件

});

/*上传文件方法*/
function upload() {
    if (arr.length == 0) { //没有上传图片时，直接提交数据
        /*上传数据*/
        baseOperation.alertToast("开始提交数据！");
        /*上传数据*/
        var partURL = "cloudlink-inspection-event/eventInfo/saveBatch";
        var tep = [];
        delete formArry.parentTypeId;
        delete formArry.userName;
        tep.push(formArry);
        //alert(JSON.stringify(tep));
        jasHttpRequest.jasHttpPost(partURL, function (id, state, dbSource) {
            if (dbSource.length == 0) {
                baseOperation.alertToast("网络繁忙，请稍后再试...");
                return;
            }
            var resultData = JSON.parse(dbSource);
            if (resultData.success == "1") {
                sendZhugeMessager();
            } else {
                if (tjSwitch == 1) {
                    try {
                        var param = {
                            "eventName": "事件上报失败",
                            "info": {
                                "入口": "事件管理",
                                "失败原因": dbSource.code
                            }
                        };
                        uexTianji.track(param);
                    } catch (e) {}
                }
                baseOperation.alertToast("数据提交失败！");
                appcan.window.evaluateScript('event_report', "changeButton()");
            }
        }, JSON.stringify(tep));
    } else {
        uploadImg();
    }
}

/**
 * 发送埋点信息并且关闭新增界面
 */
function sendZhugeMessager() {
    var fullTypeName = $("#fullTypeName").val();
    var audioFile = $("#voiceFile").val();
    var isExistTaskUserMsg = "否";
    var attaDataNumber = arr.length;
    if (formArry.status == 20) {
        isExistTaskUserMsg = "是";
    }
    var isExistAudio = "否";
    if (audioFile != "") {
        isExistAudio = "是";
        attaDataNumber--;
    }
    var eventEntrance = "事件管理";
    if (appcan.locStorage.getVal("enterEventModel") != "") {
        eventEntrance = "日常巡检";
    }
    if (tjSwitch == 1) {
        try {
            var zhuge_param = {
                "入口": eventEntrance,
                "事件id": formArry.objectid,
                "事件类型": fullTypeName,
                "事件时间": formArry.occurrenceTime,
                "是否有语音描述": isExistAudio,
                "上传图片数量": attaDataNumber,
                "是否报送": isExistTaskUserMsg
            };
            var zhugeParam = {
                "eventName": "事件上报成功",
                "info": zhuge_param
            };
            uexTianji.track(zhugeParam);
        } catch (e) {

        }
    }
    // deleteOfflineData(formArry.objectId);
    baseOperation.alertToast("数据提交完成！");
    if (appcan.locStorage.getVal("enterEventModel") != "") {
        appcan.window.evaluateScript('event_report', "rcxj_return()");
        return;
    }
    appcan.window.evaluateScript('event_report', "utn_return('" + eventStatus + "')");
}

/**
 * 附件上传成功毁掉函数
 */
function uploadSuccess() {
    baseOperation.alertToast("第" + number + "张照片上传成功", -1);
    //uexLog.sendLog("dd:上传成功");
    number++;
    if (number < arr.length) {
        uploadImg();
    } else {
        baseOperation.alertToast("开始提交数据！");
        /*上传数据*/
        var partURL = "cloudlink-inspection-event/eventInfo/saveBatch";
        var tep = [];
        // delete formArry.parentTypeId;
        // delete formArry.userName;
        tep.push(formArry);
        //alert(JSON.stringify(tep));
        jasHttpRequest.jasHttpPost(partURL, function (id, state, dbSource) {
            if (dbSource.length == 0) {
                baseOperation.alertToast("网络繁忙，请稍后再试...");
                appcan.window.evaluateScript('event_report', "changeButton()");
                return;
            }
            var resultData = JSON.parse(dbSource);
            if (resultData.success == "1") {
                sendZhugeMessager();
            } else {
                if (tjSwitch == 1) {
                    try {
                        var zhuge_param = {
                            "eventName": "事件上报失败",
                            "info": {
                                "入口": "事件管理",
                                "失败原因": dbSource.code
                            }
                        };
                        uexTianji.track(zhuge_param);
                    } catch (e) {}
                }
                baseOperation.alertToast("数据提交失败！");
                appcan.window.evaluateScript('event_report', "changeButton()");
            }
        }, JSON.stringify(tep));
    }
}

function uploadImg() {
    var uploadHttp = "";
    var dataImgObj = arr[number];
    var dataImg = dataImgObj.path;
    var dataType = dataImgObj.type;
    if (dataType == "pic") {
        baseOperation.alertToast("开始上传图片...", -1);
        uploadHttp = serverURL + "cloudlink-core-file/attachment/save?businessId=" + event_id + "&bizType=pic";
    } else if (dataType == "audio") {
        baseOperation.alertToast("开始上传语音...", -1);
        uploadHttp = serverURL + "cloudlink-core-file/attachment/save?businessId=" + event_id + "&bizType=audio";
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
        filePath: dataImg,
        callback: function (err, data, dataType, optId) {
            if (!err && data == 1) {
                var headJson = '{"Content-type":"Multipart/form-data;charset=utf-8"}';
                var id = Number(Math.floor(Math.random() * (100000 + 1)));
                uexUploaderMgr.setHeaders(id, headJson);
                uexUploaderMgr.createUploader(id, uploadHttp);
                uexUploaderMgr.uploadFile(id, dataImg, "file", 0);
            } else {
                //附件丢失，上传下一个附件
                uploadSuccess();
            }
        }
    });
}

/*联系人的名字导入*/
function import_name() {
    people_data = [];
    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    var userId = userBo.objectId;
    var userName = userBo.userName;
    var my = {
        'userId': userId,
        'userName': userName
    };
    people_data.push(my);

    var peopleNames = "";
    /*判断人员选中页面，是否传值是否为空*/
    if (appcan.locStorage.getVal("userSelect") != "" && appcan.locStorage.getVal("userSelect") != null && appcan.locStorage.getVal("userSelect") != "undefined") {
        //标识选中有值
        var people_select = appcan.locStorage.getVal("userSelect");
        var people_data1 = JSON.parse(people_select).peo_data;
        people_data = people_data.concat(people_data1);
        peopleNames = JSON.parse(people_select).peo_name;
    }
    //$("input[name='people']").val(peopleNames);
    $(".whether_people").text(peopleNames);
}

/*表单提交*/
function on_submit(e) {
    formArry = formOperation.getFormJson("#event_refer");
    var formArry1 = formOperation.getFormJson("#event_refer1");
    var desc = formArry.description;
    formArry.description = desc.trim();
    if (formArry.type == 0) {
        baseOperation.alertToast("请选择事件的类型");
        appcan.window.evaluateScript('event_report', "changeButton()");
        return false;
    } else if (formArry.occurrenceTime == "") {
        baseOperation.alertToast("请选择发生事件的时间");
        appcan.window.evaluateScript('event_report', "changeButton()");
        return false;
    } else if (formArry.address == "") {
        baseOperation.alertToast("请输入发生事件的地点");
        appcan.window.evaluateScript('event_report', "changeButton()");
        return false;
    } else if (formArry.description == '' || formArry.description == undefined || formArry.description == null) {
        baseOperation.alertToast("请描述发生的事件");
        appcan.window.evaluateScript('event_report', "changeButton()");
        return false;
    }
    formArry["parentTypeId"] = formArry.type.split("_")[1];
    formArry.type = formArry.type.split("_")[0];
    event_id = baseOperation.createuuid();
    formArry.objectId = event_id;
    formArry.eventCode = (new Date()).Format("yyyyMMddHHmmssS");
    formArry.reportTime = (new Date()).Format("yyyy-MM-dd");
    formArry["userName"] = JSON.parse(appcan.locStorage.getVal("userBo")).userName;
    formArry.status = formArry1.radio;
    eventStatus = formArry1.radio;
    if (eventStatus == 20) {
        formArry.taskUserMsg = people_data;

    }

    /*上传路径*/
    $("#camera_img").find(".ufl").each(function () {
        var dataImg = $(this).find("img").attr("src");
        var obj = {
            "path": dataImg,
            "type": "pic"
        }
        arr.push(obj);
    });
    var audioFile = $("#voiceFile").val();
    if (audioFile != undefined && audioFile != null && audioFile != "") {
        var obj = {
            "path": audioFile,
            "type": "audio"
        };
        arr.push(obj)
    }

    if (e == 1) {
        isSaveOnLine = false;
        if (tjSwitch == 1) {
            try {
                var zhuge_param = {
                    "eventName": "事件上报保存至草稿箱",
                    "info": {
                        "入口": "事件管理"
                    }
                };
                uexTianji.track(zhuge_param);
            } catch (e) {}
        }
        saveOfflineAttaData(arr, formArry.objectId);
    } else {
        JasDevice.getConnectStatus(function (params) {
            if (params == -1) { //无网络
                baseOperation.alertToast("您好，当前无网络无法上报！");
                arr = [];
                formArry = null;
                appcan.window.evaluateScript('event_report', "changeButton()");
                return;
            } else {
                appcan.window.confirm({
                    title: '提示',
                    content: '您好，是否确认提交？',
                    buttons: ['确定', '取消'],
                    callback: function (err, data, dataType, optId) {
                        if (err || data === 0) { //是
                            isSaveOnLine = true;
                            upload();
                        } else {
                            arr = [];
                            //清空附件列表
                            appcan.window.evaluateScript('event_report', "changeButton()");
                        }
                    }
                });
            }
        });
    }
}

/**
 * 打开相册
 */
function openAlbum() {
    var mun = parseInt($(".img_mun").text());
    var data = {
        min: 1,
        max: (5 - mun),
        quality: 0.5,
        detailedInfo: false
    };
    var json = JSON.stringify(data);
    uexImage.openPicker(json);
}

/*上传照片*/
function saveToPhotoAlbum() {
    var data = {
        localPath: "res://photo4.jpg",
        extraInfo: "wwwwww"
    };
    var json = JSON.stringify(data);
    //alert("xx");
    uexImage.saveToPhotoAlbum(json);
}

/*打开日历插件*/
function openDate() {
    // uexControl.openDatePicker();
}



/*打开定位*/
function getAddres() {
    // baseOperation.alertToast("1");
    // uexLocation.openLocation("wgs84");
    var param = {
        "parentWindowId": "event_report",
        "windowId": "event_report_content",
        "callBackName": "setPointValue()"
    };
    var addressInfo = {
        "addressName": $("#address").val(),
        "longitude": $("#lonBd").val(),
        "latitude": $("#latBd").val()
    }
    appcan.locStorage.setVal("selectAddress_param", param);
    appcan.locStorage.setVal("selectAddress_info", addressInfo);
    if (appcan.locStorage.getVal("enterEventModel") == "") {
        if (tjSwitch == 1) {
            try {
                var param = {
                    "eventName": "地理位置选择",
                    "info": {
                        "入口": "事件管理"
                    }
                };
                uexTianji.track(param);
            } catch (e) {}
        }
        appcan.openWinWithUrl("select_address", "openMap/select_address.html");
    }
    appcan.locStorage.remove("point_param");

}

/*浏览照片*/
function previewPicture(thisObj) {
    var i = 0;
    var index = 0;
    var data = [];
    $("#camera_img img").each(function () {
        var obj = {
            "src": $(this).attr("src"),
            "thumb": $(this).attr("src")
        }
        if ($(this).attr("src") == $(thisObj).attr("src")) {
            index = i;
        }
        data.push(obj);
        i++;
    });
    var dataParam = {
        displayActionButton: true,
        displayNavArrows: true,
        enableGrid: false,
        startOnGrid: false,
        startIndex: index,
        data: data
    };
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
        "actionSheet_style": {
            "frameBgColor": "#00000000",
            "frameBroundColor": "#00000000",
            "frameBgImg": "",
            "btnSelectBgImg": "res://btn.png",
            "btnUnSelectBgImg": "res://btn.png",
            "cancelBtnSelectBgImg": "res://btn.png",
            "cancelBtnUnSelectBgImg": "res://btn.png",
            "textSize": "17",
            "textNColor": "#333",
            "textHColor": "#333",
            "cancelTextNColor": "#333",
            "cancelTextHColor": "#333",
            "actionSheetList": [{
                "name": "拍照"
            }, {
                "name": "从相册选择"
            }]
        }
    };
    uexActionSheet.open(x, y, width, height, JSON.stringify(JsonData));
    uexActionSheet.onClickItem = function (data) {
        if (data == 1) {
            openAlbum();
        } else if (data == 0) {
            // uexCamera.open();
            uexCamera.openInternal(0, 75);
        }

    }
}



var isAduioOvertime = false;
var intValue = 0;
var intTimer;
var objPro = $('#proDownFile');
var objTip = $('#pTip');

function Interval_handler() {
    intValue++;
    objPro.val(intValue);
    if (intValue == parseInt(objPro.attr("max"))) {
        //setAudioClass();
        isAduioOvertime = true;
        $("#speak").trigger("touchend");
        appcan.window.confirm({
            title: '提示',
            content: '录音最长时长为30秒，是否重新录音？',
            buttons: ['确定', '取消'],
            callback: function (err, data, dataType, optId) {
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
    $("#speak").val("按住说话").css("background", "#59b5fe");
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
    timeOutEvent = setTimeout(function () {
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

/**
 * 删除图片
 */
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
        "parentWidowId": "event_report",
        "windowId": "event_report_content",
        "functionName": "import_name()"
    };
    appcan.locStorage.setVal("useSelectList_param", windowParam);
    if (tjSwitch == 1) {
        try {
            var zhuge_param = {
                "eventName": "接收人选择",
                "info": {
                    "入口": "事件管理"
                }
            };
            uexTianji.track(zhuge_param);
        } catch (e) {}
    }
    appcan.openWinWithUrl("users-select", "../common/page/users_select/users_select.html");
}

/**
 * 设置点坐标
 */
function setPointValue() {
    var pointParam = appcan.locStorage.getVal("point_param");
    pointParam = JSON.parse(pointParam);
    $("#address").val(pointParam.address);
    // $("#lon").val(pointParam.GPSpoint.longitude);
    // $("#lat").val(pointParam.GPSpoint.latitude);
    $("#lon").val(pointParam.GCJ02Point.longitude);
    $("#lat").val(pointParam.GCJ02Point.latitude);
    $("#lonBd").val(pointParam.baiduPoint.longitude);
    $("#latBd").val(pointParam.baiduPoint.latitude);
    appcan.locStorage.remove("point_param");
}



/*
 * 加载事件类型的方法
 */
function loadEventType(callBack) {
    var dbOperation = new DataBaseOperation();
    var sql = "select * from customEventType order by parentIndexNum,indexNum";
    dbOperation.dbSelect(sql, function (err, data) {
        if (err != null) {
            baseOperation.alertToast("加载事件异常");

        } else {
            var json_a = data;
            $("#select_type").html("");
            var txt = '<option value="0" iconname="">请选择</option>';
            for (var i in json_a) {
                txt += '<option value="' + json_a[i].objectId + '_' + json_a[i].parentId + '" iconname="' + json_a[i].iconName + '">' + json_a[i].typeName + '</option>'
            }
            $("#select_type").append(txt);
            /*默认选中第一个*/
            $("#select_type").val(json_a[0].objectId + '_' + json_a[0].parentId);
            $("#select_type").trigger('change');
            $(".text").text(json_a[0].typeName);
            $("input[name='fullTypeName']").val(json_a[0].typeName);
            //2017-08-14 新增事件类型图标的值
            $("#eventIconName").val(json_a[0].iconName);
            callBack();
        }
    });
}


/**
 * 数据保存到本地
 */
function saveOfflineData() {
    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    var eventData = [];
    var jsonData = JSON.stringify(formArry);
    var localid = new Date().Format("yyyyMMddHHmmssS");
    var url = "cloudlink-inspection-event/eventInfo/saveBatch";
    var data = {
        "localId": localid,
        "eventId": formArry.objectId,
        "partUrl": url,
        "postData": jsonData,
        "state": "0",
        "userId": userBo.objectId,
        "enterpriseId": userBo.enterpriseId
    };
    eventData.push(data);
    saveOfflineEventData(eventData, function (result) {
        if (result.success == "1") {
            baseOperation.alertToast(result.msg);
            if (isSaveOnLine) {
                // upload();
            } else {
                baseOperation.alertToast("数据保存完成！");
                if (appcan.locStorage.getVal("enterEventModel") != "") {
                    appcan.window.evaluateScript('event_report', "rcxj_return()");
                    return;
                }
                appcan.window.evaluateScript('event_report', "utn_return('90')");
            }
        } else {
            baseOperation.alertToast("数据保存失败！");
            appcan.window.evaluateScript('event_report', "changeButton()");
        }
    });
}

/**
 * 附件信息保存到本地
 * @param {Object} dataArry
 * @param {Object} businessId
 */
function saveOfflineAttaData(dataArry, businessId) {
    var attaData = [];
    if (dataArry.length > 0) {
        for (var i = 0; i < dataArry.length; i++) {
            // var jsonData={"businessId":businessId,"bizType":dataArry[i].type,"filePath":dataArry[i].path};
            var localid = new Date().Format("yyyyMMddHHmmssS");
            var url = "cloudlink-core-file/attachment/save";
            var data = {
                "localId": localid,
                "eventId": businessId,
                "attaType": dataArry[i].type,
                "localUrl": url,
                "postData": dataArry[i].path,
                "state": "0"
            };
            attaData.push(data);
        }
        saveOfflineEventAttaData(attaData, function (result) {
            if (result.success == "1") {
                baseOperation.alertToast("附件本地保存成功！");
                saveOfflineData();
            }
        });
    } else {
        saveOfflineData();
    }
}

/**
 * 删除本地数据
 * @param {Object} eventid
 */
function deleteOfflineData(eventid) {
    deleteOfflineEventData(eventid, function (result) {
        if (result.success == "1") {
            deleteOfflineEventAttaData(eventid, function (resultData) {
                if (resultData.success == "1") {
                    baseOperation.alertToast("本地缓存数据清除成功");
                }
            });
        }
    });
}

/*
 * 初始化参数
 */
function initParams() {
    /*
     * enterModel对象类型描述
     * {model:1}
     */
    //var enterModel = appcan.locStorage.getVal("enterEventModel");
    baseOperation.alertToast("初始化中，请稍候...");
    $("#time").val(new Date().Format("yyyy-MM-dd HH:mm"));
    var _InspRecordId = "";
    try {
        _InspRecordId = uexLockScreen.getRecordId();
    } catch (e) {
        _InspRecordId = "";
    }
    $("#inspRecordId").val(_InspRecordId);
    // uexLocation.openLocation("wgs84");
    uexLocation.openLocation("bd09");
}

/*$("#radio_yse").on("click",function(){
var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
var my={'userId':userBo.objectId,'userName':userBo.userName};
people_data.push(my);
$("input[name='people']").val();
});*/
/**
 * 打开时间日期选择对话框
 */
function showDataTime() {
    var width = $('body').width();
    var theme = "";
    if (uexWidgetOne.platformName.indexOf("android") > -1) {
        theme = "material";
    } else {
        theme = "ios";
    }
    var inst = mobiscroll.datetime('#time', {
        theme: theme,
        lang: "zh",
        display: "center",
        max: new Date(),
        // invalid: ['w0', 'w6', '5/1', '12/24', '12/25'],
        dateOrder: 'Mddyy',
        timeFormat: "HH:ii",
        //timeWheels: 'HHiiss',
        dateFormat: "yy-mm-dd",
        headerText: '{value}',
        height: 2 * em,
        width: 3 * em
    });
    inst.show();
}

function checkLen(obj) {
    var len = $(obj).val().length;
    if (len > 199) {
        $(obj).val($(obj).val().substring(0, 200));
    }
    var num = 200 - len;
    if (num < 0) {
        num = 0;
    }
    $("#word").text('(' + num + '字)');
}