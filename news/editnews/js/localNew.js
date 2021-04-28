/***
 *  消息离线保存
 * @param {Object} arrayData
 * @param {Object} callBack
 */
function saveOfflineNews(arrayData,callback){
    var result = {success:"",msg:"",localid:""};
    var sql = "insert into localnews (localId,objectId,userId,enterpriseId,postdata,state)";
    for(var i=0;i<arrayData.length;i++){
        var obj = arrayData[i];
        // var datestr = new Date().Format("yyyy-MM-dd HH:mm:ss");
        var sqlparams = " select '"+obj.localId+"','"+obj.objectId+"','"+obj.userId+"'";
        sqlparams+= ",'"+obj.enterpriseId+"','"+obj.postData+"','"+obj.state+"'";
        if(i==0){
            sql+= sqlparams;
        }else{
            sql+= " union all "+sqlparams;
        }
    }
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql,function(err,data){
        if(err == null && data == 0){
           result.success =  1;
           result.msg = "本地保存成功";
           result.localid = "";
        }
        else{
           result.success =  -1;
           result.msg = "本地保存失败";
           result.localid = "";
        }    
        callback(result);
    });
}
/***
 * 消息离线附件保存 
 * @param {Object} arrayData
 * @param {Object} callback
 */
function saveOfflineNewsAtta(arrayData,callback){
    var result = {success:"",msg:"",localid:""};
    var sql="insert into localnewsatta (localId,objectId,attaType,localURL,postdata,state)";
    for(var i=0;i<arrayData.length;i++){
        var obj=arrayData[i];
        var sqlparams= " select '"+obj.localId+"','"+obj.objectId+"','"+obj.attaType+"','"+obj.localUrl+"','"+obj.postData+"','"+obj.state+"'";
        if(i==0){
            sql += sqlparams;
        }else{
            sql += " union all "+sqlparams;
        }
    }
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql,function(err,data){
        if(err == null && data == 0){
            result.success = 1;
            result.msg="本地保存成功";
        }else{
            result.success = 0;
            result.msg="本地保存成功";
        }
        callback(result);
    });
}
/**
 * 删除本地消息 
 * @param {Object} localId
 * @param {Object} callback
 */
function deleteOfflineNews(objectId,callback){
    var result={success:"",msg:"",localId:""};
    var sql = "delete from localnews where objectId='"+objectId+"'";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql,function(err,data){
        if(err == null && data == 0){
            result.success=1;
            result.msg="本地数据删除成功";
        }else{
            result.success=0;
            result.msg="本地数据删除失败";
        }
        callback(result);
    });
}
/**
 * 删除本地消息附件信息 
 * @param {Object} objectId
 * @param {Object} callback
 */
function deleteOfflineNewsAtta(objectId,callback){
    var result={success:"",msg:"",localId:""};
    var sql = "delete from localnewsatta where objectId='"+objectId+"'";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql,function(err,data){
        if(err == null && data == 0){
            result.success=1;
            result.msg="本地数据删除成功";
        }else{
            result.success=0;
            result.msg="本地数据删除失败";
        }
        callback(result);
    });
}
/***
 *  消息离线修改
 * @param {Object} arrayData
 * @param {Object} callBack
 */
function updateOfflineNews(objData,callback){
    var result = {success:"",msg:"",localid:""};
    var sql = "update localnews set userId='"+objData.userId+"',enterpriseId='"+objData.enterpriseId+"',postdata='"+objData.postData+"' where objectId ='"+objData.objectId+"'";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql,function(err,data){
        if(err == null && data == 0){
           result.success =  1;
           result.msg = "本地消息修改成功";
           result.localid = "";
        }
        else{
           result.success =  -1;
           result.msg = "本地消息修改失败";
           result.localid = "";
        }    
        callback(result);
    });
}