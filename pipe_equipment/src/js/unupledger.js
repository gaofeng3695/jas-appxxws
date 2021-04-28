appcan.ready(function() {
    unupledgerList.init();

});
(function(appcan, window, Zepto, baseOperation, JasHttpRequest, createTemplateByObj, queryOfflineFacilityList, uploadObj, refreshBounce) {
    // var jasHttpRequest = new JasHttpRequest();
    var utils = {
        ifCheckboxAllChecked : function($checkBoxs) {
            if ($checkBoxs.length === 0) {
                return false;
            }
            return $checkBoxs.not('input:checked').length === 0;
        }
    };
    var obj = {
        queryParam : '', //关键字的查询
        facilityTypeCode : '', //设备类型编号
        pipelineTypeCode : '', //管网类型
        pageNum : 1,
        recourIdArray : [],
        recourIdNum : 0,
        deleteRecorId : [], //上传的时候进行草稿箱删除
        deleteRecorIdService : [], //记录服务器上面删除选择的记录ID
        elem : {
            list_wrapper : '#list_wrapper',
        },
        initElem : function() {
            var eles = this.elem;
            for (var name in eles) {
                if (eles.hasOwnProperty(name)) {
                    this[name] = $(eles[name]);
                }
            }
        },
        init : function() {
            this.initElem();
            this.bindEvent();
            this.setBounce();
            this.requestListData();
        },
        setBounce : function() {
            var that = this;
            refreshBounce(function() {
                that.requestListData();
            });
        },
        bindEvent : function() {
            var that = this;
            $('body').on('click', 'ul li', function(e) {
                var t = e.target;
                if ($(t).hasClass('js_check')) {
                    that.setFatherCheckBox();
                    return;
                }
                var facilityId = this.dataset.id;
                //为新建记录页面存recordId
                appcan.locStorage.val('facilityId', facilityId);
                appcan.locStorage.val('equipmentEntrance', 'local');
                appcan.openWinWithUrl('new_equipment', '../new_equipment/new_equipment.html');
            });

            /* 搜索 */
            appcan.button("#search", "btn-act", function() {
                that.searchKeyWord = $('#inputDom').val().trim();
                that.requestListData();
            });
        },
        requestListData : function() {
            var that = this;
            baseOperation.londingToast('数据请求中，请稍后...', 99999);
            queryOfflineFacilityList(that.facilityTypeCode, that.pipelineTypeCode, that.queryParam, function(result) {
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
        render : function(aObj) {
            var that = this;
            var s = '';
            $("#list_wrapper").html("");
            aObj.forEach(function(item, index, arr) {
                s += createTemplateByObj(item, true);
            });
            baseOperation.closeToast();
            $("#list_wrapper").append(s);
        },
        setCheckBoxIfChecked : function(bool) {
            $('input[type="checkbox"]:not(:disabled)').prop('checked', bool);
        },
        setFatherCheckBox : function() {
            var bool = utils.ifCheckboxAllChecked($('input[type="checkbox"]:not(:disabled)'));
            appcan.window.evaluateScript('ledger', 'ledgerObj.trashCheck(' + bool + ')');
        },
        uploadRecordsToService : function() {
            var that = this;
            that.recourIdArray = [];
            that.recourIdNum = 0;
            that.deleteRecorId = [];
            $('input:checked').parents('li').each(function(index) {
                that.recourIdArray.push(this.dataset.id);
            });
            that.selectDataByRecordId();
        },
        selectDataByRecordId : function() {//根据记录Id获取所有的数据
            var that = this;
            if (!that.recourIdArray.length) {
                baseOperation.alertToast("请选择您要提交的设施信息!");
                appcan.window.evaluateScript('ledger', 'ledgerObj.isPostReady = true');
                return;
            }
            if (that.recourIdNum < that.recourIdArray.length) {
                that.currentCheckedRecourId = that.recourIdArray[that.recourIdNum];
                that.uploadDataToService();
            } else {
                appcan.window.evaluateScript('ledger', 'ledgerObj.isPostReady = true');
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
        uploadDataToService : function() {
            var that = this;
            selectOfflineFacility(that.currentCheckedRecourId, function(result) {//查询安检记录的详情
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
                    baseOperation.alertToast("上传失败");
                }
            });
        },
        deleteRecordFromDraf : function() {
            var that = this;
            deleteOfflineFacility(that.deleteRecorId, function() {
                that.requestListData();
            });
        },
        deleteLedger : function() {//进行草稿箱里面信息删除
            var that = this;
            var arr = [];
            $('input:checked').parents('li').each(function(index) {
                arr.push(this.dataset.id);
            });
            if (arr.length == 0) {
                baseOperation.alertToast("请选择您要删除的设施信息!");
                return;
            } else {
                appcan.window.alert({
                    title : "删除",
                    content : "设施信息还没有上传，是否删除？",
                    buttons : ['确定', '取消'],
                    callback : function(err, data, dataType, optId) {
                        if (data == 0) {

                            deleteOfflineFacility(arr, function(result) {
                                if (result.success == 1) {
                                    that.requestListData();
                                } else {
                                    baseOperation.alertToast("删除失败，请稍候尝试!");
                                }
                            });
                        }
                    }
                });
            }
        },
        searchLedger : function(value) {
            var that = this;
            that.queryParam = value;
            that.requestListData();
        },
        triggerPipeSearch : function(value) {
            //根据官网类型进行删除
            var that = this;
            that.pipelineTypeCode = value;
            that.requestListData();
        },
        triggerEquipSearch : function(value) {
            var that = this;
            that.facilityTypeCode = value;
            that.requestListData();
        }
    };
    window.unupledgerList = obj;
})(appcan, window, Zepto, baseOperation, JasHttpRequest, createTemplateByObj, queryOfflineFacilityList, uploadObj, refreshBounce);

