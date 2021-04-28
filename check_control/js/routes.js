/*var data =  [
	{
	  "distance": 0,
	  "name": "RC20161107183413",
	  "inspectorId": "fad7f56b-84b1-4c5a-a203-165218a2d790",
	  "beginTime": 1478514853953,
	  "endTime": 1478514892268,
	  "wholeTime": "00:00:38",
	  "objectId": "1e55f0b6-4d60-499a-8284-dbd5ad4610b4",
	  "inspectorName": "高峰",
	  "orgId": "74fe453d-6321-4bca-8b2f-81064403b120"
	},
	{
	  "distance": 0,
	  "name": "RC20161108115042",
	  "inspectorId": "fad7f56b-84b1-4c5a-a203-165218a2d790",
	  "beginTime": 1478577042900,
	  "endTime": 1478577048710,
	  "wholeTime": "00:00:04",
	  "objectId": "2028a7ee-1c03-468c-afb7-39ece12dcb38",
	  "inspectorName": "高峰",
	  "orgId": "74fe453d-6321-4bca-8b2f-81064403b120"
	},
	{
	  "distance": 0,
	  "name": "RC2016110718413",
	  "inspectorId": "fad7f56b-84b1-4c5a-a203-165218a2d790",
	  "beginTime": 1478514853953,
	  "endTime": 1478514892268,
	  "wholeTime": "00:00:38",
	  "objectId": "1e55f0b6-4d60-499a-8284-dbd5ad4610b4",
	  "inspectorName": "高峰",
	  "orgId": "74fe453d-6321-4bca-8b2f-81064403b120"
	},
	{
	  "distance": 0,
	  "name": "RC20161108113426",
	  "inspectorId": "fad7f56b-84b1-4c5a-a203-165218a2d790",
	  "beginTime": 1478577042900,
	  "endTime": 1478577048710,
	  "wholeTime": "00:00:04",
	  "objectId": "2028a7ee-1c03-468c-afb7-39ece12dcb38",
	  "inspectorName": "高峰",
	  "orgId": "74fe453d-6321-4bca-8b2f-81064403b120"
	},
	{
	  "distance": 0,
	  "name": "RC20161107184564",
	  "inspectorId": "fad7f56b-84b1-4c5a-a203-165218a2d790",
	  "beginTime": 1478514853953,
	  "endTime": 1478514892268,
	  "wholeTime": "00:00:38",
	  "objectId": "1e55f0b6-4d60-499a-8284-dbd5ad4610b4",
	  "inspectorName": "高峰",
	  "orgId": "74fe453d-6321-4bca-8b2f-81064403b120"
	},
	{
	  "distance": 0,
	  "name": "RC20161108113566",
	  "inspectorId": "fad7f56b-84b1-4c5a-a203-165218a2d790",
	  "beginTime": 1478577042900,
	  "endTime": 1478577048710,
	  "wholeTime": "00:00:04",
	  "objectId": "2028a7ee-1c03-468c-afb7-39ece12dcb38",
	  "inspectorName": "高峰",
	  "orgId": "74fe453d-6321-4bca-8b2f-81064403b120"
	},
	{
	  "distance": 0,
	  "name": "RC20161107184566",
	  "inspectorId": "fad7f56b-84b1-4c5a-a203-165218a2d790",
	  "beginTime": 1478514853953,
	  "endTime": 1478514892268,
	  "wholeTime": "00:00:38",
	  "objectId": "1e55f0b6-4d60-499a-8284-dbd5ad4610b4",
	  "inspectorName": "高峰",
	  "orgId": "74fe453d-6321-4bca-8b2f-81064403b120"
	},
	{
	  "distance": 0,
	  "name": "RC201611081123456",
	  "inspectorId": "fad7f56b-84b1-4c5a-a203-165218a2d790",
	  "beginTime": 1478577042900,
	  "endTime": 1478577048710,
	  "wholeTime": "00:00:04",
	  "objectId": "2028a7ee-1c03-468c-afb7-39ece12dcb38",
	  "inspectorName": "高峰",
	  "orgId": "74fe453d-6321-4bca-8b2f-81064403b120"
	}            
];*/

var routesList = { //已经加入的
	userObj : null,
	aRoutes : null,
	totalElements : 0,
	pageNum : 1,
	pageSize : 10,
	listview: null, 
	flag : '', 
	listParams: {
		selector: '#routesList',
		type: "thinLine",
		hasIcon: false,
		hasAngle: true,
		hasSubTitle: true,
		multiLine: 3,
	},
	init: function() {
		this.userObj = JSON.parse(appcan.locStorage.getVal('currentUser'));

		this.requestData();
		this.listview = appcan.listview(this.listParams);
		this.bindEvent();
	},
	setListview : function(aRoutes,flag){
		$('#mask').addClass('uhide');
		
		if (!aRoutes) {
			return;
		}
		var aData = aRoutes.map(function(val,index,arr){
			var s = val.name;
			var _r  = "0.00Km";
			if(val.distance != null && val.distance != undefined){
			    _r = (val.distance/1000).toFixed(2) + 'Km';
			}
			return {
				title : '<div style="float:left;text-align:left">'+val.beginTime+'<br/>'+val.endTime+'</div>',
				subTitle:'<div style="float:right;text-align:right;margin-right:5px">'+'巡检时长：'+val.wholeTime+'<br/>'+'巡检里程：'+ _r+'</div>',
				inspRecordId : val.objectId,
				beginTime : val.beginTime,
				endTime : val.endTime,
				distance : val.distance,
				wholeTime : val.wholeTime,
				eventCount : val.eventCount,
				facilityRecordCount : val.facilityRecordCount
			};
		});
		if (!this.aRoutes || flag === 'search') {
			this.listview.set(aData);
			return;	
		}
		this.listview.add(aData,1);
	},
	filterRoutesArr : function(str){
		var arr = this.aRoutes.filter(function(item){
			return item.name.indexOf(str) !== -1;
		});
		if (arr.length === 0) {
			baseOperation.alertToast('没有匹配到相关数据');
			return;
		}
		return arr;
		//alert(JSON.stringify(s));
	},
	requestData : function(){
		var that = this;
		var partURL = "cloudlink-inspection-event/inspectionRecord/getRecordPageListByUserId";
		var queryObj = {
			inspectorId : this.userObj.userId,
			pageNum : that.pageNum + '',
			pageSize : that.pageSize + ''
		};
		baseOperation.londingToast('数据请求中，请稍后...',99999);
		jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
			if (dbSource === "") {
				baseOperation.alertToast('网关异常');
				//that.requestData();
				return;
			}
			baseOperation.closeToast();
			var reObj = JSON.parse(dbSource);
			if (reObj.success == 1) {
				that.totalElements = parseInt(reObj.totalElements);
				//baseOperation.alertToast('巡检记录个数：'+that.totalElements);

				that.setListview(reObj.rows);
				that.flag = '';
				if (!that.aRoutes) {
					that.aRoutes = reObj.rows;
				}else{
					that.aRoutes = that.aRoutes.concat(reObj.rows);
				}
			}else{
				baseOperation.alertToast('网络繁忙，请稍后再试');
			}
		}, JSON.stringify(queryObj));
	}, 
	requestDataForSearch : function(str){
		var that = this;
		var partURL = "cloudlink-inspection-event/inspectionRecord/getRecordPageListByUserId";
		var queryObj = {
			inspectorId : this.userObj.userId,
			name : str
		};
		baseOperation.londingToast('数据请求中，请稍后...');
		jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
			if (dbSource === "") {
				baseOperation.alertToast('网关异常');
				that.requestData();
				return;
			}
			baseOperation.closeToast();
			var reObj = JSON.parse(dbSource);
			if (reObj.success == 1) {
				that.totalElements = parseInt(reObj.totalElements);
				//baseOperation.alertToast('匹配到：'+that.totalElements +'条数据');
				
				if (reObj.rows.length === 0) {
					$('#mask').removeClass('uhide');
					$('#routesList').html('');
					return;
				}
				that.setListview(reObj.rows,'search');
				that.flag = 'search';

			}else{
				baseOperation.alertToast('网络繁忙，请稍后再试');
			}
		}, JSON.stringify(queryObj));		
	},
	requestDataForSearchNone:function(){
	    this.pageNum = 1;
	    this.pageSize = 10;
	    this.flag = '';
	    $('#routesList').html('');
	    this.requestData();
	},
	bindEvent: function() {
		var that = this;
		setBounce('',function(){
			if (that.flag === '') {
				if (that.totalElements > that.pageNum * that.pageSize) {
					++that.pageNum;
					that.requestData();		
					return;		
				}				
			}
			baseOperation.alertToast('没有更多数据了！');
		});

		this.listview.on("click", function(ele, obj, curEle) {
			//alert(obj.objId);
			appcan.locStorage.setVal('currentRouteObj',obj);
			appcan.openWinWithUrl('route_map','route_map.html');
		});
	}
};


/*appcan.ready(function(){
	routesList.init();
});*/
