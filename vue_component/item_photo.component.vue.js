

// 依赖 item-detail 组件

Vue.component('item-photo',{
    model :{
        prop: 'value',
        event: 'change'
    },
    props:{
        value : {
            type : Array,
            default : function(){
                return [];
            }
        },
        bigvalue : {
            type : Array,
            default : function(){
                return [];
            }            
        },
        isoperate : Boolean, //是否可操作图片
        maxqtty : { //最大上传数量
            type : [Number,String],
            default : 9
        }
    },
    template : [
        '<div>',
            '<item-detail :name="name" :value="titlevalue" :icon="icon" :borderbottom="true" @clickicon="addPhoto"></item-detail>',
            '<div v-show="value.length" class="clearfloat" :style="style.imgswrapp">',

                '<div v-for="item,index in value" class="clearfloat " :style="[style.imgwrapp,createBg(item)]" @click="previewPic(index)" >',
                    '<div :style="[style.square]" class="_itemImg"></div>',
                '</div>',
            '</div>',  
            '<div v-show="value.length" style="margin: 0 .625em;height:0;border-bottom:1px solid #ececec"></div>' ,

        '</div>' 
    ].join(''), 
    data : function(){
        return {
            style:{
                imgswrapp :{
                    'margin' : '.315em',
                },
                imgwrapp :{
                    'border':'.31em solid white', 
                    'box-sizing':'border-box',
                    'width':'33.3%',
                    // 'background': 'url(../src/images/map_h.png) no-repeat center',
                    'float':'left',                   
                },
                square :{
                    'height': '0px',
                    'padding-bottom': '100%',
                    'border' : '1px solid #ebebeb',
                    'box-sizing' :'border-box'
                }
            }
        };
    },
    computed : {
        icon : function(){
            return ((this.value.length >= this.maxqtty)|| !this.isoperate) ? '' : '../src/images/camera.png';            
        },
        name : function(){
            return  this.isoperate ? '上传图片' : '照片';
        },
        titlevalue : function(){
            return this.isoperate ?(this.value.length + ' / ' + this.maxqtty):'';
        },
        bigValue : function(){
            if (this.bigvalue.length === 0) {
                return this.value;
            }
            return this.bigvalue;
        },
    },    
    methods : {
        triggerChange : function(s){
            this.$emit('change',s);
        },
        createBg : function(sUrl){
            return {
                'backgroundImage' : 'url('+ sUrl +')',
                'background-size': 'cover'
            };
        },
        longtap : function(){
            alert('longtap');
        },
        addPhoto : function(){
            var that = this;
            var x = 0;
            var y = 0;
            var width = 0;
            var height = 0;
            var JsonData = {
                "actionSheet_style": {
                    "frameBgColor": "#00000000",
                    "frameBroundColor": "#00000000",
                    "frameBgImg": "",
                    "btnSelectBgImg": "res://btn.png",
                    "btnUnSelectBgImg": "res://btn.png",
                    "cancelBtnSelectBgImg": "res://btn.png",
                    "cancelBtnUnSelectBgImg": "res://btn.png",
                    "textSize": "17",
                    "textNColor": "#333",
                    "textHColor": "#333",
                    "cancelTextNColor": "#333",
                    "cancelTextHColor": "#333",
                    "actionSheetList": [{
                        "name": "拍照"
                    }, {
                        "name": "从相册选择"
                    }]
                }
            };
            uexActionSheet.open(x, y, width, height, JSON.stringify(JsonData));
            uexActionSheet.onClickItem = function(data) {
                if (+data === 1) {
                    that.openAlbumAndSetCallBack();
                    //打开相册
                } else if (+data === 0) {
                    that.openCarme();
                    //打开照相机
                }
            };            
        },
        openAlbumAndSetCallBack : function(){
            var that = this;
            var albumData = {
                min: 1,
                max: that.maxqtty - that.value.length,
                quality: 0.5,
                detailedInfo: false
            };
            uexImage.openPicker(JSON.stringify(albumData));
            uexImage.onPickerClosed = function(info) {
                //alert(info)
                var objData = JSON.parse(info);
                if (!objData.isCancelled) {
                    var aUrls = objData.data; //选中的图片url数组，可直接用于图片的src
                    var aValue = [].concat.apply(that.value,aUrls);
                    setTimeout(function() {
                        that.changeValue(aValue);
                    }, 300);
                }
            };
        },        
        openCarme : function(){
            var that = this;
            uexCamera.openInternal(0, 75);
            uexCamera.cbOpenInternal = function(opCode, dataType, data) {
                if (data) {
                    var aUrls = [data]; //拍照url数组，可直接用于图片的src
                    var aValue = [].concat.apply(that.value,aUrls);
                    setTimeout(function() {
                        that.changeValue(aValue);
                    }, 300);
                }
            };
        }, 
        previewPic: function(index) {
            uexImage.openBrowser(JSON.stringify({
                displayActionButton: true,
                displayNavArrows: true,
                enableGrid: false,
                startOnGrid: false,
                startIndex: index || 0,
                data: this.bigValue
            }));
        },
        changeValue : function(aValue){ //更改父元素的图片数组，入参 新的数组
            this.$emit('change',aValue);
        }        
    },
    mounted : function(){
        var that = this;
        if (!this.isoperate) { //不需要操作图片，则返回
            return;
        }
        $('body').on('longTap','._itemImg',function(e){ //长按显示删除气泡
            var obj = $(e.currentTarget).parent()[0];
            that.index = $(obj).index();
            //console.log(index)
            $("#bubble").remove();
            //timeOutEvent = 0;
            var left = $(obj).position().left;
            var top = $(obj).position().top;
            var width = $(obj).width() / 2;

            var htmlTemp = "<div id='bubble' class='bubble' style='left:" + width + "px;'><span id='delete_div'>删除</span></div>";
            $(obj).parent().append(htmlTemp);
            var x = width - $("#bubble").width() / 2 + left;
            var y = top - $("#bubble").height() - 2;
            $("#bubble").css("left", x + "px");
            $("#bubble").css("top", y + "px");            
        });

        $('body').on('click','#bubble',function(e){ //长按显示删除气泡
            //console.log(that.index)
            var aValue = [].concat.apply(that.value,[]);
            aValue.splice(that.index,1);
            that.changeValue(aValue);
            $("#bubble").remove();            
        });

        $('body').on('click',function(){ 
            $("#bubble").remove();       
        });        
    }
});