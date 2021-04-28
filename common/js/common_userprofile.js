function initUserProfile(){
    var userBo  = JSON.parse(appcan.locStorage.getVal("userBo"));
    var profilePhotoId = userBo.profilePhoto;
    var profilePhotoPath = "";
    if(profilePhotoId==null || profilePhotoId==""){
        if(userBo.sex == null || userBo.sex == ""){
            profilePhotoPath = "res://nantou.png";
        }
        else if(userBo.sex == "男"){
            profilePhotoPath = "res://nantou.png";
        }
        else if(userBo.sex == "女"){
            profilePhotoPath = "res://girl.png";
        }
    }
    else{
         profilePhotoPath =serverURL + "cloudlink-core-file/file/getImageBySize?fileId=" + profilePhotoId + "&viewModel=fill&width=500&hight=500"; 
   // profilePhotoPath =serverURL + "cloudlink-core-file/file/downLoad?fileId=" + profilePhotoId ; 
    }
    appcan.locStorage.setVal("profilePhotoPath",profilePhotoPath);
}

/*
 * 获取当前用户头像的路径
 */
function getUserProfilePath(){
    var userBo  = JSON.parse(appcan.locStorage.getVal("userBo"));
    var profilePhotoId = userBo.profilePhoto;
    var profilePhotoPath = "";
    if(profilePhotoId==null || profilePhotoId==""){
        profilePhotoPath = "";
    }
    else{
           // profilePhotoPath =serverURL + "cloudlink-core-file/file/downLoad?fileId=" + profilePhotoId ;
        profilePhotoPath =serverURL + "cloudlink-core-file/file/getImageBySize?fileId=" + profilePhotoId + "&viewModel=fill&width=500&hight=500"; 
    }
    return profilePhotoPath;
}
