// window.onerror = function(msg, url, line) {
//     alert("erro" + msg + "\n" + url + ":" + line);
//     return true;
// };

appcan.ready(function() {
    recordDetailObj.init();
});

var recordDetailObj = {
    paramsObj: null,
    elem: {
        security_check_time: '.security_data', //安检时间
        enterhome_user_type_code: '.customer_type', //用户类型
        enterhome_address: '.detail_location', //详细地址
        enterhome_user_name: '.user_name', //用户名称
        enterhome_user_code: '.user_number', //用户编号
        enterhome_user_tel: '.contact_number', //联系电话
        enterhome_user_tel2: '.contact_number2', //联系电话
        enterhome_situation_type_code: '.home_situation', //入户情况
        security_man: '.security_man', //安检人
        gasmeter_name: '.gasmeter_name', //燃气表名称   燃气表-1
        gasmeter_code: '.number', //编号
        gasmeter_entermode: '.leftRight_table', //左右表
        gasmeter_data: '.gasMeter_reading', //燃气表读数
        hidden_state: '.hiddenState', //隐患状态
        modifyDate: '.modifyDate', //整改日期
        noticeWrapp: '#noticeWrapp', //提示dom
        remarks: '.remarks', //备注
        user_signature: '.user_signature', //用户签名
        rating: '.rating', //用户签名
    },
    init: function() {
        this.inittableElem();
        this.initParamsObj();
        this.initElement();
        this.getDetail();
        this.bindEvent();
    },
    initElement: function() {
        this.jasHttpRequest = new JasHttpRequest();
        this.recordId = appcan.locStorage.val('recordId');
    },
    initParamsObj: function() {
        this.paramsObj = {
            groupId: "",
            objectId: "", //记录ID
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
            userArchiveVo:null, //修改燃气表的Bo
            satisfaction : null,
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
    inittableElem: function() {
        var eles = this.elem;
        for (var name in eles) {
            if (eles.hasOwnProperty(name)) {
                this[name] = $(eles[name]);
            }
        }
    },
    bindEvent: function() {
        var that = this;
        return;
        // $('body').on('longTap', '.user_signature img', function() {
        //     if (location.hash === '#newLocal') {
        //         appcan.window.evaluateScript('detail_sign', 'wrapperObj.triggerSign()');
        //     }
        // });
        // $('body').on('click', '.rating', function() {
        //     if (location.hash === '#newLocal') {
        //         if (this.innerHTML) {
        //             appcan.window.evaluateScript('detail_sign', 'wrapperObj.scoreRate(' + that.paramsObj.rating + ')');
        //         }
        //     }
        // });
    },
    getDetail: function() {
        var that = this;
        //alert(location.hash === '#local' || location.hash ==='#newLocal');
        if (location.hash === '#local' || location.hash === '#newLocal') {
            this.getDetailFromLocal();
            viewPicObj.init(true);
        } else {
            this.requestDetail();
            viewPicObj.init(false);
        }
    },
    //本地請求數據
    getDetailFromLocal: function() {
        var that = this;
        selectEhscRecordInfo(that.recordId, function(result) { //查询安检记录的详情
            if (result.success == 1) {
                $.extend(that.paramsObj, result.data);
                that.render(that.paramsObj);
            }
        });
    },
    //後台請求數據
    requestDetail: function() {
        var that = this;
        var partURL = "cloudlink-inspection-event/commonData/securityCheckRecord/get?objectId=" + that.recordId;
        baseOperation.londingToast('数据请求中，请稍后...', 99999);
        that.jasHttpRequest.jasHttpGet(partURL, function(id, state, dbSource) {
            // alert(dbSource);
            if (dbSource === "") {
                baseOperation.alertToast('网络繁忙，请稍后再试');
                return;
            }
            baseOperation.closeToast();
            var reObj = JSON.parse(dbSource);
            if (reObj.success == 1) {
                var data = reObj.rows[0];
                appcan.locStorage.val('userFileId',data.groupId);
                if (data.hasHistory == "1") {
                    appcan.locStorage.val('groupId', data.groupId);
                    appcan.window.evaluateScript('record_detail', 'wrapperObj.resizePopover()');
                }
                var obj = {
                    enterhomeAddress: data.address , //地址
                    enterhomeUserName: data.userFileName , // 用户名称 
                    enterhomeUserCode: data.userFileCode , // 用户编号 
                    enterhomeUserTel: data.contactPhone , // 联系电话                                       
                };
                $.extend(that.paramsObj, data,obj);
                that.render(that.paramsObj);                
                //that.render(data);
            } else {
                baseOperation.alertToast('网络繁忙，请稍后再试');
            }
        });
    },
    render: function(data_) {
        var that = this;
        var typeMap = {
            'EHT_001': '居民',
            'EHT_002': '工业',
            'EHT_003': '商业',
            'EHT_004': '福利',
            'EHT_099': '其他'

        };
        var resultMap = {
            'EHS_001': "成功入户",
            'EHS_002': "拒绝检查",
            'EHS_003': "到访不遇"

        };
        // alert(JSON.stringify(data_))
        //alert(data_.satisfaction)
        //安检时间
        that.security_check_time.html(data_.securityCheckTime);
        //用户类型
        that.enterhome_user_type_code.html(data_.enterhomeUserTypeName);
        //详细地址
        that.enterhome_address.html(data_.enterhomeAddress);
        //用户名称
        that.enterhome_user_name.html(data_.enterhomeUserName);
        //用户编号
        that.enterhome_user_code.html(data_.enterhomeUserCode);
        //联系电话
        that.enterhome_user_tel.html(data_.enterhomeUserTel);
        //备用电话        
        that.enterhome_user_tel2.html(data_.alternativePhone);
        //入户情况
        that.enterhome_situation_type_code.html(resultMap[data_.enterhomeSituationTypeCode]);
        //安检人
        that.security_man.html(data_.createUserName || data_.userName);
        //燃气表列表
        that._renderGasMeter(data_.gasmeters);
        //隐患情况 hiddendangers
        that._renderDangers(data_);
        // 照片
        that._renderPicture(data_);
        //备注
        that.remarks.html(data_.remark);
        //签名
        that._renderSignPic(data_);
        //评分
        that._renderRating(data_.satisfaction || 0);
        //alert(signature)
        that._renderFooterBtn(data_.enterhomeSituationTypeCode === 'EHS_001');
    },
    _renderFooterBtn: function(isSign) {
        if (!isSign) {
            appcan.window.evaluateScript('detail_sign', '$(".footer .wrapper").removeClass("animate").addClass("btn_active")');
        }
    },
    _renderGasMeter: function(aGas) {
        var s = '';
        //alert(aGas)
        aGas.forEach(function(value, index) {
            s += [
            '<div class="sectionShadow sectionMargin bgcolor">',
                '<div class="ub p06 borderBottom">',
                    '<div class="ub-f1 ulev26 gasmeter_name ub ub-pc clr333">'+ (value.gasmeterName || ('燃气表-'+(index+1)))+'</div>',
                '</div>',

                '<div class="ub p06 borderBottom">',
                    '<div class="ulev26 leftStyle clr666 w2">编号</div>',
                    '<div class="ub-f1 ulev26 borderLeft number clr333">'+ value.gasmeterCode +'</div>',
                '</div>',
                '<div class="ub p06 borderBottom">',
                    '<div class="ulev26 leftStyle clr666 w2">类型</div>',
                    '<div class="ub-f1 ulev26 borderLeft number clr333">'+ value.gasmeterTypeName +'</div>',
                '</div>',                
                '<div class="ub p06 borderBottom">',
                    '<div class="ulev26 leftStyle clr666 ">进气方向</div>',
                    '<div class="ub-f1 ulev26 borderLeft leftRight_table clr333">'+ value.gasmeterEntermode +'</div>',
                '</div>',
                '<div class="ub p06 borderBottom">',
                    '<div class="ulev26 leftStyle clr666 ">使用状态</div>',
                    '<div class="ub-f1 ulev26 borderLeft leftRight_table clr333">'+ value.gasmeterStatusName +'</div>',
                '</div>',                
                '<div class="ub p06 borderBottom">',
                    '<div class="ulev26 leftStyle clr666 w2">读数</div>',
                    '<div class="ub-f1 ulev26 borderLeft gasMeter_reading clr333">'+ value.gasmeterData +'</div>',
                '</div>',
            '</div>',
            ].join('');
        });
        $('.kuai').html(s);
    },
    _renderDangers: function(obj) {
        var s = '';
        var aDanger = obj.hiddendangers;
        aDanger.forEach(function(value, index) {
            s += "<span class='status ulev24'>" + value.hiddendangerName + "</span>";

        });
        this.hidden_state.html(s || '<span class="ulev26 clr333">无</span>');
        if (aDanger.length>0) {
            this.noticeWrapp.removeClass('uhide');
            this.modifyDate.html(obj.remediationTime ? obj.remediationTime + " 之前" : '');
        }
    },
    _renderPicture: function(data_) {
        var that = this;
        //照片的渲染
        $(".image").html("");
        if (location.hash === '#local' || location.hash === '#newLocal') {
            var s = "";
            if (data_.attas.filter(function(item){
                return item.bizType === 'pic';
            }).length === 0) {
                $(".zaopian").parent().css({'display':'none'});
            } else {
                data_.attas.forEach(function(item, index) {
                    if (item.bizType !== 'pic') {
                        return;
                    }
                    //s += "<div class='imgStyle'><img class='mb05 js_viewBig' src='" + item.url + "'></div>";
                    s += [
                        '<div class="picList ufl ub-ac " style="border:.24em solid white; box-sizing:border-box;width:33.3%;" >',
                        '<div style="height: 0px;padding-bottom: 100%;"></div>',
                        '<div class="uof uabs" style="height: 100%;width: 100%;background:url(' + item.url + ') no-repeat center center;background-size:cover;border:1px solid #ececec;box-sizing:border-box;" >',
                        '<img src="' + item.url + '" width="100%" height="100%" style="opacity:0;" class="uabs js_viewBig"/>',
                        '</div></div>'
                    ].join('');
                });
                $('.image').html(s);
            }
            return;
        }
        var imgList = data_.pic;
        if (!imgList || imgList.length === 0) {
            $(".zaopian").parent().css({'display':'none'});
        } else {
            var sHtml = '';
            imgList.forEach(function(value, index) {
                var path = serverURL + "cloudlink-core-file/file/getImageBySize?fileId=" + value + "&viewModel=fill&width=182&hight=182";
                var bigSrc = serverURL + "cloudlink-core-file/file/downLoad?fileId=" + value;
                //sHtml += "<div class='imgStyle'><img class='mb05 js_viewBig' src='" + path + "' data-bigSrc=" + bigSrc + "></div>";
                sHtml += [
                    '<div class="picList ufl ub-ac " style="border:.24em solid white; box-sizing:border-box;width:33.3%;" >',
                    '<div style="height: 0px;padding-bottom: 100%;"></div>',
                    '<div class="uof uabs" style="height: 100%;width: 100%;background:url(' + path + ') no-repeat center center;background-size:cover;border:1px solid #ececec;box-sizing:border-box;" >',
                    '<img src="' + path + '"  data-bigSrc="' + bigSrc + '" width="100%" height="100%" style="opacity:0;" class="uabs js_viewBig"/>',
                    '</div></div>'
                ].join('');
            });
            $('.image').html(sHtml);
        }
    },
    _renderSignPic: function(data_) {
        //alert(JSON.stringify(data_))
        if (location.hash === '#local' || location.hash === '#newLocal') {
            var s = '';
            data_.attas.forEach(function(item, index) {
                if (item.bizType === 'pic') {
                    return;
                }
                s = '<div class="imgStyle"><img class="js_viewBig" src="' + item.url + '"></div>';
            });
        } else {
            var aSign = data_.signature;
            //alert(aSign[0])
            if (!aSign || aSign.length === 0) {
                //alert();
                return;
            }
            //alert(aSign[0])
            var value = aSign[0];
            var path = serverURL + "cloudlink-core-file/file/getImageBySize?fileId=" + value + "&viewModel=lfit&width=282&hight=282";
            var bigSrc = serverURL + "cloudlink-core-file/file/downLoad?fileId=" + value;
            s = '<div class="imgStyle"><img class="js_viewBig" src="' + path + '" data-bigSrc=' + bigSrc + '></div>';
        }
        this.user_signature.html(s);
    },
    _renderRating: function(n) {
        var that = this;
        var s = '';
        var aRate = ['无', '非常不满', '不满意', '一般', '满意', '非常满意'];
        if (n) {
            n = +n;
            for (var i = 1; i < 6; i++) {
                s += i > n ? '<img src="../src/images/star.png">' : '<img src="../src/images/star_selected.png">';
            }
            s += '<span class="ml clr666">' + aRate[n] + '</span>';
        }
        that.rating.html(s || '');
    },
    renderSignPic: function(sUrl) {
        this.user_signature.html('<div class="imgStyle"><img class="js_viewBig" src="' + sUrl + '"></div>');
        this.updateSignPicToParamsObj(sUrl);
    },
    renderRatingAndUpdateObj: function(n) {
        this._renderRating(n);
        this.paramsObj.satisfaction = n;
    },
    uploadImgSuccess: function() { //上传记录
        var that = this;
        /*直接传入所有的记录信息进行保存*/
        //alert(JSON.stringify(that.paramsObj));
        //that.formatGasMeterBo(that.paramsObj);
        //alert(JSON.stringify(that.paramsObj));
        //uexLog.sendLog(JSON.stringify(that.paramsObj));
        uploadObj.uploadRecordByBO(that.paramsObj, function() {
            that.deleteRecordFromDraf();
        }, function() {
            appcan.window.evaluateScript('detail_sign', 'wrapperObj.isPostReady = true');
            appcan.window.evaluateScript('record_detail', 'wrapperObj.isPostReady = true');
            //baseOperation.alertToast("记录上传失败");
        });
    },
    deleteRecordFromDraf: function() { //删除记录从草稿箱中
        deleteEhscRecordByIds(this.recordId, function(result) {
            if (result.success == 1) {
                baseOperation.alertToast("保存成功", 2000);
                //本地保存成功之后，需要进行什么操作。
                appcan.window.evaluateScript('detail_sign', 'close()');
                appcan.window.evaluateScript({
                    name: 'record_detail',
                    scriptContent: 'appcan.window.close()'
                });
            } else {
                baseOperation.alertToast("网络异常请稍候");
            }
        });
    },
    saveDataTOLocal: function(callback) { //保存数据到本地
        //alert(JSON.stringify(this.paramsObj));
        var that = this;
        saveOfflineData($.extend({}, this.paramsObj), function(result) {
            if (+result.success === 1) {
                //baseOperation.alertToast("保存成功", 2000); //本地保存成功之后，需要进行什么操作。
                if (typeof callback === 'function') {
                    callback();
                }
            } else {
                baseOperation.alertToast("数据保存失败！");
                //appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
            }
        });
    },
    saveDataFromDraft: function() {
        var that = this;
        //that.formatGasMeterBo(that.paramsObj);
        //alert(JSON.stringify(that.paramsObj))
        that.saveDataTOLocal(function() {
            updateOfflineEhscRecordState(that.recordId, "1", function(result) {
                if (result.success == 1) {
                    baseOperation.alertToast("数据保存成功");
                    appcan.window.evaluateScript('detail_sign', 'close()');
                } else {
                    baseOperation.alertToast("数据保存未成功");
                }
            });
        });
    },
    deleteRecord: function() {
        var that = this;
        appcan.window.alert({
            title: "删除本地记录",
            content: "是否删除该条记录？",
            buttons: ['确定', '取消'],
            callback: function(err, data, dataType, optId) {
                if (data == 0) {
                    deleteEhscRecordByIds(that.recordId, function(result) {
                        if (result.success == 1) {
                            baseOperation.alertToast("删除成功", 2000);
                            appcan.window.evaluateScript({
                                name: 'record_detail',
                                scriptContent: 'appcan.window.close()'
                            });
                        } else {
                            baseOperation.alertToast("网络异常请稍候");
                        }
                    });
                }
            }
        });
    },
    updateSignPicToParamsObj: function(sUrl) {
        var aImg = this.paramsObj.attas || [];
        for (var i = 0; i < aImg.length; i++) {
            if (aImg[i].bizType === 'esignature') {
                aImg[i].url = sUrl;
                return;
            }
        }
        this.paramsObj.attas.push({
            bizType: 'esignature',
            url: sUrl
        });
    },
    formatGasMeterBo : function(obj){
        var that = this;
        var isModify = false;
        obj.gasmeters.forEach(function(item,index){
            if (+item.operationFlag !== 0) {
                isModify = true;
            }
        });
        if (isModify) {
            that.paramsObj.userArchiveVo = {
                objectId : obj.groupId,
                userGasmeterList : JSON.parse( JSON.stringify(obj.gasmeters))
            };
        }
        that.paramsObj.gasmeters = obj.gasmeters.map(function(item){
            return {
                gasmeterId : item.objectId , //燃气表ID（引用用户档案中燃气表的主键）
                gasmeterData : item.gasmeterData             
            };
        });
    }
};
