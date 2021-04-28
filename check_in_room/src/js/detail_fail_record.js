// window.onerror = function(msg, url, line) {
//     alert("erro" + msg + "\n" + url + ":" + line);
//     return true;
// };

appcan.ready(function() {
    recordDetailObj.init();
});
//盛放图片的url
var recordDetailObj = {
    elem: {
        security_check_time: '.security_data', //安检时间
        enterhome_situation_type_code: '.home_situation', //入户情况
        remarks: '.remarks', //备注
        historyRecord : '.historyRecord'
    },
    initElem: function() {
        var eles = this.elem;
        for (var name in eles) {
            if (eles.hasOwnProperty(name)) {
                this[name] = $(eles[name]);
            }
        }
    },
    initHttp: function() {
        this.jasHttpRequest = new JasHttpRequest();
    },
    init: function() {
        this.initElem();
        this.initHttp();
        viewPicObj.init(false);
        this.requestDetail();
    },
    //後台請求數據
    requestDetail: function() {
        var that = this;
        var groupId = appcan.locStorage.val('groupId');
        // var partURL = "cloudlink-inspection-event-llk/securityCheckRecord/getHistory?groupId=" + groupId;
        var partURL = "cloudlink-inspection-event/commonData/securityCheckRecordHistory/getList";
        baseOperation.londingToast('数据请求中，请稍后...', 99999);
        try {
            that.jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
                //uexLog.sendLog(dbSource);
                if (dbSource === "") {
                    baseOperation.alertToast('网络繁忙，请稍后再试');
                    return;
                }
                baseOperation.closeToast();
                var reObj = JSON.parse(dbSource);
                if (reObj.success == 1) {
                    var aData = reObj.rows;
                    that.render(aData);
                } else {
                    baseOperation.alertToast('网络繁忙，请稍后再试');
                }
            }, JSON.stringify({
                "groupId": groupId,
                "planId": appcan.locStorage.val("planId")
            }));
        } catch (e) {
            alert(e);
        }
    },
    render: function(aData) {
        var that = this;
        that.historyRecord.html("");
        var historyRecord = "";
        aData.forEach(function(value, index) {
            var _index = aData.length - index;
            historyRecord += templateObj.createRecordHistoryTemplate(value, _index);
        });
        that.historyRecord.append(historyRecord);
    },
};
