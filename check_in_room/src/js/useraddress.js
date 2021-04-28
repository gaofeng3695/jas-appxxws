appcan.ready(function() {
    userAddressObj.init();
});
// window.onerror = function(msg, url, line) {
// alert("erro" + msg + "\n" + url + ":" + line);
// return true;
// };
(function(appcan, window, $, baseOperation, refreshBounce, creatNumTip, JasHttpRequest) {
    var util = {
        isInArray : function(sValue,arr){
            for (var i = 0; i < arr.length; i++) {
                if (sValue === arr[i].groupId) {
                    return true;
                }
            }
            return false;
        }
    };
    var obj = {
        queryObj : {
            regionId : "",
            residential : "",
            keyword : "",
            planId:appcan.locStorage.val("planId"),
            pageNum : 1,
            pageSize : 10,
        },
        ele : {
            listwrapper : "#list_wrapper",
        },
        initElem : function() {
            var eles = this.ele;
            for (var name in eles) {
                if (eles.hasOwnProperty(name)) {
                    this[name] = $(eles[name]);
                }
            }
        },
        jasHttpRequest : new JasHttpRequest(),
        init : function() {
            this.initElem();
            this.requestData();
            this.bindEvent();
            this.setBounce();
        },
        requestUserHasRecordInLocal : function(callback){ //查询本地已检查用户
            var that = this;
            var planId = that.queryObj.planId;
            // if (that.aUsersLocal) { //开关，只查找一次本地数据
            //     //alert(JSON.stringify(that.aUsersLocal))
            //     return callback &&　callback(that.aUsersLocal);
            // }
            queryOfflineGroupId(planId,function(obj){
                that.aUsersLocal = obj.data;
                //alert(')))'+JSON.stringify(that.aUsersLocal))
                return callback &&　callback(that.aUsersLocal);
            });
        },
        requestData : function() {//请求所有的用户列表数据
            var that = this;
            baseOperation.alertToast("数据请求中，请稍候...", 99999);
            // alert(JSON.stringify(that.queryObj));
            var url = 'cloudlink-inspection-event/commonData/userArchiveNotHaveCheckRecord/getPageList';
            that.jasHttpRequest.jasHttpPost(url, function(id, status, dbSource) {
                if (dbSource == "") {
                    baseOperation.alertToast("网络繁忙，请稍候再试");
                    return;
                }
                baseOperation.closeToast();
                if (JSON.parse(dbSource).success == 1) {
                    var aData = JSON.parse(dbSource).rows;
                    if (aData.length > 0) {
                        that.requestUserHasRecordInLocal(function(arr){
                            aData.forEach(function(value){
                                if (util.isInArray(value.objectId,arr)) {
                                    value.isHasRecordLocal = true;
                                }else{
                                    value.isHasRecordLocal = false;
                                }
                            });
                            //alert(JSON.stringify(aData))
                            that.renderPage(aData);
                        });
                    } else {
                        if (that.queryObj.pageNum == 1) {
                            that.listwrapper.html('<div class="ub ub-pc uinn ulev30 clr666">暂无数据</div>');
                        }
                        baseOperation.alertToast('暂无数据');
                    }
                    that.renderItemCount(aData.length, JSON.parse(dbSource).total);
                } else {
                    baseOperation.alertToast("网络繁忙，请稍候再试");
                    return;
                }
            }, JSON.stringify(that.queryObj));
        },
        renderPage : function(userData) {
            var s = '';
            userData.forEach(function(item, index, arr) {
                s += createTemplateByObj(item);
            });
            if (this.queryObj.pageNum == 1) {
                this.listwrapper.html(s);
            } else {
                this.listwrapper.append(s);
            }
        },
        renderItemCount : function(nNow, nTotal) {
            var that = this;
            if (that.queryObj.pageNum === 1) {
                creatNumTip(nNow, nTotal, false, false);
            } else {
                creatNumTip(nNow, nTotal, true, false);
            }
        },
        bindEvent : function() {
            var that = this;
            $('body').on('click', 'ul li', function(e) {
                var t = e.target;
                //进行获取当前点击的用户信息，然后针对新建检查进行页面的渲染
                 var id = this.dataset.id;
                 appcan.locStorage.val('userFileId',id);
                appcan.locStorage.val('recordEntrance', 'new');
                //从用户地址列表进入
                appcan.openWinWithUrl('new_record', '../new_record/new_record.html');
            });

        },
        setBounce : function() {
            var that = this;
            refreshBounce(function() {
                that.queryObj.pageNum = 1;
                that.requestData();
            }, function() {
                that.queryObj.pageNum++;
                that.requestData();
            });
        },
        searchAddress : function(value) {
            this.queryObj.keyword = value;
            this.changePage();
        },
        selectRegion : function(regionId) {
            this.queryObj.regionId = regionId;
            this.changePage();
        },
        selectcommunity : function(sRegionId, community) {
            this.queryObj.regionId = sRegionId;
            this.queryObj.residential = community;
            this.changePage();
        },
        changePage : function() {
            this.queryObj.pageNum = 1;
            this.requestData();
        },
        // refersh : function() {
        // var obj = {
        // regionId : "",
        // residential : "",
        // keyword : "",
        // pageNum : 1,
        // pageSize : 10,
        // };
        // $.extend(this.queryObj, obj);
        // this.requestData();
        // },
        callUser : function(tel) {//点击手机号码，进行拨打该用户电话
            uexCall.dial(tel);
        }
    };
    window.userAddressObj = obj;
})(appcan, window, Zepto, baseOperation, refreshBounce, creatNumTip, JasHttpRequest);

var aData = [{
    'objectId' : '61098726351982-09272222222',
    'userFileCode' : 'ertyuiop',
    'regionName' : '二里庄三点村',
    'residential' : '北京市还  ',
    'biulding' : 'A座',
    'unit' : '12单元',
    'room' : '1209',
    'contactUser' : '测试测试测试测试测试测试测试测试测试测试测试测试测试',
    'contactPhone' : '17600195639',
    'isHasRecordLocal' : true
}, {
    'objectId' : '61098726351982-09272222222',
    'userFileCode' : 'ertyuiop',
    'regionName' : '二里庄三点村',
    'residential' : '北京市还前去学院路30号科大天工大事',
    'biulding' : 'A座',
    'unit' : '',
    'room' : '1209',
    'contactUser' : 'daixuan',
    'contactPhone' : '18792705417'
}, {
    'objectId' : '61098726351982-09272222222',
    'userFileCode' : 'ertyuiop',
    'regionName' : '二里庄三点村',
    'residential' : '北京市还前去学院路30号科大天工大事',
    'biulding' : '',
    'unit' : '12单元',
    'room' : '1209',
    'contactUser' : 'daixuan',
    'contactPhone' : '17600195627'
}]
