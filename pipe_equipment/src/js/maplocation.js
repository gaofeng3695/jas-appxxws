/*
** 查看 地图位置
** 依赖与：appcan.locStorage('bdPointObj'); {bdLon:'',bdLat:'',address:''}
*/

// window.onerror = function(msg, url, line) {
//     alert("erro" + msg + "\n" + url + ":" + line);
//     return true;
// };

appcan.ready(function() {
    showAddressObj.init();

});

(function(window, appcan, $) {
    var obj = {
        lon : '',
        lat : '',
        address : '',
        init : function() {
            var that = this;
            this.initParams();
            this.renderAddress(this.address);
            this.loadBaiduMap(this.lon, this.lat);
            uexBaiduMap.cbOpen = function() {
                uexBaiduMap.setZoomLevel(17);
                that.markPoint(that.lon, that.lat);
            };
            this.bindEvent();
        },
        initParams : function() {
            var sBdPointObj = appcan.locStorage.val('bdPointObj');
            if (!sBdPointObj) {
                alert('没有从本地找到参数');
                return;
            }
            var obj = JSON.parse(sBdPointObj);
            this.address = obj.address;
            this.lon = obj.bdLon;
            this.lat = obj.bdLat;

        },
        loadBaiduMap : function(lon, lat) {
            var titHeight = $('#contenttwo').offset().top;
            var cHeight = $('#contenttwo').offset().height;
            var cWidth = $('#contenttwo').offset().width;
            uexBaiduMap.open(0, titHeight, cWidth, cHeight, lon || 116.309, lat || 39.977);

        },
        renderAddress : function(sAddress) {
            $("#address").html(sAddress);

        },
        bindEvent : function() {
            appcan.button(".back", "btn-act", function() {
                uexBaiduMap.close();
                appcan.window.close(-1);
            });

            uexWindow.setReportKey(0, 1);
            uexWindow.onKeyPressed = function(keyCode) {
                if (+keyCode === 0) {
                    uexBaiduMap.close();
                    appcan.window.close(-1);
                }
            };
        },
        markPoint : function(lon, lat) {
            //alert('经度'+lon + '纬度'+lat);
            if (!lon || !lat) {
                return;
            }
            uexBaiduMap.removeMakersOverlay('["pointid"]');
            uexBaiduMap.addMarkersOverlay(JSON.stringify([{
                id : 'pointid',
                longitude : lon,
                latitude : lat,
                //icon: "res://cpf.png"
            }]));
            uexBaiduMap.setCenter(lon, lat);
        },
    };
    window.showAddressObj = obj;
})(window, appcan, Zepto);

// var addressInfo = null;
// var lon = "";
// var lat = "";
// appcan.button("#nav-left", "btn-act", function() {
//     uexBaiduMap.close();
//     appcan.window.close(-1);
// })
// appcan.ready(function() {
//     uexBaiduMap.cbOpen = function() {
//         uexBaiduMap.setZoomLevel(15);
//         uexBaiduMap.removeMakersOverlay('["pointid"]');
//         uexBaiduMap.addMarkersOverlay(JSON.stringify([{
//             id : 'pointid',
//             longitude : lon,
//             latitude : lat,
//             icon : "res://cpf.png"
//         }]));
//         uexBaiduMap.setCenter(lon, lat);
//     };
//     uexWindow.setReportKey(0, 1);
//     uexWindow.onKeyPressed = function(keyCode) {
//         if (keyCode == 0) {
//             uexBaiduMap.close();
//             appcan.window.close(-1);
//         }
//     };
//     initMap();
// });
// *
//  * 打开百度地图并且开启定位

// function initMap() {
//     var titHeight = $('#content').offset().top;
//     var cHeight = $('#content').offset().height;
//     var cWidth = $('#content').offset().width;
//     var resource = appcan.locStorage.val('LocationResource');
//     if (resource == "check") {
//         addressInfo = appcan.locStorage.val("renderLocation");
//         var obj = JSON.parse(addressInfo);
//         $("#address").html(obj.address);
//         lon = obj.facilityBdLon;
//         lat = obj.facilityBdLat;
//     } else {
//         addressInfo = appcan.locStorage.val('equipmentObj');
//         var obj = JSON.parse(addressInfo);
//         $("#address").html(obj.address);
//         lon = obj.bdLon;
//         lat = obj.bdLat;
//     }
//     uexBaiduMap.open(0, titHeight, cWidth, cHeight, Number(lon), Number(lat));
// }
