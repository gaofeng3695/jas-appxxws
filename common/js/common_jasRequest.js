/*
 ** get  请求 jasRequest.get(sUrl, queryObj, fnSuccess,fnFail);
 ** post 请求 jasRequest.post(sUrl, queryObj, fnSuccess,fnFail);    
 ** 两者传参没有区别 
 */

/*
 ** get请求例子 jasRequest.get(sUrl, queryObj, fnSuccess,fnFail);
 */
// var partURL = "cloudlink-inspection-event/securityCheckRecord/get";
// var queryObj = {
//     objectId :　appcan.locStorage.val('recordId')
// }
// jasRequest.get(partURL,queryObj,function(oData){
//     var aData = oData.rows;
//     var obj = aData[0];
//     that.render(obj);
//     appcan.locStorage.val('userFileId', obj.groupId);
// });

/*
 ** post 请求例子 jasRequest.post(sUrl, queryObj, fnSuccess,fnFail);
 */
// var partURL = "cloudlink-inspection-event/commonData/securityCheckPlan/getPageList";
// var queryObj = {
//     "pageNum": that.pageNum,
//     "pageSize": that.pageSize
// };
// jasRequest.post(partURL,queryObj,function(oData){
//     var aData = oData.rows;
//     if (aData.length > 0) {
//         that.render(aData);
//     } 
//     that.renderItemCount(aData.length, oData.total);
// });


(function(window, appcan, baseOperation) {

    var protocolConfig = appcan.locStorage.getVal('serverProtocol') || 'https://'; //协议
    var host = appcan.locStorage.getVal('serverIP') || 'apigw.zyax.cn'; //主机
    var portConfig = appcan.locStorage.getVal('serverPort') || ''; //端口号

    var serverURL = protocolConfig + host + (portConfig ? ':' : '') + portConfig + '/';
    var routeURL = "";
    var completeURL = serverURL + routeURL;



    var ajax = function(sType, sUrl, oData, fnSuccess, fnFail) {
        if (!sType) {
            alert('请传入类型！');
            return;
        }
        if (!sUrl) {
            alert('请传入url！');
            return;
        }

        appcan.ajax({
            type: sType,
            url: completeURL + sUrl + (sUrl.indexOf("?") !== -1 ? '&' : '?') + 'token=' + appcan.locStorage.getVal("token"),
            data: oData,
            headers: {
                "Content-type": "application/json;charset=utf-8",
                "Accept": "*/*"
            }, //设置请求头
            contentType: "application/json;charset=utf-8", //请求时发送的数据格式
            dataType: 'json', //期望服务器返回的数据格式
            timeout: 30000, //超时时间
            cache: false, //不缓存get返回的数据
            beforeSend: function() {

                //baseOperation.londingToast('数据请求中，请稍后...', 999999);
            },
            success: function(oData, status, requestCode, response, xhr) {
                //baseOperation.closeToast();
                if (oData.success === 1) {
                    return fnSuccess && fnSuccess(oData, status, requestCode, response, xhr);
                } else {
                    //baseOperation.alertToast('网络繁忙，请稍后再试');
                    return fnFail && fnFail(oData);
                }
            },
            error: function(xhr, erroType, error, msg) {
                //baseOperation.alertToast('网络连接失败，请检查您的网络', 3333);
                return fnFail && fnFail(xhr);
            }
        });
    };



    var obj = {
        serverURL: serverURL,
        get: function(sUrl, oData, fnSuccess, fnFail) {
            try{
                ajax.call(this, 'GET', sUrl, oData, fnSuccess, fnFail);
            }catch(e){
                // alert(e);
                return fnFail && fnFail(e);
            }            
        },
        post: function(sUrl, oData, fnSuccess, fnFail) {
            try{
                ajax.call(this, 'POST', sUrl, oData, fnSuccess, fnFail);
            }catch(e){
                //alert(e);
                return fnFail && fnFail(e);
            }
        },
        uploadFile: function(sUrl, sPath, fnSuccess, fnFail, fnProgress, isHideTip) { //sPath :文件路径,
            //此处有一个坑，多个文件上传成功后，会出现调用error的情况
            appcan.ajax({
                type: 'POST',
                url: completeURL + sUrl + (sUrl.indexOf("?") !== -1 ? '&' : '?') + 'token=' + appcan.locStorage.getVal("token"),
                data: {
                    file: {
                        path: sPath
                    }
                },
                contentType: false, //请求时发送的数据格式
                dataType: 'json', //期望服务器返回的数据格式
                timeout: 30000, //超时时间
                beforeSend: function() {
                    //baseOperation.londingToast('数据请求中，请稍后...', 999999);
                },
                success: function(oData, status, requestCode, response, xhr) {
                    //baseOperation.closeToast();
                    if (oData.success === 1) {
                        return fnSuccess && fnSuccess(oData, status, requestCode, response, xhr);
                    } else {
                        //(!isHideTip) && baseOperation.alertToast('网络繁忙，请稍后再试');
                        return fnFail && fnFail();
                    }
                },
                progress: function(progress, xhr) {
                    //baseOperation.londingToast(progress,999999);
                },
                error: function(xhr, erroType, error, msg) {
                    (!isHideTip) && baseOperation.closeToast();
                    //(!isHideTip) && baseOperation.alertToast('网络连接失败，请检查您的网络', 3333);
                    return fnFail && fnFail();
                }
            });
        },

        uploadFiles: function(sBizId, oFiles, fnSuccess, fnFail, isHideTip) {
            var that = this;
            var nFileQtty = 0;
            var nFileQtty_success = 0;
            var nFileQtty_fail = 0;
            var fnResult_done = false;

            var fnResult = function() {
                if (nFileQtty_success + nFileQtty_fail < nFileQtty || fnResult_done) {
                    return; //未全部上传成功，返回
                }

                if (nFileQtty_success > 0) {
                    fnResult_done = true;
                    return fnSuccess && fnSuccess(); //有一个附件上传成功，就算成功
                }
                return fnFail && fnFail(); //否则，算作失败
            };

            for (var item in oFiles) { //循环，异步上传附件，是否上传成功，会在回调中计算
                if (oFiles.hasOwnProperty(item)) {
                    var bizType = item;
                    var aFiles = oFiles[item];
                    var sUrl = "cloudlink-core-file/attachment/save?businessId=" + sBizId + "&bizType=" + bizType;
                    aFiles.forEach(function(src, index) {
                        nFileQtty++;
                        that.uploadFile(sUrl, src, function() {
                            nFileQtty_success++;
                            //alert('nFileQtty_success'+nFileQtty_success)
                            fnResult();
                        }, function() { //有时候上传成功后也会走失败，这是坑，加了fnResult_done做判断，已解决
                            //alert('nFileQtty_fail'+nFileQtty_fail)
                            nFileQtty_fail++;
                            fnResult();
                        },true);
                    });
                }
            }
            if (nFileQtty === 0) { //如果没有附件，直接运行成功回调
                return fnSuccess && fnSuccess();
            }
        },
        deleteFilesByBizId :function(sBizId,fnSuccess){

            var partURL = "cloudlink-core-file/attachment/delBizAndFileByBizIdsAndBizAttrs";
            var queryObj = {
                "bizTypes": ["pic", "signature"],
                "bizIds": [sBizId]
            };
            jasRequest.post(partURL,queryObj,function(oData){
                return fnSuccess && fnSuccess();
            });           
        }
    };
    window.jasRequest = obj;
})(window, appcan, baseOperation);
