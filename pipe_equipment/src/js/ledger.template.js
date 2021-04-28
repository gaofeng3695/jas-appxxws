function createTemplateByObj(obj, falg) {
    if (!obj) {
        alert('请传入参数');
        return;
    }
    var typeImg = {
        'FT_01': '../src/images/pressure.png',//调压设备
        'FT_02': '../src/images/valvebox.png',//阀室
        'FT_03': '../src/images/valve.png',//阀门
        'FT_04': '../src/images/well.png',//井
        'FT_05': '../src/images/vat.png',//缸
        'FT_06': '../src/images/three.png',//三通
        'FT_07': '../src/images/four.png',//四通
        'FT_08': '../src/images/pole.png',//桩
        'FT_09': '../src/images/warning.png',//警示牌
        'FT_10': '../src/images/flow.png',//流量计
        'FT_11': '../src/images/gage.png',//压力表
        'FT_99': '../src/images/other.png'
    }
    var Img = typeImg[obj.facilityTypeCode]
    return [
        '<li class="sectionMargin sectionShadow  bg" data-id="', obj.objectId, '" data-privilege="',falg?"true":"false",'" >',
        '<div class="mar05">',
        '<div class="ub ubb sc-border-cor umh70 ub-ac">',
        '<div class="ub-f1 clr999 ulev26 ulim100">',
        '设施编号：', obj.facilityCode,
        '</div>',
        '</div>',
        '<div class="ub ub-ac padd22">',
        '<div class="box ub ub-ac check_width js_check ">',
        '<div class="checkbox umar-r sc-text-active js_check ">',
        '<input type="checkbox" class="uabs ub-con js_check"', falg ? '' : 'disabled', '>',
        '</div>',
        '<img src="', Img, '" class="imgp">',
        '</div>',
        '<div class="ub-f1 marl">',
        '<div class="ub umlh56">',
        '<div class="ub-f1 ulev30 clr333 ulim100">', obj.facilityName,
        '</div>',
        '<div class="marr30 ulev30 clr333">',
        obj.pipelineTypeName,
        '</div>',
        '<div class="">', obj.facilityTypeName,
        '</div>',
        '</div>',
        '<div class="ub umlh56">',
        '<div class="ub-f1 clr666 ulev28 address ulim100 addressimg">',
        '<span class="marl15">', obj.address, '</span>',
        '</div>',
        '</div>',
        '</div>',
        '</div>',
        '</div>',
        '</li>',
    ].join('');
}