appcan.ready(function() {
    userObj.init();
});
var utils = {
    ifCheckboxAllChecked : function($checkBoxs) {
        if ($checkBoxs.length === 0) {
            return false;
        }
        return $checkBoxs.not('input:checked').length === 0;
    }
};
var userObj = {
    jasHttpRequest : new JasHttpRequest(),
    initDataList : [], //请求完数据之后，数据组合
    LinshidataArry:[],
    init : function() {
        this.resquestData();
        this.bindEvent();
        //进行数据的请求
    },
    resquestData : function() {
        var that = this;
        var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
        var partURL = "cloudlink-core-framework/user/queryList?enterpriseId=" + userBo.enterpriseId + "&status=0,1,-1";
        baseOperation.londingToast("数据请求中，请稍候", 9000);
        that.jasHttpRequest.jasHttpGet(partURL, function(id, state, dbSource) {
            if (dbSource == "") {
                baseOperation.alertToast("网络繁忙，请稍候再试...");
                return;
            }
            var dataforobj = JSON.parse(dbSource);
            that.reloadArrayByName(dataforobj.rows);
        });
    },
    reloadArrayByName : function(aData) {

        /*进行重新封装一个排好顺序的集合*/
        var that = this;
        var resetArray = [];
        for (var z = 0; z < aData.length; z++) {
            if(aData[z].userName==""||aData[z].userName==null){
                continue;
            }
            var name = aData[z].userName.substr(0, 1);
            //取出人员的姓
            var REX = /\w/i;
            //匹配字母
            if (REX.test(name)) {
                var upcase = name.toUpperCase();
                //把字母转化成大写
                resetArray.push({
                    name : aData[z].userName, //名称
                    employee : aData[z].position, //职位
                    roleNames : aData[z].roleNames, //角色名称
                    dept : aData[z].orgName, //组织机构
                    objectid : aData[z].objectId, //唯一的id
                    sex : aData[z].sex, //性别
                    weixin : aData[z].wechat, //微信
                    age : aData[z].age, //年龄
                    qq : aData[z].qq, //qq
                    email : aData[z].email, //email
                    enterpriseId : aData[z].enterpriseId, //企业id
                    status : aData[z].status, //-1是冻结，1是解冻
                    tel : aData[z].mobileNum, //手机号
                    parentOrgName : aData[z].parentOrgName || '',
                    parentOrgIds:aData[z].parentOrgIds||'',
                    orgId:aData[z].orgId,
                    index : upcase
                });

            } else {
                var fl = pinyin.getCamelChars(name);
                //首字母
                resetArray.push({
                    name : aData[z].userName, //名称
                    employee : aData[z].position, //职位
                    roleNames : aData[z].roleNames, //角色名称
                    dept : aData[z].orgName, //组织机构
                    objectid : aData[z].objectId, //唯一的id
                    sex : aData[z].sex, //性别
                    weixin : aData[z].wechat, //微信
                    age : aData[z].age, //年龄
                    qq : aData[z].qq, //qq
                    email : aData[z].email, //email
                    enterpriseId : aData[z].enterpriseId, //企业id
                    status : aData[z].status, //-1是冻结，1是解冻
                    tel : aData[z].mobileNum, //手机号
                    parentOrgName : aData[z].parentOrgName || '',
                    parentOrgId:aData[z].parentOrgId||'',
                    orgId:aData[z].orgId,
                    index : fl
                });
            }
        }

        that.aDataBySort(resetArray);
    },
    aDataBySort : function(aData) {
        var dataArry = [];
        dataArry = Enumerable.From(aData).OrderBy(function(x) {
            return x.index;
        }).Select(function(x) {
            return x
        }).ToArray();
        this.initDataList = dataArry;
        this.LinshidataArry=dataArry;
        this.renderListByTemplate(dataArry);
    },
    renderListByTemplate : function(aData) {
        var s = "";
        if (aData.length == 0) {
            $("#list_wrapper").removeClass("bg");
            baseOperation.closeToast();
            $("#list_wrapper").html('<div class="ub ub-pc uinn ulev30 clr666 ">暂无数据</div>');
            return;
        }
        aData.forEach(function(item, index, arr) {
            s += createtemplate(item, index, true);
        });
        $("#list_wrapper").addClass("bg");
        baseOperation.closeToast();
        $("#list_wrapper").html(s);
    },
    bindEvent : function() {
        var that = this;
        $('body').on('click', 'ul li', function(e) {
            var t = e.target;
            if ($(t).hasClass('js_check')) {
                that.setFatherCheckBox();
                return;
            }
            var index = this.dataset.index;
            var objectId = this.dataset.id;
            var enterpriseId = this.dataset.enterprised;
            appcan.locStorage.setVal("data", that.LinshidataArry);
            //实现点击的时候，可以弹出自己的页面信息
            appcan.locStorage.setVal("count", index);
            appcan.locStorage.setVal("clickuserid", objectId);
            //点击的时候进行存储当前用户的id
            appcan.locStorage.setVal("enterpriseId", enterpriseId);
            ////点击的时候进行存储当前用户企业d
            appcan.openWinWithUrl("setfunction", "setfunction.html");
        });
    },
    setFatherCheckBox : function() {
        var bool = utils.ifCheckboxAllChecked($('input[type="checkbox"]'));
        appcan.window.evaluateScript('usercontrol', 'checkedAll(' + bool + ')');
    },
    setCheckBoxIfChecked : function(bool) {
        $('input[type="checkbox"]').prop('checked', bool);
    },
    deleteCheck : function() {
        var that = this;
        var arr = [];
        var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
        $('input:checked').parents('li').each(function(index) {
            arr.push(this.dataset.id);
        });
        if (arr.length == 0) {
            baseOperation.alertToast("请选择您要移除的人员信息!");
            return;
        }
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == userBo.objectId) {
                alert("您所选人员当中包含系统管理员，无法移除。如需移除，请您先移交系统管理员权限。\n由新系统管理员进行移除。");
                return;
            }
        };
        appcan.window.alert({
            title : "移除",
            content : "是否移除选中的人员？",
            buttons : ['确定', '取消'],
            callback : function(err, data, dataType, optId) {
                if (data == 0) {
                    that.deletecheckToService(arr);
                }
            }
        });
    },
    deletecheckToService : function(arr) {
        var that = this;
        var partURL = "cloudlink-core-framework/user/removeFromEnterprise";
        var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
        that.jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
            if (dbSource == "") {
                baseOperation.alertToast("网络繁忙，请稍候再试...");
            }
            if (JSON.parse(dbSource).success == 1) {
                baseOperation.alertToast("移除成功");
                that.resquestData();
            }
        }, JSON.stringify({
            "objectId" : arr.join(','),
            "enterpriseId" : userBo.enterpriseId
        }));
    },
    search : function(value) {
        var aData = this.initDataList;
        var dataArry = [];
        if (value != "" && value != null) {
            dataArry = Enumerable.From(aData).Where(function(x) {
                return x.name.indexOf(value) >= 0
            }).ToArray();
        } else {
            dataArry = this.initDataList;
        }
        this.LinshidataArry=dataArry;
        this.renderListByTemplate(dataArry);
    },
}