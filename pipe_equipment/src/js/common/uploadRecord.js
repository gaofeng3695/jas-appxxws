/*
 ** 上传记录数据的方法
 ** uploadObj.uploadRecordByBO(paramsObj, callback_success, callback_fail); facilityTypeCode
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
            if (this.clickResource === 'modify') { //修改记录
                this._requestIfRecordCanBeUpdate();
            }else{
                this.uploadNextImg(); //新建记录
            }

        },
        initParam: function(paramsObj, callback_success, callback_fail, isHideToast) {
            var that = this;
            this.clickResource = appcan.locStorage.val('equipmentEntrance'); //'modify' ? "update" : "save"
            this.paramsObj = JSON.parse(JSON.stringify(paramsObj));
            this.indexOfImgs = 0;
            this.isHideToast = isHideToast;
            this.recordIdOfCurrent = paramsObj.objectId;
            this.aImgIdsLeft = [];
            this.aImgObj = JSON.parse(JSON.stringify(paramsObj)).attas.filter(function(item) {
                if (item.url.indexOf('http') === -1) {
                    return true;
                } else {
                    //alert(item.url.split('fileId=')[1].split('&')[0]);
                    that.aImgIdsLeft.push(item.url.split('fileId=')[1].split('&')[0]); //保存的附件ids
                    return false;
                }
            });
            this.aImgIds = JSON.parse(JSON.stringify(paramsObj)).aImgIds; //原始附件ids
            this.callback_success = callback_success;
            this.callback_fail = callback_fail;
            if (!this.jasHttpRequest) {
                this.jasHttpRequest = new JasHttpRequest();
            }
            if (!this.isCbSeted) {
                this._bindImdUploadCallBack();
            }
        },
        _requestIfRecordCanBeUpdate: function() {
            var that = this;
            var url = "cloudlink-inspection-event/facility/judgeCodeForUpdate";
            //var jasHttpRequest = new JasHttpRequest();
            that.jasHttpRequest.jasHttpPost(url, function(id, state, dbSource) {
                if (dbSource == "") {
                    baseOperation.alertToast("网络异常，请稍候...");
                    that.callback_fail(that.recordIdOfCurrent); //入参 recordID
                    return;
                }
                var obj = JSON.parse(dbSource);
                if (obj.success == 1) {
                    that.uploadNextImg();
                }else{
                    that.callback_fail(that.recordIdOfCurrent); //入参 recordID                    
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
                        case "XE04001":
                            baseOperation.alertToast(obj.msg, 4000);
                            break;
                    }                    
                }
            }, JSON.stringify({
                "objectId": that.recordIdOfCurrent, //设施ID
                "facilityTypeCode": that.paramsObj.facilityTypeCode, //设施类型

            }));
        },
        deleteImgs: function() { //批量删除图片
            var that = this;
            if (!this.aImgIds) {
                return;
            }
            var arr = this.aImgIds.filter(function(item, index) {
                return that.aImgIdsLeft.indexOf(item) === -1;
            });
            arr.forEach(function(item) {
                that.deleteImgById(item);
            });
        },
        deleteImgById: function(sId, cb) { //根据图片id删除图片
            var that = this;
            var deleteurl = "cloudlink-core-file/attachment/deleteByBizIdAndBizAttrAndFileId";
            //var jasHttpRequest = new JasHttpRequest();
            that.jasHttpRequest.jasHttpPost(deleteurl, function(id, state, dbSource) {
                if (dbSource == "") {
                    baseOperation.alertToast("网络异常，请稍候...");
                    return;
                }
                var obj = JSON.parse(dbSource);
                if (obj.success == 1) {

                }
            }, JSON.stringify({
                "businessId": that.recordIdOfCurrent, //业务对象ID
                "bizType": "pic", //文件的业务含义
                "fileId": sId
            }));
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
            var bizType = oImg.bizType === 'esignature' ? 'signature' : oImg.bizType;
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
            var partURL1 = "cloudlink-inspection-event/facility/" + (that.clickResource === 'modify' ? "update" : "save");
            var obj = $.extend({}, that.paramsObj, true);
            delete obj.attas;
            if (!that.isHideToast) {
                baseOperation.londingToast("正在上传记录信息", 999999);
            }
            that.jasHttpRequest.jasHttpPost(partURL1, function(id, state, dbSource) {
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
                    that.deleteImgs();
                    that.callback_success(that.recordIdOfCurrent); //入参 recordID

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
                            baseOperation.alertToast("该用户已存在成功入户记录，请勿再次提交", 4000);
                            break;
                    }
                }
                that.deleteImgByRecordId();
            }, JSON.stringify(obj));
        },
        deleteImgByRecordId: function() {
            var that = this;
            var bizArray = ["pic"];
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



// this.paramsObj = {
//     objectId: baseOperation.createuuid(), //ID
//     facilityName: '', //设施名称
//     facilityCode: '', //设施编码 
//     facilityTypeCode: 'FT_01', //设施类型
//     pipelineTypeCode: 'PT_01', //管网类型：低压、中压、次高压、高压
//     facilityStatusCode: 'FS_01', //设施状态:在用、停用、废弃
//     address: '', // 详细位置
//     bdLon: '', //百度坐标lon 
//     bdLat: '', //百度坐标lat 
//     lon: '', //GPS坐标lon 
//     lat: '', //GPS坐标lat 
//     manufacturer: '', //生产厂家
//     specification: '', //规格
//     installationTime: null, //安装日期
//     investmentTime : null, //投产日期
//     inspectionCount: 0, //巡检次数
//     inspectionDays: 1, //巡检天数
//     relationshipPersonList: [ // 设施干系人、负责人
//         // {
//         //     relationshipPersonId: '',
//         //     relationshipPersonName: ''
//         // }
//     ],
//     attas: [
//         // {
//         //     attaType: "pic",
//         //     src: '../src/images/map_h.png'
//         // }
//     ]
// };
