appcan.ready(function() {
    wrapperObj.init();

});

var wrapperObj = {
    isPostReady : true,
    currentPop: 'unup_list',
    elem: {
        btn_wrapper: '.footer .wrapper',
        unUp_allCheck: '#unUp_allCheck',
        trash_allCheck: '#trash_allCheck',
        trash_delete: '#trash_delete',
        unup_delete: '#unup_delete',
        upload: '#upload'
    },
    initElem: function() {
        var eles = this.elem;
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
        this.bindCheckEvent();
    },
    setTabview: function() {
        this.tabview = appcan.tab({
            selector: "#tabview",
            hasIcon: false,
            hasAnim: true,
            hasLabel: true,
            hasBadge: false,
            data: [{
                label: "未上传",
            }, {
                label: "草稿箱",
            }]
        });
        this.tabview.on("click", function(obj, index) { /*TAB变更时切换多浮动窗口*/
            appcan.window.selectMultiPopover("local_list_content", index);
        });
    },
    showPopover: function() {
        var that = this;
        var titHeight = $('#content').offset().top;
        appcan.frame.open({ /*创建多浮动窗口*/
            id: "content",
            url: [{
                "inPageName": "unup_list",
                "inUrl": "unUp_list.html",
            }, {
                "inPageName": "trash_list",
                "inUrl": "trash_list.html",
            }],
            top: titHeight,
            left: 0,
            index: 0,
            name: 'local_list_content',
            change: function(index, res) { //浮动窗口推拽变更时回调，可控制tab进行同步变更
                that.tabview.moveTo(res.multiPopSelectedIndex);
                if (res.multiPopSelectedIndex === 1) {
                    //alert(that.btn_wrapper);
                    that.currentPop = 'trash_list';
                    that.btn_wrapper.addClass('btn_active');
                } else {
                    that.currentPop = 'unup_list';
                    that.btn_wrapper.removeClass('btn_active');
                }
            }
        });
        window.onorientationchange = window.onresize = function() {
            appcan.frame.resize("content", 0, titHeight);
        };
    },
    bindEvent: function() {
        var that = this;
        /* 关闭 */
        appcan.button("#nav-left", "btn-act", function() {
            appcan.window.close(-1);
        });
        appcan.button(that.elem.upload, "btn-act", function() {
            if (that.isPostReady) {
                that.isPostReady = false;
                uexWindow.evaluateMultiPopoverScript('', 'local_list_content', 'unup_list', 'recordList.uploadRecordsToService()');                
            }else{
                baseOperation.alertToast("请等待记录上传完成");
            }

            //appcan.openWinWithUrl('local_list','../local_list/local_list.html');
        });

        /* '删除 unup_delete' */
        appcan.button(that.elem.unup_delete, "btn-act", function() {
            uexWindow.evaluateMultiPopoverScript('', 'local_list_content', 'unup_list', 'recordList.deleteRecords()');
        });
        /* 删除 trash */
        appcan.button(that.elem.trash_delete, "btn-act", function() {
            uexWindow.evaluateMultiPopoverScript('', 'local_list_content', 'trash_list', 'recordList.deleteRecords();');
        });
        appcan.window.on('resume', function() {
            uexWindow.evaluateMultiPopoverScript('', 'local_list_content', 'unup_list', 'recordList.requestListData()');
            uexWindow.evaluateMultiPopoverScript('', 'local_list_content', 'trash_list', 'recordList.requestListData()');

        }); //窗口回到前台时执行回调函数         


    },
    bindCheckEvent: function() {
        var that = this;
        this.unUp_allCheck.change(function() {
            var bool = $(this).prop('checked');
            uexWindow.evaluateMultiPopoverScript('', 'local_list_content', 'unup_list', 'recordList.setCheckBoxIfChecked(' + bool + ')');

        });
        this.trash_allCheck.change(function() {
            var bool = $(this).prop('checked');
            uexWindow.evaluateMultiPopoverScript('', 'local_list_content', 'trash_list', 'recordList.setCheckBoxIfChecked(' + bool + ')');
        });
    },
    unUpCheck: function(bool) {
        this.unUp_allCheck.prop('checked', bool);
    },
    trashCheck: function(bool) {
        this.trash_allCheck.prop('checked', bool);
    }
};