var jasHttpRequest = null;

var controlObj = {
    aDepartmentUserList:null,//部门及部门以下所有用户
    aDataList: null, //当日存在巡检记录的人员
    
    indexOfCurPeo: null, //当前显示的巡检员序号
    loadingTimer: null,
    
    searchBtnDom: $('#search'),
    searchWrapDom: $('.searchWrap'),
    inputDom: $('#inputDom'),
    returnSearchDom: $('#returnSearch'),
    resultBoxDom: $('#result'),
    prevBtn: $('#prev'),
    nextBtn: $('#next'),
    switchBtn: $('.switchBtn'),

    allPeo : $('#allPeo'),
    doingPeo : $('#doingPeo'),
    photoDom: $('#photo'),
    nameDom: $('#userName'),
    deptDom: $('#dept'),
    telDom: $('#tel'),
    routeDom: $('#history'),
    detailDom: $('#detail'),
    loadingDom: $('#loadingMask'),

    init: function() {
        var that = this; //正常模块
        //that.requestData();
        try {
            uexWidgetOne.cbError = function(opCode, errorCode, errorInfo) { //错误异常执行回调
                alert("errorCode:" + errorCode + "\nerrorInfo:" + errorInfo);
            };
            uexBaiduMap.cbOpen = function() {
                pipeLinesObj.loadLines();
                //that.requestData();
            };
            that.bindMapEvent();
            that.loadMap();
        } catch (e) {
            pipeLinesObj.loadLines()
            //that.requestData();
        }
        that.bindInitEvent();
        that.bindSwitchEvent();
    },
    requestData: function() {
        var that = this;
        var partURL = "cloudlink-inspection-event/inspectionMonitor/getTodayList";
        baseOperation.londingToast('数据请求中，请稍后...',99999);        
        jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
            if (dbSource == "") {
                baseOperation.alertToast('网关异常');
                //that.requestData();
                return;
            }
            baseOperation.closeToast();
            var reObj = JSON.parse(dbSource);
            if (reObj.success != 1) {
                baseOperation.alertToast('网络请求失败');
                that.loadingDom.css('z-index', '-1');
                return;
            }
            if (reObj.success == 1) {
                that.aDepartmentUserList = reObj.rows;
                var trueArr = reObj.rows.filter(function(item){
                    return  item.isOnline>-1 && +item.bdLon>0;
                });
                that.aDataList = trueArr;  
                that.renderPeopleQtty();
                appcan.locStorage.setVal('peopleList', that.aDepartmentUserList);
                
                if (trueArr.length === 0 || !trueArr) {
                    baseOperation.alertToast('今日暂无巡检记录，请返回...', 99999);
                    that.loadingDom.css('z-index', '-1');
                    return;
                }
                
                trueArr.forEach(function(val, ind, arr) { //遍历人员数组
                    try {
                        uexBaiduMap.removeMakersOverlay('['+ val.inspectorId +']');
                        that.markPerson(val.inspectorId, val.bdLon, val.bdLat, val.isOnline, val.inspectorName); //标记人员位置
                    } catch (e) {}  
                    if(that.curPeopleId){
                        if(that.curPeopleId === val.inspectorId){
                            that.indexOfCurPeo = ind;                            
                            that.handleThePerson(val); 
                        }
                        return;
                    }
                    if (ind === 0) {
                        that.indexOfCurPeo = ind; 
                        try{
                            uexBaiduMap.setZoomLevel(12);
                        }catch(e){}
                        that.handleThePerson(val);                                             
                    }
                });            
            }
        }, JSON.stringify({}));
    },
    render: function(obj) { //渲染人员信息
        //alert(JSON.stringify(obj));
        var that = this;
        this.photoDom.prop("src", '../images/male_head.png');
        if (obj.sex === '女') {
            that.photoDom.prop('src', '../images/female_head.png');
        }
        if (obj.picId) {
            var src = serverURL + "cloudlink-core-file/file/getImageBySize?fileId=" + obj.picId + "&viewModel=fill&width=500&hight=500";
            that.photoDom.prop('src', src);
        }
        if (obj.inspectorName) {
            this.nameDom.html(obj.inspectorName);
            this.nameDom[0].dataset.inspectorId = obj.inspectorId;
        }
        if (obj.orgName) {
            this.deptDom.html(obj.orgName);
        } //数据模拟 部门信息
        if (obj.mobileNum) {
            this.telDom.html(obj.mobileNum);
        }
        var s = '';
        if (parseInt(obj.isOnline) === 0) {
            s = this.sHtmlOffline(obj.beginTime,obj.endTime);
        } else {
            s = this.sHtmlOnline(obj.distance, obj.duration, obj.eventCount,obj.facilityRecordCount);
        }
        this.detailDom.html(s);
    },
    renderPeopleQtty : function(){
        this.allPeo.html(this.aDepartmentUserList.length || 0);
        this.doingPeo.html(this.aDataList.length || 0);
    },
    loadMap: function() { //加载地图
        var that = this;
        var titHeight = $('#content').offset().top;
        var cHeight = $('#content').offset().height;
        var cWidth = $('#content').offset().width;
        if (window.uexBaiduMap) {
            uexBaiduMap.open(0, titHeight, cWidth, cHeight, "116.309", "39.977"); //初始化百度地图
        }
    },
    sHtmlOffline: function(onlineTime,offlineTime) { //离线模板
        return '<div class="ub ub-f1 ub-ver ub-ac">' +
            '<div class="ub-f1 ulev26px clr666 ub ub-ac" style="margin:.5em 0;">最后巡检时间</div>' +
            '<div class="ub-f1 ulev26px ub ub-ac"><span class="clr666">始&nbsp;&nbsp;&nbsp;&nbsp;</span>' + onlineTime + ' </div>' +
            '<div class="" style="padding:0;margin:0;font-size:40px;line-height:0px;height:0px;width:7.2em;border-bottom:1px solid #eee;"></div>' +
            '<div class="ub-f1 ulev26px ub ub-ac"><span class="clr666">终&nbsp;&nbsp;&nbsp;&nbsp;</span>' + offlineTime + '</div>' +
            '</div>';
    },
    sHtmlOnline: function(dist, duar, qtty,qtty2) { //在线模板
        return '<div class="ub ub-ver ub-ac ub-f1 umartb">' +
            '<div class="ub-f1 ub ub-ac "><span class="ulev26px clr666">巡检里程</span></div>' +
            '<div id="distance" class="ub-f1 ub ub-ac  ulev32px">' + dist + 'm</div>' +
            '</div>' +
            '<div class="ub ub-ver ub-ac ub-f1 umartb">' +
            '<div class="ub-f1 ub ub-ac "><span class="ulev26px clr666">巡检时长</span></div>' +
            '<div id="duration" class="ub-f1 ub ub-ac  ulev32px">' + duar + '</div>' +
            '</div>' +
            '<div class="ub ub-ver ub-ac ub-f1 umartb">' +
            '<div class="ub-f1 ub ub-ac "><span class="ulev26 clr666">事件数量</span></div>' +
            '<div id="quantity" class="ub-f1 ub ub-ac  ulev28">' + qtty + '</div>' +
            '</div>'+
            '<div class="ub ub-ver ub-ac ub-f1 umartb">' +            
            '<div class="ub-f1 ub ub-ac "><span class="ulev26 clr666">设施检查</span></div>' +
            '<div id="facilityQuantity" class="ub-f1 ub ub-ac  ulev28">' + qtty2 + '</div>' +
            '</div>';
    },
    bindInitEvent: function() {
        var that = this;
        /*
         *历史轨迹
         */
        this.routeDom.tap(function() {
            appcan.locStorage.setVal('currentUser', {
                userId: that.nameDom[0].dataset.inspectorId,
                userName: that.nameDom.html(),
                userDept: that.deptDom.html(),
                userHead: that.photoDom[0].src
            });
            
            appcan.locStorage.setVal('HistoryRecordFormMap',true);

            /*
             * 诸葛埋点，记录点击各个模块的频率
             */
            if (tjSwitch == 1) {
                try {
                    var zg_param = {
                        eventName: "查看历史轨迹",
                        info: {}
                    };
                    uexTianji.track(zg_param);
                    appcan.openWinWithUrl('routes', 'routes.html'); //继续跳转到目标页面                          
                } catch (e) {
                    appcan.openWinWithUrl('routes', 'routes.html'); //继续跳转到目标页面
                }
            } else {
                appcan.openWinWithUrl('routes', 'routes.html'); //继续跳转到目标页面
            }
        });
        /*
         * 搜索
         */
        that.searchBtnDom.tap(function() {
            baseOperation.closeToast();
            var s = that.inputDom.val();
            if (s === '') {
                baseOperation.alertToast('请输入搜索条件');
                return;
            }
            that.searchPerson(s);

        });
        /*
         * 拨打电话
         */
        that.telDom.parent().tap(function() {
            var tel = that.telDom.html();
            if (tel.length === 11) {
                uexCall.dial(tel);
            }
        });
        /*
         * 返回搜索
         */
        that.returnSearchDom.tap(function() {
            that.searchWrapDom.removeClass('left100');
        });

        appcan.button("#nav-left", "btn-act", function() {
            that.closeWin(-1);
        });

        //进入人员列表
        appcan.button("#nav-right .icon-disk", "btn-act", function() {
            //that.closeWin(14,100);
            appcan.openWinWithUrl('people_list', 'people_list.html');
        }); 

        //刷新地图
        appcan.button("#nav-right .icon-reload", "btn-act", function() {
            //that.closeWin(14,100);
            that.requestData();
        });         
    },
    bindPrevNextEvent: function() {
        var that = this;
        that.prevBtn.unbind('tap');
        that.nextBtn.unbind('tap');
        if (that.resultBoxDom.children().length > 2) {
            that.prevBtn.bind('tap', function() {
                that.resultBoxDom.append(that.resultBoxDom.children().first());
            });
            that.nextBtn.bind('tap', function() {
                that.resultBoxDom.prepend(that.resultBoxDom.children().last());
            });
        }
    },
    bindSwitchEvent: function() {
        var that = this;
        that.switchBtn.click(function() {
            if (that.switchBtn.index(this) === 0) {
                if (that.indexOfCurPeo === 0 ) {
                    baseOperation.alertToast('没有上一个了');
                    return;
                }                
                that.indexOfCurPeo--;                
            }else{
                if (that.indexOfCurPeo === that.aDataList.length - 1) {
                    baseOperation.alertToast('没有下一个了');
                    return;
                }                
                that.indexOfCurPeo++;                 
            }
            var oPerson = that.aDataList[that.indexOfCurPeo];
            that.handleThePerson(oPerson);
        });
    },
    bindMapEvent: function() { //绑定地图点击事件
        var that = this;
        uexBaiduMap.onMarkerClickListener = function(id) {
            that.setIndexByCurPeopleId(id);
            that.handleThePerson(that.aDataList[that.indexOfCurPeo]);
        };
    },
    closeWin: function(nType, time) {
        try {
            uexBaiduMap.close();
        } catch (e) {}
        appcan.window.close(nType, time);
    },
    markPerson: function(id, lon, lat, isOnLine, name) {
        //alert(name);
        var url = (isOnLine != 0 ? "res://online.png" : "res://offline.png");
        var data1 = [{
            id: id,
            longitude: lon,
            latitude: lat,
            icon: url,
            bubble: { //(可选)自定义弹出气泡 
                title: name //(必选)自定义弹出气泡标题
            }
        }];
        var dataStr = JSON.stringify(data1);
        uexBaiduMap.addMarkersOverlay(dataStr);
        //uexBaiduMap.showBubble(id);
    },
    setIndexByCurPeopleId: function(id) { //传入id找到人员对象
        var that = this;
        var arr = that.aDataList;
        var l = arr.length;

        for (var i = 0; i < l; i++) {
            if (arr[i].inspectorId == id) {
                that.indexOfCurPeo = i;                
                return;
            }
        }
    },
    handleThePerson : function(oPerson){ //渲染人员，设置人员中心点，显示气泡,设置当前人员ID
        var that = this;
        that.showLoading(); 
        that.render(oPerson);    
        that.curPeopleId = oPerson.inspectorId;
        try{
            uexBaiduMap.showBubble(oPerson.inspectorId);
            uexBaiduMap.setCenter(oPerson.bdLon, oPerson.bdLat);            
        }catch(e){}
    },
    searchPerson: function(s) {
        var that = this;
        var isNotFocus = true;
        if (that.aDataList) {
            that.resultBoxDom.html('');
            that.aDataList.forEach(function(val, ind, arr) {
                if (val.inspectorName.indexOf(s) !== -1) {
                    var sName = '<div class="nameBox" data-id=' + val.inspectorId + '><span class="ulev26">' + val.inspectorName + '</span></div>';
                    that.resultBoxDom.append(sName);
                    if (isNotFocus) {
                        try {
                            that.setIndexByCurPeopleId(val.inspectorId);
                            that.handleThePerson(that.aDataList[that.indexOfCurPeo]);
                        } catch (e) {}
                        isNotFocus = false;
                    }
                }
            });
        }
        if (isNotFocus) {
            baseOperation.alertToast('未搜索到相关人员');
            return;
        }
        that.searchWrapDom.css('transition','all .5s')
        that.searchWrapDom.addClass('left100');
        that.bindPrevNextEvent();
        that.resultBoxDom.children().tap(function() {
            var id = this.dataset.id;
            that.setIndexByCurPeopleId(id);
            that.handleThePerson(that.aDataList[that.indexOfCurPeo]);            
        });
    },
    showLoading: function() {
        var that = this;
        clearTimeout(that.loadingTimer);
        that.loadingDom.css('z-index', '1');
        that.loadingTimer = setTimeout(function() {
            that.loadingDom.css('z-index', '-1');
        }, 300);
    }
};

var pipeLinesObj = {
    lineIndex:0,
    lineCount:0,
    pipeLinesArray:[],
    isShowPipeLinesFlag:1,
    loadLines: function() {
        var that = this;
        
        if(appcan.locStorage.getVal("pipeLinesData") != null && appcan.locStorage.getVal("pipeLinesData") != undefined && appcan.locStorage.getVal("pipeLinesData") != ""){
            try{
                var lines = JSON.parse(appcan.locStorage.getVal("pipeLinesData"));
                that.pipeLinesArray=lines;
                that.lineCount = lines.length;
                that.drowLines();
                controlObj.requestData();
                return;
            }
            catch(e){
                controlObj.requestData();
                return;
            } 
        }
        
        var partURL1 = "cloudlink-inspection-event/commonData/pipemaplinedetail/getPageList";
        jasHttpRequest.jasHttpPost(partURL1, function(id, state, dbSource) {
            if (state == -1) {
                appcan.locStorage.setVal("pipeLinesData","");
                controlObj.requestData();
                return;
            }
            if (dbSource.length == 0) {
                appcan.locStorage.setVal("pipeLinesData","");
                controlObj.requestData();
                return;
            }
            var lineObjs = JSON.parse(dbSource);
            if (lineObjs.success == 1 && lineObjs.code == "200" && lineObjs.total > 0){
                var lines = lineObjs.rows;
                that.pipeLinesArray=lines;
                that.lineCount = lines.length;
                that.drowLines();
                controlObj.requestData();
                appcan.locStorage.setVal("pipeLinesData",lines);
            }
            else{
                appcan.locStorage.setVal("pipeLinesData","");
                controlObj.requestData();
            }
        },JSON.stringify({"objectIds":[],"pipeNetworkId":'',"pipeNetworkUsed":'1',"pageNum":1,"pageSize":500}));     
    },
    drowLines:function(){
        if(this.pipeLinesArray.length==0){
            return;
        }
        if(this.isShowPipeLinesFlag==0){
            return;
        }
        if(this.lineIndex < this.lineCount){
            var lineObj = this.pipeLinesArray[this.lineIndex];
            
            var linePath = [];
            var _path = lineObj.line;
            for (var i=0; i < _path.length; i++) {
                linePath.push({
                    longitude: _path[i].bdLon,
                    latitude:  _path[i].bdLat,
                });
            };
            
            var lineStype = {
                id:lineObj.objectId,
                fillColor: lineObj.pipeColor,
                lineWidth: lineObj.pipeWeight,
                property: linePath
            };
            
            uexBaiduMap.addPolylineOverlay(lineStype);
            this.lineIndex++;
            this.drowLines();
            
        }
        else{
            this.lineIndex=0;
            this.lineCount=this.pipeLinesArray.length;
        }
    },
    clearPipeLines:function(){
        try{
            if(this.pipeLinesArray.length==0){
                return;
            }
            for (var i=0; i < this.pipeLinesArray.length; i++) {
                var obj = this.pipeLinesArray[i];
                uexBaiduMap.removeOverlay(obj.objectId);
            };
        }
        catch(e){
            
        }
    },
    setPipeLinesOnOrOff:function(){
        try{
            if(this.isShowPipeLinesFlag == 1){//当前状态为 开始状态
                this.isShowPipeLinesFlag = 0;
                $("#pipelineSwitch").html("显示管网");
                this.clearPipeLines();
            }
            else{//当前状态为 关闭状态
                this.isShowPipeLinesFlag = 1;
                $("#pipelineSwitch").html("隐藏管网");
                this.drowLines();
            }
        }
        catch(e){
             //$("#voice_icon_1").addClass("fa-volume-up");
        }
    }
}

//controlObj.init();
appcan.ready(function() {
    jasHttpRequest = new JasHttpRequest();
    appcan.window.evaluateScript({
        name: 'people_list',
        scriptContent: 'appcan.window.close()'
    });

    controlObj.init();
});
