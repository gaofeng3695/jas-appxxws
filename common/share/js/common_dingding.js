/**
 * 钉钉分享，需求钉钉分享自定义插件
 * 
 **/


var ddObj = {
    init: function(fn) {
        var that = this;
        if (!that.isInitCbSeted) {
            //设置钉钉的回调
            uexDingDing.cbInit = function(opId, dataType, data) {
                if (data == "-1") {
                    that.tip = '该版本的钉钉不支持分享功能，是否更新？';
                    that.alertTips();
                } else if (data == "-2") {
                    that.tip = '设备没有安装钉钉，是否安装？';
                    that.alertTips();
                }else{
                    fn();
                }
            };            
            that.isInitCbSeted = true;
        }
        uexDingDing.init(); //检测钉钉是否已安装、或者支持分享
    },
    doTheShare : function(doIt){
        var that = this;
        //if (!that.isInited) {
            that.init(doIt);
            that.isInited = true;
            return;
        //}
        /*if (that.tip) {
            that.alertTips();
            return;
        }
        doIt();*/
    },   
    alertTips : function(){
        var that = this;
        appcan.window.confirm({
            title : '提示',
            content : that.tip,
            buttons : ['确定', '取消'],
            callback : function(err, data, dataType, optId) {
                if (err || data == 1) {//取消
                } else if (data == 0) {
                    //uexWidget.startApp("1", "android.intent.action.VIEW", '{"data":{"mimeType":"text/html","scheme":"http://www.dingtalk.com/index-b.html"}}');
                    uexDingDing.openUrlByDefaultBrowser("http://www.dingtalk.com/index-b.html");
                }
            }
        });
    },
    shareLink: function(obj) {
        /*var obj = {
            "thumbImg" : 'res://icon.png', // res://icon.png
            "title" : '巡线卫士-应用宝下载',
            "description" : '欢迎您使用【巡线卫士】\r\n巡线卫士，助力企业迈入“互联网+管线”时代。',
            "wedpageUrl" : 'http://a.app.qq.com/o/simple.jsp?pkgname=cn.jasgroup.mapserver',
        };*/
        var that = this;
        var doIt = function(){
            uexDingDing.shareLinkContent(obj); 
        };
        that.doTheShare(doIt);
    },
    shareImg: function(sImg) {
        var that = this;
        var doIt = function(){
            uexDingDing.shareImageContent(sImg);  
        };
        that.doTheShare(doIt);        
    }
};
