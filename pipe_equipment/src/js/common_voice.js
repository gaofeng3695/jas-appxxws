/*
 * 依赖：common_voice.css文件
 * 依赖：html代码片段
 *              <div class="" id="voice">
                    <input id="speak" class="speakBegin" type="button" value="按住说话" />
                    <!-- <img src="index/images/voice.png" height="100%" onclick="addVoice()" alt=""/>-->
                </div>
                <div id="voiceFiles" style="display: none;">
                    <div id="audio" class="audio" style="left: 2%">
                        <div class="audio_img" id="audio_img" style="float: left"></div>
                        <div id="voiceTime" style="float: right;margin-right: .5em;">21''</div>
                    </div>
                    <div class="bgDelete js_voiceDelete" style="float: right;">
                    </div>
                </div>
 *
 * 使用方法： voiceObj.init(sUrl,isOnlyShow);
 * 不填入参数 
 * 可选参数 sUrl : 录音地址
 * 可选参数 isOnlyShow : true/false 是否只显示播放样式
*/


(function(appcan, window, $, baseOperation) {
    var obj = {
        maxTime: 30,
        $voiceBtn: $('#speak'),
        $voiceFiles: $('#voiceFiles'),
        $voiceTime: $('#voiceTime'),
        $audio: $('#audio'),
        $audio_img: $('#audio_img'),
        $voiceState: null,
        $voiceTip: null,
        $voiceRange: null,

        voiceTime: 0,
        timer: null,

        isAudioTested: false, //录音测试是否完成
        isNotPalyVoice: true, //录音是否没有在播放
        recordPath: '',

        eventsMap: {

            'touchstart #speak': 'e_beginTouch',
            //'longTap #speak': 'e_beginSpeak',
            'touchend #speak': 'e_stopRecord',
            'touchcancel #speak': 'e_stopRecord',
            'click .js_voiceDelete': 'e_deleteVoice',
            'tap #audio': 'e_playAudio',
        },
        init: function(sUrl, isOnlyShow) {

            this.initVoiceTip();
            this.initState();
            this.bindEvent();
            if (!sUrl) {
                this.testAudioIfReady();
            } else {
                this.isAudioTested = true;
            }


            this.setCbForPlayFinished();
            this.setCbForVoiceRecordFinished();

            if (sUrl) {
                this.isRecording = true;
                this.recordPath = sUrl;
                this.$voiceTime.remove();
                this.e_stopRecord();
            }
            if (isOnlyShow) {
                $('.js_voiceDelete').css('display', 'none');
                this.$audio.css('width', '98%');
            }
        },
        initVoiceTip: function() { //动态添加录音提示
            var that = this;
            var s = [
                '<div style="display: block;position: absolute;">',
                '<div style="margin: 0px auto;width: 100%;text-align: center;">',
                '<span class="_pTip">开始录音</span>',
                '</div>',
                '<progress value="0" max="' + that.maxTime + '"></progress>',
                '</div>',
            ].join('');
            that.$voiceState = $(s);
            $('body').append(that.$voiceState);
            that.$voiceTip = that.$voiceState.find('._pTip');
            that.$voiceRange = that.$voiceState.find('progress');
            that.$voiceTip.css({
                'color': '#666',
                'font-size': '0.875em'
            });
            that.$voiceRange.css({
                'width': '100%',
                'border': '1px solid #0064B4',
                'background-color': '#e6e6e6',
                'color': '#0064B4',
                'border-radius': '.2em',
            });
            that._setPositionForTips();
        },
        initState: function() {
            var that = this;
            that.voiceTime = 0;
            that.$voiceBtn.val('按住说话').css({
                'background-color': '#59b5fe',
                'display': 'block'
            });
            clearInterval(that.timer);
            that.initRecordingDom();
            that.initResultDom();
        },
        initRecordingDom: function() { //隐藏dom，value清零，清空提示
            var that = this;
            that.$voiceTip.html('开始录音');
            that.$voiceRange.val(0);
            that.$voiceState.css('display', 'none');
        },
        initResultDom: function() {
            var that = this;
            that.$voiceFiles.css('display', 'none');
            that.isNotPalyVoice = true;
            that.$audio_img.removeClass("audio_img_animation");
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
        _stopMove: function(event) {
            event.preventDefault();
        },
        e_beginTouch: function() {
            var that = this; //voiceObj       
            //uexLog.sendLog('timerForLongTap' +that.timerForLongTap)  

            document.body.addEventListener('touchmove', that._stopMove, false);

            clearInterval(that.timerForLongTap);
            that.timerForLongTap = setTimeout(function() {
                that.e_beginSpeak();
            }, 700);
        },
        e_beginSpeak: function() {
            var that = this;
            if (that.isRecording) {
                return;
            }

            that.isRecording = true;
            var range = that.$voiceRange;
            var tip = that.$voiceTip;

            that.$voiceState.css('display', 'block'); //显示录音提示
            that._setPositionForTips();
            that.$voiceBtn.val("松开结束").css("background", "#c3e4ff"); //改为正在录音的按钮样式

            var voiceFileName = new Date().Format("yyyyMMddHHmm");
            uexAudio.startBackgroundRecord(0, voiceFileName);

            //uexLog.sendLog('timer'+that.timer)
            clearInterval(that.timer);
            that.timer = setInterval(function() {
                //uexLog.sendLog('定时器内部timer' + that.voiceTime)
                if (that.voiceTime < parseInt(range.attr("max"))) {
                    that.voiceTime++;
                    var time = that.voiceTime;
                    range.val(time);
                    if (time < 10) {
                        tip.html("0" + time + "秒");
                    } else {
                        tip.html(time + "秒");
                    }
                    return;
                }
                that.e_stopRecord();
                appcan.window.confirm({
                    title: '提示',
                    content: '录音最长时长为' + that.maxTime + '秒，是否重新录音？',
                    buttons: ['确定', '取消'],
                    callback: function(err, data, dataType, optId) {
                        if (data == 0) { //是
                            that.e_deleteVoice();
                        } else {

                        }
                    }
                });
            }, 1000);
        },
        e_stopRecord: function() {
            var that = this;
            document.body.removeEventListener('touchmove', that._stopMove, false);            
            if (!that.isRecording) {
                clearInterval(that.timerForLongTap);
                baseOperation.closeToast();
                baseOperation.alertToast('请长按开始录音！');
                return;
            }
            //alert(that.timerForLongTap);

            that.isRecording = false;
            that.initRecordingDom();
            //uexLog.sendLog('清楚定时器' + that.voiceTime);
            clearInterval(that.timer);
            //uexLog.sendLog('停止录音' + that.voiceTime);
            uexAudio.stopBackgroundRecord();
            that._showResultDom();
            //alert('录音结束');
        },

        e_deleteVoice: function() { //删除录音文件，回复成开始录音的状态
            var that = this;
            if (!that.isNotPalyVoice) {
                uexAudio.stop();
            }
            if (that.recordPath) {
                uexFileMgr.deleteFileByPath(that.recordPath);
                that.recordPath = '';
            }
            that.initState();
        },
        e_playAudio: function() {
            var that = this;
            //alert(that.recordPath);
            if (that.isNotPalyVoice) {
                var recordPath = that.recordPath;
                if (!recordPath) {
                    return;
                }
                that.isNotPalyVoice = false;
                that.$audio_img.addClass("audio_img_animation");
                //alert(that.recordPath)
                //alert(recordPath)
                uexAudio.open(recordPath);
                uexAudio.setProximityState('1');
                uexAudio.play(0);
            } else {
                //alert(that.recordPath)                
                uexAudio.stop();
                that.isNotPalyVoice = true;
                that.$audio_img.removeClass("audio_img_animation");
            }
        },
        _showResultDom: function() {
            var that = this;
            that.$voiceTime.html((that.voiceTime || 0) + "''");
            that.$voiceBtn.css('display', 'none');
            that.$voiceFiles.css('display', 'block');
        },

        _setPositionForTips: function() {
            var that = this;
            var width = that.$voiceBtn.width();
            var left = that.$voiceBtn.offset().left;
            var top = parseFloat(that.$voiceBtn.offset().top) - parseFloat(that.$voiceState.height());
            that.$voiceState.css({
                "left": left,
                "top": top,
                "width": width
            });
        },
        testAudioIfReady: function() {
            var that = this;
            var voiceFileName = new Date().Format("yyyyMMddHHmm");
            uexAudio.startBackgroundRecord(0, voiceFileName);
            setTimeout(function() {
                uexAudio.stopBackgroundRecord();
            }, 700);
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
        setCbForVoiceRecordFinished: function() {
            var that = this;
            //背景录音结束回调
            uexAudio.cbBackgroundRecord = function(opId, dataType, data) {
                if (!that.isAudioTested) {
                    that.isAudioTested = true;
                    uexFileMgr.deleteFileByPath(data);
                    return;
                }
                that.recordPath = data;
                //alert('回调内的：' + that.recordPath);                
            };
        },
    };
    window.voiceObj = obj;
})(appcan, window, Zepto, baseOperation);
