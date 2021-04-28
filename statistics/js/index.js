var statistics = {
    navRightDom: $('#nav-right'), //统计类型标签（本人or企业）
    typeDom: $('#type'), //统计类型标签（事件or里程）
    unitBoxDom: $('.unitBox'), //表头单位标签
    usersQttyDom: $('#usersQtty'), //表头总人数标签
    itemSumQttyDom: $('#itemSumQtty'), //表头总统计数量标签
    timeBtnDom: 　$('.dateItem'), //按钮-可以选择时间范围
    timeShowDom: $('#date'), //展示-显示时间范围
    userHeadDom: $('#user>img'), //用户头像
    userNameDom: $('#username'),
    tipsDom : $('.tips'),

    currentTimeBtn : 0,
    sUserHeadUrl: '',
    sUserName: '',


    isPersonal: true, //统计状态：（本人or企业）
    isDistance: true, //统计状态：（里程or事件）
    beginDate: new Date().Format("yyyy.MM.dd"), //统计状态：起始日期
    endDate: new Date().Format("yyyy.MM.dd"), //统计状态 ：结束时间
    aUsers: [], //统计状态：已选择的用户数

    myChart: null,
    mobiScroll: null,

    init: function() {
        var that = this;
        that.getUserInfo();
        that.renderUser();
        that.renderTimeDom();

        that.bindEvent();
        that.bindEventForSelectDate();
        that.chart_init();
        that.requestData();

    },
    bindEvent: function() {
        var that = this;
        /* 退出页面事件 */
        appcan.button("#nav-left", "btn-act", function() {
            appcan.window.close(-1);
        });
        /*点击右上按钮事件*/
        that.navRightDom.click(function() {
            that.isPersonal = !that.isPersonal;
            that.renderUser();
            if (!that.isPersonal) {
                that.aUsers = [];
            }
            that.requestData();
        });
        /* 选择查询条件 ： 里程、事件 */
        that.typeDom.click(function() {
            that.selectType();
        });
        /* 选择人员范围 */
        that.userHeadDom.click(function() {
            if (that.isPersonal) {
                return;
            }
            var windowParam = {
                "parentWidowId": "statistics",
                "windowId": "",
                "functionName": "statistics.import_name()"
            };
            appcan.locStorage.setVal("useSelectList_param", windowParam);
            appcan.openWinWithUrl("users-select", "../common/page/users_select_updated/users_select.html");
        });
        /* 选择时间范围 */
        that.timeBtnDom.click(function(e) {
            var me = $(this);
            var index = this.dataset.index;
            if (me.hasClass('activeBg') && index !== '3') {
                return;
            }


            if (index !== '3') {
                that.timeBtnDom.removeClass('activeBg');
                me.addClass('activeBg');  
                that.currentTimeBtn = index;              
                that.setDateScope(index);
                that.renderTimeDom();
                that.requestData();
                return;
            }
            that.mobiScroll.show();

            /*$('.mbsc-fr-popup').css({

                //$('.mbsc-fr-persp').css({
                '-webkit-transform': 'scale(' + em / 16 + ')',
                'transform': 'scale(' + em / 16 + ')'
            });*/

            /*$('.mbsc-fr-persp').css({
                'height' : $('body').height(),
                'width' : $('body').width()
            });*/
        });
    },
    bindEventForSelectDate: function() {
        var that = this;
        var myDate = new Date();
        myDate.setDate(myDate.getDate()-7);
        that.mobiScroll = mobiscroll.range('#date', {
            theme: 'material',
            lang: "zh",
            display: "center",
            max: new Date(),
            calendarWidth: 18.5625 * em,
            //calendarHeight : 19.3125*em,
            layout: 'fixed',
            defaultValue: [myDate,new Date()],
            onSet: function(event, inst) {
                that.timeBtnDom.removeClass('activeBg').eq(3).addClass('activeBg');
                that.currentTimeBtn = 3;
                var aDate = inst.getVal();
                that.beginDate = aDate[0].Format("yyyy.MM.dd");
                that.endDate = aDate[1].Format("yyyy.MM.dd");
                that.renderTimeDom();
                that.requestData();
            }
        });
    },
    import_name: function() {
        var that = this;
        var sPeoArr = appcan.locStorage.getVal("userSelect");

        if (sPeoArr) {
            that.aUsers = JSON.parse(sPeoArr).peo_data.map(function(val) {
                return val.userId;
            });
        } else {
            that.aUsers = [];
        }
        that.requestData();
    },
    getUserInfo: function() {
        var that = this;
        var aData = JSON.parse(appcan.locStorage.getVal('userBo'));
        if (aData) {
            if (aData.userName) {
                that.sUserName = aData.userName;
            }
            if (aData.sex === '女') {
                that.sUserHeadUrl = '../images/female_head.png';
            } else {
                that.sUserHeadUrl = '../images/male_head.png';
            }
            if (aData.profilePhoto) {
                that.sUserHeadUrl = serverURL + "cloudlink-core-file/file/getImageBySize?fileId=" + aData.profilePhoto + "&viewModel=fill&width=500&hight=500";
            }
        }
    },
    renderUser: function() { //渲染个人、企业相关的Dom
        var that = this;
        if (that.isPersonal) { //如果当前是本人
            that.navRightDom.find('div').removeClass('icon-personal').addClass('icon-company');
            that.userHeadDom.prop('src', that.sUserHeadUrl);
            that.userNameDom.html(that.sUserName);
            return;
        }
        //如果当前是企业
        that.navRightDom.find('div').removeClass('icon-company').addClass('icon-personal');
        that.userHeadDom.prop('src', 'images/icon-user.png');
        that.userNameDom.html('选人员');
    },
    renderTypeDom: function() {
        var that = this;
        var sType = that.isDistance ? '按里程' : '按事件';
        that.typeDom.find('span').html(sType);
    },
    renderTimeDom: function() {
        var that = this;
        if (that.beginDate === that.endDate) {
            that.timeShowDom.html(that.beginDate);
            return;
        }
        that.timeShowDom.html(that.beginDate + ' - ' + that.endDate);
    },
    renderChartTitle: function(itemSumQtty, usersQtty) {
        var that = this;
        if (!that.isPersonal) {
            that.usersQttyDom.removeClass('hide').html('总人数：' + usersQtty + '人');
        } else {
            that.usersQttyDom.addClass('hide');
        }
        if (that.isDistance) {
            that.unitBoxDom.removeClass('hide');
            that.tipsDom.removeClass('hide');
            that.itemSumQttyDom.html('总里程：' + itemSumQtty + '公里');
        } else {
            that.unitBoxDom.addClass('hide');
           that.tipsDom.addClass('hide');
            that.itemSumQttyDom.html('总事件数：' + itemSumQtty);
        }
    },
    selectType: function() {
        var that = this;
        var mask = $('.subMask');
        mask.removeClass('hide').find('.item').click(function() {
            if ($(this).hasClass('iconActive')) {
                mask.addClass('hide');
                return;
            }
            $(this).addClass('iconActive').siblings().removeClass('iconActive');
            mask.addClass('hide');
            that.isDistance = $(this).find('span').html() === '按里程';
            that.renderTypeDom();
            that.requestData();
        });
    },
    setDateScope: function(index) {
        var that = this;
        var date = new Date();
        switch (index) {
            case '0':
                that.beginDate = date.Format("yyyy.MM.dd");
                that.endDate = that.beginDate;
                break;
            case '1':
                var day = date.getDay();
                day = day === 0 ? 7 - 1 : day - 1;
                date.setTime(date.getTime() - day * 3600 * 24 * 1000);
                that.beginDate = date.Format("yyyy.MM.dd");
                date.setTime(date.getTime() + 6 * 3600 * 24 * 1000);
                that.endDate = date.Format("yyyy.MM.dd");
                break;
            case '2':
                that.beginDate = date.Format("yyyy.MM.dd").slice(0, -2) + '01';
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                date.setFullYear(year, month, 1);
                date.setDate(0);
                that.endDate = date.Format("yyyy.MM.dd");
                break;
            default:
                break;
        }
    },
    requestData: function() {
        var that = this;
        that.currentRequestId = Math.floor(Math.random() * (100000 + 1));
        var sUrl = that.isPersonal ? 'personalStatistical' : 'enterpriseStatistical/v1';
        var partURL = "cloudlink-inspection-analysis/" + sUrl + "/getList";
        var queryObj = {
            beginDate: that.beginDate.split('.').join('-'),
            /*(开始日期)*/
            endDate: that.endDate.split('.').join('-'),
            /*(结束日期)*/
            type: that.isDistance ? 'distance' : 'event',
            /*(统计类型: 里程: distance, 事件数量: event)*/
        };
        if (!that.isPersonal /*&& that.aUsers.length !== 0*/ ) {
            queryObj.userIds = that.aUsers;
        }
        baseOperation.londingToast('数据请求中', 300000);
        jasHttpRequest.jasHttpPostWithRequestID(that.currentRequestId, partURL, function(id, state, dbSource) {
            if (id !== that.currentRequestId) {
                //baseOperation.alertToast('哈哈，被發現了，call me');
                return;
            }
            if (dbSource == "") {
                baseOperation.alertToast('网络繁忙，请稍后再试', 3000);
                return;
            }
            //baseOperation.closeToast();
            var reObj = JSON.parse(dbSource);
            if (reObj.success == 1) {
                var aDataX = [];
                var aDataY = [];
                var max = 0;
                if (reObj.rows.length === 0) {
                    if (that.isPersonal) {
                        aDataX = [0];
                        aDataY = ['暂无'];
                    } else {
                        aDataX = [0];
                        aDataY = ['暂无'];
                    }
                } else {
                    reObj.rows.forEach(function(val, ind, arr) {
                        aDataX.push(val.qtty);
                        aDataY.push(val.item);
                        max += val.qtty;
                    });
                }
                max = that.isDistance ? max.toFixed(2) : max;
                if (aDataY[0] === '其它' && aDataY.length === 1 && aDataX[0] === 0) {
                    aDataY = ['暂无'];
                }
                that.renderChartTitle(max, reObj.rows.length);
                if (!that.isPersonal) {
                    aDataY = aDataY.map(function(value, index) {
                        var length = 0;
                        var nIndex = -1;
                        if (value.length < 4) {
                            return value;
                        }
                        for (var i = 0; i < value.length; i++) {
                            length++;
                            if (/[\u4e00-\u9fa5]/.test(value[i])) {
                                length++;
                            }
                            if (length > 6) {
                                return value.slice(0, i) + '..';
                            }
                        }
                        return value;
                    });
                }
                that.chart_draw(aDataX, aDataY);

                //baseOperation.alertToast('当前巡检点个数为' + reObj.rows.length);

            } else {
                baseOperation.alertToast('网络异常，请稍后再试', 3000);
            }
        }, JSON.stringify(queryObj));
    },
    chart_init: function() {
        var that = this;
        that.myChart = echarts.init($('#chartBox')[0]);
    },
    chart_showLoading: function() {
        var that = this;
        that.myChart.resize({
            height: 10 * em
        });
        that.myChart.showLoading({
            text: 'loading',
            color: '#59b5fc',
            textColor: '#666',
            maskColor: 'rgba(255, 255, 255, 1)',
            zlevel: 0
        });
    },
    chart_draw: function(aDataX, aDataY) {

        var that = this;
        //that.myChart.hideLoading();

        /*
         * 
         *  
         */
        $('#chartBox').css('height', (aDataY.length * 2 + 2) + 'em');
        that.myChart.resize({
            height: (aDataY.length * 2 + 2) * em
        });
        
            baseOperation.closeToast();

            loaded(); //每次重新定义大小后，重置iscroll
            // 基于准备好的dom，初始化echarts实例
            // 指定图表的配置项和数据
            var option = {
                backgroundColor: '#fff',
                animation: false,
                grid: {
                    left: 2.82 * em,
                    right: 1.5 * em,
                    top: 1.5 * em,
                    bottom: 0.5 * em,
                    containLabel: false
                },
                xAxis: {
                    type: 'value',
                    position: 'top',
                    minInterval: undefined,
                    min: undefined,
                    max: undefined,
                    boundaryGap: [0, '20%'],
                    splitNumber: 5,
                    axisLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                        show: true,
                        interval: 'auto',
                        lineStyle: {
                            color: ['#999'],
                            width: 1,
                            type: 'dashed',
                        }
                    },
                    axisLabel: {
                        show: true,
                        interval: 'auto',
                        inside: false,
                        rotate: 0,
                        margin: 8,
                        formatter: null,
                        textStyle: {
                            color: '#999',
                            fontStyle: 'normal',
                            fontWeight: 'normal',
                            fontFamily: 'sans-serif',
                            fontSize: 0.625 * em,
                        },
                    }
                },
                yAxis: {
                    type: 'category',
                    inverse: true,
                    boundaryGap: true,
                    axisLine: {
                        show: true,
                        onZero: true,
                        lineStyle: {
                            color: '#999',
                            width: 1,
                            type: 'solid'
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: true,
                        interval: 'auto',
                        inside: false,
                        rotate: 0,
                        margin: 8,
                        formatter: null,
                        textStyle: {
                            color: '#999',
                            fontStyle: 'normal',
                            fontWeight: 'normal',
                            fontFamily: 'sans-serif',
                            fontSize: 0.625 * em,
                        },
                    },
                    data: aDataY
                },
                series: [{
                    name: '2011年',
                    type: 'bar',
                    legendHoverLink: false,
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            textStyle: {
                                color: '#666',
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                                fontFamily: 'sans-serif',
                                fontSize: 0.625 * em,
                            }
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#59b5fc'
                        },

                    },
                    barMaxWidth: 0.875 * em,
                    /*barGap: '135%',*/
                    data: aDataX
                }],
                tooltip: {
                    show: false,
                    showContent: false,
                    triggerOn: 'none'
                }
            };
            if (!that.isDistance) {
                var max = Math.max.apply(null, aDataX);
                option.xAxis.max = max < 5 ? 5 : undefined;
                option.xAxis.min = 0;
                option.xAxis.minInterval = 1;
            }

            // 使用刚指定的配置项和数据显示图表。
            that.myChart.setOption(option);
    }
};


var jasHttpRequest = null;
var em = currentFontSize(document.getElementById('content'));

//IScroll,解决移动端溢出滑动问题
var myScroll;

function loaded() {
    if (myScroll) {
        myScroll.destroy();
    }
    myScroll = new IScroll('#content', {
        scrollbars: true,
        mouseWheel: true,
        interactiveScrollbars: true,
        shrinkScrollbars: 'scale',
        fadeScrollbars: true
    });
}
document.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, false);

//statistics.init();

appcan.ready(function() {
    jasHttpRequest = new JasHttpRequest();
    statistics.init();
});
