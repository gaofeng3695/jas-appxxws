appcan.ready(function() {
    setObj.init();
});

var setObj = {
    jasHttpRequest : new JasHttpRequest(),
    aDataObj : {}, //当前点击的人员数据对象
    index : '', //点击的是第几个用户
    userId : '', //当前用户的userId
    enterpriseId : '', //当前用户的企业ID
    eventsMap : {
        'click #choosejob' : 'e_choosejob', //进行职位的设定
        'click #choosedept' : 'e_choosedept', //部门的设定
        'click #chooserole' : 'e_chooserole', //角色的设定
        'click #dongjie' : 'e_forzen', //冻结按钮的点击
        'click #remove' : 'e_deleteUser'
    },
    init : function() {
        this.getDataByLocalstorage();
        this.render();
        this.bindEvent();
        this.checkOut();
    },
    getDataByLocalstorage : function() {
        this.aDataObj = JSON.parse(appcan.locStorage.val("data"));
        this.index = appcan.locStorage.val("count");
        this.userId = appcan.locStorage.val("clickuserid");
        this.enterpriseId = appcan.locStorage.val("enterpriseId");
        this.removeLocal();
    },
    removeLocal : function() {
        appcan.locStorage.remove("data");
        appcan.locStorage.remove("count");
        appcan.locStorage.remove("clickuserid");
        appcan.locStorage.remove("enterpriseId");
    },
    render : function() {
        var obj = this.aDataObj;
        var count = this.index;
        if (obj[count].employee != null && obj[count].employee != "null" && obj[count].employee != "") {
            document.getElementById("job").innerHTML = obj[count].employee;
            //获取职位设定信息
        }
        if (obj[count].dept != null && obj[count].dept != "") {
            document.getElementById("dept").innerHTML = obj[count].dept;
            //获取部门设定信息
        }
        if (obj[count].roleNames != null && obj[count].roleNames != "") {
            document.getElementById("role").innerHTML = obj[count].roleNames;
        }
        var status = obj[count].status;
        if (status == -1) {
            $("#dongjie").css('height', '2.8125em');
            document.getElementById("status").innerHTML = "账户激活";
            document.getElementById("explain").innerHTML = "激活后,该用户正常操作。";

        } else if (status == 1) {
            $("#dongjie").css('height', '2.8125em');
            document.getElementById("status").innerHTML = "账户冻结";
            document.getElementById("explain").innerHTML = "冻结后，该用户不能做任何操作。";
        }
    },
    bindEvent : function() {
        var that = this;
        appcan.window.on('resume', function() {
            that.render();
        });
        appcan.button("#nav-left", "btn-act", function() {
            that.closeCurrentPage();
        });
        that.initializeOrdinaryEvent(this.eventsMap);
    },
    initializeOrdinaryEvent : function(maps) {
        this._scanEventsMap(maps, true);
    },
    _scanEventsMap : function(maps, isOn) {
        var delegateEventSplitter = /^(\S+)\s*(.*)$/;
        var type = isOn ? 'on' : 'off';
        for (var keys in maps) {
            if (maps.hasOwnProperty(keys)) {
                if ( typeof maps[keys] === 'string') {
                    maps[keys] = this[maps[keys]].bind(this);
                }
                var matchs = keys.match(delegateEventSplitter);
                $('body')[type](matchs[1], matchs[2], maps[keys]);
            }
        }
    },
    closeCurrentPage : function() {
        appcan.window.close(-1);
    },
    checkOut : function() {
        var that = this;
        uexWindow.setReportKey(0, 1);
        uexWindow.onKeyPressed = function(keyCode) {
            that.closeCurrentPage();
        };
    },
    e_choosejob : function() {
        if ($("#job").text().trim() == "请设定职位") {
            appcan.locStorage.setVal("userPosition", "");
        } else {
            appcan.locStorage.setVal("userPosition", $("#job").text());
        }
        appcan.openWinWithUrl("editposition", "editposition.html");
    },
    e_choosedept : function() {
        appcan.locStorage.setVal("orageResource", "choose");
        //区分是选择还是组织机构的展示
        appcan.locStorage.setVal("chooseresource", "setfunction");
        //区分选择是来自邀请还是功能设置的部门选择
        appcan.openWinWithUrl("organization", "organization.html");
    },
    e_chooserole : function() {
        var checkrole = $("#role").text();
        appcan.locStorage.setVal("defaultrole", checkrole);
        appcan.openWinWithUrl("chooserole", "chooserole.html");
    },
    changeposition : function() {
        var that = this;
        var position = appcan.locStorage.getVal("position");
        var partURL = "cloudlink-core-framework/user/updatePosition";
        that.jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
            if (JSON.parse(dbSource).success == 1) {
                $("#job").text(position);
                that.aDataObj[that.index].employee=position;
                baseOperation.alertToast("职位设定成功");
            } else {
                baseOperation.alertToast("职位设定失败");
            }
        }, ( {
            "objectId" : that.userId,
            "enterpriseId" : that.enterpriseId,
            "position" : position
        }));
    },
    changerole : function() {
        var that = this;
        var enterpriseId = that.enterpriseId;
        var userId = that.userId;
        var roleIds = appcan.locStorage.getVal("roleIds");
        //removeRoles移除角色
        var partURL = "cloudlink-core-framework/user/removeRoles";
        that.jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
            if (JSON.parse(dbSource).success == 1) {
                var partURL = "cloudlink-core-framework/user/assignRoles";
                that.jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
                    if (JSON.parse(dbSource).success == 1) {
                        var roleName = appcan.locStorage.getVal("roleName");
                         that.aDataObj[that.index].roleNames=roleName;
                        $("#role").text(roleName);
                        baseOperation.alertToast("角色设定成功");
                    } else {
                        baseOperation.alertToast("角色设定失败");
                    }
                }, ( {
                    "objectId" : userId,
                    "enterpriseId" : enterpriseId,
                    "roleIds" : roleIds
                }));
            }
        }, ( {
            "objectId" : userId,
            "enterpriseId" : enterpriseId
        }));
    },
    e_forzen : function() {
        var that = this;
        var objectid = that.userId;
        var enterpriseId = that.enterpriseId;
        var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
        if (userBo.objectId == objectid) {
            baseOperation.alertToast("您好：不能冻结您自己的账号");
        } else {
            var status = document.getElementById("status").innerText;
            if (status == "账户冻结") {
                /*用户确认提示框*/
                appcan.window.alert({
                    title : "账户冻结",
                    content : "冻结后，该用户不能进行任何操作，确定冻结该用户？",
                    buttons : ['确定', '取消'],
                    callback : function(err, data, dataType, optId) {
                        if (data == 0) {
                            //确定冻结

                            that.accountFrozen();
                        }
                    }
                });
            } else {
                /*用户确认提示框*/
                appcan.window.alert({
                    title : "账户激活",
                    content : "激活后，该用户正常进行工作，确定激活吗？",
                    buttons : ['确定', '取消'],
                    callback : function(err, data, dataType, optId) {
                        if (data == 0) {
                            //确定激活
                            that.accountActivation();
                        }
                    }
                });
            }
        }
    },
    accountFrozen : function() {
        var that = this;
        //调用接口，实现用户的冻结操作。
        var partURL = "cloudlink-core-framework/user/freeze";
        //进行该用户账号的冻结
        that.jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
            var obj = JSON.parse(dbSource);
            if (obj.success == 1) {
                //修改页面信息值
                that.aDataObj[that.index].status = '-1';
                document.getElementById("status").innerHTML = "账户激活";
                document.getElementById("explain").innerHTML = "激活后,该用户正常操作。";
            } else {
                baseOperation.alertToast("冻结失败！");
            }
        }, ( {
            "enterpriseId" : that.enterpriseId,
            "objectId" : that.userId
        }));
    },
    accountActivation : function() {
        var that = this;
        var partURL = "cloudlink-core-framework/user/unfreeze";
        //进行该用户账号的激活
        that.jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
            var obj = JSON.parse(dbSource);
            if (obj.success == 1) {
                //修改页面信息值
                that.aDataObj[that.index].status = '1';
                document.getElementById("status").innerHTML = "账户冻结";
                document.getElementById("explain").innerHTML = "冻结后，该用户不能做任何操作。";
            } else {
                baseOperation.alertToast("激活失败！");
            }
        }, ( {
            "enterpriseId" : that.enterpriseId,
            "objectId" : that.userId
        }));
    },
    e_deleteUser : function() {
        var that = this;
        var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
        if (userBo.objectId == that.userId) {
            alert("您是该企业的系统管理员，当前无法删除自己，如需移除，请您移交系统管理员权限。\n由新系统管理员进行移除。");
        } else {
            appcan.window.confirm({
                title : '提示',
                content : '确定要移除该用户吗？',
                buttons : ['确定', '取消'],
                callback : function(err, data, dataType, optId) {
                    if (data == 0) {
                        var partURL = "cloudlink-core-framework/user/removeFromEnterprise";
                        that.jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
                            if (dbSource == "") {
                                baseOperation.alertToast("网络繁忙，请稍候再试...");
                            }
                            if (JSON.parse(dbSource).success == 1) {
                                baseOperation.alertToast("移除成功");
                                that.closeCurrentPage();
                            }
                        }, JSON.stringify({
                            "objectId" : that.userId,
                            "enterpriseId" : that.enterpriseId
                        }));
                    }
                }
            });
        }
    },
    changedept : function() {
        var that = this;
        var orgid = appcan.locStorage.getVal("orgdept");
        appcan.locStorage.remove("orgdept");
        var orgname = appcan.locStorage.getVal("orgname");
        appcan.locStorage.remove("orgname");

        /*如果是针对当前登录用户的修改*/
        if (that.userId == JSON.parse(appcan.locStorage.getVal("userBo")).objectId) {
            reloadUserBoLocStorage("orgName", orgname);
            reloadUserBoLocStorage("orgId", orgid);
        }
        var partURL = "cloudlink-core-framework/user/updateOrg";
        that.jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
            if (JSON.parse(dbSource).success == 1) {
                $("#dept").text(orgname);
                that.aDataObj[that.index].dept=orgname;
                baseOperation.alertToast("部门设定成功");
            } else {
                baseOperation.alertToast("部门设定失败");
            }
        }, ( {
            "objectId" : that.userId,
            "orgId" : orgid
        }));
    }
}

