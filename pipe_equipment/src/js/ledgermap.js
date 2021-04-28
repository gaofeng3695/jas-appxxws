appcan.ready(function() {
    gpsstatus();
    //确保打开了GPS信号
    ledgerMapObj.init();
});
// window.onerror = function(msg, url, line) {
// alert("erro" + msg + "\n" + url + ":" + line);
// return true;
// };
(function(appcan, window, $, baseOperation, JasHttpRequest, getLocationObj) {
    var uint = {
        init : function() {
            this.getPipeType();
            this.getFacility();
        },
        getPipeType : function() {
            var pipeDamin = JSON.parse(appcan.locStorage.getVal("pipelineTypeList"));
            var s = "<option value=''>全部</option>";
            pipeDamin.forEach(function(item, index, arr) {
                s += "<option value='" + item.domainCode + "'>" + item.domainValue + "</option>"
            });
            $(".pipeOption").append(s);
        },
        getFacility : function() {
            var facilityDamin = JSON.parse(appcan.locStorage.getVal("facilityTypeList"));
            var s = "<option value=''>全部</option>";
            facilityDamin.forEach(function(item, index, arr) {
                if (item.domainCode == "FT_01") {
                    s += "<option value='" + item.domainCode + "' selected>" + item.domainValue + "</option>"
                } else {
                    s += "<option value='" + item.domainCode + "'>" + item.domainValue + "</option>"
                }

            });
            $(".optionFaci").append(s);
        },
    };
    var obj = {
        searchObj : {
            'pageNum' : 1,
            'pageSize' : 200,
            'keyword' : '',
            'facilityStatusCode' : '',
            'pipelineTypeCode' : '',
            'facilityTypeCodeList' : ["FT_01"]
        },

        footerDataList : [],
        pointList : [], //所有设施点的集合
        centerPoint : {},
        footerCurrentIndex : '', //当前渲染底部是数组的第几个
        footerCurrentId : '', //当前渲染底部的施舍ID
        jasHttpRequest : new JasHttpRequest(),
        footerIsShow : 0, //判断是不是初始化进来的0表示刚进来，1表示请求
        resetCurrentAddress : null, //判断是不是进行下面的请求
        nFacilityQtty : 0, //用于判断是不是存在设施
        elem : {

        },
        eventsMap : {
            'click .switchBtnLeft' : 'e_switchToLast',
            'click .switchBtnRight' : 'e_switchToNext',
            'click .mapLocation' : 'e_relocate',
            'click #search' : 'e_search',
            'click .searchDelete' : 'e_research'
        },
        init : function() {
            var that = this;

            uint.init();
            that.initElem();
            that.loadMap();
            that.bindEvent();

            if (window.uexBaiduMap) {
                uexBaiduMap.cbOpen = function() {
                    that.getLocationAndRender();
                };
            } else {
                alert('地图不存在，直接开启定位！');
                that.getLocationAndRender();
            }
        },
        getLocationAndRender : function() {
            var that = this;
            // if (that.centerPoint.bdLon || that.centerPoint.bdLat) {
            // that.requestData();
            // return;
            // }
            getLocationObj.init(function(sObj) {//获取当前gps
                var obj = JSON.parse(sObj);
                that._setMapSenterAndMark(obj.bdLon, obj.bdLat);
                that.requestData();
            }, function(sObj) {
                var obj = JSON.parse(sObj);
                $(".currentaddress").text(obj.address);
            });
        },
        _setMapSenterAndMark : function(lon, lat) {
            var that = this;
            if (window.uexBaiduMap) {
                uexBaiduMap.removeMakersOverlay('["freepoint"]');
                uexBaiduMap.addMarkersOverlay(JSON.stringify([{
                    id : 'freepoint',
                    longitude : lon,
                    latitude : lat,
                    icon : "res://cpf.png"
                }]));
                that.centerPoint.bdLon = lon;
                that.centerPoint.bdLat = lat;
                uexBaiduMap.setCenter(lon, lat);
            }
        },
        bindEvent : function() {
            var that = this;

            this.bindSelectEvent();
            this.bindMapEvent();
            this.initializeOrdinaryEvent(this.eventsMap);

            appcan.button(".showList", "btn-act", function() {// 返回设施列表页面
                appcan.window.close(-1);
            });

            appcan.button(".createledger", "btn-act", function() {// 跳转新建设施页面
                appcan.locStorage.val('equipmentEntrance', 'new');
                appcan.openWinWithUrl('new_equipment', '../new_equipment/new_equipment.html');
            });
            appcan.button(".js_btn", "btn-act", function(e) {// 跳转设施详情页面
                var facilityId = appcan.locStorage.val('facilityId');
                if (facilityId) {
                    var id = this.id;
                    if (id === 'detail') {
                        appcan.locStorage.val('facilitiesDetailsEntrance', 'map');
                        appcan.openWinWithUrl('network_facilities_details', '../detail_equipment/network_facilities_details.html');
                        return;
                    }
                    if (id === 'new_create') {
                        appcan.locStorage.val('equipmentCheckEntrance', 'map');
                        appcan.openWinWithUrl('new_check', '../new_check/new_check.html');
                        return;
                    }
                    if (id === 'record') {
                        appcan.openWinWithUrl('checkrecoured', '../list_check/checkrecord.html');
                        return;
                    }
                } else {
                    if (that.nFacilityQtty === 0) {
                        baseOperation.alertToast('目前不存在设施');
                    } else {
                        baseOperation.alertToast('请选择您要查看的设施');
                    }
                }
            });

            appcan.window.on('resume', function() {
                that.loadMap();
            });
            appcan.window.on('pause', function() {
                uexBaiduMap.close();
            });
        },

        bindSelectEvent : function() {
            var that = this;
            /*设施列表筛选*/
            appcan.select("#select01", function(ele, value) {
                that.searchObj.pipelineTypeCode = value;
                that.requestData();
            });
            appcan.select("#select02", function(ele, value) {

                if (value == "") {
                    $(".pipeTypeName").text("管网设施");
                    that.searchObj.facilityTypeCodeList = [];
                } else {
                    var thisText = ele[0].options[ele[0].selectedIndex].text;
                    $(".pipeTypeName").text(thisText);
                    that.searchObj.facilityTypeCodeList[0] = value;
                }
                that.requestData();
            });
        },
        bindMapEvent : function() {//绑定地图点击事件
            var that = this;
            if (window.uexBaiduMap) {
                uexBaiduMap.onMarkerClickListener = function(id) {
                    that.setIndexById(id);
                    that.renderFooter();
                };
            }
        },
        setIndexById : function(id) {
            var that = this;
            var arr = that.footerDataList;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].objectId === id) {
                    that.footerCurrentId = id;
                    that.footerCurrentIndex = i;
                    return;
                }
            }
            that.footerCurrentId = '';
            that.footerCurrentIndex = '';
        }, //通过点击地图上面的ID进行底部的变化
        loadMap : function() {//加载地图
            var that = this;
            var titHeight = $('#content').offset().top;
            var cHeight = $('#content').offset().height;
            var cWidth = $('#content').offset().width;
            if (window.uexBaiduMap) {
                uexBaiduMap.open(0, titHeight, cWidth, cHeight, "116.309", "39.977");
                //初始化百度地图
            }
        },
        _clearFacilityMarkers : function() {
            var that = this;
            if (that.footerDataList && that.footerDataList.length > 0) {
                that.footerDataList.forEach(function(item, index, arr) {
                    uexBaiduMap.removeMakersOverlay('[' + item.objectId + ']');
                });
            }
            uexBaiduMap.hideBubble();
        },
        requestData : function() {
            var that = this;
            that.pointList = [];
            var partURL1 = 'cloudlink-inspection-event/facility/getPageList';
            baseOperation.londingToast('数据请求中，请稍后...', 99999);
            that.jasHttpRequest.jasHttpPost(partURL1, function(id, state, dbSource) {
                if (dbSource == "") {
                    baseOperation.alertToast('网关异常');
                    return;
                }
                baseOperation.closeToast();
                var reObj = JSON.parse(dbSource);
                if (+reObj.success !== 1) {
                    baseOperation.alertToast('网络请求失败');
                } else {
                    that._clearFacilityMarkers();
                    that.MarkPointAndRenderFooter(reObj.rows);
                }

            }, JSON.stringify(that.searchObj));
        },
        MarkPointAndRenderFooter : function(aData) {//入参：设施对象数组
            var that = this;
            aData.forEach(function(val, ind, arr) {//遍历取到的所有设施信息，标记设施
                that.pointList.push({
                    bdLat : val.bdLat,
                    bdLon : val.bdLon,
                });
                that.markFacility(val.objectId, val.bdLon, val.bdLat, val.facilityTypeCode, val.facilityCode);
            });

            if (window.uexBaiduMap) {
                var level = jasMap.getZoomWithCalculateMaxPoint(that.pointList, that.centerPoint);
                //   alert("中心点"+that.centerPoint.bdLon, that.centerPoint.bdLat);
                uexBaiduMap.setCenter(that.centerPoint.bdLon, that.centerPoint.bdLat);
                uexBaiduMap.setZoomLevel(level);

            }

            that.footerDataList = aData;
            that.nFacilityQtty = that.footerDataList.length;
            $(".pipeNum").text(that.footerDataList.length);

            that.setIndexById(that.footerCurrentId);
            that.renderFooter();
        },
        markFacility : function(id, lon, lat, type, name) {
            if (!lon || !lat) {
                alert('GPS坐标错误');
                return;
            }
            var typeImg = {
                'FT_01' : 'res://pressure.png', //调压设备
                'FT_02' : 'res://valve.png', //阀室
                'FT_03' : 'res://valvebox.png', //阀门
                'FT_04' : 'res://well.png', //井
                'FT_05' : 'res://vat.png', //缸
                'FT_06' : 'res://three.png', //三通
                'FT_07' : 'res://four.png', //四通
                'FT_08' : 'res://pole.png', //桩
                'FT_09' : 'res://warning.png', //警示牌
                'FT_10' : 'res://flow.png', //流量计
                'FT_11' : 'res://gage.png', //压力表
                'FT_99' : 'res://other.png'
            };
            var aPointObjs = [{
                id : id,
                longitude : lon,
                latitude : lat,
                icon : typeImg[type],
                bubble : {//(可选)自定义弹出气泡
                    title : name //(必选)自定义弹出气泡标题
                }
            }];
            if (window.uexBaiduMap) {
                uexBaiduMap.removeMakersOverlay('[' + id + ']');
                uexBaiduMap.addMarkersOverlay(JSON.stringify(aPointObjs));
            }
        },
        renderFooter : function() {
            var that = this;
            if (!that.footerCurrentIndex && that.footerCurrentIndex !== 0) {//当前未选中设备
                that.footerCurrentId = '';
                // alert("中心点rootershezhi"+that.centerPoint.bdLon, that.centerPoint.bdLat);
                //uexBaiduMap.setCenter(that.centerPoint.bdLon, that.centerPoint.bdLat);
                appcan.locStorage.remove('facilityId');
                appcan.locStorage.remove('equipmentSelectedObjs');
                $(".initequip").css("display", "block");
                $(".footerEquired").css("display", "none");
                uexBaiduMap.hideBubble();
                return;
            }
            $(".initequip").css("display", "none");
            $(".footerEquired").css("display", "block");
            var obj = that.footerDataList[that.footerCurrentIndex];
            that.isPrivil(obj);
            //判断有没有编辑权限
            appcan.locStorage.val('equipmentSelectedObjs', obj);
            appcan.locStorage.val('facilityId', obj.objectId);
            that.footerCurrentId = obj.objectId;
            //进行当前设施Bo的存储
            if (obj.bdLon && obj.bdLat) {
                uexBaiduMap.setCenter(obj.bdLon, obj.bdLat);
                uexBaiduMap.showBubble(obj.objectId);
            }
            $(".facilityName").text(obj.facilityName);
            $(".pipetype").text(obj.pipelineTypeName);
            $(".facilityTypeName").text(obj.facilityTypeName);
            $(".address").text(obj.address);

        },
        isPrivil : function(obj) {
            var userBo = JSON.parse(appcan.locStorage.val("userBo"));
            if (userBo.isSysadmin == "1") {
                appcan.locStorage.val('ledgerPrivilege', 'true');
                //true 有权限,fasle无权限
            } else if (userBo.objectId == obj.createUserId) {
                appcan.locStorage.val('ledgerPrivilege', 'true');
            } else {
                appcan.locStorage.val('ledgerPrivilege', 'false');
            }
        },
        e_switchToNext : function() {
            var that = this;
            if (that.footerCurrentIndex == that.footerDataList.length - 1) {
                baseOperation.alertToast('没有下一个');
            } else {
                that.footerCurrentIndex++;
                that.renderFooter();
            }
        },
        e_switchToLast : function() {
            var that = this;
            if (that.footerCurrentIndex == 0) {
                baseOperation.alertToast('没有上一个');
            } else {
                that.footerCurrentIndex--;
                that.renderFooter();
            }
        },
        e_search : function() {
            var value = $("#inputDom").val();
            this.searchObj.keyword = value;
            this.requestData();
        },
        e_research : function() {
            this.searchObj.keyword = "";
            this.requestData();
        },
        e_relocate : function() {
            var that = this;
            uexBaiduMap.hideBubble();
            appcan.locStorage.remove('facilityId');
            appcan.locStorage.remove('equipmentSelectedObjs');
            $(".initequip").css("display", "block");
            $(".footerEquired").css("display", "none");
            getLocationObj.init(function(sObj) {//获取当前gps
                var obj = JSON.parse(sObj);
                that._setMapSenterAndMark(obj.bdLon, obj.bdLat);
            }, function(sObj) {
                var obj = JSON.parse(sObj);
                $(".currentaddress").text(obj.address);
            });
        },
        initializeOrdinaryEvent : function(maps) {
            this._scanEventsMap(maps, true);
        },
        _scanEventsMap : function(maps, isOn) {
            var delegateEventSplitter = /^(\S+)\s*(.*)$/;
            var type = isOn ? 'on' : 'off';
            for (var keys in maps) {
                if (maps.hasOwnProperty(keys)) {
                    if ( typeof maps[keys] === 'string') {
                        maps[keys] = this[maps[keys]].bind(this);
                    }
                    var matchs = keys.match(delegateEventSplitter);
                    $('body')[type](matchs[1], matchs[2], maps[keys]);
                }
            }
        },
        initElem : function() {
            var eles = this.elem;
            for (var name in eles) {
                if (eles.hasOwnProperty(name)) {
                    this[name] = $(eles[name]);
                }
            }
        },
    };
    window.ledgerMapObj = obj;
})(appcan, window, Zepto, baseOperation, JasHttpRequest, getLocationObj);

function gpsstatus() {
    JasDevice.getGPSOpenStatus(function(params) {
        if (params == false) {
            appcan.window.confirm({
                title : 'GPS提示',
                content : '请您开启GPS，为您提供精准的定位服务，方便您进行设施的查看。',
                buttons : ['设置', '取消'],
                callback : function(err, data, dataType, optId) {
                    if (data == 0) {
                        var params1 = {
                            setting : "GPS"
                        };
                        var data1 = JSON.stringify(params1);
                        uexDevice.openSetting(data1);
                    }
                }
            });
        }
    });
}
