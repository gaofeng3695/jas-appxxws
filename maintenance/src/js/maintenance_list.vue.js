// window.onerror = function(msg, url, line) {
//     alert("erro" + msg + "\n" + url + ":" + line);
//     return true;
// };

appcan.ready(function() {
});

var vm = new Vue({
    el : '#app',
    data : {
        localCount : '',
        date : '',
        status : '',
        keyword : '',
        originTypeCode : '',

        selectOptions : {
            status : [{
                value : '',
                text : '维修状态'
            }, {
                value : '1',
                text : '待维修'
            }, {
                value : '2',
                text : '已完成'
            }],
            originType : [{
                value : '',
                text : '维修来源'
            }],
            date : [{
                value : '维修期限',
                text : '维修期限'
            }, {
                value : '7天内',
                text : '7天内'
            }, {
                value : '15天内',
                text : '15天内'
            }, {
                value : '30天内',
                text : '30天内'
            }]

        }
    },
    computed : {
        originTypeName : function() {
            var arr = this.selectOptions.originType;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].value === this.originTypeCode) {
                    return arr[i].text;
                }
            }
            return '';
        },
        statusName : function() {
            var arr = this.selectOptions.status;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].value === this.status) {
                    return arr[i].text;
                }
            }
            return '';
        },
        dateScope : function() {
            if (this.date === '7天内') {
                return {
                    startDate : new Date().Format("yyyy-MM-dd"),
                    endDate : new Date(new Date().setDate(new Date().getDate() + 7)).Format("yyyy-MM-dd")
                };
            }
            if (this.date === '15天内') {
                return {
                    startDate : new Date().Format("yyyy-MM-dd"),
                    endDate : new Date(new Date().setDate(new Date().getDate() + 15)).Format("yyyy-MM-dd")
                };
            }
            if (this.date === '30天内') {
                return {
                    startDate : new Date().Format("yyyy-MM-dd"),
                    endDate : new Date(new Date().setDate(new Date().getDate() + 30)).Format("yyyy-MM-dd")
                };
            }
            return {
                startDate : '',
                endDate : '',
            };
        },
    },
    watch : {
        date : function() {
            operations.changeQueryItem('vm.query.startDate="' + this.dateScope.startDate + '";vm.query.endDate="' + this.dateScope.endDate + '";');
        },
        status : function() {
            operations.changeQueryItem('vm.query.status="' + this.status + '";');

        },
        originTypeCode : function() {
            operations.changeQueryItem('vm.query.originTypeCode="' + this.originTypeCode + '";');
        },
    },
    methods : {
        dosearch : function() {
            operations.changeQueryItem('vm.query.keywordApp="' + this.keyword + '";');
        },
        clickPlus : function() {
            appcan.openWinWithUrl('new_maintenance', '../new_maintenance/new_maintenance.vue.html');
        },
        clickLocal : function(a) {
            appcan.openWinWithUrl('local_list', '../list/local_list.html');
        },
        click1 : function() {
            alert('点击按钮1');
        },
        click2 : function() {
            alert('点击按钮2');
        }
    },
    mounted : function() {
        var that = this;
        appcan.ready(function() {
            operations.openPopover();
            operations.bindResumeEvent();
            operations.getMaintenanceType();

        });
    }
});

var operations = {
    type : [],
    openPopover : function() {
        var titHeight = $('#content').offset().top;
        appcan.frame.open("content", "maintenance_list_content.vue.html", 0, titHeight);
        window.onorientationchange = window.onresize = function() {
            appcan.frame.resize("content", 0, titHeight);
        };
    },
    bindResumeEvent : function() {
        var that = this;
        appcan.window.on('resume', function() {//窗口回到前台时执行回调函数
            //that.getLocalCount();
            appcan.window.evaluatePopoverScript('', 'content', 'operations.getLocalRecord(function(){operations.refreshList()})');
            //在指定的弹出窗内执行相应的脚本
        });
    },
    changeQueryItem : function(sScript) {//更改子页面的搜索条件
        appcan.window.evaluatePopoverScript('', 'content', sScript + 'vm.query.pageNum="1"');
    },
    getMaintenanceType : function() {
        var that = this;
        var sUrl = "cloudlink-core-framework/menu/checkAccess";
        var queryObj = {
            "appId" : "0c753fdd-5f54-4b24-bf50-491ea5eb1a84",
            "menuCode" : "securityRecord"
        };
        jasRequest.get(sUrl, queryObj, function(data) {
            if (data.success == 1) {
                if (data.rows[0].access) {
                    vm.selectOptions.originType.push({
                        value : 'MO_01',
                        text : '入户整改'
                    });
                }
            }
            that.isExitPipeline();
        });
    },
    isExitPipeline : function() {
        var that = this;
        var sUrl = "cloudlink-core-framework/menu/checkAccess";
        var queryObj = {
            "appId" : "0c753fdd-5f54-4b24-bf50-491ea5eb1a84",
            "menuCode" : "facilityList"
        };
        jasRequest.get(sUrl, queryObj, function(data) {
            if (data.success == 1) {
                if (data.rows[0].access) {
                    vm.selectOptions.originType.push({
                        value : 'MO_02',
                        text : '管网设施'
                    });
                }
            }
            that.render();
        });
    },
    render : function() {
        vm.selectOptions.originType.push({
            value : 'MO_03',
            text : '巡检事件'
        });
        vm.selectOptions.originType.push({
            value : 'MO_99',
            text : '其他维修'
        })
    }
};

// {
// value : '',
// text : '维修来源'
// }, {
// value : 'MO_01',
// text : '入户整改'
// }, {
// value : 'MO_02',
// text : '管网设施'
// }, {
// value : 'MO_03',
// text : '巡检事件'
// }, {
// value : 'MO_99',
// text : '其他维修'
// }