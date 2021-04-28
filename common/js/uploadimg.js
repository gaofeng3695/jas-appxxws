var businessid = "";
var file_num = getRandNum();
var fileids = "";
var pagetype = "view";
var savePath="",downloadUrl="",eventid="";
function loadImg(id,type){
    businessid = id;
    pagetype = type;
    uexXmlHttpMgr.onData = function(inOpCode,inStatus,inResult){
        var result = eval('('+inResult+')');
        uexXmlHttpMgr.close(inOpCode);
        if (result.success == 1) {
            var imgList = "<div class='ub imgClass'>";
            var viewImgList = "";
            var arrData = result.result;
            for (var i = 0,len = arrData.length; i < len; i++) {
                var fullUrl = downloadDir+arrData[i].filename;
                var url = downloadDir+arrData[i].filename;
                if(pagetype=="edit"){
                    if(i > 0 && i % 2 == 0){
                        imgList +="</div><div class='ub imgClass'>";
                    }
                    imgList += "<div id='imgDiv" + arrData[i].eventid + "' class='ub ub-f1 ub-ac bc-text-head ub-pc uc-a1 umar-r'>";
                    imgList += "<div onclick=\"deleteImg('imgDiv" + arrData[i].eventid + "')\" id='img' class='ub-img icon-close umw2 umh4'>";
                    imgList += "</div>";
                    imgList += "<img style='width: 7em; height: 7em;' id='"+arrData[i].eventid+"' onclick=\"viewpic('" + fullUrl + "')\" src='" + url + "'/>";
                    imgList += "</div>&nbsp;&nbsp;";
                }else if(pagetype == "view"){
                    viewImgList += "<p style='height: 1.8em;'><a href=\"#\" class=\"imgClass\" onclick=\"downloadFile('"+arrData[i].filename+"','"+arrData[i].eventid+"')\">"+
                    "<span class='ut-s'>"+arrData[i].filename+"<span></a></p>";
                }
            }
            if(pagetype=="edit"){
                imgList += "</div>";
                $("#imgList").append(imgList);
                var num = $("#imgList").find("div.imgClass").size();
                $("#imgList").css('height',7.5 * parseInt(num)+"em");
            }else{
                $("#imgList").append(viewImgList);
                var num = $("#imgList").find("a.imgClass").size();
                $("#imgList").css('height',1.8 * parseInt(num)+"em");
            }
        }
    }
    var url = common_rest_url + "getFileList/"+businessid;
    uexXmlHttpMgr.open(file_num, "POST", url, "");
    uexXmlHttpMgr.send(file_num); 
    file_num++;
}

function addImg(data) {
    var count = $("#imgList").find("div#img").size();
    if(count == 0){
        $("#imgList").html("");
        $("#imgList").css('height',"3em");
    }
    var arrSrc = data.split(",");
    var imgList = "<div class='ub imgClass'>";
    for ( i = 0; i < arrSrc.length; i++) {
        if(i > 0 && i % 2 == 0){
            imgList +="</div><div class='ub imgClass'>";
        }
        imgList += "<div id='imgDiv" + file_num + "' class='ub ub-f1 ub-ac bc-text-head ub-pc uc-a1 umar-r'>";
        imgList += "<div onclick=\"deleteImg('imgDiv" + file_num + "')\" id='img' class='ub-img icon-close umw2 umh4'>";
        imgList += "</div>";
        imgList += "<img style='width: 7em; height: 7em;' id='local' onclick=\"viewpic('" + arrSrc[i] + "')\" src='" + arrSrc[i] + "'/>";
        imgList += "</div>&nbsp;&nbsp;";
        file_num++;
    }
    imgList += "</div>";
    $("#imgList").append(imgList);
    var num = $("#imgList").find("div.imgClass").size();
    $("#imgList").css('height',7.5 * parseInt(num)+"em");
}

function deleteImg(imgDivId) {
    var imgSize = $("#" + imgDivId).parents(".imgClass").find("div#img").size();
    if(imgSize == 1){
        $("#" + imgDivId).parents(".imgClass").remove();
    }
    $("#" + imgDivId).remove();
    
    var num = $("#imgList").find("div.imgClass").size();
    $("#imgList").css('height',7.5 * parseInt(num)+"em");
    if(num ==0){
        $("#imgList").html("");
        $("#imgList").css('height',"8em");
    }
}

function viewpic(imgurl){  
    var ar = new Array();  
    ar[0]=imgurl;
    // uexImageBrowser.open(ar);
    var param = {"data":ar};
    uexImage.openBrowser(param,function(){
        alert("browser closed!");
    });
}  

function uploadPic(arrPic,callback) {
    var arrLength = arrPic.length;
    var count = 0;
    for (var i = 0; i < arrLength; i++) {
        uexXmlHttpMgr.onData = function(inOpCode, inStatus, inResult) {
            //alert(inOpCode+"  "+ inStatus+"  "+inResult);
            uexXmlHttpMgr.close(inOpCode);
            if(inStatus!=1){
                appcan.window.openToast('图片上传失败,请检查网络', '2000');
                return;
            }else{
                var result = eval('(' + inResult + ')');
                if(result.success == 1){
                    fileids += result.eventid + ",";
                    count++;
                    if (count == arrLength&&appcan.isFunction(callback)) {
                        callback();
                    }
                } else{
                    appcan.window.openToast('图片上传失败,请检查网络', '2000');
                    return;
                }
            }
            uexWindow.closeToast();
        }
        var url = common_rest_url + "/uploadfile.do";
        uexXmlHttpMgr.open(file_num, "POST", url, 30000000);
        uexXmlHttpMgr.setPostData(file_num, "1", "file", arrPic[i]);
        uexXmlHttpMgr.send(file_num);
        file_num++;
    };
    uexXmlHttpMgr.onPostProgress = function (file_num,inProgress){
        uexWindow.toast(1,5,"上传进度：" + inProgress,0);
    }
}

function downloadFileByID(savePath,eventid){
    uexDownloaderMgr.cbCreateDownloader=function(opId,dataType,data){
        uexDownloaderMgr.download(opId,downloadUrl,savePath,1);
        alertToast("请稍等，正在处理...");
    }
    uexDownloaderMgr.onStatus = function(opId,fileSize,percent,status){
        //alert(opId+";"+fileSize+";"+percent+";"+status);
        if(status == 0){
            appcan.window.openToast("下载进度"+percent+"%", '2000');
        }
        if(status == 1){
            appcan.window.openToast("下载完成", '2000');
            //imgurl = savePath;
            uexDownloaderMgr.closeDownloader(opId);
            viewpic(savePath);
        }
        if(status == 2){
            appcan.window.openToast("下载出错", '2000');
            uexDownloaderMgr.closeDownloader(opId); 
            uexFileMgr.deleteFileByPath(savePath);
        }
    }
    
    uexFileMgr.cbIsFileExistByPath = function(opId,dataType,data){
        if(dataType==2){
            if(data == 1){//文件存在
                viewpic(savePath);
            }
            if(data == 0){//文件不存在
                 appcan.window.alert({
                      title : "提示",
                      content : "您确定下载该附件吗?",
                      buttons : ['确定', '取消'],
                      callback : function(err, data, dataType, optId) {
                          //确定
                          if(data == 0){
                              //queryFile(eventid);
                              downloadUrl = common_rest_url + "downloadfile/"+eventid;
                              uexDownloaderMgr.createDownloader(getRandNum());
                          }
                          console.log(err, data, dataType, optId);
                      }
                 });
            }
　　　　   }
    }
}


function downloadFile(fName,eid) {
    eventid = eid;
    fileName = fName;
    savePath = downloadDir+fileName;
    uexFileMgr.isFileExistByPath(savePath);
    downloadFileByID(savePath,eventid);
}