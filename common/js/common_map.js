var jasMap = {
    wgs84PointsDistance:function(fromPoint, toPoint) {
        if(arguments.length != 2) {
            return 0;
        }
        lon1 = fromPoint.lon;
        lat1 = fromPoint.lat;
        lon2 = toPoint.lon;
        lat2 = toPoint.lat;
        var a = 6378137, b = 6356752.3142, f = 1 / 298.257223563;
        var L = (lon2 - lon1)* Math.PI / 180;
        var U1 = Math.atan((1 - f) * Math.tan(lat1* Math.PI / 180));
        var U2 = Math.atan((1 - f) * Math.tan(lat2* Math.PI / 180));
        var sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
        var sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);
        var lambda = L, lambdaP, iterLimit = 100;
        do {
            var sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
            var sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
            if(sinSigma == 0)
                return 0;
            var cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
            var sigma = Math.atan2(sinSigma, cosSigma);
            var sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
            var cosSqAlpha = 1 - sinAlpha * sinAlpha;
            var cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
            if(isNaN(cos2SigmaM))
                cos2SigmaM = 0;
            var C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
            lambdaP = lambda;
            lambda = L + (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
        } while (Math.abs(lambda-lambdaP) > (1e-12) && --iterLimit>0);
        if(iterLimit == 0) {
            return NaN
        }
        var uSq = cosSqAlpha * (a * a - b * b) / (b * b);
        var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
        var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
        var deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
        var s = b * A * (sigma - deltaSigma);
        var fwdAz = Math.atan2(cosU2 * sinLambda, cosU1 * sinU2 - sinU1 * cosU2 * cosLambda);
        var revAz = Math.atan2(cosU1 * sinLambda, -sinU1 * cosU2 + cosU1 * sinU2 * cosLambda);
        return s;
    },
    bdPointsDistance:function(fromBDPoint, toBDPoint) {
        if(arguments.length != 2) {
            return 0;
        }
        lon1 = fromBDPoint.bdLon;
        lat1 = fromBDPoint.bdLat;
        lon2 = toBDPoint.bdLon;
        lat2 = toBDPoint.bdLat;
        var a = 6378137, b = 6356752.3142, f = 1 / 298.257223563;
        var L = (lon2 - lon1)* Math.PI / 180;
        var U1 = Math.atan((1 - f) * Math.tan(lat1* Math.PI / 180));
        var U2 = Math.atan((1 - f) * Math.tan(lat2* Math.PI / 180));
        var sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
        var sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);
        var lambda = L, lambdaP, iterLimit = 100;
        do {
            var sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
            var sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
            if(sinSigma == 0)
                return 0;
            var cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
            var sigma = Math.atan2(sinSigma, cosSigma);
            var sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
            var cosSqAlpha = 1 - sinAlpha * sinAlpha;
            var cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
            if(isNaN(cos2SigmaM))
                cos2SigmaM = 0;
            var C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
            lambdaP = lambda;
            lambda = L + (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
        } while (Math.abs(lambda-lambdaP) > (1e-12) && --iterLimit>0);
        if(iterLimit == 0) {
            return NaN
        }
        var uSq = cosSqAlpha * (a * a - b * b) / (b * b);
        var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
        var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
        var deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
        var s = b * A * (sigma - deltaSigma);
        var fwdAz = Math.atan2(cosU2 * sinLambda, cosU1 * sinU2 - sinU1 * cosU2 * cosLambda);
        var revAz = Math.atan2(cosU1 * sinLambda, -sinU1 * cosU2 + cosU1 * sinU2 * cosLambda);
        return s;
    },
    getMapZoom:function(_dictance){
        try{
            if(_dictance<=150)
            {
                return 19;//20米比例尺
            }
            if(_dictance>150 && _dictance<=250)
            {
                return 18;//50米比例尺
            }
            if(_dictance>250 && _dictance<=500)
            {
                return 17;//100米比例尺
            }
            if(_dictance>500 && _dictance<=1000)
            {
                return 16;//200米比例尺
            }
            if(_dictance>1000 && _dictance<=2000)
            {
                return 15;//500米比例尺
            }
            if(_dictance>2000 && _dictance<=3000)
            {
                return 14;//1000米比例尺
            }
            if(_dictance>3000 && _dictance<=6000)
            {
                return 13;//2公里比例尺
            }
            if(_dictance>6000 && _dictance<=12000)
            {
                return 12;//5公里比例尺
            }
            if(_dictance>12000 && _dictance<=22000)
            {
                return 11;//10公里比例尺
            }
            if(_dictance>22000 && _dictance<=75000)
            {
                return 10;//20公里比例尺
            }
            if(_dictance>75000 && _dictance<=140000)
            {
                return 9;//25公里比例尺
            }
            if(_dictance>140000 && _dictance<=300000)
            {
                return 8;//50公里比例尺
            }
            if(_dictance>300000 && _dictance<=600000)
            {
                return 7;//100公里比例尺
            }
            if(_dictance>600000 && _dictance<=1100000)
            {
                return 6;//200公里比例尺
            }
            if(_dictance>1100000)
            {
                return 5;//500公里比例尺
            }
        }
        catch(e){
            return 15;//500米比例尺
        }
    },
    getZoomWithCalculateMaxPoint:function(pointList,centerPoint){
        var that = this;
        try{
            if(pointList.length>0)
            {
                var _maxLength = 150;
                for (var i=0; i < pointList.length; i++) {
                  var _length = that.bdPointsDistance(centerPoint,pointList[i]);
                  if(_length>_maxLength){
                      _maxLength = _length;
                  }
                }
                var _level = that.getMapZoom(_maxLength);
                return _level;
            }
            else{
                return 15;
            }
        }
        catch(e){
            return 15;
        }
    }
}
