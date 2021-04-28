/*
 ** 上传记录数据的方法
 ** uploadObj.uploadRecordByBO(paramsObj, callback_success, callback_fail);
 ** paramsObj : 安检记录的json对象，obj 
 ** callback_success : 上传成功的callback ，function
 ** callback_fail : 上传失败的callback ，function
 ** isHideToast : 是否显示toast, boolean
 */

(function() {
    var obj = {
        uploadRecordByBO: function(paramsObj, callback_success, callback_fail, isHideToast) {
            var that = this;
            //alert(JSON.stringify(paramsObj))
            this.initParam(paramsObj, callback_success, callback_fail, isHideToast);
            this.uploadVoice(this.paramsObj.voiceSrc);
        },
        initParam: function(paramsObj, callback_success, callback_fail, isHideToast) {
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
        uploadVoice: function(sUrl) {
            var that = this;
            if (!sUrl) {
                that.uploadNextImg();
                return;
            }
            var obj = {
                bizType: 'audio',
                url: sUrl
            };
            if (!that.isHideToast) {
                baseOperation.londingToast("正在上传录音", 999999);
            }
            that.currentFile = 'audio';
            that._uploadFile(obj);
        },
        uploadNextImg: function() {
            var that = this;
            that.indexOfImgs++;
            var number = that.indexOfImgs;
            var imgArray = that.aImgObj;
            if (number <= imgArray.length) { //继续上传下一张
                if (!that.isHideToast) {
                    baseOperation.londingToast("正在上传第" + number + "张图片", 999999);
                }
                that.currentFile = 'image';                
                that._uploadFile(imgArray[number - 1]);
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
                            if (that.currentFile === 'audio') {
                                baseOperation.alertToast("录音上传失败");
                            } else {
                                baseOperation.alertToast("第" + that.indexOfImgs + "张照片上传失败");
                            }
                        }
                        that.uploadNextImg();
                        uexUploaderMgr.closeUploader(opCode);
                        break;
                }
            };

        },
        _uploadFile: function(oFile) { //进行将图片上传到服务器  {bizType:'',url:''}
            var that = this;
            var bizType = oFile.bizType === 'esignature' ? 'signature' : oFile.bizType;
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
            uexUploaderMgr.uploadFile(id, oFile.url, "file", 0);
        },
        uploadRecordData: function() {
            var that = this;
            var partURL1 = "cloudlink-inspection-event/facilityRecord/save";
            var obj = $.extend({}, that.paramsObj, true);
            delete obj.attas;
            if (!that.isHideToast) {
                baseOperation.londingToast("正在上传记录信息", 999999);
            }
            that.jasHttpRequest.jasHttpPost(partURL1, function(id, state, dbSource) {
                //alert(dbSource);
                if (+dbSource.length === 0) {
                    baseOperation.alertToast("网络繁忙，请稍后再试...");
                    that.deleteImgByRecordId();
                    //如果记录上传失败，删除所有相关的图片
                    return;
                }
                var obj = JSON.parse(dbSource);
                if (obj.success == 1) {
                    var aImgUrls = that.aImgObj.map(function(item) {
                        return item.url;
                    });
                    if (uexESignature) {
                        uexESignature.deleteTempFiles(JSON.stringify(aImgUrls));
                    }
                    that.callback_success(that.recordIdOfCurrent); //入参 recordID

                    return;
                    //删除草稿箱记录
                } else {
                    //如果记录上传失败，删除所有相关的图片
                    switch (obj.code) {
                        case "400":
                            baseOperation.alertToast("网络异常请稍候400");
                            break;
                        case "401":
                            baseOperation.alertToast("网络异常请稍候401");
                            break;
                        case "402":
                            baseOperation.alertToast("网络异常请稍候402");
                            break;
                        case "XE01001":
                            baseOperation.alertToast("该用户已存在成功入户记录，请勿再次提交", 4000);
                            break;
                    }
                }
                that.deleteImgByRecordId();
            }, JSON.stringify(obj));
            //alert(JSON.stringify(obj))
        },
        deleteImgByRecordId: function() {
            var that = this;
            var bizArray = ["pic", "audio"];
            var deleteurl = "cloudlink-core-file/attachment/delBizAndFileByBizIdsAndBizAttrs";
            //var jasHttpRequest = new JasHttpRequest();
            that.jasHttpRequest.jasHttpPost(deleteurl, function(id, state, dbSource) {
                that.callback_fail(that.recordIdOfCurrent); //入参 recordID
                if (dbSource == "") {
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
    };
    window.uploadObj = obj;
})();



// paramsObj = {
//     facilityName: '',
//     address: '',
//     facilityTypeCode: '',
//     facilityTypeName: '',
//     localbdLat: '',
//     localbdLon: '',

//     objectId: baseOperation.createuuid(), //ID
//     facilityId: '', //设施ID
//     facilityCheckTime: (new Date()).Format("yyyy-MM-dd HH:mm"), // 设施检查时间（手机客户端时间，不可编辑）

//     facilityCheckResult: '', //检查结果(0:正常  1:异常)
//     isLeakage: 0, //漏气状态、是否漏气（0：否   1：是   ）
//     combustibleGasConcentration: '', //可燃气体浓度
//     isFacilityWork: 0, //设施运行情况（0:正常  1：异常）
//     facilityWorkDesc: '', //设施运行描述
//     pressureSituation: 0, //压力情况（0:正常  1：异常）
//     pressureIn: '', //进口压力
//     pressureOut: '', //出口压力
//     isSeeper: 0, //井内有无积水（0:无  1：有）
//     isWellCoverDamage: 0, //井盖是否损毁（0:否  1：是）
//     isOccupy: 0, //有无占压（0:无  1：有）
//     flowmeterData: '', //流量计读数
//     remark: '', //备注
//     inspector_address: '', // 检查人详细位置（只存储，不显示）
//     bdLon: '', //百度坐标lon 
//     bdLat: '', //百度坐标lat 
//     lon: '', //GPS坐标lon 
//     lat: '', //GPS坐标lat
//     attas: [
//         // {
//         //     attaType: "pic",
//         //     src: '../src/images/map_h.png'
//         // }                        
//     ],
//     voiceSrc: '' //声音路径
// };
