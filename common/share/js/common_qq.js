/*
 * 适用于 appcan 3.0
 * 需要在qq开放平台注册 app，获取 appId
*/
var qqObj = {
    appId: '1105846652',
    ifQQinstalled : function(fn){
        var that = this;
        uexQQ.cbIsQQInstalled = function(opId,dataType,data){
            that.isInited = true;
            if (data === 1 ) {
                that.tip = '请先安装QQ再分享哦';
                alert(that.tip);
                return;
            }
            fn();
        }
        uexQQ.isQQInstalled();
    },
    doTheShare : function(doIt){
        var that = this;
        if (!that.isInited) {
            that.ifQQinstalled(doIt);
            return;
        }
        if (that.tip) {
            alert(that.tip );
            return;
        }
        doIt();
    },
    setShareCb: function () {
        var that = this;
        if (that.isShareCbSeted) {
            return;
        }
        uexQQ.cbShareQQ = function (opId, dataType, data) {
            switch (JSON.parse(data).errCode) {
                case 0:
                    //alert('分享成功');
                    break;
                case 1:
                    //alert('分享失败');
                    break;
                default:
                    alert('分享错误');
                    break;
            }
        }
        that.isShareCbSeted = true;
    },
    shareLink: function (obj) {
        // var obj = {
        //     "title":"图文分享标题",
        //     "summary":"图文分享消息摘要",
        //     "targetUrl":"http://appcan.cn",
        //     "imageUrl":"res://aa.jpg",
        //     "appName":"uexQQ",
        //     "cflag":
        var that = this;
        that.doTheShare(function(){
            that.setShareCb();
            uexQQ.shareWebImgTextToQQ(that.appId, JSON.stringify(obj));
        });
},
    shareImg : function(obj){
        // var json = {
        //     "imageLocalUrl":"res://aa.jpg",
        //     "appName":"uexQQ"
        //     "cflag":"2"
        // };
        var that = this;
        that.doTheShare(function(){
            that.setShareCb();
            uexQQ.shareLocalImgToQQ(that.appId, JSON.stringify(obj));
        });
},
    shareAudio : function(obj){
        // var obj = {"title":"音乐分享标题","summary":"音乐分享消息摘要",
        //     "targetUrl":"http://appcan.cn",
        //     "imageUrl":"http://imgcache.qq.com/qzone/space_item/pre/0/66768.gif",
        //     "appName":"uexQQ",
        //     "audio_url":"http://pan.baidu.com/share/link?shareid=1055030794&uk=2337020227",
        //     "cflag":"2"
        // };
        var that = this;
        that.doTheShare(function(){
            that.setShareCb();
            uexQQ.shareAudioToQQ(that.appId, JSON.stringify(obj));
        });
},
    shareApp : function (obj){
        // var obj = {
        //     "title":"未传",
        //     "summary":"应用分享消息摘要",
        //     "imageUrl":"res://icon.png",
        //     "appName":"uexQQ",
        //     "cflag":"2"
        // };
        var that = this;
        that.doTheShare(function(){
            that.setShareCb();
            uexQQ.shareAppToQQ(that.appId, JSON.stringify(obj));
        });
    }
};