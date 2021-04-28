
var imagesObj = {
    imgArray: [],
    eventsMap: {
        'click .picList img': 'e_previewPic',
        'longTap .picList img': 'e_showDeleteBubble',
        'click #bubble': 'e_deleteImage',
        'click #choosephoto': 'e_showSelectSheet',
        'click ' : 'e_removeBubble'
    },
    init: function(obj) {
        var _obj = obj || {};
        this.initParams(_obj);
        this.bindEvent();
        this.renderPicAndCount(_obj.aImages || []);
    },
    initParams : function(obj){
        var that = this;
        var _obj = {
            deleteCB : null,
            wrapper : '.photo_list',
            aImages : [],
            isShowOnly : 0 // 0,1
        };
        $.extend(_obj,obj);
        this.isShowOnly = _obj.isShowOnly;
        this.picWrapper = $(_obj.wrapper);
    },
    bindEvent: function() {
        this.initializeOrdinaryEvent(this.eventsMap);
    },
    initializeOrdinaryEvent: function(maps) {
        this._scanEventsMap(maps, true);
    },
    _scanEventsMap: function(maps, isOn) {
        var delegateEventSplitter = /^(\S+)\s*(.*)$/;
        var type = isOn ? 'on' : 'off';
        for (var keys in maps) {
            if (maps.hasOwnProperty(keys)) {
                if (typeof maps[keys] === 'string') {
                    maps[keys] = this[maps[keys]].bind(this);
                }
                var matchs = keys.match(delegateEventSplitter);
                $('body')[type](matchs[1], matchs[2], maps[keys]);
            }
        }
    },
    renderPicAndCount: function(arr) {
        var that = this;
        var s = '';
        arr.forEach(function(item,index){
            s += that.createTemplate(item);
        });
        $("#picNote").text("");
        that.picWrapper.append(s);
        that.updateImagesInfo();
    },
    updateImagesInfo : function(){
        var that = this;
        var arr = [];
        this.picWrapper.find('.picList img').each(function(index,dom){
            arr.push({
               attaType: "pic",
               src: $(dom).attr('src')
            });
        });
        that.imgArray = arr;
        $('.img_mun_photo').html(that.imgArray.length);
    },
    createTemplate: function(sUrl) {
        return [
            '<div class="ub-f1 picList" >',
            '<img src="' + sUrl + '"class="picListimg" alt=""/>',
            '</div>'
        ].join('');
    },
    e_previewPic: function(e) {
        var index = +$(e.target).parent().index();
        uexImage.openBrowser(JSON.stringify({
            displayActionButton: true,
            displayNavArrows: true,
            enableGrid: false,
            startOnGrid: false,
            startIndex: index || 0,
            data: this.imgArray
        }));
    },
    e_removeBubble : function(){
        $("#bubble").remove();
    },
    e_showDeleteBubble: function(e) {
        if(+this.isShowOnly){
            return;
        }        
        var obj = e.target;
        $("#bubble").remove();
        timeOutEvent = 0;
        var left = $(obj).position().left;
        var top = $(obj).position().top;
        var width = $(obj).width() / 2;
        var divId = $(obj).parent().attr("id");
        var htmlTemp = "<div id='bubble' class='bubble' style='left:" + width + "px;'><span id='delete_div'>删除</span></div>";
        $(obj).parent().append(htmlTemp);
        var x = width - $("#bubble").width() / 2 + left;
        var y = top - $("#bubble").height() - 2;
        $("#bubble").css("left", x + "px");
        $("#bubble").css("top", y + "px");
    },
    e_deleteImage: function(e) {
        if(+this.isShowOnly){
            return;
        }
        $(e.target).parents('.picList')[0].remove();
        this.updateImagesInfo();
    },
    e_showSelectSheet: function() { //添加图片
        if(+this.isShowOnly){
            return;
        }        
        if (parseInt($(".img_mun_photo").text()) > 8) {
            baseOperation.alertToast("最多只能上传9张照片");
            return;
        }        
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
            if (data == 1) {
                that.openAlbumAndSetCallBack();
                //打开相册
            } else if (+data === 0) {
                that.openCarme();
                //打开照相机
            }
        };
    },
    openAlbumAndSetCallBack: function() { //打开相册
        var that = this;
        var currentPicCount = +$(".img_mun_photo").text();
        var albumData = {
            min: 1,
            max: 9 - currentPicCount,
            quality: 0.5,
            detailedInfo: false
        };
        uexImage.openPicker(JSON.stringify(albumData));
        uexImage.onPickerClosed = function(info) {
            //alert(info)
            var objData = JSON.parse(info);
            if (!objData.isCancelled) {
                var aUrls = objData.data;
                setTimeout(function() {
                    that.renderPicAndCount(aUrls);               
                }, 300);                    
            }
        };
    },
    openCarme: function() { //打开照相机
        var that = this;
        uexCamera.openInternal(0, 75);
        uexCamera.cbOpenInternal = function(opCode,dataType,data) {
            if (data) {
                setTimeout(function() {
                    that.renderPicAndCount([data]);               
                }, 300);                
            }
        };
    }
};

