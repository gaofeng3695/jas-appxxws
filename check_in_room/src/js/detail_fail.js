appcan.ready(function() {
    recordDetailObj.init();
});

(function(window,$,appcan,viewPicObj,templateObj) {
    var recordDetailObj = {
        elem: {
            enterhome_user_type_code: '.customer_type', //用户类型
            enterhome_address: '.detail_location', //详细地址
            enterhome_user_name: '.user_name', //用户名称
            enterhome_user_code: '.user_number', //用户编号
            enterhome_user_tel: '.contact_number', //联系电话
            security_check_time: '.security_data', //安检时间
            failure_times: '.failureTimes', //安检失败次数
            enterhome_situation_type_code: '.home_situation', //入户情况
            security_man: '.security_man', //安检人
            remarks: '.remarks', //备注
        },
        initElem: function() {
            var eles = this.elem;
            for (var name in eles) {
                if (eles.hasOwnProperty(name)) {
                    this[name] = $(eles[name]);
                }
            }
        },
        initHttp: function() {
            this.jasHttpRequest = new JasHttpRequest();
        },
        init: function() {
            this.initElem();
            viewPicObj.init(false);
            this.initHttp();
            this.getDetail();
        },
        getDetail: function() {
            this.requestDetail();
        },
        //後台請求基本数据信息
        requestDetail: function() {
            var that = this;
            var recordId = appcan.locStorage.val('recordId');
            var partURL = "cloudlink-inspection-event/securityCheckRecord/get?objectId=" + recordId;
            //var partURL = "cloudlink-inspection-event-liulikai/securityCheckRecord/get?objectId=" +recordId;
            baseOperation.londingToast('数据请求中，请稍后...', 999999);

            that.jasHttpRequest.jasHttpGet(partURL, function(id, state, dbSource) {
                if (dbSource === "") {
                    baseOperation.alertToast('网络繁忙，请稍后再试');
                    return;
                }
                //baseOperation.closeToast();
                var reObj = JSON.parse(dbSource);
                if (reObj.success == 1) {
                    var aData = reObj.rows;
                    var obj = aData[0];
                    that.render(obj);
                    appcan.locStorage.val('userFileId', obj.groupId);
                    //第二次接口调用
                    that.requestFailedItem(obj.groupId);

                } else {
                    baseOperation.alertToast('网络繁忙，请稍后再试');
                }
            });
        },
        //后台请求安检历史记录次数信息
        requestFailedItem: function(groupId) {
            var that = this;
            // var partURL = "cloudlink-inspection-event/securityCheckRecord/getHistory?groupId=" + groupId;
            var partURL = "cloudlink-inspection-event/commonData/securityCheckRecordHistory/getList";
            //baseOperation.londingToast('数据请求中，请稍后...', 99999);
            that.jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
                if (dbSource === "") {
                    baseOperation.alertToast('网络繁忙，请稍后再试');
                    return;
                }
                baseOperation.closeToast();
                var reObj = JSON.parse(dbSource);
                if (reObj.success == 1) {
                    var aData = reObj.rows;
                    that.renderHistory(aData);
                } else {
                    baseOperation.alertToast('网络繁忙，请稍后再试');
                }
            }, JSON.stringify({
                "groupId": groupId,
                "planId": appcan.locStorage.val("planId")
            }));
        },
        //渲染基本数据信息
        render: function(data_) {
            var that = this;
            var typeMap = {
                'EHT_001': '居民',
                'EHT_002': '工业',
                'EHT_003': '商业',
                'EHT_004': '福利',
                'EHT_099': '其他'
            };
            //用户类型
            that.enterhome_user_type_code.html(typeMap[data_.enterhomeUserTypeCode]);
            //that.enterhome_user_type_code.html(data_.enterhomeUserTypeCode);
            //详细地址
            that.enterhome_address.html(data_.address);
            //用户名称
            that.enterhome_user_name.html(data_.userFileName);
            //用户编号
            that.enterhome_user_code.html(data_.userFileCode);
            //联系电话
            that.enterhome_user_tel.html(data_.contactPhone);
        },
        //渲染安检历史记录次数信息
        renderHistory: function(aData) {
            var that = this;
            var length = aData.length;
            $('.historyRecord').html("");
            var historyRecord = "";
            aData.forEach(function(value, index) {
                var _index = length-index;
                historyRecord += templateObj.createRecordHistoryTemplate(value,_index);
                return;
            });
            $('.historyRecord').append(historyRecord);            
        },
    };
    window.recordDetailObj = recordDetailObj;
})(window,Zepto,appcan,viewPicObj,templateObj);
