function createtemplate(obj, index, flag) {
    var dept="";
    if(obj.parentOrgName){
        dept=obj.parentOrgName+'>'+obj.dept;
    }else{
        dept=obj.dept;
    }
    if (obj.status == '1') {
        return [
            '<li class="" data-id="', obj.objectid, '"data-index="', index, '"data-enterprised="', obj.enterpriseId, '">',
            '<div class="mar5 ">',
            '<div class="ub ubb sc-border-cor pdd14 ub-ac">',
            '<div class="checkbox js_check ', flag ? '' : 'hidd', '">',
            '<input type="checkbox" class="js_check">',
            '</div>',
            '<div class="ub-f1 marr">',
            '<div class="ub line1 marl5 ub-pj">',
            '<div class=" clr333 ulev28 width150 ulim100">', obj.name,
            '</div>',
           
            '<div class="ub-f1 clr666 ulev28 ulim100 tx-r width1000" >',dept ,'</div>',

            '</div>',
            '<div class="ub line1 marl5 ub-pj" >',
            '<div class="ub-f1 clr666 ulev28 width150">', obj.tel,
            '</div>',
            '<div class="  clr666 ulev28 ulim100">', obj.roleNames,
            '</div>',
            '</div>',
            '</div>',
            '<div class="direction">',
            '<img src="image/direction.png" class="directionsize">',
            '</div>',
            '</div>',
            '</div>',
            '</li>'
        ].join('');
    } else {
        return [
            '<li class="" data-id="', obj.objectid, '"data-index="', index, '"data-enterprised="', obj.enterpriseId, '">',
            '<div class="mar5 ">',
            '<div class="ub ubb sc-border-cor pdd14 ub-ac">',
            '<div class="checkbox js_check ', flag ? '' : 'hidd', '">',
            '<input type="checkbox" class="js_check">',
            '</div>',
            '<div class="ub-f1 marr">',
            '<div class="ub line1 marl5 ub-pj">',
            '<div class="ub width150 clr333 ulev28">',
            '<div class="width8 ulim100">', obj.name,
            '</div>',
            '<div class=" status ulev26 status_color">', obj.status == '-1' ? '（被冻结）' : '（未激活）',
            '</div> ',
            '</div>',

            '<div class="ub-f1 clr666 ulev28 ulim100 tx-r width1000" >',dept,'</div>',
            '</div>',
            '<div class="ub line1 marl5 ub-pj" >',
            '<div class="ub-f1 clr666 ulev28 width150">', obj.tel,
            '</div>',
            '<div class="  clr666 ulev28 ulim100">', obj.roleNames,
            '</div>',
            '</div>',
            '</div>',
            '<div class="direction">',
            '<img src="image/direction.png" class="directionsize">',
            '</div>',
            '</div>',
            '</div>',
            '</li>'
        ].join('');
    }

}