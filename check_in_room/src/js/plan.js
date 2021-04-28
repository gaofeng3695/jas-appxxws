appcan.ready(function() {
    planObj.init();
});

(function(appcan, window, $, baseOperation, JasHttpRequest, refreshBounce, creatNumTip, creatPlanTemplate) {
    var planObj = {
        pageNum: 1,
        pageSize: 10,
        elem: {
            list_wrapper: 'ul'
        },
        initHttp: function() {
            this.jasHttpRequest = new JasHttpRequest();
        },
        initElem: function() {
            var eles = this.elem;
            for (var name in eles) {
                if (eles.hasOwnProperty(name)) {
                    this[name] = $(eles[name]);
                }
            }
        },
        init: function() {
            this.initHttp();
            this.initElem();
            this.setBounce();
            this.bindEvent();
            this.requestListData();
        },
        bindEvent: function() {
            var that = this;
            $('body').on('click', 'li', function(e) {
                var t = e.target;
                if ($(t).hasClass('icon_see')) {
                    var s = "";
                    var title = "";
                    if ($(t).hasClass('icon_people')) {
                        s = t.dataset.content;
                        title = "安检人员";
                    } else {
                        s = t.dataset.content;
                        title = "安检范围";
                    }
                    appcan.window.alert({
                        title: title,
                        content: s,
                        buttons: ['确定']
                    });
                    return;
                }

                appcan.locStorage.val('planId', this.dataset.id);
                appcan.locStorage.val('isrelation', this.dataset.isrelation);
                appcan.locStorage.val('isclosed', this.dataset.isclosed);
                appcan.locStorage.val('planName', this.dataset.planname);
                if ($(t).hasClass('newRe')) {
                    // appcan.openWinWithUrl('useraddresslist','../userfile/useraddresslist.html');
                    //appcan.locStorage.val('recordEntrance', 'new');
                    //appcan.openWinWithUrl('new_record', '../new_record/new_record.html');

                    if (tjSwitch == 1) {
                        try {
                            var param = {
                                eventName: "入户安检-点击新建安检记录",
                                info: {}
                            };
                            uexTianji.track(param);
                        } catch (e) {}
                    }

                    appcan.openWinWithUrl('useraddresslist', '../userfile/useraddresslist.html');
                    return;
                }
                appcan.openWinWithUrl('record', '../record/record.html');
            });
        },
        setBounce: function() {
            var that = this;
            refreshBounce(function() {
                that.pageNum = 1;
                that.requestListData();
            }, function() {
                that.pageNum++;
                that.requestListData();
            });
        },
        requestListData: function() {
            var that = this;
            //this.render(aData);
            //return;
            var partURL = "cloudlink-inspection-event/commonData/securityCheckPlan/getPageList";
            //var partURL = "cloudlink-inspection-event-llk/commonData/securityCheckPlan/getPageList";
            var queryObj = {
                //"startDate": "", //开始时间 2016-10-01 00:00
                //"endDate": "", //结束时间 
                //"planShowStatus":"",//-1：提前开始 0：未开始 1：进行中 2：已结束 3：已延期 为空代表查询全部
                //"keywordWeb" : "",
                "pageNum": that.pageNum,
                "pageSize": that.pageSize
            };
            baseOperation.londingToast('数据请求中，请稍后...', 99999);
            that.jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
                //alert(dbSource)
                if (dbSource === "") {
                    baseOperation.alertToast('网络繁忙，请稍后再试');
                    //that.requestData();
                    return;
                }
                baseOperation.closeToast();
                var reObj = JSON.parse(dbSource);
                if (reObj.success == 1) {
                    var aData = reObj.rows;
                    if (aData.length > 0) {
                        that.render(aData);
                    } else {
                        if (that.pageNum === 1) {
                            baseOperation.alertToast('暂无入户安检计划');
                            that.list_wrapper.html('<div class="ub ub-pc uinn ulev30 clr666">暂无入户安检计划</div><div class="ub ub-pc uinn ulev30 clr666">请登录【巡线卫士】网页版，创建安检计划</div><div class="ub ub-pc uinn ulev30 clr666 ">https://xxgl.zyax.cn</div>');
                        } else {
                            baseOperation.alertToast('没有更多入户安检计划');
                        }

                    }
                    that.renderItemCount(aData.length, reObj.total);
                } else {
                    baseOperation.alertToast('网络繁忙，请稍后再试');
                }
            }, JSON.stringify(queryObj));
        },
        render: function(aObj) {
            var that = this;
            var s = '';
            aObj.forEach(function(item, index, arr) {
                s += creatPlanTemplate(item);
            });
            if (that.pageNum === 1) {
                that.list_wrapper.html(s);
            } else {
                that.list_wrapper.append(s);
            }
            that._addChartAnimate(aObj);

        },

        _addChartAnimate: function(aObj) {
            var that = this;
            //var top = $(window).position.top
            var n = $.isArray(aObj) && aObj.length;

            if (n) {
                var $dom = that.list_wrapper.find('li').slice(-n);
                setTimeout(function() {
                    //that.addAnimateSync($dom);
                    that.addAnimateAsync($dom);
                }, 10);
            }
        },
        addAnimateSync: function($dom) {
            var that = this;
            $dom.each(function(index, dom) {
                that.doAnimate(dom);
            });
        },
        addAnimateAsync: function($dom) {
            var that = this;
            $dom.each(function(index, dom) {
                that.ifInScreen(dom) && !that.ifAnimated(dom) && that.doAnimate(dom);
            });
            $(window).on('scroll', function() {
                $dom.each(function(index, dom) {
                    that.ifInScreen(dom) && !that.ifAnimated(dom) && that.doAnimate(dom);
                });
            });
        },
        ifInScreen: function(dom) {
            var screenOffset = {
                top: $(window).scrollTop(),
                bottom: $(window).scrollTop() + $(window).height()
            };
            return screenOffset.top < $(dom).offset().top + $(dom).height() && $(dom).offset().top + $(dom).height() * 0.4 < screenOffset.bottom;
        },
        ifAnimated: function(dom) {
            var bool = dom.dataset.ifAnimated;
            if (!bool) {
                dom.dataset.ifAnimated = true;
            }
            return bool;
        },
        doAnimate: function(dom) {
            var $item = $(dom);
            var coverRate = $item.find('.coverRate').html().split('%')[0];
            coverRate = coverRate > 100 ? 100 : coverRate;
            var factRate = $item.find('.factRate').html().split('%')[0];
            factRate = factRate > 100 ? 100 : factRate;

            $item.find('.coverBox').css({
                'transform': 'rotate(' + (1.8 * coverRate - 180) + 'deg)',
                '-webkit-transform': 'rotate(' + (1.8 * coverRate - 180) + 'deg)',
            });
            $item.find('.factBox').css({
                'transform': 'rotate(' + (1.8 * factRate - 180) + 'deg)',
                '-webkit-transform': 'rotate(' + (1.8 * factRate - 180) + 'deg)',
            });
        },
        renderItemCount: function(nNow, nTotal) {
            var that = this;
            if (that.pageNum === 1) {
                creatNumTip(nNow, nTotal);
            } else {
                creatNumTip(nNow, nTotal, true);
            }
        },
        // createPlanTemplateByObj: function(obj) {
        //     if (!obj) {
        //         alert('请传入参数');
        //         return;
        //     }
        //     var statusMap = {
        //         '-1': '提前开始',
        //         '0': '未开始',
        //         '1': '进行中',
        //         '2': '已结束',
        //         '3': '已延期'
        //     };
        //     var isrelation = obj.isRelation;
        //     var isclosed = obj.planShowStatus === '2' ? 1 : 0;


        //     return [
        //         '<li class="sectionShadow" data-id="', obj.objectId, '" data-isrelation="', isrelation, '" data-isclosed="', isclosed, '"data-planname="', obj.planName, '">',
        //         '<div class="ub title">',
        //         '<div class="ub-f1 ulim100">',
        //         '<span class="ulev24 clr999">', obj.planStartTime, ' 至 ', obj.planEndTime, '</span>',
        //         '<span class="ulev26 clr999 ml18">', obj.createUserName, '</span>',
        //         '</div>',
        //         '<div class="icon"><span class="ulev28 bg' + obj.planShowStatus, '">', statusMap[obj.planShowStatus], '</span></div>',
        //         '</div>',
        //         '<div class="ub lh80">',
        //         '<div class="ub-f1 tx-c ulim100">',
        //         '<span class="ulev30 clr333 fwBold planname">', obj.planName, '</span>',
        //         '</div>',
        //         '</div>',
        //         '<div class="ub lh80">',
        //         '<div class="ub-f1 tx-c btn02"><span class="ulev30">完成情况 <span>', obj.factWorkload, '/', obj.planWorkload, '</span></span>',
        //         '</div>',
        //         '<div class="mid"></div>',
        //         '<div class="ub-f1 tx-c btn01"><span class="ulev30">完成率 <span>', obj.workloadRatio + '%', '</span></span>',
        //         '</div>',
        //         '</div>',
        //         '<div class="ub lh80  dist_wrapper mt28">',
        //         '<div class="icon_people"></div>',
        //         '<div class="ub-f1 dist ulim100">',
        //         '<span class="ulev28 clr333 ">', obj.relationshipPersonNames, '</span>',
        //         '</div>',
        //         '<div class="icon_see people"></div>',
        //         '</div>',
        //         '<div class="ub dist_wrapper lh80">',
        //         '<div class="icon_index"></div>',
        //         '<div class="ub-f1 dist ulim100">',
        //         '<span class="ulev28 clr333 ">', obj.securityCheckScope, '</span>',
        //         '</div>',
        //         '<div class="icon_see"></div>',
        //         '</div>',
        //         '<div class="tx-c newBtn mt22 newRe">',
        //         '<span  class="newRe ulev30  ', (+isrelation && !+isclosed) ? '' : 'uhide', '">新建安检记录</span>',
        //         '</div>',
        //         '</li>'
        //     ].join('');
        // }
    };
    window.planObj = planObj;
})(appcan, window, Zepto, baseOperation, JasHttpRequest, refreshBounce, creatNumTip, creatPlanTemplate);

var aData = [{
    objectId: 'asdasfasfd1234qwd',
    planName: '2017年2月安检计划',
    planShowStatus: '-1',
    planStartTime: '2017.12.23',
    planEndTime: '2013.01.23',
    createUserName: '张无忌',
    factWorkload: 45,
    planWorkload: 167,
    workloadRatio: 35.6,
    securityCheckScope: '北京市龙岗路一号清河清景园',
    relationshipPersonName: '卢云、张三、李四、卓凌钊',
    isRelation: '1'

}, {
    objectId: 'asdasfasfd1234qwd',
    planName: '2017年2月安检计划',
    planShowStatus: '0',
    planStartTime: '2017.12.23',
    planEndTime: '2013.01.23',
    createUserName: '张无忌',
    factWorkload: 45,
    planWorkload: 167,
    workloadRatio: 35.6,
    securityCheckScope: '北京市龙岗路一号清河清景园',
    relationshipPersonName: '卢云、张三、李四、卓凌钊',
    isRelation: '0'

}, {
    objectId: 'asdasfasfd1234qwd',
    planName: '2017年2月安检计划',
    planShowStatus: '1',
    planStartTime: '2017.12.23',
    planEndTime: '2013.01.23',
    createUserName: '张无忌',
    factWorkload: 45,
    planWorkload: 167,
    workloadRatio: 35.6,

    securityCheckScope: '北京市龙岗路一号清河清景园',
    relationshipPersonName: '卢云、张三、李四、卓凌钊',
    isRelation: '0'

}, {
    objectId: 'asdasfasfd1234qwd',
    planName: '2017年2月安检计划',
    planShowStatus: '2',
    planStartTime: '2017.12.23',
    planEndTime: '2013.01.23',
    createUserName: '张无忌',
    factWorkload: 45,
    planWorkload: 167,
    workloadRatio: 35.6,

    securityCheckScope: '北京市龙岗路一号清河清景园',
    relationshipPersonName: '卢云、张三、李四、卓凌钊',
    isRelation: '1'

}, {
    objectId: 'asdasfasfd1234qwd',
    planName: '2017年2月安检计划',
    planShowStatus: '3',
    planStartTime: '2017.12.23',
    planEndTime: '2013.01.23',
    createUserName: '张无忌',
    factWorkload: 45,
    planWorkload: 167,
    workloadRatio: 35.6,

    securityCheckScope: '北京市龙岗路一号清河清景园',
    relationshipPersonName: '卢云、张三、李四、卓凌钊',
    isRelation: '1'

}];
