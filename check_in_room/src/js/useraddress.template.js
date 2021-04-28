function createTemplateByObj(obj) {
    if (!obj) {
        alert('请传入参数');
        return;
    }
    var userobj="'"+JSON.stringify(obj)+"'";
    return [
        '<li class="sectionMargin sectionShadow  bg ',obj.isHasRecordLocal?'passMask':'','" data-id="', obj.objectId, '" data-success="" data-obj=',userobj,'>',
        '<div class="mar05 paad" >',
        '<div class="ub ubb sc-border-cor umh70 ub-ac">',
        '<div class="ub-f1 clr666 ulev26 ulim100 width1000" >',
        '用户编号：<span class="">', obj.userFileCode, '</span>',
        '</div>',
        '<div class="ub-f1 clr666 ulev26  ulim100 texr width1000" >',
        '所属片区：<span class=" ">', obj.regionName?obj.regionName:'无片区', '</span>',
        '</div>',
        '</div>',
    
        '<div class="ub  umh70 ub-ac padt">',
        '<div class="ub-f1 clr333 ulev28 ulim100 width1000">', obj.residential,
        '<span class=" ',obj.biulding?'mar05':'','">',obj.biulding,
        '</span>',
        '<span class="mar05">',obj.unit,
        '</span>',
        '</div>',
        '<div class=" clr333 ulev28 ulim100">', obj.room || '',
        '</div>',
        '</div>',
        '<div class="ub  umh70 ub-ac ">',
        '<div class="clr333 ulev28  ulim100 width8  ">', obj.userFileName,
        '</div>',
        '<div class="clr333 ulev28  pd1">', obj.contactPhone,
        '</div>',
        // '<div class=" ub-f1 ',obj.isHasRecordLocal?'bgss':'','">',
        // '</div>',
        '</div>',
        '</div>',
        '</li>'
    ].join('');
}