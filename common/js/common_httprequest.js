/*
 * 请求对象
 */
function JasHttpRequest(){
    timeout = 30000;//请求超时时间30秒
    requestHeader = '{"Content-type":"application/json;charset=utf-8"}';//请求的报文头
    
    protocolConfig = appcan.locStorage.getVal('serverProtocol');
    ipConfig = appcan.locStorage.getVal('serverIP');
    portConfig = (appcan.locStorage.getVal('serverPort')==null?"":appcan.locStorage.getVal('serverPort'));
    
    if(protocolConfig=="" || ipConfig=="")
    {
        protocolConfig = "https://"
        ipConfig =  "apigw.zyax.cn";
    }
    serverURL = protocolConfig+ipConfig;
    if(portConfig!=""){
        serverURL = protocolConfig+ipConfig+":"+portConfig+"/";
    }
    else{
        serverURL = protocolConfig+ipConfig+"/";
    }
    routeURL = "";
    completeURL=serverURL + routeURL;
}

JasHttpRequest.prototype = {
    constructor: JasHttpRequest,
    //服务请求的方法
    jasHttpGet:function(partURL,requestCallback){
        //创建请求唯一标识
        var requestID = Math.floor(Math.random() * ( 100000 + 1));
        //请求的URL
        var getURL = completeURL + partURL;
        if(appcan.locStorage.getVal("token") !== 'undefined' && appcan.locStorage.getVal("token")!=null && appcan.locStorage.getVal("token").length>0)
        {
            var token = appcan.locStorage.getVal("token");
            if(getURL.indexOf("?")!=-1)
            {
                getURL += "&token="+token;
            }
            else
            {
                getURL += "?token="+token;
            }
        }
        //异步请求完成的回调函数
        if (appcan.isFunction(requestCallback)) {
            uexXmlHttpMgr.onData = requestCallback;
            uexXmlHttpMgr.close(requestID);
        }
        //创建一个请求对象
        uexXmlHttpMgr.open(requestID, "GET",getURL,timeout);
        //设置请求对象表头
        uexXmlHttpMgr.setHeaders(requestID, requestHeader);
        //发送请求
        uexXmlHttpMgr.send(requestID);
    },
    jasHttpPost:function(partURL,requestCallback,postData,onPostProgressCallback){
       
        //创建请求唯一标识
        var requestID = Math.floor(Math.random() * ( 100000 + 1));
        //请求的URL
        var getURL = completeURL + partURL;

          
        if(appcan.locStorage.getVal("token") !== 'undefined' && appcan.locStorage.getVal("token")!=null && appcan.locStorage.getVal("token").length>0)
        {
            var token = appcan.locStorage.getVal("token");
            if(getURL.indexOf("?")!=-1)
            {
                getURL += "&token="+token;
            }
            else
            {
                getURL += "?token="+token;
            }
        }
        //异步请求完成的回调函数
        if (appcan.isFunction(requestCallback)) {
            uexXmlHttpMgr.onData = requestCallback;
            uexXmlHttpMgr.close(requestID);
        }
        //发送进度改变的监听方法
        if (appcan.isFunction(onPostProgressCallback)) {
            uexXmlHttpMgr.onPostProgress = onPostProgressCallback;
        }
        //创建一个请求对象
        uexXmlHttpMgr.open(requestID, "POST",getURL,timeout);
        //设置请求对象表头
        uexXmlHttpMgr.setHeaders(requestID, requestHeader);
        //设置请求对象的body参数
        uexXmlHttpMgr.setBody(requestID, postData);
        //发送请求
        uexXmlHttpMgr.send(requestID);
    },
    jasHttpPostWithRequestID:function(requestid,partURL,requestCallback,postData,onPostProgressCallback){
       
        //创建请求唯一标识
        var requestID = requestid;
        //请求的URL
        var getURL = completeURL + partURL;
        if(appcan.locStorage.getVal("token") !== 'undefined' && appcan.locStorage.getVal("token")!=null && appcan.locStorage.getVal("token").length>0)
        {
            var token = appcan.locStorage.getVal("token");
            if(getURL.indexOf("?")!=-1)
            {
                getURL += "&token="+token;
            }
            else
            {
                getURL += "?token="+token;
            }
        }
   
        //异步请求完成的回调函数
        if (appcan.isFunction(requestCallback)) {
            uexXmlHttpMgr.onData = requestCallback;
            uexXmlHttpMgr.close(requestID);
        }
        //发送进度改变的监听方法
        if (appcan.isFunction(onPostProgressCallback)) {
            uexXmlHttpMgr.onPostProgress = onPostProgressCallback;
        }
        //创建一个请求对象
        uexXmlHttpMgr.open(requestID, "POST",getURL,timeout);
        //设置请求对象表头
        uexXmlHttpMgr.setHeaders(requestID, requestHeader);
        //设置请求对象的body参数
        uexXmlHttpMgr.setBody(requestID, postData);
        //发送请求
        uexXmlHttpMgr.send(requestID);
    },
    jasHttpClose:function(requestID){
        uexXmlHttpMgr.close(requestID);
    }
}
