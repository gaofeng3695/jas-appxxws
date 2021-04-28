// window.onerror = function(msg, url, line) {
    // alert("erro" + msg + "\n" + url + ":" + line);
    // return true;
// };

appcan.ready(function() {
    newRecordObj.init();
});


(function(appcan, window, $, baseOperation, JasHttpRequest, JasDevice, imagesObj) {
    var obj = {
        paramsObj: null,

        eventsMap: {
            'click .addgasbutton': 'e_addGasMeter',
            'click .modifyGasButton': 'e_modifyGasMeter',
            //'click .closegas': 'e_deleteGasMeter',
            'click .danger': 'e_selectDenger',
            'click .bgSelectDate': 'e_selectDate',
            'change .radiobox input[name="result"]': 'e_ifHideGasDenger',
        },
        elem: {
            time: '.security_data',
            userType: '.customer_type',
            address: '.detail_location',
            username: '.user_name',
            usercode: '.user_number',
            tel: '.contact_number',
            tel2 :'.contact_number2',
            resultType: 'input[name="result"]',
            modifyDate:'#modifyDate',
            remork: '#remork',
            gas_list: '.gas_list',
            addgasbutton: '.addgasbutton',
            dangerList: '.dangerList',
            notice: '.js_notice'
        },
        init: function() {
            imagesObj.init();
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
        initElem: function() {
            var eles = this.elem;
            for (var name in eles) {
                if (eles.hasOwnProperty(name)) {
                    this[name] = $(eles[name]);
                }
            }
        },
        updateUserObj: function(obj) {
            var that = this;
            //alert(JSON.stringify(obj,null,4));
            var _obj = {
                groupId : obj.objectId, //用户Id
                enterhomeUserTypeName: obj.enterhomeUserTypeName, //用户类型 
                enterhomeAddress: obj.address, //详细地址
                enterhomeUserName: obj.userFileName, // 用户名称 
                enterhomeUserCode: obj.userFileCode, // 用户编号 
                enterhomeUserTel: obj.contactPhone, // 联系电话 
                alternativePhone: obj.alternativePhone, //备用电话
                gasmeters: obj.userGasmeterBoList || [], //用户燃气表
            };
            _obj.gasmeters.forEach(function(item,index){
                item.gasmeterData = '';
            });
            //alert(JSON.stringify(obj,null,4))
            delete obj.objectId;

            delete obj.remark;
            $.extend(that.paramsObj,obj,_obj,true);
            delete that.paramsObj.userGasmeterBoList;
        },
        initParamsObj: function() {
            this.paramsObj = {
                groupId: "",
                objectId: baseOperation.createuuid(), //记录ID
                planId: appcan.locStorage.val('planId'), //计划ID
                // securityCheckTime: utils.getNowFormatDate(),
                securityCheckTime: new Date().Format("yyyy-MM-dd HH:mm:ss"),
                //enterhomeUserTypeCode: 'EHT_001', //用户类型 
                enterhomeUserTypeName : '', //用户类型 
                enterhomeAddress: "", //地址
                enterhomeUserName: "", // 用户名称 
                enterhomeUserCode: "", // 用户编号 
                enterhomeUserTel: "", // 联系电话 
                alternativePhone: "", //备用电话                
                enterhomeSituationTypeCode: "EHS_001", // 入户情况 
                remark: "", // 备注 
                isdanger: 0, //隐患情况  1存在、 0不存在、-1 未知（未成功入户的情况下）
                remediationTime : '',//整改期限
                gasmeters: [
                    // {
                    //     gasmeterName: "", //燃气表名称
                    //     gasmeterCode: "", //燃气表编号
                    //     gasmeterMode: "", //型号
                    //     gasmeterEntermode: "", //进气方向（左进、右进）
                    //     gasmeterTypeCode: "", //类型（机械表、IC卡表、远传表、其他）
                    //     manufactureDate: "", //生产日期
                    //     gasmeterStatusCode: "", //使用状态（在用、停用、已拆卸）
                    //     manufacturer: "", //生产厂家
                    //     serviceLife: "", //使用年限
                    //     specifications: "", //规格
                    //     gasmeterData: "", //数值
                    // }
                ],
                hiddendangers: [
                    /*{
                                        objectId: baseOperation.createuuid(), // 主键
                                        recordId: recordId, // 记录ID
                                        hiddendangerCode: "", //隐患编码
                                        hiddendangerName: "" //隐患名称
                                    }*/
                ],
                attas: [
                    /*{
                                        bizType: '', //pic 、esignature 
                                        url: ''
                                    }*/
                ]
            };
        },
        updateParamsObj: function() {
            var that = this;
            var obj = {
                securityCheckTime: that.time.html().trim(),
                remark: that.remork.val().trim(),
                //enterhomeUserTypeCode: that.userType.filter(':checked').attr("value"),
                enterhomeSituationTypeCode: that.resultType.filter(':checked').attr("value"),
            };
            $.extend(that.paramsObj, obj);
            that._updateAttaArr();
            that._updateGasMeterArr();
            that._updateDangerArr();
            that.paramsObj.isdanger = that.paramsObj.hiddendangers.length ? 1 : 0;
            //alert(JSON.stringify(that.paramsObj));
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
        _updateDangerArr: function() {
            var aDanger = [];
            var that = this;
            that.paramsObj.enterhomeSituationTypeCode = that.resultType.filter(':checked').attr("value");
            if (that.paramsObj.enterhomeSituationTypeCode === 'EHS_001') {
                $(".danger_list").find(".dangeron").each(function(i, dom) {
                    aDanger.push({
                        objectId: baseOperation.createuuid(), // 主键
                        recordId: that.paramsObj.objectId, // 记录ID
                        hiddendangerCode: $(dom).attr("id"), //隐患编码
                        hiddendangerName: $(dom).text() //隐患名称
                    });
                });
            }else{
                that.paramsObj.remediationTime = '';                
            }
            //alert(JSON.stringify(aDanger));
            that.paramsObj.hiddendangers = aDanger;
        },
        _updateGasMeterArr: function() {
            var that = this;
            if (that.paramsObj.enterhomeSituationTypeCode === 'EHS_001') {
                $(".gas_list").find(".gasmeterData").each(function(i, dom) {
                    var sId = dom.dataset.id;
                    that.paramsObj.gasmeters.forEach(function(item){
                        if(item.objectId === sId){
                            item.gasmeterData = $(dom).val().trim(); //电表读数
                        }
                    });
                });
            }else{
                that.paramsObj.gasmeters = [];
            }
            //alert(JSON.stringify(that.paramsObj.gasmeters));            
            
        },
        _updateAttaArr: function() {
            var that = this;
            var a = [];
            that.paramsObj.attas = imagesObj.imgArray.map(function(item, index) {
                return {
                    bizType: 'pic', //pic 、esignature 
                    url: item.src
                };
            });
        },
        initParamsObjandRender: function() {
            var that = this;
            var clickResource = appcan.locStorage.getVal('recordEntrance');
            appcan.locStorage.remove('recordEntrance');
            if (clickResource === "new" ||　clickResource === "again") {
                var  sId = appcan.locStorage.val('userFileId');
                that.requestUserInfo(sId, function(obj) {
                        that.updateUserObj(obj);
                        that.renderPage(that.paramsObj); 
                });
                return;
            }
            if (clickResource == "local") {
                //进行本地存储的查找，然后进行赋值
                var recordId = appcan.locStorage.getVal('recordId');
                selectEhscRecordInfo(recordId, function(result) { //查询安检记录的详情
                    if (result.success == 1) {
                        $.extend(that.paramsObj, result.data);
                        that.renderPage(that.paramsObj);
                    } else {
                        baseOperation.alertToast("数据加载失败,请返回重试");
                    }
                });
            }
        },
        _renderUser : function(obj){
            var that = this;
            //alert(obj.enterhomeUserTypeName)
            that.userType.html(obj.enterhomeUserTypeName || ''); //用户类型
            that.address.html(obj.enterhomeAddress || '');
            that.usercode.html(obj.enterhomeUserCode || '');
            that.username.html(obj.enterhomeUserName || '');
            that.tel.html(obj.enterhomeUserTel || '');
            that.tel2.html(obj.alternativePhone || '');
        },
        renderPage: function(obj) { //recordObject
            var that = this;
            //进行初始化表格
            $('body').removeClass('whiteMask');
            that.time.html(obj.securityCheckTime || '');
            that._renderUser(obj); 
            that.resultType.filter('[value="' + obj.enterhomeSituationTypeCode + '"]').attr("checked", true); //入户情况
            that._renderGasMeter(obj.enterhomeSituationTypeCode, obj.gasmeters);
            that._renderDengerTable(obj.enterhomeSituationTypeCode, obj.hiddendangers);
            that.modifyDate.val(obj.remediationTime||'');
            that.renderNotice();

            var aPic = [];
            obj.attas.forEach(function(item, index) {
                if (item.bizType === 'esignature') {
                    return;
                }
                aPic.push(item.url);
            });
            imagesObj.renderPicAndCount(aPic);

            that.remork.val(obj.remark || '');
        },
        requestUserInfo: function(sId, callback) {
            var that = this;
            var partURL = "cloudlink-inspection-event/commonData/userArchive/get?objectId=" + sId;
            baseOperation.londingToast("正在请求数据，请稍候",99999);
            that.jasHttpRequest.jasHttpGet(partURL, function(id, state, dbSource) {
                //alert(dbSource)
                if (dbSource.indexOf('connection failure') > 0){
                    that.isOffline = true;
                    baseOperation.alertToast('网络连接失败，请检查您的网络',4444);
                    return;
                }
                baseOperation.closeToast();
                if (dbSource.length === 0) {
                    //alert(123);
                    return;
                }
                var resultData = JSON.parse(dbSource);
                                
                if(+resultData.success === -1){
                    that.isOffline = true;
                    baseOperation.alertToast('获取用户信息失败，请稍后重试',4444);
                    return;                    
                }     
                
                if(resultData.rows.length === 0){
                    that.isUserDeleted = true;
                    baseOperation.alertToast('该用户档案已被删除，无法进行安检',4444);
                    return;                    
                }            
                //alert(JSON.stringify(resultData,null,4))

                callback && callback(resultData.rows[0]);

            });
        },
        trigerSaveToLocal: function() {
            if (this.isOffline) {
                baseOperation.alertToast('网络连接失败，无法进行保存')
                return;
            }            
            if (this.isUserDeleted) {
                baseOperation.alertToast('该用户档案已被删除，无法进行安检',4444);            
                return;
            }  
            this.updateParamsObj();
            this.saveDataTOLocal();
        },
        triggerToNext: function() {
            var that = this;
            if (this.isOffline) {
                baseOperation.alertToast('网络连接失败，无法进行下一步')
                return;
            }
            if (this.isUserDeleted) {
                baseOperation.alertToast('该用户档案已被删除，无法进行安检',4444);            
                return;
            }              
            if( !this.paramsObj.groupId ){ //如果从后台取得用户ID才可进行下一步
                return;
            }
            this.updateParamsObj();
            if (!this.checkFormFormat()) {
                return;
            }
            that.saveDataTOLocal(function() {
                appcan.locStorage.val('recordId', that.paramsObj.objectId);
                appcan.locStorage.val('recordEnterhomeSituationTypeCode', that.paramsObj.enterhomeSituationTypeCode);
                appcan.openWinWithUrl('detail_sign', '../detail/sign_detail.html');
            });            
        },
        triggerModifyGasmeter : function(obj){
            var that = this;
            //alert(JSON.stringify(obj))
            var arr = that.paramsObj.gasmeters;
            var isModify = false;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].objectId === obj.objectId) {
                    $.extend(arr[i],obj,true);
                    isModify = true;
                    break;
                }
                
            }
            if (!isModify) {
                arr.push(obj);
            }
            that._renderGasMeter('EHS_001',arr);
        },
        saveDataTOLocal: function(callback) {
            saveOfflineData($.extend({}, this.paramsObj,true), function(result) {
                //alert(JSON.stringify(result))
                if (+result.success === 1) {
                    baseOperation.alertToast("保存成功", 2000); //本地保存成功之后，需要进行什么操作。
                    if (typeof callback === 'function') {
                        callback();
                    }
                } else {
                    baseOperation.alertToast("数据保存失败！");
                    //appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
                }
            });
        },
        _renderGasMeter: function(sCode, aGas) {
            //alert(JSON.stringify(aGas))
            var that = this;
            if (sCode !== 'EHS_001') {
                that.gas_list.css("display", "none");
                that.addgasbutton.css("display", "none");
                return;
            }
            that.gas_list.css("display", "block");
            that.addgasbutton.css("display", "block");
            if (!aGas || aGas.length === 0) {
                return;
            }
            var s = '';
            aGas.forEach(function(obj, index) {
                s += that._createGasMeterTemplate(obj);
            });
            that.gas_list.html(s);
        },
        _renderDengerTable: function(sCode, aDenger) {
            var that = this;
            if (sCode !== 'EHS_001') {
                that.dangerList.css("display", "none");
                return;
            }
            that.dangerList.css("display", "block");
            if (!aDenger) {
                return;
            }
            aDenger.forEach(function(item, index) {
                that.dangerList.find(".danger").filter('[id=' + item.hiddendangerCode + ']').addClass("dangeron");
            });
        },
        _createGasMeterTemplate: function(obj) { //index:1,2...
            //var that = this;  
            var sObj = "'"+ JSON.stringify(obj) +"'";
            return [
            '<div class="js_gastable  sectionShadow sectionMargin bgfff">',
                '<div class="gastitle borderBottom">',
                    '<span class="ulev30 clr333">'+ (obj.gasmeterName || '')+'</span>',
                    '<div class="modify_icon modifyGasButton" data-obj='+ sObj +'></div>',
                '</div>',
                '<div class="input_table">',
                    '<div class="ub p06 borderBottom">',
                        '<div class="ulev26 leftStyle clr666 ub ub-ac size2">编号</div>',
                        '<div class="ub-f1 ulev28 borderLeft security_data clr333">'+ (obj.gasmeterCode || '') +'</div>',
                    '</div>',
                    '<div class="ub p06 borderBottom">',
                        '<div class="ulev26 leftStyle clr666 ub ub-ac size2">类型</div>',
                        '<div class="ub-f1 ulev28 borderLeft security_data clr333">'+ (obj.gasmeterTypeName || '') +'</div>',
                    '</div>',
                    '<div class="ub p06 borderBottom">',
                       '<div class="ulev26 leftStyle clr666 ub ub-ac">进气方向</div>',
                        '<div class="ub-f1 ulev28 borderLeft security_data clr333">'+ (obj.gasmeterEntermode || '') +'</div>',
                    '</div>',
                    '<div class="ub p06 borderBottom">',
                        '<div class="ulev26 leftStyle clr666 ub ub-ac">使用状态</div>',
                        '<div class="ub-f1 ulev28 borderLeft security_data clr333">'+ (obj.gasmeterStatusName || '') +'</div>',
                    '</div>',
                    '<div class="ub ub-ac table_row" style="margin: .5em 0 0 0">',
                        '<div class="row_leftwidth ">',
                          '<span class="size2 rowSize">读数</span>',  
                        '</div>',
                        '<div class="row_right ub-f1 ub-fv tb_bg margl5">',
                            '<div class="ml5">',
                                '<input type="text" data-id="'+ obj.objectId +'" class="user_input rightSize gasmeterData" placeholder="请输入读数（选填）" value="'+ (obj.gasmeterData || '')+'">',
                            '</div>',
                        '</div>',
                    '</div>',                                                                             
                '</div>',
            '</div>',     
            ].join('');
        },
        e_addGasMeter: function() {
            var that = this;
            var index = that.paramsObj.gasmeters.length+1;
            that._updateGasMeterArr();
            appcan.locStorage.val('gasmeterEntrance', 'new');
            appcan.locStorage.val('oGasmeter', {
                gasmeterName: '燃气表-'+index,
                userFileId : that.paramsObj.groupId,
            });
            appcan.openWinWithUrl('newgas', 'newgas.html');
        },
        e_modifyGasMeter: function(e) {
            var that = this;
            //alert(e.target.dataset.obj)
            that._updateGasMeterArr();            
            appcan.locStorage.val('gasmeterEntrance', 'modify');
            appcan.locStorage.val('oGasmeter', e.target.dataset.obj);
            appcan.openWinWithUrl('newgas', 'newgas.html');
        },
        e_selectDenger: function(e) {
            var that = this;
            var _this = e.target;
            $(_this).toggleClass('dangeron');
            that._updateDangerArr();
            that.renderNotice();
        },
        e_selectDate : function(){
            var that = this;

            if (window.uexDateRangePicker) {
                if (!that.isCbOpenDateSeted) {
                    that.isCbOpenDateSeted = true;
                    uexDateRangePicker.cbOpenWheelDate = function(opId, dataType, data) {
                        if (!data) {
                            return;
                        }
                        that.modifyDate.val(data);
                        that.paramsObj.remediationTime = data;
                    };
                }
                var param = {
                    minDate : (new Date()).Format("yyyy-MM-dd"), //最小时间 2017-02-03
                    maxDate : '' //最大时间
                };
                //alert(JSON.stringify(param));
                uexDateRangePicker.openWheelDate(JSON.stringify(param));
            }else{
                that.modifyDate.val('2017-02-14');
                that.paramsObj.remediationTime = '2017-02-14';
            }            
        },
        renderNotice : function(){
            var that = this;
            if (that.paramsObj.hiddendangers.length>0) {
                that.notice.removeClass('uhide');
            }else{
                that.notice.addClass('uhide');
            }
        },
        e_ifHideGasDenger: function() {
            var that = this;
            /*添加Radio变更处理代码*/
            var desc = $("input[name='result']:checked").attr("value");
            that._renderGasMeter(desc);
            that._renderDengerTable(desc);
        },
        checkFormFormat: function() {
            var obj = this.paramsObj;
            var aGas = obj.gasmeters;

            //alert(4)
            if (!this._checkremark(obj.remark)) {
                return false;
            }
            //alert(5)
            if (!this._checkpictureLength(obj.attas.length)) {
                return false;
            }
            //alert(6)
            for (var i = 0; i < aGas.length; i++) {
                if (!this._checkgasnum(aGas[i].gasmeterData, i)) {
                    return false;
                }
            }
            if (obj.enterhomeSituationTypeCode === "EHS_001" && obj.isdanger && !this._checkModifyDate(obj.remediationTime)) {
                return false;
            }
            return true;
        },        
        _checkModifyDate : function(sDate){
            if (sDate) {
                return true;
            }
            baseOperation.alertToast('请选择整改期限日期');
            return false;
        },
        _checkaddress: function(sValue) { //验证地理位置60个字，字母、数字或汉字；默认为上一次输入值，若无上一次输入值则为空
            var that = this;
            //var sValue = $("#address").val().trim();
            var reg = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,60}$/g;
            if (reg.test(sValue)) {
                return true;
            }
            baseOperation.alertToast("详细地址由字母、数字或汉字组成，最多输入60个字", 3000);
            return false;
        },
        _checkusername: function(sValue) { //验证用户名称 长度限制在25个字   
            //var username = $("#username").val().trim();
            var reg = /^[\u4e00-\u9fa5_a-zA-Z_]{1,25}$/g;
            if (sValue != "" && sValue != null) {
                if (!reg.test(sValue)) {
                    baseOperation.alertToast("用户名称由字母或汉字组成，最多可输入25个字", 3000);
                    return false;
                } else {
                    return true;
                }
            }
            return true;

        },
        _checkusercode: function(usercode) { //长度限制在10个字，字母、数字或汉字
            //var usercode = $("#usercode").val().trim();
            var reg = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,10}$/g;
            if (usercode) {
                if (!reg.test(usercode)) {
                    baseOperation.alertToast("用户编号由字母、数字或汉字组成,最多输入10个字", 3000);
                    return false;
                } else {
                    return true;
                }
            }
            return true;

        },
        _checkremark: function(remork) { //长度限制为200字，字母、数字、符号或汉字
            //var remork = $("#remork").val().trim();
            // var reg = /^[\u4e00-\u9fa5_a-zA-Z_]{1,200}/g;
            if (remork.length > 200) {
                baseOperation.alertToast("备注内容不能超过200字");
                return false;
            }
            return true;
        },
        _checkpictureLength: function(nPic) { //测试照片长度
            //var piclength = $(".photo_list").find(".picList").length;
            /*
             if (nPic === 0) {
                            baseOperation.alertToast("璇疯嚦灏戜笂浼犱竴寮犲浘鐗�);
                            $("#picNote").text("璇疯嚦灏戜笂浼犱竴寮犲浘鐗�);
                            return false;
                        }*/

            return true;
        },
        _checktel: function(tel) { //长度限制在15位，数字和-组成
            var reg = /^((1\d{10})|(([0-9]{3,4}-)?[0-9]{7,8}))$/;
            if (tel && !reg.test(tel)) {
                baseOperation.alertToast("请输入正确的电话号码", 3000);
                return false;
            }
            return true;
        },
        _checkgascode: function(gascode, data) { //燃气表编号，
            //    var reg = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,10}$/g; //长度限制在10位，数字、字母或特殊字符
            // var reg = /^[0-9a-zA-Z!@#$%^*()！@#￥%……&*（）]{1,10}$/g;
            if (!gascode) {
                return true;
            }
            if (gascode.length > 30) {
                baseOperation.alertToast("【燃气表-" + (data + 1) + "】编号输入有误，最多可输入30个字", 3000);
                return false;
            } else {
                return true;
            }
        },
        _checkgasnum: function(gasnum, data) {
            var reg = /^(([0-9]{1,5}\.[0-9]{1,3})|([0-9]{1,8})|([0-9]{1,6}\.[0-9]{1,2})|([0-9]{1,7}\.[0-9]{1}))$/; //长度限制为8位，数字
            if (!gasnum) {
                return true;
            }
            if (!reg.test(gasnum)) {
                baseOperation.alertToast("【燃气表-" + (data + 1) + "】读数输入有误，小数点后面最多3位，总共为8位", 3000);
                return false;
            } else {

                return true;
            }
        }
    };
    window.newRecordObj = obj;
})(appcan, window, Zepto, baseOperation, JasHttpRequest, JasDevice, imagesObj);
