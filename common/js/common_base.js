var baseOperation = {
    /*
     * 消息提示框(div悬浮提示)
     */
    alertToast:function(msg,timeout){
        var  to= timeout;
        if(arguments.length == 2){
            to = arguments[1];
        }
        if(to == "" || to == null || to==undefined){
            to = 2000;
        }
        uexWindow.toast("0","5",msg,to);
    },
    londingToast:function(msg,timeout){
        var  to= timeout;
        if(arguments.length == 2){
            to = arguments[1];
        }
        if(to == "" || to == null || to==undefined){
            to = 2000;
        }
        uexWindow.toast("1","5",msg,to);
    },
    /*
     * 关闭消息提示框
     */
    closeToast:function(){ 
        uexWindow.closeToast();
    },
    /*
     * 获取随机数的方法
     */
    getRandNum:function(){
        return Math.floor(Math.random() * ( 100000 + 1));
    },
    /*
     * 生产UUID的方法
     */
    createuuid:function() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
        var uuid = s.join("");
        return uuid;
    },
    /*
    * 添加过滤emoji监听的方法 
    * 可选参数：jqueryDom名称，默认为'input[type="text"],textarea'
    * 原dom已有的oninput事件会冲突
    */
    addEmojiFliterEvent:function (sDomName,callback){
        var filterEmoji = function(s){ //过滤emoji
            var ranges = [
                '\ud83c[\udf00-\udfff]', 
                '\ud83d[\udc00-\ude4f]', 
                '\ud83d[\ude80-\udeff]'
            ];
            return s.replace(new RegExp(ranges.join('|'), 'g'),'');
        };    

        sDomName = sDomName?sDomName:'input[type="text"],textarea';

        $(sDomName).each(function(){
            this.oninput = function(){
                $(this).val(filterEmoji($(this).val()));
                if (appcan.isFunction(callback)) {
                    callback(this);
                }
            };
        });
        
    }    
};

/*
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
 * 例子： 
 * (new Date()).Format("yyyy-MM-dd HH:mm:ss.S") ==> 2006-07-02 08:09:04.423 
 * (new Date()).Format("yyyy-M-d H:m:s.S")      ==> 2006-7-2 8:9:4.18
 * (new Date()).Format("yyyyMMddHHmmssS")      ==> 20060702080904423 
 */
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "H+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
/*
 *获取元素的当前样式
 * 原理：为元素dom节点添加currentStyle属性，返回当前样式属性集合
 * 例：document.body.currentStyle['width']
 */
/*HTMLElement.prototype.__defineGetter__("currentStyle", function () {
    return this.ownerDocument.defaultView.getComputedStyle(this, null);
});*/
function currentFontSize(el){
    var res = appcan.locStorage.getVal('currentFontSize');
    if (res){
        return res;
    }
    //res = document.body.currentStyle.fontSize.slice(0,-2);
    res = getElementStyle(el,'fontSize').slice(0,-2);
    appcan.locStorage.setVal('currentFontSize',res);
    return res;
}        

function getElementStyle(el,attr){
    //获取el当前的attr样式，解决ie问题
    return el.currentStyle?el.currentStyle[attr]:getComputedStyle(el,null)[attr];
}