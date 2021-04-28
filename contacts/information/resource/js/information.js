 appcan.ready(function() {
            appcan.initBounce();  
        })
        var jasHttpRequest = null;
        var information = {
            name:$('#listview1 #right .name span'),
            headerimg:$('#listview1 #left img'),
            age:$('#listview1 #right .age'),
            sex:$('#listview1 #right .name img'),
            department:$('#listview2 .ubver .department'),
            position:$('#listview2 .ubver .position'),
            phone:$('#listview3 .ubver .hao'),
            qq:$('#listview3 .ubver .qq'),
            WeChat:$('#listview3 .ubver .WeChat'),
            email:$('#listview3 .ubver .email'),
            //信息
            message: {},
            receive : function(){
                //获取到id
                var id = appcan.locStorage.getVal("Library");
                var idObj = JSON.parse(id);
                //console.log(idObj);
                //获取到全部数据
                var data = appcan.locStorage.getVal("dataObj");
                var dataObj = JSON.parse(data);
                //var hh=JSON.stringify(dataObj);
               // var jjj=message.profilePhoto;
                if(!idObj){
                    var idObj = [];
                    var dataObj = [];
                    idObj[0] = "";
                }
                var id = idObj[0];
                for(var i=0;i<dataObj.length;i++){
                    if(id == dataObj[i].objectId){
                        this.message = dataObj[i];
                        //alert(JSON.stringify(this.message))
                        break;
                    }
                }
            },
            render : function(){
                jasHttpRequest = new JasHttpRequest();
                this.name.html(this.message.userName);
                this.age.html(this.message.age);
               //alert(this.message.profilePhoto)
               //人员头像的图片确定
                if(this.message.profilePhoto){
                    this.headerimg.attr("src",serverURL + "cloudlink-core-file/file/getImageBySize?fileId=" + this.message.profilePhoto + "&viewModel=fill&width=500&hight=500");
                }else{
                    if(this.message.sex == "女"){
                        this.headerimg.attr("src","../addressbook/resource/css/myImg/nvtou.png"); 
                    }else{
                        this.headerimg.attr("src","../addressbook/resource/css/myImg/nantou.png"); 
                    } 
                }
                //人员性别的图片的确定
                if(this.message.sex == "女"){
                    this.sex.attr("src","../addressbook/resource/css/myImg/nv.png");
                }else{
                    this.sex.attr("src","../addressbook/resource/css/myImg/nan.png");
                }
                //alert(this.message.headImg) 
                this.department.html(this.message.orgName);
                this.position.html(this.message.position);
                this.phone.html(this.message.mobileNum);
                this.qq.html(this.message.qq);
                this.WeChat.html(this.message.wechat);
                this.email.html(this.message.email);
            },
            caller : function(){
                this.receive();
                this.render();
            }
        }
        information.caller();
        $("#listview3 img").click(function(){
            uexCall.dial(information.message.mobileNum);
        })