/*
** 上传记录数据的方法
** uploadObj.uploadRecordByBO(paramsObj, callback_success, callback_fail);
** paramsObj : 安检记录的json对象，obj 
** callback_success : 上传成功的callback ，function
** callback_fail : 上传失败的callback ，function
** isHideToast : 是否显示toast, boolean
*/

(function () {
    var obj = {
        uploadRecordByBO: function(paramsObj, callback_success, callback_fail,isHideToast) {
            var that = this;
            //alert(JSON.stringify(paramsObj))
            this.initParam(paramsObj, callback_success, callback_fail,isHideToast);             
            this.uploadNextImg();
        },
        initParam: function(paramsObj, callback_success, callback_fail,isHideToast) {
            this.paramsObj = JSON.parse(JSON.stringify(paramsObj));
            this.indexOfImgs = 0;
            this.isHideToast = isHideToast;
            this.recordIdOfCurrent = paramsObj.objectId;
            this.aImgObj = JSON.parse(JSON.stringify(paramsObj)).attas;
            this.callback_success = callback_success;
            this.callback_fail = callback_fail;
            if (!this.jasHttpRequest) {
                this.jasHttpRequest = new JasHttpRequest();
            }            
            if (!this.isCbSeted) {
                this._bindImdUploadCallBack();
            }
        },
        uploadNextImg: function() {
            var that = this;
            that.indexOfImgs++;            
            var number = that.indexOfImgs;
            var imgArray = that.aImgObj;
            if (number <= imgArray.length) { //继续上传下一张
                if (!that.isHideToast) {
                    baseOperation.londingToast("正在上传第" + number + "张图片",999999);                    
                }
                that._uploadphoto(imgArray[number - 1]);
            } else {
                that.uploadRecordData(); //将其他数据上传到服务器
            }
        },
        _bindImdUploadCallBack: function() {
            var that = this;
            that.isCbSeted = true;
            //alert('_bindImdUploadCallBack');
            uexUploaderMgr.onStatus = function(opCode, fileSize, percent, serverPath, status) {

                switch (status) {
                    case 0:
                        break;
                    case 1: //图片上传成功
                        that.uploadNextImg();
                        uexUploaderMgr.closeUploader(opCode);
                        break;
                    case 2: //fail
                        if (!that.isHideToast) {
                            baseOperation.alertToast("第" + that.indexOfImgs + "张照片上传失败");                    
                        }                    
                        that.uploadNextImg();                    
                        uexUploaderMgr.closeUploader(opCode);
                        break;
                }
            };

        },
        _uploadphoto: function(oImg) { //进行将图片上传到服务器
            var that = this;
            var bizType = oImg.bizType === 'esignature'?'signature' : oImg.bizType;
            var recordId = that.recordIdOfCurrent;
            var uploadHttp = serverURL + "cloudlink-core-file/attachment/save?businessId=" + recordId + "&bizType=" + bizType;
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
            uexUploaderMgr.uploadFile(id, oImg.url, "file", 0);
        },
        uploadRecordData: function() {
            var that = this;
            var partURL1 = "cloudlink-inspection-event/securityCheckRecord/save";
            that.formatGasMeterBo(that.paramsObj);
            var obj = $.extend({}, that.paramsObj, true);
            delete obj.attas;
            //alert(JSON.stringify(obj,null,4));
            if (!that.isHideToast) {
                baseOperation.londingToast("正在上传记录信息",999999);
            }  
            that.jasHttpRequest.jasHttpPost(partURL1, function(id, state, dbSource) {
                if (state == -1 || dbSource == "") {
                    baseOperation.alertToast("网络繁忙，请稍后再试...");
                    that.deleteImgByRecordId();
                    //如果记录上传失败，删除所有相关的图片
                    return;
                }
                try{
                    var obj = JSON.parse(dbSource);
                    if (obj.success == 1) {
                        var aImgUrls = that.aImgObj.map(function(item){
                            return item.url;
                        });
                        uexESignature.deleteTempFiles(JSON.stringify(aImgUrls));     
    
                        if (tjSwitch == 1) {
                            try {
                                var param = {
                                    eventName: "安检记录上传成功",
                                    info: {}
                                };
                                uexTianji.track(param);
                            } catch (e) {}
                        }                           
    
                        that.callback_success(that.recordIdOfCurrent);//入参 recordID
    
                        return;
                        //删除草稿箱记录
                    } else {
                        //如果记录上传失败，删除所有相关的图片
                        switch (obj.code) {
                            case "400":
                                baseOperation.alertToast("网络异常请稍候");
                                break;
                            case "401":
                                baseOperation.alertToast("网络异常请稍候");
                                break;
                            case "402":
                                baseOperation.alertToast("网络异常请稍候");
                                break;                            
                            case "XE01001":
                                baseOperation.alertToast("该用户已存在成功入户记录，请勿再次提交",4000);
                                break;   
                            case "XE03005":
                                baseOperation.alertToast("该用户已从安检计划中移除，无法提交",4000);
                                break;                                                      
                        }
                        that.deleteImgByRecordId();
                    }
                }
                catch(e){
                    that.deleteImgByRecordId();    
                }             
            }, JSON.stringify(obj));
        },
        deleteImgByRecordId: function() {
            var that = this;
            var bizArray = ["pic", "signature"];
            var deleteurl = "cloudlink-core-file/attachment/delBizAndFileByBizIdsAndBizAttrs";
            //var jasHttpRequest = new JasHttpRequest();
            that.jasHttpRequest.jasHttpPost(deleteurl, function(id, state, dbSource) {
                if (tjSwitch == 1) {
                    try {
                        var param = {
                            eventName: "安检记录上传失败",
                            info: {}
                        };
                        uexTianji.track(param);
                    } catch (e) {}
                }                      
                that.callback_fail(that.recordIdOfCurrent);//入参 recordID
                if (state==-1 || dbSource == "") {
                    baseOperation.alertToast("网络异常，请稍候...");
                    return;
                }
                var obj = JSON.parse(dbSource);
                if (obj.success == 1) {

                }
            }, JSON.stringify({
                "bizTypes": bizArray,
                "bizIds": [that.recordIdOfCurrent]
            }));
        },
        formatGasMeterBo : function(obj){
            var that = this;
            var isModify = false;
            obj.gasmeters.forEach(function(item,index){
                if (+item.operationFlag !== 0) {
                    isModify = true;
                }
            });
            if (isModify) {
                that.paramsObj.userArchiveVo = {
                    objectId : obj.groupId,
                    userGasmeterList : JSON.parse( JSON.stringify(obj.gasmeters))
                };
            }
            that.paramsObj.gasmeters = obj.gasmeters.map(function(item){
                item.gasmeterId = item.objectId ;
                delete item.objectId;
                return item;
            });
        }        
    };
    window.uploadObj = obj;
})();



    // var paramsObj = {
    //     groupId: baseOperation.createuuid(),
    //     objectId: recordId, //记录ID
    //     planId: appcan.locStorage.val('planId'), //计划ID
    //     securityCheckTime: utils.getNowFormatDate(),
    //     enterhomeUserTypeCode: 'EHT_001', //用户类型 
    //     enterhomeAddress: appcan.locStorage.getVal("saveDetailAddress"),
    //     enterhomeUserName: "", // 用户名称 
    //     enterhomeUserCode: "", // 用户编号 
    //     enterhomeUserTel: "", // 联系电话 
    //     enterhomeSituationTypeCode: "EHS_001", // 入户情况 
    //     remark: "", // 备注 
    //     isdanger: 0, //隐患情况 1异常、 0正常
    //     gasmeters: [{
    //         objectId: baseOperation.createuuid(), // 主键
    //         recordId: recordId, // 记录ID
    //         gasmeterName: "燃气表-1", //燃气表名称（燃气表-1）
    //         gasmeterCode: "", //燃气表编号
    //         gasmeterEntermode: "左进", //左右表 右进 左进
    //         gasmeterData: "" //电表读数
    //     }],
    //     hiddendangers: [{
    //         objectId: baseOperation.createuuid(), // 主键
    //         recordId: recordId, // 记录ID
    //         hiddendangerCode: "", //隐患编码
    //         hiddendangerName: "" //隐患名称
    //     }],
    //     attas: [{
    //         bizType: '', //pic 、esignature 
    //         url: ''
    //     }]
    // };
