/*
 * 重新装载UserBo的全局缓存
 */
function reloadUserBoLocStorage(key,value){
    var userBoStr = appcan.locStorage.getVal("userBo");
    if(userBoStr!="" && userBoStr!=null && userBoStr!="undefined"){
        var userBo = JSON.parse(userBoStr);
        userBo[key] = value;
        appcan.locStorage.setVal("userBo",userBo);
    }
}

