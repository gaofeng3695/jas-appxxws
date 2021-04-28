var bdFillColor = "#092af6"; //正常的速度的颜色（#092af6 蓝色） 超速的线段颜色 （#CC3366 红色）
var freePointForGPS = null;
var freePointForBaidu = null;

var checkObj = {
    userDom: $('#userName'),
    userPhotoDom: $('#userPhoto'),
    deptDom: $('#dept'),
    titileDom: $('#header h1'),
    footerDom: $('#footer'),
    distDom: $('#distance'),
    duraDom: $('#duration'),
    qttyDom: $('#quantity'),
    qttyDomForFacility: $('#facility_quantity'),

    uuid: null, //当前巡检唯一ID，第一次发送ajax填写
    sName: null, //当前巡检名称，第一次发送ajax填写
    beginTime: null, //当前巡检开始时间，第一次发送ajax填写
    endTime: null, //当前巡检结束时间 
    aPointsToBePost: [], //存储要上传的坐标点集合，
    firstPointForBaidu: null, //当前巡检的第一个坐标点（百度坐标）
    lastPointForBaidu: null, //当前巡检的上一个坐标点（百度坐标）
    lastPointForGPS: null, //当前巡检的上一个坐标点（GPS坐标）
    lastGPSPointAddress: '', //当前点的地理位置描述
    lastGPSPointSpeed: 0, //获取当前点的速度
    lastObjID: '',
    nTimesForPostCurrentPoint: 0, //当前坐标的上传次数
    nPoints: 0, //坐标点的个数                   
    nDist: 0, //巡检里程
    nDura: 0, //巡检时长
    nQtty: 0, //事件数量
    nQttyForFacility: 0, //设施检查数量
    timerForBegin: null, //定时器的ID：上传开始信息
    timerForCurrent: null, //定时器的ID：上传当前坐标
    timerForRoute: null, //定时器的ID：上传轨迹信息
    timerForInitGPS: null, //定时器的ID：初始化GPS的延迟
    maxDistancePerSec: 40, //最大巡检速度 40km/h
    intervalForLocation: 1000, // 定位事件间隔,初始化1s，5s之后改为7s
    startButtonEnable: true,
    templateForBegin: {
        title: '日常巡检',
        footer: '<div class="btn ub ub-ac bc-text-head ub-pc bc-btn uc-a1 ub-f1" id="btn1">' +
            '开始巡检' +
            '</div>'
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
    init: function() { //初始化（加载地图、渲染页面）
        var that = this;
        /*
         * 注册窗体异常捕获监听事件
         */
        uexWidgetOne.cbError = function(opCode, errorCode, errorInfo) { //错误异常执行回调
            if (errorCode == "1120111") {

            } else {
                alert("errorCode:" + errorCode + "\nerrorInfo:" + errorInfo);
            }
            //alert("errorCode:" + errorCode + "\nerrorInfo:" + errorInfo);
        };

        if (window.uexBaiduMap) {
            uexBaiduMap.cbOpen = function() {
                if (modelStyle == 0) {
                    zoomFlag = 0;
                    uexLocation.openLocation("wgs84", 5000); //开启定位
                }
            };
        }



        /*
         * 注册GPS坐标改变监听的事件
         */
        uexLocation.onChange = function(lat, log, bRadio, bType, bSpeed) {
            //judgeWifiStatus();
            //当地图坐标还未初始化完成时，不进行处理
            if (lat < 10 && log < 10) {
                return;
            }
            //自由模式
            if (modelStyle == 0) {
                //GPS坐标
                var GPSpoint_free = {
                    'latitude': lat,
                    'longitude': log
                };
                var baiduPoint_free = that.map_GPStoBaidu(lat, log); //获得百度坐标
                uexBaiduMap.removeMakersOverlay('["freepoint"]');
                uexBaiduMap.addMarkersOverlay(JSON.stringify([{
                    id: 'freepoint',
                    longitude: baiduPoint_free.longitude,
                    latitude: baiduPoint_free.latitude,
                    icon: "res://cpf.png"
                }]));
                uexBaiduMap.setCenter(baiduPoint_free.longitude, baiduPoint_free.latitude); //设置中心点
                if (zoomFlag == 0) {
                    zoomFlag = 1;
                    uexBaiduMap.setZoomLevel(15); //500米
                }


                freePointForGPS = JSON.parse(JSON.stringify(GPSpoint_free));
                freePointForBaidu = JSON.parse(JSON.stringify(baiduPoint_free));
                isFreeModelComplete = 1;
                return;
            }


            if (that.nPoints == 0 && freePointForGPS != null && bType != 61) {
                log = freePointForGPS.longitude;
                lat = freePointForGPS.latitude;
                bType = 61;
                bSpeed = 1;
            }

            //过滤A-GPS无效点 发布正式包  释放注释
            if (bType != 61) {
                baseOperation.alertToast("无法获取当前GPS位置。" + "\r\n" + "1.请确认已开启GPS。" + "\r\n" + "2.避免建筑物遮挡。");
                return;
            }

            //当两个点的距离小于等于10m时，不进行处理
            var distance = that.map_calDist(log, lat);
            if (that.nPoints > 0 && distance <= 10) {
                //baseOperation.alertToast("位移偏差较小，不做处理");
                return;
            }
            //移除GPS无效点  发布正式包  释放注释
            if (bType == 61 && bSpeed < 1) {
                //baseOperation.alertToast("当前未移动");
                return;
            }

            //室内wifi过滤  过滤gps点
            //if(that.nPoints > 0 && bType==61 && isWifiFlag==1){
            //baseOperation.alertToast("室内WiFi过滤");
            //return;
            //}

            //当速度大于设定的最大速度时，不作处理
            if (bSpeed > that.maxDistancePerSec) {
                //baseOperation.alertToast("您的时速超过40KM/h，视为无效巡检!");
                bdFillColor = "#CC3366";
            } else {
                bdFillColor = "#092af6";
            }

            //关闭提示
            if (that.nPoints === 0) {
                baseOperation.closeToast();
            }
            /*
             * APP前端显示并渲染
             */
            var GPSpoint = {
                'latitude': lat,
                'longitude': log
            }; //GPS坐标
            var baiduPoint = that.map_GPStoBaidu(lat, log); //获得百度坐标
            that.map_setDist(distance); //更新里程显示
            that.map_markLocation(baiduPoint); //地图展示标记坐标
            that.lastPointForGPS = JSON.parse(JSON.stringify(GPSpoint));
            that.lastPointForBaidu = JSON.parse(JSON.stringify(baiduPoint));
            that.lastGPSPointSpeed = bSpeed.toFixed(2);
            try {
                /*
                 * 调用坐标地址解析服务
                 */
                var params_address = {
                    latitude: lat,
                    longitude: log,
                    type: "wgs84",
                    flag: 1
                };
                /*坐标转地址*/
                uexLocation.getAddressByType(JSON.stringify(params_address));
            } catch (e) {

            }
            /*
             * APP后台上报数据
             */
            var currentPointForPost = { //组装上报服务端的数据信息格式
                "inspRecordId": that.uuid,
                "bdLon": baiduPoint.longitude,
                "bdLat": baiduPoint.latitude,
                "lon": GPSpoint.longitude,
                "lat": GPSpoint.latitude,
                "createTime": new Date().Format("yyyy-MM-dd HH:mm:ss.S")
            };
            //上报数据至本地数据库
            that.saveCurrentPointForDB(currentPointForPost);
        };

        /*坐标转地址回调*/
        uexLocation.cbGetAddress = function(opCode, dataType, data) {
            try {
                var objData = JSON.parse(data);
                that.lastGPSPointAddress = (objData.formatted_address == "" ? "信号差，无法获取地址" : objData.formatted_address);
                if (that.nPoints > 1) {
                    baseOperation.alertToast('当前时速：约' + parseInt(that.lastGPSPointSpeed) + 'KM/h');
                }
            } catch (e) {
                that.lastGPSPointAddress = "信号差，无法获取地址";
                //alert(e)
            }
        };

        /*
         * 页面初始化
         */
        this.renderUser();
        this.render(this.templateForBegin);

        this.bindInitEvent();
        this.loadMap();
    },
    loadMap: function() { //加载地图
        var titHeight = $('#content').offset().top;
        var cHeight = $('#content').offset().height;
        var cWidth = $('#content').offset().width;
        uexBaiduMap.open(0, titHeight, cWidth, cHeight, "116.403357", "39.913662"); //初始化百度地图
    },
    render: function(template) { //渲染页面（头部、底部)，添加底部按钮点击事件
        this.titileDom.html(template.title);
        this.footerDom.html(template.footer);
        if (template === this.templateForBegin) {
            this.bindBeginEvent();
        }
        if (template === this.templateForActive) {
            this.bindActiveEvent();
        }
    },
    renderUser: function() {
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
        //baseOperation.alertToast('获取用户信息错误');
    },
    initCheck: function() {
        /*
         * 初始化开始巡检的数据，渲染数据面板
         */
        this.uuid = null;
        this.sName = null;
        this.beginTime = null;
        this.endTime = null;
        this.aPointsToBePost = [];
        this.firstPointForBaidu = null;
        this.lastPointForBaidu = null;
        this.lastPointForGPS = null;
        this.lastObjID = '';
        this.nPoints = 0;
        this.nDist = 0;
        this.nDura = 0;
        this.nQtty = 0;
        this.nQttyForFacility = 0;
        this.timerForCurrent = null;
        this.timerForBegin = null;
        this.timerForRoute = null;

        this.renderDist();
        this.renderDura();
        this.renderQtty();
        this.renderQttyForFacility();        
    },
    renderDist: function() { //渲染巡检距离
        this.distDom.html(this.nDist + 'm');
    },
    renderDura: function() { //渲染巡检事件 并 记录与上传数据
        var s = this.formatTime(this.nDura);
        this.duraDom.html(s);
    },
    renderQtty: function() { //渲染事件数量
        this.qttyDom.html(this.nQtty);
    },
    renderQttyForFacility: function(){
        this.qttyDomForFacility.html(this.nQttyForFacility);
    },
    setTimerForBegin: function() {
        var that = this;
        clearInterval(this.timerForBegin);
        this.timerForBegin = setInterval(function() {
            that.updateInsRecordForDB(); //定期更新
        }, 59011);
    },
    setTimerForRoute: function() {
        var that = this;
        clearInterval(this.timerForRoute);
        this.timerForRoute = setInterval(function() {
            that.postInsTrajectory();
        }, 76737);
    },
    setTimerForCurrent: function() {
        var that = this;
        clearInterval(this.timerForCurrent);
        this.timerForCurrent = setInterval(function() {
            that.nDura += 1;
            that.renderDura();
            // if (that.nDura >= (that.nTimesForPostCurrentPoint + 1) * 89) {
            // if (that.lastPointForBaidu) {
            // that.postPointForMonitor();
            // }
            // }
        }, 1000);
    },
    formatTime: function(n) { //格式化时间
        var hour = Math.floor(n / 3600),
            minute = Math.floor((n - (3600 * hour)) / 60),
            second = n - 3600 * hour - 60 * minute;
        var add0 = function(n) {
            if (n < 10) {
                return '0' + n;
            }
            return n;
        };

        return add0(hour) + ':' + add0(minute) + ':' + add0(second);
    },
    bindInitEvent: function() { //绑定返回按钮事件
        var that = this;
        appcan.button("#nav-left", "btn-act", function() {
            if (isReferDataComplete == 0) {
                baseOperation.alertToast('巡检数据正在提交中，请稍候...', 3000);
                return;
            }
            that.checkOut();
        });
        //监听手机物理返回键
        uexWindow.setReportKey(0, 1);
        uexWindow.onKeyPressed = function(keyCode) {
            if (isReferDataComplete == 0) {
                baseOperation.alertToast('巡检数据正在提交中，请稍候...', 3000);
                return;
            }
            that.checkOut();
        };
    },
    bindBeginEvent: function() {

        var that = this;

        appcan.button("#btn1", "ani-act", function() {
            //that.beginCheck();
            if (isReferDataComplete == 0) {
                baseOperation.alertToast('巡检数据正在提交中，请稍候...', 3000);
                return;
            }

            if (isFreeModelComplete == 0) {
                baseOperation.alertToast('GPS初始化中，请稍候再试...');
                isFreeModelComplete = 0;
                return;
            }

            if (that.startButtonEnable) {
                /*
                 * 诸葛埋点，记录点击开始巡检的频率
                 */
                if (tjSwitch == 1) {
                    try {
                        var zg_param = {
                            eventName: "点击开始巡检",
                            info: {}
                        };
                        uexTianji.track(zg_param);
                    } catch (e) {}
                }

                that.beginCheck();
                that.startButtonEnable = false;
            }

        });
    },
    bindActiveEvent: function() {
        var that = this;
        //事件上报 注册以下事件
        appcan.button("#btn2", "ani-act", function() {
            that.postEvent(that);
        });
        //设施检查 注册以下事件
        appcan.button("#btn22", "ani-act", function() {
            that.checkFacility(that);
        });        
        //取消巡检 注册以下事件
        appcan.button("#btn3", "ani-act", function() {
            appcan.window.confirm({
                content: '是否取消巡检？\r\n该操作将清除已巡查的轨迹和上报事件。',
                buttons: ['确定', '取消'],
                callback: function(err, data, dataType, optId) {
                    if (err || data === 1) { //取消或报错
                        return;
                    }
                    if (data === 0) { //确定
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
                        that.cancelCheck();
                        that.startButtonEnable = true;
                    }
                }
            });
        });

        //完成巡检 注册以下事件
        appcan.button("#btn4", "ani-act", function() {

            JasDevice.getConnectStatus(function(params) {
                var msgContent = "是否结束巡检？";
                if (params == -1) {
                    msgContent = "是否结束巡检？\r\n（注：由于当前手机网络不佳，程序将本次巡检数据进行离线存储。\r\n等到网络通畅时候，再做处理。）";
                }

                appcan.window.confirm({
                    content: msgContent,
                    buttons: ['确定', '取消'],
                    callback: function(err, data, dataType, optId) {
                        if (err || data === 1) { //取消或报错
                            return;
                        }
                        if (data === 0) { //确定

                            if (tjSwitch == 1) {
                                try {
                                    var zg_param = {
                                        eventName: "点击完成巡检",
                                        info: {}
                                    };
                                    uexTianji.track(zg_param);
                                } catch (e) {}
                            }
                            that.completeCheck();
                            that.startButtonEnable = true;
                        }
                    }
                });
            });
        });
    },
    checkOut: function() { //退出应用
        var that = this;
        if (that.footerDom.text() === '开始巡检') {
            appcan.window.evaluatePopoverScript('index', 'index_content', 'refresTasks()'); //刷新主界面的任务列表
            try {
                uexLocation.closeLocation(); //关闭gps位置监听
                uexBaiduMap.close();
            } catch (e) {

            }
            appcan.window.close(-1);
            return;
        }
        appcan.window.confirm({
            title: '提示',
            content: '您是否要结束本次巡检并上报记录？',
            buttons: ['是', '否'],
            callback: function(err, data, dataType, optId) {
                if (err || data === 1) { //取消或报错
                    return;
                }
                if (data === 0) {
                    if (tjSwitch == 1) {
                        try {
                            var zg_param = {
                                eventName: "点击完成巡检",
                                info: {}
                            };
                            uexTianji.track(zg_param);
                        } catch (e) {}
                    }
                    that.completeCheck();
                    that.startButtonEnable = true;
                    return;
                }
                if (data === 2) {
                    //that.cancelCheck();
                    return;
                }
            }
        });
    },
    beginCheck: function() { //开始巡检

        if (appcan.locStorage.getVal("token") == 'undefined' || appcan.locStorage.getVal("token") == null || appcan.locStorage.getVal("token").length == 0) {
            alert("您好，您的用户认证token失效，请您重新登录!");
            return;
        }

        var that = this;
        if (isFinish == 1) {
            that.reloadMapAndParams();
        }
        setTimeout(function() {
            that.beginCheckSync(); //加载地图                            
        }, 500);
    },
    beginCheckSync: function() {
        var that = this;

        /*切换巡检模式*/
        modelStyle = 1;
        if (window.uexBaiduMap) {
            uexBaiduMap.removeMakersOverlay('["freepoint"]');
        }
        uexLocation.closeLocation(); //关闭gps位置监听      

        isFinish = 0; //0:未结束  1：已结束
        isCancel = 0; //0:未取消  1：已取消
        that.initCheck(); //初始化此次巡检的参数
        that.render(that.templateForActive); //渲染footer

        that.uuid = baseOperation.createuuid(); //创建此次巡检的唯一ID
        that.sName = "RC" + 　new Date().Format("yyyyMMddHHmmss"); //创建此次巡检的名称
        that.beginTime = new Date().Format("yyyy-MM-dd HH:mm:ss.S"); //创建此次巡检的开始时间                    
        that.saveInsRecordForDB(); //将巡检监控记录信息保存到本地

    },
    postInsRecordEnd: function() { //上传结束信息到巡检记录
        var that = this;
        var partURL1 = 'cloudlink-inspection-event/inspection/save';
        var _endTime = new Date().Format("yyyy-MM-dd HH:mm:ss.S");
        var _wholeTime = parseInt((new Date(_endTime) - new Date(this.beginTime)) / 1000);
        var dataObj = {
            "objectId": this.uuid,
            "name": this.sName,
            "beginTime": this.beginTime,
            "endTime": _endTime,
            "wholeTime": this.formatTime(_wholeTime),
            "distance": this.nDist,
            "trackPoints": this.nPoints,
            "flag": "1"
        };
        jasHttpRequest.jasHttpPost(partURL1, function(id, state, dbSource) {
            if (dbSource == "") {
                baseOperation.alertToast('巡线结束：网络繁忙');
            } else {
                var dbObj = JSON.parse(dbSource);
                if (isFinish == 1) {
                    that.postInsTrajectory();
                }
            }
        }, JSON.stringify(dataObj));
    },
    postEvent: function(that) {
        /*
         * enterModel对象类型描述
         * {model:1,bdLon:119.89,bdLat:34.98,gpsLon:119.89,gpsLat:34.98,address:"北京市海淀区南方路38号"}
         *longitude latitude
         */
        if (that.lastPointForGPS != null) {
            // try {
            //     uexBaiduMap.hideMap();
            // } catch (e) {}
            var params = {
                model: '1',
                bdLon: that.lastPointForBaidu.longitude,
                bdLat: that.lastPointForBaidu.latitude,
                gpsLon: that.lastPointForGPS.longitude,
                gpsLat: that.lastPointForGPS.latitude,
                address: that.lastGPSPointAddress,
                inspRecordId: that.uuid
            };
            appcan.locStorage.setVal('enterEventModel', params);
            appcan.openWinWithUrl("event_report", "../event_management/event_report.html");

            if (tjSwitch == 1) {
                try {
                    var zg_param = {
                        eventName: "日常巡检-点击事件上报",
                        info: {}
                    };
                    uexTianji.track(zg_param);
                } catch (e) {}
            }

        } else {
            baseOperation.alertToast("GPS初始化中，请稍候...");
        }
    },
    checkFacility : function(){ 
        var that = this;
            // appcan.locStorage.val('equipmentCheckEntrance','dailyCheck');    
            // appcan.openWinWithUrl('new_check', '../pipe_equipment/new_check/new_check.html');
            // return;
        if (that.lastPointForGPS != null) {
            // try {
            //     uexBaiduMap.hideMap();
            // } catch (e) {}
            var params = {
                model: '1',
                bdLon: that.lastPointForBaidu.longitude,
                bdLat: that.lastPointForBaidu.latitude,
                gpsLon: that.lastPointForGPS.longitude,
                gpsLat: that.lastPointForGPS.latitude,
                address: that.lastGPSPointAddress,
                inspRecordId: that.uuid
            };
            appcan.locStorage.val('equipmentCheckLocaObj', params);
            appcan.locStorage.val('equipmentCheckEntrance','dailyCheck');    
            appcan.openWinWithUrl('new_check', '../pipe_equipment/new_check/new_check.html');                    

            if (tjSwitch == 1) {
                try {
                    var zg_param = {
                        eventName: "日常巡检-点击设施检查",
                        info: {}
                    };
                    uexTianji.track(zg_param);
                } catch (e) {}
            }

        } else {
            baseOperation.alertToast("GPS初始化中，请稍候...");
        }        
          
    },    
    showMap: function(ifReportEvent,ifReportCheck) {
        var that = this;
        if (ifReportEvent === true) { //事件上报成功
            that.nQtty++;
            that.renderQtty();
        }
        if (ifReportCheck === true) { //设施检查上报成功
            that.nQttyForFacility++;
            that.renderQttyForFacility();
        }        
        appcan.locStorage.remove('enterEventModel');
        // try {
        //     uexBaiduMap.showMap();
        // } catch (e) {

        // }
    },
    cancelCheck: function() {

        modelStyle = 0;
        isFreeModelComplete = 0;
        isReferDataComplete = 0;
        freePointForGPS = null;
        var that = this;
        that.render(that.templateForBegin); //更新footer按钮

        clearInterval(that.timerForInitGPS); //清楚定时器
        clearInterval(that.timerForBegin); //清楚定时器
        clearInterval(that.timerForCurrent); //清楚定时器
        clearInterval(that.timerForRoute); //清楚定时器

        that.postCancelInfo(); //上传取消巡检信息

        uexLocation.closeLocation(); //关闭gps位置监听
        uexBaiduMap.close(); //关闭地图
        setTimeout(function() {
            that.loadMap(); //加载地图                            
        }, 300);
        that.initCheck(); //初始化数据      
    },
    completeCheck: function() { //完成巡检执行以下

        baseOperation.alertToast('巡检数据上报中，请稍候...', 15000);
        modelStyle = 0;
        isFreeModelComplete = 0;
        isReferDataComplete = 0;
        freePointForGPS = null;
        isFinish = 1;
        this.render(this.templateForBegin); //更新footer按钮
        clearInterval(this.timerForInitGPS); //清楚定时器
        clearInterval(this.timerForBegin); //清楚定时器
        clearInterval(this.timerForCurrent); //清楚定时器
        clearInterval(this.timerForRoute); //清楚定时器
        //uexLocation.closeLocation(); //关闭gps位置监听 
        this.markPointEnd(this.lastPointForBaidu, this.firstPointForBaidu);
        //this.postInsRecordEnd();
        this.updateInsRecordForDB();
    },
    /*
     * 点击【完成巡检】，等待数据提交完成后
     * 进行地图及参数的重新初始化
     * sf 2016-11-01 12：01
     */
    reloadMapAndParams: function() {
        var that = this;
        uexBaiduMap.close(); //关闭地图
        setTimeout(function() {
            that.loadMap(); //加载地图                            
        }, 300);
    },
    /*
     * 点击【完成巡检】
     * 标注终止点
     */
    markPointEnd: function(obj, obj01) {

        uexBaiduMap.removeMakersOverlay('["cp1"]'); //移除人员显示图标 sf 添加  2016-11-13
        uexBaiduMap.addMarkersOverlay(JSON.stringify([{
            id: 'pointend',
            longitude: obj.longitude,
            latitude: obj.latitude,
            icon: "res://point-end.png"
        }]));
        if (obj01) {
            var lon = (parseFloat(obj.longitude) + parseFloat(obj01.longitude)) / 2;
            var lat = (parseFloat(obj.latitude) + parseFloat(obj01.latitude)) / 2;
            uexBaiduMap.setCenter(lon, lat); //设置中心点            
        }
        uexBaiduMap.setZoomLevel(13); //2000米
    },
    map_GPSopenAndListen: function() {
        /*
         * 监听位置变化，打开gps定位
         */
        var that = this;
        that.setTimerForBegin(); //开启定时器，上传巡检记录信息           
        that.setTimerForRoute(); //开启定时器，上传巡检轨迹信息
        that.setTimerForCurrent(); //开启定时器，上传巡检监控信息 
        uexLocation.openLocation("wgs84", 5000); //开启定位               
    },
    map_initGPS: function() {
        /*
         * 初始化GPS，默认时间1s，5秒后更改为7秒
         * (先逻辑中，此功能暂时不采用)
         */
        var that = this;
        uexLocation.openLocation("wgs84", that.intervalForLocation); //开启定位        
        if (that.timerForInitGPS) {
            clearInterval(that.timerForInitGPS);
        }
        var index = 1;
        that.timerForInitGPS = setInterval(function() {
            ++index;
            if (index === 6) {
                uexLocation.closeLocation(); //关闭gps位置监听                
            }
            if (index > 6) {
                that.intervalForLocation = 5000;
                uexLocation.openLocation("wgs84", that.intervalForLocation); //开启定位 
                that.setTimerForBegin(); //开启定时器，上传巡检记录信息           
                that.setTimerForRoute(); //开启定时器，上传巡检轨迹信息
                that.setTimerForCurrent(); //开启定时器，上传巡检监控信息                  
                clearInterval(that.timerForInitGPS);
            }
        }, 1000);
        baseOperation.alertToast('GPS初始化中，请稍候...', 10000);
    },
    map_GPStoBaidu: function(lat, log) {
        var params1 = {
                latitude: lat,
                longitude: log,
                from: "wgs84",
                to: "bd09"
            },
            data = uexLocation.convertLocation(JSON.stringify(params1)), //转化成百度坐标
            obj = JSON.parse(data); //此时获取到了百度坐标点
        return obj;
    },
    map_markLocation: function(obj) { //标记坐标，画点或划线

        /*
         * 1. 传入当前百度坐标的对象
         * 2. 总坐标点数+1
         * 3. 设置地图中心点，标记坐标，画点 or 划线
         * 4. 设置上一个百度坐标点
         */
        var _lastPointForBaidu = this.lastPointForBaidu;
        this.nPoints += 1; //坐标点数+1
        if (this.nPoints === 1) {
            this.firstPointForBaidu = JSON.parse(JSON.stringify(obj));
        }
        var pointsCount = this.nPoints;
        uexBaiduMap.setCenter(obj.longitude, obj.latitude); //设置中心点
        if (pointsCount <= 1) { //一个点时画点
            uexBaiduMap.addMarkersOverlay(JSON.stringify([{
                id: pointsCount + '',
                longitude: obj.longitude,
                latitude: obj.latitude,
                icon: "res://point-start.png"
            }]));
            uexBaiduMap.setZoomLevel(15); //500米
        } else { //多个点时划线
            uexBaiduMap.addPolylineOverlay({
                id: pointsCount + '',
                fillColor: bdFillColor,
                lineWidth: 8,
                property: [_lastPointForBaidu, obj],
            });
            /*
             * 标注当前人员位置
             * sf 2016-11-13
             */
            var ids = '["cp1"]';
            uexBaiduMap.removeMakersOverlay(ids);
            var datac = [{
                id: "cp1",
                longitude: obj.longitude,
                latitude: obj.latitude,
                icon: "res://online.png"
            }];
            uexBaiduMap.addMarkersOverlay(JSON.stringify(datac));
        }
    },
    map_calDist: function(newLog, newLat) { //计算里程
        var distance = 0;
        if (this.lastPointForGPS) {
            var fromPoint = {
                    lon: this.lastPointForGPS.longitude,
                    lat: this.lastPointForGPS.latitude
                },
                toPoint = {
                    lon: newLog,
                    lat: newLat
                };
            distance = Math.round(jasMap.wgs84PointsDistance(fromPoint, toPoint));
        }
        return distance;
    },
    map_setDist: function(dist) { //前端显示里程
        this.nDist += dist;
        this.renderDist();
    },
    saveInsRecordForDB: function() { //将巡检记录保存到本地数据库
        var that = this;
        var partURL1 = 'cloudlink-inspection-event/inspection/save';
        var dataObj = {
            "objectId": this.uuid,
            "name": this.sName,
            "beginTime": this.beginTime,
            "endTime": new Date().Format("yyyy-MM-dd HH:mm:ss.S"),
            "wholeTime": "00:00:00",
            "distance": "0",
            "flag": "0",
            "bdLon": freePointForBaidu.longitude,
            "bdLat": freePointForBaidu.latitude,
            "lon": freePointForGPS.longitude,
            "lat": freePointForGPS.latitude
        };
        var sql = "insert into InsRecord (localID,recordID,partURL,postdata,flag) values (";
        sql += "'" + new Date().Format("yyyyMMddHHmmssS") + "',";
        sql += "'" + dataObj.objectId + "',";
        sql += "'" + partURL1 + "',";
        sql += "'" + JSON.stringify(dataObj) + "',";
        sql += "0";
        sql += ")";
        dbOperation.dbExec(sql, function(err, data) {
            if (err != null) {
                alert("尊敬的用户：\r\n通过检测，发现您的应用数据库出现异常，无法进行离线数据存储。解决办法如下：\r\n1.关闭app，结束进程，并清理缓存。\r\n2.重新启动手机。\r\n3.如仍存在问题，请联系客服人员。");
                isReferDataComplete = 1;
                that.startButtonEnable = true;
                return;
            }
            if (err == null && data == 0) {
                that.map_GPSopenAndListen();
            }
        });
    },
    updateInsRecordForDB: function() { //更新巡检记录的数据库
        var that = this;
        var _endTime = new Date().Format("yyyy-MM-dd HH:mm:ss.S");
        var _wholeTime = parseInt((new Date(_endTime) - new Date(this.beginTime)) / 1000);
        var dataObj = {
            "objectId": this.uuid,
            "name": this.sName,
            "beginTime": this.beginTime,
            "endTime": _endTime,
            "wholeTime": this.formatTime(_wholeTime),
            "distance": this.nDist,
            "trackPoints": this.nPoints,
            "flag": isFinish,
            "bdLon": this.lastPointForBaidu.longitude,
            "bdLat": this.lastPointForBaidu.latitude,
            "lon": this.lastPointForGPS.longitude,
            "lat": this.lastPointForGPS.latitude
        };
        var sql_update = "update InsRecord set postdata = '" + JSON.stringify(dataObj) + "' where flag = 0 and recordID = '" + this.uuid + "';";
        dbOperation.dbExec(sql_update, function(err, data) {
            if (err == null && data == 0) {
                that.postInsRecord();
            }
        });
    },
    postInsRecord: function() { //上传巡检【记录】信息 sf modify 2016-11-03
        var that = this;
        var recordid = this.uuid;
        var sql = "select * from InsRecord where flag = 0 and recordID = '" + recordid + "';";
        dbOperation.dbSelect(sql, function(err, data) {
            if (err == null && data.length == 1) {
                var recordObj = data[0];
                jasHttpRequest.jasHttpPost(recordObj.partURL, function(id, state, dbSource) {
                    if (state == -1) {
                        baseOperation.alertToast('当前网络异常...', 3500);
                        isReferDataComplete = 1;
                        return;
                    }
                    if (dbSource.length == 0) {
                        baseOperation.alertToast('网络繁忙，请稍候提交...', 3500);
                        isReferDataComplete = 1;
                        return;
                    }
                    if (isFinish == 1) {
                        that.postInsTrajectory();
                    }
                }, recordObj.postdata);
            }
        });
    },
    postInsTrajectory: function() {
        var that = this;
        var recordid = this.uuid;
        var sql1 = "select * from InsTrajectory where flag = 0 and recordID = '" + recordid + "';";
        var partURL1 = "cloudlink-inspection-trajectory/trajectory/saveBatch";
        dbOperation.dbSelect(sql1, function(err, data) {
            if (err == null && data.length > 0) {
                var postData = [];
                var localIDs = "";
                for (var i = 0; i < data.length; i++) {
                    var item = JSON.parse(data[i].postdata);
                    postData.push(item);
                    localIDs += "'" + data[i].localID + "',";
                }
                localIDs = localIDs.substring(0, localIDs.length - 1);
                jasHttpRequest.jasHttpPost(partURL1, function(id, state, dbSource) {
                    if (state == -1) {
                        baseOperation.alertToast('当前网络异常...', 3500);
                        isReferDataComplete = 1;
                        return;
                    }
                    if (dbSource.length == 0) {
                        baseOperation.alertToast('更新巡检轨迹：网络繁忙', 5000);
                        isReferDataComplete = 1;
                        return;
                    }
                    var dbObj = JSON.parse(dbSource);
                    if (dbObj.success == -1 && dbObj.code == "400") {
                        baseOperation.alertToast('更新巡检轨迹异常', 5000);
                        isReferDataComplete = 1;
                        return;
                    }
                    if (dbObj.success == 1) {
                        var sql2 = "update InsTrajectory set flag = 1 where recordID = '" + recordid + "' and localID in (" + localIDs + ");";
                        dbOperation.dbExec(sql2, function(err2, data2) {
                            if (err2 == null && data2 == 0) {
                                if (isFinish == 1) {
                                    /*
                                     *此方法用于点击【完成巡检】执行的事件
                                     */
                                    baseOperation.alertToast('巡检数据上报完成', 3500);
                                    //点击完成巡检数据上报后，更新本地数据库的状态
                                    var sql_end = "update InsRecord set flag = 1 where recordID = '" + that.uuid + "';";
                                    dbOperation.dbExec(sql_end, function(err, data) {
                                        isReferDataComplete = 1;
                                    });

                                    /*
                                     * 清空数据
                                     */
                                    that.aPointsToBePost = []; //存储要上传的坐标点集合，
                                    that.lastPointForBaidu = null; //当前巡检的上一个坐标点（百度坐标）
                                    that.lastPointForGPS = null; //当前巡检的上一个坐标点（GPS坐标）
                                    that.lastObjID = '';
                                    that.nTimesForPostCurrentPoint = 0; //当前坐标的上传次数
                                    that.nPoints = 0; //坐标点的个数      
                                } else {
                                    //baseOperation.alertToast('完成巡检：离线更新巡线轨迹完成');
                                    isReferDataComplete = 1;
                                }
                            }
                        });
                    }
                }, JSON.stringify(postData));
            } else {
                if (isFinish == 1) {
                    baseOperation.alertToast('巡检数据上报完成', 3500);
                    //点击完成巡检数据上报后，更新本地数据库的状态
                    var sql_end = "update InsRecord set flag = 1 where recordID = '" + that.uuid + "';";
                    dbOperation.dbExec(sql_end, function(err, data) {
                        isReferDataComplete = 1;
                    });

                    /*
                     * 清空数据
                     */
                    that.aPointsToBePost = []; //存储要上传的坐标点集合，
                    that.lastPointForBaidu = null; //当前巡检的上一个坐标点（百度坐标）
                    that.lastPointForGPS = null; //当前巡检的上一个坐标点（GPS坐标）
                    that.lastObjID = '';
                    that.nTimesForPostCurrentPoint = 0; //当前坐标的上传次数
                    that.nPoints = 0; //坐标点的个数      
                }
            }
        });
    },
    postPointForMonitor: function() { //上传到巡检监控表
        var that = this;
        var partURL1 = 'cloudlink-inspection-event/inspectionMonitor/saveOrUpdateByRecordId';
        var dataObj = {
            "objectId": that.lastObjID,
            "inspRecordId": that.uuid,
            "bdLon": that.lastPointForBaidu.longitude,
            "bdLat": that.lastPointForBaidu.latitude,
            "lon": that.lastPointForGPS.longitude,
            "lat": that.lastPointForGPS.latitude,
            "distance": that.nDist,
            "duration": that.formatTime(that.nDura)
        };
        jasHttpRequest.jasHttpPost(partURL1, function(id, state, dbSource) {
            if (dbSource == "") {
                baseOperation.alertToast('巡检状态：网络繁忙');
            } else {
                //baseOperation.alertToast('巡检状态：更新状态完成');
                that.lastObjID = JSON.parse(dbSource).rows[0].monitorId;
                if (isFinish == 1) {
                    baseOperation.alertToast('巡检数据上报完成');
                    //点击完成巡检数据上报后，更新本地数据库的状态
                    var sql_end = "update InsRecord set flag = 1 where recordID = '" + that.uuid + "';";
                    dbOperation.dbExec(sql_end, function(err, data) {});

                    /*
                     * 清空数据
                     */
                    that.aPointsToBePost = []; //存储要上传的坐标点集合，
                    that.lastPointForBaidu = null; //当前巡检的上一个坐标点（百度坐标）
                    that.lastPointForGPS = null; //当前巡检的上一个坐标点（GPS坐标）
                    that.lastObjID = '';
                    that.nTimesForPostCurrentPoint = 0; //当前坐标的上传次数
                    that.nPoints = 0; //坐标点的个数              
                }
            }

        }, JSON.stringify(dataObj));
        this.nTimesForPostCurrentPoint += 1;
    },
    saveCurrentPointForDB: function(obj) { //将当前巡检点(轨迹)上传到本地数据库
        var partURL = "cloudlink-inspection-trajectory/trajectory/saveBatch";
        var sql = "insert into InsTrajectory (localID,recordID,partURL,postdata,flag) values (";
        sql += "'" + new Date().Format("yyyyMMddHHmmssS") + "',";
        sql += "'" + obj.inspRecordId + "',";
        sql += "'" + partURL + "',";
        sql += "'" + JSON.stringify(obj) + "',";
        sql += "0";
        sql += ")";
        dbOperation.dbExec(sql, function(err, date) {
            if (err == null && date == 0) {
                //baseOperation.alertToast('巡检轨迹：离线存储成功');
            } else {
                //baseOperation.alertToast('当前巡检点(轨迹)存入数据库失败');
            }
        });
    },
    postCancelInfo: function() {
        var partURL = 'cloudlink-inspection-event/inspectionRecord/delete';
        var dataObj = {
            "objectId": this.uuid
        };
        jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
            if (state == -1) {
                baseOperation.alertToast('当前网络异常，请您稍后处理...', 3500);
                isReferDataComplete = 1;
                return;
            }
            if (dbSource == "") {
                baseOperation.alertToast('取消巡检 ：网络繁忙');
            } else {
                baseOperation.alertToast('取消巡检 ：取消完成');
            }
            isReferDataComplete = 1;
            removeLocalDBSourceForCancelIns(dataObj.objectId);
        }, JSON.stringify(dataObj));
    }
};

var jasHttpRequest = null; //ajax操作对象
var dbOperation = null; //数据库db操作的对象
var modelStyle = 0; //0：自由模式  1：巡检模式
var isFinish = 0; //0:未结束  1：已结束
var isCancel = 0; //0:未取消  1：已取消
var zoomFlag = 0;
var isWifiFlag = 0;
var isFreeModelComplete = 0; //0:自由模式下，初始化未完成     1：自由模式下，初始化已完成
var isReferDataComplete = 1; //0:上传数据未完成  1：上传数据已完成
appcan.ready(function() {
    jasHttpRequest = new JasHttpRequest();
    dbOperation = new DataBaseOperation();
    //judgeWifiStatus();
    judgeGpsStatus();
    checkObj.init();
});

function judgeWifiStatus() {
    JasDevice.getConnectStatus(function(params) {
        isWifiFlag = (params == 0 ? 1 : 0);
    });
}

function judgeGpsStatus() {
    JasDevice.getGPSOpenStatus(function(params) {
        if (params == false) {
            appcan.window.confirm({
                title: 'GPS提示',
                content: '请您开启GPS，为您提供精准的定位服务。',
                buttons: ['设置', '取消'],
                callback: function(err, data, dataType, optId) {
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
