var shareObj = {
    mask : $('#mask'),
    items : $('.item'),
    cancel : $('.cancelBtn'),
    router : ['wx','wx_pyq','qq','qzone','dingding'],
    init : function(){
        this.bindEvent();
    },
    bindEvent : function(){
        var that = this;
        that.items.click(function(){
            var index =  that.items.index(this);
            that[that.router[index]](that.flag);
        });
        that.cancel.click(function(){
            that.mask.hide();
        });
        that.mask.click(function(e){
            if(e.target === this){
                that.mask.hide();
                return;
            }
        });
    },
    show : function(){
        this.mask.show();
    },
    wx : function(flag){
        if (flag === '公众号') {
            weiXin.shareImg({
                "thumbImg": 'res://weixinshare.png',
                "image": 'res://weixinshare.png',
                "scene": 0
            });
        }else if( flag === '下载' ){
            weiXin.shareLink({
                "thumbImg": 'res://icon_new.png',
                "title" : '巡线卫士-应用宝下载',
                "description" : '欢迎您使用【巡线卫士】\r\n巡线卫士，助力企业迈入“互联网+管线”时代。',
                "wedpageUrl": 'http://a.app.qq.com/o/simple.jsp?pkgname=cn.jasgroup.mapserver',
                "scene":0
            });
        }
    },
    wx_pyq : function(flag){
        if (flag === '公众号') {
            weiXin.shareImg({
                "thumbImg": 'res://weixinshare.png',
                "image": 'res://weixinshare.png',
                "scene": 1
            });
        }else if( flag === '下载' ){
            weiXin.shareLink({
                "thumbImg": 'res://icon_new.png',
                "title" : '巡线卫士-应用宝下载',
                "description" : '欢迎您使用【巡线卫士】\r\n巡线卫士，助力企业迈入“互联网+管线”时代。',
                "wedpageUrl": 'http://a.app.qq.com/o/simple.jsp?pkgname=cn.jasgroup.mapserver',
                "scene":1
            });
        }
    },
    qq : function(flag){
        if (flag === '公众号') {
            qqObj.shareImg({
                "imageLocalUrl":"res://weixinshare2.png",
                "appName":"巡线卫士",
                "cflag":"2"
            });
        }else if( flag === '下载' ){
            qqObj.shareApp({
                "title":"巡线卫士-应用宝下载",
                "summary":"欢迎您使用【巡线卫士】\r\n巡线卫士，助力企业迈入“互联网+管线”时代。",
                "imageUrl":"res://icon_new.png",
                "appName":"巡线卫士",
                "cflag":"2"
            });
        }
    },
    qzone : function(flag){
        if (flag === '公众号') {
            qqObj.shareImg({
                "imageLocalUrl":"res://weixinshare2.png",
                "appName":"巡线卫士",
                "cflag":"1"
            });
        }else if( flag === '下载' ){
            qqObj.shareApp({
                "title":"巡线卫士-应用宝下载",
                "summary":"欢迎您使用【巡线卫士】\r\n巡线卫士，助力企业迈入“互联网+管线”时代。",
                "imageUrl":"res://icon_new.png",
                "appName":"巡线卫士",
                "cflag":"1"
            });
        }
    },
    dingding : function(flag){
        if (flag === '公众号') {
            ddObj.shareImg("res://weixinshare2.png");
        }else if( flag === '下载' ){
            ddObj.shareLink({
                "thumbImg" : 'res://icon_new.png', // res://icon.png
                "title" : '巡线卫士-应用宝下载',
                "description" : '欢迎您使用【巡线卫士】\r\n巡线卫士，助力企业迈入“互联网+管线”时代。',
                "wedpageUrl" : 'http://a.app.qq.com/o/simple.jsp?pkgname=cn.jasgroup.mapserver',
            });
        }
    }
};
shareObj.init();