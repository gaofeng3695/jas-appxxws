var shareEventObj = {
    mask : $('#mask'),
    items : $('.item'),
    cancel : $('.cancelBtn'),
    router : ['wx','wx_pyq','qq','qzone'],
    shareParamsObj:null,
    init : function(){
        this.bindEvent();
    },
    bindEvent : function(){
        var that = this;
        that.items.click(function(){
            var index =  that.items.index(this);
            //that[that.router[index]]();
            that.getShareEventObj(that.router[index]);
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
    wx : function(desc,url){
        weiXin.shareLink({
            "thumbImg": 'res://icon_new.png',
            "title" : '巡线卫士-事件分享',
            "description" : desc,
            "wedpageUrl": url,
            "scene":0
        });
    },
    wx_pyq : function(desc,url){
        weiXin.shareLink({
            "thumbImg": 'res://icon_new.png',
            "title" : '巡线卫士-事件分享',
            "description" : desc,
            "wedpageUrl": url,
            "scene":1
        });
    },
    qq : function(desc,url){
        qqObj.shareLink({
            "title":"巡线卫士-事件分享",
            "summary":desc,
            "targetUrl":url,
            "imageUrl":"res://icon_new.png",
            "appName":"巡线卫士",
            "cflag":"2"
         });
    },
    qzone : function(desc,url){
        qqObj.shareLink({
            "title":"巡线卫士-事件分享",
            "summary":desc,
            "targetUrl":url,
            "imageUrl":"res://icon_new.png",
            "appName":"巡线卫士",
            "cflag":"1"
        });
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
    },
    getShareEventObj:function(_type){
        var that = this;
        var partURL = 'cloudlink-inspection-event/eventInfo/get?eventId='+appcan.locStorage.getVal("event_Id");
        jasHttpRequest.jasHttpGet(partURL,function(id, state, dbSource){
            if(state != 1){
                that.mask.hide();
                baseOperation.alertToast("网络异常，请稍候再试...");
                return ;
            }
            var _dbObj = JSON.parse(dbSource);
            if(_dbObj.success ==1 && _dbObj.rows.length > 0){
                var _eventObj = _dbObj.rows[0];
                var _desc = _eventObj.fullTypeName+" "+_eventObj.occurrenceTime+"\r\n"+_eventObj.address;
                var _url = that.getShareUrl();
                that[_type](_desc,_url);
            }
            else{
                that.mask.hide();
                baseOperation.alertToast("网络异常，请稍候再试...");
                return ;
            }
        });
    },
    getShareUrl:function(){
        var shareUrl = "https://xxgl.zyax.cn";
        protocolConfig = appcan.locStorage.getVal('serverProtocol');
        ipConfig = appcan.locStorage.getVal('serverIP');
        portConfig = (appcan.locStorage.getVal('serverPort')==null?"":appcan.locStorage.getVal('serverPort'));
        
        if(protocolConfig=="https://"){
            shareUrl = "https://xxgl.zyax.cn/share/eventshare.html?a="+appcan.locStorage.getVal('token')+"&b="+appcan.locStorage.getVal("event_Id");
        }
        else{
            if(portConfig=="8050"){
                shareUrl = "http://"+ipConfig+":800"+"/share/eventshare.html?a="+appcan.locStorage.getVal('token')+"&b="+appcan.locStorage.getVal("event_Id");
            }
            if(portConfig=="8051"){
                shareUrl = "http://"+ipConfig+":801"+"/share/eventshare.html?a="+appcan.locStorage.getVal('token')+"&b="+appcan.locStorage.getVal("event_Id");
            }
            if(portConfig=="8052"){
                shareUrl = "http://"+ipConfig+":802"+"/share/eventshare.html?a="+appcan.locStorage.getVal('token')+"&b="+appcan.locStorage.getVal("event_Id");
            }
        }
        return shareUrl;
    }
};
shareEventObj.init();