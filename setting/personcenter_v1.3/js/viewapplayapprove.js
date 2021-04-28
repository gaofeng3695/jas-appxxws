appcan.ready(function() {
    viewPicObj.init();
});
var viewPicObj = {
    jasHttpRequest: new JasHttpRequest(),
    userBo: JSON.parse(appcan.locStorage.getVal("userBo")),
    init: function() {
        imagesObj.init();
        this.requestCompanyData();
        this.bindEvent();
    },
    bindEvent: function() {
        var that = this;
        appcan.button("#nav-left", "btn-act", function() {
            appcan.window.close(-1);
        });
        $(".photo").live('click', function(e) { //live用于动态生成后页面进行cick事件的绑定
            var t = e.target;
            if ($(t).hasClass("companypic")) {
                that.previewPicture($(t)[0].id, 'companypic');
                retun;
            }
            if ($(t).hasClass("peopelpic")) {
                that.previewPicture($(t)[0].id, 'peopelpic');
                retun;
            }
        });
    },
    requestCompanyData: function() {
        var that = this;
        var partURL = "cloudlink-core-framework/enterprise/getById?objectId=" + that.userBo.enterpriseId;
        that.jasHttpRequest.jasHttpGet(partURL, function(id, state, dbSource) {
            var obj = JSON.parse(dbSource);
            if (obj.success == 1) {
                appcan.locStorage.setVal("enterpriseName", obj.rows[0].enterpriseName);
                $("#text").val(obj.rows[0].enterpriseName);
                //企业全称
                $("#registerNum").val(obj.rows[0].registerNum);
                that.requestCompanyPic();
            } else {
                baseOperation.alertToast("网络繁忙，请稍后再试...");
            }

        });
    },
    requestCompanyPic: function() {
        var that = this;
        var pictype = 'pic_business';
        imagesObj.renderPicByDataFromService(pictype, function(length) {
            that.requestPeoplePic();
        });
    },
    requestPeoplePic: function() {
        var that = this;
        var pictype = 'pic_identity';
        imagesObj.renderPicByDataFromService(pictype, function(length) {
            if (length == 0) {
                $(".picidentify").css('visibility', 'hidden');

                $(".picroster").css('margin-top', '-2.25em');
            }
            that.requestroster();
        });
    },
    requestroster: function() {
        var that = this;
        var pictype = 'pic_roster';
        imagesObj.renderPicByDataFromService(pictype, function(length) {
            if (length == 0) {
                $(".picroster").css('visibility', 'hidden');

            }
        });
    }
}