var em = currentFontSize(document.getElementById('content'));
appcan.ready(function() {
    picObj.init();
});
var picObj = {
    jasHttpRequest : new JasHttpRequest(),
    equipmentObj : JSON.parse(appcan.locStorage.val('equipmentSelectedObj')),
    init : function() {
        this.requestData();
    },
    requestData : function() {
        //进行数据的请求，获取到过来的数据进行拼接
        this.initdata();
        //进行表头的初始化
        this.initGasPicData();
        //进行可燃气体浓度的展示
    },
    initdata : function() {
        $(".facility_name").text(this.equipmentObj.facilityName);
        $(".facility_type").text(this.equipmentObj.facilityTypeName);
        $(".address").text(this.equipmentObj.address);
        if (this.equipmentObj.facilityTypeCode == "FT_01") {
            $(".hidpress").css("display", 'block');
        }
    },
    initGasPicData : function() {
        var that = this;
        var parturl = "cloudlink-inspection-event/facilityRecord/getCombustibleGasConcentrationByLimit";
        var paramObj = {
            facilityId : appcan.locStorage.val('facilityId'),
            limit : "7"
        };
        baseOperation.londingToast('数据请求中，请稍后...', 99999);
        that.jasHttpRequest.jasHttpPost(parturl, function(id, state, dbSource) {
            if (+dbSource.length === 0) {
                baseOperation.alertToast("服务异常，请稍后再试...");
                return;
            }
            var obj = JSON.parse(dbSource);
            if (obj.success == 1) {
                if (that.equipmentObj.facilityTypeCode == "FT_01") {
                    that.initPressPicData();
                }
                var aData = obj.rows;
                if (aData.length > 0) {
                    that.renderGasPicData(aData);
                } else {
                    baseOperation.closeToast();
                    var html = "<span style='text-align:center;' class='ulev30 clr333'>暂无数据</span>";
                    $("#gaspic").css("text-align", 'center');
                    $("#gaspic").append(html);
                }
            }
        }, JSON.stringify(paramObj));
    },
    renderGasPicData : function(gasObj) {
        //x ,y 对象数组形式
        var that = this;
        var y = [];
        var x = [];
        var xdesc = [];
        gasObj.forEach(function(item, index, arr) {
            y.push(item.combustibleGasConcentration);
            x.push(item.facilityCheckTime.substring(5, 16));
        });
        x = x.reverse();
        x.forEach(function(item, index, arr) {
            var xobj = {
                value : item,
                textStyle : {
                    fontSize : 0.625 * em
                }
            }
            xdesc.push(xobj);
        });
        that.renderGasPic(xdesc, y.reverse());
    },
    renderGasPic : function(x, y) {
        var mychar = echarts.init(document.getElementById("gaspic"));
        var option = {
            tooltip : {
                show : false,
                trigger : 'axis'
            },
            calculable : true,
            // 网格
            grid : {
                show : true,
                bottom : 4 * em,
            },
            xAxis : [{
                name : '时间',
                nameTextStyle : {
                    color : '#666',
                    fontSize : 0.625 * em,
                },
                type : 'category',
                data : x,
                axisLine : {
                    show : false,
                },
                axisTick : {
                    show : false,
                },
                axisLabel : {
                    rotate : 60,
                    interval : 0,
                }
            }],
            yAxis : [{
                name : '浓度（ppm）',
                nameTextStyle : {
                    color : '#666',
                    fontSize : 0.625 * em,
                },
                type : 'value',
                axisLine : {
                    show : false,
                },
                axisTick : {
                    show : false,
                },
                axisLabel : {
                    textStyle : {
                        fontSize : 0.625 * em,
                    }
                },
            }],
            series : [{
                type : 'bar',
                data : y,
                itemStyle : {
                    normal : {
                        color : '#59b5fc'
                    },
                },
                label : {
                    normal : {
                        show : true,
                        position : 'top',
                        textStyle : {
                            color : '#666',
                            fontSize : 0.625 * em,
                        }
                    }
                },
                barMaxWidth : 0.875 * em,
            }],

        };
        baseOperation.closeToast();
        mychar.setOption(option);
    },
    initPressPicData : function() {
        var that = this;
        var parturl = "cloudlink-inspection-event/facilityRecord/getInOutPressureByByLimit";
        var parampressObj = {
            facilityId : appcan.locStorage.val('facilityId'),
            limit : "7"
        }
        that.jasHttpRequest.jasHttpPost(parturl, function(id, state, dbSource) {
            if (+dbSource.length === 0) {
                baseOperation.alertToast("服务异常，请稍后再试...");
                return;
            }
            var obj = JSON.parse(dbSource);
            if (obj.success == 1) {
                var aData = obj.rows;
                if (aData.length > 0) {
                    that.renderPressPicData(aData);
                } else {
                    baseOperation.closeToast();
                    var html = "<span style='text-align:center;' class='ulev30 clr333'>暂无数据</span>";
                    $("#pressurcpic").css("text-align", 'center');
                    $("#pressurcpic").append(html);
                }
            }
        }, JSON.stringify(parampressObj));
    },
    renderPressPicData : function(pressObj) {
        //x ,y 对象数组形式
        var that = this;
        var y1 = [];
        var y2 = [];
        var x = [];
        var xdesc = [];
        pressObj.forEach(function(item, index, arr) {
            y1.push(item.pressureIn);
            y2.push(item.pressureOut);
            x.push(item.facilityCheckTime.substring(5, 16));
        });
        x = x.reverse();
        x.forEach(function(item, index, arr) {
            var xobj = {
                value : item,
                textStyle : {
                    fontSize : 0.625 * em
                }
            }
            xdesc.push(xobj);
        });
        this.renderPressPic(xdesc, y1.reverse(), y2.reverse());
    },
    renderPressPic : function(x, y1, y2) {
        var presschart = echarts.init(document.getElementById("pressurcpic"));
        var option1 = {
            tooltip : {
                show : false,
                trigger : 'axis'
            },

            legend : {
                data : ['进口压力', '出口压力'],
                right : '10%',
                textStyle : {
                    color : '#333',
                    fontSize : 0.625 * em
                },
                borderColor : '#ccc'
            },
            calculable : true,
            xAxis : [{
                name : '时间',
                nameTextStyle : {
                    color : '#333',
                    fontSize : 0.625 * em,
                },
                type : 'category',
                boundaryGap : false,
                data : x,
                axisLine : {
                    show : false,
                },
                axisTick : {
                    show : false,
                },
                axisLabel : {
                    rotate : 60,
                    interval : 0,
                },
            }],

            // 网格
            grid : {
                show : true,
                bottom : 4 * em,
            },
            yAxis : [{
                name : '压力（kPa）',
                nameTextStyle : {
                    color : '#333',
                    fontSize : 0.625 * em,
                },
                type : 'value',
                axisLine : {
                    show : false,
                },
                axisTick : {
                    show : false,
                },
                axisLabel : {
                    textStyle : {
                        fontSize : 0.625 * em,
                    }
                },

            }],
            series : [{
                name : '进口压力',
                type : 'line',
                data : y1,
                symbol : 'circle',
                symbolSize : 8,
                label : {
                    normal : {
                        show : true,
                        position : 'top',
                        textStyle : {
                            color : '#666',
                            fontSize : 0.625 * em,
                        }
                    }
                },
                itemStyle : {
                    normal : {
                        color : '#f09127',
                    }
                }
            }, {
                name : '出口压力',
                symbolSize : 8,
                type : 'line',
                data : y2,
                symbol : 'circle',
                // color : '#55b2f8',
                label : {
                    normal : {
                        show : true,
                        position : 'top',
                        textStyle : {
                            color : '#666',
                            fontSize : 0.625 * em,
                        }
                    }
                },
                itemStyle : {
                    normal : {
                        color : '#55b2f8',
                        fontSize : 0.625 * em,
                    }
                }

            }],

        };
        baseOperation.closeToast();
        presschart.setOption(option1);
    }
}
appcan.button(".nav-btn", "btn-act", function() {
    appcan.window.close(-1);
}); 