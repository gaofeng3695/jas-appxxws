appcan.ready(function() {
    recordList.init();
});
(function(appcan, window, $, baseOperation, JasHttpRequest, createTemplateByObj, creatNumTip) {
    var jasHttpRequest = new JasHttpRequest();
    var utils = {
        ifCheckboxAllChecked : function($checkBoxs) {
            if ($checkBoxs.length === 0) {
                return false;
            }
            return $checkBoxs.not('input:checked').length === 0;
        }
    };
    var recordList = {
        searchKeyWord : '',        
        pageNum : 1,
        elem : {
            list_wrapper : '#list_wrapper',
            searchDelete:'.searchDelete',
        },
        initElem : function() {
            var eles = this.elem;
            for (var name in eles) {
                if (eles.hasOwnProperty(name)) {
                    this[name] = $(eles[name]);
                }
            }
        },
        init : function() {
            this.initElem();
            this.bindEvent();
            this.requestListData();
        },
        bindEvent : function() {
            var that = this;
            $('body').on('click', 'ul li', function(e) {
                var t = e.target;
                if ($(t).hasClass('js_check')) {
                    that.setFatherCheckBox();
                    return;
                }
                var recordId = this.dataset.id;
                //为新建记录页面存recordId
                appcan.locStorage.val('recordId', recordId);
                appcan.locStorage.val('recordEntrance', 'local');
                appcan.openWinWithUrl('new_record', '../new_record/new_record.html');
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
        requestListData : function() {
            var that = this;
            //var userId = JSON.parse(appcan.locStorage.getVal('userBo')).objectId;
            //alert(userId);
            var isclosed = appcan.locStorage.val('isclosed');            
            //baseOperation.londingToast('数据请求中，请稍后...', 99999);
            var planId = appcan.locStorage.val('planId');
            queryEhscRecordList(0, planId,that.searchKeyWord,function(reObj) {
                //baseOperation.closeToast();
                //alert(JSON.stringify(reObj));
                if (reObj.success == 1 && reObj.data.length > 0) {
                    var aData = reObj.data;
                    if( +isclosed ){
                        var arr = [];
                        aData.forEach(function(item,index){
                            arr.push(item.objectId);
                        });
                        deleteEhscRecordByIds(arr, function() {
                            that.requestListData();
                        });                        
                        return;
                    }
                    that.render(aData);
                } else {
                    that.list_wrapper.html('<div class="ub ub-pc uinn ulev30 clr666">暂无数据</div>');
                }
                that.setFatherCheckBox();
                creatNumTip(reObj.data.length, reObj.data.length, 0, 1);
            });
        },
        render : function(aObj) {
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
        setCheckBoxIfChecked : function(bool) {
            $('input[type="checkbox"]').prop('checked', bool);
        },
        setFatherCheckBox : function() {
            var bool = utils.ifCheckboxAllChecked($('input[type="checkbox"]'));
            appcan.window.evaluateScript('local_list', 'wrapperObj.trashCheck(' + bool + ')');
        },
        deleteRecords : function() {
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
                    title : "删除",
                    content : "安检记录还没有进行上传，是否删除？",
                    buttons : ['确定', '取消'],
                    callback : function(err, data, dataType, optId) {
                        if (data == 0) {
                            deleteEhscRecordByIds(arr, function() {
                                that.requestListData();
                            });
                        }
                    }
                });
            }

        }
    };
    window.recordList = recordList;
})(appcan, window, Zepto, baseOperation, JasHttpRequest, createTemplateByObj, creatNumTip);
