/*
 ** Created By GF 2017.09.08
 ** 依赖 :  jasRequest 模块
 ** 功能 ： 上传维修维护的维修记录
 ** 使用 ： 直接调用 uploadRecord(oData, fnSuccess, fnFail, isHideTip);
 ** 参数 ：1. oData Object 维修维护的大对象        
 ** 其他 ：支持异步同时上传，无需写在循环回调中
 */

(function(window,jasRequest) {

    function UploadRecord(oData, fnSuccess, fnFail, isHideTip) {
        this.init(oData, fnSuccess, fnFail, isHideTip);
    }

    UploadRecord.prototype.init = function(oData, fnSuccess, fnFail, isHideTip) {
        this.isHideTip = isHideTip;
        this.fnSuccess = fnSuccess;
        this.fnFail = fnFail;
        this.oData = oData;

        this.uploadFiles(oData);

    };
    UploadRecord.prototype.uploadFiles = function(oData) {
        var that = this;
        var bizId = oData.objectId;
        var oFiles = {
            pic: oData.picUrl,
            signature: oData.signatureUrl
        };
        jasRequest.uploadFiles(bizId, oFiles, function(data) {
            that.uploadData(oData);
        }, function(data) {
            that.deleteFiles(oData);
            return that.fnFail && that.fnFail();
        });
    };
    UploadRecord.prototype.uploadData = function(oData) {
        var that = this;
        var sUrl = "cloudlink-inspection-event/maintenanceRecord/save";
        var params = {
            "workId": oData.workId,
            "objectId": oData.objectId,
            "totalCost": oData.totalCost,
            "captialTotalCost": oData.captialTotalCost,
            "content": oData.content,
            "satisfaction": oData.satisfaction,
            "workRecordCost": oData.workRecordCost
        };
        try{
            //params = JSON.parse(JSON.stringify(params));
            jasRequest.post(sUrl, params, function(data) {
                return that.fnSuccess && that.fnSuccess();
            },function(data){
                that.deleteFiles(oData);            
                return that.fnFail && that.fnFail(data);
            });            
        }catch(e){ //若存在emoji会走这里
            //alert(e)
            that.deleteFiles(oData);            
            return that.fnFail && that.fnFail(e);

        }

    };
    UploadRecord.prototype.deleteFiles = function(oData) {
        jasRequest.deleteFilesByBizId(oData.objectId);
    };

    window.uploadRecord = function(oData, fnSuccess, fnFail, isHideTip) {
        return new UploadRecord(oData, fnSuccess, fnFail, isHideTip);
    };
})(window,jasRequest);
