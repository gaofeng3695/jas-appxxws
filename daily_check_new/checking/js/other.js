(function (JasDevice) {

    function JasLocation(obj) {
        obj = {
            cbAfterLocated: function () {},
        };
        this.cbAfterLocated = obj.cbAfterLocated || null;


    }

    JasLocation.prototype = {
        constructor: JasLocation,
        checkGpsStatus: function (callback) {
            JasDevice.getGPSOpenStatus(function (params) {
                callback && callback(params);
            });
        },


    }

    var jasLocation = {
        openLocation: function (isFree) {

        },

    };
})(JasDevice);









var jasHttpRequest = null; //ajax操作对象
var dbOperation = null; //数据库db操作的对象
var _dbNameForXJ = 'ZYXXWSDB1';

appcan.ready(function () {
    jasHttpRequest = new JasHttpRequest();
    dbOperation = new DataBaseOperation();
    InitObj.register();
    InitObj.judgeRunState();
});

var InitObj = {
    readyFlag: 0, //0：初始化-准备中  1：初始化-准备完毕
    judgeRunState: function () {
        var that = this;
        if (UserObj.userVerification() === true) {
            var recordSql = "select * from InsRecordForRB where flag = 0 and enterpriseId='" + UserObj.enterpriseId + "' and userId='" + UserObj.userId + "'";
            dbOperation.dbSelect(recordSql, function (err, data) {
                if (err == null) {
                    if (data == "") {
                        MapObj.modelStyle = 0; //自由模式
                        //that.readyFlag = 1;
                        that.init();
                    } else {
                        if (uexLockScreen.checkServerIsRunning() == 1) {
                            //正在巡线，重新回到日常巡检页面
                            MapObj.modelStyle = 1; //巡检模式
                            that.readyFlag = 1;
                            UserObj.recordId = data[0].recordId;
                            that.initRunning(data);
                        } else {
                            //表示异常关闭
                            appcan.window.confirm({
                                title: '提示',
                                content: '您存在上次未处理的巡检记录，是否进行提交？',
                                buttons: ['开始提交', '放弃（删除）'],
                                callback: function (err, data, dataType, optId) {
                                    if (data == 0) {

                                        baseOperation.alertToast('巡检数据处理中，请稍候...', 10000);
                                        LockScreenObj.submitRecord();
                                        if (tjSwitch == 1) {
                                            try {
                                                var zg_param = {
                                                    eventName: "提交巡检记录",
                                                    info: {}
                                                };
                                                uexTianji.track(zg_param);
                                            } catch (e) {}
                                        }
                                    } else {

                                        baseOperation.alertToast('巡检数据删除中，请稍候...', 10000);
                                        LockScreenObj.deleteRecord();
                                        if (tjSwitch == 1) {
                                            try {
                                                var zg_param = {
                                                    eventName: "放弃巡检记录",
                                                    info: {}
                                                };
                                                uexTianji.track(zg_param);
                                            } catch (e) {}
                                        }
                                    }
                                }
                            });
                        }
                    }
                } else {
                    alert("尊敬的用户：\r\n通过检测，发现您的应用数据库出现异常，无法进行离线数据存储。解决办法如下：\r\n1.关闭app，结束进程，并清理缓存。\r\n2.重新启动手机。\r\n3.如仍存在问题，请联系客服人员。");
                }
            });
        }
    },
    init: function () {
        //uexLockScreen.checkDozePermission();
        this.initVoiceState();
        DomObj.isSubmittingData = 0;
        GpsObj.judgeGpsStatus();
        DomObj.render(DomObj.templateForBegin);
        DomObj.renderUser();
        DomObj.initEventCountAndFacilitiesCount();
        MapObj.loadMap();
    },
    initRunning: function (_data) {
        this.initVoiceState();
        DomObj.isSubmittingData = 0;
        GpsObj.judgeGpsStatus();
        DomObj.reloadTimerAndMileage(_data);
        DomObj.render(DomObj.templateForActive);
        DomObj.renderUser();
        DomObj.reloadEventCountAndFacilitiesCount();
        MapObj.loadMap();
    },
    initParams: function () {
        InitObj.readyFlag = 0;
        MapObj.modelStyle = 0;
        MapObj.lastPointForBaidu = null;
        LockScreenObj.locationFlag = 0;
        DomObj.nPoints = 0; //坐标点的个数
        DomObj.nDist = 0; //巡检里程
        DomObj.nDura = 0; //巡检时长
    },
    initVoiceState: function () {
        try {
            var _voiceFlag = uexLockScreen.getIsPlayVoice();
            if (_voiceFlag == 1) { //开启声音
                $("#voice_icon_1").removeClass("fa-volume-off");
                $("#voice_icon_1").addClass("fa-volume-up");
            } else { //关闭声音
                $("#voice_icon_1").removeClass("fa-volume-up");
                $("#voice_icon_1").addClass("fa-volume-off");
            }
        } catch (e) {
            //$("#voice_icon_1").addClass("fa-volume-up");
        }
    },
    register: function () {
        MapObj.registerMapCallbackEvent();
        LocationObj.registerLocationChageEvent();
        LockScreenObj.registerLocationChageEvent();
        LockScreenObj.registerSubmitRecord();
        LockScreenObj.registerDeleteRecord();
    },
    runningState: function (_data) {
        var recordItem = _data[0];
        var _temp = recordItem.postData;
        var _tempObj = JSON.parse(_temp);
        var lastEndTime = _tempObj.endTime;
        var nowTime = new Date().Format("yyyy-MM-dd HH:mm:ss.S");
        var _wholeTime = parseInt((new Date(nowTime) - new Date(lastEndTime)) / 1000);
        if (_wholeTime < 61) {
            return true;
        } else {
            return false;
        }
    }
}

var UserObj = {
    token: "",
    enterpriseId: "",
    userId: "",
    recordId: "",
    userVerification: function () {
        if (appcan.locStorage.getVal("token") == 'undefined' || appcan.locStorage.getVal("token") == null || appcan.locStorage.getVal("token").length == 0) {
            alert("您好，您的用户认证信息已失效，请您重新登录!");
            return false;
        }
        if (appcan.locStorage.getVal("userBo") == 'undefined' || appcan.locStorage.getVal("userBo") == null || appcan.locStorage.getVal("userBo").length == 0) {
            alert("您好，您的用户认证信息已失效，请您重新登录!");
            return false;
        }

        var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
        if (userBo.enterpriseId == null || userBo.enterpriseId == 'undefined' || userBo.enterpriseId == "") {
            alert("您好，您的用户认证信息已失效，请您重新登录!");
            return false;
        }
        this.token = appcan.locStorage.getVal("token");
        this.enterpriseId = userBo.enterpriseId;
        this.userId = userBo.objectId;
        return true;
    }
}

var DomObj = {
    userDom: $('#userName'),
    userPhotoDom: $('#userPhoto'),
    deptDom: $('#dept'),
    titileDom: $('#header h1'),
    footerDom: $('#footer'),
    distDom: $('#distance'),
    duraDom: $('#duration'),
    qttyDom: $('#quantity'),
    qttyDomForFacility: $('#facility_quantity'),
    nPoints: 0, //坐标点的个数
    nDist: 0, //巡检里程
    nDura: 0, //巡检时长
    nQtty: 0, //事件数量
    nQttyForFacility: 0, //设施检查数量
    maxDistancePerSec: 40, //最大巡检速度 40km/h
    isSubmittingData: 0, //0：未提交数据   1：正在提交数据
    isShowPipeLinesFlag: 1, //0：关闭管网   1：开启管网
    templateForBegin: {
        title: '日常巡检',
        footer: '<div class="btn ub ub-ac bc-text-head ub-pc bc-btn uc-a1 ub-f1" id="btn1">' + '开始巡检' + '</div>'
    },
    templateForActive: {
        title: '正在巡检',
        footer: '<div class="btn ub ub-ac bc-text-head ub-pc bgOrange uc-a1 ub-f1" id="btn2">' +
            '事件上报' +
            '</div>' +
            '<div class="btn ub ub-ac bc-text-head ub-pc bgGreen uc-a1 ub-f1" id="btn22">' +
            '设施检查' +
            '</div>' +
            '<div class="btn ub ub-ac bc-text-head ub-pc bgRed uc-a1 ub-f1" id="btn3">' +
            '取消巡检' +
            '</div>' +
            '<div class="btn ub ub-ac bc-text-head ub-pc bc-btn uc-a1 ub-f1" id="btn4">' +
            '完成巡检' +
            '</div>'
    },
    render: function (template) { //渲染页面（头部、底部)，添加底部按钮点击事件
        this.titileDom.html(template.title);
        this.footerDom.html(template.footer);
        if (template === this.templateForBegin) {
            this.bindBeginEvent();
            this.bindReturnEvent();
        }
        if (template === this.templateForActive) {
            this.bindActiveEvent();
            this.bindReturnEvent();
        }
    },
    renderUser: function () {
        var that = this;
        var aData = JSON.parse(appcan.locStorage.getVal('userBo'));
        if (aData) {
            if (aData.userName) {
                that.userDom.html(aData.userName);
            }
            if (aData.orgName) {
                that.deptDom.html(aData.orgName);
            }
            if (aData.sex === '女') {
                that.userPhotoDom.prop('src', '../images/female_head.png');
            }
            if (aData.profilePhoto) {
                var src = serverURL + "cloudlink-core-file/file/getImageBySize?fileId=" + aData.profilePhoto + "&viewModel=fill&width=500&hight=500";
                that.userPhotoDom.prop('src', src);
            }
            return;
        }
    },
    renderDura: function () { //渲染巡检事件 并 记录与上传数据
        var s = this.formatTime(this.nDura);
        this.duraDom.html(s);
    },
    bindReturnEvent: function () { //绑定返回按钮事件
        var that = this;
        appcan.button("#nav-left", "btn-act", function () {
            if (that.isSubmittingData == 1) {
                baseOperation.alertToast('巡检数据正在处理中，请稍候...', 3500);
                return;
            }
            that.checkOut();
        });
        //监听手机物理返回键
        uexWindow.setReportKey(0, 1);
        uexWindow.onKeyPressed = function (keyCode) {
            if (that.isSubmittingData == 1) {
                baseOperation.alertToast('巡检数据正在处理中，请稍候...', 3500);
                return;
            }
            that.checkOut();
        };
    },
    bindBeginEvent: function () {
        var that = this;
        /*
         * 开始巡检绑定的事件
         */
        appcan.button("#btn1", "ani-act", function () {
            if (InitObj.readyFlag === 1) {
                MapObj.modelStyle = 1;
                MapObj.removeMarkersForFreeModel();
                LocationObj.closeLocation();
                that.render(that.templateForActive);
                that.timerStart();
                LockScreenObj.locationFlag = 1;
                LockScreenObj.openLocation();
            } else {
                alert("GPS初始化，请您确认已开启GPS，再进行巡检...");
                return;
            }
            if (tjSwitch == 1) {
                try {
                    var zg_param = {
                        eventName: "点击开始巡检",
                        info: {}
                    };
                    uexTianji.track(zg_param);
                } catch (e) {}
            }
        });
    },
    bindActiveEvent: function () {
        var that = this;
        /*
         * 事件上报 注册以下事件
         */
        appcan.button("#btn2", "ani-act", function () {
            if (DomObj.isSubmittingData == 0) {
                EventObj.createNewEvent();
            }
            if (tjSwitch == 1) {
                try {
                    var zg_param = {
                        eventName: "日常巡检-点击事件上报",
                        info: {}
                    };
                    uexTianji.track(zg_param);
                } catch (e) {}
            }
        });
        /*
         * 设施检查 注册以下事件
         */
        appcan.button("#btn22", "ani-act", function () {
            if (DomObj.isSubmittingData == 0) {
                FacilityObj.checkFacility();
            }

            if (tjSwitch == 1) {
                try {
                    var zg_param = {
                        eventName: "日常巡检-点击设施检查",
                        info: {}
                    };
                    uexTianji.track(zg_param);
                } catch (e) {}
            }

        });
        /*
         * 取消巡检 注册以下事件
         */
        appcan.button("#btn3", "ani-act", function () {
            if (DomObj.isSubmittingData == 0) {
                appcan.window.confirm({
                    title: '取消巡检',
                    content: '是否取消巡检？\r\n该操作将清除已巡查的轨迹和上报事件。',
                    buttons: ['确定', '取消'],
                    callback: function (err, data, dataType, optId) {
                        if (err || data === 1) { //取消或报错
                            return;
                        }
                        if (data == 0) {
                            DomObj.isSubmittingData = 1;
                            LockScreenObj.locationFlag = 0;
                            baseOperation.alertToast('巡检数据删除中，请稍候...', 65000);
                            LockScreenObj.deleteRecord();

                            if (tjSwitch == 1) {
                                try {
                                    var zg_param = {
                                        eventName: "点击取消巡检",
                                        info: {}
                                    };
                                    uexTianji.track(zg_param);
                                } catch (e) {

                                }
                            }
                        }
                    }
                });
            }
        });
        /*
         * 完成巡检 注册以下事件
         */
        appcan.button("#btn4", "ani-act", function () {
            if (DomObj.isSubmittingData == 0) {
                appcan.window.confirm({
                    title: '完成巡检',
                    content: '是否结束巡检？',
                    buttons: ['确定', '取消'],
                    callback: function (err, data, dataType, optId) {
                        if (err || data == 1) { //取消或报错
                            return;
                        }
                        if (data == 0) {
                            DomObj.isSubmittingData = 1;
                            LockScreenObj.locationFlag = 0;
                            baseOperation.alertToast('巡检数据处理中，请稍候...', 65000);
                            LockScreenObj.submitRecord();

                            if (tjSwitch == 1) {
                                try {
                                    var zg_param = {
                                        eventName: "点击完成巡检",
                                        info: {}
                                    };
                                    uexTianji.track(zg_param);
                                } catch (e) {}
                            }
                        }
                    }
                });
            }


        });
    },
    timerStart: function () {
        var that = this;
        clearInterval(this.timerForCurrent);
        this.timerForCurrent = setInterval(function () {
            that.nDura += 1;
            var s = that.formatTime(that.nDura);
            that.duraDom.html(s);
        }, 1000);
    },
    timerStop: function () {
        clearInterval(this.timerForCurrent);
        this.nDura = 0;
    },
    formatTime: function (n) { //格式化时间
        var hour = Math.floor(n / 3600),
            minute = Math.floor((n - (3600 * hour)) / 60),
            second = n - 3600 * hour - 60 * minute;
        var add0 = function (n) {
            if (n < 10) {
                return '0' + n;
            }
            return n;
        };
        return add0(hour) + ':' + add0(minute) + ':' + add0(second);
    },
    checkOut: function () { //退出应用
        var that = this;
        uexLocation.closeLocation(); //关闭gps位置监听
        uexBaiduMap.close();
        appcan.window.evaluateScript('index', 'imgChange()');
        appcan.window.evaluatePopoverScript('index', 'index_content', 'refresTasks()'); //刷新主界面的任务列表
        appcan.window.close(-1);
    },
    setVoiceOnOrOff: function () {
        try {
            var _voiceFlag = uexLockScreen.getIsPlayVoice();
            if (_voiceFlag == 1) { //原状态开启声音，关闭声音的动作
                uexLockScreen.setIsPlayVoice(0);
                $("#voice_icon_1").removeClass("fa-volume-up");
                $("#voice_icon_1").addClass("fa-volume-off");
                baseOperation.alertToast('语音提示已关闭', 3000);
            } else { //原状态关闭声音，开启声音的动作
                uexLockScreen.setIsPlayVoice(1);
                $("#voice_icon_1").removeClass("fa-volume-off");
                $("#voice_icon_1").addClass("fa-volume-up");
                baseOperation.alertToast('语音提示已开启', 3000);
            }
        } catch (e) {
            //$("#voice_icon_1").addClass("fa-volume-up");
        }
    },
    setPipeLinesOnOrOff: function () {
        try {
            if (this.isShowPipeLinesFlag == 1) { //当前状态为 开始状态
                this.isShowPipeLinesFlag = 0;
                $("#pipeline_icon_1").removeClass("fa-eye");
                $("#pipeline_icon_1").addClass("fa-eye-slash");
                baseOperation.alertToast('管网地图已关闭', 3000);
                pipeLinesObj.clearPipeLines();
            } else { //当前状态为 关闭状态
                this.isShowPipeLinesFlag = 1;
                $("#pipeline_icon_1").removeClass("fa-eye-slash");
                $("#pipeline_icon_1").addClass("fa-eye");
                baseOperation.alertToast('管网地图已开启', 3000);
                pipeLinesObj.drowLines();
            }
        } catch (e) {
            //$("#voice_icon_1").addClass("fa-volume-up");
        }
    },
    /*
     * 重新加载巡检时长以及里程
     */
    reloadTimerAndMileage: function (_data) {
        if (_data.length > 0) {
            var obj = JSON.parse(_data[0].postData);
            var _wholeTime = 0;
            try {
                _wholeTime = uexLockScreen.getWholeTime();
                _wholeTime = parseInt(_wholeTime / 1000);
            } catch (e) {
                _wholeTime = parseInt((new Date(obj.endTime) - new Date(obj.beginTime)) / 1000);
            }
            this.nDura = _wholeTime; //巡检时长
            this.nDist = obj.distance; //巡检里程
            this.distDom.html(this.nDist + 'm');
            this.timerStart();
        } else {
            this.nDura = 0; //巡检时长
            this.nDist = 0; //巡检里程
            this.distDom.html('0m');
            this.timerStart();
        }
    },

    initEventCountAndFacilitiesCount: function () {
        appcan.locStorage.setVal("RCXJ_EVENT_COUNT", 0); //事件数量
        appcan.locStorage.setVal("RCXJ_FACILITIES_COUNT", 0); //设施检查数量

        this.qttyDom.html(0); //事件数量
        this.qttyDomForFacility.html(0); //设施检查数量
    },
    reloadEventCountAndFacilitiesCount: function () {
        this.qttyDom.html(appcan.locStorage.getVal("RCXJ_EVENT_COUNT") == null ? "0" : appcan.locStorage.getVal("RCXJ_EVENT_COUNT")); //事件数量
        this.qttyDomForFacility.html(appcan.locStorage.getVal("RCXJ_FACILITIES_COUNT") == null ? "0" : appcan.locStorage.getVal("RCXJ_FACILITIES_COUNT")); //设施检查数量
    }
}

var GpsObj = {
    judgeGpsStatus: function () {
        JasDevice.getGPSOpenStatus(function (params) {
            if (params == false) {
                appcan.window.confirm({
                    title: 'GPS提示',
                    content: '请您开启GPS，为您提供精准的定位服务。',
                    buttons: ['设置', '取消'],
                    callback: function (err, data, dataType, optId) {
                        if (data == 0) {
                            var params1 = {
                                setting: "GPS"
                            };
                            var data1 = JSON.stringify(params1);
                            uexDevice.openSetting(data1);
                        }
                    }
                });
            }
        });
    }
}

var MapObj = {
    modelStyle: 0, //0:自由模式   1:巡检模式
    lastPointForBaidu: null, //当前巡检的上一个坐标点（百度坐标）
    loadMap: function () {
        var titHeight = $('#content').offset().top;
        var cHeight = $('#content').offset().height;
        var cWidth = $('#content').offset().width;
        uexBaiduMap.open(0, titHeight, cWidth, cHeight, "116.403357", "39.913662");
    },
    /*
     * 注册地图打开回调的事件
     */
    registerMapCallbackEvent: function () {
        var that = this;
        if (window.uexBaiduMap) {
            uexBaiduMap.cbOpen = function () {
                pipeLinesObj.loadLines(); //加载管网信息
            }
        }
    },
    afterLoadLinesEvent: function () {
        if (this.modelStyle == 0) {
            LocationObj.openLocation(); //开启定位
        } else {
            this.reloadMarkersFromDB(); //巡检状态下，初始化坐标点
        }
    },
    GPStoBaidu: function (lat, log) {
        var params1 = {
            latitude: lat,
            longitude: log,
            from: "wgs84",
            to: "bd09"
        };
        var data = uexLocation.convertLocation(JSON.stringify(params1)); //转化成百度坐标
        var obj = JSON.parse(data); //此时获取到了百度坐标点
        return obj;
    },

    addMarkerForStart: function (_id, _lon, _lat) {
        uexBaiduMap.addMarkersOverlay(JSON.stringify([{
            id: _id + '',
            longitude: _lon,
            latitude: _lat,
            icon: "res://point-start.png"
        }]));
    },
    addPolylineOverlay: function (_data) {
        var pointsLength = 0;
        try {
            pointsLength = _data.length;
        } catch (e) {
            pointsLength = 0;
        }

        if (pointsLength == 0) {
            this.lastPointForBaidu = null;
        } else if (pointsLength == 1) {
            var item = JSON.parse(_data[0].postData);
            this.addMarkerForStart("cp_start", item.bdLon, item.bdLat);
            this.lastPointForBaidu = {
                bdLon: item.bdLon,
                bdLat: item.bdLat
            };
            uexBaiduMap.setCenter(item.bdLon, item.bdLat); //设置中心点
            uexBaiduMap.setZoomLevel(16); //初始化地图缩放级别
        } else {
            var routePoints = [];
            for (var i = 0; i < pointsLength; i++) {
                var obj = JSON.parse(_data[i].postData);
                if (i == 0) {
                    this.addMarkerForStart("cp_start", obj.bdLon, obj.bdLat);
                    routePoints.push({
                        longitude: obj.bdLon,
                        latitude: obj.bdLat,
                    });
                } else {
                    routePoints.push({
                        longitude: obj.bdLon,
                        latitude: obj.bdLat,
                    });
                }
            }

            var item = JSON.parse(_data[pointsLength - 1].postData);
            this.lastPointForBaidu = {
                bdLon: item.bdLon,
                bdLat: item.bdLat
            };
            uexBaiduMap.setCenter(item.bdLon, item.bdLat); //设置中心点
            uexBaiduMap.setZoomLevel(16); //初始化地图缩放级别
            uexBaiduMap.addPolylineOverlay({
                id: 'roadPath',
                fillColor: '#092af6',
                lineWidth: 8,
                property: routePoints
            });
            /*
             * 标注当前人员位置
             * sf 2017-6-21
             */
            var ids = '["cp1"]';
            uexBaiduMap.removeMakersOverlay(ids);
            var datac1 = [{
                id: "cp1",
                longitude: item.bdLon,
                latitude: item.bdLat,
                icon: "res://online.png"
            }];
            uexBaiduMap.addMarkersOverlay(JSON.stringify(datac1));
        }
        LockScreenObj.locationFlag = 1;
    },
    removeMarkersForFreeModel: function () {
        uexBaiduMap.removeMakersOverlay('["freepoint"]');
    },
    reloadMarkersFromDB: function () {
        var that = this;
        var trajectorySql = "select * from InsTrajectoryForRB where recordId='" + UserObj.recordId + "' order by id;";
        dbOperation.dbSelect(trajectorySql, function (err, data) {
            that.addPolylineOverlay(data);
        });
    }
}


(function (jasRequest) {
    var pipeLinesObj = {
        aPipeLines: null,
        loadPipeLines: function (callback) { // 加载pipeline到地图上
            var that = this;
            var sLines = appcan.locStorage.getVal("pipeLinesData");

            if (sLines) {
                var lines = JSON.parse(sLines);
                that.aPipeLines = lines;
                that.drowLines(lines);
                callback && callback();
                return;
            }

            var partURL = "cloudlink-inspection-event/commonData/pipemaplinedetail/getPageList";
            var queryObj = {
                "objectIds": [],
                "pipeNetworkId": '',
                "pipeNetworkUsed": '1',
                "pageNum": 1,
                "pageSize": 500
            };
            jasRequest.post(partURL, queryObj, function (oData) {
                if (oData.success == 1 && oData.code == 200 && oData.total > 0) {
                    var lines = lineObjs.rows;

                    that.aPipeLines = lines;
                    that.drowLines(lines);
                    callback && callback();
                } else {
                    appcan.locStorage.setVal("pipeLinesData", "");
                    callback && callback();
                }
            }, function () {
                appcan.locStorage.setVal("pipeLinesData", "");
                callback && callback();
            });
        },
        drawPipeLines: function (aLines) {
            aLines.forEach(function (oLine) {
                var lineStype = {
                    id: oLine.objectId,
                    fillColor: oLine.pipeColor,
                    lineWidth: oLine.pipeWeight,
                    property: oLine.line.map(function (item) {
                        return {
                            longitude: item.bdLon,
                            latitude: item.bdLat,
                        };
                    })
                };
                window.uexBaiduMap && uexBaiduMap.addPolylineOverlay(lineStype);
            });
        },
        clearPipeLines: function (aLines) {
            aLines.forEach(function (oLine) {
                window.uexBaiduMap && uexBaiduMap.removeOverlay(oLine.objectId);
            });
        }
    };
    window.pipeLinesObj = pipeLinesObj;
})(jasRequest);




var LockScreenObj = {
    locationFlag: 0, //0：uexLockScreen.onChange不标注点   1：uexLockScreen.onChange标注点

    openLocation: function () {
        var param = {
            enterpriseId: UserObj.enterpriseId, //企业ID
            userId: UserObj.userId, //用户ID
            token: UserObj.token,
            dataBaseName: _dbNameForXJ, //数据库名称
            type: "bd09" //返回坐标类型
        }
        //开始定位
        uexLockScreen.openLocation(JSON.stringify(param));
    },

    closeLocation: function () {
        uexLockScreen.closeLocation(); //关闭定位
    },

    /*
     * 注册GPS坐标改变监听的事件
     */
    registerLocationChageEvent: function () {
        var that = this;
        var _index = 1;
        uexLockScreen.onChange = function (lat, lon, speed, distance, timer, satelliteNumber) {
            if (that.locationFlag == 0) return;

            DomObj.distDom.html(distance + 'm');
            DomObj.nDura = parseInt(timer / 1000);

            if (MapObj.lastPointForBaidu == null) {
                MapObj.addMarkerForStart("cp_start", lon, lat);
                MapObj.lastPointForBaidu = {
                    bdLon: lon,
                    bdLat: lat
                };
            } else {
                uexBaiduMap.addPolylineOverlay({
                    id: 'path_' + _index.toString(),
                    fillColor: "#092af6",
                    lineWidth: 8,
                    property: [{
                        longitude: MapObj.lastPointForBaidu.bdLon,
                        latitude: MapObj.lastPointForBaidu.bdLat
                    }, {
                        longitude: lon,
                        latitude: lat
                    }],
                });
                _index++;
                MapObj.lastPointForBaidu = {
                    bdLon: lon,
                    bdLat: lat
                };
                /*
                 * 标注当前人员位置
                 * sf 2016-11-13
                 */
                var ids = '["cp1"]';
                uexBaiduMap.removeMakersOverlay(ids);
                var datac = [{
                    id: "cp1",
                    longitude: lon,
                    latitude: lat,
                    icon: "res://online.png"
                }];
                uexBaiduMap.addMarkersOverlay(JSON.stringify(datac));
                uexBaiduMap.setCenter(lon, lat); //设置中心点
            }
        }
    },
    /*
     * 注册submitRecord的回调函数
     */
    registerSubmitRecord: function () {
        uexLockScreen.cbSubmitRecord = function (opId, dataType, data) {
            baseOperation.closeToast();
            if (data == 1) {
                baseOperation.alertToast("巡检记录提交完成", 3000);
                InitObj.initParams();
                uexBaiduMap.close();
                InitObj.judgeRunState();
            } else {
                alert("数据提交失败，请重试！");
                DomObj.isSubmittingData = 0;
            }
        }
    },

    /*
     * 注册deleteRecord的回调函数
     */
    registerDeleteRecord: function () {
        uexLockScreen.cbDeleteRecordInfo = function (opId, dataType, data) {
            baseOperation.closeToast();
            if (data == 1) {
                baseOperation.alertToast("取消巡检记录完成", 3000);
                InitObj.initParams();
                uexBaiduMap.close();
                InitObj.judgeRunState();
            } else {
                alert("取消巡检失败，请重试！");
                DomObj.isSubmittingData = 0;
            }
        }
    },
    submitRecord: function () {
        DomObj.timerStop();
        uexLockScreen.closeLocation();
        setTimeout(function () {
            var param2 = {
                dataBaseName: _dbNameForXJ, //数据库名称
                enterpriseId: UserObj.enterpriseId, //企业ID
                userId: UserObj.userId, //用户ID
                token: UserObj.token
            }
            uexLockScreen.submitRecord(JSON.stringify(param2));
        }, 500);

    },
    deleteRecord: function () {
        DomObj.timerStop();
        uexLockScreen.closeLocation();
        var param1 = {
            dataBaseName: _dbNameForXJ, //数据库名称
            enterpriseId: UserObj.enterpriseId, //企业ID
            userId: UserObj.userId, //用户ID
            token: UserObj.token
        }
        //删除巡检记录及轨迹点
        uexLockScreen.deleteRecordInfo(JSON.stringify(param1));
    }
}



var EventObj = {
    createNewEvent: function () {
        var params = {
            model: '1'
        };
        appcan.locStorage.setVal('enterEventModel', params);
        uexLocation.closeLocation(); //关闭gps位置监听
        uexBaiduMap.close();
        appcan.window.evaluateScript('index', 'imgChange()');
        appcan.window.close(-1);
        appcan.openWinWithUrl("event_report", "../event_management/event_report.html");
    }
};