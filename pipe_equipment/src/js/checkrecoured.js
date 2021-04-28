appcan.ready(function() {
    checkHistoryRecord.init();
    uexDateRangePicker.cbOpenDateRange = function(opId, dataType, data) {
        var value = JSON.parse(data);
        var s = value.startDate + "~" + value.endDate;
        checkHistoryRecord.requestParams.startDate = value.startDate;
        checkHistoryRecord.requestParams.endDate = value.endDate;
        appcan.window.evaluateScript('checkrecoured', 'chooseTime("' + s + '")');
        checkHistoryRecord.changePage();
    }
});
(function(appcan, window, $, baseOperation, JasHttpRequest, checkrecordTemplate, refreshBounce) {
    var obj = {
        jasHttpRequest : new JasHttpRequest(),
        equipmentObj : JSON.parse(appcan.locStorage.val('equipmentSelectedObjs')),
        mobiScroll : null,
        requestParams : {
            startDate : new Date(new Date().getTime() - 7 * 24 * 3600 * 1000).Format("yyyy-MM-dd"),
            endDate : new Date().Format("yyyy-MM-dd"),
            facilityCheckResult : "",
            isLeakage : "",
            facilityTypeCode : "",
            facilityId : "",
            keyword : "",
            pageNum : 1,
            pageSize : 10
        },
        init : function() {

            this.requestData();
            this.setBounce();
            this.initTime();
            this.bindEvent();
        },
        initTime : function() {
            var s = this.requestParams.startDate + "~" + this.requestParams.endDate;
            appcan.window.evaluateScript('checkrecoured', 'chooseTime("' + s + '")');
        },
        dateTimeShow : function() {
            try {
                var param = {
                    minDate : "", //最小时间
                    maxDate : new Date().Format("yyyy-MM-dd"), //最大时间
                    selectDate : this.requestParams.startDate,
                    selectDateEnd : this.requestParams.endDate,
                }
                uexDateRangePicker.openDateRange(JSON.stringify(param));
            } catch (e) {
                alert(e);
            }
        },
        setBounce : function() {
            var that = this;
            refreshBounce(function() {
                that.requestParams.pageNum = 1;
                that.requestData();
            }, function() {
                that.requestParams.pageNum++;
                that.requestData();
            });
        },
        requestData : function() {
            var that = this;
            var parturl = "cloudlink-inspection-event/facilityRecord/getPageList";
            baseOperation.londingToast('数据请求中，请稍后...', 99999);
            that.requestParams.facilityId = that.equipmentObj.objectId;
            that.jasHttpRequest.jasHttpPost(parturl, function(id, state, dbSource) {
                if (+dbSource.length === 0) {
                    baseOperation.alertToast("服务异常，请稍后再试...");
                    return;
                }
                var obj = JSON.parse(dbSource);
                if (obj.success == 1) {
                    var aData = obj.rows;
                    if (aData.length > 0) {
                        that.render(aData);
                    } else {
                        baseOperation.closeToast();
                        if (that.requestParams.pageNum === 1) {
                            $("#list_wrapper").html('<div class="ub ub-pc uinn ulev30 clr666">暂无数据</div>');
                        } else {
                            baseOperation.alertToast('没有更多数据');
                        }

                    }
                    that.renderItemCount(aData.length, obj.total);
                }
            }, JSON.stringify(that.requestParams));
        },
        render : function(aData) {
            var that = this;
            var s = "";
            var type = that.equipmentObj.facilityTypeCode;
            //设施类型
            aData.forEach(function(item, index, arr) {
                s += checkrecordTemplate.createTemplateByObj(item, type);
            });
            if (that.requestParams.pageNum === 1) {
                baseOperation.closeToast();
                $("#list_wrapper").html(s);
            } else {
                baseOperation.closeToast();
                $("#list_wrapper").append(s);
            }
        },
        renderItemCount : function(nNow, nTotal) {
            var that = this;
            if (that.requestParams.pageNum === 1) {
                creatNumTip(nNow, nTotal, false, false);
            } else {
                creatNumTip(nNow, nTotal, true, false);
            }
        },
        triggerPipeSearch : function(value) {
            this.requestParams.facilityCheckResult = value;
            this.changePage();
        },
        inputSearch : function(value) {
            this.requestParams.keyword = value;
            this.changePage();
        },
        bindEvent : function() {//进行点击一行，进行该检查信息查看
            $('body').on('click', 'ul li', function(e) {

                var facilityCheckId = this.dataset.id;
                // alert(facilityCheckId);
                //为新建记录页面存recordId
                appcan.locStorage.val('facilityCheckId', facilityCheckId);
                appcan.openWinWithUrl('facility_check_detail', '../detail_check/facility_check_detail.html');

            });
        },
        changePage : function() {
            this.requestParams.pageNum = 1;
            this.requestData();
        },
    };
    window.checkHistoryRecord = obj;
})(appcan, window, Zepto, baseOperation, JasHttpRequest, checkrecordTemplate, refreshBounce);
var em = currentFontSize(document.getElementById('list_wrapper'));
