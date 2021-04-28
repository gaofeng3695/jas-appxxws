function createTemplateByObj(obj, falg) {

    //falg 为true 允许进行删除，
    if (!obj) {
        alert('请传入参数');
        return;
    }
    return [
        '<li class="sectionMargin sectionShadow  bg" data-id="', obj.objectId, '" data-success="" data-type="', obj.facilityTypeCode, '">',
        '<div class="mar05">',
        '<div class="ub ubb sc-border-cor umh70 ub-ac">',
        '<div class="ub-f1 clr999 ulev26">',
        obj.facilityCheckTime,
        '</div>',
        '<span class="clr666 ulev26">', obj.createUserName, '</span>',
        '</div>',
        '<div class="ub ub-ac padd22">',

        '<div class="">',
        '<div class="box ub ub-ac check_width js_check " >',
        '<div class="checkbox umar-r sc-text-active js_check">',
        '<input type="checkbox" class="uabs ub-con js_check"', falg ? '' : 'disabled', '>',
        '</div>',
        '</div>',
        '</div>',
        '<div class="ub-f1 marl">',
        '<div class="ub  umh70 ub-ac">',
        '<div class="ub-f1 clr333 ulev28 ulim100" style="width:1000px;">', obj.facilityName, '</div>',
        '<div class="ub-f1 clr333 ulev28" style="padding-left:.5em;width:1000px;">',
        obj.facilityTypeName, '</div>',
        '</div>',
        '<div class="ub  umh70 ub-ac ubb sc-border-cor">',
        '<div class="ub-f1 clr666 ulev26 address ulim100 addressimg">',
        '<span class="marl15">', obj.address, '</span>',
        '</div>',
        '</div>',
        '<div class="ub  umh70 ub-ac">',
        '<div class="ub-f1 clr666 ulev26">检查结果</div>',
        '<div class=" ulev26 ', obj.isLeakage == '1' ? 'textcolred' : 'clr333', '  ulr42"> ', obj.isLeakage == '1' ? '漏气' : '', '</div>',
        '<div class=" ulev26 ', obj.facilityCheckResult == '1' ? 'textcolred' : 'clr333', ' ">', obj.facilityCheckResultName, '</div>',
        '</div>',
        '</div>',
        '</div>',
        '</div>',
        '</li>'
    ].join('');
}