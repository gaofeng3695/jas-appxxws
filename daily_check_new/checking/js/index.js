/**
 * 模块： TrackTool
 * 使用： TrackTool.track(param);
 * 依赖： 变量 -> window
 * 依赖： 插件 -> uexTianji
 */
(function (window) {
    window.TrackTool = {
        track: function (sName, oInfo) {
            try {
                window.uexTianji && uexTianji.track({
                    eventName: sName || '未知操作',
                    info: oInfo || {}
                });
            } catch (e) {

            }
        },
    };
})(window);

/**
 * 模块： AudioTool
 * 使用： AudioTool.play(param);
 * 依赖： 变量 -> window
 * 依赖： 插件 -> uexLockScreen
 */
(function (window) {
    window.AudioTool = {
        play: function (n) {
            try {
                window.uexLockScreen && uexLockScreen.playAudioFile(n);
            } catch (e) {

            }
        }
    };
})(window);

/**
 * 模块： UserStatus
 * 使用： new UserStatus();
 * 入参： 无
 * 返回： userInfo对象
 * 依赖： window,appcan
 */
(function (window, appcan) {
    window.UserStatus = function () {
        this.isValid = false;
        this.token = '';
        this.enterpriseId = '';
        this.userId = '';
        this.init();
    }
    UserStatus.prototype = {
        constructor: UserStatus,
        init: function () {
            var sToken = appcan.locStorage.getVal("token");
            var sUserBo = appcan.locStorage.getVal("userBo");
            var enterpriseId = sUserBo && JSON.parse(sUserBo).enterpriseId;
            if (sToken && enterpriseId) {
                this.isValid = true;
                this.token = sToken;
                this.enterpriseId = enterpriseId;
                this.userId = JSON.parse(sUserBo).objectId;
                return true;
            }
            alert("您好，您的用户认证信息已失效，请您重新登录!");
            this.isValid = false;
            TrackTool.track("日常巡检认证异常");
            return false;
        },
    };
})(window, appcan);

/**
 * 模块： InspectionTool
 * 使用：
 * 依赖： 变量 ->
 * 依赖： 插件 -> uexLocation uexLockScreen
 */
(function (window) {
    window.InspectionTool = function (oParam) {
        this.isSubmitting = false;
        this.init(oParam);
    };
    InspectionTool.prototype = {
        constructor: InspectionTool,
        init: function (oParam) {
            if (!oParam.enterpriseId || !oParam.userId || !oParam.token) {
                alert('参数错误');
                return;
            }
            this.enterpriseId = oParam.enterpriseId || '';
            //企业ID
            this.userId = oParam.userId || '';
            //用户ID
            this.token = oParam.token || '';
            this.dataBaseName = oParam.dataBaseName || 'ZYXXWSDB1';
            //数据库名称
            this.type = oParam.type || "bd09" //返回坐标类型
        },
        ifVoiceIsOn: function () {
            if (!window.uexLockScreen)
                return false;
            return uexLockScreen.getIsPlayVoice() == 1;
        },
        switchVoiceState: function () {
            if (!window.uexLockScreen)
                return false;
            var isOn = this.ifVoiceIsOn();
            if (isOn) {
                uexLockScreen.setIsPlayVoice(0);
                return false;
            }
            uexLockScreen.setIsPlayVoice(1);
            return true;
        },
        openFreeLocation: function (callback) {
            var that = this;
            if (!window.uexLocation)
                return;
            uexLocation.openLocation("wgs84", 5000);
            //开启定位
            uexLocation.onChange = function (lat, log, bRadio, bType, bSpeed) {
                if (lat < 10 && log < 10)
                    return;
                if (that.type === 'bd09') {
                    var oBaiduPoint = that._GpsToBaidu(lat, log);
                    lat = oBaiduPoint.latitude;
                    log = oBaiduPoint.longitude;
                }
                callback && callback(lat, log, bRadio, bType, bSpeed);
            }
        },
        closeFreeLocation: function () {
            if (!window.uexLocation)
                return;
            uexLocation.closeLocation();
            //关闭定位
            uexLocation.onChange = function () {};
        },
        openInspectionLocation: function (callback) {
            if (!window.uexLockScreen)
                return;
            var param = {
                enterpriseId: this.enterpriseId, //企业ID
                userId: this.userId, //用户ID
                token: this.token,
                dataBaseName: this.dataBaseName, //数据库名称
                type: this.type //返回坐标类型
            };
            uexLockScreen.openLocation(JSON.stringify(param));
            uexLockScreen.onChange = function (lat, lon, speed, distance, timer, satelliteNumber) {
                callback && callback(lat, lon, speed, distance, timer, satelliteNumber);
            };
        },
        closeInspectionLocation: function () {
            if (!window.uexLockScreen)
                return;
            uexLockScreen.closeLocation();
            //关闭定位
            // uexLockScreen.onChange = function() {
            // };
        },
        uploadInspectionRecord: function (fnSuccess, fnFail) {
            var that = this;
            var oRecord = {
                enterpriseId: this.enterpriseId, //企业ID
                userId: this.userId, //用户ID
                token: this.token,
                dataBaseName: this.dataBaseName, //数据库名称
            };
            if (!window.uexLockScreen)
                return;
            this.isSubmitting = true;
            uexLockScreen.submitRecord(JSON.stringify(oRecord));
            uexLockScreen.cbSubmitRecord = function (opId, dataType, data) {
                if (data == 1) {
                    fnSuccess && fnSuccess();
                } else {
                    fnFail && fnFail();
                }
                that.isSubmitting = false;
            }
        },
        deleteInspectionRecord: function (fnSuccess, fnFail) {
            var that = this;
            if (!window.uexLockScreen)
                return;
            var oRecord = {
                enterpriseId: this.enterpriseId, //企业ID
                userId: this.userId, //用户ID
                token: this.token,
                dataBaseName: this.dataBaseName, //数据库名称
            };
            this.isSubmitting = true;
            uexLockScreen.deleteRecordInfo(JSON.stringify(oRecord));
            uexLockScreen.cbDeleteRecordInfo = function (opId, dataType, data) {
                if (data == 1) {
                    fnSuccess && fnSuccess();
                } else {
                    fnFail && fnFail();
                }
                that.isSubmitting = false;
            }
        },
        checkIfInspecting: function () {
            if (!window.uexLockScreen)
                return false;
            return uexLockScreen.checkServerIsRunning() == 1;
        },
        _GpsToBaidu: function (lat, log) {
            var params1 = {
                latitude: lat,
                longitude: log,
                from: "wgs84",
                to: "bd09"
            };
            var data = uexLocation.convertLocation(JSON.stringify(params1));
            //转化成百度坐标
            // {
            //     longitude: 123,
            //     latitude: 123,
            // }
            return JSON.parse(data);
        }
    };
})(window);

(function (window, appcan, InspectionTool, TrackTool, UserStatus, DataBaseOperation, JasDevice, AudioTool) {

    window.operations = {
        oUserStatus: null,
        oInspectionTool: null,
        oStartPoint: null,
        init: function (vueInst) {
            this.vueInst = vueInst;
            this.vueInst.initNodeNum();
            this.oUserStatus = new UserStatus();
            if (!this.oUserStatus.isValid)
                return;
            // * 登录信息报错 --> 建议重启
            var oParam = {
                enterpriseId: this.oUserStatus.enterpriseId, //企业ID
                userId: this.oUserStatus.userId, //用户ID
                token: this.oUserStatus.token,
                dataBaseName: 'ZYXXWSDB1', //数据库名称
                type: "bd09" //返回坐标类型
            };
            //alert("初始化参数："+JSON.stringify(oParam));
            // this.vueInst.initNodeNum();
            this.oInspectionTool = new InspectionTool(oParam);
            this.initInspection();

        },
        initInspection: function () {
            var that = this;
            var dbOperation = new DataBaseOperation();
            //避免整个模块的外部变量引用不清晰，在此处new 对象，属于临时解决方案
            var recordSql = "select * from InsRecordForRB where flag = 0 and enterpriseId='" + this.oUserStatus.enterpriseId + "' and userId='" + this.oUserStatus.userId + "'";
            dbOperation.dbSelect(recordSql, function (err, data) {
                // * 数据库报错   --> 建议重启
                if (err) {
                    alert("尊敬的用户：\r\n通过检测，发现您的应用数据库出现异常，无法进行离线数据存储。解决办法如下：\r\n1.关闭app，结束进程，并清理缓存。\r\n2.重新启动手机。\r\n3.如仍存在问题，请联系客服人员。");
                    TrackTool.track("应用数据库出现异常");
                    return;
                }
                // * 数据库无数据 --> 开始巡检状态
                if (!data || data.length === 0) {
                    that.readyForInspection();
                    return;
                }
                // * 数据库有数据，后台巡检开启 --> 正在巡检状态
                if (that.oInspectionTool.checkIfInspecting()) {
                    //正在巡线，重新回到日常巡检页面
                    var oData = JSON.parse(data[0].postData);
                    that.continueInspection(oData);
                    return;
                }
                // * 数据库有数据，后台巡检关闭 --> 提交或删除巡检记录
                that.handleLocalInspectionRecord();
                return;
            });
        },
        initInspectionState: function () {
            if (this.timer)
                clearInterval(this.timer);
            this.vueInst.initInspectionState();
        },
        readyForInspection: function () {
            var that = this;
            this.judgeGpsStatus();
            this.initInspectionState();
        },
        beforeBeginInspection: function () {
            var that = this;
            JasDevice.getGPSOpenStatus(function (isOpen) {
                if (isOpen) {
                    that.beginInspection();
                    AudioTool.play(2);
                    TrackTool.track("开始巡检");

                } else {
                    //after join voice play
                    AudioTool.play(1);
                    TrackTool.track("点击开始巡检-未开启GPS");
                    appcan.window.confirm({
                        title: 'GPS提示',
                        content: '请您开启GPS，为您提供精准的定位服务。',
                        buttons: ['设置', '取消'],
                        callback: function (err, data, dataType, optId) {
                            if (data == 0) {
                                window.uexDevice && uexDevice.openSetting(JSON.stringify({
                                    setting: "GPS"
                                }));
                            }
                        }
                    });
                };

            });
        },
        beginInspection: function () {
            var that = this;
            this.initInspectionState();
            this.vueInst.isDoing = 1;
            this.vueInst.startTime = (new Date()).Format("yyyy-MM-dd HH:mm:ss");
            this.vueInst.voiceFont = this.oInspectionTool.ifVoiceIsOn() ? 'fa-volume-up' : 'fa-volume-off';
            this.setTimer();
            this.oInspectionTool.openInspectionLocation(function (lat, lon, speed, distance, timer, satelliteNumber) {
                that.vueInst.distance = that._formatDistance(distance);
            });
        },
        continueInspection: function (oData) {
            var that = this;
            //alert('事件个数为' + appcan.locStorage.getVal("RCXJ_EVENT_COUNT"));
            //this.judgeGpsStatus();
            this.initInspectionState();

            this.vueInst.eventNum = appcan.locStorage.getVal("RCXJ_EVENT_COUNT") || 0;
            this.vueInst.isDoing = 1;
            this.vueInst.startTime = new Date(oData.beginTime).Format("yyyy-MM-dd HH:mm:ss");
            this.vueInst.voiceFont = this.oInspectionTool.ifVoiceIsOn() ? 'fa-volume-up' : 'fa-volume-off';

            this.setTimer(new Date(oData.beginTime).getTime());
            this.vueInst.distance = that._formatDistance(oData.distance);
            this.oInspectionTool.openInspectionLocation(function (lat, lon, speed, distance, timer, satelliteNumber) {
                that.vueInst.distance = that._formatDistance(distance);
            });
        },
        setTimer: function (startMillisecond) {
            startMillisecond = startMillisecond || new Date().getTime()
            var that = this;
            if (this.timer)
                clearInterval(this.timer);
            this.timer = setInterval(function () {
                var nowTime = new Date().getTime();
                that.vueInst.millisecond = nowTime - startMillisecond;
            }, 1000);
        },
        judgeGpsStatus: function () {
            JasDevice.getGPSOpenStatus(function (isOpen) {
                if (isOpen)
                    return;
                appcan.window.confirm({
                    title: 'GPS提示',
                    content: '请您开启GPS，为您提供精准的定位服务。',
                    buttons: ['设置', '取消'],
                    callback: function (err, data, dataType, optId) {
                        if (data == 0) {
                            window.uexDevice && uexDevice.openSetting(JSON.stringify({
                                setting: "GPS"
                            }));
                        }
                    }
                });
            });
        },
        handleLocalInspectionRecord: function () {
            var that = this;
            AudioTool.play(8);
            appcan.window.confirm({
                title: '提示',
                content: '您存在上次未处理的巡检记录，是否进行提交？',
                buttons: ['开始提交', '放弃（删除）'],
                callback: function (err, data, dataType, optId) {
                    if (data == 0) {
                        //baseOperation.alertToast('巡检数据处理中，请稍候...', 10000);
                        that.completeInspection();
                        TrackTool.track("历史巡检记录-提交记录");
                    } else {
                        //baseOperation.alertToast('巡检数据删除中，请稍候...', 10000);
                        that.cancelInspection();
                        TrackTool.track("历史巡检记录-放弃记录");
                    }
                }
            });
        },
        requestList: function () {
            console.log(_base.serverURL);
        },
        completeInspection: function () {
            var that = this;
            //AudioTool.play(3);
            baseOperation.alertToast('巡检数据处理中，请稍候...', 60000);
            this.oInspectionTool.closeInspectionLocation();
            this.oInspectionTool.uploadInspectionRecord(function () {
                baseOperation.alertToast("巡检记录提交完成", 3000);
                appcan.locStorage.remove("RCXJ_EVENT_COUNT");
                //that.oInspectionTool.closeInspectionLocation();
                AudioTool.play(9);
                TrackTool.track("完成巡检");
                that.initInspectionState();
                that.initInspection();
            }, function () {
                AudioTool.play(6);
                TrackTool.track("完成巡检-数据提交失败");
                baseOperation.closeToast();
                alert("数据提交失败，请重试！");
            });
        },
        cancelInspection: function () {
            var that = this;
            //AudioTool.play(4);
            baseOperation.alertToast('巡检数据处理中，请稍候...', 60000);
            this.oInspectionTool.closeInspectionLocation();
            this.oInspectionTool.deleteInspectionRecord(function () {
                baseOperation.alertToast("取消巡检记录完成", 3000);
                appcan.locStorage.remove("RCXJ_EVENT_COUNT");
                //that.oInspectionTool.closeInspectionLocation();
                AudioTool.play(10);
                TrackTool.track("取消巡检");
                that.initInspectionState();
                that.initInspection();
            }, function () {
                AudioTool.play(7);
                TrackTool.track("取消巡检-数据提交失败");
                baseOperation.closeToast();
                alert("取消巡检失败，请重试！");
            });
        },
        switchToEventModule: function () {
            var params = {
                model: '1'
            };
            appcan.locStorage.setVal('enterEventModel', params);
            window.uexLocation && uexLocation.closeLocation();
            //关闭gps位置监听
            appcan.window.evaluateScript('index', 'imgChange()');
            appcan.window.close(-1);
            appcan.openWinWithUrl("event_report", "../../event_management/event_report.html");
            TrackTool.track("日常巡检-事件上报");
        },
        _formatDistance: function (meter) {
            var d = Math.floor(meter / 10) / 100;
            var d2 = (d + '').split('.')[1];
            var length = d2 ? d2.length : 0;
            if (length === 0) {
                d = d + '.00';
            } else if (length === 1) {
                d = d + '0';
            }
            return d;
        },
    };

})(window, appcan, InspectionTool, TrackTool, UserStatus, DataBaseOperation, JasDevice, AudioTool);

var vm = new Vue({
    el: "#page_0",
    data: {
        jasHttpRequest: new JasHttpRequest(),
        isDoing: 0,
        voiceFont: '',

        hour: '00',
        minute: '00',
        second: '00',
        millisecond: 0,

        distance: '0.00',
        startTime: '0000-00-00 00:00:00',
        eventNum: 0,
        nodeNumTotal: 0,
        noCheckedArrs: [],
        checkedArrs: [],
        nodeNum: 0,
        isCheckNode: false,
        fromBDPoint: {

        }, //逻辑二
        needCheckNode: [],
    },
    methods: {
        showWarn: function () {
            appcan.window.confirm({
                title: '设置说明',
                content: '尊敬的用户：\n \r \r \r\r 为了您获得更好的使用体验，请进行系统常驻设置：\n \r \r \r\r 方式1：点击个人中心->使用帮助->手机配置，选择对应手机品牌型号，查看设置说明。\n \r \r \r\r 方式2：直接联系技术人员，远程支持，电话130-2003-9083。',
                buttons: ['确定'],
            });
        },
        initInspectionState: function () {
            this.voiceFont = '';
            this.isDoing = 0;
            this.millisecond = 0;
            this.distance = '00.00';
            this.startTime = '0000-00-00 00:00:00';
            this.eventNum = 0;
        },
        switchVoice: function () {
            var isOn = operations.oInspectionTool.switchVoiceState();
            this.voiceFont = isOn ? 'fa-volume-up' : 'fa-volume-off';
        },
        beginCheck: function () {
            appcan.locStorage.remove("RCXJ_EVENT_COUNT");
            //清除上次遗留的事件数量
            operations.beforeBeginInspection();
            vm.initNodeNum();
        },
        uploadEvent: function () {
            if (operations.oInspectionTool.isSubmitting)
                return;
            operations.switchToEventModule();
        },
        complete: function () {
            if (operations.oInspectionTool.isSubmitting)
                return;
            AudioTool.play(11);
            appcan.window.confirm({
                title: '完成巡检',
                content: '是否结束巡检？',
                buttons: ['确定', '取消'],
                callback: function (err, data, dataType, optId) {
                    if (err || data == 1) { //取消或报错
                        return;
                    }
                    if (data == 0) {
                        operations.completeInspection();
                    }
                }
            });
        },
        cancel: function () {
            if (operations.oInspectionTool.isSubmitting)
                return;
            AudioTool.play(12);
            appcan.window.confirm({
                title: '取消巡检',
                content: '是否取消巡检？\r\n该操作将清除已巡查的轨迹和上报事件。',
                buttons: ['确定', '取消'],
                callback: function (err, data, dataType, optId) {
                    if (err || data === 1) { //取消或报错
                        return;
                    }
                    if (data == 0) {
                        operations.cancelInspection();
                    }
                }
            });
        },
        _add0: function (n) {
            if ((n + '').length === 1) {
                return '0' + n;
            }
            return n;
        },
        openMap: function () {
            uexLockScreen.openPipeMap();
        },
        openTodayTrack: function () {
            appcan.openWinWithUrl('routeToday', 'routeToday.html');
        },
        registKey: function () {
            //监听手机物理返回键
            uexWindow.setReportKey(0, 1);
            uexWindow.onKeyPressed = function (keyCode) {
                if (operations.oInspectionTool.isSubmitting) {
                    baseOperation.alertToast('巡检数据正在处理中，请稍候...', 3500);
                    return;
                }
                appcan.window.evaluateScript('index', 'imgChange()');
                appcan.window.evaluatePopoverScript('index', 'index_content', 'refresTasks()');
                appcan.window.close(-1);
            };
        },
        initNodeNum: function () {
            var that = this;
            var userId = JSON.parse(appcan.locStorage.getVal("userBo")).objectId;
            var partURL1 = 'cloudlink-inspection-event/keyPointTask/getKeyPointTaskInfo?userId=' + userId;
            that.needCheckNode = [];
            that.jasHttpRequest.jasHttpGet(partURL1, function (id, state, dbSource) {
                var data = JSON.parse(dbSource);
                if (data.success == 1) {
                    that.nodeNumTotal = data.rows[0].taskCount;
                    that.nodeNum = data.rows[0].checkedTaskCount;
                    data.rows[0].keyPointBoWithTaskList.forEach(function (item) {
                        if (item.uncheckedTaskIdList.length != 0) {
                            that.needCheckNode.push(item);
                        }
                    });
                } else {
                    if (data.code == "GJD002") {
                        //baseOperation.alertToast("今日没有可检查的关键点")
                    } else {
                        baseOperation.alertToast("网络异常，无法获取关键点信息，请稍候再试！")
                    }
                }
            });

        },
        checkedNode: function () {
            var that = this;
            if (that.nodeNumTotal == 0) {
                return;
            }
            // /*1、先检查gps定位是否打开，
            // 2、获取当前位置，对没有检查过的点，进行处理。
            // */
            if (that.isCheckNode) {
                // baseOperation.alertToast("还未提交不可再次点击");
                return;
            }
            that.isCheckNode = !that.isCheckNode;
            uexLocation.openLocation("bd09", 5000);
            //开启定位
            uexLocation.onChange = function (lat, log) {
                that.fromBDPoint = {
                    bdLon: log || '116.361863',
                    bdLat: lat || '39.993921'
                }

                that.getNodeToServer();
            };

        },
        checkNodeToServer: function (obj) {
            var that = this;
            var partURL1 = 'cloudlink-inspection-event/keyPointTask/complete?taskId=' + obj.uncheckedTaskIdList[0];
            that.jasHttpRequest.jasHttpGet(partURL1, function (id, state, dbSource) {
                var data = JSON.parse(dbSource);
                if (data.success == 1) {
                    that.isCheckNode = false;
                    baseOperation.alertToast("打点成功");
                    AudioTool.play(13);
                    that.initNodeNum();
                } else {
                    that.isCheckNode = false;
                    var obj = JSON.parse(data.msg);
                    var nextTime = new Date(obj.lastCheckTime).getTime() + obj.interval * 60 * 60 * 1000;
                    var msg = "【" + obj.keyPointName + "】请于" + new Date(nextTime).Format("HH:mm:ss") + "以后再次进行检查";
                    AudioTool.play(14);
                    baseOperation.alertToast(msg, 4000);
                    return;
                }
            });
        },
        enterList: function () {
            var that = this;
            if (that.nodeNumTotal == 0) {
                return;
            }
            appcan.openWinWithUrl('keyPointList', 'keyPointList.html');
        },
        enterEvent: function () {
            var that = this;
            if (that.eventNum == 0) {
                return;
            }
            appcan.openWinWithUrl("event", "../../event_management/event.html");
        },
        getNodeToServer: function () {
            var that = this;
            var currentNode = [];
            //需要打的点
            var hasCheckNode = [];
            //已经打过点 还没有到时间的
            uexLocation.closeLocation();
            //进行关闭
            that.needCheckNode.forEach(function (item) { //needCheckNode表示所有的点
                if (item.lastCheckTime) {
                    //表示这个点已经打过，需要进行间隔计算是否可以打点。
                    var nextCheck = item.lastCheckTime + item.inspectionInterval * 60 * 60 * 1000;
                    if (nextCheck < new Date().getTime()) {
                        currentNode.push(item);
                    } else {
                        hasCheckNode.push(item)
                    }
                } else {
                    currentNode.push(item);
                }
            });
            //对这些点进行距离计算。优先打点没有打过点并且距离近的。
            that.isCheckNodeToServer(currentNode, hasCheckNode);
        },
        isCheckNodeToServer: function (currentNode, hasCheckNode) {
            var that = this;
            var that = this;
            var currentPointIn = []; //用于存放符合在当前半径内的
            if (currentNode.length > 0) {
                currentPointIn = that.getInRadiursNode(currentNode);
                if (currentPointIn.length == 0 && hasCheckNode.length > 0) {
                    currentPointIn = that.getInRadiursNode(hasCheckNode);
                }
            } else {
                currentPointIn = that.getInRadiursNode(hasCheckNode);
            }
            if (currentPointIn.length == 0) {
                that.isCheckNode = false;
                baseOperation.alertToast("当前附近没有可检查的点！");
                return;
            }
            var mindistance = currentPointIn[0];
            currentPointIn.forEach(function (item, index) {
                if (index > 0 && mindistance.distance1 > item.distance1) {
                    mindistance = item;
                }
            });
            that.checkNodeToServer(mindistance);
        },
        getInRadiursNode: function (arrs) {
            var that = this;
            var s = [];
            arrs.forEach(function (item) {
                //判断是否在范围内，并且计算两者距离
                var toPoint = {
                    bdLon: item.bdLon,
                    bdLat: item.bdLat
                };
                var result = jasMap.bdPointsDistance(that.fromBDPoint, toPoint);
                if (result <= item.effectiveRadius) {
                    item.distance1 = result;
                    s.push(item);
                }
            });
            return s;
        }
    },
    computed: {},
    watch: {
        millisecond: function (newval, oldval) {

            var allSecond = Math.floor(newval / 1000);

            var hour = Math.floor(allSecond / 3600);
            var minute = Math.floor((allSecond - hour * 3600) / 60);
            var second = Math.floor(allSecond - hour * 3600 - minute * 60);

            this.hour = this._add0(hour);
            this.minute = this._add0(minute);
            this.second = this._add0(second);
        },
    },
    mounted: function () { //从后台获取到的数据，进行数据的操作
        var that = this;
        appcan.ready(function () {
            operations.init(that);
            that.registKey();
        });
    },
});