/*
** 获取当前位置，返回位置信息
** 使用方法：getLocationObj.init(callback,_callback,isContinu);
** callback(sObj)  获取经纬度成功的回调
        sObj = {
            address: '', // 详细位置
            bdLon: '', //百度坐标lon 
            bdLat: '', //百度坐标lat 
            lon: '', //GPS坐标lon 
            lat: '', //GPS坐标lat 
        }
** _callback(sObj)  获取位置详细地址的回调,没有网络不会执行此回调
        sObj = {
            address: '', // 详细位置
            bdLon: '', //百度坐标lon 
            bdLat: '', //百度坐标lat 
            lon: '', //GPS坐标lon 
            lat: '', //GPS坐标lat 
        }        
** isContinu : （可选，默认仅一次）是否持续返回坐标位置        
** 依赖：uexLocation        
*/


(function(window, appcan, $, baseOperation) {
    var obj = {
        resultObj: {
            address: '', // 详细位置
            bdLon: '', //百度坐标lon 
            bdLat: '', //百度坐标lat 
            lon: '', //GPS坐标lon 
            lat: '', //GPS坐标lat 
        },
        init: function(callback,_callback, isContinu) {
            // uexLocation.openLocation("wgs84");
            uexLocation.openLocation("bd09");
            this.setCallback(callback,_callback, isContinu);
        },
        setCallback: function(callback,_callback, isContinu) {
            var that = this;
            /*获取坐标*/
            uexLocation.onChange = function(lat, log) {
                if (lat < 10 && log < 10) {
                    return;
                }
                // that.resultObj.lon = log;
                // that.resultObj.lat = lat;
                that.resultObj.bdLon = log;
                that.resultObj.bdLat = lat;
                // that.switchGpsToBaidu(lat, log);
                that.switchBaiduToGcj02(lat,log);
                uexLocation.getAddressByType(JSON.stringify({ /*坐标转地址*/
                    latitude: lat,
                    longitude: log,
                    // type: "wgs84",
                    type: "bd09",
                    flag: 1
                }));
                if (typeof callback === 'function') {
                    callback(JSON.stringify(that.resultObj));
                }
                if (!isContinu) {
                    that.closeLocation();
                }
            };
            /*坐标转地址回调*/
            uexLocation.cbGetAddress = function(opCode, dataType, data) {
                var objData = JSON.parse(data);
                that.resultObj.address = objData.formatted_address;
                if (typeof _callback === 'function') {
                    _callback(JSON.stringify(that.resultObj));
                }
            };
        },
        switchGpsToBaidu: function(lat, log) {
            /*var that = this;
            try {
                var dataBd = uexLocation.convertLocation(JSON.stringify({
                    latitude: lat,
                    longitude: log,
                    from: "wgs84",
                    to: "bd09"
                }));
                var obj = JSON.parse(dataBd);
                that.resultObj.bdLon = obj.longitude;
                that.resultObj.bdLat = obj.latitude;
            } catch (e) {
                baseOperation.alertToast('无法获取百度坐标，将使用GPS坐标');
                that.resultObj.bdLon = log;
                that.resultObj.bdLat = lat;
            }*/
        },switchBaiduToGcj02:function(lat,lon){
            var that = this;
            try{
                var params1 = {
                    "latitude":lat,
                    "longitude":lon
                }
                var dataGCJ02=uexLockScreen.BD09LLT0GCJ02(JSON.stringify(params1));
                var resultData = JSON.parse(dataGCJ02);
                that.resultObj.lat = resultData.latitude;
                that.resultObj.lon = resultData.longitude;
            }catch(e){
                that.resultObj.lon = lat;
                that.resultObj.lat = lon;
            }
        },
        closeLocation: function(lat,log) {
            uexLocation.closeLocation();
            //uexLocation.cbGetAddress = null;
            //uexLocation.onChange = null;
        },
        openLocation : function(){
            uexLocation.openLocation("wgs84");
        },
    };
    window.getLocationObj = obj;
})(window, appcan, Zepto, baseOperation);
