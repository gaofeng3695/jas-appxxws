(function(window, appcan, $, JasHttpRequest, baseOperation) {
    var utils = {
        getObjByIdFromArr : function(sId, aObj) {
            for (var i = 0; i < aObj.length; i++) {
                if (aObj[i].objectId === sId) {
                    return aObj[i];
                }
            }
            return;
        },
    };
    var obj = {
        aDepts : null, //所有部门和人员
        aTitleDepts : null, //标题栏数组
        oCurrentDept : null, //当前部门对象
        aChildren : null, //当前部门的子部门
        eventsMap : {
            'click .item' : 'e_selectDept',
            'longTap .item' : 'e_showBubble',
            'click .active' : 'e_selectDeptFromTitle',
            'click #bubble .rename' : 'e_renameDept',
            'click #bubble .delete' : 'e_deleteDept',
            'touchstart #content' : 'e_removeBubble',
            'click .enter' : 'e_inviteSetDept',
        },
        elem : {
            "facilityName" : '#facilityName', //设施名称
        },
        init : function() {
            this.initElem();
            this.initAppcanParams();
            this.bindEvent();
            this.hiddenFooter();
            this.checkout();
            //物理返回键监听
            this.requestAllDepts();
        },
        bindEvent : function() {
            var that = this;
            this.initializeOrdinaryEvent(this.eventsMap);

            appcan.button("#nav-left", "btn-act", function() {
                that.back();
            });

            appcan.button("#btn1", "btn-act", function() {
                //appcan.window.evaluatePopoverScript('organization','content','add()');
                if (that.pageResource == "choose") {
                    that.e_chooseDept();
                } else {
                    that.e_addDept();
                }

            });
        },

        requestAllDepts : function() {
            var that = this;
            baseOperation.londingToast("数据加载中，请稍候...");
            var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
            var params = {
                "enterpriseId" : userBo.enterpriseId
            };
            var part1 = 'cloudlink-core-framework/organization/queryList';
            that.jasHttpRequest.jasHttpPost(part1, function(id, state, dbSource) {
                if (state == -1) {
                    baseOperation.alertToast("当前网络异常，无法请求服务器！\r\n请您检查手机网络。");
                    return;
                }
                baseOperation.closeToast();
                if (dbSource == "") {
                    baseOperation.alertToast("网络繁忙，请稍候再试...");
                    return;
                }
                var obj = JSON.parse(dbSource);
                var aRows = obj.rows;
                that.aDepts = obj.rows;
                that.setCurrentDept(aRows);

                that.setTitleDeptsById(that.oCurrentDept.objectId);
                that.renderTitleDepts(that.aTitleDepts);

                that.aChildren = that.getChildrenDepts(that.oCurrentDept.objectId, that.aDepts);
                that.renderDeptsList(that.aChildren);
                //alert('所有部门arr'+JSON.stringify(that.aDepts));
                // alert('当前部门obj'+JSON.stringify(that.oCurrentDept));
                // alert('当前子部门arr'+JSON.stringify(that.aChildren));
            }, JSON.stringify(params));
        },
        renderTitleDepts : function(aDepts) {//入参title数组
            var that = this;
            var s = '';
            aDepts.forEach(function(item, index, arr) {
                if (item.parentId == null && aDepts.length == 1) {
                    s += '<span data-id="' + item.objectId + '"  data-name="' + item.orgName + '" class="ulev30 enter">' + item.orgName + '</span>';
                } else if (arr.length - 1 === index) {//最后一个
                    s += '<span data-id="' + item.objectId + '"  titleid="' + item.objectId + '" class="ulev30">' + item.orgName + '</span>';
                } else {
                    s += '<span data-id="' + item.objectId + '"  titleid="' + item.objectId + '" class="ulev30 active ">' + item.orgName + '</span><span class="fa fa-angle-right "></span>';
                }
            });
            $('.title').html(s).parent()[0].scrollLeft = 100000;
        },
        renderDeptsList : function(aDepts) {
            var that = this;
            var s = '';
            aDepts.forEach(function(item, index) {
                var num = that.getChildrenDepts(item.objectId, that.aDepts).length || 0;
                s += ['<div class="toNext item ub ub-ac" data-id=', item.objectId, '>', '<div class="radiobox js_check ', that.pageResource == "choose" ? '' : 'hidden', '" ><input type="radio" class="js_check" name="dept" id="', item.objectId, '" orgname="', item.orgName, '"></div>', '<div class="toNext ub-f1 name ut-s ulev28 clr333 pr625 ', that.pageResource == "choose" ? 'pl625' : '', '" data-id=', item.objectId, '>', item.orgName, '</div>', '<div class="toNext ulev26 clr999 pr625" data-id=', item.objectId, '>', num, '个子部门</div>', '<div class="toNext fa fa-angle-right icon" data-id=', item.objectId, '></div>', '</div>'].join('');
            });
            $('.itemWrapper').html(s);
        },
        setCurrentDept : function(aDepts) {
            var that = this;
            if (that.oCurrentDept) {
                that.oCurrentDept = utils.getObjByIdFromArr(that.oCurrentDept.objectId, aDepts);
                return;
            }
            for (var j = 0; j < aDepts.length; j++) {
                if (!aDepts[j].parentId) {
                    that.oCurrentDept = aDepts[j];
                    return;
                }
            }
            that.oCurrentDept = null;
        },
        setTitleDeptsById : function(sId) {//根据id获取祖先部门数组
            var that = this;
            var aDepts = that.aDepts;
            var aParentsDept = [];

            var getParentById = function(sId) {
                for (var i = 0; i < aDepts.length; i++) {
                    if (aDepts[i].objectId === sId) {
                        aParentsDept.unshift(aDepts[i]);
                        if (aDepts[i].parentId) {
                            getParentById(aDepts[i].parentId);
                        } else {
                            that.aTitleDepts = aParentsDept;
                        }
                    }
                }
            };
            getParentById(sId);
            //alert(JSON.stringify( that.aTitleDepts));
        },
        getChildrenDepts : function(sFatherId, aDepts) {
            return aDepts.filter(function(item, index) {
                return item.parentId === sFatherId;
            });
        },
        e_selectDept : function(e) {//选择当前的部门
            var that = this;
            if (!$(e.target).hasClass('toNext')) {
                return;
            }
            var sId = e.target.dataset.id;
            that.oCurrentDept = utils.getObjByIdFromArr(sId, that.aChildren);
            that.setTitleDeptsById(sId);
            that.aChildren = that.getChildrenDepts(that.oCurrentDept.objectId, that.aDepts);
            if (that.aChildren.length == 0 && that.pageResource == "choose") {
                that.aChildren = that.getChildrenDepts(that.oCurrentDept.parentId, that.aDepts);
                //选择时候，此时传入的还是parentId
                baseOperation.alertToast("该部门下面没有子部门");
                return;
            }
            that.renderTitleDepts(that.aTitleDepts);
            that.renderDeptsList(that.aChildren);
            //alert(that.oCurrentDept.objectId)
        },
        e_showBubble : function(e) {
            if (!(this.pageResource == "choose")) {
                var obj = e.currentTarget;
                var main = $('#content');
                $("#bubble").remove();
                var left = $(obj).position().left;
                var top = $(obj).position().top;
                var fatherLeft = main.left;
                var fatherTop = main[0].offsetTop;
                //alert(left + '\n' +top+ '\n' +fatherLeft+ '\n' +fatherTop)
                var width = $(obj).width() / 2;
                var bubbleListId = obj.dataset.id;

                var htmlTemp = "<div id='bubble' class='bubble' style='left:" + width + "px;'>" + "<span class='rename' data-id='" + bubbleListId + "' >重命名</span>|" + "<span class='delete' data-id='" + bubbleListId + "' >删除</span></div>";
                $(obj).append(htmlTemp);
                var x = width - $("#bubble").width() / 2 + left;
                var y = 0;
                //- $("#bubble").height() - 2;
                $("#bubble").css("left", x + "px");
                $("#bubble").css("top", y + "px");
            }
        },
        e_selectDeptFromTitle : function(e) {
            var that = this;
            var sId = e.target.dataset.id;
            that.oCurrentDept = utils.getObjByIdFromArr(sId, that.aTitleDepts);
            that.setTitleDeptsById(sId);
            that.renderTitleDepts(that.aTitleDepts);
            that.aChildren = that.getChildrenDepts(that.oCurrentDept.objectId, that.aDepts);
            that.renderDeptsList(that.aChildren);
        },
        e_renameDept : function(e) {
            var that = this;
            var obj = e.currentTarget;
            var updateId = obj.dataset.id;

            //取到当前点击li的标题名称
            var orgName = $(obj).parents('.item').find(".name").text();
            
            //清除长按弹出气泡
            $("#bubble").remove();
            appcan.window.prompt("重命名", "请您输入新的部门名称", orgName, ['确定', '取消'], function(err, data, dataType, optId) {
                if (!err) {
                    // var type = data.num;
                    var index = data.index;
                    switch (index) {
                    case 1:
                        break;
                    case 0:
                        // orgName = data.value.trim();
                        orgName = data.data.trim();
                        //修改之后的名称
                        if (orgName.length > 0) {
                            if (orgName.length > 20) {
                                baseOperation.alertToast("部门名称不能超过20个字!");
                            } else {
                                that.requestRenameDept(updateId, orgName, that.oCurrentDept.objectId);
                            }
                        } else {
                            baseOperation.alertToast("请输入新的部门名称");
                        }
                        break;
                    }
                }
            });
        },
        e_deleteDept : function(e) {
            var that = this;
            var obj = e.currentTarget;
            var updateId = obj.dataset.id;
            //清除长按弹出气泡
            $("#bubble").remove();
            //待完成功能弹出框提示
            appcan.window.confirm({
                title : '提示',
                content : '您好，是否确认删除此部门？',
                buttons : ['确定', '取消'],
                callback : function(err, data, dataType, optId) {
                    if (err) {
                        //如果出错了
                        return;
                    } else {
                        if (data == 1) {
                            return false;
                        } else {
                            that.requestDeleteDept(updateId);
                        }
                    }
                }
            });
        },
        e_addDept : function() {
            var that = this;
            appcan.window.prompt("新增部门", "上级部门:" + that.oCurrentDept.orgName + "", "", ['确定', '取消'], function(err, data, dataType, optId) {
                if (err == null) {
                    // var type = data.num;
                    // var orgName = data.value.trim();
                    var index = data.index;
                    var orgName = data.data.trim();
                    switch (index) {
                    case 1:
                        break;
                    case 0:
                        if (orgName && orgName != "请输入部门名称(必填)") {
                            if (orgName.length > 20) {
                                baseOperation.alertToast("部门名称不能超过20个字!");
                            } else {
                                that.requestAddOrganization(orgName, that.oCurrentDept.objectId);
                            }
                        } else {
                            baseOperation.alertToast("请输入部门名称！");
                        }
                        break;
                    }
                }
            });
        },
        e_removeBubble : function(e) {
            //alert(123)
            if ($('#bubble').length > 0) {
                if ($(e.target).hasClass('rename') || $(e.target).hasClass('delete')) {
                    return;
                }
                $('#bubble').remove();
            }

        },
        requestDeleteDept : function(updateId) {
            var that = this;
            var parmes = {
                "objectId" : updateId
            };
            var partURL = "cloudlink-core-framework/organization/deleteMultiple";
            that.jasHttpRequest.jasHttpPost(partURL, function(id, state, data) {
                if (data == "") {
                    baseOperation.alertToast("网络异常，请稍候尝试");
                    return;
                }
                var obj = JSON.parse(data);
                if (obj.success == 1) {
                    that.requestAllDepts();
                    baseOperation.alertToast("删除成功");
                } else if (obj.code == "501") {
                    baseOperation.alertToast("您所删除的组织机构已经不存在。");
                } else if (obj.code == "502") {
                    baseOperation.alertToast("您所删除的组织机构存在人员，无法删除。");
                } else if (obj.code == "400") {
                    baseOperation.alertToast("网络异常，请稍候尝试");
                }
            }, JSON.stringify(parmes));
        },
        requestRenameDept : function(updateId, orgName, fatherId) {
            var that = this;
            var parameters = {
                "objectId" : updateId,
                "orgName" : orgName,
                "parentId" : fatherId
            };
            var partURL = "cloudlink-core-framework/organization/update";
            that.jasHttpRequest.jasHttpPost(partURL, function(id, state, data) {
                var obj = JSON.parse(data);
                if (obj.success == 1) {
                    that.requestAllDepts();
                    baseOperation.alertToast("修改完成");
                } else if (obj.code == "400" && obj.msg == "已存在同名组织机构") {
                    baseOperation.alertToast("已存在同名组织机构");
                } else {
                    baseOperation.alertToast("修改失败");
                }
            }, JSON.stringify(parameters));
        },
        requestAddOrganization : function(orgName, parentId) {
            var that = this;
            var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
            var parmes = {
                'orgName' : orgName,
                'enterpriseId' : userBo.enterpriseId,
                'parentId' : parentId,
                'manager' : ''
            };
            var partURL = "cloudlink-core-framework/organization/add";
            that.jasHttpRequest.jasHttpPost(partURL, function(id, state, data) {
                var obj = JSON.parse(data);
                if (obj.success == 1) {
                    that.requestAllDepts();
                    baseOperation.alertToast("创建完成");
                } else if (obj.code == "400" && obj.msg == "已存在同名组织机构") {
                    baseOperation.alertToast("已存在同名组织机构");
                } else {
                    baseOperation.alertToast("新增失败");
                }
            }, JSON.stringify(parmes));
        },
        initAppcanParams : function() {
            this.jasHttpRequest = new JasHttpRequest();
            this.pageResource = appcan.locStorage.val("orageResource");
            appcan.locStorage.remove("orageResource");
        },
        initElem : function() {
            var eles = this.elem;
            for (var name in eles) {
                if (eles.hasOwnProperty(name)) {
                    this[name] = $(eles[name]);
                }
            }
        },
        initializeOrdinaryEvent : function(maps) {
            this._scanEventsMap(maps, true);
        },
        hiddenFooter : function() {
            if (this.pageResource == "choose") {
                $("#btn1").text('确定');
            }
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
        e_chooseDept : function() {
            var deptId = $("input[type='radio']:checked").attr("id");
            if (!deptId) {
                baseOperation.alertToast("请选择部门");
                return;
            }
            var orgname = $("input[type='radio']:checked").attr("orgname");
            appcan.locStorage.val("orgdept", deptId);
            appcan.locStorage.val("orgname", orgname);
            if (appcan.locStorage.val("chooseresource") == 'setfunction') {
                appcan.window.evaluateScript('setfunction', 'setObj.changedept()');
            } else {
                appcan.window.evaluatePopoverScript('share_content1', 'content', 'setdept()');
            }
            appcan.locStorage.remove("chooseresource");
            appcan.window.close(-1);

        },
        e_inviteSetDept : function(e) {
            var that = this;
            var orgId = e.target.dataset.id;
            var orgName = e.target.dataset.name;
            appcan.locStorage.val("orgdept", orgId);
            appcan.locStorage.val("orgname", orgName);
            if (that.pageResource == "choose") {
                if (appcan.locStorage.val("chooseresource") == 'setfunction') {
                    appcan.window.evaluateScript('setfunction', 'setObj.changedept()');
                } else {
                    appcan.window.evaluatePopoverScript('share_content1', 'content', 'setdept()');
                }
                appcan.locStorage.remove("chooseresource");
                appcan.window.close(-1);
            }
        }, //邀请的时候，点击进行部门的选择
        checkout : function() {//监听物理返回键
            var that = this;
            uexWindow.setReportKey(0, 1);
            uexWindow.onKeyPressed = function(keyCode) {
                that.back();
            };
        },
        back : function() {
            var that = this;
            var sId = $(".title .active").last().attr("titleid");
            if (sId) {
                that.oCurrentDept = utils.getObjByIdFromArr(sId, that.aTitleDepts);
                that.setTitleDeptsById(sId);
                that.renderTitleDepts(that.aTitleDepts);
                that.aChildren = that.getChildrenDepts(that.oCurrentDept.objectId, that.aDepts);
                that.renderDeptsList(that.aChildren);
            } else {
                appcan.window.close(-1);
            }

        }
    };

    window.orgObj = obj;

})(window, appcan, Zepto, JasHttpRequest, baseOperation);

