appcan.ready(function() {
    positionObj.init();
});
var positionObj = {
    eventMap: {
        'click .clear': 'e_clear', //清空填入的内容
        'click #submit': 'e_submit', //职位设定后进行提交
    },
    init: function() {
        this.render();
        this.bindEvent();
    },
    render: function() {
        var userPosition = "";
        userPosition = appcan.locStorage.getVal("userPosition");
        appcan.locStorage.remove("userPosition");
        if (userPosition == null || userPosition == "") {
            document.getElementById("position").value = "";
        } else {
            document.getElementById("position").value = userPosition;
        }
    },
    bindEvent: function() {
        appcan.button("#nav-left", "btn-act", function() {
            appcan.window.close(-1);
        });
        this.initializeOrdinaryEvent(this.eventMap);
    },
    initializeOrdinaryEvent: function(maps) {
        this._scanEventMap(maps, true);
    },
    _scanEventMap: function(maps, isOn) {
        var eventSplitter = /^(\S+)\s*(.*)$/;
        var type = isOn ? 'on' : 'off';
        for (var keys in maps) {
            if (maps.hasOwnProperty(keys)) {
                if (typeof maps[keys] === 'string') {
                    maps[keys] = this[maps[keys]].bind(this);
                }
                var matchs = keys.match(eventSplitter);
                $('body')[type](matchs[1], matchs[2], maps[keys]);
            }
        }
    },
    e_clear: function() {
        document.getElementById("position").value = "";
    },
    e_submit: function() {
        var position = document.getElementById("position").value.trim();
        if (position == null || position == "") {
            baseOperation.alertToast("职位不能为空");
        } else if(position.length>20){
            baseOperation.alertToast("职位不能超过20个字");
        }else{
            appcan.locStorage.setVal("position", position);
            // reloadUserBoLocStorage("position", position);
            appcan.window.evaluateScript('setfunction', 'setObj.changeposition()');
            appcan.window.close(-1);
        }
    }
}