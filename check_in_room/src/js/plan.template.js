function creatPlanTemplate(obj) {
    if (!obj) {
        alert('请传入参数');
        return;
    }
    var statusMap = {
        '-1': '提前开始',
        '0': '未开始',
        '1': '进行中',
        '2': '已结束',
        '3': '已延期'
    };
    var isrelation = obj.isRelation;
    var isclosed = obj.planShowStatus === '2' ? 1 : 0;
    return [
        '<li class="sectionShadow uof" data-id="', obj.objectId, '" data-isrelation="', isrelation, '" data-isclosed="', isclosed, '"data-planname="', obj.planName, '">',

        '<div class="ub lh80 border_b_grey">',
            '<div class="ub-f1 ulim100 plan_title">',
            '<span class="ulev30 clr333 ">', obj.planName.trim(), '</span>',
            '</div>',
            '<div class="icon"><span class="ulev28 bg' + obj.planShowStatus, '">', statusMap[obj.planShowStatus], '</span></div>',            

        '</div>',

        '<div class="ub title">',
            '<div class="ub-f1 ulim100">',
            '<span class="ulev24 clr999">', obj.planStartTime, ' 至 ', obj.planEndTime, '</span>',
            '<span class="ulev26 clr999 ml18">', obj.createUserName, '</span>',
            '</div>',
            
            '<div class="ub right_icon height100">',
                '<div class="icon_people icon_see" data-content="', obj.relationshipPersonNames, '"></div>',
                '<div class="icon_index icon_see" data-content="', obj.securityCheckScope, '"></div>',
            '</div>',            
        '</div>',


        '<div class="box22 mb_50">',
        '<div class="pb100"></div>',
        '<div class="sub_box">',
        '<div class="uof box12">',
        '<div class="sub_box22 left bg_grey">',
        '<div class="width100 height100 uabs topMask">',
        '<div class="pb50"></div>',
        '<div class="uabs  content clr_green">',
        '<div class="height50 ub ub-ver">',
        '<div class="ulev44 ub-f1 ub ub-ac ub-pc pt02 coverRate">', (obj.coverageRatio || 0) + '%', '</div>',
        '<div class="ulev26">覆盖率</div>',
        '<div class="ulev28">', (obj.coverageWorkload || 0), ' / ', (obj.planWorkload || 0) , '</div>',
        '</div>',
        '</div>',
        '</div>',
        '<div class="pb100"></div>',
        '</div>',
        '<div class="sub_box22 right bg_grey">',
        '<div class="width100 height100 uabs topMask">',
        '<div class="pb50"></div>',
        '<div class="uabs  content clr_org">',
        '<div class="height50 ub ub-ver">',
        '<div class="ulev44 ub-f1 ub ub-ac ub-pc pt02 factRate">', (obj.workloadRatio || 0)+ '%', '</div>',
        '<div class="ulev26">入户率</div>',
        '<div class="ulev28">', (obj.factWorkload || 0) , ' / ', (obj.planWorkload || 0), '</div>',
        '</div>',
        '</div>',
        '</div>',
        '<div class="pb100"></div>',
        '</div>',
        '</div>',
        '<div class="uof box12 sub_box12">',
        '<div class="width50 height100 uof rotate animate coverBox left">',
        '<div class="sub_box22 width100 left bg_green">',
        '<div class="pb100"></div>',
        '</div>',
        '</div>',
        '<div class="width50 height100 uof rotate animate factBox right">',
        '<div class="sub_box22 width100 right bg_org">',
        '<div class="pb100"></div>',
        '</div>',
        '</div>',
        '</div>',
        '</div>',
        '</div>',
        '<div class="tx-c newBtn mt22 newRe">',
        '<span class="newRe ulev30 ', (+isrelation && !+isclosed) ? '' : 'uhide', '">新建安检</span>',
        '</div>',
        '</li>',
    ].join('');
}
