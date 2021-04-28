//模拟器调试报错
// window.onerror = function(msg, url, line) {
    // alert("erro" + msg + "\n" + url + ":" + line);
    // return true;
// };

appcan.ready(function() {
    facilityObj.init();
    viewPicObj.init(false);
});
(function(appcan, window, Zepto, baseOperation, JasHttpRequest) {
    var obj = {
        paramsObj : null,
        bdPointObj : {},
        elem : {
            facility_name : '.facility_name', //设施名称
            facility_code : '.facility_number', //设施编号
            facility_type_code : '.facility_type', //设施类型
            pipeline_type_code : '.pipe_type', //管网类型
            facility_status_code : '.state', //状态
            address : '.map_location', //地图位置
            specification : '.specifications', //规格
            manufacturer : '.manufacturer', //生产厂家
            installation_time : '.install_date', //安装日期
            start_date : '.start_date',//投产日期
            person_in_charge : '.person_in_charge', //负责人  字段名称不确定
            inspection_count : '.second', //巡检次数
            inspection_days : '.day', //巡检天数
            entry_man : '.entry_man', //录入人  字段名称不确定
            locationMapImg : '#locationMapImg',//地图图标
        },
        init : function() {
            this.initAppcanParams();
            this.initParamsObj();
            this.requestDetail();
            this.inittableElem();
            this.bindEvent();

        },
        inittableElem : function() {
            var eles = this.elem;
            for (var name in eles) {
                if (eles.hasOwnProperty(name)) {
                    this[name] = $(eles[name]);
                }
            }
        },
        initAppcanParams : function() {
            this.jasHttpRequest = new JasHttpRequest();
            //获取本地存取的objectId
            this.facilityId = appcan.locStorage.val('facilityId');
        },
        initParamsObj : function() {
            this.paramsObj = {
                facilityName : "", //设施名称
                facilityCode : "", //设施编号
                facilityTypeName : "", //设施类型
                pipelineTypeName : 'EHT_001', //管网类型
                facilityStatusName : 'EHT_001', //状态
                address : "", //地图位置
                specification : "", //规格
                manufacturer : "", //生产厂家
                installationTime : "", //安装日期
                investmentTime : "", //投产日期
                relationshipPersonNames : "", //负责人
                inspectionCount : '', //巡检次数
                inspectionDays : '', //巡检天数
                createUserName : "", //录入人
                pic : []
            };
        },
        bindEvent : function() {
            var that = this; 
                $('#maplocation').click(function() {
                    if(that.paramsObj.address && appcan.locStorage.val('currentModule')!=="daily_check"){
                        appcan.locStorage.val('bdPointObj', that.bdPointObj);
                        appcan.openWinWithUrl('maplocation', '../detail_check/maplocation.html');
                    } 
                });     
        },
        //後台請求數據
        requestDetail : function() {
            var that = this;
            var partURL = "cloudlink-inspection-event/facility/get?objectId=" + that.facilityId;
            baseOperation.londingToast('数据请求中，请稍后...', 99999);
            that.jasHttpRequest.jasHttpGet(partURL, function(id, state, dbSource) {
                if (dbSource === "") {
                    baseOperation.alertToast('网络繁忙，请稍后再试');
                    return;
                }
                baseOperation.closeToast();
                var reObj = JSON.parse(dbSource);
                if (reObj.success == 1) {
                    var obj = reObj.rows[0];
                    $.extend(that.paramsObj,obj);
                    //alert(JSON.stringify(that.paramsObj))
                    that.bdPointObj.bdLon = obj.bdLon;
                    that.bdPointObj.bdLat = obj.bdLat;
                    that.bdPointObj.address = obj.address;
                    that.render(obj);
                    appcan.locStorage.remove('equipmentSelectedObjs'); 
                    appcan.locStorage.val('equipmentSelectedObj',obj); 
                    appcan.locStorage.val('equipmentSelectedObjs',obj); 
                    appcan.locStorage.val('LocationResource', "ledger");
                    //判断地址选择的来源
                    obj.attas = obj.pic.map(function(item, index) {
                        return {
                            attaType : 'pic',
                            url : serverURL + "cloudlink-core-file/file/getImageBySize?fileId=" + item + "&viewModel=lfit&width=282&hight=282"
                        }
                    });
                    appcan.locStorage.val('equipmentDetailObj', obj);
                    //设施详情对象
                } else {
                    baseOperation.alertToast('网络繁忙，请稍后再试');
                }
            });
        },
        //详情的渲染
        render : function(data) {
            var that = this;
            //设施名称
            that.facility_name.html(data.facilityName);
            //设施编号
            that.facility_code.html(data.facilityCode);
            //设施类型
            that.facility_type_code.html(data.facilityTypeName);
            //管网类型
            that.pipeline_type_code.html(data.pipelineTypeName);
            //状态
            that.facility_status_code.html(data.facilityStatusName);
            //地图位置
            that.address.html(data.address);
            if(appcan.locStorage.val('currentModule')==="daily_check"){
                that.locationMapImg.addClass('uhide');
            }else{
                that.locationMapImg.removeClass('uhide');
            }
            //规格
            that.specification.html(data.specification);
            //生产厂家
            that.manufacturer.html(data.manufacturer);
            //安装日期
            that.installation_time.html(data.installationTime);
            //alert(data.investmentTime)
            //投产日期
            that.start_date.html(data.investmentTime);
            //负责人
            that.person_in_charge.html(data.relationshipPersonNames);
            //巡检频次
            that.inspection_days.html(data.inspectionDays);
            that.inspection_count.html(data.inspectionCount);
            //录入人
            that.entry_man.html(data.createUserName);
            //照片
            that.renderPicture(data);
        },
        //照片渲染
        renderPicture : function(data) {
            var that = this;
            var imgList = data.pic;
            var sHtml = '';
            if (!imgList || imgList.length === 0) {
                $('.picture').html("");
            } else {
                $('.pictures').removeClass('borderBottomNone');
                imgList.forEach(function(value, index) {
                    var sUrl = serverURL + "cloudlink-core-file/file/getImageBySize?fileId=" + value + "&viewModel=lfit&width=282&hight=282";
                    var bigSrc = serverURL + "cloudlink-core-file/file/downLoad?fileId=" + value;
                    sHtml += '<div class="picList ufl ub-ac " style="border:.325em solid white; box-sizing:border-box;width:33.3%;" >' + '<div style="height: 0px;padding-bottom: 100%;"></div>' + '<div class="uof uabs" style="height: 100%;width: 100%;">' + '<img src="' + sUrl + '"  data-bigSrc="' + bigSrc + '" width="100%" style="top: 50%;-webkit-transform: translateY(-50%);" class="uabs js_viewBig"/>' + '</div>' + '</div>'
                });
                $('.picture').html(sHtml);
            }
        },
    };
    window.facilityObj = obj;
})(appcan, window, Zepto, baseOperation, JasHttpRequest);

