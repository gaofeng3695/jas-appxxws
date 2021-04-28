var vm = new Vue({
    el: "#page",
    data: {
        dataTime: []
    },
    computed: { //数据的组装
    },
    mounted: function() { //从后台获取到的数据，进行数据的操作
        appcan.ready(function() {
            operations.requestList();
        });
    },
});
var operations = {
    oData:[],
    requestList: function() {
        var that = this;
        var sUrl = "cloudlink-inspection-event/commonData/maintenanceOperate/getList";
        var queryObj = {
            objectId:appcan.locStorage.val('maintenanceId'),
        };
        jasRequest.post(sUrl, queryObj, function(data) {
            that.oData=data.rows[0];
            that.render(data.rows[0]);
        });
    },
    render: function(data) {
        var title = [];
        data.operateList.forEach(function(item) {
            title.push(item.opDate);
        });
        var titleArr = this.unique(title);
        this.renderOData(titleArr);
    },
    unique: function(array) {
        var n = [];
        for (var i = 0; i < array.length; i++) {
            if (n.indexOf(array[i]) == -1)
                n.push(array[i]);
        }
        return n;
    },
    renderOData:function(titleArr){
        var oDatas=[];
        var that=this;
        var today = new Date().Format("yyyy-MM-dd");
        var yesterday=new Date((new Date().getTime()-24*60*60*1000)).Format("yyyy-MM-dd");
        titleArr.forEach(function(item){   
            var obj= {} ;
            if(today==item){
             obj.time="（今天）"+item;  
            }else if(yesterday==item){
             obj.time="（昨天）"+item;     
            }else{
             obj.time=item;   
            }
           obj.timeList=that.oData.operateList.filter(function(data){
              return  data.opDate==item;
           }) ;
           oDatas.push(obj); 
        });
         vm.dataTime=oDatas;       
    }
}


