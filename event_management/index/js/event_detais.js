var jasHttpRequest = new JasHttpRequest();
var picData = [];
var dbOperation = null;
var eventData = null;
var withAll = null;
var num = 0;
appcan.ready(function() {
    withAll = ($(".img_details").width() - 21) / 3;
    var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
    dbOperation = new DataBaseOperation();
    var eventId = appcan.locStorage.getVal("offlineEvent_Id");
    //uexLog.sendLog(eventId);
    appcan.locStorage.remove("offlineEvent_Id");
    var sql = "select * from eventlist where eventid='" + eventId + "';";
    dbOperation.dbSelect(sql, function(err, result) {
        if (err == null) {
            var resultData = result[0].postdata;
            eventData = JSON.parse(resultData);
            $(".report_literal").find("p").text(eventData.description);
            $(".details_address").text(eventData.address);
            //地址
            $(".details_inspectorId").text(userBo.userName);
            //上报人
            $(".details_eventCode").text(eventData.eventCode);
            //事件号
            $(".details_occurrenceTime").text(eventData.occurrenceTime);
            $(".details_typeName").text(eventData.fullTypeName);
            getAttaData(eventId);
        }
    });
});
function getAttaData(eventId) {
    var sql = "select * from event_attachment where eventid='" + eventId + "'";
    dbOperation.dbSelect(sql, function(err, result) {
        if (err == null) {
            var pic_scr = '';
            $(".img_details").html("");
            for (var i = 0; i < result.length; i++) {
                var data = result[i];
                var attaType = data.attaType;
                if (attaType == "pic") {
                    pic_scr += '<div class="ufl img_width ub-ac"><span>' + '<img  src="' + data.postdata + '" id="' + i + '" width="' + parseInt(withAll) + '" height="' + parseInt(withAll) + '" onclick="previewPicture(this)" alt=""/>' + '</span></div>';
                    var obj = {
                        "src" : data.postdata
                    };
                    picData.push(obj);
                    num++;
                } else if (attaType == "audio") {
                    $("#audioFile").html(data.postdata);
                }
            }
            $(".camera_number").text(num);
            if (!($("#audioFile").html() != undefined && $("#audioFile").html() != "")) {
                //$("#audio").removeClass("audio1").addClass("audio2");
                $("#voiceFiles").parent().html('<div class="ub-f1 ub-fv report_text"><span class="mun-camera ubl sc-border-cor details_occurrenceTime">无</span></div>');
                $("#voiceFiles").remove();
            }
            $(".img_details").append(pic_scr);
            $(".img_width").width(withAll - 2);
            $(".img_width").height(withAll - 2);
            //getEventTypeName(eventData.type);
        }
    });
}

function getEventTypeName(type) {
    var sql = "select * from customEventType where objectId='" + type + "'";
    dbOperation.dbSelect(sql, function(err, result) {
        if (err == null) {
            $(".details_typeName").text(result[0].typeName);
        }
    });
}

/*浏览照片*/
function previewPicture(thisObj) {
    var index = thisObj.id;
    if (index == undefined || index == "" || index == null) {
        index = "0";
    }
    var dataParam = {
        displayActionButton : true,
        displayNavArrows : true,
        enableGrid : false,
        startOnGrid : false,
        startIndex : Number(index),
        data : picData
    };
    var json = JSON.stringify(dataParam);
    uexImage.openBrowser(json);
}

var isPalyVoice = true;
function playVoice() {
    var savePath = $("#audioFile").html();
    try {
        if (savePath != undefined && savePath != "") {
            if (isPalyVoice) {
                isPalyVoice = false;
                $("#audio_img").addClass("audio_img_animation");
                uexAudio.open(savePath);
                uexAudio.setProximityState('1');
                uexAudio.play(0);
            } else {
                uexAudio.stop();
                isPalyVoice = true;
                $("#audio_img").removeClass("audio_img_animation");
            }
        } else {
            baseOperation.alertToast("没有录音文件...");
        }
    } catch(e) {
        alert(e);
    }
}
