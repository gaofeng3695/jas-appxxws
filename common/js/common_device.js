var JasDevice = {
    getOS:function(callback){
        //获取手机的操作系统
        uexDevice.cbGetInfo = function(opCode,dataType,data){
            var device = eval('('+data+')');
            var AndroidVersion = device.os;
            if(appcan.isFunction(callback)){
                callback(AndroidVersion);
            }
        }
        uexDevice.getInfo(1);
    },
    getManufacturer:function(callback){
        //获取手机的生产厂商（如：华为、小米、HTC）
        uexDevice.cbGetInfo = function(opCode,dataType,data){
            var device = eval('('+data+')');
            var manufacturer = device.manufacturer;
            if(appcan.isFunction(callback)){
                callback(manufacturer);
            }
        }
        uexDevice.getInfo(2);
    },
    getConnectStatus:function(callback){
        /*获取手机的网络状态
         * -1 网络不可用
         * 0  WIFI网络
         * 1  3G网络
         * 2  2G网络
         */
        uexDevice.cbGetInfo = function(opCode,dataType,data){
            //alert(data);
            var device = eval('('+data+')');
            var deviceConnectStatus = device.connectStatus;
            if(appcan.isFunction(callback)){
                callback(deviceConnectStatus);
            }
        }
        uexDevice.getInfo(13);
    },
    getGPSOpenStatus:function(callback){
        uexDevice.cbIsFunctionEnable = function(data){
            var obj = JSON.parse(data);
            var GPS_OPEN_STATUS = obj.isEnable;
            if(appcan.isFunction(callback)){
                callback(GPS_OPEN_STATUS);
            }
        };
        var params1 = {
             setting:"GPS"//位置服务功能
        };
        var dataStr = JSON.stringify(params1);
        uexDevice.isFunctionEnable(dataStr);
    }
}