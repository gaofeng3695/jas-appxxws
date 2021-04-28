appcan.ready(function() {
    newGasObj.init();
});

// window.onerror = function(msg, url, line) {
// alert("erro" + msg + "\n" + url + ":" + line);
// return true;
// };

(function(appcan, window, $, baseOperation) {
    var obj = {
        paramObj : {},
        resource : appcan.locStorage.val('gasmeterEntrance'),
        oGasmeterObj : JSON.parse(appcan.locStorage.val('oGasmeter')),
        elem : {
            gasmeterTypeCode : '#chooseusertype',
            gasmeterEntermode : 'input[name="isLeakage"]',
            gasmeterStatusCode : '.chooseuserstatus',
            gasmeterCode : '#gasmeterCode',
            manufactureDate : '#manufactureDate',
            serviceLife : '#serviceLife',
            manufacturer : '#manufacturer',
            gasmeterMode : '#gasmeterMode',
            specifications : '#specifications',
            selectDate : ".selectDate",
        },
        init : function() {
            this.initElem();
            this.bindEvent();
            this.initParamsObjandRender();
        },
        initElem : function() {
            var eles = this.elem;
            for (var name in eles) {
                if (eles.hasOwnProperty(name)) {
                    this[name] = $(eles[name]);
                }
            }
        },
        bindEvent : function() {
            var that = this;
            that.selectDate.click(function() {
                that.chooseDate();
            });
            //进行日期的选择
            appcan.select("#usertype", function(ele, value) {
                var thisText = ele[0].options[ele[0].selectedIndex].text;
                that.paramObj.gasmeterTypeName = thisText;
                that.paramObj.gasmeterTypeCode = value;
            });
            //进行用户类型的选择
            appcan.select("#userstatus", function(ele, value) {
                var thisText = ele[0].options[ele[0].selectedIndex].text;
                that.paramObj.gasmeterStatusName = thisText;
                that.paramObj.gasmeterStatusCode = value;
            });
            //进行用户状态的选择
        },
        initParamsObjandRender : function() {
            var that = this;
            appcan.locStorage.remove('gasmeterEntrance');
            var obj = {};
            var _obj = this.oGasmeterObj;
            if (that.resource == 'modify') {//修改；
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
                    operationFlag : "1",
                    objectId : baseOperation.createuuid(),
                    userFileId : _obj.userFileId,
                    gasmeterName : _obj.gasmeterName,
                }
            }
            $.extend(that.paramObj, obj);
            this.renderPage(that.paramObj);
        },
        updateParamObj : function() {
            var that = this;
            var obj = {
                gasmeterEntermode : this.gasmeterEntermode.filter(':checked').attr("value"),
                gasmeterCode : this.gasmeterCode.val().trim(),
                manufactureDate : this.manufactureDate.val(),
                serviceLife : this.serviceLife.val().trim(),
                manufacturer : this.manufacturer.val().trim(),
                gasmeterMode : this.gasmeterMode.val().trim(),
                specifications : this.specifications.val().trim(),
            };
            $.extend(that.paramObj, obj);
        },
        renderPage : function(obj) {
            var that = this;
            that.gasmeterTypeCode.val(obj.gasmeterTypeCode).trigger('change');
            that.gasmeterEntermode.filter('[value="' + obj.gasmeterEntermode + '"]').attr("checked", true);
            that.gasmeterStatusCode.val(obj.gasmeterStatusCode).trigger('change');
            that.gasmeterCode.val(obj.gasmeterCode || "");
            that.manufactureDate.val(obj.manufactureDate || "");
            that.serviceLife.val(obj.serviceLife || "");
            that.manufacturer.val(obj.manufacturer || "");
            that.gasmeterMode.val(obj.gasmeterMode || "");
            that.specifications.val(obj.specifications || "");
        },
        chooseDate : function(e) {
            var that = this;
            if (window.uexDateRangePicker) {
                if (!that.isCbOpenDateSeted) {
                    that.isCbOpenDateSeted = true;
                    uexDateRangePicker.cbOpenWheelDate = function(opId, dataType, data) {
                        if (!data) {
                            return;
                        }
                        that.manufactureDate.val(data);
                    };
                }
                var param = {
                    minDate : "", //最小时间 2017-02-03
                    maxDate : (new Date()).Format("yyyy-MM-dd") //最大时间
                };
                uexDateRangePicker.openWheelDate(JSON.stringify(param));
            } else {
                that.manufactureDate.val("2017-06-22");
            }
        },
        saveGas : function() {//进行燃气表的保存
            this.updateParamObj();
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
