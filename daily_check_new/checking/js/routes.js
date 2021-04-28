

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
		this.userObj = JSON.parse(appcan.locStorage.getVal('userBo'));
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
	},
	requestData : function(){
		var that = this;
		var partURL = "cloudlink-inspection-event/inspectionRecord/getRecordPageListByUserId";
		var reg=new RegExp("-","g"); 
		var date=(new Date().Format("yyyy-MM-dd")).replace(reg,"");
		var queryObj = {
			inspectorId : this.userObj.objectId,
			pageNum : that.pageNum + '',
			pageSize : that.pageSize + '',
			name:date
		};
		baseOperation.londingToast('数据请求中，请稍后...',99999);
		jasHttpRequest.jasHttpPost(partURL, function(id, state, dbSource) {
			if (dbSource === "") {
				baseOperation.alertToast('网关异常');
				return;
			}
			baseOperation.closeToast();
			var reObj = JSON.parse(dbSource);
			if (reObj.success == 1) {
				that.totalElements = parseInt(reObj.totalElements);
				if(reObj.rows.length==0){
				    
				}else{
				    that.setListview(reObj.rows);   
				}
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
			appcan.locStorage.setVal('currentRouteObj',obj);
			appcan.locStorage.setVal('currentUser', {
                userId: that.userObj.objectId,
                userName: that.userObj.userName,
                userDept:that.userObj.orgName,
                userHead: appcan.locStorage.getVal('headPic')
            });
			appcan.openWinWithUrl('route_map','../../check_control/route_map.html');
		});
	}
};
