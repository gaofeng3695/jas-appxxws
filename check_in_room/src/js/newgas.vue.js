// appcan.ready(function() {
//     newGasObj.init();

// });

/*
** 1. vue 数据的双向绑定
        视图层的写法 ： {{}} 、v-model、v-指令
** 2. 循环的写法 v-for
** 3. 显隐判断的写法 v-if v-show
** 4. 事件的写法 v-on:click @click
** 5. 生命周期的认识
**
*/



window.onerror = function(msg, url, line) {
    alert("erro" + msg + "\n" + url + ":" + line);
    return true;
};

var $vue = new Vue({
    el:'#app',
    data : {
        query : {
            operationFlag : "1", //新增
            objectId : baseOperation.createuuid(),
            userFileId : '',
            gasmeterName : '',

            gasmeterTypeCode : '',
            gasmeterEntermode : '右进',
            gasmeterStatusCode : '',
            gasmeterCode : '',
            manufactureDate : '',
            serviceLife : '',
            manufacturer : '',
            gasmeterMode : '',
            specifications : '',
        },
        userTypeOptions : [
            {value : 'GMT_01', text:'机械表'},
            {value : 'GMT_02', text:'IC卡表'},
            {value : 'GMT_03', text:'远传表'},
            {value : 'GMT_99', text:'其他'}
        ],
        userstatusOptions : [
            {value : 'GMUS_01', text:'在用'},
            {value : 'GMUS_02', text:'停用'},
            {value : 'GMUS_03', text:'已拆卸'},    
        ]
    },
    computed : {
        userTypeName : function(){
            var arr = this.userTypeOptions;
            for (var i = 0; i < arr.length; i++) {
                if(arr[i].value === this.query.gasmeterTypeCode){
                    return arr[i].text;
                }
            }
        },
        userstatusName : function(){
            var arr = this.userstatusOptions;
            for (var i = 0; i < arr.length; i++) {
                if(arr[i].value === this.query.gasmeterStatusCode){
                    return arr[i].text;
                }
            }
        }        
    },
    methods : {
        chooseDate : function() {
            var that = this;
            if (window.uexDateRangePicker) {
                if (!this.isCbOpenDateSeted) {
                    this.isCbOpenDateSeted = true;
                    uexDateRangePicker.cbOpenWheelDate = function(opId, dataType, data) {
                        if (!data) {
                            return;
                        }
                        that.query.manufactureDate = data;
                    };
                }
                var param = {
                    minDate : "", //最小时间 2017-02-03
                    maxDate : (new Date()).Format("yyyy-MM-dd") //最大时间
                };
                uexDateRangePicker.openWheelDate(JSON.stringify(param));
            } else {
                that.query.manufactureDate = (new Date()).Format("yyyy-MM-dd");
            }
        },
    },
    beforeCreate: function () { //举个栗子：可以在这加个loading事件 

    },
    created: function () { //在这结束loading，还做一些初始化，实现函数自执行 
        var obj = null;
        var _obj = JSON.parse(appcan.locStorage.val('oGasmeter'));
        if (!_obj) { return; }
        var resource = appcan.locStorage.val('gasmeterEntrance');            
        appcan.locStorage.remove('gasmeterEntrance');            
        if (resource == 'modify') {//修改；
            obj = {
                objectId : _obj.objectId,
                userFileId : _obj.userFileId,
                operationFlag : _obj.operationFlag == "1" ? "1" : "2",
                gasmeterName : _obj.gasmeterName,
                gasmeterTypeCode : _obj.gasmeterTypeCode,
                gasmeterEntermode : _obj.gasmeterEntermode,
                gasmeterStatusCode : _obj.gasmeterStatusCode,
                gasmeterCode : _obj.gasmeterCode,
                manufactureDate : _obj.manufactureDate,
                serviceLife : _obj.serviceLife,
                manufacturer : _obj.manufacturer,
                gasmeterMode : _obj.gasmeterMode,
                specifications : _obj.specifications,
            };
        } else {
            obj = {
                operationFlag : "1", //新增
                objectId : baseOperation.createuuid(),
                userFileId : _obj.userFileId,
                gasmeterName : _obj.gasmeterName,
            }
        }
        alert(123)
        $.extend(this.query, obj);
    },
    mounted: function () { //在这发起后端请求，拿回数据，配合路由钩子做一些事情

    },
 
});


(function(appcan, window, $, baseOperation) {
    var obj = {
        saveGas : function() {//进行燃气表的保存
            this.paramObj = $.extend({},$vue.query);
            this.paramObj.gasmeterTypeName = $vue.userTypeName;
            this.paramObj.gasmeterStatusName = $vue.userstatusName;
            if (this.checkInput()) {
                this.saveGasToLocal();
            }
        },
        checkInput : function() {
            if (!this.e_gasmeterTypeCode()) {
                return false;
            } else if (!this.e_gasmeterStatusCode()) {
                return false;
            } else if (!this.e_gasmeterCode()) {
                return false;
            } else if (!this.e_serviceLife()) {
                return false;
            } else if (!this.e_manufacturer()) {
                return false;
            } else if (!this.e_gasmeterMode()) {
                return false;
            } else if (!this.e_specifications()) {
                return false;
            } else {
                return true;
            }
        },
        saveGasToLocal : function() {//修改或者增加都是本地存储，然后跳转到新建安检记录页面，
            // alert(JSON.stringify(this.paramObj));
            appcan.window.evaluateScript('newgas', 'gasObj.close()');
            appcan.window.evaluatePopoverScript('new_record', 'content', 'newRecordObj.triggerModifyGasmeter(' + JSON.stringify(this.paramObj) + ')');
            appcan.openWinWithUrl('new_record', 'new_record.html');
        },
        e_gasmeterTypeCode : function() {
            if (this.paramObj.gasmeterTypeCode) {
                return true;
            } else {
                baseOperation.alertToast("请选择燃气表类型");
                return false;
            }
        }, //燃气类型的校验
        e_gasmeterStatusCode : function() {
            if (this.paramObj.gasmeterStatusCode) {
                return true;
            } else {
                baseOperation.alertToast("请选择燃气表使用状态");
                return false;
            }
        },
        e_gasmeterCode : function() {
            var gasmeterCode = this.paramObj.gasmeterCode;
            if (gasmeterCode.length > 30) {
                baseOperation.alertToast("燃气编号输入不能超过30个字");
                return false;
            } else {
                return true;
            }
        },
        e_serviceLife : function() {
            var serviceLife = this.paramObj.serviceLife;
            if (serviceLife.length > 15) {
                baseOperation.alertToast("燃气表使用年限不能超过15个字");
                return false;
            } else {
                return true;
            }
        },
        e_manufacturer : function() {
            var manufacturer = this.paramObj.manufacturer;
            if (manufacturer.length > 25) {
                baseOperation.alertToast("燃气表的生产厂家不能超过25个字");
                return false;
            } else {
                return true;
            }
        },
        e_gasmeterMode : function() {
            var gasmeterMode = this.paramObj.gasmeterMode;
            if (gasmeterMode.length > 25) {
                baseOperation.alertToast("燃气表型号不能超过25个字");
                return false;
            } else {
                return true;
            }
        },
        e_specifications : function() {
            var specifications = this.paramObj.specifications;
            if (specifications.length > 100) {
                baseOperation.alertToast("燃气表规格不能超过100个字");
                return false;
            } else {
                return true;
            }
        }
    };
    window.newGasObj = obj;
})(appcan, window, Zepto, baseOperation);
