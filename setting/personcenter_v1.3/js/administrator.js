appcan.ready(function() {
    adminObj.init();
});

var adminObj = {
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
        var partURL = "cloudlink-core-framework/user/queryList?enterpriseId=" + userBo.enterpriseId + "&status=0,1";
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
        var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
        for (var z = 0; z < aData.length; z++) {
            if (aData[z].userName == "" || aData[z].userName == null) {
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
                    profilePhoto : aData[z].profilePhoto,
                    parentOrgName : aData[z].parentOrgName || '',
                    parentOrgIds : aData[z].parentOrgId || '',
                    orgId : aData[z].orgId,
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
                    profilePhoto : aData[z].profilePhoto,
                    parentOrgName : aData[z].parentOrgName || '',
                    parentOrgIds : aData[z].parentOrgId || '',
                    orgId : aData[z].orgId,
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
            s += createtemplate(item, index, false);
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
            appcan.locStorage.setVal("data", that.LinshidataArry);
            //实现点击的时候，可以弹出自己的页面信息
            appcan.locStorage.setVal("count", index);
            ////点击的时候进行存储当前用户企业d
            appcan.openWinWithUrl("admininformation", "admininformation.html");
        });
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
