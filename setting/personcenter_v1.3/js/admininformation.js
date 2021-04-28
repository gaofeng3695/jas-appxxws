appcan.ready(function() {
    adminInfoObj.init();
});
var adminInfoObj = {
    userId : '',
    status : '',
    userBo : JSON.parse(appcan.locStorage.getVal("userBo")),
    //确定后，调用接口修改人员的权限
    jasHttpRequest : new JasHttpRequest(),
    init : function() {
        this.renderPage();
        this.bindEvent();
    },
    renderPage : function() {
        var data = appcan.locStorage.getVal("data");
        var obj = JSON.parse(data);
        var count = appcan.locStorage.getVal("count");
        this.userId = obj[count].objectid;
        this.status = obj[count].status;
        $("#name").text(obj[count].name);
        $("#age").text(obj[count].age);
        $("#dept").text(obj[count].dept);
        $("#job").text(obj[count].employee);
        $("#tel").text(obj[count].tel);
        $("#qq").text(obj[count].qq);
        $("#weixin").text(obj[count].weixin);
        $("#email").text(obj[count].email);
        if (obj[count].profilePhoto == null || obj[count].profilePhoto == "") {
            if (obj[count].sex == null || obj[count].sex == "" || obj[count].sex == "男") {
                document.getElementById("profile").src = "image/nantou.png";
            } else {
                document.getElementById("profile").src = "image/girl.png";
            }
        } else {
            document.getElementById("profile").src = serverURL + "cloudlink-core-file/file/getImageBySize?fileId=" + obj[count].profilePhoto + "&viewModel=fill&width=500&hight=500";
        }
        if (obj[count].sex == null || obj[count].sex == "" || obj[count].sex == "男") {
            $("#sex").attr("src", "image/nan.png");
        } else {
            $("#sex").attr("src", "image/nv.png");
        }
        appcan.locStorage.remove("count");
        appcan.locStorage.remove("data");
    },
    bindEvent : function() {
        var that = this;
        appcan.button("#nav-left", "btn-act", function() {
          
            appcan.window.close(-1);
        });
        $("#admin").click(function() {
            appcan.window.alert({
                content : '授权后，您将不会再拥有系统管理员权限，确定移交吗？',
                buttons : ['确定', '取消'],
                callback : function(err, data, dataType, optId) {
                    if (data == 0) {
                        if (that.userBo.objectId == that.userId) {
                            baseOperation.alertToast('您好,您已经是管理员权限');
                            return;
                        } else {
                            if (that.status == 1) {
                                that.changeAdmin();
                            } else {
                                baseOperation.alertToast('您好,该用户未激活该企业不能将管理员权限赋予');
                                return;
                            }

                        }

                    }
                }
            });
        });
    },
    changeAdmin : function() {
        var that = this;
        var partURL = "cloudlink-core-framework/user/changeEnpAdminAndSendMsm";
        //进行企业管理员权限的移交
        that.jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
            var obj = JSON.parse(dbSource).success;
            if (obj == 1) {
                appcan.locStorage.setVal("sysadmin", "sysadmin");
                appcan.window.close(-1);
                appcan.window.evaluateScript('administrator', 'close()');
            }
        }, ( {
            "enterpriseId" : that.userBo.enterpriseId,
            "from" : that.userBo.objectId,
            "to" : that.userId,
            'fromUserName' : that.userBo.userName,
            'enterpriseName' : that.userBo.enterpriseName,
            'functionNames' : "企业管理",
            'signName' : ""
        }));
    }
}
