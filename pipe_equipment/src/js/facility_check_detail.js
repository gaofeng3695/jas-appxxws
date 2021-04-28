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
            facility_check_time : '.check_time', //检查时间
            examiner : '.examiner', //检查人
            facility_type_code : '.facility_type', //设施类型
            facility_name : '.facility_name', //设施名称
            address : '.map_location', //地图位置

            is_leakage : '.whether_leakage', //是否漏气
            combustible_gas_concentration : '.gas_concentration', //可燃气浓度
            is_facility_work : '.operation_condition', //设施运营情况
            facility_work_desc : '.operation_description', //设施运营描述
            pressure_situation : '.pressure_condition', //压力情况
            pressure_in : '.inlet_pressure', //进口压力
            pressure_out : '.outlet_pressure', //出口压力
            abnormal : '.abnormal', //异常详细
            facility_check_result : '.inspection_results', //检查结果
            is_seeper : '.is_water', //井内有无积水
            is_well_cover_damage : '.is_damage', //井盖是否损坏
            is_occupy : '.is_occupy', //有无占压
            flowmeter_data : '.meter_reading', //流量计读数
            remarks : '.remarks'//备注
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
            this.facilityCheckId = appcan.locStorage.val('facilityCheckId');
        },
        initParamsObj : function() {
            this.paramsObj = {
                facilityCheckTime : '', //检查时间
                createUserName : '', //检查人
                facilityTypeName : '', //设施类型
                facilityName : '', //设施名称
                facilityAddress : '', //地图位置
                isLeakage : '', //是否漏气
                isLeakageName : '', //是否漏气
                combustibleGasConcentration : '', //可燃气浓度
                isFacilityWorkName : '', //设施运营情况
                facilityWorkDesc : '', //设施运营描述
                pressureSituationName : '', //压力情况
                pressureIn : '', //进口压力
                pressureOut : '', //出口压力
                facilityCheckResultName : '', //检查结果
                sSeeperName : '', //井内有无积水
                isWellCoverDamageName : '', //井盖是否损坏
                isOccupyName : '', //有无占压
                flowmeterData : '', //流量计读数
                pic : [], //照片fileId数组
                audio : [], //录音fileId数组
                remark : '', //备注
            };
        },
        //後台請求數據
        requestDetail : function() {
            var that = this;
            var partURL = "cloudlink-inspection-event/facilityRecord/get?objectId=" + that.facilityCheckId;
            baseOperation.londingToast('数据请求中，请稍后...', 99999);
            that.jasHttpRequest.jasHttpGet(partURL, function(id, state, dbSource) {
                if (dbSource === "") {
                    baseOperation.alertToast('网络繁忙，请稍后再试');
                    return;
                }
                baseOperation.closeToast();
                var reObj = JSON.parse(dbSource);
                if (reObj.success == 1) {
                    //alert(JSON.stringify(reObj))
                    that.render(reObj.rows[0]);
                    that.bdPointObj.bdLon = reObj.rows[0].facilityBdLon;
                    that.bdPointObj.bdLat = reObj.rows[0].facilityBdLat;
                    that.bdPointObj.address = reObj.rows[0].address;
                    appcan.locStorage.val('LocationResource', "check");
                    //判断地址选择的来源  检查

                } else {
                    baseOperation.alertToast('网络繁忙，请稍后再试');
                }
            });
        },

        //详情的渲染
        render : function(data) {
            var that = this;
            //设施类型code
            var facilityTypeCode = (data.facilityTypeName)
            //根据设施类型决定显示设施检查项
            if (facilityTypeCode == "调压设备") {
                $(".facilityCheckModuleTwo").removeClass("uhide");
            } else if (facilityTypeCode == "井") {
                $(".facilityCheckModuleThree").removeClass("uhide");
            } else if (facilityTypeCode == "流量计") {
                $(".facilityCheckModuleFour").removeClass("uhide");
            }
            //检查时间
            that.facility_check_time.html(data.facilityCheckTime);
            //检查人
            that.examiner.html(data.createUserName);
            //设施类型name
            that.facility_type_code.html(data.facilityTypeName);
            //设施名称
            that.facility_name.html(data.facilityName);
            //地图位置
            that.address.html(data.address);
            //是否漏气
            that.is_leakage.html(data.isLeakageName);
            //可燃气浓度
            that.combustible_gas_concentration.html(data.combustibleGasConcentration == ""?"":data.combustibleGasConcentration+' &nbsp;ppm');
            //设施运营情况
            that.is_facility_work.html(data.isFacilityWorkName);
            //设施运营描述
            that.facility_work_desc.html(data.facilityWorkDesc);
            //压力情况
            that.pressure_situation.html(data.pressureSituationName);
            //进口压力
            that.pressure_in.html(data.pressureIn+' &nbsp;kPa');
            //出口压力
            that.pressure_out.html(data.pressureOut+' &nbsp;kPa');
            //检查结果
            //that.abnormal.html(data.isLeakage == 1 ? "漏气&nbsp;&nbsp;" : "");
            that.facility_check_result.html(data.facilityCheckResultName);
            //有无积水
            that.is_seeper.html(data.isSeeperName);
            //是否损坏
            that.is_well_cover_damage.html(data.isWellCoverDamageName);
            //有无占压
            that.is_occupy.html(data.isOccupyName);
            //流量计读数
            that.flowmeter_data.html(data.flowmeterData+' m<sup>3</sup>');
            //照片
            that.renderPicture(data);
            //录音
            that.renderAudio(data);
            //备注
            that.remarks.html(data.remark);
        },
        //语音渲染
        renderAudio : function(data) {
            var that = this;
            var audioList = data.audio;
            var sText = '';
            if (!audioList || audioList.length === 0) {
                $('.phonetic_description').html("无");
            } else {
                $('.phonetic_description').html(['<div id="voiceFiles">', '<div id="audio" class="audio" style="left: 2%;top:-0.35em;width: 98%;">', '<div class="audio_img" id="audio_img" style="float: left"></div>', '<div id="voiceTime" style="float: right;margin-right: .5em;"></div>', '</div>', '</div>'].join(''));
                playVoiceObj.init(audioList[0]);
            }
        },
        bindEvent : function() {
            var that=this;
            $('#maplocation').click(function() {
                appcan.locStorage.val('bdPointObj', that.bdPointObj);
                appcan.openWinWithUrl('maplocation', 'maplocation.html');
            })
        },
        //照片渲染
        renderPicture : function(data) {
            var that = this;
            var imgList = data.pic;
            var sHtml = '';
            if (!imgList || imgList.length === 0) {
                $('.image').html("无");
            } else {
                $('.pictures').removeClass('borderBottomNone');
                imgList.forEach(function(value, index) {
                    sHtml += that.createImgHtmlById(value);
                    // var sUrl = serverURL + "cloudlink-core-file/file/getImageBySize?fileId=" + value + "&viewModel=lfit&width=282&hight=282";
                    // var bigSrc = serverURL + "cloudlink-core-file/file/downLoad?fileId=" + value;
                    // sHtml += '<div class="picList ufl ub-ac " style="border:.325em solid white; box-sizing:border-box;width:33.3%;" >' + '<div style="height: 0px;padding-bottom: 100%;"></div>' + '<div class="uof uabs" style="height: 100%;width: 100%;">' + '<img src="' + sUrl + '"  data-bigSrc="' + bigSrc + '" width="100%" style="top: 50%;-webkit-transform: translateY(-50%);" class="uabs js_viewBig"/>' + '</div>' + '</div>'; 
                });
                $('.picture').html(sHtml);
            }
        },
        createImgHtmlById: function(sId) {
            var path = serverURL + "cloudlink-core-file/file/getImageBySize?fileId=" + sId + "&viewModel=fill&width=182&hight=182";
            var bigSrc = serverURL + "cloudlink-core-file/file/downLoad?fileId=" + sId;
            return [
                '<div class="picList ufl ub-ac " style="border:.24em solid white; box-sizing:border-box;width:33.3%;" >',
                '<div style="height: 0px;padding-bottom: 100%;"></div>',
                '<div class="uof uabs" style="height: 100%;width: 100%;background:url(' + path + ') no-repeat center center;background-size:cover;border:1px solid #ececec;box-sizing:border-box;" >',
                '<img src="' + path + '"  data-bigSrc="' + bigSrc + '" width="100%" height="100%" style="opacity:0;" class="uabs js_viewBig"/>',
                '</div></div>'
            ].join('');
        }         
    };
    window.facilityObj = obj;
})(appcan, window, Zepto, baseOperation, JasHttpRequest);

