appcan.ready(function() {
    applayObj.init();
});
var applayObj = {
    imageArrays: [], //存储页面上的所有照片信息
    imgIndexOf: 0,
    jasHttpRequest: new JasHttpRequest(),
    userBo: JSON.parse(appcan.locStorage.getVal("userBo")),
    eventsMap: {
        'click .addphoto': 'e_addphotoBytype', //选择公司营业执照照片
    },
    init: function() {
        this.renderbaseInfo();
        //公司的基本信息渲染
        imagesObj.init();
        this.bindEvent();
        this.uploadImgCallback();
    },
    renderbaseInfo: function() {
        var that = this;
        var enterpriseName = appcan.locStorage.getVal("enterpriseName");
        if (enterpriseName == null || enterpriseName == "") {
            $("#text").val(that.userBo.enterpriseName);
        } else {
            $("#text").val(enterpriseName);
        }
    },
    bindEvent: function() {
        $('body').on('click', function(event) {
            if (event.target.id != "delete_div") {
                $("#bubble").remove();
            }
        });
        this.initializeOrdinaryEvent(this.eventsMap);
    },
    initializeOrdinaryEvent: function(maps) {
        this._scanEventsMap(maps, true);
    },
    _scanEventsMap: function(maps, isOn) {
        var delegateEventSplitter = /^(\S+)\s*(.*)$/;
        var type = isOn ? 'on' : 'off';
        for (var keys in maps) {
            if (maps.hasOwnProperty(keys)) {
                if (typeof maps[keys] === 'string') {
                    maps[keys] = this[maps[keys]].bind(this);
                }
                var matchs = keys.match(delegateEventSplitter);
                $('body')[type](matchs[1], matchs[2], maps[keys]);
            }
        }
    },
    e_addphotoBytype: function(e) {
        var t = e.target;
        var pictype = $(t).attr('pictype');
        var currentnum = $(t).parent().parent().find('.img_mun').text();
        var picnum = {
            'pic_business': '3',
            'pic_identity': '2',
            'pic_roster': '6'
        }
        var picdesc = {
            'pic_business': '营业执照最多上传3张',
            'pic_identity': '法人身份证最多上传2张',
            'pic_roster': '企业人员花名册最多上传6张'
        }
        var numdom = {
            'pic_business': 'img_mun_bus',
            'pic_identity': 'img_mun_iden',
            'pic_roster': 'img_mun_rose'
        }
        if (currentnum == picnum[pictype]) {
            baseOperation.alertToast(picdesc[pictype]);
            return;
        }
        imagesObj.addpicture(numdom[pictype], pictype, picnum[pictype]);
        //营业执照
    },
    submitdata: function() {
        var that = this;
        var enterpriseName = $("#text").val().trim();
        var registerNum = document.getElementById("registerNum").value;
        appcan.locStorage.setVal("enterpriseName", enterpriseName);
        if (!that._checkEnterprised()) {
            appcan.window.evaluateScript('applayapprove', 'changeClick()');
            return;
        } else if (registerNum == null || registerNum == "") {
            baseOperation.alertToast("请输入社会统一信用代码");
            appcan.window.evaluateScript('applayapprove', 'changeClick()');
            return;
        } else if ($(".pic_business").find(".picList").length == 0) {
            baseOperation.alertToast("营业执照至少上传一张照片");
            appcan.window.evaluateScript('applayapprove', 'changeClick()');
            return;
        } else {
            var applay = appcan.locStorage.val("againapplay");
            //判断当前是再次申请还是第一次申请
            if (applay) {
                that.deleteAllPicBeforeUpload();
            } else {
                that.getPicDataList();
            }

        }
    },
    getPicDataList: function() {
        var that = this;
        imagesObj.imgArray.forEach(function(item, index, arr) {
            item.dataList.forEach(function(data, num, arr) {
                that.imageArrays.push(data);
            });
        });
        that.uploadphoto(that.imageArrays[0].src, that.imageArrays[0].attaType);
    },
    uploadphoto: function(imgpic, bizType) {
        var uploadHttp = serverURL + "cloudlink-core-file/attachment/save?businessId=" + this.userBo.enterpriseId + "&bizType=" + bizType;
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
    uploadImgCallback: function() {
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
    _checkEnterprised: function() {
        var enterpriseName = $("#text").val().trim();
        if (enterpriseName.length === 0) {
            baseOperation.alertToast("请输入企业名称");
            return false;
        } else if (/[^(A-Za-z_\-\u4e00-\u9fa5)]/.test(enterpriseName) === true) {
            baseOperation.alertToast("企业名称只能由汉字、字母、下划线组成");
            return false;
        } else if (enterpriseName.length < 2) {
            baseOperation.alertToast("您输入的企业名称过短");
            return false;
        } else if (enterpriseName.length > 30) {
            baseOperation.alertToast("您输入的企业名称过长");
            return false;
        } else {
            return true;
        }
    },
    uploadnextImg: function() {
        var that = this;
        that.imgIndexOf++;
        baseOperation.alertToast("正在上传图片", -1);
        if (that.imgIndexOf < that.imageArrays.length) {
            that.uploadphoto(that.imageArrays[that.imgIndexOf].src, that.imageArrays[that.imgIndexOf].attaType);
        } else {
            that.submitBusinessData();
        }
    },
    submitBusinessData: function() {
        var that = this;
        var enterpriseName = document.getElementById("text").value;
        var registerNum = document.getElementById("registerNum").value;
        baseOperation.alertToast("开始提交数据！");
        /*上传数据*/
        var partURL = "cloudlink-core-framework/enterprise/authenticate";
        that.jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
            if (dbSource.length == 0) {
                baseOperation.alertToast("网络繁忙，请稍后再试...");
                appcan.window.evaluateScript('applayapprove', 'changeClick()');
                return;
            }
            var obj = JSON.parse(dbSource);
            if (obj.success == 1) {
                appcan.window.evaluateScript('applayapprove', 'close()');
               // appcan.openWinWithUrl("companylist", "companylist_create.html");
            } else if (obj.code == "402") {
                appcan.locStorage.remove("enterpriseName");
                baseOperation.alertToast("您好，该公司名称已被占用，请联系客服。");
                that.imgIndexOf = 0;
                that.imageArrays=[];
                appcan.window.evaluateScript('applayapprove', 'changeClick()');
                that.submitBusDataFailure();
            } else {
                appcan.locStorage.remove("enterpriseName");
                baseOperation.alertToast("网络繁忙，请稍后再试...");
                that.imgIndexOf = 0;
                that.imageArrays=[];
                appcan.window.evaluateScript('applayapprove', 'changeClick()');
                return;
            }
        }, JSON.stringify({
            "objectId": that.userBo.enterpriseId,
            "enterpriseName": enterpriseName,
            "registerNum": registerNum
        }));
    },
    submitBusDataFailure: function() {
        var that = this;
        var bizArray = ["pic_business", "pic_identity", "pic_roster"];
        var enterArray = [that.userBo.enterpriseId];
        var deleteurl = "cloudlink-core-file/attachment/delBizAndFileByBizIdsAndBizAttrs";
        that.jasHttpRequest.jasHttpPost(deleteurl, function(id, state, dbSource) {}, JSON.stringify({
            "bizTypes": bizArray,
            "bizIds": enterArray
        }));
    },
    deleteAllPicBeforeUpload: function() {
        var that = this;
        var bizArray = ["pic_business", "pic_identity", "pic_roster"];
        var enterArray = [that.userBo.enterpriseId];
        var deleteurl = "cloudlink-core-file/attachment/delBizAndFileByBizIdsAndBizAttrs";
        that.jasHttpRequest.jasHttpPost(deleteurl, function(id, state, dbSource) {
            if (dbSource == "") {
                baseOperation.alertToast("网络异常，请稍候...");
                return;
            }
            var obj = JSON.parse(dbSource);
            if (obj.success == 1) {
                that.getPicDataList();
            }
        }, JSON.stringify({
            "bizTypes": bizArray,
            "bizIds": enterArray
        }));

    }
}