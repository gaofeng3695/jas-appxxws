### APPCan localStorage

##### 1.入户安检

​	1.1 业务数据

```javascript
appcan.locStorage.val('planId');  // 安检计划ID
appcan.locStorage.val('planName'); // 安检计划名称
appcan.locStorage.val('recordId');  // 安检记录的ID
appcan.locStorage.val('isrelation'); //当前用户是否为安检计划的干系人
appcan.locStorage.val('parentId');  // 存在进入是从再次检查进入的
appcan.locStorage.val('saveDetailAddress');  // 上次安检记录使用的地址
appcan.locStorage.val('oGasmeter'); // 存放燃气表对象
appcan.locStorage.val('newUserObj'); // 存放新建用户的对象
```

​	1.2 页面跳转

```javascript
appcan.locStorage.val('againRecordObj');  // 失败安检记录的obj
appcan.locStorage.val('recordEntrance');  // 'new\again\local' 进入新建记录页面的入口
appcan.locStorage.val('gasmeterEntrance');  // 'new\modify' 进入新建燃气表的入口
```
先点击用户地址，进入安检界面的时候进行用户信息的存储
appcan.locStorage.val('userObj',obj);//从用户地址列表进入