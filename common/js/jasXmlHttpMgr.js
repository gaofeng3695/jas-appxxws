
function jasHttpGet(id,url,onDataCallback,headers,timeout){
    if (appcan.isFunction(onDataCallback)) {
        uexXmlHttpMgr.onData = onDataCallback;
    }
    var _url = url+"&loginname="+appcan.locStorage.getVal("appLoginName")+"&versionid="+appcan.locStorage.getVal("appVersion");
    uexXmlHttpMgr.open(id, "GET",_url, "");
    var header = common_headJson;
    if(arguments.length>3){
        header = headers;
    }
    uexXmlHttpMgr.setHeaders(id, header);
    uexXmlHttpMgr.send(id);
}

function jasHttpPost(id,url,onDataCallback,postData,headers,onPostProgressCallback,timeout){
    if (appcan.isFunction(onDataCallback)) {
        uexXmlHttpMgr.onData = onDataCallback;
    } 
    if (appcan.isFunction(onPostProgressCallback)) {
        uexXmlHttpMgr.onPostProgress = onPostProgressCallback;
    }
    var _url = url+"&loginname="+appcan.locStorage.getVal("appLoginName")+"&versionid="+appcan.locStorage.getVal("appVersion");
    uexXmlHttpMgr.open(id, "POST",_url,"");
    var header = common_headJson;
    if(arguments.length>5){
        header = headers;
    }
    uexXmlHttpMgr.setHeaders(id, header);
    uexXmlHttpMgr.setBody(id, postData);
    uexXmlHttpMgr.send(id);
}

function jasHttpClose(id){
    uexXmlHttpMgr.close(id);
}