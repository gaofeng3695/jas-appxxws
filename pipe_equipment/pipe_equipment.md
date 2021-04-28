### APPCan localStorage

##### 1.入户安检

​	1.1 业务数据

```javascript
//相关阈值 
appcan.locStorage.val("facilityStatusList"); //官网状态阈值表
appcan.locStorage.val("facilityTypeList"); //管网设施类型阈值表
appcan.locStorage.val("pipelineTypeList"); //管网类型阈值表


appcan.locStorage.val('facilityId') //设施Id
appcan.locStorage.val('equipmentDetailObj') //设施详情对象
appcan.locStorage.val('facilityCheckId') //设施检查Id
appcan.locStorage.val('equipmentSelectedObj') //设施检查Id

```

​	1.2 页面跳转

```javascript
appcan.locStorage.val('equipmentEntrance') //进入设施表单入口 'new','local','modify'
appcan.locStorage.val('equipmentCheckEntrance') // 设施检查表单入口 'new' , 'local','map','dailyCheck'
appcan.locStorage.val('facilitiesDetailsEntrance') // 设施详情入口 'list' ,'map','select'
```


##### 2.  常用代码

```javascript
window.onerror = function(msg, url, line) {
    alert("erro" + msg + "\n" + url + ":" + line);
    return true;
};
```