/*
 * 直接运行 viewPicObj.init(isLocal);自动绑定预览图片大图功能
 * isLocal : boolean 是否用用本地图片
 * 直接运行 viewPicObj.destory();自动解除预览图片大图功能
 * 需求所有的图片拥有 'js_viewBig'的class名
 * 网络图片的路径需要写在data-bigSrc内
 */

var viewPicObj = {
    imgArray: null, //存放url的数组
    eventsMap: {
        'click .js_viewBig': 'e_previewPic',
    },
    init: function(isLocal) {
        this.isLocal = isLocal;
        this.imgSelector = '.js_viewBig';
        this.bindEvent();
    },
    destory: function() {
        this.unBindEvent();
    },
    e_previewPic: function(e) {
        this.updateImagesInfo();
        var index = this.imgArray.indexOf($(e.target).attr(this.attr));
        if (index < 0) {
            baseOperation.alertToast('图片预览出错，未找到该图片');
            return;
        }
        uexImage.openBrowser(JSON.stringify({
            displayActionButton: true,
            displayNavArrows: true,
            enableGrid: false,
            startOnGrid: false,
            startIndex: index,
            data: this.imgArray
        }));
    },
    updateImagesInfo: function() {
        var that = this;
        var arr = [];
        that.attr = that.isLocal?'src':'data-bigSrc';
        $('.js_viewBig').each(function(index, dom) {
            arr.push($(dom).attr(that.attr));
        });
        that.imgArray = arr;
    },
    bindEvent: function() {
        this.initializeOrdinaryEvent(this.eventsMap);
    },
    unBindEvent: function() {
        this.unInitializeOrdinaryEvent(this.eventsMap);
    },    
    initializeOrdinaryEvent: function(maps) {
        this._scanEventsMap(maps, true);
    },
    unInitializeOrdinaryEvent: function(maps) {
        this._scanEventsMap(maps, false);
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
};
