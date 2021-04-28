appcan.ready(function() {
        recordList.init();
});

(function(appcan, window, $, baseOperation, JasHttpRequest, refreshBounce,createTemplateByObj,creatNumTip) {
    var jasHttpRequest = new JasHttpRequest();
    var recordList = {
        planId : '',
        regionId : '', //片区
        residential : '', //小区      
        hasHiddenDanger : '',  
        isLocal: false,
        pageNum: 1,
        pageSize: 10,
        keyWords : '',
        elem: {
            list_wrapper: '#list_wrapper',
        },
        initElem: function() {
            var eles = this.elem;
            for (var name in eles) {
                if (eles.hasOwnProperty(name)) {
                    this[name] = $(eles[name]);
                }
            }
        },
        initParams: function() {
            this.planId = appcan.locStorage.val('planId');
        },
        init: function() {
            this.initElem();
            this.initParams();
            this.bindEvent();
            this.requestListData();
            this.setBounce();
        },
        bindEvent: function() {
            var that = this;
            $('body').on('click', 'ul li', function(e) {
                var t = e.target;
                if ($(t).hasClass('js_check')) {
                    //alert('点击复选框');
                    return;
                }
                var recordId = this.dataset.id;
                appcan.locStorage.val('recordId',recordId);
                var isdanger = this.dataset.isdanger;
                appcan.locStorage.val('isdanger',isdanger);
                //alert(isdanger);
                //alert(typeof this.dataset.success)
                var recordResult = this.dataset.success;
                var sUrl = recordResult==='true'? 'success':'fail';
                appcan.openWinWithUrl('record_detail', '../detail/record_detail_'+ sUrl +'.html');
            });
        },
        triggerSearch : function(s){
            var that = this;
            that.pageNum = 1;
            that.keyWords = s;
            that.requestListData();            
        },
        triggerTypeSearch : function(s){
            var that = this;
            that.pageNum = 1;
            that.enterhomeUserTypeCode = s;
            that.requestListData();            
        },     
        triggerAddressSearch : function(regionId,residential){
            var that = this;
            that.pageNum = 1;            
            that.regionId = regionId; //片区
            that.residential = residential; //小区
            that.requestListData();               
        },
        triggerResultSearch : function(s){
            var that = this;
            that.pageNum = 1;
            that.hasHiddenDanger = '';
            that.enterhomeSituationTypeCode = s;
            if(s === 'EHS_004'){
                that.hasHiddenDanger = '1';
                that.enterhomeSituationTypeCode = 'EHS_001';                
            }
            that.requestListData();            
        },             
        setBounce: function() {
            refreshBounce(function() {
                recordList.pageNum = 1;
                recordList.requestListData();
            }, function() {
                recordList.pageNum++;
                recordList.requestListData();
            });
        },
        requestListData: function() {
            var that = this;

             // that.renderItemCount(aData.length,100);
             // this.render(aData);
             // return;
            var partURL = "cloudlink-inspection-event/commonData/securityCheckRecord/getPageList";
            //var partURL = "cloudlink-inspection-event-llk/commonData/securityCheckRecord/getPageList";
            appcan.window.evaluateScript('record','wrapperObj.setInputVal("'+that.keyWords+'")');
            var queryObj = {
                //"startDate": "", //开始时间 2016-10-01 00:00
                //"endDate": "", //结束时间 
                "planId": that.planId, // 巡检计划
                "regionId" : that.regionId, //片区
                "residential" : that.residential, //小区
                "keywordApp": that.keyWords, //计划名称模糊查询
                "enterhomeSituationTypeCode": that.enterhomeSituationTypeCode, // 入户情况
                "enterhomeUserTypeCode": that.enterhomeUserTypeCode, // 用户类型
                "pageNum": that.pageNum ,
                "pageSize": that.pageSize,
                "hasHiddenDanger" : that.hasHiddenDanger, 
            };
            //uexLog.sendLog(queryObj.planId);
            //alert(JSON.stringify(queryObj));
            //alert(JSON.stringify(queryObj))
            baseOperation.londingToast('数据请求中，请稍后...', 99999);
            jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
                // alert(dbSource)
                //alert(dbSource);
                if (dbSource === "") {
                    baseOperation.alertToast('网络繁忙，请稍后再试');
                    //that.requestData();
                    return;
                }
                baseOperation.closeToast();
                var reObj = JSON.parse(dbSource);
                if (reObj.success == 1) {
                    var aData = reObj.rows;
                    if(aData.length > 0){
                        that.renderItemCount(aData.length,reObj.total);
                        that.render(aData);
                    }else{
                        if (that.pageNum === 1) {
                            that.list_wrapper.html('<div class="ub ub-pc uinn ulev30 clr666">暂无数据</div>');
                        }
                        baseOperation.alertToast('暂无数据');
                        that.renderItemCount(aData.length,reObj.total);
                    }                    

                } else {
                    baseOperation.alertToast('网络繁忙，请稍后再试');
                }
            }, JSON.stringify(queryObj));
        },
        render: function(aObj) {
            var that = this;
            var s = '';

            aObj.forEach(function(item, index, arr) {
                item.enterhomeAddress = item.address;
                item.enterhomeUserName = item.userFileName;

                s += createTemplateByObj(item);
            });
            if (that.pageNum === 1) {
                that.list_wrapper.html(s);
            } else {
                that.list_wrapper.append(s);
            }
        },
        renderItemCount : function(nNow,nTotal){
            var that = this;
            if( that.pageNum === 1 ){
                creatNumTip(nNow,nTotal);
            }else{
                creatNumTip(nNow,nTotal,true);
            }
        },


    };
    window.recordList = recordList;
})(appcan, window, Zepto, baseOperation, JasHttpRequest, refreshBounce,createTemplateByObj,creatNumTip);

