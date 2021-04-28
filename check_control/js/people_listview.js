    var listview = appcan.listview({
        selector: '#listview',
        type: "thinLine",
        hasIcon: false,
        hasAngle: false,
        hasSubTitle: false,
        multiLine: 1,
    });

    listview.on("click", function(ele, obj, curEle) {
        //alert(JSON.stringify(obj));
        appcan.locStorage.setVal('currentUser', {
            userId: obj.inspectorId,
            userName: obj.userName,
            userDept: obj.userDept,
            userHead: obj.userHead
        });
        appcan.locStorage.setVal('HistoryRecordFormMap',false);
        appcan.openWinWithUrl('routes', 'routes.html');

    });

    function setListView(arr) {
        var data = [];
        if (arr.length > 0) {
            hideMaskTip();
        }
        arr.forEach(function(val, index, arr) {
            var srcForHead = '../images/male_head.png';
            var srcForSex = 'images/male.png';
            if (val.sex === '女') {
                srcForHead = '../images/female_head.png';
                srcForSex = 'images/female.png';
            }
            if (val.picId) {
                JasHttpRequest();
                srcForHead = serverURL + "cloudlink-core-file/file/getImageBySize?fileId=" + val.picId + "&viewModel=fill&width=500&hight=500";
            }
            data.push({
                title: '<div class="ub ub-pj">' +
                    '<div class="ub  ub-ac width-name">' +
                    '<img class="userHead ub ub-ac" src=' + srcForHead + ' alt="头像">' +
                    '<div class="userName ub ub-ac ut-s">' + val.inspectorName + '</div>' +
                    '<img class="userSex ub ub-ac" src=' + srcForSex + ' alt="sex">' +
                    '</div>' +
                    '<div class="userDept ub ub-pc ub-ac ub-f1"><span class=" uf ut-s">' + val.orgName + '</span></div>' +
                    '<div class="ub  ub-ac ub-pe width-hist">' +
                    '<img class="userTimer ub ub-ac" src="images/clock.png" alt="time">' +
                    '<div class="userHist">历史轨迹</div>' +
                    '</div>' +
                    '</div>',
                inspectorId: val.inspectorId,
                userName: val.inspectorName,
                userDept: val.orgName,
                userHead: srcForHead
            });
        });
        listview.set(data);
    }

    function showMask() {
        $('#mask').removeClass('uhide');
    }
    function showMaskTip(){
        $('#maskTip').removeClass('uhide');        
    }
    function hideMaskTip(){
        $('#maskTip').addClass('uhide');   
    }