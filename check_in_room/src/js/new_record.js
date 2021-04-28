   var imagephotoNumber = 1;
   var imgArray = [];
   var jasHttpRequest = new JasHttpRequest();
   var number = 0;
   appcan.ready(function() {
       securityTable.init();
       aboutImg.init();
       uexImage.onPickerClosed = function(info) {
           var objData = JSON.parse(info);
           if (!objData.isCancelled) {
               var imgPaths = objData.data;
               for (var y = 0; y < imgPaths.length; y++) {
                   var option = "";
                   var mun = parseInt($(".img_mun_photo").text());
                   $(".img_mun_photo").text(mun + 1);
                   option = '<div class=" picList" id="preview_' + imagephotoNumber + '">' + '<img src="' + imgPaths[y] + '" onclick="previewPicture(this)" ontouchstart="gtouchstart(this)" ontouchmove="gtouchmove(this)" ontouchend="gtouchend(this)"  class="picListimg" alt=""/>' + '</div>';
                   $(".photo_list").append(option);
                   imagephotoNumber++;
                   imgArray.push({
                       attaType: "pic",
                       src: imgPaths[y]
                   });
               }
           }
       };
   });
   var securityTable = {
       clickResource: null, //
       isExistDanger: false, //用于判断是否存在隐患情况
       gastableNum: 1,
       closenum: 1,
       recordId: null, //记录ID;
       groupId: null,
       checkedRecord: {}, //安检记录数据的存储
       elem: {
           $addgastable: ".addgastable", //点击进行燃气列表的增加
           $closegas: ".closegas", //关闭当前燃气表
           $dangerType: ".danger", //选择隐患情况
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
           this.initParams();
           this.getInitObj();
           this.bindEvent();
       },
       initParams: function() {
           this.clickResource = appcan.locStorage.getVal('recordEntrance');
           appcan.locStorage.remove('recordEntrance');
       },
       getInitObj: function() {
           var that = this;
           that.checkedRecord.planId = appcan.locStorage.val('planId');
           if (that.clickResource == "new") {
               that.recordId = baseOperation.createuuid(); //生成了recordId
               that.groupId = baseOperation.createuuid();
               $("#securityTime").val(that.getNowFormatDate());
               var address = appcan.locStorage.getVal("saveDetailAddress");
               $("#address").val(address);
           } else if (that.clickResource == "again") { //再次检查
               var _obj = JSON.parse(appcan.locStorage.getVal('againRecordObj'));
               var obj = {
                   "recordId": baseOperation.createuuid(), //生成了recordId
                   "groupId": _obj.groupId,
                   "securityCheckTime": _obj.securityCheckTime,
                   "enterhomeUserTypeCode": _obj.enterhomeUserTypeCode,
                   "enterhomeAddress": _obj.enterhomeAddress,
                   "enterhomeUserName": _obj.enterhomeUserName,
                   "enterhomeUserCode": _obj.enterhomeUserCode,
                   "enterhomeUserTel": _obj.enterhomeUserTel,

               }
               that.initagainUserTable(obj);
           } else if (that.clickResource == "local") {
               //进行本地存储的查找，然后进行赋值
               var recordId = appcan.locStorage.getVal('recordId');
               selectEhscRecordInfo(recordId, function(result) { //查询安检记录的详情
                   if (result.success == 1) {
                       that.initGasAndHanderTable(result.data);
                       that.initImg(recordId);
                   } else {
                       baseOperation.alertToast("数据加载失败");
                   }
               });
           }
       },
       bindEvent: function() {
           var that = this;
           baseOperation.addEmojiFliterEvent('#remork', checkLen); //绑定过滤emoji的事件
           that.$addgastable.click(function() {
               that.gastableNum = that.gastableNum + 1;
               that.gastableHtml(that.gastableNum);
           });
           that.$dangerType.click(function() {
               if ($(this).hasClass("dangeron")) {
                   $(this).removeClass("dangeron");
               } else {
                   $(this).addClass("dangeron");
               }
           });
           $("#closegas1").click(function() {
               $("#addgastable1").remove();
               if (that.gastableNum > 1) {
                   that.gastableNum = that.gastableNum - 1;
               } else {
                   that.gastableNum = 0;
               }
               var gaslength = $(".gas_list").find(".gastable").length; //当前存在的燃气表长度
               for (var i = 0; i < $(".gas_list").find(".gastable").length + 1; i++) {
                   $(".gastable").eq(i).attr("id", "addgastable" + (i + 1));
                   $(".gastitle").eq(i).html('燃气表-' + (i + 1));
                   $(".gascode").eq(i).attr("id", "gascode" + (i + 1));
                   $(".gasdirection").eq(i).attr("id", "gasleft" + (i + 1));
                   $(".gasdirection").eq(i).attr("name", "gas" + (i + 1));
                   $(".gasdesc").eq(i).attr("for", "gasleft" + (i + 1));
                   $(".gasdirection1").eq(i).attr("id", "gasright" + (i + 1));
                   $(".gasdirection1").eq(i).attr("name", "gas" + (i + 1));
                   $(".gasdesc1").eq(i).attr("for", "gasright" + (i + 1));
                   $(".gasshuzi").eq(i).attr("id", "gasnum" + (i + 1));
               }
           });
           $('.radiobox').find('input[name="lv_radio_1"]').on('change', function(evt) {
               /*添加Radio变更处理代码*/
               var desc = $("input[name='lv_radio_1']:checked").attr("value");
               if (desc == "EHS_002" || desc == "EHS_003") {
                   $(".gas_list").css("display", "none");
                   $(".addgasbutton").css("display", "none");
                   $(".dangerList").css("display", "none");
               } else {
                   $(".gas_list").css("display", "block");
                   $(".addgasbutton").css("display", "block");
                   $(".dangerList").css("display", "block");
               }
           });
       },
       initagainUserTable: function(recordObject) { //初始化再次检查
           var that = this;
           that.recordId = recordObject.recordId;
           that.groupId = recordObject.groupId;
           //进行初始化表格
           /*安检时间 */
           if (recordObject.securityCheckTime != "" && recordObject.securityCheckTime != null) {
               $("#securityTime").val(recordObject.securityCheckTime);
           } else {
               $("#securityTime").val();
           }
           /*用户类型*/
           $("input[name='lv_radio_0']").each(function() {
               if ($(this).val() == recordObject.enterhomeUserTypeCode) {
                   $(this).attr("checked", true);
               }
           });
           if (recordObject.enterhomeSituationTypeCode == "EHS_002" || recordObject.enterhomeSituationTypeCode == "EHS_003") {
               $(".gas_list").css("display", "none");
               $(".addgasbutton").css("display", "none");
               $(".dangerList").css("display", "none");
           }
           /*详细地址 */
           if (recordObject.enterhomeAddress != "" && recordObject.enterhomeAddress != null) {
               $("#address").val(recordObject.enterhomeAddress);
           } else {
               $("#address").val();
           }
           /*用户名称 */
           if (recordObject.enterhomeUserName != "" && recordObject.enterhomeUserName != null) {
               $("#username").val(recordObject.enterhomeUserName);
           } else {
               $("#username").val();
           }
           /*用户编号 */
           if (recordObject.enterhomeUserCode != "" && recordObject.enterhomeUserCode != null) {
               $("#usercode").val(recordObject.enterhomeUserCode);
           } else {
               $("#usercode").val();
           }
           /*联系电话 */
           if (recordObject.enterhomeUserTel != "" && recordObject.enterhomeUserTel != null) {
               $("#tel").val(recordObject.enterhomeUserTel);
           } else {
               $("#tel").val();
           }
       },
       initGasAndHanderTable: function(recordObject) { //进行初始化草稿箱数据
           var that = this;
           that.recordId = recordObject.objectId;
           that.groupId = recordObject.groupId;
           //进行初始化表格
           /*安检时间 */
           if (recordObject.securityCheckTime != "" && recordObject.securityCheckTime != null) {
               $("#securityTime").val(recordObject.securityCheckTime);
           } else {
               $("#securityTime").val();
           }
           /*用户类型*/
           $("input[name='lv_radio_0']").each(function() {
               if ($(this).val() == recordObject.enterhomeUserTypeCode) {
                   $(this).attr("checked", true);
               }
           });
           if (recordObject.enterhomeSituationTypeCode == "EHS_002" || recordObject.enterhomeSituationTypeCode == "EHS_003") {
               $(".gas_list").css("display", "none");
               $(".addgasbutton").css("display", "none");
               $(".dangerList").css("display", "none");
           }
           /*详细地址 */
           if (recordObject.enterhomeAddress != "" && recordObject.enterhomeAddress != null) {
               $("#address").val(recordObject.enterhomeAddress);
           } else {
               $("#address").val();
           }
           /*用户名称 */
           if (recordObject.enterhomeUserName != "" && recordObject.enterhomeUserName != null) {
               $("#username").val(recordObject.enterhomeUserName);
           } else {
               $("#username").val();
           }
           /*用户编号 */
           if (recordObject.enterhomeUserCode != "" && recordObject.enterhomeUserCode != null) {
               $("#usercode").val(recordObject.enterhomeUserCode);
           } else {
               $("#usercode").val();
           }
           /*联系电话 */
           if (recordObject.enterhomeUserTel != "" && recordObject.enterhomeUserTel != null) {
               $("#tel").val(recordObject.enterhomeUserTel);
           } else {
               $("#tel").val();
           }
           /*入户情况*/
           $("input[name='lv_radio_1']").each(function() {
               if ($(this).val() == recordObject.enterhomeSituationTypeCode) {
                   $(this).attr("checked", true);
               }
           });
           var gasObj = recordObject.gasmeters;
           /*燃气表个数，动态生成模板*/
           if (gasObj.length == 0) {
               that.gastableNum = 0;
               //表示当前没有燃气表记录，
               if (that.clickResource == "again") {} else {
                   $(".gas_list").html("");
               }
           } else if (gasObj.length == 1) {
               var gasmeterCode = gasObj[0].gasmeterCode;
               if (gasmeterCode != null && gasmeterCode != "") {
                   $("#gascode1").val(gasmeterCode);
               } else {
                   $("#gascode1").val();
               }
               /*左右表*/
               $("input[name='gas1']").each(function() {
                   if ($(this).val() == gasObj[0].gasmeterEntermode) {
                       $(this).attr("checked", true);
                   }
               });
               var gasmeterData = gasObj[0].gasmeterData;
               if (gasmeterData != null && gasmeterData != "") {
                   $("#gasnum1").val(gasmeterData);
               } else {
                   $("#gasnum1").val();
               }
           } else {
               var tabnum = 0;
               for (var x = 1; x < gasObj.length; x++) {
                   tabnum = x + 1;
                   that.gastableHtml(tabnum); //先是生成燃气表格
               }
               /*针对生成的表格进行赋值 */
               for (var j = 0; j < gasObj.length; j++) {
                   var gasmeterCode = gasObj[j].gasmeterCode;
                   if (gasmeterCode != null && gasmeterCode != "") {
                       $("#gascode" + (j + 1)).val(gasmeterCode);
                   } else {
                       $("#gascode" + (j + 1)).val();
                   }
                   /*左右表*/
                   $("input[name='gas" + (j + 1) + "']").each(function() {
                       if ($(this).val() == gasObj[j].gasmeterEntermode) {
                           $(this).attr("checked", true);
                       }
                   });
                   var gasmeterData = gasObj[j].gasmeterData;
                   if (gasmeterData != null && gasmeterData != "") {
                       $("#gasnum" + (j + 1)).val(gasmeterData);
                   } else {
                       $("#gasnum" + (j + 1)).val();
                   }
               }
           }
           /*燃气表生成完毕 */
           /*隐患情况*/
           var hiddendata = recordObject.hiddendangers;
           if (hiddendata.length > 0) {
               for (var z = 0; z < hiddendata.length; z++) {
                   for (var i = 0; i < $(".danger_list").find(".danger").length; i++) {
                       if ($(".danger").eq(i).attr("id") == hiddendata[z].hiddendangerCode) {
                           $(".danger").eq(i).addClass("dangeron");
                       }
                   }
               }
           }
           /*备注 remorkNote*/
           if (recordObject.remark != null && recordObject.remark != "") {
               var length = recordObject.remark.length;
               $("#word").text("(" + (200 - length) + "字)");
               $("#remork").val(recordObject.remark);
           }
       },
       initImg: function(recordId) { //进行图片的初始化加载
           selectOfflineEhscRecordAttaData(recordId, function(result) {
               if (result.success == 1) {
                   var ImgObj = result.data;
                   if (ImgObj.length > 0) {
                       for (var i = 0; i < ImgObj.length; i++) {
                           imgArray.push({
                               attaType: "pic",
                               src: ImgObj[i].postData
                           });
                           var mun = parseInt($(".img_mun_photo").text());
                           $(".img_mun_photo").text(mun + 1);
                           var option = '<div class=" picList" id="preview_' + imagephotoNumber + '">' + '<img src="' + ImgObj[i].postData + '" onclick="previewPicture(this)" ontouchstart="gtouchstart(this)" ontouchmove="gtouchmove(this)" ontouchend="gtouchend(this)"  class="picListimg" alt=""/>' + '</div>';
                           $(".photo_list").append(option);
                           imagephotoNumber++;
                       }
                   }
               }
           });
       },
       gastableHtml: function(data) {
           var that = this;
           that.closenum = that.closenum + 1;
           var gastableHtml = '<div class="gastable  sectionShadow sectionMargin" id="addgastable' + data + '">' +
               '<div class="table_row gas_title ubb sc-border-cor" id="22"><span class="gastitle">燃气表-' + data + '</span>' +
               '<img src="../../images/delete.png" class="closegas" id="closegas' + that.closenum + '"></div>' +
               '<div class="input_table"><div class="ub ub-ac table_row"><div class="row_left">' +
               '编&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;号</div><div class="row_right ub-f1 ub-fv tb_bg"><div class="ml5">' +
               '<input type="text" id="gascode' + data + '" class="user_input rightSize gascode" placeholder="请输入燃气编号（选填）"></div></div></div><div class="address_notes" id="gascodeNote' + data + '"></div>' +
               '<div class="ub ub-ac table_row"><div class="row_left"> 左&nbsp;&nbsp;右&nbsp;&nbsp;表</div>' +
               '<div class="row_right ub-f1 ub-fv"><div class="radio_home ub-ac radiobox umar-r" name="">' +
               '<input type="radio"  class="uabs ub-con gasdirection" id="gasleft' + data + '" name="gas' + data + '" value="左进"checked>' +
               '<label class="usertype_right ulev28 gasdesc" for="gasleft' + data + '">左进</label></div>' +
               '<div class="radio_home ub-ac radiobox umar-r" name="">' +
               '<input type="radio"  class="uabs ub-con gasdirection1" id="gasright' + data + '" name="gas' + data + '" value="右进">' +
               '<label class="usertype_right ulev28 gasdesc1" for="gasright' + data + '">右进</label></div></div></div>' +
               '<div class="ub ub-ac table_row"> <div class="row_left">读&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;数' +
               '</div><div class="row_right ub-f1 ub-fv tb_bg"><div class="ml5">' +
               '<input type="text" id="gasnum' + data + '" class="user_input rightSize gasshuzi" placeholder="请输入读数"></div></div></div><div class="address_notes" id="gasnumNote' + data + '"></div></div></div>';
           $(".gas_list").append(gastableHtml);
           that.bindClose(that.closenum); //给对应的close按钮绑定关闭事件
       },
       bindClose: function(num) {
           var that = this;
           $("#closegas" + num).click(function() {
               var id = $(this).parents("div").parents("div").attr("id");
               $("#" + id).remove();
               that.gastableNum = that.gastableNum - 1;
               var gaslength = $(".gas_list").find(".gastable").length; //当前存在的燃气表长度
               for (var i = 0; i < $(".gas_list").find(".gastable").length + 1; i++) {
                   $(".gastable").eq(i).attr("id", "addgastable" + (i + 1));
                   $(".gastitle").eq(i).html('燃气表-' + (i + 1));
                   $(".gascode").eq(i).attr("id", "gascode" + (i + 1));
                   $(".gasdirection").eq(i).attr("id", "gasleft" + (i + 1));
                   $(".gasdirection").eq(i).attr("name", "gas" + (i + 1));
                   $(".gasdesc").eq(i).attr("for", "gasleft" + (i + 1));
                   $(".gasdirection1").eq(i).attr("id", "gasright" + (i + 1));
                   $(".gasdirection1").eq(i).attr("name", "gas" + (i + 1));
                   $(".gasdesc1").eq(i).attr("for", "gasright" + (i + 1));
                   $(".gasshuzi").eq(i).attr("id", "gasnum" + (i + 1));
               }
           });

       },
       submitdata: function(fage) { //点击下一步后，直接保存到草稿箱
           this.saveOfflineAttaData(imgArray, this.recordId, fage);
       },
       saveOfflineAttaData: function(imgArray, businessId, fage) {
           var that = this;
           var attrData = [];
           if (imgArray.length > 0) {
               for (var i = 0; i < imgArray.length; i++) {
                   var localId = new Date().Format("yyyyMMddHHmmssS");
                   var obj = {
                       localId: localId,
                       recordId: that.recordId,
                       attaType: "pic",
                       postData: imgArray[i].src
                   }
                   attrData.push(obj);
               }
               saveOfflineEhscRecordAttaData(attrData, businessId, function(result) { //目前保存附件和事件上报图片的方法使用的是一个接口。
                   if (result.success == "1") {
                       that.hometypestatus(fage);
                   } else {
                       baseOperation.alertToast("附件保存失败", 2000);
                       appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
                       return;
                   }
               });
           } else if (fage) {
               baseOperation.alertToast("请至少上传一张图片");
               appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
               return;
           } else {
               that.hometypestatus(fage);
           }
       },
       hometypestatus: function(fage) { //用于判断此时需不需要存储燃气情况和隐患
           var that = this;
           var hometypecode = $('.radiobox').find('input[name=lv_radio_1]:checked').attr("value");
           if (hometypecode == "EHS_002" || hometypecode == "EHS_003") {
               that.checkAddressByLocalAndService(fage);
           } else {
               that.addGasmeterRecord(fage);
           }
       },
       addGasmeterRecord: function(fage) {
           /*燃气表格 */
           var that = this;
           var gasmeters = new Array();
           for (var i = 0; i < $(".gas_list").find(".gastable").length; i++) {
               var gastableList = {
                       "objectId": baseOperation.createuuid(),
                       "recordId": that.recordId, //记录ID是什么？
                       "gasmeterName": $(".gastitle").eq(i).text(),
                       "gasmeterEntermode": $('.radiobox').find('input[name=gas' + (i + 1) + ']:checked').attr("value")
                   }
                   //燃气表编号需要验证
               var gascode = $("#gascode" + (i + 1)).val().trim();
               if (gascode != null && gascode != "") {
                   if (!that.checkgascode(gascode, i)) {
                       appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
                       return;
                   } else {
                       gastableList.gasmeterCode = gascode;
                   }
               }
               //燃气表读数需要验证
               var gasnum = $("#gasnum" + (i + 1)).val().trim();
               if (gasnum != null && gasnum != "") {
                   if (!that.checkgasnum(gasnum, i)) {
                       appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
                       return;
                   } else {
                       gastableList.gasmeterData = gasnum;
                   }
               }
               var localId = new Date().Format("yyyyMMddHHmmssS");
               var obj = {
                   localId: localId,
                   objectId: gastableList.objectId,
                   recordId: that.recordId,
                   postData: JSON.stringify(gastableList)
               }
               gasmeters.push(obj);
           }
           saveOfflineEhscRecordGasmeter(gasmeters, that.recordId, function(result) {
               if (result.success == "1") {
                   that.saveEhscRecordHiddendanger(fage); //如果没有燃气表，进行保存隐患表格
               } else {
                   that.deleteGasmeter(); //隐患保存失败，进行删除相关的燃气记录和附件信息
                   appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
                   baseOperation.alertToast("保存燃气信息未成功", 2000);
                   return;
               }
           });
       },
       saveEhscRecordHiddendanger: function(fage) { //保存隐
           var that = this;
           var hiddendangers = new Array(); //隐患表数据的存储
           if ($(".danger_list").find(".danger").length > 0) {
               for (var i = 0; i < $(".danger_list").find(".danger").length; i++) {
                   var hiddendata = {
                       "objectId": baseOperation.createuuid(), // 主键
                       "recordId": that.recordId, // 记录ID
                   }
                   if ($(".danger").eq(i).hasClass("dangeron")) {
                       that.isExistDanger = true;
                       hiddendata.hiddendangerCode = $(".danger").eq(i).attr("id");
                       hiddendata.hiddendangerName = $(".danger").eq(i).text();
                       var localId = new Date().Format("yyyyMMddHHmmssS");
                       var obj = {
                           localId: localId,
                           objectId: baseOperation.createuuid(),
                           recordId: that.recordId,
                           postData: JSON.stringify(hiddendata)
                       }
                       hiddendangers.push(obj);
                   }
               }
               saveOfflineEhscRecordHiddendanger(hiddendangers, that.recordId, function(result) {
                   if (result.success == "1") {
                       that.checkAddressByLocalAndService(fage); //保存安检记录之前先进行地址的验证
                   } else {
                       that.deleteDanger(); //隐患保存失败，进行删除相关的燃气记录和附件信息
                       appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
                       baseOperation.alertToast("保存隐患信息未成功", 2000);
                       return;
                   }
               });
           } else {
               that.checkAddressByLocalAndService(fage); //保存安检记录 
           }
       },
       checkAddressByLocalAndService: function(fage) {
           var that = this;
           var addressdetail = $("#address").val().trim();
           //针对本次提交的地址，进行本地缓存；
           appcan.locStorage.setVal("saveDetailAddress", addressdetail);
           if (addressdetail != null && addressdetail != "") {
               if (!that.checkaddress()) { //进行地址格式的检验
                   appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
                   return;
               } else {
                   isExistEnterhomeAddress(that.recordId, addressdetail, function(result) {
                       if (result.success == 1) {
                           if (result.isExist) {
                               baseOperation.alertToast("地址重复，请修改");
                               appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
                               return;
                           } else {
                               var partURL = "cloudlink-inspection-event/securityCheckRecord/isExistsAddress?planId=" + appcan.locStorage.getVal("planId") + "&enterhomeAddress=" + addressdetail;
                               jasHttpRequest.jasHttpGet(partURL, function(id, state, dbSource) {
                                   if (dbSource.length == 0) {
                                       that.checkedRecord.enterhomeAddress = addressdetail;
                                       that.saveCheckrecord(fage);
                                   }
                                   var resultData = JSON.parse(dbSource);
                                   if (resultData.success == "1") {
                                       if (resultData.rows[0].exists == "1") {
                                           baseOperation.alertToast("地址重复，请修改");
                                           appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
                                           return;
                                       } else {
                                           that.checkedRecord.enterhomeAddress = addressdetail;
                                           that.saveCheckrecord(fage);
                                       }
                                   } else {
                                       that.checkedRecord.enterhomeAddress = addressdetail;
                                       that.saveCheckrecord(fage);
                                   }
                               });
                           }
                       }
                   });
               }
           } else if (fage) {
               baseOperation.alertToast("请输入详细地址");
               appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
               return;
           } else {
               that.saveCheckrecord(fage);
           }
       },
       saveCheckrecord: function(fage) {
           var that = this;
           /*表单里面的安检时间 */
           that.checkedRecord.objectId = that.recordId;
           that.checkedRecord.groupId = that.groupId;
           var securityTime = $("#securityTime").val();
           that.checkedRecord.securityCheckTime = securityTime;
           /*用户类型 默认居民，必填选项*/
           var usertypecode = $('.radiobox').find('input[name=lv_radio_0]:checked').attr("value");
           that.checkedRecord.enterhomeUserTypeCode = usertypecode;
           /*手机号码，必填项 */
           var tel = $("#tel").val().trim();
           if (tel != "" && tel != null) {
               if (!that.checktel()) {
                   appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
                   return;
               } else {
                   that.checkedRecord.enterhomeUserTel = tel;
               }
           } else if (fage) {
               baseOperation.alertToast("请输入联系电话");
               appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
               return;
           }
           /*用户名称，选填项 */
           var username = $("#username").val().trim();
           if (username != "" && username != null) {
               if (!that.checkusername()) {
                   appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
                   return;
               } else {
                   that.checkedRecord.enterhomeUserName = username;
               }
           }
           /*用户编号，选填项 */
           var usercode = $("#usercode").val().trim();
           if (usercode != "" && usercode != null) {
               if (!that.checkusercode()) {
                   appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
                   return;
               } else {
                   that.checkedRecord.enterhomeUserCode = usercode;
               }
           }
           /*入户情况*/
           var hometypecode = $('.radiobox').find('input[name=lv_radio_1]:checked').attr("value");
           that.checkedRecord.enterhomeSituationTypeCode = hometypecode;
           /*备注 */
           var remark = $("#remork").val().trim();
           if (remark != "" && remark != null) {
               if (!that.checkremark()) {
                   appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
                   return;
               } else {
                   that.checkedRecord.remark = remark;
               }
           }
           if (that.isExistDanger) {
               that.checkedRecord.isdanger = "1";
           } else {
               that.checkedRecord.isdanger = "0";
           }
           that.saveOfflineEhscRecord(fage);
           //调用接口进行离线数据或者进行上传服务器的接口，完成保存
       },
       saveOfflineEhscRecord: function(fage) { //保存离线数据
           var that = this;
           // alert(JSON.stringify(that.checkedRecord));
           var userBo = JSON.parse(appcan.locStorage.getVal("userBo"));
           var localid = new Date().Format("yyyyMMddHHmmssS");
           var data = {
               localId: localid,
               objectId: that.recordId,
               postData: JSON.stringify(that.checkedRecord),
               userId: userBo.objectId,
               userName: userBo.userName,
               enterpriseId: userBo.enterpriseId,
               securityCheckTime: that.checkedRecord.securityCheckTime,
               state: 0
           };
           if (that.checkedRecord.enterhomeAddress != null && that.checkedRecord.enterhomeAddress != "") {
               data.enterhomeAddress = that.checkedRecord.enterhomeAddress;
           }
           if (that.checkedRecord.enterhomeUserName != null && that.checkedRecord.enterhomeUserName != "") {
               data.enterhomeUserName = that.checkedRecord.enterhomeUserName;
           }
           saveOfflineEhscRecordData(data, function(result) {
               if (result.success == "1") {
                   baseOperation.alertToast("保存成功", 2000); //本地保存成功之后，需要进行什么操作。
                   if (fage) {
                       appcan.locStorage.val('recordId', that.recordId);
                       appcan.openWinWithUrl('detail_sign', '../detail/sign_detail.html');
                   }
               } else {
                   baseOperation.alertToast("数据保存失败！");
                   appcan.window.evaluateScript('new_record', 'changeClick()'); //点击保存草稿时候进行按钮。
                   return;
               }
           });
       },
       getNowFormatDate: function() { //获取当前系统时间
           var date = new Date();
           var seperator1 = "-";
           var seperator2 = ":";
           var month = date.getMonth() + 1;
           var strDate = date.getDate();
           if (month >= 1 && month <= 9) {
               month = "0" + month;
           }
           if (strDate >= 0 && strDate <= 9) {
               strDate = "0" + strDate;
           }
           var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
               " " + date.getHours() + seperator2 + date.getMinutes() +
               seperator2 + date.getSeconds();
           return currentdate;
       },
       checkaddress: function() { //验证地理位置60个字，字母、数字或汉字；默认为上一次输入值，若无上一次输入值则为空
           var addressdetail = $("#address").val().trim();
           var reg = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,60}$/g;
           if (!reg.test(addressdetail)) {
               baseOperation.alertToast("详细地址由字母、数字或汉字组成，最多输入60个字");
               return false;
           } else {
               return true;
           }
       },
       checkusername: function() { //验证用户名称 长度限制在25个字   
           var username = $("#username").val().trim();
           var reg = /^[\u4e00-\u9fa5_a-zA-Z_]{1,25}$/g;
           if (username != "" && username != null) {
               if (!reg.test(username)) {
                   baseOperation.alertToast("用户名称由字母或汉字组成，最多可输入25个字");
                   return false;
               } else {
                   return true;
               }
           }

       },
       checkusercode: function() { //长度限制在10个字，字母、数字或汉字
           var usercode = $("#usercode").val().trim();
           var reg = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,10}$/g;
           var usercode = $("#usercode").val().trim();
           if (usercode != "" && usercode != null) {
               if (!reg.test(usercode)) {
                   baseOperation.alertToast("用户编号由字母、数字或汉字组成,最多输入10个字");
                   return false;
               } else {
                   return true;
               }
           }

       },
       checkremark: function() { //长度限制为200字，字母、数字、符号或汉字
           var remork = $("#remork").val().trim();
           // var reg = /^[\u4e00-\u9fa5_a-zA-Z_]{1,200}/g;
           if (remork.length > 200) {
               baseOperation.alertToast("长度不能超过200字");
               return false;
           } else {
               return true;
           }
       },
       checkpictureLength: function() { //测试照片长度
           var piclength = $(".photo_list").find(".picList").length;
           if (piclength == 0) {
               $("#picNote").text("请至少上传一张图片");
           }
       },
       checktel: function() { //长度限制在15位，数字和-组成
           var tel = $("#tel").val().trim();
           var reg = /^[0-9-]{1,15}$/;
           if (!reg.test(tel)) {
               baseOperation.alertToast("电话由数字和-组成，最长为15位");
               return false;
           } else {
               return true;
           }
       },
       checkgascode: function(gascode, data) { //燃气表编号，
           //    var reg = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,10}$/g; //长度限制在10位，数字、字母或特殊字符
           var reg = /^[0-9a-zA-Z!@#$%^*()！@#￥%……&*（）]{1,10}$/g;
           if (!reg.test(gascode)) {
               baseOperation.alertToast("燃气编号由数字、字母和特殊字符组成，最大为10位");
               return false;
           } else {
               return true;
           }
       },
       checkgasnum: function(gasnum, data) {
           var reg = /^[0-9.]{1,8}$/; //长度限制为8位，数字
           if (!reg.test(gasnum)) {
               baseOperation.alertToast("只能输入数字，最大8位");
               return false;
           } else {

               return true;
           }
       }
   }
   var aboutImg = {
           init: function() {
               this.bindEvent();
           },
           bindEvent: function() {
               var that = this;
               $("#choosephoto").click(function() {
                   if (parseInt($(".img_mun_photo").text()) > 8) {
                       baseOperation.alertToast("最多只能上传9张照片");
                       return;
                   }
                   that.addpic();
               });
           },
           addpic: function() { //添加图片
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
                       that.openAlbum(name);
                       //打开相册
                   } else if (data == 0) {
                       that.openCarme(name);
                       //打开照相机
                   }
               };
           },
           openAlbum: function() {
               var pemun = parseInt($(".img_mun_photo").text());
               pnum = 9 - pemun;
               var albumData = {
                   min: 1,
                   max: pnum,
                   quality: 0.5,
                   detailedInfo: false
               };
               var albumjson = JSON.stringify(albumData);
               uexImage.openPicker(albumjson);

           },
           openCarme: function() {
               var that = this;
               uexCamera.openInternal(0, 75);
               uexCamera.cbOpenInternal = function(opCode, data) {
                   var mun = parseInt($(".img_mun_photo").text());
                   $(".img_mun_photo").text(mun + 1);
                   var option = "";
                   option = '<div class="ufl picList" id="preview_' + imagephotoNumber + '">' + '<img src="' + data + '" onclick="previewPicture(this)" ontouchstart="gtouchstart(this)" ontouchmove="gtouchmove(this)" ontouchend="gtouchend(this)"  class="picListimg" alt=""/>' + '</div>';
                   var localId = new Date().Format("yyyyMMddHHmmssS");
                   imgArray.push({
                       attaType: "pic",
                       src: data
                   });
                   imagephotoNumber++;
                   setTimeout(function() {
                       $(".photo_list").append(option);
                   }, 2000);

               };
           }
       }
       //进行长时间 进行删除功能
   var timeOutEvent = 0;
   /*浏览照片*/
   function previewPicture(thisObj) {
       var index = thisObj.id;
       if (index == undefined || index == "" || index == null) {
           index = "0";
       }
       var dataParam = {
           displayActionButton: true,
           displayNavArrows: true,
           enableGrid: false,
           startOnGrid: false,
           startIndex: Number(index),
           data: imgArray
       };
       var json = JSON.stringify(dataParam);
       uexImage.openBrowser(json);
   }

   function gtouchstart(obj) {
       timeOutEvent = setTimeout(function() {
           longPress(obj);
       }, 500);
       //这里设置定时器，定义长按500毫秒触发长按事件，时间可以自己改，个人感觉500毫秒非常合适
       return false;
   }

   ;
   //手释放，如果在500毫秒内就释放，则取消长按事件，此时可以执行onclick应该执行的事件
   function gtouchend() {
       clearTimeout(timeOutEvent);
       //清除定时器
       if (timeOutEvent != 0) {
           //这里写要执行的内容（尤如onclick事件）
           //alertToast("你这是点击，不是长按");
       }
       return false;
   }

   ;
   //如果手指有移动，则取消所有事件，此时说明用户只是要移动而不是长按
   function gtouchmove() {
       clearTimeout(timeOutEvent);
       //清除定时器
       timeOutEvent = 0;
       $("#bubble").remove();
   }

   ;
   //真正长按后应该执行的内容
   function longPress(obj) {
       $("#bubble").remove();
       timeOutEvent = 0;
       var left = $(obj).position().left;
       var top = $(obj).position().top;
       var width = $(obj).width() / 2;
       var divId = $(obj).parent().attr("id");
       var htmlTemp = "<div id='bubble' class='bubble' style='left:" + width + "px;'><span id='delete_div' onclick=\"deletePreview('" + divId + "')\">删除</span></div>";
       $(obj).parent().append(htmlTemp);
       var x = width - $("#bubble").width() / 2 + left;
       var y = top - $("#bubble").height() - 2;
       $("#bubble").css("left", x + "px");
       $("#bubble").css("top", y + "px");
   }

   /**
    * 删除图片
    */
   function deletePreview(id) {
       for (var i = 0; i < imgArray.length; i++) {
           imgArray.splice(i, 1);
           break;
       }
       var mun = parseInt($(".img_mun_photo").text());
       $(".img_mun_photo").text(mun - 1);
       $("#" + id).remove();
       $("#bubble").remove();
   }

   function checkLen(obj) {
       var len = $(obj).val().length;
       if (len > 199) {
           $(obj).val($(obj).val().substring(0, 200));
       }
       var num = 200 - len;
       if (num < 0) {
           num = 0;
       }
       $("#word").text('(' + num + '字)');
   }

   //    window.onerror = function(a, b, c) {
   //        alert(a + '2222' + b + '123' + c)
   //    }