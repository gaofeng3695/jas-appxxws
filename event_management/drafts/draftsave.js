/*
 * 保存离线数据(事件)
 */
function saveOfflineEventData(arrayData,callback){
    var result = {success:"",msg:"",localid:""};
    var sql = "insert into eventlist(localId,eventId,partURL,postdata,state,enterpriseId,userId)";
    for(var i=0;i<arrayData.length;i++){
        var obj = arrayData[i];
        // var datestr = new Date().Format("yyyy-MM-dd HH:mm:ss");
        var sqlparams = " select '"+obj.localId+"','"+obj.eventId+"','"+obj.partUrl+"'";
        sqlparams+= ",'"+obj.postData+"','"+obj.state+"','"+obj.enterpriseId+"','"+obj.userId+"'";
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
           result.msg = "本地保存成失败";
           result.localid = "";
        }    
        callback(result);
    });
}

/*
 * 保存离线数据(事件附件)
 */
function saveOfflineEventAttaData(arrayData,callback){
    var result = {success:"",msg:"",localid:""};
    var sql = "insert into event_attachment(localID,eventid,attaType,localURL,postdata,state)";
    for(var i=0;i<arrayData.length;i++){
        var obj = arrayData[i];
        // var datestr = new Date().Format("yyyy-MM-dd HH:mm:ss");
        var sqlparams = " select '"+obj.localId+"','"+obj.eventId+"','"+obj.attaType+"'";
        sqlparams+= ",'"+obj.localUrl+"','"+obj.postData+"','"+obj.state+"'";
        if(i==0){
            sql+= sqlparams;
        }else{
            sql+= " union all "+sqlparams;
        }
    }
    //alert(sql);
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql,function(err,data){
        if(err == null && data == 0){
           result.success =  1;
           result.msg = "本地保存成功";
           result.localid = "";
        }
        else{
           result.success =  -1;
           result.msg = "本地保存成失败";
           result.localid = "";
        }    
        callback(result);
    });
}

/*
 * 更新本地事件状态
 */
function deleteOfflineEventData(eventid,callback){
    var result = {success:"",msg:"",localid:""};
    var sql = "delete from eventlist where eventid ='"+eventid+"';";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql,function(err,data){
        if(err == null && data == 0){
           result.success =  1;
           result.msg = "更新事件成功";
           result.localid = "";
        }
        else{
           result.success =  -1;
           result.msg = "更新事件失败";
           result.localid = "";
        }    
        callback(result);
    });
}



/*
 * 更新本地附件
 */
function deleteOfflineEventAttaData(eventid,callback){
    var result = {success:"",msg:"",localid:""};
    var sql = "delete from event_attachment where eventid ='"+eventid+"';";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql,function(err,data){
        if(err == null && data == 0){
           result.success =  1;
           result.msg = "更新事件成功";
           result.localid = "";
        }
        else{
           result.success =  -1;
           result.msg = "更新事件失败";
           result.localid = "";
        }    
        callback(result);
    });
}
/**
 * 更新本地数据中的事件 
 * @param {Object} arrayData
 * @param {Object} callback
 */
function updateOfflineEventData(objData,callback){
    try{
        
        var result = {success:"",msg:"",localid:""};
        var sql="update eventlist set postdata='"+objData.postData+"',enterpriseId='"+objData.enterpriseId+"',userId='"+objData.userId+"' where eventId='"+objData.eventId+"'";
        var dbOperation = new DataBaseOperation();
        dbOperation.dbExec(sql,function(err,data){
            if(err == null && data == 0){
               result.success =  1;
               result.msg = "本地更改成功";
               result.localid = "";
            }
            else{
               result.success =  -1;
               result.msg = "本地更改成失败";
               result.localid = "";
            }    
            callback(result);
        });
    }catch(e){
        alert(e);
    }
}
/**
 * 跟新本地数据中事件的附件信息 
 * @param {Object} arrayData
 * @param {Object} callback
 */
function updateOfflineEventAttaData(objData,callback){
    var result = {success:"",msg:"",localid:""};
    var sql="update event_attachment set attaType='"+objData.attaType+"',localURL='"+objData.localUrl+"',postdata='"+objData.postData+"' where localId='"+objData.localId+"'";
    var dbOperation = new DataBaseOperation();
    dbOperation.dbExec(sql,function(err,data){
        if(err == null && data == 0){
           result.success =  1;
           result.msg = "本地更改成功";
           result.localid = "";
        }
        else{
           result.success =  -1;
           result.msg = "本地更改成失败";
           result.localid = "";
        }    
        callback(result);
    });
}