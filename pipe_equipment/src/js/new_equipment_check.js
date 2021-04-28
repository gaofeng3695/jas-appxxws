 // window.onerror = function(msg, url, line) {
     // alert("erro" + msg + "\n" + url + ":" + line);
     // return true;
 // };

 appcan.ready(function() {

     newEquipmentCheckObj.init();

 });

 (function(appcan, window, $, baseOperation, JasHttpRequest, imagesObj, voiceObj, getLocationObj) {
     var obj = {
         paramsObj: null,
         eventsMap: {
             'click #selectEquip': 'e_selectEquip',
             'click #seefacilityAddress': 'e_seefacilityAddress',
             'change input[type="radio"]': 'e_triggerRadioChange',
             'blur #combustibleGasConcentration': 'e_checkCombustibleGasConcentration',
             'blur #pressureIn': 'e_checkPressureIn',
             'blur #pressureOut': 'e_checkPressureOut',
         },
         elem: {
             maskWrapper: '#maskWrapper',
             pressWrapper: '.press',
             flowWrapper: '.flow',
             wellWrapper: '.well',
             result: '#result',

             facilityCheckTime: '#facilityCheckTime',
             facilityName: '#facilityName',
             facilityTypeName: '#facilityTypeName',
             facilityAddress: '#facilityAddress',
             isLeakage: '.isLeakage',
             combustibleGasConcentration: '#combustibleGasConcentration',
             isFacilityWork: '.isFacilityWork',
             facilityWorkDesc: '#facilityWorkDesc',
             pressureSituation: '.pressureSituation',
             pressureIn: '#pressureIn',
             pressureOut: '#pressureOut',
             isSeeper: '.isSeeper',
             isWellCoverDamage: '.isWellCoverDamage',
             isOccupy: '.isOccupy',
             flowmeterData: '#flowmeterData',
             remark: '#remark'
         },
         init: function() {
             imagesObj.init({
                 wrapper: '.photo_list',
                 max: 6,
                 domCount: '#pic_count',
                 domMax: '#pic_count_max',
             });
             this.initAppcanParams();

             this.initParamsObj();
             this.initElem();
             this.initParamsObjandRender();
             this.bindEvent();
             baseOperation.addEmojiFliterEvent('textarea');
             //绑定过滤emoji的事件
         },
         initAppcanParams: function() {
             this.jasHttpRequest = new JasHttpRequest();
         },
         initParamsObj: function() {
             //var recordId = baseOperation.createuuid();
             this.paramsObj = {
                 facilityName: '',
                 address: '',
                 facilityTypeCode: '',
                 facilityTypeName: '',
                 localbdLat: '',
                 localbdLon: '',

                 objectId: baseOperation.createuuid(), //ID
                 facilityId: '', //设施ID
                 facilityCheckTime: (new Date()).Format("yyyy-MM-dd HH:mm:ss"), // 设施检查时间（手机客户端时间，不可编辑）

                 facilityCheckResult: '', //检查结果(0:正常  1:异常)
                 isLeakage: 0, //漏气状态、是否漏气（0：否   1：是   ）
                 combustibleGasConcentration: '', //可燃气体浓度
                 isFacilityWork: 0, //设施运行情况（0:正常  1：异常）
                 facilityWorkDesc: '', //设施运行描述
                 pressureSituation: 0, //压力情况（0:正常  1：异常）
                 pressureIn: '', //进口压力
                 pressureOut: '', //出口压力
                 isSeeper: 0, //井内有无积水（0:无  1：有）
                 isWellCoverDamage: 0, //井盖是否损毁（0:否  1：是）
                 isOccupy: 0, //有无占压（0:无  1：有）
                 flowmeterData: '', //流量计读数
                 remark: '', //备注
                 inspector_address: '', // 检查人详细位置（只存储，不显示）
                 bdLon: '', //百度坐标lon 
                 bdLat: '', //百度坐标lat 
                 lon: '', //GPS坐标lon 
                 lat: '', //GPS坐标lat
                 attas: [
                     // {
                     //     attaType: "pic",
                     //     src: '../src/images/map_h.png'
                     // }                        
                 ],
                 voiceSrc: '', //声音路径
                 inspRecordId:uexLockScreen.getRecordId()//inspRecordId 跟巡线挂钩 inspRecordId  sf 2017-06-27 改
             };
         },
         initParamsObjandRender: function() {
             var that = this;
             var clickResource = appcan.locStorage.getVal('equipmentCheckEntrance');
             that.Entrance = clickResource;
             appcan.locStorage.remove('equipmentCheckEntrance');

             if (clickResource === "new") {
                 that.renderPage(that.paramsObj);
                 that.getUserLocation();
                 return;
             }

             if (clickResource === "dailyCheck") {                
                 that.renderPage(that.paramsObj);
                 that.getUserLocation();
                 //that.facilityAddress.parent().removeClass('bgSelectLoca');
                 return;
             }


             if (clickResource === "map") {
                 that.trigerEquipmentSelected();
                 that.renderPage(that.paramsObj);
                 that.getUserLocation();
                 return;
             }
             if (clickResource === "local") {
                 //进行本地存储的查找，然后进行赋值
                 var recordId = appcan.locStorage.getVal('facilityCheckId');
                 selectOfflineFacilityRecord(recordId, function(result) { //查询安检记录的详情
                     if (result.success == 1) {
                         //alert(JSON.stringify(result));
                         $.extend(that.paramsObj, result.data);
                         that.renderPage(that.paramsObj);
                        that.checkPostData(that.paramsObj);                         
                         //that.initImg(recordId);
                     } else {
                         baseOperation.alertToast("数据加载失败,请返回重试");
                     }
                 });
             }
         },
         renderPage: function(obj) { //recordObject
             var that = this;
             //进行初始化表格

             that.facilityCheckTime.html(obj.facilityCheckTime);
             that._renderFacilityInfo(obj);
             that._renderSwitchForm(obj);

             that.remark.val(obj.remark || '');

             imagesObj.renderPicAndCount(obj.attas.map(function(item) { //渲染图片
                 return item.url;
             }));

             voiceObj.init(obj.voiceSrc || ''); //初始化声音，渲染页面
         },
         getUserLocation: function() {
             var that = this;
             getLocationObj.init(function(sObj) {
                 var obj = JSON.parse(sObj);
                 that.paramsObj.bdLon = obj.bdLon; //百度坐标lon 
                 that.paramsObj.bdLat = obj.bdLat; //百度坐标lat 
                 that.paramsObj.lon = obj.lon; //GPS坐标lon 
                 that.paramsObj.lat = obj.lat; //GPS坐标lat            
             });
         },
         _renderFacilityInfo: function(obj) {
             var that = this;
             // 渲染设备名称
             var sName = obj.facilityName || '';
             if (sName) {
                 $('.disableMask').removeClass('disableMask');
             } else {
                 sName = '<span class="sc-text-active">请点击选择</span>';
             }
             that.facilityName.html(sName);
             //渲染设施类型
             that.facilityTypeName.html(obj.facilityTypeName || '');
             //渲染位置
             that.facilityAddress.html(obj.address || '');
             if (obj.address && that.Entrance !== 'dailyCheck') {
                 that.facilityAddress.parent().addClass('bgSelectLoca');
             } else {
                 that.facilityAddress.parent().removeClass('bgSelectLoca');
             }
         },
         _renderSwitchForm: function(obj) {
             var that = this;

             that.isLeakage.filter('[value = "' + obj.isLeakage + '"]').attr('checked', true);
             that.combustibleGasConcentration.val(obj.combustibleGasConcentration || '');
             that.isFacilityWork.filter('[value = "' + obj.isFacilityWork + '"]').attr('checked', true);
             that.facilityWorkDesc.val(obj.facilityWorkDesc || '');

             var sType = obj.facilityTypeCode || '';

             if (sType === 'FT_01') { //调压设备
                 that.wellWrapper.addClass('uhide');
                 that.flowWrapper.addClass('uhide');
                 that.pressWrapper.removeClass('uhide');
                 that.pressureSituation.filter('[value = "' + obj.pressureSituation + '"]').attr('checked', true);
                 that.pressureIn.val(obj.pressureIn || '');
                 that.pressureOut.val(obj.pressureOut || '');
                 if(!obj.pressureIn){
                      that.pressureIn.parent().addClass('bgMustDone');
                 }
                 if(!obj.pressureOut){
                      that.pressureOut.parent().addClass('bgMustDone');
                 }
             } else if (sType === 'FT_04') { //井
                 that.wellWrapper.removeClass('uhide');
                 that.flowWrapper.addClass('uhide');
                 that.pressWrapper.addClass('uhide');
                 that.isSeeper.filter('[value = "' + obj.isSeeper + '"]').attr('checked', true);
                 that.isWellCoverDamage.filter('[value = "' + obj.isWellCoverDamage + '"]').attr('checked', true);
                 that.isOccupy.filter('[value = "' + obj.isOccupy + '"]').attr('checked', true);
             } else if (sType === 'FT_10') { //流量计
                 that.wellWrapper.addClass('uhide');
                 that.flowWrapper.removeClass('uhide');
                 that.pressWrapper.addClass('uhide');
                 that.flowmeterData.val(obj.flowmeterData || '');
                 
             } else {
                 that.wellWrapper.addClass('uhide');
                 that.flowWrapper.addClass('uhide');
                 that.pressWrapper.addClass('uhide');
             }
             that._renderAndUpdateResult(obj);
         },
         _renderAndUpdateResult: function(obj) {
             var that = this;
             var sType = obj.facilityTypeCode || '';
             if (!sType) {
                 that.result.html('--').removeClass('clrWarn');
                 return;
             }
             that.maskWrapper.removeClass('disableMask');
             that._setResult(false);
             if ((obj.isLeakage == 1) || (obj.isFacilityWork == 1)) {
                 that._setResult(true);
                 return;
             }
             if (sType === 'FT_01') { //调压设备
                 that._setResult(obj.pressureSituation == 1);
                 return;
             }
             if (sType === 'FT_04') { //井
                 that._setResult((obj.isSeeper == 1) || (obj.isWellCoverDamage == 1) || (obj.isOccupy == 1));
             }
         },
         _setResult: function(isdanger) {
             var that = this;
             if (isdanger) {
                 that.result.html('异常').addClass('clrWarn');
                 that.paramsObj.facilityCheckResult = 1;
             } else {
                 that.result.html('正常').removeClass('clrWarn');
                 that.paramsObj.facilityCheckResult = 0;
             }
         },

         checkPostData: function(obj) {
             var that = this;
             if (!that._checkSwitchFrom(obj)) {
                 return false;
             }
             return true;
         },
         _checkSwitchFrom: function(obj) {
             var that = this;

             var sType = obj.facilityTypeCode || '';
             if (!sType) {
                 baseOperation.alertToast("请选择设施", 2000);
                 return false;
             }
             //可燃气体的浓度，输入框，默认为空，必填项，范围0.000-9999.000
             if (!that.e_checkCombustibleGasConcentration()) {
                return false;
             }             
             // if (!obj.combustibleGasConcentration || !(/^[0-9]{1,4}(\.[0-9]{1,3})?$/g).test(obj.combustibleGasConcentration)) {
             //     baseOperation.alertToast("可燃气体的浓度必填，范围0.000-9999.999", 3000);
             //     return false;
             // }
             if (!that.e_checkPressureIn()) {
                return false;
             }  
             if (!that.e_checkPressureOut()) {
                return false;
             }  
             // if (sType === 'FT_01') { //调压设备
             //     if (!obj.pressureIn || !(/^[0-9]{1,4}(\.[0-9]{1,3})?$/g).test(obj.pressureIn)) {
             //         baseOperation.alertToast('进口压力必填，范围0.000~9999.999', 3000);
             //         return false;
             //     }
             //     if (!obj.pressureOut || !(/^[0-9]{1,4}(\.[0-9]{1,3})?$/g).test(obj.pressureOut)) {
             //         baseOperation.alertToast('出口压力必填，范围0.000~9999.999', 3000);
             //         return false;
             //     }
             // }         

             if (sType === 'FT_10') { //流量计
                 if (obj.flowmeterData && !(/^[0-9]{1,7}(\.[0-9]{1,2})?$/g).test(obj.flowmeterData)) {
                     baseOperation.alertToast('流量计读数范围0.00-9999999.99', 3000);
                     return false;
                 }
                 return true;
             }
             return true;
         },
         e_checkCombustibleGasConcentration: function() {
             var that = this;
             var sVal = that.combustibleGasConcentration.val();
             //可燃气体的浓度，输入框，默认为空，必填项，范围0.000-9999.000
             if (!sVal || !(/^[0-9]{1,4}(\.[0-9]{1,3})?$/g).test(sVal)) {
                 baseOperation.alertToast("可燃气体的浓度必填，范围0.000-9999.999", 3000);
                 that.combustibleGasConcentration.parent().addClass('bgMustDone');
                 return false;
             }          
             that.combustibleGasConcentration.parent().removeClass('bgMustDone');
             return true;                
         },
         e_checkPressureIn: function() {
             var that = this;
             var sVal = that.pressureIn.val();
             var sType = that.paramsObj.facilityTypeCode || '';             
             if (sType === 'FT_01') { //调压设备
                 if (!sVal || !(/^[0-9]{1,4}(\.[0-9]{1,3})?$/g).test(sVal)) {
                     that.pressureIn.parent().addClass('bgMustDone');
                     baseOperation.alertToast('进口压力必填，范围0.000~9999.999', 3000);
                     return false;
                 }
             }
             that.pressureIn.parent().removeClass('bgMustDone');
             return true;
         },
         e_checkPressureOut: function() {
             var that = this;
             var sVal = that.pressureOut.val();
             var sType = that.paramsObj.facilityTypeCode || '';             
             if (sType === 'FT_01') { //调压设备
                 if (!sVal || !(/^[0-9]{1,4}(\.[0-9]{1,3})?$/g).test(sVal)) {
                     that.pressureOut.parent().addClass('bgMustDone');
                     baseOperation.alertToast('出口压力必填，范围0.000~9999.999', 3000);
                     return false;
                 }
             }
             that.pressureOut.parent().removeClass('bgMustDone');             
             return true;
         },
         initElem: function() {
             var eles = this.elem;
             for (var name in eles) {
                 if (eles.hasOwnProperty(name)) {
                     this[name] = $(eles[name]);
                 }
             }
         },
         updateParamsObj: function() {
             var that = this;
             var obj = {
                 combustibleGasConcentration: that.combustibleGasConcentration.val().trim(),
                 facilityWorkDesc: that.facilityWorkDesc.val().trim(),
                 pressureIn: that.pressureIn.val().trim(), //进口压力
                 pressureOut: that.pressureOut.val().trim(), //出口压力 
                 flowmeterData: that.flowmeterData.val().trim(),
                 remark: that.remark.val().trim(),
             };
             $.extend(that.paramsObj, obj);
             that._updateAttaArr(); //更新图片
             that.paramsObj.voiceSrc = voiceObj.recordPath;

             //alert(JSON.stringify(that.paramsObj));
         },
         _updateAttaArr: function() {
             var that = this;
             that.paramsObj.attas = imagesObj.imgArray.map(function(item, index) {
                 return {
                     bizType: 'pic', //pic 、esignature 
                     url: item.src
                 };
             });
         },
         bindEvent: function() {
             this.initializeOrdinaryEvent(this.eventsMap);
         },
         initializeOrdinaryEvent: function(maps) {
             this._scanEventsMap(maps, true);
         },
         _scanEventsMap: function(maps, isOn) {
             var delegateEventSplitter = /^(\S+)\s*(.*)$/;
             var type = isOn ? 'on' : 'off';
             for (var keys in maps) {
                 if (maps.hasOwnProperty(keys)) {
                     if (typeof maps[keys] === 'string') {
                         maps[keys] = this[maps[keys]].bind(this);
                     }
                     var matchs = keys.match(delegateEventSplitter);
                     $('body')[type](matchs[1], matchs[2], maps[keys]);
                 }
             }
         },
         trigerSaveToLocal: function() {
             this.updateParamsObj();
             if (this.checkPostData(this.paramsObj)) {
                 this.saveDataTOLocal();
             }
         },
         triggerToUpload: function() {
             var that = this;
             this.updateParamsObj();
             if (this.checkPostData(this.paramsObj)) {
                 appcan.window.evaluateScript('new_check', 'wrapperObj.isPostReady = false;');
                 uploadObj.uploadRecordByBO(this.paramsObj, function() {
                     if (that.Entrance === 'local') {
                         deleteOfflineFacilityRecord([that.paramsObj.objectId]);
                         appcan.window.evaluateScript('new_check', 'appcan.window.close(-1);');
                         return;
                     }
                     if (that.Entrance === 'dailyCheck') {
                         that.upInsEventCount();
                         appcan.window.evaluateScript('new_check', 'appcan.window.close(-1);');
                         appcan.openWinWithUrl("daily_check", "../../daily_check/daily_check.html");
                         return;
                     }
                     that.upInsEventCount(); 
                     appcan.window.evaluateScript('new_check', 'appcan.window.close(-1);');
                 }, function() {
                     //baseOperation.alertToast('管网设施上传失败');
                     appcan.window.evaluateScript('new_check', 'wrapperObj.isPostReady = true;');
                 });
             }

         },
         saveDataTOLocal: function() {
             var that = this;
             var oData = $.extend({}, this.paramsObj);
             var arrayData = [{
                 objectId: oData.objectId, //检查记录ID
                 facilityId: oData.facilityId, //设备ID
                 facilityName: oData.facilityName, //设备名称
                 address: oData.address, //设备地址
                 facilityTypeCode: oData.facilityTypeCode, //设备类型编号
                 facilityTypeName: oData.facilityTypeName, //设备类型名称
                 facilityCheckTime: oData.facilityCheckTime, //检查时间
                 facilityCheckResult: oData.facilityCheckResult, //检查结果
                 postData: JSON.stringify(oData), //数据体
             }];
             //alert(JSON.stringify(oData));
             //alert("baocin"+JSON.stringify(arrayData));
             appcan.window.evaluateScript('new_check', 'wrapperObj.isSaveReady = false;');
             if (that.Entrance === "local") {
                 updateOfflineFacilityRecord(arrayData[0], function(result) {
                     //alert(JSON.stringify(result));
                     if (+result.success === 1) {
                         baseOperation.alertToast("保存成功", 2000); //本地保存成功之后，需要进行什么操作。
                         that.upInsEventCount();
                         appcan.window.evaluateScript('new_check', 'appcan.window.close(-1);');
                         appcan.openWinWithUrl("daily_check", "../../daily_check/daily_check.html");
                         return;
                     } else {
                         baseOperation.alertToast("数据保存失败！");
                     }
                     appcan.window.evaluateScript('new_check', 'wrapperObj.isSaveReady = true;');
                 });
                 return;
             }
             //alert(JSON.stringify(arrayData));
             saveOfflineFacilityRecord(arrayData, function(result) {
                 //alert(JSON.stringify(result))
                 if (+result.success === 1) {
                     baseOperation.alertToast("保存成功", 2000); //本地保存成功之后，需要进行什么操作。
                    if (that.Entrance === 'dailyCheck') {
                         that.upInsEventCount();
                         appcan.window.evaluateScript('new_check', 'appcan.window.close(-1);');
                         appcan.openWinWithUrl("daily_check", "../../daily_check/daily_check.html");
                         return;
                    }  
                     that.upInsEventCount();                   
                     appcan.window.evaluateScript('new_check', 'appcan.window.close(-1);');
                     return;
                 } else {
                     baseOperation.alertToast("数据保存失败！");
                 }
                 appcan.window.evaluateScript('new_check', 'wrapperObj.isSaveReady = true;');
             });
         },
         e_seefacilityAddress: function() {
             if (!this.paramsObj.address || !this.facilityAddress.parent().hasClass('bgSelectLoca')) {
                 return;
             }
             appcan.locStorage.val('bdPointObj', {
                 bdLon: this.paramsObj.localbdLon || '',
                 bdLat: this.paramsObj.localbdLat || '',
                 address: this.paramsObj.address || ''
             });
             appcan.openWinWithUrl('maplocation', '../detail_check/maplocation.html');
         },
         e_selectEquip: function() {
             var that = this;
             appcan.openWinWithUrl('choosePipe', '../new_check/choosePipe.html');
             appcan.locStorage.remove('equipmentSelectedObjs');
         },
         e_triggerRadioChange: function(e) {
             var that = this;
             var me = $(e.target);
             var type = me.attr('name');
             that.paramsObj[type] = me.attr('value');
             that._renderAndUpdateResult(that.paramsObj);
         },
         trigerEquipmentSelected: function() {
             var that = this;
             var sObj = appcan.locStorage.val('equipmentSelectedObjs');
             if (sObj) {
                 var obj = JSON.parse(sObj);
                 that.paramsObj.facilityId = obj.objectId;
                 that.paramsObj.facilityName = obj.facilityName;
                 that.paramsObj.facilityTypeName = obj.facilityTypeName;
                 that.paramsObj.facilityTypeCode = obj.facilityTypeCode;
                 that.paramsObj.address = obj.address;
                 that.paramsObj.localbdLon = obj.bdLon;
                 that.paramsObj.localbdLat = obj.bdLat;
                 that._renderFacilityInfo(that.paramsObj);
                 that._renderSwitchForm(that.paramsObj);
                 
             }
         },
         /*
          * 用于判断是否需要设备检查数量是否增加
          */
         upInsEventCount:function(){
             if(uexLockScreen.checkServerIsRunning()==1){
                var rcxj_facilities_count = appcan.locStorage.getVal("RCXJ_FACILITIES_COUNT");
                appcan.locStorage.setVal("RCXJ_FACILITIES_COUNT",++rcxj_facilities_count);
            }
         }
     };
     window.newEquipmentCheckObj = obj;
 })(appcan, window, Zepto, baseOperation, JasHttpRequest, imagesObj, voiceObj, getLocationObj);
