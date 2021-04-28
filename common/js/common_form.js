/*
 * 初始化创建数据库对象的方法(获取数据库操作的对象)
 */
var formOperation ={
    //邮箱地址
    emailReg:"^[a-zA-Z0-9_\.\-]+\@([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9]{2,4}$",
    //固定电话号码
    telephoneReg:"^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$",
    //手机号码
    callReg:"(^0?[1][358][0-9]{9}$)",
    //日期
    dateReg:"^(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)$",
    //ip
    ipReg:"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
    //中文
    cnReg : "^([\u0391-\uFFE5])+$",
    //网址
    httpReg :"^[a-zA-z]:\\/\\/[^s]$",
    //数字
    numReg : "^[-]?[0-9]+$",
    //字母
    enReg : "^[a-zA-Z]+$",
    //数字加字母
    numenReg : "^[0-9a-zA-Z]+$",
    //非法字符
    encodeChar : "^[0-9a-zA-Z0-9\u4e00-\u9fa5]+$",
    /*
     *将表单转换成JSON对象
     * formID 例如：#eventfrom
     * inJson 
     */
    getFormJson:function(formId,inJson){
        var x = $(formId).serializeArray();
        var outJson = new Object();
        if(arguments.length==2&&inJson!=null){
            outJson = inJson;
        }
        $.each(x, function(i, field) {
            if (field.name) {
                outJson[field.name] =  field.value ;
                if(field.value=="请选择") {
                    outJson[field.name] = "";
                }
            }
        });
        return outJson;
    },
    /*
     *将表单转换成JSON字符串
     * formID 例如：#eventfrom
     * inJson 
     */
    getFormJsonString:function (formId,inJson){
        var x = $(formId).serializeArray();
        var outJson = new Object();
        if(arguments.length==2&&inJson!=null){
            outJson = inJson;
        }
        $.each(x, function(i, field) {
            if (field.name) {
                outJson[field.name] =  field.value;
                if(field.value=="请选择") {
                    outJson[field.name] = "";
                }
            }
        });
        return JSON.stringify(outJson);
    },
    /*
     * 清空表单数据
     */
    clearForm:function(formId) {
        var f = true;
        $(formId + " input").each(function() {
            $(this).val("");
        });
        $(formId + " textarea").each(function() {
            $(this).val("");
        });
        $(formId + " select").each(function() {
            $(this).val("请选择");
            $(".text").html("请选择");
        });
        $("#imgList").html("");
    },
    /*
     * 初始化加载form数据
     */
    loadForm:function(formId,inJson) {
        $(formId+" input").each(function(){
            var proName =$(this).attr("name");
            //uexLog.sendLog(proName+":"+inJson[proName]);
            $(this).val(inJson[proName]);
        });
        $(formId+" select").each(function() {
            var proName =$(this).attr("name");
            var jsonvalue= inJson[proName];
            if(jsonvalue!=null && jsonvalue!="" && jsonvalue!="undefined"){
                $(this).val(jsonvalue);
                // uexLog.sendLog(proName+":"+inJson[proName]);
                // alert(11);
                // appcan.selectChange($(this));
                // this.setSelectText(this);
                // var obj=this;
                try{
                    var parentEle=this.parentElement;
                    var textEle=parentEle.getElementsByTagName("div")[0];
                    var thisText=this.options[this.selectedIndex].text;
                    $(textEle).html(thisText);
                }catch(e){
                    alert(e);
                }
            }
        });
        $(formId+" textarea").each(function() {
            var proName =$(this).attr("name");
            $(this).val(inJson[proName]);
        });
    },
    /*
     * 表单验证的方法
     */
    validateForm:function(){
        
    },
    setSelectText:function(obj){
        try{
            var parentEle=obj.parentElement;
            var textEle=parentEle.getElementsByTagName("div")[0];
            var thisText=obj.options[obj.selectedIndex].text;
            $(textEle).html(thisText);
        }catch(e){
            alert(e);
        }
    }
}
