var index = new Vue({
    el: ".point_list",
    data: function () {
        return {
            jasHttpRequest: new JasHttpRequest(),
            keyword: "", //列表搜索
            allTaskArrs: [],
            userId: JSON.parse(appcan.locStorage.getVal("userBo")).objectId,
            total: 0,
            taskNum: 0,
            nodeNum: 0,
            fromBDPoint: {}
        }
    },
    mounted: function () {
        var that = this;
        appcan.ready(function () {
            uexLocation.openLocation("bd09", 5000);
            uexLocation.onChange = function (lat, log) {
                that.fromBDPoint = {
                    bdLon: log,
                    bdLat: lat
                };
                if (that.fromBDPoint.bdLon) {
                    that.requestList();
                }
            };
        });
    },
    methods: {
        requestList: function () {
            var that = this;
            that.allTaskArrs = [];
            var partURL1 = 'cloudlink-inspection-event/keyPointTask/getKeyPointTaskInfo?userId='+that.userId+"&keyword="+that.keyword ;
            // appcan.logs(partURL1);
            that.jasHttpRequest.jasHttpGet(partURL1, function (id, state, dbSource) {
                 // appcan.logs(dbSource);
                var data = JSON.parse(dbSource);
                if (data.success == 1) {
                   uexLocation.closeLocation(); //进行关闭    
                   that.nodeNum = data.rows[0].keyPointBoWithTaskList.length;
                   that.groupByPoint(data.rows[0]);
                } else {
                    if (data.code == "GJD002") {
                        baseOperation.alertToast("今日没有可检查的关键点")
                    } else {
                        baseOperation.alertToast("网络异常，请稍候尝试")
                    }
                }
            });
        },
        groupByPoint: function (data) {
            var that = this;
            var taskPointArrs = [];
            that.total = data.taskCount;
            that.taskNum = data.checkedTaskCount;
            data.keyPointBoWithTaskList.forEach(function (item, index) {
                var s = 0;
                //已知上次打点时间 间隔
                var toPoint = {
                    bdLon: item.bdLon,
                    bdLat: item.bdLat
                };
                var distance = jasMap.bdPointsDistance(that.fromBDPoint, toPoint);
                item.isCheckCount1 = item.taskCount - item.uncheckedTaskIdList.length; //已经巡检
                item.leaveCount = item.uncheckedTaskIdList.length; //剩余次数
                item.lastCheckTime = item.lastCheckTime ? new Date(item.lastCheckTime).Format("HH:mm:ss") : ""; //上次检查时间
                item.distance = distance;
                item.checkStatus = item.uncheckedTaskIdList.length == 0 ? 1 : 0;
                taskPointArrs.push(item);
            });
            taskPointArrs.sort(that.compare('distance'));
            var noCheckArrs = [];
            var CheckArrs = [];
            taskPointArrs.forEach(function (item) {
                item.distance = item.distance.toFixed(2);
                if (item.distance < 1000) {
                    item.distance = item.distance + "m";
                } else {
                    item.distance = (item.distance / 1000).toFixed(2) + "Km";
                }
                if (item.leaveCount == 0) {
                    CheckArrs.push(item);
                } else {
                    noCheckArrs.push(item);
                }
            });
            that.allTaskArrs = noCheckArrs.concat(CheckArrs);
            var s = that.total + "," + that.nodeNum + "," + that.taskNum;
            appcan.window.evaluateScript('keyPointList', 'index.refresh("' + s + '")');
        },
        compare: function (property) {
            return function (a, b) {
                var value1 = a[property];
                var value2 = b[property];
                return value1 - value2;
            }
        },
        // console.log(arr.sort(compare('age')))
        dosearchFrom: function (keyword) {
            var that = this;
            that.keyword = keyword;
            that.requestList();
        },
        getNode: function (item) {
            var that = this;
            if (item.nextCheckTime) {
                baseOperation.alertToast("请到" + item.nextCheckTime + "后再检查")
                return;
            }
            //进行打点 首先获取位置 看是否在附近
            uexLocation.openLocation("bd09", 5000);
            //开启定位
            uexLocation.onChange = function (lat, log) {
                var fromBDPoint = {
                    bdLon: log || '116.361863',
                    bdLat: lat || '39.993921'
                };
                var toPoint = {
                    bdLon: item.keyPointBo.bdLon,
                    bdLat: item.keyPointBo.bdLat
                };
                var result = jasMap.bdPointsDistance(fromBDPoint, toPoint);
                if (result <= item.keyPointBo.effectiveRadius) {
                    that.getNodeToServer(item);
                } else {
                    baseOperation.alertToast("您没有检测到该点");
                    uexLocation.closeLocation();
                    //进行关闭
                    return;
                }
            };
        },
        getNodeToServer: function (item) {
            var that = this;
            uexLocation.closeLocation();
            //进行关闭
            var partURL1 = 'cloudlink-inspection-event/keyPointTask/complete?taskId=' + obj.objectId;
            that.jasHttpRequest.jasHttpGet(partURL1, function (id, state, dbSource) {
                var data = JSON.parse(dbSource);
                if (data.success == 1) {
                    that.requestList();
                } else {
                    baseOperation.alertToast("没有发现该点");
                    return;
                }
            });
        }
    }
});