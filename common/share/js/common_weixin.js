var weiXin = {
    appId: 'wxfaf7fe257e656c41',
    shareText: function(obj) {
        /*var obj = {
            "text": sText,
            "scene": 0 // 0 好友 1 朋友圈
        };*/
        var that = this;
        var doIt = function() {
            if (!that.isCbSetedForText) {
                uexWeiXin.cbShareTextContent = function(data) {
                    // if (data === 1) {
                    //     alert("分享成功");
                    // }
                };
                that.isCbSetedForText = true;
            }
            uexWeiXin.shareTextContent(JSON.stringify(obj));
        };
        that.doTheShare(doIt);
    },
    shareImg: function(obj) {
        /*var obj ={
            "thumbImg": sImg01, // res://appcan.png
            "image": sImg02, // res://appcan.png
            "scene": 0 // 0 好友 1 朋友圈
        };*/
        var that = this;
        var doIt = function() {
            if (!that.isCbSetedForImg) {
                uexWeiXin.cbShareImageContent = function(data) {
                    // if (data === 1) {
                    //     alert("分享成功");
                    // }
                };
                that.isCbSetedForImg = true;
            }
            uexWeiXin.shareImageContent(JSON.stringify(obj));
        };
        that.doTheShare(doIt);
    },
    shareLink: function(obj) {
        /*var obj = {
            "thumbImg": sImg01, // res://icon.png
            "title" : sTitle,
            "description" : sDesc,
            "wedpageUrl": sUrl, // http://www.appcan.cn
            "scene":nType
        };*/
        var that = this;
        var doIt = function() {
            if (!that.isCbSetedForLink) {
                uexWeiXin.cbShareLinkContent = function(data) {
                    // if (data === 1) {
                    //     alert("分享成功");
                    // }
                };
                that.isCbSetedForLink = true;
            }
            uexWeiXin.shareLinkContent(JSON.stringify(obj));
        };
        that.doTheShare(doIt);
    },
    doTheShare : function(doIt){
        var that = this;
        if (!that.isInited) {
            that.registerApp(function() {
                that.ifWXinstalled(doIt);
            });
            return;
        }
        if (that.tip) {
            alert(that.tip );
            return;
        }
        doIt();
    },
    ifWXinstalled: function(fn) {
        var that = this;
        uexWeiXin.cbIsWXAppInstalled = function(opCode, dataType, data) {
            that.isInited = true;
            if (data === 1) {
                that.tip = '请先安装微信再分享哦';
                alert(that.tip);
                return;
            }
            if (fn && typeof fn === 'function') {
                fn();
            }
        };
        uexWeiXin.isWXAppInstalled();
    },
    registerApp: function(fn) {
        var that = this;
        // 注册app的回调
        uexWeiXin.cbRegisterApp = function(opCode, dataType, data) {
            if (data === 1) { // 0 成功 1 失败
                that.tip = '很抱歉未能连接到微信';
                alert(that.tip);
                return;
            }
            if (fn && typeof fn === 'function') {
                fn();
            }
        };
        uexWeiXin.registerApp(that.appId);
    }
};