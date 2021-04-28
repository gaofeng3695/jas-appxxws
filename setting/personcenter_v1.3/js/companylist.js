        appcan.ready(function() {
            companyObj.init();
        });
        var companyObj = {
            status: '',
            jasHttpRequest: new JasHttpRequest(),
            userBo: JSON.parse(appcan.locStorage.getVal("userBo")),
            init: function() {
                this.requestData();
                this.bindEvent();
            },
            bindEvent: function() {
                var that = this;
                appcan.button("#nav-left", "btn-act", function() {
                    appcan.window.close(-1);
                });
                $("#submit").click(function() {
                    if (that.status == 2 || that.status == 1) {
                        appcan.openWinWithUrl("viewapplayapprove", "viewapplayapprove.html");
                    }
                    if (that.status == -1) {
                        appcan.locStorage.val("againapplay","again");//进行存储，判断是进行申请还是再次申请
                        appcan.openWinWithUrl("applayapprove", "applayapprove.html");
                    }
                });
                appcan.window.on('resume', function() {
                    that.requestData();
                });
            },
            requestData: function() {
                var that = this;
                var enterpriseName = appcan.locStorage.getVal("enterpriseName");
                if (enterpriseName == null || enterpriseName == "") {
                    $(".name").text(that.userBo.enterpriseName);
                } else {
                    $(".name").text(enterpriseName);
                }
                var partURL = "cloudlink-core-framework/enterprise/getById?objectId=" + that.userBo.enterpriseId;
                that.jasHttpRequest.jasHttpGet(partURL, function(id, state, dbSource) {
                    var obj = JSON.parse(dbSource);
                    that.status = obj.rows[0].authenticateStatus;
                    that.render(obj.rows[0].authenticateStatus)
                });
            },
            render: function(status) {
                var that = this;
                if (status == 0) {
                    $("#status").text("未认证");
                }
                if (status == 2) {
                    $("#status").text("等待认证");
                    $(".applaynopass").css("display", "none");
                }
                if (status == -1) {
                    $("#status").text("认证驳回");
                    that.getauthenidea();
                    //获取驳回意见
                }
                if (status == 1) {
                    $("#status").text("已认证");
                    $(".applaynopass").css("display", "none");
                }
            },
            getauthenidea: function() {
                var that = this;
                $(".applaynopass").css("display", "block");
                var url = "cloudlink-core-framework/enterprise/getAuthApproveContent?enterpriseId=" + that.userBo.enterpriseId;
                that.jasHttpRequest.jasHttpGet(url, function(id, state, data) {
                    if (data == "") {
                        baseOperation.alertToast("网络异常，请稍候...");
                        return;
                    }
                    var obj = JSON.parse(data);
                    if (obj.success == 1) {
                        if (obj.rows[0].approveContent == null) {
                            $(".authen_idea").text("无驳回意见");
                        } else {
                            $(".authen_idea").text(obj.rows[0].approveContent);
                        }
                    } else {
                        $(".authen_idea").text("无驳回意见");
                    }
                });
            },
            close:function(){
                 appcan.window.close(-1);
            }
        }