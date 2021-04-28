function createTemplateByObj(obj, isLocal) {
    if (!obj) {
        alert('请传入参数');
        return;
    }

    //alert(JSON.stringify(obj,null,4));
    var resultMap = {
        'EHS_001': "成功入户",
        'EHS_002': "拒绝检查",
        'EHS_003': "到访不遇"

    };
    var typeMap = {
        'EHT_001': '居民',
        'EHT_002': '工业',
        'EHT_003': '商业',
        'EHT_004': '福利',
        'EHT_099': '其他'

    };
    var resultName = resultMap[obj.enterhomeSituationTypeCode];
    var typeName = obj.enterhomeUserTypeName;
    //alert(JSON.stringify(obj));
    var color = 'clr_succ';
    if (resultName === '到访不遇') {
        color = 'clr_out';
    }
    if (resultName === '拒绝检查') {
        color = 'clr_fail';
    }
    var isShowMask = (color === 'clr_succ') && !isLocal &&(obj.isdanger!=1);

    var maskClass = isShowMask?'passMask':'';
    return [
        '<li class="sectionMargin sectionShadow '+maskClass+'" data-id="', obj.objectId, '" data-isdanger="', obj.isdanger, '" data-success="', color === 'clr_succ', '">',
        '<div class="ub border">',
        '<div class="ub ub-ac ub-f1 clr999 ulev26 lh24">',
        '<div class="">',
        obj.securityCheckTime,
        /*'</div>',
        '<div class="umar-l2">', 
        11： 23 ,*/
        '</div>',
        '<div class="ub-f1 name clr666 ulim100">',
        obj.createUserName,
        '</div>',
        '</div>',
        '<div class="ub ub-ac">',
        '<div class="', color, ' uc-a0 uinn3 ulev26 clrfff" >',
        resultName,
        '</div>',
        '</div>',
        '</div>',
        '<div class="ub">',
        '<div class="box ub ub-ac check_width js_check ', isLocal ? '' : 'uhide', '">',
        '<div class="checkbox umar-r sc-text-active js_check">',
        '<input type="checkbox" class="uabs ub-con js_check" >',
        '</div>',
        '</div>',
        '<div class="ub-f1">',
        '<div class="address " style="line-height:;">',
        '<span class="ulev30 clr333" >',
        obj.enterhomeAddress,
        '</span>',
        '</div>',
        '<div class="ub lh24 minh24">',
        '<div class="ulev26 clr333">',
        typeName,
        '</div>',
        '<div class="housename ulim100 clr666 ulev26">',
        obj.enterhomeUserName,
        '</div>',
        '<div class="redclr ',
        +obj.isdanger==1? '' : 'uhide',
        ' ulev26 ub-f1 tx-r">存在隐患 </div>',
        '</div>',
        '</div>',
        '</div>',
        '</li>',
    ].join('');
}


function creatNumTip(nNow, nTotal,isPlus,isFooter) {


    if (!document.getElementById('numTip')) {
        //var oFrag = document.createDocumentFragment();
        var btm = isFooter? 0.2 : 3.2;
        var sHtml = [
        '<div id="numTip" class="" style="position:fixed;bottom:'+ btm +'em;right:1.1em;height:2.8em;width:2.8em;border-radius:50%;background:rgba(11,11,11,0.4);color:white;text-align:center;line-height:1em;z-index:99999;">',
        '<div style="line-height:1.4em;height:1.4em;box-sizing:border-box;border-bottom:1px solid white;margin:0 .4em;"><span id="nNow" class="ulev26">',nNow,'</span></div>', 
        '<div style="height:1.4em;"><span id="nTotal" class="ulev26">',nTotal,'</span></div>',  
            '</div>'
        ].join('');
        //oFrag.innerHTML = sHtml;
        $('body').append(sHtml);    
        //alert(document.getElementById('numTip'));     
    }
    if (+nNow) {
        var now = isPlus?+$('#nNow').html()+nNow : nNow;
        $('#nNow').html(now);
    }
    if (+nTotal) {
        $('#numTip').removeClass('uhide');
        $('#nTotal').html(nTotal);
    }else{
        $('#numTip').addClass('uhide');
    }
}

var aData = [{
    objectId: 'asdfqwer1234',
    securityCheckTime: '2017.12.23 11:12',
    createUserName: '王阳明',
    enterhomeUserTypeName: '居民',

    enterhomeUserName: '王二麻子',
    isdanger: 0,
    enterhomeAddress: '海淀区面筋罗401室',
    enterhomeSituationTypeName: '成功入户',
    enterhomeSituationTypeCode: 'EHS_003',
    enterhomeUserTypeCode: 'EHT_001'

}, {
    objectId: '1231241241234',
    securityCheckTime: '2017.02.23 11:12',
    createUserName: '卢云',
    enterhomeUserTypeName: '居民',
    enterhomeUserName: '张无忌',
    isdanger: 0,
    enterhomeAddress: '山东省高密市绿园小区九单元501室山东省高密市绿园小区九单元501室山东省高密市绿园小区九单元501室',
    enterhomeSituationTypeName: '到访不遇',
    enterhomeSituationTypeCode: 'EHS_001',
    enterhomeUserTypeCode: 'EHT_002'
}, {
    objectId: '1231241241234',
    securityCheckTime: '2017.02.23 11:12',
    createUserName: '卢云',
    enterhomeUserTypeName: '居民',
    enterhomeUserName: '张无忌',
    isdanger: 0,
    enterhomeAddress: '山东省高密市绿园小区九单元501室',
    enterhomeSituationTypeName: '拒绝检查',
    enterhomeSituationTypeCode: 'EHS_001',
    enterhomeUserTypeCode: 'EHT_002'
}, {
    objectId: '1231241241234',
    securityCheckTime: '2017.02.23 11:12',
    createUserName: '卢云',
    enterhomeUserTypeName: '居民',
    enterhomeUserName: '张无忌',
    isdanger: 0,
    enterhomeAddress: '山东省高密市绿园小区九单元501室',
    enterhomeSituationTypeName: '拒绝检查',
    enterhomeSituationTypeCode: 'EHS_002',
    enterhomeUserTypeCode: 'EHT_001'
}, {
    objectId: 'asdfqwer1234',
    securityCheckTime: '2017.12.23 11:12',
    createUserName: '王阳明',
    enterhomeUserTypeName: '居民',
    enterhomeUserName: '王二麻子',
    isdanger: 1,
    enterhomeAddress: '海淀区面筋罗401室',
    enterhomeSituationTypeName: '成功入户',
    enterhomeSituationTypeCode: 'EHS_002',
    enterhomeUserTypeCode: 'EHT_001'
}, {
    objectId: '1231241241234',
    securityCheckTime: '2017.02.23 11:12',
    createUserName: '卢云',
    enterhomeUserTypeName: '居民',
    enterhomeUserName: '张无忌',
    isdanger: 0,
    enterhomeAddress: '山东省高密市绿园小区九单元501室',
    enterhomeSituationTypeName: '到访不遇',
    enterhomeSituationTypeCode: 'EHS_002',
    enterhomeUserTypeCode: 'EHT_001'
}];
