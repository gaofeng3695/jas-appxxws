appcan.ready(function() {
    eventlist.init();
});
(function(appcan, window, Zepto, baseOperation, JasHttpRequest, refreshBounce) {
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
            "status" : "20",
            "pageNum" : 1,
            "pageSize" : 10
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
                var eventid = this.dataset.id;
                 appcan.locStorage.remove("tabIndex_param");
                 appcan.locStorage.setVal("tabIndex_param", "0");
                appcan.locStorage.setVal("event_Id", eventid);
                appcan.openWinWithUrl("task_details", "../../task/task_details.html");

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
            var partURL1 = 'cloudlink-inspection-event/eventInfo/web/v1/getPageList';
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
                            baseOperation.alertToast('没有更多的事件');
                        }

                    }
                    that.renderItemCount(aData.length, obj.total);
                }
            }, JSON.stringify(that.searchObj));
        },
        renderItemCount : function(nNow, nTotal) {
            var that = this;
            if (that.searchObj.pageNum === 1) {
                creatNumTip(nNow, nTotal, false, false);
            } else {
                creatNumTip(nNow, nTotal, true, false);
            }
        },
        render : function(aData) {
            var that = this;
            var s = '';
            aData.forEach(function(item, index, arr) {
                s += createTemplate(item);
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

        changePage : function() {
            this.searchObj.pageNum = 1;
            this.requestListData();
        },
        getEvent : function() {
            //选择选中的设施
            if ($("input[type='radio']:checked").length == 0) {
                baseOperation.alertToast("请选择一个事件");
            } else {
                var obj = $("input[type='radio']:checked")[0].dataset.obj;
                appcan.locStorage.remove("equipmentSelectedObjs");
                appcan.locStorage.val("equipmentSelectedObjs", obj);
                appcan.window.evaluateScript('selectevent', 'appcan.window.close(-1)');
            }
        }
    };
    window.eventlist = obj;
})(appcan, window, Zepto, baseOperation, JasHttpRequest, refreshBounce);

