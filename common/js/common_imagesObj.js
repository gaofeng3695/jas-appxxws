/*
** created by GF on 2017.5.4
** 依赖 #choosephoto 点击选择图片的选择器
** 依赖 .photo_list 存放图片的容器的选择器，可通过传参更改，此选择器需要使用伪类清除浮动
** .clearfloat:after{display:block;clear:both;content:"";visibility:hidden;height:0}
** imagesObj.init({}); {wrapper：'.photo_list'}
**
** imagesObj.renderPicAndCount(aImg) aImg [{}] 图片数组
** 
*/


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
    initParams: function(obj) {
        var that = this;
        var _obj = {
            wrapper: '.photo_list',
            max : 9,
            domCount : '.img_mun_photo',
            domMax : '',
            aImages: [],
            isShowOnly: 0 ,// 0,1            
        };
        $.extend(_obj, obj);
        this.isShowOnly = _obj.isShowOnly;
        this.picWrapper = $(_obj.wrapper);
        this.max = _obj.max;
        this.domCount = $(_obj.domCount);
        this.domMax = $(_obj.domMax);

        this.picWrapper.addClass('clearfloat').css('margin','-0.24em');
        this.domMax.html(this.max);        
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
        if (!arr) {return}
        arr.forEach(function(item, index) {
            s += that.createTemplate(item);
        });
        $("#picNote").text("");
        that.picWrapper.append(s);
        that.updateImagesInfo();
    },
    updateImagesInfo: function() {
        var that = this;
        var arr = [];
        this.picWrapper.find('.picList img').each(function(index, dom) {
            arr.push({
                attaType: "pic",
                src: $(dom).attr('src')
            });
        });
        that.imgArray = arr;
        that.domCount.html(that.imgArray.length);
    },
    createTemplate: function(sUrl) {
        return [
            '<div class="picList ufl ub-ac " style="border:.24em solid white; box-sizing:border-box;width:33.3%;" >',
            '<div style="height: 0px;padding-bottom: 100%;"></div>',
            '<div class="uof uabs" style="height: 100%;width: 100%;background:url('+sUrl+') no-repeat center center;background-size:cover;border:1px solid #ececec;box-sizing:border-box;" >',
            '<img src="'+ sUrl +'" width="100%" height="100%" style="opacity:0;" class="uabs"/>',
            '</div></div>'
        ].join('');

        // return [
        //     '<div class="ub-f1 picList" >',
        //     '<img src="' + sUrl + '"class="picListimg" alt=""/>',
        //     '</div>'
        // ].join('');
    },
    e_previewPic: function(e) {
        var index = +$(e.target).parents('.picList').index();
        uexImage.openBrowser(JSON.stringify({
            displayActionButton: true,
            displayNavArrows: true,
            enableGrid: false,
            startOnGrid: false,
            startIndex: index || 0,
            data: this.imgArray
        }));
    },
    e_showDeleteBubble: function(e) {
        if (+this.isShowOnly) {
            return;
        }
        var obj = $(e.target).parent()[0];
        $("#bubble").remove();
        //timeOutEvent = 0;
        var left = $(obj).position().left;
        var top = $(obj).position().top;
        var width = $(obj).width() / 2;
        var divId = $(obj).parent().attr("id");
        var htmlTemp = "<div id='bubble' class='bubble' style='left:" + width + "px;'><span id='delete_div'>删除</span></div>";
        $(obj).parents('.picList').append(htmlTemp);
        var x = width - $("#bubble").width() / 2 + left;
        var y = top - $("#bubble").height() - 2;
        $("#bubble").css("left", x + "px");
        $("#bubble").css("top", y + "px");
    },
    e_deleteImage: function(e) {
        if (+this.isShowOnly) {
            return;
        }
        $(e.target).parents('.picList')[0].remove();
        this.updateImagesInfo();
    },
    e_removeBubble : function(){
        $("#bubble").remove();
    },    
    e_showSelectSheet: function() { //添加图片
        var that = this;
        if (+this.isShowOnly) {
            return;
        }
        if (parseInt(that.domCount.text()) > (that.max - 1)) {
            baseOperation.alertToast("最多只能上传"+ that.max +"张照片");
            return;
        }
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
        var currentPicCount = +that.domCount.text();
        var albumData = {
            min: 1,
            max: that.max - currentPicCount,
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
        uexCamera.cbOpenInternal = function(opCode, dataType, data) {
            if (data) {
                setTimeout(function() {
                    that.renderPicAndCount([data]);
                }, 300);
            }
        };
    }
};
