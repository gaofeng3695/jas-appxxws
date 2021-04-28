//模拟器调试报错
 //window.onerror = function(msg, url, line) {
     //alert("erro" + msg + "\n" + url + ":" + line);
     //return true;
 //};
var obj = {
            data : null,
            tab : 0,
            inTurnObj : {},//A-Z所有联系人
            deptObj : {},//按部门分类所有联系人
            mineObj : [],//本部门的所有联系人
            resObj : [],//搜索出的结果        
            azObj : {},
            azHtml : '',
            az : ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','#'],
            init : function(){
                this.getData();//从后台获取数据
            },
            tabIndex : function(index){//具体显示内容
                $("#search").val('');//清空搜索框里的值
                this.tab = index?index:0
                //alert(this.tab)   
                if(this.tab == 1){//显示本部门
                    this.renderPage(this.mineObj,'arr',1,1);//1代表不需要锚点aHtml
                    $("#department").css({display:"none"});
                    $("#anchor ul").css({display:"none"})
                }else if(this.tab == 0){//显示全部A-Z
                    this.renderPage(this.inTurnObj,'obj',2,2);//2代表需要锚点aHtml
                    $("#department").css({display:"block"});
                    $("#anchor ul").css({display:"block"})
                }
            },
            bindEvent : function(){
                $("body").on("click",".classification",this.toOneMsg);
                $('.right').on('click',$.proxy(this.seach,this));//输入框为空时  点击搜索  刷新当前页面
                $('.searchDelete').on('click',$.proxy(this.seach,this));//点击搜索框内清除图片  刷新当前页面
                $('#department').on('click',$.proxy(this.deptClass,this))
            },
            //根据右下角图标的切换  渲染不同的页面
            deptClass : function(){//图标显示为部门
                $("#search").val('');//清空搜索框里的值
                if($("#department img").attr("src")=="resource/css/myImg/bmqh.png"){ 
                    //alert(1111)
                    $("#department img").attr("src","resource/css/myImg/xmqh.png")
                    this.renderPage(this.deptObj,'obj',1,2);
                    $("#anchor ul").css({display:"none"})
                }else{//图标显示为姓名
                    $("#department img").attr("src","resource/css/myImg/bmqh.png")
                    this.renderPage(this.inTurnObj,'obj',2,2);
                    $("#anchor ul").css({display:"block"})
                }                 
            },

            seach : function(){
                var val = $("#search").val();
                if(val==""||val==null){
                    this.tabIndex(this.tab)//搜索框为空 点击搜索 恢复到之前
                }
                if(!val){return};
                if(this.tab == 1){
                    //alert(JSON.stringify(this.mineObj))
                    this.seachRes(val,{"mine":this.mineObj});//本部搜索
                }else{
                    this.seachRes(val,this.inTurnObj);//全部搜索
                }
                if(!this.resObj[0]){
                    //alert("")
                    $("#class").html('<P class="pointsFont">没有您输入的数据</p>');
                    return
                }
                if(this.tab == 0){
                    this.renderPage(this.resObj,'arr',2,1)//全部里搜索  渲染页面
                }else{
                    this.renderPage(this.resObj,'arr',1,1)//部门里搜索  渲染页面
                }
            },
            seachRes : function(val,obj){//得到搜索集合  this.resObj;
                this.resObj = [];
                this.resDeptObj = {};
                for(i in obj){
                    var x = obj[i];
                    for(var j=0;j<x.length;j++){
                        var num = x[j].orgName;
                        var name = x[j].userName;
                        var rex = new RegExp(val);
                        if(rex.test(num) || rex.test(name)){
                            this.resObj.push(x[j])
                            //alert(JSON.stringify(this.resObj))                              
                        }
                    }  
                }
            },
            toOneMsg : function(){
                var nullobj = [];
                nullobj[0] = $(this).find("input[type='hidden']")[0].value;
                appcan.locStorage.setVal("Library",nullobj);
                appcan.openWinWithUrl("information", "../information/information.html");
            },
            
            //A-Z和部门分类的传的obj是对象                          本部和搜索传的obj是数组      
            //AZstate  1:不显示右边锚点             2：显示右边锚点
            //Title    1：不显示分类类别            2：显示分类类别
            //type      arr：数组                        obj：对象
            renderPage : function(obj,type,AZstate,Title){
                $('#class').empty();//里面插入联系人列表
                $('#anchor ul').empty();//A-Z锚点
                var aHtml = '';
                var sHtml = '';
                if(type == 'obj'){//锚点和列表  
                    for (var i in obj) {
                        var p = obj[i]; 
                        var z = "";           
                        for(var j=0;j<=25;j++){//锚点html
                            if(!this.azObj[this.az[j]]){
                                if(i == this.az[j]){
                                     this.azObj[this.az[j]] = '<a href="#'+ this.az[j] +'"><li>'+ this.az[j] +'</li></a>';
                                }else{
                                    this.azObj[this.az[j]] = '<li>'+ this.az[j] +'</li>';
                                }
                            }else{
                                if(i == this.az[j]){
                                    this.azObj[this.az[j]] = '<a href="#'+ this.az[j] +'"><li>'+ this.az[j] +'</li></a>';
                                }else{
                                    if(i == this.az.length-1){
                                        this.azObj[this.az[j]] = '<li>'+ this.az[j] +'</li>';
                                    }
                                }                                
                            }
                        }
                        if(Title == 2){//判断是否需要分类类别
                            if(i.length>1){//判断是否是部门排列 部门排列去掉id 非部门加id
                                sHtml += '<div class="allDep ub"><span class="ulev24 ub ub-ac">'+i+'</span></div>';
                            }else{
                                sHtml += '<div class="allDep ub " id='+i+'><span class="ulev24 ub ub-ac">'+i+'</span></div>';
                            }
                            
                            //alert(sHtml)                           
                        }
                        sHtml += this.renderList(p,AZstate,Title)//得到联系人的html
                        
                    }
                    for(i in this.azObj){
                        z += this.azObj[i]
                    }           
                    aHtml = '<a href="#top"><li><img src="resource/css/myImg/jian.png"/></li></a>' + z;
                    this.azHtml = aHtml;
                    if(AZstate == 2){////////////////显示全部//////////////
                        $('#anchor ul').html(aHtml);
                        $('#class').html(sHtml);
                    }else{/////////////////显示部门分类//////////////
                        $('#class').html(sHtml);
                    }
                }else{/////////////////////////////////////////////////列表
                    sHtml = this.renderList(obj,AZstate,Title)//得到联系人的html
                    if(AZstate == 2){/////////////////搜索全部//////////////
                        $('#anchor ul').html(this.azHtml);
                        $('#class').html(sHtml);
                    }else{/////////////////搜索部门    本部门//////////////
                        $('#class').html(sHtml);
                    }
                }
            },
            renderList : function(p,AZstate,Title){
                var sHtml = '';
                var icon="";
                for (var i = 0; i < p.length; i++) {          
                    var subP = p[i];
                    var photoImg = subP.profilePhoto;
                    if(AZstate == 1 && Title == 2){//部门渲染不需要部门模块
                        var deptHtml = '';
                    }else{
                        var deptHtml = '<div><span class="test_hidden lineHeight pr105em">'+(subP.parentOrgName==null?(subP.parentOrgNames):subP.parentOrgName+">"+subP.orgName)+'</span></div>';

                    }
                    if(subP.sex == "女"){
                        icon="resource/css/myImg/nvtou.png"
                    }else{
                        icon="resource/css/myImg/nantou.png"
                    }
                    var tempUserName = subP.userName;
                    if(subP.status == 0){
                        tempUserName += "<span style='color:#999'>（未激活）</span>";
                    }
                    sHtml +='<div class="classification ub ub-ac clr666 ulev26">'+
                            '<input type="hidden" value="'+subP.objectId+'" />'+
                            '<div class="IMG"><img src=" '+icon+' "/></div>'+
                            '<div class="leftStyle ub ub-ver">'+
                                '<div><span class="test_hidden lineHeight clr333">'+tempUserName +'</span></div>'+
                                '<div><span class="test_hidden lineHeight">'+subP.mobileNum +'</span></div>'+
                            '</div>'+
                            '<div class="ub ub-f1 ub-ver">'+
                                deptHtml +//部门模块
                                '<div><span class="test_hidden lineHeight pr105em">'+(subP.roleNames==null?"":subP.roleNames)+'</span></div>'+
                            '</div>'+
                        '</div>';
                }
                return sHtml;
            },
            getData : function(){//从后台获取数据
                var that = this
                baseOperation.londingToast("数据加载中，请稍候...",2000);
                var jasHttpRequest = new JasHttpRequest();
                var userBo=JSON.parse(appcan.locStorage.getVal("userBo"));
                var enterpriseId = userBo.enterpriseId;
                //alert(userBo.enterpriseId)
                var tempName = userBo.orgName;
                var parentOrgName = userBo.parentOrgNames;
                   //alert(JSON.stringify(userBo));
                var partURL = "cloudlink-core-framework/user/queryList?enterpriseId="+enterpriseId+"&status=0,1";
                    //Get请求
                jasHttpRequest.jasHttpGet(partURL,function(id, state, dbSource){
                    //alert(dbSource);
                    baseOperation.closeToast(); 
                    if(dbSource.length==0){
                       baseOperation.alertToast("网络繁忙，请稍候再试...");
                       return ;
                    }        
                    that.data=JSON.parse(dbSource).rows;
                    appcan.locStorage.setVal("dataObj",that.data);
                    that.sortData(parentOrgName,tempName);//整理数据
                    that.tabIndex(0);//打开之后默认渲染内容
                    that.bindEvent();//绑定事件
                    //alert(JSON.stringify(that.data))
                 })
            },
            sortData : function(parentOrgName,tempName){
                var letterObj = {};
                var parentDept = {};
                var arr = this.data;
                var parentStr = parentOrgName;
                var str = tempName; //从this.data中取出来所属部门赋值
                //alert(str)
                
                for (var i = 0, l = arr.length; i < l; i++) {
                    if(arr[i].userName==null||arr[i].userName==""){
                        //alert(111)
                    }else{
                        var surName = arr[i].userName.substr(0,1); //姓
                        var REX=/\w/i;//匹配字母正则式
                        if(REX.test(surName)){
                            var upcase=surName.toUpperCase();//把字母转化成大写
                             if(!letterObj[upcase]){
                                letterObj[upcase] = [];
                            }
                            letterObj[upcase].push(arr[i]);
                        }else{
                            var fl = pinyin.getCamelChars(surName); //首字母
                            if(!letterObj[fl]){
                                letterObj[fl] = [];
                            }
                            letterObj[fl].push(arr[i]);
                        }
                    }
                    //父级部门分类
                    var dept = arr[i].parentOrgNames; //父级部门 
                    if(!parentDept[dept]){
                        parentDept[dept] = [];
                    }
                    parentDept[dept].push(arr[i]);
                }
                //循环父级部门，按部门分类放到  this.deptObj
                //this.mineObj    本部门
                for(var i in parentDept){
                    var list = parentDept[i];
                    for(var j=0;j<list.length;j++){
                        var val = list[j].orgName
                        if(i == val){
                            var key = i;
                        }else{
                            var key = i+">"+val;
                        }
                        if(!this.deptObj[key]){
                            this.deptObj[key] = [];
                        }
                        this.deptObj[key].push(list[j])
                        //解决本部们为根部门是  本部显示问题  
                        if((parentStr == ""||parentStr == null||parentStr == i) && str == val){
                            this.mineObj.push(list[j])
                        }
                    }
                }
                //把 letterObj 的ABCD内容排序，放到 inTurnObj 中 ；
                for(var i = 0;i<this.az.length;i++){
                    for(j in letterObj){
                        var Name = letterObj[j][0].userName.substr(0,1); //姓
                        var py = pinyin.getCamelChars(Name).toUpperCase(); //首字母 
                        if(py == this.az[i]||!REX.test(py)){
                            this.inTurnObj[py] = letterObj[j];
                        }
                    }
                }
                //alert(JSON.stringify(this.mineObj))
                //alert(JSON.stringify(this.deptObj))
                //alert(JSON.stringify(this.inTurnObj))
            }
          }
    appcan.ready(function() {
        obj.init();
    })