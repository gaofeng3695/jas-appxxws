appcan.ready(function() {
    roleObj.init();
});
var roleObj = {
    jasHttpRequest : new JasHttpRequest(),
    lv : appcan.listview({
        selector : "#listview",
        type : "thinLineTmp",
        hasSubTitle : true,
        hasAngle : false,
        hasRadiobox : true,
    }),
    init : function() {
        this.requsetData();
        this.bindEvent();
    },
    requsetData : function() {
        var that = this;
        var url = "cloudlink-core-framework/role/queryList?roleType=2";
        that.jasHttpRequest.jasHttpGet(url, function(id, state, data) {
            if (data == "") {
                baseOperation.alertToast("网络繁忙，请稍候再试...");
                return;
            }
            var dbObj = JSON.parse(data);
            if (dbObj.success == 1) {
                var datarows = dbObj.rows;
                that.renderRole(datarows);
            } else {
                baseOperation.alertToast("获取角色列表：请求失败");
                return;
            }
        });
    },
    renderRole : function(aData) {
        var that = this;
        var arry = [];
        aData.forEach(function(item, index, arr) {
            arry[index] = {
                title : "<a class='rolname'>" + item.roleName + "</a>",
                roleId : item.objectId,
                roleName : item.roleName,
            };
        });
        that.lv.set(arry);
        that.renderRoleByDefault();
    },
    renderRoleByDefault : function() {
        var defaultrole = appcan.locStorage.getVal("defaultrole");
        //进行默认角色的设定
        appcan.locStorage.remove("defaultrole");
        //进行默认角色的移除
        $(".rolname").each(function(e) {
            if ($(this).text() == defaultrole) {
                $("#listview").find('input[type="radio"]').eq(e).prop('checked', true);
            }
        });
    },
    bindEvent : function() {
        var that = this;
        appcan.button("#nav-left", "btn-act", function() {
            appcan.window.close(-1);
        });
        that.lv.on("radio:change", function(obj, data) {
            that.changeroleToService(data);
        });
        that.lv.on("click", function(obj, data) {
            that.changeroleToService(data);
        });
    },
    changeroleToService : function(data) {
        appcan.locStorage.setVal("roleName", data.roleName);
        appcan.locStorage.setVal("roleIds", data.roleId);
        appcan.window.close(-1);
        appcan.window.evaluateScript('setfunction', 'setObj.changerole()');
    }
}

