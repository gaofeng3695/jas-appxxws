function referDatabylocalid(_localid,callback)
{
    var msg = {success:"",remark:""};
    var sql = "select * from operationrecorddata where localid = '" + _localid + "' and status=0;";
    selectSql(sql, function(err, result) {
        // alert(JSON.stringify(result));
        if (err==null && result.length != 0) {
            var operationItem = result[0];
            var _id = getRandNum();
            var _url = common_rest_url  + operationItem.url;
            var _postdata = operationItem.postdata;             
            getDeviceConnectionStatus(function(connection_state) {
                if(connection_state==-1){
                    msg.success = -1;//表示提交失败
                    msg.remark = "无网络,已保存到本地";
                    callback(msg);
                }
                else
                {
                    jasHttpPost(_id,_url,function(id, state, resultset){
                        uexXmlHttpMgr.close(id);
                        var httpObj = eval('(' + resultset + ')');
                        if(httpObj.success==1) {
                            var updateSql = "update offlinedata set status = 0 where localid ='" +_localid+"';";
                            execSql(updateSql,function(err,data){
                               if(err == null && data == 0)
                               {
                                   var opSql = "update operationrecorddata set status = 1,reason = '操作成功' where localid ='" +_localid+"';";
                                   execSql(opSql,function(errSub,dataSub){
                                       if(errSub == null && dataSub == 0){
                                            msg.success = 1;//表示操作成功
                                            msg.remark = "提交成功";
                                            callback(msg);
                                       }
                                   });
                               }
                               else
                               {
                                    msg.success = -2;//表示本地数据库异常
                                    msg.remark = "提交成功,本地数据库异常";
                                    callback(msg);
                               }
                            });
                        }
                        else{
                           var opSql2 = "update operationrecorddata set reason = '提交失败' where localid ='" +_localid+"';";
                           execSql(opSql2,function(err,data){
                               if(err == null && data == 0){
                                    msg.success = -1;//表示失败
                                    msg.remark = "提交失败,已保存到本地";
                                    callback(msg);
                               }
                           });
                        }
                    },_postdata);
                }
            });
            
        }
        else{
             msg.success = -2;//表示本地数据库异常
             msg.remark = "本地数据库异常";
             callback(msg);
        }
    });
}

function referDatabylocalidForMyWork(_localid,callback)
{
    var msg = {success:"",remark:""};
    var sql = "select * from operationrecorddata where localid = '" + _localid + "';";
    selectSql(sql, function(err, result) {
        // alert(JSON.stringify(result));
        if (err==null && result.length != 0) {
            var operationItem = result[0];
            var _id = getRandNum();
            var _url = common_rest_url  + operationItem.url;
            var _postdata = operationItem.postdata;             
            getDeviceConnectionStatus(function(connection_state) {
                if(connection_state==-1){
                    msg.success = -1;//表示提交失败
                    msg.remark = "无网络,已保存到本地";
                    callback(msg);
                }
                else
                {
                    jasHttpPost(_id,_url,function(id, state, resultset){
                        uexXmlHttpMgr.close(id);
                        var httpObj = eval('(' + resultset + ')');
                        if(httpObj.success==1) {
                            var updateSql = "update offlinedata set status = 0 where localid ='" +_localid+"';";
                            execSql(updateSql,function(err,data){
                               if(err == null && data == 0)
                               {
                                   var opSql = "update operationrecorddata set status = 1,reason = '操作成功' where localid ='" +_localid+"';";
                                   execSql(opSql,function(errSub,dataSub){
                                       if(errSub == null && dataSub == 0){
                                            msg.success = 1;//表示操作成功
                                            msg.remark = "提交成功";
                                            callback(msg);
                                       }
                                   });
                               }
                               else
                               {
                                    msg.success = -2;//表示本地数据库异常
                                    msg.remark = "提交成功,本地数据库异常";
                                    callback(msg);
                               }
                            });
                        }
                        else{
                           var opSql2 = "update operationrecorddata set reason = '提交失败' where localid ='" +_localid+"';";
                           execSql(opSql2,function(err,data){
                               if(err == null && data == 0){
                                    msg.success = -1;//表示失败
                                    msg.remark = "提交失败,已保存到本地";
                                    callback(msg);
                               }
                           });
                        }
                    },_postdata);
                }
            });
            
        }
        else{
             msg.success = -2;//表示本地数据库异常
             msg.remark = "本地数据库异常";
             callback(msg);
        }
    });
}

function multiReferDatabylocalid(_listobj)
{
    for (var i=0; i < _listobj.length; i++) {
      var _obj = _listobj[i];
      referDatabylocalid(_obj.localid);
    };
}
