appcan.ready(function() {
    newEquipmentObj.init();
});


//baseOperation.alertToast("设施名称最多输入12个字", 3000);
(function(appcan, window, Zepto, baseOperation, JasHttpRequest, imagesObj,getLocationObj) {
    var utils = {
        renderSelect: function($dom, sValue) {
            if (!sValue) {
                return;
            }
            $dom.find('select').val(sValue).trigger('change');
        },
    };
    var initFacilitySelect = {
        getPipeType: function(sSelector) {
            var facilityDamin = JSON.parse(appcan.locStorage.getVal("pipelineTypeList"));
            var s = "<option value=''>请选择</option>";
            facilityDamin.forEach(function(item, index, arr) {
                s += "<option value='" + item.domainCode + "'>" + item.domainValue + "</option>";
            });
            $(sSelector).html(s);
        },
        getFacility: function(sSelector) {
            var facilityDamin = JSON.parse(appcan.locStorage.getVal("facilityTypeList"));
            var s = "<option value=''>请选择</option>";
            facilityDamin.forEach(function(item, index, arr) {
                s += "<option value='" + item.domainCode + "'>" + item.domainValue + "</option>";
            });
            $(sSelector).html(s);
        },
        getFacilityStatus: function(sSelector) {
            var facilityDamin = JSON.parse(appcan.locStorage.getVal("facilityStatusList"));
            var s = "<option value=''>请选择</option>";
            facilityDamin.forEach(function(item, index, arr) {
                s += "<option value='" + item.domainCode + "'>" + item.domainValue + "</option>";
            });
            $(sSelector).html(s);
        },        
    };    
    var obj = {
        paramsObj: null,

        eventsMap: {
            'click #selectLocation': 'e_selectLocation',
            'click #selectUser': 'e_selectUser',
            'click .selectDate': 'e_selectDate',
            'blur #facilityName' : 'e_checkFacilityName',
            'blur #facilityCode' : 'e_checkFacilityCode',
        },
        elem: {
            "facilityName": '#facilityName', //设施名称
            "facilityCode": '#facilityCode', //设施编码 
            "facilityTypeCode": '#facilityTypeCode', //设施类型
            "pipelineTypeCode": '#pipelineTypeCode', //管网类型：低压、中压、次高压、高压
            "facilityStatusCode": '#facilityStatusCode', //设施状态:在用、停用、废弃
            "address": "#address", // 详细位置
            "specification": '#specification', //规格            
            "manufacturer": '#manufacturer', //生产厂家
            "installationTime": '#installationTime', //安装日期
            "investmentTime": '#investmentTime', //投产日期
            "inspectionCount": '#inspectionCount', //巡检次数
            "inspectionDays": '#inspectionDays', //巡检天数
            "relationshipPersonList": '#relationshipPersonList'
        },
        init: function() {
            var that = this;
            this.initFacilitySelect();
            this.initParamsObj();
            this.initElem();
            this.bindEvent();
            this.initAppcanParams();



            imagesObj.init({
                wrapper: '.photo_list',
                max: 6,
                domCount: '#pic_count',
                domMax: '#pic_count_max',
            });

            this.initParamsObjandRender();
           

            baseOperation.addEmojiFliterEvent('textarea');
            //绑定过滤emoji的事件
        },
        initAppcanParams: function() {
            this.jasHttpRequest = new JasHttpRequest();
        },
        initFacilitySelect : function(){
            initFacilitySelect.getPipeType(this.elem.pipelineTypeCode +" select");
            initFacilitySelect.getFacility(this.elem.facilityTypeCode +" select");
            initFacilitySelect.getFacilityStatus(this.elem.facilityStatusCode +" select");
        },
        initParamsObj: function() {
            //var recordId = baseOperation.createuuid();
            this.paramsObj = {
                objectId: baseOperation.createuuid(), //ID
                facilityName: '', //设施名称
                facilityCode: '', //设施编码 
                facilityTypeCode: 'FT_01', //设施类型
                pipelineTypeCode: 'PT_01', //管网类型：低压、中压、次高压、高压
                facilityStatusCode: 'FS_01', //设施状态:在用、停用、废弃
                address: '', // 详细位置
                bdLon: '', //百度坐标lon 
                bdLat: '', //百度坐标lat 
                lon: '', //GPS坐标lon 
                lat: '', //GPS坐标lat 
                manufacturer: '', //生产厂家
                specification: '', //规格
                installationTime: null, //安装日期
                investmentTime : null, //投产日期
                inspectionCount: 0, //巡检次数
                inspectionDays: 1, //巡检天数
                relationshipPersonList: [ // 设施干系人、负责人
                    // {
                    //     relationshipPersonId: '',
                    //     relationshipPersonName: ''
                    // }
                ],
                attas: [
                    // {
                    //     attaType: "pic",
                    //     src: '../src/images/map_h.png'
                    // }
                ]
            };
        },
        initParamsObjandRender: function() {
            var that = this;
            that.Entrance = appcan.locStorage.val('equipmentEntrance');
            var clickResource = that.Entrance;
            //appcan.locStorage.remove('equipmentEntrance');

            if (clickResource == "new") { //新建
                that.renderPage(that.paramsObj);
                getLocationObj.init(function(sObj){
                    $.extend(that.paramsObj,JSON.parse(sObj));
                },function(sObj){
                    that.paramsObj.address = JSON.parse(sObj).address;
                    that.address.val(that.paramsObj.address || '');                    
                });                  
                return;
            }
            if (clickResource == "modify") { //修改
                var _obj = JSON.parse(appcan.locStorage.val('equipmentDetailObj'));               
                for(var item in _obj){
                    if (that.paramsObj[item] !== undefined) {
                        that.paramsObj[item] = _obj[item];
                    }
                }
                that.paramsObj.aImgIds = [].concat(_obj.pic);
                //alert(JSON.stringify(that.paramsObj))
                that.renderPage(that.paramsObj);
                that.e_checkFacilityName();
                that.e_checkFacilityCode();
                return;
            }
            if (clickResource == "local") {
                //进行本地存储的查找，然后进行赋值
                var objectId = appcan.locStorage.val('facilityId');
                selectOfflineFacility(objectId, function(result) { //查询安检记录的详情
                    if (result.success == 1) {
                        $.extend(that.paramsObj, result.data);
                        that.renderPage(that.paramsObj);
                        that.e_checkFacilityName();
                        that.e_checkFacilityCode();                        
                    } else {
                        baseOperation.alertToast("数据加载失败,请返回重试");
                    }
                });
            }
        },
        renderPage: function(obj) { //recordObject
            var that = this;
            //进行初始化表格
            that.facilityName.val(obj.facilityName || '');
            that.facilityCode.val(obj.facilityCode || '');
            that.facilityTypeCode.val(obj.facilityTypeCode || '');


            utils.renderSelect(that.facilityTypeCode, obj.facilityTypeCode);
            utils.renderSelect(that.pipelineTypeCode, obj.pipelineTypeCode);
            utils.renderSelect(that.facilityStatusCode, obj.facilityStatusCode);

            that.address.val(obj.address || '');

            that.specification.val(obj.specification || '');
            that.manufacturer.val(obj.manufacturer || '');
            that.installationTime.val(obj.installationTime || '');
            that.investmentTime.val(obj.investmentTime || '');

            that._renderRelaPerson(obj.relationshipPersonList);

            that.inspectionCount.val(obj.inspectionCount || 0);
            that.inspectionDays.val(obj.inspectionDays || 1);
            //alert(JSON.stringify( obj.attas))
            imagesObj.renderPicAndCount(obj.attas.map(function(item){
                //alert(item.url);
                return item.url;
            })); //渲染图片

        },        
        checkPostData: function(obj) {
            var that = this;
            if (!obj.facilityName || obj.facilityName.length > 25) {
                baseOperation.alertToast("设施名称必填，最多输入25个字", 2000);
                return false;
            }
            if (!obj.facilityCode || obj.facilityCode.length > 25) {
                baseOperation.alertToast("设施编号必填，最多输入25个字", 2000);
                return false;
            }
            if (!obj.facilityTypeCode) {
                baseOperation.alertToast("请选择设施类型", 2000);
                return false;
            }
            if (!obj.pipelineTypeCode) {
                baseOperation.alertToast("请选择管网类型", 2000);
                return false;
            }
            if (!obj.facilityStatusCode) {
                baseOperation.alertToast("请选择设施状态", 2000);
                return false;
            }
            if (!obj.address || !obj.bdLon || !obj.bdLat || !obj.lon || !obj.lat) {
               // alert(JSON.stringify(obj));
                baseOperation.alertToast("请选择详细位置", 2000);
                return false;
            }
            if (obj.address.length > 50) {
                baseOperation.alertToast("详细位置必填，最多输入50个字", 2000);
                return false;
            }
            if (!that._checkManufacturer(obj.manufacturer)) {
                baseOperation.alertToast("生产厂家由字母或汉字组成，最多可输入25个字", 3000);                
                return false;
            }
            // if (obj.installationTime) {
            //     baseOperation.alertToast("请选择安装日期", 2000);
            //     return false;
            // }       
            // if (obj.investmentTime) {
            //     baseOperation.alertToast("请选择投产日期", 2000);
            //     return false;
            // }                   
            if (!that._checkSpecification(obj.specification)) {
                baseOperation.alertToast("设施规格，最多可输入100个字", 3000);                
                return false;
            }  
            if (!that._checkNumber(obj.inspectionCount) || !that._checkNumber(obj.inspectionDays)) {
                baseOperation.alertToast("巡检频次由整数组成", 3000);                
                return false;                
            }         
            return true; 
        },
        _checkManufacturer: function(sValue) { //选填项，长度限制在25个字，字母、汉字，默认为空。
            var reg = /^[\u4e00-\u9fa5_a-zA-Z_]{1,25}$/g;
            if (sValue && !reg.test(sValue)) {
                return false;
            }
            return true;
        },
        _checkSpecification: function(sValue) { //选填项，长度限制在50个字，字母、数字和汉字，默认为空。
            //var reg = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,50}$/g;
            if (sValue && sValue.length > 100) {
                return false;
            }
            return true;
        },        
        _checkNumber : function(sValue){
            var reg = /^[\d]{1,100}$/g;            
            if (sValue && !reg.test(sValue)) {
                return false;
            }
            return true;
        },

        _renderRelaPerson: function(aPeo) {
            var that = this;
            var taskUserMsg = [];
            var aPeopleName = [];
            aPeo.forEach(function(item, index) {
                taskUserMsg.push({
                    userId: item.relationshipPersonId,
                    userName: item.relationshipPersonName
                });
                aPeopleName.push(item.relationshipPersonName);
            });
            var sPeopleName = aPeopleName.join(',');
            that.relationshipPersonList.val(sPeopleName);

            //存储人员信息，供人员选择页面使用
            var params = {
                peo_data: taskUserMsg,
                peo_name: sPeopleName
            };
            appcan.locStorage.setVal("userSelect", params);
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
                facilityName: that.facilityName.val().trim(), //设施名称
                facilityCode: that.facilityCode.val().trim(), //设施编码 
                address: that.address.val().trim(), // 详细位置
                manufacturer: that.manufacturer.val().trim(), //生产厂家
                specification: that.specification.val().trim(), //规格
                installationTime: that.installationTime.val().trim() || null, //安装日期
                investmentTime: that.investmentTime.val().trim() || null, //安装日期
                inspectionCount: that.inspectionCount.val().trim(), //巡检次数
                inspectionDays: that.inspectionDays.val().trim(), //巡检天数
            };
            $.extend(that.paramsObj, obj);

            that._updateAttaArr();

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
            var that = this;
            this.initializeOrdinaryEvent(this.eventsMap);

            appcan.select(that.elem.facilityTypeCode, function(ele, value) {
                that.paramsObj.facilityTypeCode = value;
            });
            appcan.select(that.elem.pipelineTypeCode, function(ele, value) {
                that.paramsObj.pipelineTypeCode = value;
            });
            appcan.select(that.elem.facilityStatusCode, function(ele, value) {
                that.paramsObj.facilityStatusCode = value;
            });

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
                var obj = $.extend({},this.paramsObj,{
                    aImgIdToBeDelete : imagesObj.aImgIdToBeDelete
                });
                appcan.window.evaluateScript('new_equipment', 'wrapperObj.isPostReady = false;');                
                uploadObj.uploadRecordByBO(this.paramsObj, function(){
                    if (that.Entrance === 'local') {
                        deleteOfflineFacility([that.paramsObj.objectId]);                        
                    }                    
                    appcan.window.evaluateScript('new_equipment', 'appcan.window.close(-1);');
                }, function(){
                    //baseOperation.alertToast('管网设施上传失败');
                    appcan.window.evaluateScript('new_equipment', 'wrapperObj.isPostReady = true;');                    
                });
            }
        },
        saveDataTOLocal: function(callback) {
            var that = this;
            var oData = $.extend({}, this.paramsObj);
            var arrayData = [{
                objectId: oData.objectId, //数据ID
                facilityName: oData.facilityName, //设备名称
                facilityCode: oData.facilityCode, //设备编号
                facilityTypeCode: oData.facilityTypeCode, //设备类型编号
                pipelineTypeCode: oData.pipelineTypeCode, //管网类型编号
                facilityStatusCode: oData.facilityStatusCode, //设备状态
                address: oData.address, //设备详细地址
                postData: JSON.stringify(oData), //数据体
                createTime: new Date() //创建时间
            }];
            //alert("baocin"+JSON.stringify(arrayData));
            appcan.window.evaluateScript('new_equipment', 'wrapperObj.isSaveReady = false;');             
            if (that.Entrance === "local") {
                updateOfflineFacility(arrayData[0], function(result) {
                    //alert(JSON.stringify(result))
                    if (+result.success === 1) {
                        baseOperation.alertToast("保存成功", 2000); //本地保存成功之后，需要进行什么操作。
                        appcan.window.evaluateScript('new_equipment', 'appcan.window.close(-1);');
                        return;
                    } else {
                        baseOperation.alertToast("数据保存失败！");
                    }
                    appcan.window.evaluateScript('new_equipment', 'wrapperObj.isSaveReady = true;');                
                });
                return;
            }
           
            saveOfflineFacility(arrayData, function(result) {
                //alert(JSON.stringify(result))
                if (+result.success === 1) {
                    baseOperation.alertToast("保存成功", 2000); //本地保存成功之后，需要进行什么操作。
                    appcan.window.evaluateScript('new_equipment', 'appcan.window.close(-1);');
                    return;
                } else {
                    baseOperation.alertToast("数据保存失败！");
                }
                appcan.window.evaluateScript('new_equipment', 'wrapperObj.isSaveReady = true;');                
            });
        },
        setAddress: function() {
            var that = this;

            var pointParam = appcan.locStorage.val("point_param");
            // alert(pointParam);
            pointParam = JSON.parse(pointParam);

            that.address.val(pointParam.address);
            that.paramsObj.address = pointParam.address;  

            // if (pointParam.GPSpoint.longitude) {
                // that.paramsObj.lon = pointParam.GPSpoint.longitude;
                // that.paramsObj.lat = pointParam.GPSpoint.latitude;                
            // }
            if (pointParam.GCJ02Point.longitude) {
                that.paramsObj.lon = pointParam.GCJ02Point.longitude;
                that.paramsObj.lat = pointParam.GCJ02Point.latitude;    
            }
            if (pointParam.baiduPoint.longitude) {
                that.paramsObj.bdLon = pointParam.baiduPoint.longitude;
                that.paramsObj.bdLat = pointParam.baiduPoint.latitude;                
            }
            appcan.locStorage.remove("point_param");
        },
        setUsers: function() {
            var that = this;
            var people_data = [];
            // var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
            // var myselfObj = {
            //     "relationshipPersonId": userBo.objectId,
            //     "relationshipPersonName": userBo.userName
            // };
            // people_data.push(myselfObj);

            var peopleNames = '';
            var userSelect = appcan.locStorage.getVal("userSelect");

            if (userSelect) { //判断人员选中页面，是否传值是否为空
                var people_select = JSON.parse(userSelect);
                var aUsers = people_select.peo_data.map(function(item, index) {
                    return {
                        "relationshipPersonId": item.userId,
                        "relationshipPersonName": item.userName
                    };
                });
                people_data = people_data.concat(aUsers);
                peopleNames = people_select.peo_name;
            }

            that.paramsObj.relationshipPersonList = people_data;
            that.relationshipPersonList.val(peopleNames);
            //alert(JSON.stringify(that.paramsObj.relationshipPersonList));
            //alert(JSON.stringify(that.relationshipPersonList.val()));
        },
        e_selectLocation: function() {
            var that = this;
            var param = {
                "parentWindowId": "new_equipment",
                "windowId": "content",
                "callBackName": "newEquipmentObj.setAddress()"
            };
            var addressInfo = {
                "addressName": that.paramsObj.address,
                "longitude": that.paramsObj.bdLon,
                "latitude": that.paramsObj.bdLat,
                // "gpsLon" : that.paramsObj.lon,
                // "gpsLat" : that.paramsObj.lat
                "gcj02Lon" : that.paramsObj.lon,
                "gcj02Lat" : that.paramsObj.lat
            };
            //alert(JSON.stringify(addressInfo));
            appcan.locStorage.setVal("selectAddress_param", param);
            appcan.locStorage.setVal("selectAddress_info", addressInfo);//当前页面存在地址

            appcan.openWinWithUrl("select_address", "select_address.html");
        },
        e_selectUser: function() {
            var that = this;
            var windowParam = {
                "parentWidowId": "new_equipment",
                "windowId": "content",
                "functionName": "newEquipmentObj.setUsers()"
            };
            appcan.locStorage.setVal("useSelectList_param", windowParam);
            // if (tjSwitch == 1) {
            //     try {
            //         var zhuge_param = {
            //             "eventName": "接收人选择",
            //             "info": {
            //                 "入口": "事件管理"
            //             }
            //         };
            //         uexTianji.track(zhuge_param);
            //     } catch (e) {}
            // }
            appcan.openWinWithUrl("users-select", "../../common/page/users_select_all/users_select_all.html");
        },
        e_selectDate: function(e) {
            var that = this;
            that.sDateId = $(e.target).parent().find('input').attr('id');
            if (!that.isCbOpenDateSeted) {
                that.isCbOpenDateSeted = true;
                uexDateRangePicker.cbOpenWheelDate  = function(opId, dataType, data){
                    //alert("日期："+data);
                    if (!data) {
                        return;
                    }
                    that.paramsObj[that.sDateId] = data;
                    that[that.sDateId].val(data || '');                    
                };                
            }
            if (uexDateRangePicker) {
                var param = {
                    minDate:"",//最小时间 2017-02-03
                    maxDate: (new Date()).Format("yyyy-MM-dd") //最大时间
                };
                //alert(JSON.stringify(param));
                uexDateRangePicker.openWheelDate(JSON.stringify(param));                
            }          
        },        
        e_checkFacilityName : function(e){
            var that = this;
            var sVal = that.facilityName.val();
            if (!sVal || sVal.length > 25) {
                that.facilityName.parent().addClass('bgMustDone');
                baseOperation.alertToast("设施名称必填，最多输入25个字", 2000);
            }else{
                that.facilityName.parent().removeClass('bgMustDone');                
            }            
        },
        e_checkFacilityCode : function(e){
            var that = this;
            var sVal = that.facilityCode.val();
            if (!sVal || sVal.length > 25) {
                that.facilityCode.parent().addClass('bgMustDone');
                baseOperation.alertToast("设施编号必填，最多输入25个字", 2000);
            }else{
                that.facilityCode.parent().removeClass('bgMustDone');                
            }            
        },
    };
    window.newEquipmentObj = obj;
})(appcan, window, Zepto, baseOperation, JasHttpRequest, imagesObj,getLocationObj);
