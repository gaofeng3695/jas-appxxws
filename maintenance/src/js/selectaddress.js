appcan.ready(function() {
    userAddressObj.init();
});

(function(appcan, window, $, baseOperation, refreshBounce, creatNumTip, JasHttpRequest) {
    var util = {
        isInArray : function(sValue, arr) {
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
            planId : "",
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

            this.setBounce();
        },

        requestData : function() {//请求所有的用户列表数据
            var that = this;
            baseOperation.alertToast("数据请求中，请稍候...", 99999);
            var url = 'cloudlink-inspection-event/commonData/userArchive/getPageList'; 
            that.jasHttpRequest.jasHttpPost(url, function(id, status, dbSource) {
                if (dbSource == "") {
                    baseOperation.alertToast("网络繁忙，请稍候再试");
                    return;
                }
                baseOperation.closeToast();
                if (JSON.parse(dbSource).success == 1) {
                    var aData = JSON.parse(dbSource).rows;
                    if (aData.length > 0) {
                        that.renderPage(aData);
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
                s += homeTemplate(item);
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
        selectaddress : function(sRegionId, community) {               
            this.queryObj.regionId = sRegionId;
            this.queryObj.residential = community;
            this.changePage();
        },
        changePage : function() {
            this.queryObj.pageNum = 1;
            this.requestData();
        },
        getAddress : function() {
            //选择选中的设施
            if ($("input[type='radio']:checked").length == 0) {
                baseOperation.alertToast("请选择一个用户");
            } else {
                var obj = $("input[type='radio']:checked")[0].dataset.obj;
                appcan.locStorage.remove("equipmentSelectedObjs");
                appcan.locStorage.val("equipmentSelectedObjs", obj);
                appcan.window.evaluateScript('selectaddress', 'appcan.window.close(-1)');
            }
        }
    };
    window.userAddressObj = obj;
})(appcan, window, Zepto, baseOperation, refreshBounce, creatNumTip, JasHttpRequest);

