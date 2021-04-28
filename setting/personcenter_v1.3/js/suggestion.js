appcan.ready(function() {
    suggestionObj.init();
});
var suggestionObj = {
    uuid : baseOperation.createuuid(),
    jasHttpRequest : new JasHttpRequest(),
    userBo : JSON.parse(appcan.locStorage.getVal("userBo")),
    imageArrays : [], //存储页面上的所有照片信息
    imgIndexOf : 0, //当前进行第几张图片上传
    init : function() {
        imagesObj.init();
        this.uploadImgCallback();
        this.bindEvent();
    },
    bindEvent : function() {
        baseOperation.addEmojiFliterEvent('input[type="text"]');
        $("#choose").click(function(e) {
            var currentnum = $('.img_mun_suggestion').text();
            if (currentnum == 9) {
                baseOperation.alertToast("意见反馈最多上传9张照片");
            } else {
                imagesObj.addpicture('img_mun_suggestion', 'pic_suggestions', '9');
            }
        });
        $(".telNumber").click(function() {
            var tel = $(this).text();
            uexCall.dial(tel);
        });
    },
    submitimganddata : function() {
        var that=this;
        var content = $("#text").val();
        if (content == "") {
            appcan.window.evaluateScript('suggestions', 'changebutton()');
            that.imgIndexOf=0;
            baseOperation.alertToast("请填写反馈意见!");
            return;
        }
        imagesObj.imgArray.forEach(function(item, index, arr) {
            item.dataList.forEach(function(data, num, arr) {
                that.imageArrays.push(data);
            });
        });
        if (that.imageArrays.length > 0) {
            that.uploadphoto(that.imageArrays[0].src, "pic_suggestions");
        } else {
            that.submitBusinessData();
        }
    },
    uploadphoto : function(imgpic, bizType) {
        var uploadHttp = serverURL + "cloudlink-core-file/attachment/save?businessId=" + this.uuid + "&bizType=" + bizType;
        if (appcan.locStorage.getVal("token") != null && appcan.locStorage.getVal("token").length > 0) {
            var token = appcan.locStorage.getVal("token");
            if (uploadHttp.indexOf("?") != -1) {
                uploadHttp += "&token=" + token;
            } else {
                uploadHttp += "?token=" + token;
            }
        }
        var headJson = '{"Content-type":"Multipart/form-data;charset=utf-8"}';
        var id = Number(Math.floor(Math.random() * (100000 + 1)));
        uexUploaderMgr.setHeaders(id, headJson);
        uexUploaderMgr.createUploader(id, uploadHttp);
        uexUploaderMgr.uploadFile(id, imgpic, "file", 0);
    },
    uploadImgCallback : function() {
        var that = this;
        uexUploaderMgr.onStatus = function(opCode, fileSize, percent, serverPath, status) {
            switch (status) {
            case 0:
                //alert("上传进度："+percent+"%");
                break;
            case 1:
                that.uploadnextImg();
                uexUploaderMgr.closeUploader(opCode);
                break;
            case 2:
                uexUploaderMgr.closeUploader(opCode);
                baseOperation.alertToast("第" + that.imgIndexOf + "张照片上传失败");
                break;
            }
        };
    },
    uploadnextImg : function() {
        var that = this;
        that.imgIndexOf++;
        baseOperation.alertToast("正在上传图片", -1);
        if (that.imgIndexOf < that.imageArrays.length) {
            that.uploadphoto(that.imageArrays[that.imgIndexOf].src, that.imageArrays[that.imgIndexOf].attaType);
        } else {
            that.submitBusinessData();
        }
    },
    submitBusinessData : function() {
        var that=this;
        baseOperation.alertToast("开始提交数据！");
        var advice = document.all.text.value;
        var contact = "</br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;姓名：" + this.userBo.userName + "</br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;手机号：" + this.userBo.mobileNum + "</br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;企业名称：" + this.userBo.enterpriseName + "</br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;部门名称：" + this.userBo.orgName;
        var params = {};
        var feedbackType = "";
        var texttype = document.getElementsByName("texttype");
        for (var i = 0; i < texttype.length; i++) {
            if (texttype[i].checked) {
                feedbackType += texttype[i].value + ",";
            }
        }
        feedbackType = feedbackType.substring(0, feedbackType.length - 1);
        params = {
            description : advice, //填写的建议
            feedbackType : feedbackType, //建议类型
            contact : contact,
            objectId : that.uuid//插入的主键id
        }
        var URL = "cloudlink-core-framework/feedback/addAdvice";
        that.jasHttpRequest.jasHttpPost(URL, function(id, state, dbSource) {
            var obj = JSON.parse(dbSource);
            if (obj.success == 1) {
                try {
                    if (tjSwitch == 1) {
                        var zg_param1 = {
                            eventName : "意见反馈",
                            info : {}
                        };
                        uexTianji.track(zg_param1);
                    }
                } catch(e) {
                }
                appcan.window.alert("感谢您的反馈");
                appcan.window.evaluateScript('suggestions', 'close()');
                appcan.openWinWithUrl("personal", "../../personal/personal.html");
            }
        }, JSON.stringify(params));
    }
}

