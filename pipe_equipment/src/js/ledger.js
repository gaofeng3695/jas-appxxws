appcan.ready(function() {
    ledgerObj.init();
});
(function(appcan, window, Zepto, baseOperation, getOfflineFacilityType, getOfflinePipelineType) {
    var uint = {
        init : function() {
            this.getPipeType();
            this.getFacility();
        },
        getPipeType : function() {
            var facilityDamin = JSON.parse(appcan.locStorage.getVal("pipelineTypeList"));
            var s = "<option value=''>全部</option>";
            facilityDamin.forEach(function(item, index, arr) {
                s += "<option value='" + item.domainCode + "'>" + item.domainValue + "</option>"
            });
            $(".pipeOption").append(s);
        },
        getFacility : function() {
            var facilityDamin = JSON.parse(appcan.locStorage.getVal("facilityTypeList"));
            var s = "<option value=''>全部</option>";
            facilityDamin.forEach(function(item, index, arr) {
                s += "<option value='" + item.domainCode + "'>" + item.domainValue + "</option>"
            });
            $(".optionFaci").append(s);
        },
    }
    var obj = {
        isPostReady : true,
        elem : {
            btn_wrapper : '.footer .wrapper',
            trash_allCheck : '#trash_allCheck', //草稿箱列表全选
            trash_delete : '#trash_delete', //草稿箱删除
            ledger_delete : '#ledger_delete', //设施列表删除
            ledger_allCheck : '#ledger_allCheck', //设施列表全选
            upload : '#upload', //草稿箱上传
            ledgersearch : '#ledgersearch', //设施列表点击搜索进行查询
            unupledgersearch : "#unupledgersearch" ,//草稿箱点击搜索
            searchDeleteLedger:"#searchDeleteLedger",//设施台账的清除按钮
            searchDeleteTrash:"#searchDeleteTrash"//设施台账草稿箱的清除按钮
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
            this.setTabview();
            this.showPopover();
            this.bindEvent();
            this.bindSelectEvent();
            this.bindCheckEvent();
            uint.init();
            //获取阈值信息
        },
        setTabview : function() {
            this.tabview = appcan.tab({
                selector : "#tabview",
                hasIcon : false,
                hasAnim : true,
                hasLabel : true,
                hasBadge : false,
                data : [{
                    label : "设施列表",
                }, {
                    label : "草稿箱",
                }]
            });
            this.tabview.on("click", function(obj, index) {/*TAB变更时切换多浮动窗口*/
                appcan.window.selectMultiPopover("ledger_content", index);
            });
        },
        showPopover : function() {
            var that = this;
            var titHeight = $('#content').offset().top;
            appcan.frame.open({/*创建多浮动窗口*/
                id : "content",
                url : [{
                    "inPageName" : "ledger_list",
                    "inUrl" : "ledger_list.html",
                }, {
                    "inPageName" : "unup_list",
                    "inUrl" : "unup_list.html",
                }],
                top : titHeight,
                left : 0,
                index : 0,
                name : 'ledger_content',
                change : function(index, res) {//浮动窗口推拽变更时回调，可控制tab进行同步变更
                    that.tabview.moveTo(res.multiPopSelectedIndex);
                    if (res.multiPopSelectedIndex === 1) {
                        that.searchhidshow(true);
                        uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'unup_list', 'unupledgerList.requestListData()');
                        that.btn_wrapper.addClass('btn_active');
                    } else {
                        that.searchhidshow(false);
                        uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'ledger_list', 'ledgerList.changePage()');
                        that.btn_wrapper.removeClass('btn_active');
                    }
                }
            });
            window.onorientationchange = window.onresize = function() {
                appcan.frame.resize("content", 0, titHeight);
            };
        },
        bindEvent : function() {
            var that = this;
            /* 关闭 */
            appcan.button("#nav-left", "btn-act", function() {
                appcan.window.close(-1);
            });
            /* 新增*/
            appcan.button("#nav-new", "btn-act", function() {
                appcan.locStorage.val('equipmentEntrance', 'new');
                appcan.openWinWithUrl('new_equipment', '../new_equipment/new_equipment.html');
            });
            /* 转换为地图列表*/
            appcan.button("#nav-map", "btn-act", function() {
                //进行设施的Id的移除
                appcan.locStorage.remove('equipmentSelectedObj');
                appcan.locStorage.remove('facilityId');
                appcan.locStorage.val("mapresource","1");
                appcan.openWinWithUrl('ledgermap', 'ledgermap.html');
            });
            /* '删除 设施台账' */
            appcan.button(that.elem.ledger_delete, "btn-act", function() {
                uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'ledger_list', 'ledgerList.deleteLedger()');
            });
            /* 删除 草稿箱 */
            appcan.button(that.elem.trash_delete, "btn-act", function() {
                uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'unup_list', 'unupledgerList.deleteLedger();');
            });
            /* 草稿箱 进行记录的上传*/
            appcan.button(that.elem.upload, "btn-act", function() {
                if (that.isPostReady) {
                    that.isPostReady = false;
                    uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'unup_list', 'unupledgerList.uploadRecordsToService()');
                } else {
                    baseOperation.alertToast("请等待记录上传完成");
                }
            });
            that.ledgersearch.click(function() {
                var value = $("#inputDom").val();
                uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'ledger_list', 'ledgerList.searchLedger("' + value + '")');
            });
            that.searchDeleteLedger.click(function(){
               var value=""; 
                uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'ledger_list', 'ledgerList.searchLedger("' + value + '")');
            });
            that.unupledgersearch.click(function() {
                var value = $("#unupledgerinputDom").val();
                uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'unup_list', 'unupledgerList.searchLedger("' + value + '")');
            });
            that.searchDeleteTrash.click(function(){
                var value = "";
                uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'unup_list', 'unupledgerList.searchLedger("' + value + '")');
            });
            appcan.window.on('resume', function() {
                //改变页数
                uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'unup_list', 'unupledgerList.requestListData()');
                uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'ledger_list', 'ledgerList.changePage()');
            });
            //窗口回到前台时执行回调函数
        },
        bindSelectEvent : function() {
            /*设施列表筛选*/
            appcan.select("#select01", function(ele, value) {
                uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'ledger_list', 'ledgerList.triggerPipeSearch("' + value + '")');
            });
            appcan.select("#select02", function(ele, value) {
                uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'ledger_list', 'ledgerList.triggerEquipSearch("' + value + '")');
            });
            /*草稿箱列表筛选*/
            appcan.select("#select03", function(ele, value) {
                uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'unup_list', 'unupledgerList.triggerPipeSearch("' + value + '")');
            });
            appcan.select("#select04", function(ele, value) {
                uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'unup_list', 'unupledgerList.triggerEquipSearch("' + value + '")');
            });
        },
        bindCheckEvent : function() {
            var that = this;
            that.ledger_allCheck.change(function() {
                var bool = $(this).prop('checked');
                uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'ledger_list', 'ledgerList.setCheckBoxIfChecked(' + bool + ')');
            });
            that.trash_allCheck.change(function() {
                var bool = $(this).prop('checked');
                uexWindow.evaluateMultiPopoverScript('', 'ledger_content', 'unup_list', 'unupledgerList.setCheckBoxIfChecked(' + bool + ')');
            });
        },
        ledgerCheck : function(bool,length) {
            if(length==0){
               this.ledger_allCheck.attr('disabled',true); 
            }else{
               this.ledger_allCheck.removeAttr('disabled');
            }      
            this.ledger_allCheck.prop('checked', bool);
        },
        trashCheck : function(bool) {
            this.trash_allCheck.prop('checked', bool);
        },
        searchhidshow : function(falg) {
            if (falg) {
                $("#ledger").css('display', 'none');
                $("#unupledger").css('display', 'block');
            } else {
                $("#ledger").css('display', 'block');
                $("#unupledger").css('display', 'none');
            }
        }
    };
    window.ledgerObj = obj;
})(appcan, window, Zepto, baseOperation, getOfflineFacilityType, getOfflinePipelineType); 