var GPSpoint = null;
var baiduPoint = null;
var pointId = "pointId";
var addressInfo = null;
var address = null;
var GCJ02Point=null;
appcan.button("#nav-left", "btn-act", function() {
    uexBaiduMap.close();
    uexLocation.closeLocation();
    appcan.window.close(-1);
});
appcan.ready(function() {
    /*获取坐标*/
    uexLocation.onChange = function(lat, log) {
        if (lat < 10 && log < 10) {
            return;
        }
        try {
            //GPS坐标
            // GPSpoint = {
                // 'latitude' : lat,
                // 'longitude' : log
            // };
            // var dataBaiDu = GPStoBaidu(GPSpoint);
            // //转百度坐标
            // //百度坐标
            // baiduPoint = {
                // "latitude" : dataBaiDu.latitude,
                // "longitude" : dataBaiDu.longitude
            // };
            baiduPoint = {
                "latitude" : lat,
                "longitude" : log
            };
            var dataGcj02 = BaiduToGcj02(baiduPoint);
            GCJ02Point = {
                'latitude' : dataGcj02.latitude,
                'longitude' : dataGcj02.longitude
            };
            //画点
            markLocation(baiduPoint);
            //获取详细地址
            getAddress(GPSpoint);
        } catch(e) {
            alert(e);
        }
    };
    /*坐标转地址回调*/
    uexLocation.cbGetAddress = function(opCode, dataType, data) {
        var objData = JSON.parse(data);
        address = objData.formatted_address;
        $("#chooseaddress").val(objData.formatted_address);
        uexLocation.closeLocation();
    };
    //百度地图点击事件
    // uexBaiduMap.onMapLongClickListener = function makerListner(data){
    // alert(data);
    // };
    uexBaiduMap.onMapClickListener = function makerListner(data) {
        var resultData = JSON.parse(data);
        baiduPoint = {
            "latitude" : resultData.latitude,
            "longitude" : resultData.longitude
        };

        //转换成GPS坐标
        // var dataGPS = BaiduToGPS(baiduPoint);
        // GPSpoint = {
            // 'latitude' : dataGPS.latitude,
            // 'longitude' : dataGPS.longitude
        // };
        var dataGcj02 = BaiduToGcj02(baiduPoint);
        GCJ02Point = {
            'latitude' : dataGcj02.latitude,
            'longitude' : dataGcj02.longitude
        };
        
        updateLocation(baiduPoint);
        getAddress(GPSpoint);
    };
    //打开地图回调
    uexBaiduMap.cbOpen = function() {
        uexBaiduMap.setZoomLevel(15);
        if (addressInfo != null && addressInfo != undefined && addressInfo != "") {
            var obj = JSON.parse(addressInfo);
            var param = {
                "latitude" : obj.latitude,
                "longitude" : obj.longitude
            };
            //画点
            markLocation(param);
        } else {
            //开启定位
            uexLocation.openLocation("bd09");
        }
    };
    uexWindow.setReportKey(0, 1);
    uexWindow.onKeyPressed = function(keyCode) {
        if (keyCode == 0) {
            uexBaiduMap.close();
            appcan.window.close(-1);
        }
    };
    initMap();
});
/**
 * 打开百度地图并且开启定位
 */
function initMap() {
    var titHeight = $('#content').offset().top;
    var cHeight = $('#content').offset().height;
    var cWidth = $('#content').offset().width;
    var lon = "116.403357";
    var lat = "39.913662";
    addressInfo = appcan.locStorage.getVal("selectAddress_info");
    if (addressInfo != null && addressInfo != undefined && addressInfo != "") {
        var obj = JSON.parse(addressInfo);
        alert(JSON.stringify(obj,4,4));
        $("#chooseaddress").val(obj.addressName);
        lon = obj.longitude;
        lat = obj.latitude;
        baiduPoint = {
            "latitude" : obj.latitude,
            "longitude" : obj.longitude
        };  
        // if (obj.gpsLat && obj.gpsLon) {
            // GPSpoint = {
                // 'latitude' : obj.gpsLat,
                // 'longitude' : obj.gpsLon
            // };
       if (obj.gcj02Lat && obj.gcj02Lon) {
            GCJ02Point = {
                'latitude' : obj.gcj02Lat,
                'longitude' : obj.gcj02Lon
            };
        } else {
            // var dataGPS = BaiduToGPS(baiduPoint);  //转换成GPS坐标
            // GPSpoint = {
                // 'latitude' : dataGPS.latitude,
                // 'longitude' : dataGPS.longitude
            // };
            var dataGcj02 = BaiduToGcj02(baiduPoint);  //转换成GPS坐标
            GCJ02Point = {
                'latitude' : dataGcj02.latitude,
                'longitude' : dataGcj02.longitude
            };
        }

    }
    
    //初始化百度地图
    uexBaiduMap.open(0, titHeight, cWidth, cHeight, Number(lon), Number(lat));
    appcan.locStorage.remove("selectAddress_info");
}

/**
 * 84转百度坐标
 * @param {Object} lat
 * @param {Object} log
 */
function GPStoBaidu(obj) {
    var params = {
        latitude : obj.latitude,
        longitude : obj.longitude,
        from : "wgs84",
        to : "bd09"
    };
    var data = uexLocation.convertLocation(JSON.stringify(params));
    //转化成百度坐标
    var resultData = JSON.parse(data);
    //此时获取到了百度坐标点
    return resultData;
}

/**
 * 百度坐标转84
 * @param {Object} lat
 * @param {Object} log
 */
function BaiduToGPS(obj) {
    var params1 = {
        latitude : obj.latitude,
        longitude : obj.longitude,
        from : "bd09",
        to : "wgs84"
    };
    var data = uexLocation.convertLocation(JSON.stringify(params1));
    //转化成84坐标
    var resultData = JSON.parse(data);
    //此时获取到了百度坐标点
    return resultData;
}

/**
 *百度坐标转火星坐标 
 */
function BaiduToGcj02(obj){
    var params1 = {
        "latitude":obj.latitude,
        "longitude":obj.longitude
    }
    var dataGCJ02=uexLockScreen.BD09LLT0GCJ02(JSON.stringify(params1));
    var resultData = JSON.parse(dataGCJ02);
    //此时获取到了火星坐标
    return resultData;
}

/**
 * 画点
 * @param {Object} obj 百度坐标对象
 */
function markLocation(obj) {
    //地图上画点
    var point = [{
        id : pointId,
        longitude : obj.longitude,
        latitude : obj.latitude
    }];
    uexBaiduMap.addMarkersOverlay(JSON.stringify(point));
    uexBaiduMap.setCenter(obj.longitude, obj.latitude);
}

/**
 * 更新点
 * @param {Object} obj
 */
function updateLocation(obj) {
    var ids = '["' + pointId + '"]';
    uexBaiduMap.removeMakersOverlay(ids);
    //地图上画点
    var point = [{
        id : pointId,
        longitude : obj.longitude,
        latitude : obj.latitude
    }];
    uexBaiduMap.addMarkersOverlay(JSON.stringify(point));
    uexBaiduMap.setCenter(obj.longitude, obj.latitude);
}

/**
 * 根据84坐标获取详细的地址信息
 * @param {Object} obj
 */
function getAddress(obj) {
    var params = {
        latitude : obj.latitude,
        longitude : obj.longitude,
        type : "wgs84",
        flag : 1
    };
    uexLocation.getAddressByType(JSON.stringify(params));
}

/*
 * 取消按钮
 */
appcan.button("#canel", "btn-act", function() {
    appcan.window.close(-1);
});
/**
 * 确认按钮
 */
appcan.button("#quite", "btn-act", function() {
    var address = $("#chooseaddress").val().trim();
    if (address == null || address == "") {
        baseOperation.alertToast("详细位置不能为空");
    } else if (address.length > 50) {
        baseOperation.alertToast("详细位置最多输入50个字");
    } else {
        var piontInfo = {
            "address" : address,
            "baiduPoint" : baiduPoint,
            // "GPSpoint" : GPSpoint
            "GCJ02Point" : GCJ02Point
        };
        appcan.locStorage.setVal("point_param", piontInfo);
        var param = JSON.parse(appcan.locStorage.getVal("selectAddress_param"));
        appcan.window.evaluatePopoverScript(param.parentWindowId, param.windowId, param.callBackName);
        uexBaiduMap.close();
        uexLocation.closeLocation();
        appcan.locStorage.remove("selectAddress_param");
        appcan.window.close(-1);
    }
});
