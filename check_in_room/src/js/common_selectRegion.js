/*
 ** 选择片区、小区级联
 ** 依赖 appcan select 控件，html代码片段
 ** 使用：  regionSelectObj.init({
                 planId : 'qwedasd123',
                 regionSelector : '#regionSelector', 必填
                 communitySelector : '#communitySelector', 必填
                 cbCommunitySelected : function(sRegionId,sCommunityId){ 必填，选择片区或者小区后的回调函数，入参片区id，小区id
                 alert('sRegionId:' + sRegionId + '\n' + 'sCommunityId:' + sCommunityId);
                 }
             });
 ** 模板：  // <div id="regionSelector" class="select clr333 ">
 //     <div class="text ulev30 downIcon" style="padding: 0 .8em 0 .5em;">
 //         全部片区
 //     </div>
 //     <select selectedindex="0">
 //     </select>
 // </div>

 // .downIcon:after{
 //     content:'\f0dd';
 //     font : normal normal normal 14px/1 FontAwesome;
 //     position: absolute;
 //     font-size: 0.75em !important;
 //     top: .8em;
 //     right: 0;
 // }
 */

(function(window, $, appcan, baseOperation, JasHttpRequest) {

    var obj = {

        sRegionId : '',
        sCommunityId : '',
        init : function(obj) {


            this.initObjParams(obj);
            this.initAppcanParams();
            this.requestRegion();

            this.renderRegion();
            this.renderCommunity();
            this.bindEvent();

        },
        initAppcanParams : function() {
            this.jasHttpRequest = new JasHttpRequest();
        },
        initObjParams : function(obj) {
            var _obj = {
                planId : null,
                regionSelector : '#regionSelector',
                communitySelector : '#communitySelector',
                cbRegionSelected : null,
                cbCommunitySelected : null,
            };
            $.extend(_obj, obj, true);
            $.extend(this, _obj);

            this.regionDom = $(_obj.regionSelector);
            this.communityDom = $(_obj.communitySelector);

        },
        bindEvent : function() {
            var that = this;
            appcan.select(that.regionSelector, function(ele, value) {

                that.sRegionId = value;
                that.renderCommunity();

                that.communityDom.find('select').val('').trigger('change');
                //if (value) {
                    //alert(value)
                    that.requestCommunity(value);
                //}
                if ($.isFunction(that.cbRegionSelected)) { //可以注释，为了防止其他错误，暂不处理，可以不传入此参数
                    that.cbRegionSelected(value);
                }
            });
            appcan.select(that.communitySelector, function(ele, value) {
                that.sCommunityId = value;
                if ($.isFunction(that.cbCommunitySelected)) {
                    that.cbCommunitySelected(that.sRegionId, that.sCommunityId);
                }
            });
        },
        renderRegion : function(aData) {
            var that = this;
            that.regionDom.find('select').html("");
            var s = ' <option value="">全部片区</option>';
            var arr = aData || [];
            //alert(JSON.stringify(aData))
            arr.forEach(function(item, index, arr) {

                s += '<option value="' + item.objectId + '">' + item.regionName + '</option>';
            });
            s += '<option value="none">无片区</option>';
            that.regionDom.find('select').html(s);
        },
        renderCommunity : function(aCommunity, isAfterRequest) {
            var that = this;
            var s = ' <option value="">全部小区/院/村</option>';
            var arr = aCommunity || [];
            arr.forEach(function(item, index, arr) {
                s += '<option value="' + item.residential + '">' + item.residential + '</option>';
            });
            that.communityDom.find('select').html(s);
        },
        requestRegion : function() {
            var that = this;
            var params = {
                planId : that.planId,
                pageNum : 1,
                pageSize : 1000,
            };
            var url = "cloudlink-inspection-event/commonData/region/getPageList";
            that.jasHttpRequest.jasHttpPost(url, function(id, status, dbSource) {

                if (dbSource == "") {
                    baseOperation.alertToast("网络繁忙，请稍候尝试");
                    return;
                }

                var result = JSON.parse(dbSource);
                if (result.success == 1) {
                    that.renderRegion(result.rows);
                    that.requestCommunity('');
                }
            }, JSON.stringify(params));
            //获取该企业下面的所有片区
        },
        requestCommunity : function(sRegionId,fn) {//根据片区编号查找该先去下面的所有小区
            var that = this;
            var param = {
                "regionId" : sRegionId,
                "planId" : that.planId,
                "pageNum" : 1,
                "pageSize" : 10000
            };
            var url = 'cloudlink-inspection-event/commonData/residentialName/getPageList';
            that.jasHttpRequest.jasHttpPost(url, function(id, status, dbSource) {
                if (dbSource == "") {
                    baseOperation.alertToast("网络繁忙，请稍候再试");
                    return;
                }
                //alert(dbSource)
                var aData = JSON.parse(dbSource);
                if (aData.success == 1) {//room查找小区
                    that.renderCommunity(aData.rows);
                    fn && fn();
                    // that.isInited && appcan.trigger('communityRendered');
                    // that.isInited = true;

                }
            }, JSON.stringify(param));

        },
    };

    window.regionSelectObj = obj;

})(window, Zepto, appcan, baseOperation, JasHttpRequest);

var aData = [{
    objectId : 'asdasdasd',
    regionName : '市东区市东区市东区市东区市东区市东区市东区市东区市东区市东区市东区市东区',
}, {
    objectId : 'asdasdasda',
    regionName : '市西区',
}, {
    objectId : 'asdasd asds',
    regionName : '市南区',
}];
var aCommunity = [{
    "residential" : "志新小区志新小区志新小区", //小区/院/村
}, {
    "residential" : "解放小区", //小区/院/村
}, {
    "residential" : "东风小区", //小区/院/村
}];

