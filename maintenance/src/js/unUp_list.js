var vm = new Vue({
    el : '#app',
    data : {
        keyword : '',
        maintancechecked : [],
        dataObj : [],
        total : '',
    },
    methods : {
        dosearch : function() {
            var that = this;
            localServer.queryList(that.keyword, 1, function(result) {
                if (result.success == 1) {
                    that.dataObj = result.data;
                    baseOperation.closeToast();
                } else {
                    baseOperation.alertToast("查询失败",9999);
                }
                vm.total = that.dataObj.length;
                vm.$set(that.total);
            });
        },
        changemaintanceids : function(obj, falg) {
            if (falg) {
                this.maintancechecked.push(obj);
            } else {
                this.removeByValue(this.maintancechecked, obj);
            }
            //alert('勾选数： '+this.maintancechecked.length)
            if (this.maintancechecked.length == this.dataObj.length) {
                maintenanceList.setFatherChecked(true);
            } else {
                maintenanceList.setFatherChecked(false);
            }
            //alert('勾选数： '+this.maintancechecked.length)

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
            appcan.locStorage.val('maintenanceDetailEntrance', 'local');
            //来自本地
            appcan.openWinWithUrl('detailmaintance', '../detail/detailmaintance.html');
        },
    },
    mounted : function() {
        var that = this;
        appcan.ready(function() {
            maintenanceList.queryList();
            // maintenanceList.bindImdUploadCallBack();

        });

    },
    created : function() {//进行页面初始化的时候使用
        baseOperation.alertToast("正在查询，请稍候...",9999);
    },
});

var maintenanceList = {
    workId : '',
    params : {
        "workId" : "", //维修维护工单ID  data.workId
        "objectId" : "", //维修记录主键ID  data.objectId
        "totalCost" : "", // 费用总计  data.totalCost
        "captialTotalCost" : "", //费用总计大写 data.captialTotalCost
        "content" : "", //维修记录、维修内容    data.content
        "satisfaction" : "", //满意度（入户整改）   data.satisfaction
        "workRecordCost" : [],
        "picUrl":[],
        "signatureUrl":[],
    },
    num : 0,
    hasCheckCount:0,//上传的时候 出现已经整改记录的条数
    setCheckBoxIfChecked : function(bool) {//全选
        var that = this;
        if (bool) {
            vm.dataObj.forEach(function(item) {
                vm.maintancechecked.push(item.workId);
            });
        } else {
            vm.maintancechecked = [];
        }
    },
    setFatherChecked : function(bool) {
        //改变父级的按钮
        //vm.maintancechecked = [];
        appcan.window.evaluateScript('local_list', 'wrapperObj.unUpCheck(' + bool + ')');
    },
    deleteMaintance : function() {
        var that = this;
        if (vm.maintancechecked.length === 0) {
            baseOperation.alertToast("请选择您需要删除的数据",4000);
        } else {
            appcan.window.alert({
                title : "删除本地记录",
                content : "是否删除本条整改维修记录？",
                buttons : ['确定', '取消'],
                callback : function(err, data, dataType, optId) {
                    if (+data === 0) {
                        localServer.delete(vm.maintancechecked, function(result) {
                            if (+result.success === 1) {
                                that.queryList();
                                that.setFatherChecked(false);
                                vm.maintancechecked = [];
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
    queryList : function(isHideTip) {
        !isHideTip && baseOperation.alertToast("正在查询，请稍候...",9999);
        localServer.queryList(vm.keyword, 1, function(result) {
            if (result.success == 1) {
                vm.dataObj = result.data;
                vm.maintancechecked = [];
                maintenanceList.setFatherChecked(false);
                !isHideTip && baseOperation.closeToast();
            } else {
                !isHideTip && baseOperation.alertToast("查询失败");
            }
            vm.total = vm.dataObj.length;
        });
    },
    uploadRecordsToService : function() {
        var that = this;
        if (vm.maintancechecked.length == 0) {
            baseOperation.alertToast("请选择您需要上传的数据",9999);
        } else {
            appcan.window.alert({
                title : "上传本地记录",
                content : "是否上传选中的整改维修记录？",
                buttons : ['确定', '取消'],
                callback : function(err, data, dataType, optId) {
                    if (data == 0) {

                        baseOperation.alertToast("正在上传，请稍候...",99999);

                        appcan.window.evaluateScript('local_list', 'wrapperObj.isPostReady = false');

                        that.uploadToServer();
                    }
                }
            });
        }
    },
    uploadToServer : function() {
        var that = this;

        that.qtty_successUp = 0;
        that.qtty_failUp = 0;
        that.resultDone = false;
        that.aIdsToBeDelete = [];

        var total = vm.maintancechecked.length;
        var aIds = [].concat(vm.maintancechecked); 

        localServer.get(aIds, function(result) {
            if (+result.success === 1) {
                var arr = result.data;
                //alert(JSON.stringify(arr))
                //alert(arr.length);
                arr.forEach(function(obj){
                    uploadRecord(obj, function(data) {
                        that.qtty_successUp++;
                        that.aIdsToBeDelete.push(obj.workId);
                        that.runUploadResult(total,data);
                    }, function(data) {
                        that.qtty_failUp++;
                        that.runUploadResult(total,data);
                    });       
                });             
            }else{

            }                
        });




        return;

        // var that = this;
        // if (that.num > vm.maintancechecked.length - 1) {
        //     if( that.hasCheckCount!=0){
        //       baseOperation.alertToast("这"+that.hasCheckCount+"个工单记录被整改，无需再次整改。",3000); 
        //     }else{
        //       baseOperation.alertToast("上传完成",3000);
        //     }          
        //     appcan.window.evaluateScript('local_list', 'wrapperObj.isPostReady = true');
        //     that.num = 0;       
        // } else {
        //     that.getDataFromLocal(vm.maintancechecked[that.num]);
        // }
    },


    delete : function(id,fn) {
        var that = this;
        localServer.delete(id, function(result) {
            if (+result.success === 1) { 
                return fn&&fn();
            }
        });
    },

    runUploadResult : function(nTotal,data){
        var that = this;
        if (this.resultDone || (this.qtty_failUp + this.qtty_successUp) < nTotal) {
            return;
        }
        this.resultDone = true;

        if (nTotal === 1) {
            if (this.qtty_successUp === nTotal) {
                baseOperation.alertToast(nTotal + '条记录全部上传成功',4444);
            }else{
                if (data.code === 'XE05002') {
                    baseOperation.alertToast('此维修项目已被维修，无需再次维修', 4444); 
                }else{
                    baseOperation.alertToast('上传失败', 4444);                     
                }            
            }              
        }else{
            if (this.qtty_successUp === nTotal) {
                baseOperation.alertToast(nTotal + '条记录全部上传成功',4444);
            }else{
                baseOperation.alertToast(this.qtty_successUp + '条记录上传成功\n'+(nTotal-this.qtty_successUp)+'条记录上传失败',4444);    
            }            
        }
        if (this.aIdsToBeDelete.length > 0) {
            this.delete(this.aIdsToBeDelete,function(){
                that.queryList(true);
                that.setFatherChecked(false);   
                appcan.window.evaluateScript('local_list', 'wrapperObj.isPostReady = true');            
            });            
        }else{
            that.queryList(true);
            that.setFatherChecked(false);   
            appcan.window.evaluateScript('local_list', 'wrapperObj.isPostReady = true');             
        }


    },



    // getDataFromLocal : function(id) {
    //     var that = this;
    //     var workRecordCost = [];
    //     localServer.get(id, function(result) {
    //         var data = result.data;
    //         if (result.success == "1") {
    //             that.params.workId = data.workId;
    //             that.params.objectId = data.objectId;
    //             that.params.totalCost = data.totalCost || '';
    //             that.params.captialTotalCost = data.captialTotalCost || '';
    //             that.params.content = data.content;
    //             that.params.satisfaction = data.satisfaction || '';
    //             data.workRecordCost.forEach(function(item) {
    //                 if (item.name.trim()) {
    //                     workRecordCost.push(item);
    //                 }
    //             });
    //            that.params.workRecordCost = workRecordCost;
    //            that.params.picUrl=data.picUrl;
    //            that.params.signatureUrl=data.signatureUrl;
    //            that.upload();
    //         }
    //     });
    // },
    // upload : function() {
    //     var that=this;
    //     uploadRecord(that.params, function() {
    //         that.delete(vm.maintancechecked[that.num]);
    //     }, function(data) {
    //         if (data.code === 'XE05002') {               
    //             that.hasCheckCount++;
    //         }
    //          that.num++;
    //          that.uploadToServer();
    //     });
    // },    
};
    // window.onerror = function(msg, url, line) {
            // alert("erro" + msg + "\n" + url + ":" + line);
            // return true;
        // };