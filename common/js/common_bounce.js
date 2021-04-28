//上下拉刷新页面
function refreshBounce(funcTop, funcBottom){
    uexWindow.setBounce("1");
    if (!funcTop && !funcBottom) {
        uexWindow.showBounceView("0", "rgba(255,255,255,0)", "0");
        uexWindow.showBounceView("1", "rgba(255,255,255,0)", "0");
        return;
    }
    var top = 0, btm = 1;
    uexWindow.onBounceStateChange = function(type, state){
    
        if (type == top && state == 2) { //顶部弹动
            funcTop();
            uexWindow.resetBounceView("0");
        }
        if (type == btm && state == 2) { //底部弹动
            funcBottom();
            uexWindow.resetBounceView("1");
        }
        
    }
    if (funcTop) {
        uexWindow.setBounceParams('0', "{'pullToReloadText':'下拉刷新','releaseToReloadText':'释放刷新','loadingText':'正在刷新，请稍候'}");
        uexWindow.showBounceView(top, "rgba(255,255,255,0)", 1);
        uexWindow.notifyBounceEvent(top, 1);
    }
    if (funcBottom) {
        uexWindow.setBounceParams('1', "{'pullToReloadText':'加载更多','releaseToReloadText':'加载更多','loadingText':'加载中，请稍候'}");
        uexWindow.showBounceView(btm, "rgba(255,255,255,0)", 1); //设置弹动位置及效果([1:显示内容;0:不显示])
        uexWindow.notifyBounceEvent(btm, 1); //注册接收弹动事件([0:不接收onBounceStateChange方法回调;1:接收])
    }
}
