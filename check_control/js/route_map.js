var routeObj = {
    aDataList: null,

    photoDom: $('#photo'),
    nameDom: $('#userName'),
    deptDom: $('#dept'),
    loadingDom: $('#loadingMask'),
    userObj: null,
    currentRouteObj: null,

    init: function() {
        var that = this;
        this.userObj = JSON.parse(appcan.locStorage.getVal('currentUser'));
        this.currentRouteObj = JSON.parse(appcan.locStorage.getVal('currentRouteObj'));
        try {
            uexWidgetOne.cbError = function(opCode, errorCode, errorInfo) { //错误异常执行回调
                alert("errorCode:" + errorCode + "\nerrorInfo:" + errorInfo);
            };
            uexBaiduMap.cbOpen = function() {
                that.requestData();
            };
        } catch (e) {
                that.requestData();
        }

        this.render();
        this.bindInitEvent();
        this.loadMap();
    },
    requestData: function() {
        var that = this;
        var partURL1 = "cloudlink-inspection-trajectory/trajectory/getByRecordId";
        var queryObj = {
            inspRecordId: this.currentRouteObj.inspRecordId,
        };
        baseOperation.londingToast('数据请求中',30000);
        jasHttpRequest.jasHttpPost(partURL1, function(id, state, dbSource) {
            if (dbSource == "") {
                baseOperation.alertToast('网关异常');
                that.requestData();
                return;
            }
            baseOperation.closeToast();
            that.loadingDom.css('z-index', '-1');
            var reObj = JSON.parse(dbSource);
            if (reObj.success == 1) {

                //baseOperation.alertToast('当前巡检点个数为' + reObj.rows.length);
                if (reObj.rows.length > 0) {
                    that.markRoute(reObj.rows);
                }
                that.aDataList = reObj.rows;
            }
        }, JSON.stringify(queryObj));
    },
    render: function() { //渲染人员信息
        var obj = this.currentRouteObj;
        if (this.userObj) {
            //baseOperation.alertToast(JSON.stringify(this.userObj));
            $('#userName').html(this.userObj.userName);
            $('#dept').html(this.userObj.userDept);
            $('#photo').attr("src", this.userObj.userHead);
        }
        if (obj) {
            if (obj.distance) {
                $('#distance').html(obj.distance + 'm');
            }else if( obj.endTime ){
                $('#distance').html(0 + 'm');
            }
            if (obj.wholeTime) {
                $('#duration').html(obj.wholeTime);
            }else if( obj.endTime ){
                $('#duration').html('00:00:00');
            }
            if (obj.eventCount) {
                $('#quantity').html(obj.eventCount);
            }
            if (obj.facilityRecordCount) {
                $('#facilityQuantity').html(obj.facilityRecordCount);
            }            
            if (obj.beginTime) {
                $('#beginTime').html(obj.beginTime);
            }
            if (obj.endTime) {
                $('#endTime').html(obj.endTime);
            }else{
                $('#endTime').html('异常关闭');
            }
        }
    },
    loadMap: function() { //加载地图
        var that = this;
        var titHeight = $('#content').offset().top;
        var cHeight = $('#content').offset().height;
        var cWidth = $('#content').offset().width;
        if (window.uexBaiduMap) {
            uexBaiduMap.open(0, titHeight, cWidth, cHeight, "116.309", "39.977"); //初始化百度地图
        }
    },
    bindInitEvent: function() {
        appcan.button("#nav-left", "btn-act", this.closeWin); //绑定返回按钮事件
    },
    closeWin: function() {
        try {
            uexBaiduMap.close();
        } catch (e) {}
        appcan.window.close(-1);
    },
    markRoute: function(aPoints) {
        var routePoints = [];
        aPoints.forEach(function(val, index, arr) {
            if (index === 0) {
                uexBaiduMap.addMarkersOverlay(JSON.stringify([{
                    id: index + '',
                    longitude: val.bdLon,
                    latitude: val.bdLat,
                    icon: "res://point-start.png"
                }]));
                
                routePoints.push({
                        longitude: val.bdLon,
                        latitude: val.bdLat,
                    });

            } else {
                routePoints.push({
                        longitude: val.bdLon,
                        latitude: val.bdLat,
                });
                // uexBaiduMap.addPolylineOverlay({
                    // id: index + '',
                    // fillColor: '#092af6',
                    // lineWidth: 8,
                    // property: [{
                        // longitude: arr[index - 1].bdLon,
                        // latitude: arr[index - 1].bdLat,
                    // }, {
                        // longitude: val.bdLon,
                        // latitude: val.bdLat,
                    // }],
                // });
            }
            if (index === arr.length - 1) {
                uexBaiduMap.addMarkersOverlay(JSON.stringify([{
                    id: arr.length + '',
                    longitude: val.bdLon,
                    latitude: val.bdLat,
                    icon: "res://point-end.png"
                }]));

                var lon = (parseFloat(arr[0].bdLon) + parseFloat(val.bdLon)) / 2;
                var lat = (parseFloat(arr[0].bdLat) + parseFloat(val.bdLat)) / 2;
                uexBaiduMap.setCenter(lon, lat); //设置中心点            
                uexBaiduMap.setZoomLevel(13); //2000米
            }
        });
        
        uexBaiduMap.addPolylineOverlay({
            id:'route123',
            fillColor: '#092af6',
            lineWidth: 8,
            property: routePoints
        });
        
    }
};
