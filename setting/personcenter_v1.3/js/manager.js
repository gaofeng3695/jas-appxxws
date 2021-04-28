appcan.ready(function() {
    managerObj.init();
});

var managerObj = {
    jasHttpRequest:new JasHttpRequest(),
    init : function() {
        this.bindEvent();
        this.checkOut();
    },
    bindEvent : function() {
        var that=this;
        appcan.button("#companyapprove", "btn-act", function() {
            appcan.openWinWithUrl("enterInfo", "enterInfo.html");
            // that.authenticationstatus();
        });
        appcan.button("#people", "btn-act", function() {
            appcan.openWinWithUrl("administrator", "administrator.html");
        });
        appcan.button("#usermanage", "btn-act", function() {
            appcan.openWinWithUrl("usercontrol", "usercontrol.html");
        });
        appcan.button("#organization", "btn-act", function() {      
            appcan.openWinWithUrl("organization", "organization.html");
        });
        appcan.button("#nav-left", "btn-act", function() {
           that.backAndRefresh();
        });
    },
    checkOut : function() {//退出应用
        var that=this;
        uexWindow.setReportKey(0, 1);
        uexWindow.onKeyPressed = function(keyCode) {
          that.backAndRefresh();
        };
    },
    backAndRefresh:function(){
        appcan.window.evaluateScript('personal', 'changelist()');
        appcan.window.close(-1); 
    },
    authenticationstatus : function() {
        var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
        var partURL = "cloudlink-core-framework/enterprise/getById?objectId=" + userBo.enterpriseId;
        this.jasHttpRequest.jasHttpGet(partURL, function(id, state, dbSource) {
            if (dbSource == "") {
                baseOperation.alertToast("网络异常，请稍候尝试");
                return;
            }
            var obj = JSON.parse(dbSource);
            status = obj.rows[0].authenticateStatus;
            if (status == 0) {
                //进行认证信息的填写
                appcan.openWinWithUrl("companyapprove", "companyapprove.html");
            } else {
                appcan.openWinWithUrl("companylist", "companylist_create.html");
                //已经认证过，进行相关信息的展示
            }
        });
    }
}

