appcan.ready(function() {
    checklistObj.init();
    uexDateRangePicker.cbOpenDateRange = function(opId, dataType, data) {
        var value = JSON.parse(data);
        var s = value.startDate + "~" + value.endDate;
        checklistObj.requestParams.startDate = value.startDate;
        checklistObj.requestParams.endDate = value.endDate;
        appcan.window.evaluateScript('check', 'checkObj.showDate("' + s + '")');
        checklistObj.changePage();
    }
});
(function(appcan, window, Zepto, baseOperation, JasHttpRequest, createTemplateByObj, refreshBounce, creatNumTip) {
    var utils = {
        ifCheckboxAllChecked: function($checkBoxs) {
            if ($checkBoxs.length === 0) {
                return false;
            }
            return $checkBoxs.not('input:checked').length === 0;
        }
    };
    var obj = {
        timeBtnDom: 　$('#dateBtn'), //按钮-可以选择时间范围
        timeShowDom: $('#date'), //展示-显示时间范围
        jasHttpRequest: new JasHttpRequest(),
        mobiScroll: null,
        requestParams: {
            startDate: new Date(new Date().getTime() - 7 * 24 * 3600 * 1000).Format("yyyy-MM-dd"),
            endDate: new Date().Format("yyyy-MM-dd"),
            facilityCheckResult: "",
            isLeakage: "",
            facilityTypeCode: "",
            keyword: "",
            pageNum: 1,
            pageSize: 10
        },
        init: function() {
            this.initTime();
            this.bindEvent();
            this.setBounce();
            this.requestData();
        },
        initTime: function() {
            var s = this.requestParams.startDate + "~" + this.requestParams.endDate;
            appcan.window.evaluateScript('check', 'checkObj.showDate("' + s + '")');
        },
        setBounce: function() {
            var that = this;
            refreshBounce(function() {
                that.requestParams.pageNum = 1;
                that.requestData();
            }, function() {
                that.requestParams.pageNum++;
                that.requestData();
            });
        },
        bindEvent: function() {
            var that = this;
            $('body').on('click', 'ul li', function(e) {
                var t = e.target;
                if ($(t).hasClass('js_check')) {
                    that.setFatherCheckBox();
                    return;
                }
                var type = this.dataset.type;
                var facilityCheckId = this.dataset.id;
                //为新建记录页面存recordId
                appcan.locStorage.val('facilityCheckId', facilityCheckId);
                appcan.openWinWithUrl('facility_check_detail', '../detail_check/facility_check_detail.html');

            });
        },
        requestData: function() {
            var that = this;
            var parturl = "cloudlink-inspection-event/facilityRecord/getPageList";
            baseOperation.londingToast('数据请求中，请稍后...', 99999);
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
                        }else{
                             baseOperation.alertToast('没有更多的检查');
                        }
                       
                    }
                      that.setFatherCheckBox();
                    that.renderItemCount(aData.length, obj.total);
                }
            }, JSON.stringify(that.requestParams));

        },
        render: function(aData) {
            var that = this;
            var s = "";
            aData.forEach(function(item, index, arr) {
                s += that.isChecked(item);
            });
            if (that.requestParams.pageNum === 1) {
                baseOperation.closeToast();
                $("#list_wrapper").html(s);
            } else {
                baseOperation.closeToast();
                $("#list_wrapper").append(s);
            }
        },
        isChecked: function(item) {
            var userBo = JSON.parse(appcan.locStorage.val("userBo"));
            if (userBo.isSysadmin == "1") {
                return createTemplateByObj(item, true); //true表示该条记录是可以进行删除的
            } else if (userBo.objectId == item.createUserId) {
                return createTemplateByObj(item, true); //true表示该条记录是可以进行删除的
            } else {
                return createTemplateByObj(item, false);
            }
        },
        renderItemCount: function(nNow, nTotal) {
            var that = this;
            if (that.requestParams.pageNum === 1) {
                creatNumTip(nNow, nTotal, false, true);
            } else {
                creatNumTip(nNow, nTotal, true, true);
            }
        },
        mobiScrollshow: function() {
            var that=this;
            var selectDate=that.requestParams.startDate;    
            var selectDateEnd=that.requestParams.endDate;
            try {
                var param = {
                    minDate: "", //最小时间
                    maxDate: new Date().Format("yyyy-MM-dd"), //最大时间
                    selectDate:selectDate,
                    selectDateEnd:selectDateEnd,
                }
                uexDateRangePicker.openDateRange(JSON.stringify(param));
            } catch (e) {
                alert(e);
            }
        },
        triggerPipeSearch: function(value) {
            this.requestParams.facilityTypeCode = value;
            this.changePage();
        },
        inputSearch: function(value) {
            this.requestParams.keyword = value;
            
            this.changePage();
        },
        deleteCheck: function() {
            var that = this;
            var arr = [];
            $('input:checked').parents('li').each(function(index) {
                arr.push(this.dataset.id);
            });
            if (arr.length == 0) {
                baseOperation.alertToast("请选择您要删除的设施检查记录!");
                return;
            } else {
                appcan.window.alert({
                    title: "删除",
                    content: "是否删除选择的设施检查记录？",
                    buttons: ['确定', '取消'],
                    callback: function(err, data, dataType, optId) {
                        if (data == 0) {
                            that.deletecheckToService(arr);
                        }
                    }
                });
            }
        },
        deletecheckToService: function(arr) {
            var that = this;
            var delUrl = "cloudlink-inspection-event/facilityRecord/deleteBatch";
            that.jasHttpRequest.jasHttpPost(delUrl, function(id, state, dbSource) {
                if (+dbSource.length === 0) {
                    baseOperation.alertToast("服务异常，请稍后再试...");
                    return;
                }
                var obj = JSON.parse(dbSource);
                if (obj.success == 1) {
                    that.changePage();
                    baseOperation.alertToast("删除成功");
                   
                }
            }, JSON.stringify({ "idList": arr }));
        },
        setCheckBoxIfChecked: function(bool) {
            $('input[type="checkbox"]:not(:disabled)').prop('checked', bool);
        },
        setFatherCheckBox: function() {
            var bool = utils.ifCheckboxAllChecked($('input[type="checkbox"]:not(:disabled)'));
            var length=$('input[type="checkbox"]:not(:disabled)').length;
            appcan.window.evaluateScript('check', 'checkObj.checkedAll(' + bool + ','+length+')');
        },
       changePage : function() {
          this.requestParams.pageNum = 1;
          this.requestData();
        },
    }
    window.checklistObj = obj;
})(appcan, window, Zepto, baseOperation, JasHttpRequest, createTemplateByObj, refreshBounce, creatNumTip);

var em = currentFontSize(document.getElementById('list_wrapper'));