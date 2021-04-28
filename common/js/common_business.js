/*
 * 无权限用户强制退出该企业
 * 获取当前用户所在企业的状态并判断状态
 * 1：加入  0：受邀  -1：冻结  -2：移除  -3：退出
 */
function noPermissionsUserCheckOut(){
    try{
         var common_userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
         var requestURL = "cloudlink-core-framework/user/getStatus?userId="+common_userBo.objectId+"&enterpriseId="+common_userBo.enterpriseId;
         var jasHttpReq= new JasHttpRequest();
         jasHttpReq.jasHttpGet(requestURL, function(id, state, data) {
             if (state == -1) {
                 return;
             }
             if(data!="")
             {
                 var obj = JSON.parse(data);
                 if(obj.success == 1 && obj.rows.length > 0)
                 {
                     if(obj.rows[0].status == -1){
                         alert("您的账号已被管理员【冻结】，\r\n无法继续操作！");
                         appcan.window.close(-1);
                         return;
                     }
                     if(obj.rows[0].status == -2){
                         alert("您的账号已被管理员【移除】，\r\n无法继续操作！");
                         appcan.window.close(-1);
                         return;
                     }
                     if(obj.rows[0].status == -3){
                         alert("您已退出该企业，\r\n无法继续操作！");
                         appcan.window.close(-1);
                         return;
                     }
                 }
             }
         });
    }
    catch(e){
        
    }
}

/*
 * 取消巡检
 * 清除本地数据库
 */
function removeLocalDBSourceForCancelIns(_recordId)
{
     var dbOper = new DataBaseOperation();
     var sql1 = "delete from InsRecord where recordID = '"+_recordId+"';";
     dbOper.dbExec(sql1,function(err1,data1){
         if(err1 == null && data1 ==0){
             var sql2 = "delete from InsTrajectory where recordID = '"+_recordId+"';";
             dbOper.dbExec(sql2,function(err2,data2){});
         }
     });
}
