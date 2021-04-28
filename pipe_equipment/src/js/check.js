appcan.ready(function() {
    checkObj.init();
});
// window.onerror = function(msg, url, line) {
    // alert("erro" + msg + "\n" + url + ":" + line);
    // return true;
// };
(function(appcan, window, Zepto, baseOperation, getOfflineFacilityType) {
    var uint = {
        getFacility: function() {
            var facilityDamin = JSON.parse(appcan.locStorage.getVal("facilityTypeList"));
            var s = "<option value=''>全部</option>";
            facilityDamin.forEach(function(item, index, arr) {
                s += "<option value='" + item.domainCode + "'>" + item.domainValue + "</option>"
            });
            $(".typeoption").append(s);
        },

    }
    var obj = {
        isPostReady: true,
        ele: {
            btn_wrapper: '.footer .wrapper',
            timeBtnDom: 　 '#dateBtn', //按钮-可以选择时间范围
            unUptimeBtnDom: 　 '#dateunUpBtn', //草稿箱按钮-可以选择时间范围
            $inputCheckSearch: "#inputCheckSearch", //检查记录进行搜索
            $inputUnUpChecksearch: "#inputUnUpChecksearch", //检查记录草稿箱进行搜索
            unupcheck_allCheck: "#unupcheck_allCheck", //草稿箱进行全选
            unupDelete: "#unupcheck_delete", //草稿箱进行设施检查的删除
            upload: "#upload", //草稿箱设施检查的上传
            check_allCheck: "#check_allCheck", //检查设施进行全选
            check_delete: "#check_delete", //检查设施进行删除
            searchDeleteTrash:"#searchDeleteTrash",//检查设施草稿清除按钮
            searchDeleteCheck:"#searchDeleteCheck",//检查设施清除按钮
        },
        initElem: function() {
            var eles = this.ele;
            for (var name in eles) {
                if (eles.hasOwnProperty(name)) {
                    this[name] = $(eles[name]);
                }
            }
        },
        init: function() {
         
            this.initElem();
            this.setTabview();
            this.showPopover();
            this.bindEvent();
            this.bindSelectEvent();
            this.bindCheckEvent();
            uint.getFacility();
        },
        setTabview: function() {
            this.tabview = appcan.tab({
                selector: "#tabview",
                hasIcon: false,
                hasAnim: true,
                hasLabel: true,
                hasBadge: false,
                data: [{
                    label: "检查记录",
                }, {
                    label: "草稿箱",
                }]
            });
            this.tabview.on("click", function(obj, index) { /*TAB变更时切换多浮动窗口*/
                appcan.window.selectMultiPopover("check_content", index);
            });
        },
        showPopover: function() {
            var that = this;
            var titHeight = $('#content').offset().top;
            appcan.frame.open({ /*创建多浮动窗口*/
                id: "content",
                url: [{
                    "inPageName": "check_list",
                    "inUrl": "check_list.html",
                }, {
                    "inPageName": "check_unup_list",
                    "inUrl": "check_unup_list.html",
                }],
                top: titHeight,
                left: 0,
                index: 0,
                name: 'check_content',
                change: function(index, res) { //浮动窗口推拽变更时回调，可控制tab进行同步变更
                    that.tabview.moveTo(res.multiPopSelectedIndex);
                    if (res.multiPopSelectedIndex === 1) {
                        that.searchhidshow(true);
                        uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_unup_list', 'checkunupObj.requestData()');
                        that.btn_wrapper.addClass("btn_active");
                    } else {
                        that.searchhidshow(false);
                       
                        uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_list', 'checklistObj.changePage()');
                        that.btn_wrapper.removeClass("btn_active");
                    }
                }
            });
            window.onorientationchange = window.onresize = function() {

                appcan.frame.resize("content", 0, titHeight);
                // resizeWindowSize();
            };
        },
        bindEvent: function() {
            var that = this;
            appcan.button("#nav-left", "btn-act", function() {
                appcan.window.close(-1);
            });
            appcan.button("#nav-new", "btn-act", function() {
                appcan.locStorage.val('equipmentCheckEntrance', 'new') // 设施检查表单入口 'new' , 'local'
                    // appcan.locStorage.val('equipmentEntrance', 'new');
                appcan.openWinWithUrl('new_check', '../new_check/new_check.html');
            });
            /*检查记录的相关操作 */
            that.timeBtnDom.click(function(e) {
                uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_list', 'checklistObj.mobiScrollshow();');
            });
            that.$inputCheckSearch.click(function() {
                var value = $("#inputCheck").val();
                uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_list', 'checklistObj.inputSearch("' + value + '");');
            });
            that.searchDeleteCheck.click(function() {
                var value ='';
                uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_list', 'checklistObj.inputSearch("' + value + '");');
            });
            that.check_delete.click(function() {
                uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_list', 'checklistObj.deleteCheck();');
            });
            /*草稿箱的相关操作 */
            that.unUptimeBtnDom.click(function(e) {
                uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_unup_list', 'checkunupObj.mobiScrollshow();');
            });
            that.$inputUnUpChecksearch.click(function() {
                var value = $("#inputUnUpCheck").val();
                uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_unup_list', 'checkunupObj.inputSearch("' + value + '");');
            });
            that.searchDeleteTrash.click(function() {
                var value ='';
                uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_unup_list', 'checkunupObj.inputSearch("' + value + '");');
            });
            that.unupDelete.click(function() {
                uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_unup_list', 'checkunupObj.deleteCheck();');
            });
            that.upload.click(function() {
                if (that.isPostReady) {
                    that.isPostReady = false;
                    uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_unup_list', 'checkunupObj.uploadRecordsToService();');
                } else {
                    baseOperation.alertToast("请等待记录上传完成");
                }
            });
            appcan.window.on('resume', function() {
                uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_unup_list', 'checkunupObj.requestData()');
                uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_list', 'checklistObj.changePage()');
     
            });
        },
        bindSelectEvent: function() {
            /*设施列表筛选*/
            appcan.select("#select01", function(ele, value) {
                uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_list', 'checklistObj.triggerPipeSearch("' + value + '")');
            });
            appcan.select("#select03", function(ele, value) {
                uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_unup_list', 'checkunupObj.triggerPipeSearch("' + value + '")');
            });
        },
        bindCheckEvent: function() {
            var that = this;
            that.unupcheck_allCheck.change(function() {
                var bool = $(this).prop('checked');
                uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_unup_list', 'checkunupObj.setCheckBoxIfChecked(' + bool + ')');
            });
            that.check_allCheck.change(function() {
                var bool = $(this).prop('checked');
                uexWindow.evaluateMultiPopoverScript('', 'check_content', 'check_list', 'checklistObj.setCheckBoxIfChecked(' + bool + ')');
            });
        },
        showDate: function(s) {
            $("#date").text(s);
        },
        showunUpDate: function(s) {
            $("#dateunUp").text(s);
        },
        checkedAll: function(bool,length) {
            if(length==0){
               this.check_allCheck.attr('disabled',true); 
            }else{
               this.check_allCheck.removeAttr('disabled');
            } 
               this.check_allCheck.prop('checked', bool);
        },
        unupcheckAll: function(bool) {
            this.unupcheck_allCheck.prop('checked', bool);
        },
        // uexWindow.setMultiPopoverFrame("check_content",0,titHeight,width,height);
        searchhidshow: function(falg) {
            var that = this;
            if (falg) {
                $("#checkrecord").css('display', 'none');
                $("#unupcheck").css('display', 'block');
            } else {
                $("#checkrecord").css('display', 'block');
                $("#unupcheck").css('display', 'none');
            }
        }

    };
    window.checkObj = obj;
})(appcan, window, Zepto, baseOperation, getOfflineFacilityType);