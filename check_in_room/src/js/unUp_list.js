// window.onerror = function(msg, url, line) {
//     alert("erro" + msg + "\n" + url + ":" + line);
//     return true;
// };

appcan.ready(function() {
    recordList.init();
});
(function(appcan, window, $, baseOperation, JasHttpRequest, createTemplateByObj, creatNumTip) {

    var jasHttpRequest = new JasHttpRequest();
    var utils = {
        ifCheckboxAllChecked: function($checkBoxs) {
            if ($checkBoxs.length === 0) {
                return false;
            }
            return $checkBoxs.not('input:checked').length === 0;
        }
    };

    var recordList = {
        searchKeyWord: '',
        pageNum: 1,
        recourIdArray: [], //存储recordId的记录
        recourIdNum: 0, //村粗取第几个recordid记录
        deleteRecorId:[],//在进行本地记录上传的时候，用于存储被删除的数组
        currentCheckedRecourId: null,
        elem: {
            list_wrapper: '#list_wrapper',
            searchDelete:'.searchDelete',
        },
        initElem: function() {
            var eles = this.elem;
            for (var name in eles) {
                if (eles.hasOwnProperty(name)) {
                    this[name] = $(eles[name]);
                }
            }
        },
        init: function() {
            this.initElem();
            this.bindEvent();
            this.requestListData();
        },
        bindEvent: function() {
            var that = this;
            $('body').on('click', 'ul li', function(e) {
                var t = e.target;
                if ($(t).hasClass('js_check')) {
                    that.setFatherCheckBox();
                    return;
                }
                var recordId = this.dataset.id;
                appcan.locStorage.val('recordId', recordId);
                appcan.openWinWithUrl('record_detail', '../detail/local_detail.html');
            });
            /* 搜索 */
            appcan.button("#search", "btn-act", function() {
                that.searchKeyWord = $('#inputDom').val().trim();
                that.requestListData();
            });
             that.searchDelete.click(function(){
                that.searchKeyWord = '';
                that.requestListData();  
            }); 
        },
        requestListData: function() {
            var that = this;
            //this.render(aData);return;
            //var userId = JSON.parse(appcan.locStorage.getVal('userBo')).objectId;
            var planId = appcan.locStorage.val('planId');      
            queryEhscRecordList(1,planId,that.searchKeyWord, function(reObj) {
                //baseOperation.closeToast();
                //alert(JSON.stringify(reObj));
                if (reObj.success == 1 && reObj.data.length > 0) {
                    var aData = reObj.data;
                    that.render(aData);
                } else {
                    //baseOperation.alertToast('暂无数据');
                    that.list_wrapper.html('<div class="ub ub-pc uinn ulev30 clr666">暂无数据</div>');
                    //creatNumTip(0,0,0,1);
                }
                that.setFatherCheckBox();
                creatNumTip(reObj.data.length, reObj.data.length, 0, 1);
            });

        },
        render: function(aObj) {
            var that = this;
            var s = '';
            aObj.forEach(function(item, index, arr) {
                s += createTemplateByObj(item, true);
            });
            if (that.pageNum === 1) {
                that.list_wrapper.html(s);
            } else {
                that.list_wrapper.append(s);
            }
        },
        setCheckBoxIfChecked: function(bool) {
            $('input[type="checkbox"]').prop('checked', bool);
        },
        setFatherCheckBox: function() {
            var bool = utils.ifCheckboxAllChecked($('input[type="checkbox"]'));
            appcan.window.evaluateScript('local_list', 'wrapperObj.unUpCheck(' + bool + ')');
        },
        deleteRecords: function() {
            var that = this;
            var arr = [];
            $('input:checked').parents('li').each(function(index) {
                arr.push(this.dataset.id);
            });
            if (arr.length == 0) {
                baseOperation.alertToast("请选择您要删除的安检记录!");
                return;
            } else {
                appcan.window.alert({
                    title: "删除本地记录",
                    content: "是否删除所选中的安检记录？",
                    buttons: ['确定', '取消'],
                    callback: function(err, data, dataType, optId) {
                        if (data == 0) {
                            deleteEhscRecordByIds(arr, function() {
                                that.requestListData();
                            });
                        }
                    }
                });
            }
        },
        uploadRecordsToService: function() {
            var that = this;
            that.recourIdArray = [];
            that.recourIdNum = 0;
            that.deleteRecorId = [];
            $('input:checked').parents('li').each(function(index) {
                that.recourIdArray.push(this.dataset.id);
            });
            that.selectDataByRecordId();
        },
        selectDataByRecordId: function() { //根据记录Id获取所有的数据
            var that = this;
            if (!that.recourIdArray.length) {
                baseOperation.alertToast("请选择您要上报的记录!");
                appcan.window.evaluateScript('local_list', 'wrapperObj.isPostReady = true');                
                return;
            }
            if (that.recourIdNum < that.recourIdArray.length) {
                that.currentCheckedRecourId = that.recourIdArray[that.recourIdNum];
                that.uploadDataToService();
            } else {
                appcan.window.evaluateScript('local_list', 'wrapperObj.isPostReady = true');
                that.deleteRecordFromDraf();
                var nDel = that.deleteRecorId.length;
                var nAll = that.recourIdArray.length;
                if ( nDel === nAll ) {
                    baseOperation.alertToast("上传成功", 2000);                    
                }else{
                    if (nAll > 1) {
                        baseOperation.alertToast("成功上传"+nDel+'条记录，'+(nAll-nDel)+'条记录未上传成功，请重试', 4000);
                    }
                }
            }
        },
        uploadDataToService: function() {
            var that = this;
            selectEhscRecordInfo(that.currentCheckedRecourId, function(result) { //查询安检记录的详情
                if (result.success == 1) {
                    /*直接传入所有的记录信息进行保存*/
                    baseOperation.londingToast("正在上传第"+ (that.recourIdNum + 1) +'条记录',99999);                    
                    uploadObj.uploadRecordByBO(result.data, function() {
                        that.recourIdNum = that.recourIdNum + 1;
                        that.deleteRecorId.push(that.currentCheckedRecourId);
                        that.selectDataByRecordId();
                    }, function() {
                        that.recourIdNum = that.recourIdNum + 1;
                        that.selectDataByRecordId();                        
                        //baseOperation.alertToast("本次记录上传失败");
                    },true);
                } else {
                    baseOperation.alertToast("上传失败");
                }
            });
        },
        deleteRecordFromDraf: function() {
            var that = this;
            deleteEhscRecordByIds(that.deleteRecorId, function() {
                that.requestListData();
            });
        }
    };
    window.recordList = recordList;
})(appcan, window, Zepto, baseOperation, JasHttpRequest, createTemplateByObj, creatNumTip);
