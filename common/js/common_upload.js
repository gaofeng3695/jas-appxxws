function JasUpload(){
    uploadHttp = "http://192.168.100.72:8050/cn-cloudlink-patrol-fileserver/attachment/save";
     /*
      * 注册文件上传的监听事件
      */
    uexUploaderMgr.onStatus = function(opCode,fileSize,percent,serverPath,status){
        switch (status) {
            case 0:
                baseOperation.baseOperation("文件大小："+fileSize+"字节<br>上传进度："+percent+"%");
                break;
            case 1:
                uexUploaderMgr.closeUploader(1);
                break;
            case 2:
                alert("上传失败");
                uexUploaderMgr.closeUploader(1);
                break;
        }  
    }
    /*
     * 注册上传完成的回调事件
     */
    uexUploaderMgr.cbCreateUploader =function(opCode,dataType,data){
        if(data == 0){
            //alert("创建成功");
        }else{
            //alert("创建失败");
        }
    }
}
JasUpload.prototype={
    upload:function(){
        uexUploaderMgr.createUploader(1,uploadHttp);
        uexUploaderMgr.uploadFile(1,"res://pipe.png","inputName",0);  
    }
}
