appcan.ready(function() {
    ledgerList.init();
});
(function(appcan, window, Zepto, baseOperation, JasHttpRequest, createTemplateByObj, creatNumTip, refreshBounce) {
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
            $('body').on('click', 'ul li', function(e) {
                var t = e.target;
                if ($(t).hasClass('js_check')) {
                    that.setFatherCheckBox();
                    return;
                }
                appcan.locStorage.val('facilitiesDetailsEntrance','list');
                var facilityId = this.dataset.id;
                var Privilege=this.dataset.privilege;
                appcan.locStorage.val('ledgerPrivilege',Privilege);//true 有权限,fasle无权限
                //为新建记录页面存recordId
                appcan.locStorage.val('facilityId', facilityId);
                appcan.openWinWithUrl('network_facilities_details', '../detail_equipment/network_facilities_details.html');
            });

            /* 搜索 */
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
                        if (that.searchObj.pageNum === 1) {
                            that.list_wrapper.html('<div class="ub ub-pc uinn ulev30 clr666">暂无数据</div>');
                        }else{
                             baseOperation.alertToast('没有更多的设施');
                        }
                      
                    }
                    that.setFatherCheckBox();
                    //改变父页面的全选按钮
                    that.renderItemCount(aData.length, obj.total);
                }
            }, JSON.stringify(that.searchObj));
        },
        render : function(aData) {
            var that = this;
            var s = '';
            aData.forEach(function(item, index, arr) {
                s += that.isDeletePrivil(item);
            });
            if (that.searchObj.pageNum === 1) {
                baseOperation.closeToast();
                that.list_wrapper.html(s);
            } else {
                baseOperation.closeToast();
                that.list_wrapper.append(s);
            }
        },
        renderItemCount : function(nNow, nTotal) {
            var that = this;
            if (that.searchObj.pageNum === 1) {
                creatNumTip(nNow, nTotal, false, true);
            } else {
                creatNumTip(nNow, nTotal, true, true);
            }
        },
        isDeletePrivil : function(item) {
            var userBo = JSON.parse(appcan.locStorage.val("userBo"));
            if (userBo.isSysadmin == "1") {
                return createTemplateByObj(item, true);
            } else if (userBo.objectId == item.createUserId) {
                return createTemplateByObj(item, true);
            } else {
                return createTemplateByObj(item, false);
            }
        },
        setCheckBoxIfChecked : function(bool) {
            $('input[type="checkbox"]:not(:disabled)').prop('checked', bool);
        },
        setFatherCheckBox : function() {
            var bool = utils.ifCheckboxAllChecked($('input[type="checkbox"]:not(:disabled)'));
            var length=$('input[type="checkbox"]:not(:disabled)').length;
            appcan.window.evaluateScript('ledger', 'ledgerObj.ledgerCheck(' + bool + ','+length+')');
        },
        deleteLedger : function() {//删除权限只能是创建人和系统管理员
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
                    content : "是否删除选中的设施信息？",
                    buttons : ['确定', '取消'],
                    callback : function(err, data, dataType, optId) {
                        if (data == 0) {
                            that.deleteLedgerToService(arr);
                        }
                    }
                });
            }

        },
        deleteLedgerToService : function(arr) {
            //调用接口进行删除
            var that = this;
            var delUrl = "cloudlink-inspection-event/facility/deleteBatch";
            that.jasHttpRequest.jasHttpPost(delUrl, function(id, state, dbSource) {
                if (+dbSource.length === 0) {
                    baseOperation.alertToast("网络异常，请稍后再试...");
                    return;
                }
                var obj = JSON.parse(dbSource);
                if (obj.success == 1) {
                    baseOperation.alertToast("删除成功");
                    // var bool=false;
                    // appcan.window.evaluateScript('ledger', 'ledgerObj.ledgerCheck(' + bool + ')');
                    that.changePage();
                }else{
                    baseOperation.alertToast("网络异常，请稍后再试..."); 
                }
            }, JSON.stringify({
                "idList" : arr
            }));
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
    };
    window.ledgerList = obj;
})(appcan, window, Zepto, baseOperation, JasHttpRequest, createTemplateByObj, creatNumTip, refreshBounce);
