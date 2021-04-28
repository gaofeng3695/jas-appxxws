/*
** 上传记录数据的方法
** uploadObj.uploadImgByArray(ImgArray, callback_success, callback_fail);
** ImgArray : 需要上传的图片数组
** callback_success : 上传成功的callback ，function
** callback_fail : 上传失败的callback ，function
** isHideToast : 是否显示toast, boolean
*/

(function () {
    var obj = {
        uploadImgByArray: function(ImgArray,bizId, callback_success, callback_fail,isHideToast) {
            var that = this;
            this.initParam(ImgArray,bizId, callback_success, callback_fail,isHideToast);             
            this.uploadNextImg();
        },
        initParam: function(ImgArray,bizId, callback_success, callback_fail,isHideToast) {
            this.indexOfImgs = 0;
            this.isHideToast = isHideToast;
            this.businessId = bizId;
            this.aImgObj = ImgArray;
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
               // if (!that.isHideToast) {
                    baseOperation.londingToast("正在上传第" + number + "张图片",999999);                    
              //  }
                that._uploadphoto(imgArray[number - 1]);
            } else {
                that.callback_success(); //将其他数据上传到服务器
            }
        },
        _bindImdUploadCallBack: function() {
            var that = this;
            that.isCbSeted = true;
            uexUploaderMgr.onStatus = function(opCode, fileSize, percent, serverPath, status) {
                switch (status) {
                    case 0:
                        break;
                    case 1: //图片上传成功
                        that.uploadNextImg();
                        uexUploaderMgr.closeUploader(opCode);
                        break;
                    case 2: //fail
                       // if (!that.isHideToast) {
                            baseOperation.alertToast("第" + that.indexOfImgs + "张照片上传失败");                    
                        //}                    
                        that.uploadNextImg();                    
                        uexUploaderMgr.closeUploader(opCode);
                        break;
                }
            };

        },
        _uploadphoto: function(oImg) { //进行将图片上传到服务器
            var that = this;
            var businessId = that.businessId;
            var uploadHttp = serverURL + "cloudlink-core-file/attachment/save?businessId=" + businessId + "&bizType=" +  oImg.bizType;
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
        deleteImgById: function(bizId,callback) {
            var that = this;
            var bizArray = ["pic", "signature"];
            var deleteurl = "cloudlink-core-file/attachment/delBizAndFileByBizIdsAndBizAttrs";
            that.jasHttpRequest.jasHttpPost(deleteurl, function(id, state, dbSource) {                   
                if (state==-1 || dbSource == "") {
                    baseOperation.alertToast("网络异常，请稍候...");
                    return;
                }
                var obj = JSON.parse(dbSource);
                if (obj.success == 1) {
                     callback();
                }
            }, JSON.stringify({
                "bizTypes": bizArray,
                "bizIds": [bizId]
            }));
        },              
    };
    window.uploadImg = obj;
})();


