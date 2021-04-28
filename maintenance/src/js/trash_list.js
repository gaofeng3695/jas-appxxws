var vm = new Vue({
    el : '#app',
    data : {
        keyword : '',
        localCount : 10,
        maintancechecked : [],
        dataObj : [],
    },
    methods : {
        dosearch : function() {
            var that = this;
            localServer.queryList(that.keyword, 0, function(result) {
                if (result.success == 1) {
                    that.dataObj = result.data;
                    baseOperation.closeToast();
                } else {
                    baseOperation.alertToast("查询失败");
                }
                 vm.total=vm.dataObj.length;
                 vm.$set( vm.total);
            });
        },
        changemaintanceids : function(obj, falg) {
            if (falg) {
                this.maintancechecked.push(obj);
            } else {
                this.removeByValue(this.maintancechecked, obj);
            }
            if (this.maintancechecked.length == this.dataObj.length) {
                maintenanceList.setFatherChecked(true);
            } else {
                maintenanceList.setFatherChecked(false);
            }
        },
        removeByValue : function(arr, val) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == val) {
                    arr.splice(i, 1);
                    break;
                }
            }
        },
        clickitem : function() {
            var obj = JSON.parse(appcan.locStorage.val("maintenanceObj"));
            appcan.locStorage.val("maintenanceId", obj.workId);
            appcan.locStorage.val('maintenanceFormEntrance', 'local');
            //来自本地草稿箱
            appcan.openWinWithUrl('do_maintenance', '../do_maintenance/do_maintenance.vue.html');
        },
    },
    mounted : function() {
        var that = this;
        appcan.ready(function() {
            maintenanceList.queryList();
        });

    },
    // created : function() {//进行页面初始化的时候使用
        // baseOperation.alertToast("正在查询，请稍候...")
    // },
});

var maintenanceList = {
    setCheckBoxIfChecked : function(bool) {//全选
        var that = this;
        if (bool) {
            vm.dataObj.forEach(function(item) {
                vm.maintancechecked.push(item.workId);
            });
        } else {
            vm.maintancechecked = []
        }
    },
    setFatherChecked : function(bool) {
        //改变父级的按钮
        appcan.window.evaluateScript('local_list', 'wrapperObj.trashCheck(' + bool + ')');
    },
    deleteMaintance : function() {
        var that = this;
        if (vm.maintancechecked.length == 0) {
            baseOperation.alertToast("请选择您需要删除的数据");
        } else {
            appcan.window.alert({
                title : "删除本地记录",
                content : "是否删除本条整改维修记录？",
                buttons : ['确定', '取消'],
                callback : function(err, data, dataType, optId) {
                    if (data == 0) {
                        localServer.delete(vm.maintancechecked, function(result) {
                            if (result.success == 1) {
                                that.queryList();

                                baseOperation.alertToast("删除成功");
                            } else {
                                baseOperation.alertToast("删除失败");
                            }
                        });
                    }
                }
            });
        }
    },
    queryList : function() {
        var that = this;
        localServer.queryList(vm.keyword, 0, function(result) {
            if (result.success == 1) {
                vm.dataObj = result.data;
                vm.$set(vm.dataObj);
                that.setFatherChecked(false);
                vm.maintancechecked=[];                
                baseOperation.closeToast();
            } else {
                baseOperation.alertToast("查询失败");
            }
             vm.total=vm.dataObj.length;
              vm.$set( vm.total);
        });
    },
}

