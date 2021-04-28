appcan.ready(function() {
    checkunupObj.init();
    uexDateRangePicker.cbOpenDateRange = function(opId, dataType, data) {
        var value = JSON.parse(data);
        var s = value.startDate + "~" + value.endDate;
        checkunupObj.requestParams.startTime = value.startDate;
        checkunupObj.requestParams.endTime = value.endDate;
        appcan.window.evaluateScript('check', 'checkObj.showunUpDate("' + s + '")');
        checkunupObj.requestData();
    }
});
(function(appcan, window, Zepto, baseOperation, JasHttpRequest, createTemplateByObj, getOfflineFacilityRecordList, deleteOfflineFacilityRecord,uploadObj) {
    var utils = {
        ifCheckboxAllChecked: function($checkBoxs) {
            if ($checkBoxs.length === 0) {
                return false;
            }
            return $checkBoxs.not('input:checked').length === 0;
        }
    };
    var obj = {
        mobiScroll: null,
        recourIdArray: [],
        recourIdNum: 0,
        deleteRecorId: [],
        currentCheckedRecourId:"",
        requestParams: {
            startTime: new Date(new Date().getTime() - 7 * 24 * 3600 * 1000).Format("yyyy-MM-dd"),
            endTime: new Date().Format("yyyy-MM-dd"),
            facilityTypeCode: "",
            queryParam: ""
        },
        init: function() {
            this.bindEvent();
            this.initTime();
            this.requestData();
        },
        initTime: function() {
            var s = this.requestParams.startTime + "~" + this.requestParams.endTime;
            appcan.window.evaluateScript('check', 'checkObj.showunUpDate("' + s + '")');
        },
        bindEvent: function() {
            var that = this;
            $('body').on('click', 'ul li', function(e) {
                var t = e.target;
                if ($(t).hasClass('js_check')) {
                    that.setFatherCheckBox();
                    return;
                }
                appcan.locStorage.val('facilityCheckId', this.dataset.id);
                appcan.locStorage.val('equipmentCheckEntrance', 'local') // 设施检查表单入口 'new' , ''
                appcan.openWinWithUrl('new_check', '../new_check/new_check.html');

            });
        },
        requestData: function() {
            baseOperation.londingToast('数据请求中，请稍后...', 99999);
            var that = this;
            getOfflineFacilityRecordList(that.requestParams, function(result) {
                if (result.success == 1) {
                    var aData = result.data;
                    if (aData.length > 0) {
                        that.render(aData);
                    } else {
                        baseOperation.closeToast();
                        $("#list_wrapper").html('<div class="ub ub-pc uinn ulev30 clr666">暂无数据</div>');
                    }
                }
                that.setFatherCheckBox();
                creatNumTip(aData.length, aData.length, 0, 1);
            });
        },
        render: function(data) {
            var s = "";
            var that = this;
            $("#list_wrapper").html("");
            data.forEach(function(item, index, arr) {
                s += createTemplateByObj(item, true);
            });
            baseOperation.closeToast();
            $("#list_wrapper").append(s);
        },
        mobiScrollshow: function() {
            var that=this;
            try {
                var param = {
                    minDate: "", //最小时间
                    maxDate: new Date().Format("yyyy-MM-dd"), //最大时间
                    selectDate:that.requestParams.startTime,
                    selectDateEnd:that.requestParams.endTime,
                }
                uexDateRangePicker.openDateRange(JSON.stringify(param));
            } catch (e) {
                alert(e);
            }
        },
        setCheckBoxIfChecked: function(bool) {
            $('input[type="checkbox"]').prop('checked', bool);
        },
        setFatherCheckBox: function() {
            var bool = utils.ifCheckboxAllChecked($('input[type="checkbox"]'));
            appcan.window.evaluateScript('check', 'checkObj.unupcheckAll(' + bool + ')');
        },
        triggerPipeSearch: function(value) {

            this.requestParams.facilityTypeCode = value;
            this.requestData();

        },
        inputSearch: function(value) {
            this.requestParams.queryParam = value;
            this.requestData();

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
                            deleteOfflineFacilityRecord(arr, function(result) {
                                if (result.success == 1) {
                                    that.requestData();
                                } else {
                                    baseOperation.alertToast("删除失败，请稍候尝试!");
                                }
                            });
                        }
                    }
                });
            }
        },
        uploadRecordsToService: function() {
            var that = this;
            that.recourIdArray = [];
            that.recourIdNum = 0;
            that.deleteRecorId = [];
            $('input:checked').parents('li').each(function(index) {
                that.recourIdArray.push(this.dataset.id);
            });
            that.selectDataByRecordId();
        },
        selectDataByRecordId: function() { //根据记录Id获取所有的数据
            var that = this;
            if (!that.recourIdArray.length) {
                baseOperation.alertToast("请选择您要提交的设施检查记录!");
                appcan.window.evaluateScript('check', 'checkObj.isPostReady = true');
                return;
            }
            if (that.recourIdNum < that.recourIdArray.length) {
                that.currentCheckedRecourId = that.recourIdArray[that.recourIdNum];
                that.uploadDataToService();
            } else {
                appcan.window.evaluateScript('check', 'checkObj.isPostReady = true');
                that.deleteRecordFromDraf();
                var nDel = that.deleteRecorId.length;
                var nAll = that.recourIdArray.length;
                if (nDel === nAll) {
                    baseOperation.alertToast("提交成功", 2000);
                } else {
                    baseOperation.alertToast("成功提交" + nDel + '条记录，' + (nAll - nDel) + '条记录未提交成功，请重试', 4000);
                }
            }
        },
        uploadDataToService: function() {
            var that = this;
            selectOfflineFacilityRecord(that.currentCheckedRecourId, function(result) { //查询安检记录的详情
                if (result.success == 1) {
                    /*直接传入所有的记录信息进行保存*/
                    baseOperation.londingToast("正在提交第" + (that.recourIdNum + 1) + '条记录', 99999);
                    uploadObj.uploadRecordByBO(result.data, function() {
                        that.recourIdNum = that.recourIdNum + 1;
                        that.deleteRecorId.push(that.currentCheckedRecourId);
                        that.selectDataByRecordId();
                    }, function() {
                        that.recourIdNum = that.recourIdNum + 1;
                        that.selectDataByRecordId();
                        baseOperation.alertToast("本次记录提交失败");
                    }, true);
                } else {
                    baseOperation.alertToast("提交失败");
                }
            });
        },
        deleteRecordFromDraf: function() {
            var that = this;
            deleteOfflineFacilityRecord(that.deleteRecorId, function() {
                that.requestData();
            });
        },
    }
    window.checkunupObj = obj;
})(appcan, window, Zepto, baseOperation, JasHttpRequest, createTemplateByObj, getOfflineFacilityRecordList, deleteOfflineFacilityRecord,uploadObj);
var em = currentFontSize(document.getElementById('list_wrapper'));