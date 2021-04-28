/*
 * 依赖：common_voice.css文件
 * 依赖：html代码片段
                <div id="voiceFiles" ">
                    <div id="audio" class="audio" style="left: 2%;width: 92%;">
                        <div class="audio_img" id="audio_img" style="float: left"></div>
                        <div id="voiceTime" style="float: right;margin-right: .5em;"></div>
                    </div>
                </div>
 *
 * 使用方法： voiceObj.init(sVoiceId);
*/

(function(window, appcan, $, JasHttpRequest) {
    var obj = {
        isNotPalyVoice : true,
        voiceId: '',
        recordPath: '',
        eventsMap: {
            'tap #audio': 'e_playAudio',
        },
        init: function(sVoiceId) {
            this.voiceId = sVoiceId || '';
            this.$audio_img = $('#audio_img');
            this.jasHttpRequest = new JasHttpRequest();
            this.bindEvent();
            this.setCbForPlayFinished();
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
        e_playAudio: function() {
            var that = this;
            if (!that.recordPath) {
                that.requestUrlById(this.voiceId);
            } else {
                if (that.isNotPalyVoice) {
                    var recordPath = that.recordPath;
                    that.isNotPalyVoice = false;
                    that.$audio_img.addClass("audio_img_animation");
                    uexAudio.open(recordPath);
                    uexAudio.setProximityState('1');
                    uexAudio.play(0);
                } else {
                    uexAudio.stop();
                    that.isNotPalyVoice = true;
                    that.$audio_img.removeClass("audio_img_animation");
                }
            }
        },
        setCbForPlayFinished: function() {
            /**
             * 录音播放完成回调
             */
            var that = this;
            uexAudio.onPlayFinished = function(loopTime) {
                that.isNotPalyVoice = true;
                that.$audio_img.removeClass("audio_img_animation");
            };
        },        
        requestUrlById: function(sId) {
            var that = this;
            baseOperation.londingToast("正在加载录音，请稍后", 9999);            
            var url = "cloudlink-core-file/file/getUrlByFileId?fileId=" + sId;
            this.jasHttpRequest.jasHttpGet(url, function(id, state, dbSource) {
                if (dbSource.length == 0) {
                    baseOperation.alertToast("网络繁忙，请稍候再试...");
                    return;
                }
                baseOperation.closeToast();
                var resultData = JSON.parse(dbSource);
                if (resultData.success == "1") {
                    var audioFils = resultData.rows;
                    if (audioFils.length > 0) {
                        that.recordPath = audioFils[0].fileUrl;
                        that.e_playAudio();
                    } else {
                        baseOperation.alertToast("网络繁忙，请稍候再试...");
                    }
                }
            });
        }


    }
    window.playVoiceObj = obj;
})(window, appcan, Zepto, JasHttpRequest)
