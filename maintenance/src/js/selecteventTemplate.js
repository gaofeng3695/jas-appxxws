function createTemplate(obj) {
    var s = "'" + JSON.stringify(obj) + "'";
    if (!obj.eventIconName) {
        eventIconName = "D01.png";
    } else {
        eventIconName = obj.eventIconName;
    }
    return [
        '<li class="sectionMargin sectionShadow bg" data-id=', obj.objectId, '>',
        '<div class="mar05">',
        '<div class="ub ubb sc-border-cor umh70 ub-ac clickarea" data-id=', obj.objectId, '>',
        '<div class="ub-f1 clr999 ulev26">',
        '事件编号', obj.eventCode,
        '</div>',
        '<div class="clr999 ulev26">', obj.inspectorName, '</div>',
        '</div>',
        '<div class="ub ub-ac padd22">',
        '<div class="box ub ub-ac check_width js_check ">',
        '<div class="radiobox umar-r sc-text-active  ">',
        '<input type="radio" class="js_check" name="lv_radio_0" data-obj=', s, '>',
        '</div>',
        '<img src="../../event_management/index/icons/', eventIconName, '" class="imgp">',
        '</div>',
        '<div class="ub-f1 marl clickarea" data-id="', obj.objectId, '">',
        '<div class="ub umlh56">',
        '<div class="ub-f1 ulev28 clr333 ulim100">', obj.fullTypeName, '</div>',
        '</div>',
        '<div class="ub">',
        '<div class="ub-f1 ulev26 clr666 ulim2">', obj.description, '</div>',
        '</div>',
        '<div class="ub umlh56">',
        ' <div class="ub-f1 clrb ulev26 address ulim100 addressimg">',
        '<span class="marl15">', obj.address, ' </span>',
        '</div>',
        ' </div>',
        '</div>',
        '</div>',
        '</div>',
        ' </li> ',
    ].join('');
}

function homeTemplate(obj) {
    if (!obj) {
        alert('请传入参数');
        return;
    }
    var userobj = "'" + JSON.stringify(obj) + "'";
    return [
        '<li class="sectionMargin sectionShadow bg" data-obj=', userobj, '>',
        '<div class="mar05 paad">',
        '<div class="ub ubb sc-border-cor umh80 ub-ac">',
        '<div class="ub-f1 clr666 ulev26 ulim100 width1000" >',
        '用户编号：<span>', obj.userFileCode, '</span>',
        '</div>',
        '<div class="ub-f1 clr666 ulev26  ulim100 texr width1000" >',
        '所属片区：<span>', obj.regionName ? obj.regionName : '无片区', '</span>',
        '</div>',
        '</div>',
        '<div class="ub ub-ac">',
        '<div style="margin-right: 1em" class="radiobox">',
        '<input type="radio" class="" name="lv_radio_0" data-obj=', userobj, '>',
        '</div>',
        '<div class="ub-ac ub-f1">',
        '<div class="ub  umh70 ub-ac padt" >',
        '<div class="ub-f1 clr333 ulev28 ulim100 ">', obj.residential,
        '<span class="', obj.biulding ? 'mar05' : '', '">', obj.biulding,
        '</span><span class="mar05">', obj.unit, '</span>',
        '</div>',
        '<div class=" clr333 ulev28 ulim100">', obj.room || '',
        '</div>',
        '</div>',
        '<div class="ub  umh70 ub-ac">',
        '<div class="ub-f1 clr333 ulev28  ulim100 ">', obj.userFileName,
        '</div>',
        '<div class=" clr333 ulev28  ulim100  ">', obj.contactPhone,
        '</div>',
        '</div>',
        '</div>',
        '</div>',
        '</div>',
        '</li>'
    ].join('');
}