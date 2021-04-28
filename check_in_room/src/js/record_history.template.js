(function(window, $) {
    var obj = {
        createRecordHistoryTemplate: function(value, index) {
            var that = this;
            //alert(JSON.stringify(value))
            var isDanger = value.enterhomeSituationTypeName === '成功入户' && value.hiddendangers.length > 0;
            return [
                '<div class="sectionShadow sectionMargin bgcolor lineHeight">',
                '<div class="ub p06 borderBottom">',
                '<div class="ulev26 leftStyle clr666">安检时间</div>',
                '<div class="ub-f1 ulev26 borderLeft security_data clr333">', value.securityCheckTime, '<div class="failureTimes">', index, '</div>', '</div>',
                '</div>',
                '<div class="ub p06 borderBottom">',
                '<div class="ulev26 leftStyle clr666">入户情况</div>',
                '<div class="ub-f1 ulev26 borderLeft home_situation clr333">',
                value.enterhomeSituationTypeName,
                '</div>',
                '<div class="redclr ', (isDanger ? '' : 'uhide'), ' ulev24 ub-f1 tx-r">存在隐患 </div>',
                '</div>',
                that._createDangersHtml(value),
                '<div class="ub p06 borderBottom">',
                '<div class="ulev26 leftStyle clr666 w3">安检人</div>',
                '<div class="ub-f1 ulev26 borderLeft security_man clr333">', value.createUserName, '</div>',
                '</div>',
                '<div class="ub p06 borderBottom mb05">',
                '<div class="ulev26 leftStyle clr666 w2">照片</div>',
                '<div class="ub-f1 ulev26 borderLeft leftRight_table"></div>',
                '</div>',
                that._createImgListHtml(value.pic),
                '<div class="ub p06 borderBottom">',
                '<div class="ulev26 leftStyle clr666 ub ub-ac w2">备注</div>',
                '<div class="ub-f1 ulev26 borderLeft remarks clr333 wordBreak">', value.remark, '</div>',
                '</div>',
                '</div>'
            ].join('');
        },
        _createImgListHtml: function(aPics) {
            var that = this;
            //alert(JSON.stringify(aPics))
            var s = '';
            if (aPics.length !== 0) {
                s += '<div class="ub borderBottom zaopian">' +
                    '<div class="ub-f1 clearfloat" style="margin:-0.25em -0.25em 0.25em;">';
                aPics.forEach(function(value) {
                    s += that._createImgHtmlById(value);
                });
                s += '</div></div>';
            }
            return s;
        },
        _createDangersHtml: function(obj) {
            var s = '';
            var aDanger = obj.hiddendangers;
            if (obj.enterhomeSituationTypeName === '成功入户' && aDanger.length > 0) {
                var sDanger = '';
                aDanger.forEach(function(value, index) {
                    sDanger += "<span class='status ulev24'>" + value.hiddendangerName + "</span>";
                });

                s += [
                    '<div class="ub p06 borderBottom">',
                    '<div class="ulev26 leftStyle clr666 ub ub-ac">隐患情况</div>',
                    '<div class="ub-f1 ulev26 borderLeft home_situation clr333">',
                    sDanger,
                    '</div>',
                    '</div>',
                    '<div id="noticeWrapp" class="">',
                    '<div class="ub p06 borderBottom">',
                    '<div class="ulev26 leftStyle clr666 ub ub-ac">整改期限</div>',
                    '<div class="ub-f1 borderLeft modifyDate ulev26 clr333">',
                    (obj.remediationTime ? obj.remediationTime + " 之前" : ''),
                    '</div>',
                    '</div>',
                    '<div class="ub p03 borderBottom">',
                    '<span class="ulev26 clr999" >隐患整改措施<span class="clr_red">已告知</span>用户并解释清楚</span>',
                    '</div>',
                    '</div>'
                ].join('');
            }
            return s;
        },
        _createImgHtmlById: function(sId) {
            //alert(sId)
            var path = serverURL + "cloudlink-core-file/file/getImageBySize?fileId=" + sId + "&viewModel=fill&width=182&hight=182";
            var bigSrc = serverURL + "cloudlink-core-file/file/downLoad?fileId=" + sId;
            return [
                '<div class="picList ufl ub-ac " style="border:.24em solid white; box-sizing:border-box;width:33.3%;" >',
                '<div style="height: 0px;padding-bottom: 100%;"></div>',
                '<div class="uof uabs" style="height: 100%;width: 100%;background:url(' + path + ') no-repeat center center;background-size:cover;border:1px solid #ececec;box-sizing:border-box;" >',
                '<img src="' + path + '"  data-bigSrc="' + bigSrc + '" width="100%" height="100%" style="opacity:0;" class="uabs js_viewBig"/>',
                '</div></div>'
            ].join('');
        }
    };
    window.templateObj = obj;
})(window, Zepto);
