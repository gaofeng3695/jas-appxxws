appcan.ready(function() {
    chooseList.init();
});
(function(appcan, window, Zepto, baseOperation, JasHttpRequest, creatNumTip, refreshBounce, createTemplateByObj) {
    var utils = {
        ifCheckboxAllChecked : function($checkBoxs) {
            if ($checkBoxs.length === 0) {
                return false;
            }
            return $checkBoxs.not('input:checked').length === 0;
        }
    };

    var obj = {
        jasHttpRequest : new JasHttpRequest(),
        searchObj : {
            'pageNum' : 1,
            'pageSize' : 10,
            'keyword' : '',
            'facilityStatusCode' : '',
            'pipelineTypeCode' : '',
            'facilityTypeCodeList' : []
        },
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
        bindEvent : function() {
            var that = this;

            $('body').on('click', 'ul li .clickarea', function(e) {

                var recordId = this.dataset.id;
                //为新建记录页面存recordId
                appcan.locStorage.val('facilityId', recordId);
                appcan.locStorage.val('facilitiesDetailsEntrance', 'select');
                appcan.openWinWithUrl('network_facilites_details', '../detail_equipment/network_facilities_details.html');

            });

            appcan.button("#search", "btn-act", function() {
                that.searchKeyWord = $('#inputDom').val().trim();
                that.requestListData();
            });

        },
        setBounce : function() {
            var that = this;
            refreshBounce(function() {
                that.searchObj.pageNum = 1;
                that.requestListData();
            }, function() {
                that.searchObj.pageNum++;
                that.requestListData();
            });
        },
        requestListData : function() {
            var that = this;
            baseOperation.londingToast('数据请求中，请稍后...', 99999);
            var partURL1 = 'cloudlink-inspection-event/facility/getPageList';
            that.jasHttpRequest.jasHttpPost(partURL1, function(id, state, dbSource) {
                if (+dbSource.length === 0) {
                    baseOperation.alertToast("网络异常，请稍后再试...");
                    return;
                }
                var obj = JSON.parse(dbSource);
                if (obj.success == 1) {
                    var aData = obj.rows;
                    if (aData.length > 0) {

                        that.render(aData);
                    } else {
                        baseOperation.closeToast();
                        if (that.searchObj.pageNum === 1) {
                            that.list_wrapper.html('<div class="ub ub-pc uinn ulev30 clr666">暂无数据</div>');
                        } else {
                            baseOperation.alertToast('没有更多的设施');
                        }

                    }
                    that.renderItemCount(aData.length, obj.total);
                }
            }, JSON.stringify(that.searchObj));
        },
        renderItemCount : function(nNow, nTotal) {
            var that = this;
            if (that.searchObj.pageNum === 1) {
                creatNumTip(nNow, nTotal, false, true);
            } else {
                creatNumTip(nNow, nTotal, true, true);
            }
        },
        render : function(aData) {
            var that = this;
            var s = '';
            aData.forEach(function(item, index, arr) {
                s += createTemplateByObj(item);
            });
            if (that.searchObj.pageNum === 1) {
                baseOperation.closeToast();
                that.list_wrapper.html(s);
            } else {
                baseOperation.closeToast();
                that.list_wrapper.append(s);
            }
        },
        searchLedger : function(value) {
            var that = this;
            that.searchObj.keyword = value;
            that.changePage();
        },
        triggerPipeSearch : function(value) {
            var that = this;
            that.searchObj.pipelineTypeCode = value;
            that.changePage();
        },
        triggerEquipSearch : function(value) {
            var that = this;
            if (value == "") {
                that.searchObj.facilityTypeCodeList = [];
            } else {
                that.searchObj.facilityTypeCodeList = value.split(",");
            }

            that.changePage();
        },
        changePage : function() {
            this.searchObj.pageNum = 1;
            this.requestListData();
        },
        getChoosePipe : function() {
            //选择选中的设施
            if ($("input[type='radio']:checked").length == 0) {
                baseOperation.alertToast("请选择一个管网设施");
            } else {
                //var obj = $("input[type='radio']:checked").attr("obj");
                //var obj = $("input[type='radio']:checked")[0].getAttribute("obj");
                var obj = $("input[type='radio']:checked")[0].dataset.obj;
                appcan.locStorage.remove("equipmentSelectedObjs");
                appcan.locStorage.val("equipmentSelectedObjs", obj);
                appcan.window.evaluatePopoverScript('new_check', 'content', 'newEquipmentCheckObj.trigerEquipmentSelected()');
                appcan.window.evaluateScript('choosePipe', 'appcan.window.close(-1)');
            }
        }
    };
    window.chooseList = obj;
})(appcan, window, Zepto, baseOperation, JasHttpRequest, creatNumTip, refreshBounce, createTemplateByObj);
