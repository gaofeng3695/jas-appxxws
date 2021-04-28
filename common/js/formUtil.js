//获取表单json对象
function getFormJson(formId,inJson){
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
}

//获取表单json串
function getFormJsonString(formId,inJson){
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
    return JSON.stringify(outJson);
}

//清空表单数据
function clearForm(formId) {
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
}

//修改页面初始化表单数据
function loadForm(formId,inJson) {
    $(formId+" input").each(function(){
        var proName =$(this).attr("name");
        $(this).val(inJson[proName]);
    });
    $(formId+" select").each(function() {
        var proName =$(this).attr("name");
        var jsonvalue= inJson[proName];
        if(jsonvalue!=null && jsonvalue!="" && jsonvalue!="undefined"){
            $(this).val(jsonvalue);
            appcan.selectChange($(this));
        }
    });
    
    $(formId+" textarea").each(function() {
        var proName =$(this).attr("name");
         $(this).val(inJson[proName]);
    });
} 


/********************************************表单验证**************************************************/

//邮箱地址
var emailReg = "^[a-zA-Z0-9_\.\-]+\@([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9]{2,4}$";
//固定电话号码
var telephoneReg = "^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$";
//手机号码
var callReg = "(^0?[1][358][0-9]{9}$)";
//日期
var dateReg = "^(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)$";
//ip
var ipReg = "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$";
//中文
var cnReg = "^([\u0391-\uFFE5])+$";
//网址
var httpReg = "^[a-zA-z]:\\/\\/[^s]$";
//数字
var numReg = "^[-]?[0-9]+$";
//字母
var enReg = "^[a-zA-Z]+$";
//数字加字母
var numenReg = "^[0-9a-zA-Z]+$";
//非法字符
var encodeChar = "^[0-9a-zA-Z0-9\u4e00-\u9fa5]+$";

//校验表单数据
var enableCheckInput = true;
function checkFormData(formId) {
    if(enableCheckInput == false)
        return "";
    var msg = "";
    $(formId+" input").each(function(){
        if($(this).parent().css("display") != "none"){
            if($(this).attr("required") == "required" && $(this).css("display") != "none" && $(this).parent().css("display") != "none"){
                if($(this).val() == ""){
                    msg += "请输入" + $(this).attr("tit") + "\n";
                }
            }
            if($(this).attr("custom") != null){
                var s = eval($(this).attr("custom"));
                if(s.length > 0){
                    msg += s;
                }
                if( s.length > 0 && s.indexOf("\n") == -1){
                    msg += "\n";
                }
            }
        }
    });
    $(formId+" select").each(function() {
        if ($(this).attr("required") && $(this).val() == "请选择") {
            msg += $(this).attr("placeholder") + "\n";
        }
        if ($(this).attr("required") && $(this).val() == "") {
            msg += $(this).attr("placeholder") + "\n";
        }
    });
    
    $(formId+" textarea").each(function() {
        if($(this).parent().css("display") != "none"){
            if($(this).attr("required") == "required" && $(this).css("display") != "none" && $(this).parent().css("display") != "none"){
                if($(this).val() == ""){
                    msg += "请输入" + $(this).attr("tit") + "\n";
                }
            }
            if($(this).attr("custom") != null){
                var s = eval($(this).attr("custom"));
                if(s.length > 0){
                    msg += s;
                }
                if( s.length > 0 && s.indexOf("\n") == -1){
                    msg += "\n";
                }
            }
        }
    });
    return msg;
}


function isChinese(obj){
    var value = $(obj).val();
     if(value == "")
        return false;
    var re = new RegExp(cnReg);
    if(!value.match(re)) {
        return $(obj).attr("tit")+"中文信息不规范";
    }
}

function isDigit(obj){
    var value = $(obj).val();
    if(value == "")
        return false;
    var re = new RegExp(numReg); 
    if(!value.match(re)) {
        return $(obj).attr("tit")+"数字信息不规范";
    }
}

function isEmail(obj){
   var value = $(obj).val();
    if(value == "")
        return false;
    var re = new RegExp(emailReg); 
    if(!value.match(re)) {
        return "邮箱地址不规范";
    } 
}
