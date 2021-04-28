var imagesObj = {
    imgArray : [],
    jasHttpRequest : new JasHttpRequest,
    numDom : '',
    bizType : '',
    picnum : '',
    eventsMap : {
        'click .picList img' : 'e_previewPic',
        'longTap .deleteimg' : 'e_showDeleteBubble',
        'click #bubble' : 'e_deleteImage',
        'click ' : 'e_removeBubble'
    },
    init : function(obj) {
        this.bindEvent();
    },
    bindEvent : function() {
        this.initializeOrdinaryEvent(this.eventsMap);
    },
    initializeOrdinaryEvent : function(maps) {
        this._scanEventsMap(maps, true);
    },
    _scanEventsMap : function(maps, isOn) {
        var delegateEventSplitter = /^(\S+)\s*(.*)$/;
        var type = isOn ? 'on' : 'off';
        for (var keys in maps) {
            if (maps.hasOwnProperty(keys)) {
                if ( typeof maps[keys] === 'string') {
                    maps[keys] = this[maps[keys]].bind(this);
                }
                var matchs = keys.match(delegateEventSplitter);
                $('body')[type](matchs[1], matchs[2], maps[keys]);
            }
        }
    },
    addpicture : function(dom, bizType, picnum) {
        var that = this;
        that.numDom = dom;
        that.bizType = bizType;
        that.picnum = picnum;
        var x = 0;
        var y = 0;
        var width = 0;
        var height = 0;
        var JsonData = {
            "actionSheet_style" : {
                "frameBgColor" : "#00000000",
                "frameBroundColor" : "#00000000",
                "frameBgImg" : "",
                "btnSelectBgImg" : "res://btn.png",
                "btnUnSelectBgImg" : "res://btn.png",
                "cancelBtnSelectBgImg" : "res://btn.png",
                "cancelBtnUnSelectBgImg" : "res://btn.png",
                "textSize" : "17",
                "textNColor" : "#333",
                "textHColor" : "#333",
                "cancelTextNColor" : "#333",
                "cancelTextHColor" : "#333",
                "actionSheetList" : [{
                    "name" : "拍照"
                }, {
                    "name" : "从相册选择"
                }]
            }
        };
        uexActionSheet.open(x, y, width, height, JSON.stringify(JsonData));
        uexActionSheet.onClickItem = function(data) {
            if (data == 1) {
                that.openAlbumAndSetCallBack();
                //打开相册
            } else if (data == 0) {
                that.openCarme();
                //打开照相机
            }

        };
    },
    openAlbumAndSetCallBack : function() {//打开相册
        var that = this;
        var pemun = parseInt($("." + that.numDom).text());
        var pnum = parseInt(that.picnum) - pemun;
        var albumData = {
            min : 1,
            max : pnum,
            quality : 0.5,
            detailedInfo : false
        };
        uexImage.openPicker(JSON.stringify(albumData));
        uexImage.onPickerClosed = function(info) {
            var objData = JSON.parse(info);
            if (!objData.isCancelled) {
                var aUrls = objData.data;
                setTimeout(function() {
                    that.renderPicAndCount(aUrls);
                }, 300);
            }
        };
    },
    openCarme : function() {//打开照相机
        var that = this;
        uexCamera.openInternal(0, 75);
        uexCamera.cbOpenInternal = function(opCode, dataType, data) {
            if (data) {
                setTimeout(function() {
                    that.renderPicAndCount([data]);
                }, 300);
            }
        };
    },
    renderPicAndCount : function(aUrls) {
        var option = "";
        var that = this;
        aUrls.forEach(function(item, index, arr) {
            var mun = parseInt($("." + that.numDom).text());
            $("." + that.numDom).text(mun + 1);
            option += that.createTemplate(item);
        });
        $('.' + that.bizType).append(option);
        that.updateImagesInfo();
    },
    createTemplate : function(sUrl) {
        var that = this;
        return ['<div class="picList ufl ub-ac deleteimg" pictype="' + that.bizType + '" picnum="' + that.picnum + '" numDom="' + that.numDom + '"style="border:.24em solid white; box-sizing:border-box;width:33.3%;" >', '<div style="height: 0px;padding-bottom: 100%;"></div>', '<div class="uof uabs" style="height: 100%;width: 100%;">', '<img src="' + sUrl + '" width="100%" style="top: 50%;-webkit-transform: translateY(-50%);transform: translateY(-50%)" class="uabs"/>', '</div></div>'].join('');
    },
    updateImagesInfo : function() {
        var that = this;
        var arr = [];
        var arrType = {
            'pictype' : that.bizType,
            dataList : ''
        };
        $("." + that.bizType).find('.picList img').each(function(index, dom) {
            arr.push({
                attaType : that.bizType,
                src : $(dom).attr('src')
            });
        });
        $("." + that.numDom).text(arr.length);
        /**更新的时候，将数组进行重新组装1、将原数组中含有该类型的图片进行过滤掉，2、进行该类型的图片重新进行添加*/
        if (that.imgArray.length > 0) {
            that.imgArray.forEach(function(item, index, ar) {
                if (item.pictype == that.bizType) {
                    that.imgArray.splice(index, 1);
                    return;
                }
            });
        }
        if (arr.length > 0) {
            arrType.dataList = arr;
            that.imgArray.push(arrType);
        }
    },
    e_showDeleteBubble : function(e) {
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
    e_deleteImage : function(e) {
        var that = this;
        $(e.target).parents('.picList')[0].remove();
        that.bizType = $(e.target).parents().parents().attr('pictype');
        that.numDom = $(e.target).parents().parents().attr('numDom');
        that.picnum = $(e.target).parents().parents().attr('picnum');
        this.updateImagesInfo();
    },
    e_removeBubble : function() {
        $("#bubble").remove();
    },
    e_previewPic : function(e) {
        var that = this;
        var index = +$(e.target).parents('.picList').index();
        that.bizType = $(e.target).parents().parents().attr('pictype');
        var ImageList = []
        that.imgArray.forEach(function(item, index, arr) {
            if (item.pictype == that.bizType) {
                ImageList = item.dataList;
                return;
            }
        });
        uexImage.openBrowser(JSON.stringify({
            displayActionButton : true,
            displayNavArrows : true,
            enableGrid : false,
            startOnGrid : false,
            startIndex : index || 0,
            data : ImageList
        }));
    },
    renderPicByDataFromService : function(bizType, callback) {//请求服务器数据，进行图片的预览功能
        var that = this;
        var falg = false;
        var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
        var partURL = "cloudlink-core-file/attachment/getFileIdListByBizIdAndBizAttr?businessId=" + userBo.enterpriseId + "&bizType=" + bizType;
        that.jasHttpRequest.jasHttpGet(partURL, function(id, state, dbSource) {
            var dataobj = JSON.parse(dbSource);
            if (dataobj.success == 1) {
                if (dataobj.rows.length > 0) {
                    that.refreshImgSrc(dataobj.rows, bizType);
                    falg = true;
                }
                callback(dataobj.rows.length);
            } else {
                baseOperation.alertToast("网络繁忙，请稍后再试...");
            }
        });
    },
    refreshImgSrc : function(aData, bizType) {
        var arrType = {
            'pictype' : bizType,
            dataList : ''
        };
        var aList = [];
        var html = '';
        for (var i = 0; i < aData.length; i++) {
            var fileid = aData[i].fileId;
            var src = serverURL + "cloudlink-core-file/file/getImageBySize?fileId=" + fileid + "&viewModel=fill&width=82&hight=82";
            var bigSrc = serverURL + "cloudlink-core-file/file/downLoad?fileId=" + fileid;
            aList.push({
                attaType : bizType,
                src : bigSrc
            });
            html += this.createTemplateByView(src, bizType);
        }

        $("." + bizType).append(html);
        arrType.dataList = aList;
        this.imgArray.push(arrType);
    },
    createTemplateByView : function(sUrl, bizType) {
        return ['<div class="picList ufl ub-ac" pictype="' + bizType + '"style="border:.24em solid white; box-sizing:border-box;width:33.3%;" >', '<div style="height: 0px;padding-bottom: 100%;"></div>', '<div class="uof uabs" style="height: 100%;width: 100%;">', '<img src="' + sUrl + '" width="100%" style="top: 50%;-webkit-transform: translateY(-50%);transform: translateY(-50%)" class="uabs"/>', '</div></div>'].join('');
    },
};
