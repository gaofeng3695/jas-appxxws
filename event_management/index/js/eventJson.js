
/*根据唯一id获取事件信息*/

var eventObj = {
    /*点击获取信息*/
    obtain : function(data,id){
        var queryResult = Enumerable.From(data)
            .Where(function (x) { return x.objectId==id })
            .OrderBy(function (x) { return x.reportTime })
            .ToArray()
            .forEach(function (x) {
                var params ={
                    "objectId": x.objectId,                //唯一标识
                    "address": x.address,                //地址
                    "inspRecordId": x.inspRecordId,           //当前巡检记录产生的唯一标识
                    "description": x.description,        //事件描述
                    "lon": x.lon,                          //经度
                    "lat": x.lat,                           //纬度
                    "bdLon": x.bdLon,                       //百度经度
                    "bdLat": x.bdLat,                       //百度纬度
                    "inspectorId": x.inspectorId,                // 上报人ID
                    "inspectorName": x.inspectorName,  //上报人名
                    "parentTypeId": x.parentTypeId,            //事件类型
                    "fullTypeName": x.fullTypeName,              //事件类型中文
                    "eventCode": x.eventCode,           //事件号
                    "occurrenceTime": x.occurrenceTime,     //事件发生时间
                    "reportTime": x.reportTime,          //上报时间
                    "status": x.status,                          //事件状态
                    "statusValue":x.statusValue,                       //事件状态中文
                    "pic": x.pic,                         //图片
                    "audio":x.createTime,             //录音
                    "disposeTime": x.disposeTime,       //任务处置最新时间
                    "audio":x.audio                 //音频
                };
                appcan.locStorage.setVal("event_details",params );
//                appcan.openWinWithUrl("event_details","../event_details.html");
            });
    },
    stopEvent : function(event){ //阻止冒泡事件
        //取消事件冒泡
        var e=arguments.callee.caller.arguments[0]||event;
        if (e && e.stopPropagation) {
            e.stopPropagation();
        } else if (window.event) {
            window.event.cancelBubble = true;
        }
    }
};

