var varifyObj = {
    typeCodeName: function(s) {
        if (s.length > 4) {
            return true;
        }
        return false;
    },
    address: function(s) {
        if (s.trim().length > 0) {
            return true;
        }
        return false;
    },
    remediationTime: function(s) {
        if (s) {
            return true;
        }
        return false;
    },
    reason: function(s) {
        if (s.trim().length > 0 && s.trim().length < 201) {
            return true;
        }
        return false;
    },
    maintainers: function(s) {
        if (s.trim().length > 0) {
            return true;
        }
        return false;
    },
    contactPhone: function(s) {
        var rex = /^((1\d{10})|(([0-9]{3,4}-)?[0-9]{7,8}))$/;
        if (s.trim() == '' || s.trim() == undefined) {
            return false;
        } else if (!rex.test(s.trim())) {
            return false;
        } else {
            return true;
        }
    },
    maintenanceName: function(s) {
        if (s.trim().length > 0) {
            return true;
        }
        return false;
    }
};
var vm = new Vue({
    el: '#app',
    data: {
        buzId: '', //用户档案ID（入户整改）、管道设施ID（管道设施）、事件ID（巡检事件
        maintenanceName: '',
        originTypeCode: 'MO_01',
        typeCode: '',
        typeCodeName: '',
        address: '',
        reason: '',
        remediationTime: '',
        relationshipPerson: [],
        contactPhone: '',
        originTypes:[],
        //originTypeName:'',
        valid: {
            address: true,
            typeCodeName: true,
            remediationTime: true,
            reason: true,
            maintainers: true,
            contactPhone: true,
            maintenanceName: true
        },
    },
    computed: {
        maintainers: function() {
            return this.relationshipPerson.map(function(item, index) {
                return item.relationshipPersonName;
            }).join('，');
        },
        originTypeName: function() {
            var arr = this.originTypes;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].value === this.originTypeCode) {
                    return arr[i].text;
                }
            }
            return '';
        },
        // originTypes: function() {
            // return [{
                // value: 'MO_01',
                // text: '入户整改'
            // }, {
                // value: 'MO_02',
                // text: '管网设施'
            // }, {
                // value: 'MO_03',
                // text: '巡检事件'
            // }, {
                // value: 'MO_99',
                // text: '其他维修'
            // }];
        // },
    },
    watch: {
        originTypeCode: function() {
            this.clearInput();
        }
    },
    mounted:function(){
        appcan.ready(function() {
            operations.getMaintenanceType(); 
        });
    },
    methods: {
        varifyValue: function(value, key) {
            if (!varifyObj[key]) {
                this.valid[key] = false;
                return;
            }
            this.valid[key] = varifyObj[key](value);
        },
        clearInput: function() {
            this.buzId = "";
            this.maintenanceName = "";
            this.typeCode = "";
            this.typeCodeName = "";
            this.address = "";
            this.contactPhone = "";
        },
        selectEvent: function() { //打开事件列表
            appcan.openWinWithUrl('selectevent', '../new_maintenance/selectevent.vue.html');
        },
        selectHouser: function() {

            appcan.openWinWithUrl('selectaddress', '../new_maintenance/selectaddress.html');
        },
        selectFacility: function() {
            appcan.openWinWithUrl('choosePipe', '../../pipe_equipment/new_check/choosePipe.html');
        },
        selectPeople: function() {
            var windowParam = {
                "parentWidowId": "new_maintenance.vue",
                "windowId": "new_maintenance_content.vue",
                "functionName": ""
            };
            appcan.locStorage.setVal("useSelectList_param", windowParam);
            appcan.openWinWithUrl("users-select", "../../common/page/users_select_all/users_select_all.html");
        },
        selectDate: function() {
            var that = this;
            if (window.uexDateRangePicker) {
                if (!that.isCbOpenDateSeted) {
                    that.isCbOpenDateSeted = true;
                    uexDateRangePicker.cbOpenWheelDate = function(opId, dataType, data) {
                        if (!data) {
                            return;
                        }
                        that.remediationTime = data;
                    };
                }
                var param = {
                    minDate: (new Date()).Format("yyyy-MM-dd"), //最小时间 2017-02-03
                    maxDate: '' //最大时间
                };
                //alert(JSON.stringify(param));
                uexDateRangePicker.openWheelDate(JSON.stringify(param));
            } else {
                that.remediationTime = "2017-09-28";
            }
        },
    }
});

var operations = {
    defaultOrig:"",
    refreshData: function() {
        var obj = JSON.parse(appcan.locStorage.val("equipmentSelectedObjs"));
        if (obj) {
            appcan.locStorage.remove("equipmentSelectedObjs")
            vm.buzId = obj.objectId;
            vm.maintenanceName = obj.facilityName || obj.eventCode || obj.userFileName || "";
            vm.typeCode = obj.facilityTypeCode || obj.type || "";
            vm.typeCodeName = obj.facilityTypeName || obj.fullTypeName || "";
            vm.contactPhone = obj.contactPhone || "";
            vm.address = obj.address;
        }
        this.importName();
    },
    importName: function() {
        var people_data = [];
        var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
        var userId = userBo.objectId;
        var userName = userBo.userName;
        var peopleNames = "";
        /*判断人员选中页面，是否传值是否为空*/
        if (appcan.locStorage.getVal("userSelect") != "" && appcan.locStorage.getVal("userSelect") != null && appcan.locStorage.getVal("userSelect") != "undefined") {
            //标识选中有值
            var people_select = appcan.locStorage.getVal("userSelect");
            var people_data1 = JSON.parse(people_select).peo_data;
            people_data1.forEach(function(item) {
                var obj = {
                    'relationshipPersonId': item.userId,
                    'relationshipPersonName': item.userName
                }
                people_data.push(obj);
            });
        }
        vm.relationshipPerson = people_data;
    },
    savetoservice: function() {
        appcan.window.evaluateScript('new_maintenance','vm.disabled=true'); 
        var param = {
            objectId: baseOperation.createuuid(),
            maintenanceCode: new Date().Format("yyyyMMddHHmmssS"),
            originTypeCode: vm.originTypeCode,
            originTypeName: vm.originTypeName,
            maintenanceName: vm.maintenanceName,
            typeCode: vm.typeCode,
            typeName: vm.typeCodeName,
            remediationTime: vm.remediationTime,
            address: vm.address,
            reason: vm.reason,
            buzId: vm.buzId,
            contactPhone: vm.contactPhone || "",
            relationshipPerson: vm.relationshipPerson
        };             
        if (this.varify()) {
                baseOperation.londingToast('正在上传数据，请稍后...',99999);
                var sUrl = "cloudlink-inspection-event/commonData/maintenanceWork/save";
                jasRequest.post(sUrl, param, function(data) {
                    baseOperation.alertToast("新建成功");                  
                    appcan.window.evaluateScript('new_maintenance', 'operations.close()');
                    // appcan.window.evaluateScript('new_maintenance', 'vm.disabled=false');
                },function(data){
                    baseOperation.alertToast("新建失败");
                    appcan.window.evaluateScript('new_maintenance', 'vm.disabled=false');
                });
        } else {
           appcan.window.evaluateScript('new_maintenance', 'vm.disabled=false');
        }
    },
    varify: function() {
        var flags = true;
        var varifyArr = ['maintenanceName', 'contactPhone', 'address', 'maintainers', 'remediationTime', 'reason'];
        var value = [vm.maintenanceName, vm.contactPhone, vm.address, vm.maintainers, vm.remediationTime, vm.reason, ]
        for (var i = 0; i < varifyArr.length; i++) {
            if (vm.originTypeCode == !"MO_99" && i == 1) {
                continue;
            }
            if (vm.originTypeCode == "MO_99") {
                if (value[i].trim().length == 0 && varifyArr[i] == "contactPhone") {
                    baseOperation.alertToast("请填写联系电话");
                    flags = false;
                    return
                }
                if (varifyArr[i] == "address") {
                    if (value[i].trim().length == 0) {
                        baseOperation.alertToast("请填写地址");
                        flags = false;
                        return
                    } else if (value[i].trim().length > 100) {
                        baseOperation.alertToast("地址不能超过100个字");
                        flags = false;
                        return
                    }
                }
                if (varifyArr[i] == "maintenanceName") {
                    if (value[i].trim().length == 0) {
                        baseOperation.alertToast("请填写联系人");
                        flags = false;
                        return
                    } else if (value[i].trim().length > 20) {
                        baseOperation.alertToast("联系人不能超过20个字");
                        flags = false;
                        return
                    }
                }
            }
            if (vm.originTypeCode == "MO_01" && varifyArr[i] == "address") {
                if (value[i].trim().length == 0) {
                    baseOperation.alertToast("请选择用户地址");
                    flags = false;
                    return;
                }
            }
            if (i == 5 && value[i].trim().length == 0) {
                baseOperation.alertToast("请填写维修原因");
                flags = false;
                return
            }
            var flag = varifyObj[varifyArr[i]](value[i]);
            if (!flag) {
                if (i == 0) {
                    if (vm.originTypeCode == "MO_02") {
                        baseOperation.alertToast("请进行设施选择");
                        flags = false;
                        return;
                    }
                    if (vm.originTypeCode == "MO_03") {
                        baseOperation.alertToast("请进行事件选择");
                        flags = false;
                        return;
                    }
                }
                if (varifyArr[i] == "contactPhone" && vm.originTypeCode == "MO_99") {
                    baseOperation.alertToast("请填写正确的手机号码");
                    flags = false;
                    return;
                }
                if (varifyArr[i] == "maintainers") {
                    baseOperation.alertToast("请选择维修人");
                    flags = false;
                    return;
                }
                if (varifyArr[i] == "remediationTime") {
                    baseOperation.alertToast("请选择维修期限");
                    flags = false;
                    return;
                }
                if (varifyArr[i] == "reason") {
                    baseOperation.alertToast("维修原因最多可输入200字");
                    flags = false;
                    return;
                }
            }
        }
        return flags;
    },
  getMaintenanceType:function() {
        var that = this;
        var sUrl = "cloudlink-core-framework/menu/checkAccess";
        var queryObj = {
            "appId" : "0c753fdd-5f54-4b24-bf50-491ea5eb1a84",
            "menuCode" : "securityRecord"
        };
        jasRequest.get(sUrl, queryObj, function(data) {
            if (data.success == 1) {
                if (data.rows[0].access) {
                    that.defaultOrig="MO_01";
                    vm.originTypes.push({
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
                    if(! that.defaultOrig){
                       that.defaultOrig="MO_02";   
                    }                     
                     vm.originTypes.push({
                        value : 'MO_02',
                        text : '管网设施'
                    });
                }
            }
            that.render();
        });
    },
    render : function() {
        var that=this;
         if(!that.defaultOrig){
            that.defaultOrig="MO_03";   
          }
       vm.originTypeCode=that.defaultOrig   ;
       vm.originTypes.push({
            value : 'MO_03',
            text : '巡检事件'
        });
        vm.originTypes.push({
            value : 'MO_99',
            text : '其他维修'
        });
        this.renderOriginTypeName();
    },
   renderOriginTypeName: function() {
       var text="";
       var arr = vm.originTypes;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].value === vm.originTypeCode) {
                    text= arr[i].text;
                }
            }
          vm.originTypeName=text;
     },
};