function createTemplateByObj(obj) {
    if (!obj) {
        alert('请传入参数');
        return;
    }
    // var arr = [];
    // arr.push(JSON.stringify(obj));
    // alert(JSON.stringify(arr));
    var typeImg = {
        'FT_01': '../src/images/pressure.png',
        'FT_02': '../src/images/valve.png',
        'FT_03': '../src/images/valvebox.png',
        'FT_04': '../src/images/well.png',
        'FT_05': '../src/images/vat.png',
        'FT_06': '../src/images/three.png',
        'FT_07': '../src/images/four.png',
        'FT_08': '../src/images/pole.png',
        'FT_09': '../src/images/warning.png',
        'FT_10': '../src/images/flow.png',
        'FT_11': '../src/images/gage.png',
        'FT_99': '../src/images/other.png'
    }
    var s = "'"+JSON.stringify(obj)+"'";
    var Img = typeImg[obj.facilityTypeCode]
    return [
        '<li class="sectionMargin sectionShadow  bg"  data-success="">',
        '<div class="mar05">',
        '<div class="ub ubb sc-border-cor umh70 ub-ac clickarea" data-id="', obj.objectId, '">',
        '<div class="ub-f1 clr999 ulev26">',
        '设施编号：', obj.facilityCode,
        '</div>',
        '</div>',
        '<div class="ub ub-ac padd22">',
        '<div class="box ub ub-ac check_width js_check ">',
        '<div class="radiobox umar-r sc-text-active js_check ">',
        '<input type="radio" class="uabs ub-con js_check"  name="lv_radio_0" data-obj=',s,'>',
        '</div>',
        '<img src="', Img, '" class="imgp">',
        '</div>',
        '<div class="ub-f1 marl clickarea" data-id="', obj.objectId, '">',
        '<div class="ub umlh56">',
        '<div class="ub-f1 ulev30 clr333 facilityName ulim100">', obj.facilityName,
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