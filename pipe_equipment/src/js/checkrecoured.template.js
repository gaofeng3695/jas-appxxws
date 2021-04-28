(function(appcan, window, Zepto) {
    var obj = {
        createTemplateByObj: function(obj, type) {
            if (!obj) {
                alert('请传入参数');
                return;
            }
            if (type == "FT_04") {
                return this.createTemplatewell(obj);
            } else if (type == "FT_01") {
                return this.createTemplatepressure(obj);
            } else {
                return this.createTemplate(obj);
            }
        },
        createTemplatewell: function(obj) {
            return [
                '<li class="sectionMargin sectionShadow  bg" data-id="', obj.objectId, '" data-success="">',
                '<div class="mar05">',
                '<div class="ub ubb sc-border-cor umh70 ub-ac">',
                '<div class="ub-f1 clr999 ulev26">',
                obj.facilityCheckTime,
                '</div>',
                '<span class="clr666 ulev26">', obj.createUserName, '</span>',
                '</div>',
                '<div class="ub umh70">',
                '<div class="ub-f1 ulev28 clr666">有无占压',
                '</div>',
                '<div class="ulev28 clr333">', obj.pressureSituationName,
                '</div>',
                '</div>',
                '<div class="ub umh70">',
                '<div class="ub-f1 ulev28 clr666">井内有无积水</div>',
                '<div class="ulev28 clr333">', obj.isSeeperName,
                '</div>',
                '</div>',
                '<div class="ub umh70">',
                '<div class="ub-f1 ulev28 clr666">井盖是否损毁</div>',
                '<div class="ulev28 clr333">', obj.isWellCoverDamageName,
                '</div>',
                '</div>',
                '<div class="ub umh70">',
                '<div class="ub-f1 ulev28 clr666"> 可燃气体浓度（ppm）</div>',
                '<div class="ulev28 clr333">',
                obj.combustibleGasConcentration,
                '</div>',
                '</div>',
                '</div>',
                '<div class="  ubtop">',
                '<div class="ub  umh70 ub-ac mar05">',
                '<div class="ub-f1 clr666 ulev28">检查结果</div>',
                '<div class=" ulev28 ', obj.isLeakage == '1' ? 'textcolred' : 'clr333', '  ulr42"> ', obj.isLeakage == '1' ? '漏气' : '', '</div>',
                '<div class=" ulev28 ', obj.facilityCheckResult == '1' ? 'textcolred' : 'clr333', ' ">', obj.facilityCheckResultName, '</div>',
                '</div>',
                '</div>',
                '</li>'
            ].join('');
        },
        createTemplatepressure: function(obj) {
            return [
                '<li class="sectionMargin sectionShadow  bg" data-id="', obj.objectId, '" data-success="">',
                '<div class="mar05">',
                '<div class="ub ubb sc-border-cor umh70 ub-ac">',
                '<div class="ub-f1 clr999 ulev26">',
                obj.facilityCheckTime,
                '</div>',
                '<span class="clr666 ulev26">', obj.createUserName, '</span>',
                '</div>',
                '<div class="ub umh70">',
                '<div class="ub-f1 ulev28 clr666">进口压力（kPa）',
                '</div>',
                '<div class="ulev28 clr333">', +obj.pressureIn,
                '</div>',
                '</div>',
                '<div class="ub umh70">',
                '<div class="ub-f1 ulev28 clr666">出口压力（kPa）</div>',
                '<div class="ulev28 clr333">', +obj.pressureOut,
                '</div>',
                '</div>',
                '<div class="ub umh70">',
                '<div class="ub-f1 ulev28 clr666"> 可燃气体浓度（ppm）</div>',
                '<div class="ulev28 clr333">',
                obj.combustibleGasConcentration,
                '</div>',
                '</div>',
                '</div>',
                '<div class="  ubtop">',
                '<div class="ub  umh70 ub-ac mar05">',
                '<div class="ub-f1 clr666 ulev28">检查结果</div>',
                '<div class=" ulev28 ', obj.isLeakage == '1' ? 'textcolred' : 'clr333', '  ulr42"> ', obj.isLeakage == '1' ? '漏气' : '', '</div>',
                '<div class=" ulev28 ', obj.facilityCheckResult == '1' ? 'textcolred' : 'clr333', ' ">', obj.facilityCheckResultName, '</div>',
                '</div>',
                '</div>',
                '</li>'
            ].join('');
        },
        createTemplate: function(obj) {
            return [
                '<li class="sectionMargin sectionShadow  bg" data-id="', obj.objectId, '" data-success="">',
                '<div class="mar05">',
                '<div class="ub ubb sc-border-cor umh70 ub-ac">',
                '<div class="ub-f1 clr999 ulev26">',
                obj.facilityCheckTime,
                '</div>',
                '<span class="clr666 ulev26">', obj.createUserName, '</span>',
                '</div>',
                '<div class="ub umh70">',
                '<div class="ub-f1 ulev28 clr666"> 可燃气体浓度（ppm）</div>',
                '<div class="ulev28 clr333">',
                obj.combustibleGasConcentration,
                '</div>',
                '</div>',
                '</div>',
                '<div class="  ubtop">',
                '<div class="ub  umh70 ub-ac mar05">',
                '<div class="ub-f1 clr666 ulev28">检查结果</div>',
                '<div class=" ulev28 ', obj.isLeakage == '1' ? 'textcolred' : 'clr333', '  ulr42"> ', obj.isLeakage == '1' ? '漏气' : '', '</div>',
                '<div class=" ulev28 ', obj.facilityCheckResult == '1' ? 'textcolred' : 'clr333', ' ">', obj.facilityCheckResultName, '</div>',
                '</div>',
                '</div>',
                '</li>'
            ].join('');
        }
    };
    window.checkrecordTemplate = obj;
})(appcan, window, Zepto);