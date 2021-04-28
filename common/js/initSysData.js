var arrData=[];
var network_enable = true;//网络已连接
function check_network() {
  uexDevice.cbGetInfo = function(opCode,dataType,data){
        var device = eval('('+data+')');
        var deviceConnectStatus = device.connectStatus;
        if(deviceConnectStatus==-1){
            network_enable = false;
        }else{
            network_enable = true;
        }
    }
    uexDevice.getInfo(13);
}
function initDomain(callback){
   check_network();
   if(network_enable){
       execSql("delete from sysdomain where 1=1",insertDomains);
   }else{
       alertToast("无网络连接,不同步值域数据",2000);
   }
}

function insertDomains(err,data){
    var url = common_rest_url+"getfordata.do?class=mobileappController&function=sysdomains";
    jasHttpGet(getRandNum(),url,function (id, state, resultset){
        arrData = eval('(' + resultset + ')');
        uexXmlHttpMgr.close(id);
        var endIndex=arrData.length<300?arrData.length:300;
        insertByIndex(0,endIndex);
    });
}

function insertByIndex(beginIndex,endIndex){
    var sql = "insert into sysdomain(domainname,codeid,codename)";
    for (var i = beginIndex; i < endIndex; i++) {
        if(i==beginIndex){
            sql+= " select '"+arrData[i].domainname+"','"+arrData[i].codeid+"','"+arrData[i].codename+"'";
        }else{
            sql+= " union all select '"+arrData[i].domainname+"','"+arrData[i].codeid+"','"+arrData[i].codename+"'";
        }
    }
    execSql(sql,function(err,data){
        var leftSize = arrData.length-endIndex;
        var ei=0;
        if(leftSize>0){
            if(leftSize>300){
                ei = endIndex+300;
            }else{
                ei = arrData.length;
            }
            insertByIndex(endIndex,ei);
        }else{
            initConstructions();
        }
    });
}

function initConstructions(){
    execSql("delete from dcsconstruction where 1=1",insertConstructions);
}

function insertConstructions(err,data){
    var url = common_rest_url+"getfordata.do?class=mobileappController&function=dcsConstructions";
    jasHttpGet(getRandNum(),url,function (id, state, resultset){
        var arrData = eval('(' + resultset + ')');
        uexXmlHttpMgr.close(id);
        var sql = "insert into dcsconstruction(eventid,unitname,unitleader)";
        for (var i = 0; i < arrData.length; i++) {
            if(i==0){
                sql+= " select '"+arrData[i].eventid+"','"+arrData[i].unitname+"','"+arrData[i].unitleader+"'";
            }else{
                sql+= " union all select '"+arrData[i].eventid+"','"+arrData[i].unitname+"','"+arrData[i].unitleader+"'";
            }
        }
        execSql(sql,initVdcssection);
    });
}

function initVdcssection(){
    execSql("delete from vdcssection where 1=1",insertVdcssection);
}

function insertVdcssection(err,data){
    var url = common_rest_url+"getfordata.do?class=mobileappController&function=vdcssection";
    jasHttpGet(getRandNum(),url,function (id, state, resultset){
        var arrData = eval('(' + resultset + ')');
        uexXmlHttpMgr.close(id);
        var sql = "insert into vdcssection(sectioneventid,sectionname,projectid,projectname)";
        for (var i = 0; i < arrData.length; i++) {
            if(i==0){
                sql+= " select '"+arrData[i].SECTIONEVENTID+"','"+arrData[i].SECTIONNAME +"','"+arrData[i].PROJECTID +"','"+arrData[i].PROJECTNAME+"'";
            }else{
                sql+= " union all select '"+arrData[i].SECTIONEVENTID+"','"+arrData[i].SECTIONNAME+"','"+arrData[i].PROJECTID+"','"+arrData[i].PROJECTNAME+"'";
            }
        }
        execSql(sql,initDcsproject);
        //alertToast("本地数据初始化完成");
    });
}

//初始化项目信息
function initDcsproject(){
  execSql("delete from dcs_project where 1=1",insertDcsproject);
}
function insertDcsproject(err,data){
    var url = common_rest_url + "getfordata.do?class=mobileappController&function=dcsproject";
    jasHttpGet(getRandNum(),url,function (id, state, resultset){
        var arrData = eval('(' + resultset + ')');
        uexXmlHttpMgr.close(id);
        var sql = "insert into dcs_project(projecteventid,projectname)";
        for(var i=0;i<arrData.length;i++){
            if(i==0){
                sql += " select '" + arrData[i].EVENTID+"','"+arrData[i].PROJECTNAME+"'";
            }else{
                sql += " union all select '"+arrData[i].EVENTID+"','"+arrData[i].PROJECTNAME+"'";
            }
        }
        execSql(sql,initDcssection);        
    })
}
function initDcssection(){
  execSql("delete from dcs_section where 1=1",insertDcssection);
}
function insertDcssection(err,data) {
  var url = common_rest_url + "getfordata.do?class=mobileappController&function=dcssection";
    jasHttpGet(getRandNum(),url,function (id, state, resultset){
        // alert(resultset);
        var arrData = eval('(' + resultset + ')');
        uexXmlHttpMgr.close(id);
        var sql = "insert into dcs_section(sectioneventid,sectionname,projecteventid,assemblycompany,assemblycompanyname,sectioncode)";
        for(var i=0;i<arrData.length;i++){
            if(i==0){
                sql += " select '" + arrData[i].EVENTID+"','"+arrData[i].SECTIONNAME+"','"+arrData[i].PROJECTID+"','"+arrData[i].ASSEMBLYCOMPANY+"','"+arrData[i].ASSEMBLYCOMPANYNAME+"','"+arrData[i].PROJECTCODE+"'";
            }else{
                sql += " union all select '"+arrData[i].EVENTID+"','"+arrData[i].SECTIONNAME+"','"+arrData[i].PROJECTID+"','"+arrData[i].ASSEMBLYCOMPANY+"','"+arrData[i].ASSEMBLYCOMPANYNAME+"','"+arrData[i].PROJECTCODE+"'";
            }
        }
        execSql(sql,initPriUnitCheckCompany);
    })
}

/*
 * 部门初始化(检测单位)
 */
function initPriUnitCheckCompany () {
  execSql("delete from priunit where typeid = '1020'",insertPriUnitCheckCompany);
}
function insertPriUnitCheckCompany (err,data) {
  var _url = common_rest_url+"getfordata.do?class=cn.jasgroup.jasframework.privilege.web.controller.UnitController&function=queryAsDomain&parentNum=1020&unitpipenet=";
  jasHttpGet(getRandNum(),_url,function(id, state, resultset) {
        uexXmlHttpMgr.close(id);
        var arrData = eval('(' + resultset + ')');
        var sql = "insert into priunit(typeid,typename,unitid,unitname)";
        for (var i = 0; i < arrData.length; i++) {
            if(i==0){
                sql+= " select '"+"1020"+"','"+"检测单位"+"','"+arrData[i].codeid +"','"+arrData[i].codename+"'";
            }else{
                sql+= " union all select '"+"1020"+"','"+"检测单位"+"','"+arrData[i].codeid+"','"+arrData[i].codename+"'";
            }
        }
        execSql(sql,initPriUnitDesign);
    });
}
/*
 * 部门初始化(设计单位)
 */
function initPriUnitDesign()
{
    execSql("delete from priunit where typeid = '1030'",insertPriUnitDesign);
}
function insertPriUnitDesign(err,data)
{
    var _url = common_rest_url+"getfordata.do?class=cn.jasgroup.jasframework.privilege.web.controller.UnitController&function=queryAsDomain&parentNum=1030&unitpipenet=";
    jasHttpGet(getRandNum(),_url,function(id, state, resultset) {
        uexXmlHttpMgr.close(id);
        var arrData = eval('(' + resultset + ')');
        var sql = "insert into priunit(typeid,typename,unitid,unitname)";
        for (var i = 0; i < arrData.length; i++) {
            if(i==0){
                sql+= " select '"+"1030"+"','"+"设计单位"+"','"+arrData[i].codeid +"','"+arrData[i].codename+"'";
            }else{
                sql+= " union all select '"+"1030"+"','"+"设计单位"+"','"+arrData[i].codeid+"','"+arrData[i].codename+"'";
            }
        }
        execSql(sql,initPriUnitSurvey);
    });
}

/*
 * 部门初始化(勘察单位)
 */
function initPriUnitSurvey()
{
    execSql("delete from priunit where typeid = '1050'",insertPriUnitSurvey);
}
function insertPriUnitSurvey(err,data)
{
    var _url = common_rest_url+"getfordata.do?class=cn.jasgroup.jasframework.privilege.web.controller.UnitController&function=queryAsDomain&parentNum=1050&unitpipenet=";
    var _postData = {"parentNum":"1050"};
    jasHttpGet(getRandNum(),_url,function(id, state, resultset) {
        uexXmlHttpMgr.close(id);
        var arrData = eval('(' + resultset + ')');
        var sql = "insert into priunit(typeid,typename,unitid,unitname)";
        for (var i = 0; i < arrData.length; i++) {
            if(i==0){
                sql+= " select '"+"1050"+"','"+"勘察单位"+"','"+arrData[i].codeid +"','"+arrData[i].codename+"'";
            }else{
                sql+= " union all select '"+"1050"+"','"+"勘察单位"+"','"+arrData[i].codeid+"','"+arrData[i].codename+"'";
            }
        }
        execSql(sql,initPriUnitSupervisor);
    });
}

/*
 * 部门初始化(监理单位)
 */
function initPriUnitSupervisor()
{
    execSql("delete from priunit where typeid = '1040'",insertPriUnitSupervisor);
}
function insertPriUnitSupervisor(err,data)
{
    var _url = common_rest_url+"getfordata.do?class=cn.jasgroup.jasframework.privilege.web.controller.UnitController&function=queryAsDomain&parentNum=1040&unitpipenet=";
    jasHttpGet(getRandNum(),_url,function(id, state, resultset) {
        uexXmlHttpMgr.close(id);
        var arrData = eval('(' + resultset + ')');
        var sql = "insert into priunit(typeid,typename,unitid,unitname)";
        for (var i = 0; i < arrData.length; i++) {
            if(i==0){
                sql+= " select '"+"1040"+"','"+"监理单位"+"','"+arrData[i].codeid +"','"+arrData[i].codename+"'";
            }else{
                sql+= " union all select '"+"1040"+"','"+"监理单位"+"','"+arrData[i].codeid+"','"+arrData[i].codename+"'";
            }
        }
        execSql(sql,initPriUnitBuild);
    });
}

/*
 * 部门初始化(建设单位)
 */
function initPriUnitBuild()
{
    execSql("delete from priunit where typeid = '1060'",insertPriUnitBuild);
}
function insertPriUnitBuild(err,data)
{
    var _url = common_rest_url+"getfordata.do?class=cn.jasgroup.jasframework.privilege.web.controller.UnitController&function=queryAsDomain&parentNum=1060&unitpipenet=";
    var _postData = {"parentNum":"1060"};
    jasHttpGet(getRandNum(),_url,function(id, state, resultset) {
        uexXmlHttpMgr.close(id);
        var arrData = eval('(' + resultset + ')');
        var sql = "insert into priunit(typeid,typename,unitid,unitname)";
        for (var i = 0; i < arrData.length; i++) {
            if(i==0){
                sql+= " select '"+"1060"+"','"+"建设单位"+"','"+arrData[i].codeid +"','"+arrData[i].codename+"'";
            }else{
                sql+= " union all select '"+"1060"+"','"+"建设单位"+"','"+arrData[i].codeid+"','"+arrData[i].codename+"'";
            }
        }
        execSql(sql,initDcsUser);
   });
}
//用户信息初始化
function initDcsUser(){
    execSql("delete from dcsuser where 1=1 ",insertDcsUser);
}
function insertDcsUser (err,data) {
    var url = common_rest_url + "getfordata.do?class=mobileappController&function=dcsuser";
    jasHttpGet(getRandNum(),url,function (id, state, resultset){
        var arrData = eval('(' + resultset + ')');
        uexXmlHttpMgr.close(id);
        var sql = "insert into dcsuser(name,loginname,eventid,password,uniteventid)";
        for(var i=0;i<arrData.length;i++){
            if(i==0){
                sql += " select '" + arrData[i].NAME+"','"+arrData[i].LOGINNAME+"','"+arrData[i].EVENTID+"','"+arrData[i].PASSWORD+"','"+arrData[i].UNITEVENTID+"'";
            }else{
                sql += " union all select '" + arrData[i].NAME+"','"+arrData[i].LOGINNAME+"','"+arrData[i].EVENTID+"','"+arrData[i].PASSWORD+"','"+arrData[i].UNITEVENTID+"'";
            }
        }
        execSql(sql,initDesignMark);
    })
}
//设计桩信息初始化
function initDesignMark () {
  execSql("delete from designmark where 1=1 ",insertDesignMark);
}

function insertDesignMark(err,data){
    var _url = common_rest_url+"getfordata.do?class=mobileappController&function=designmark";
    jasHttpGet(getRandNum(),_url,function(id, state, resultset) {
        var arrData = eval('(' + resultset + ')');
        uexXmlHttpMgr.close(id);
        var sql = "insert into designmark(marknum,eventid,sectioneventid)";
        for(var i=0;i<arrData.length;i++){
            if(i==0){
                sql += " select '" + arrData[i].MARKERNUMBER+"','"+arrData[i].EVENTID+"','"+arrData[i].SECTIONID+"','"+arrData[i].X+"','"+arrData[i].Y+"'";
            }else{
                sql += " union all select '" + arrData[i].MARKERNUMBER+"','"+arrData[i].EVENTID+"','"+arrData[i].SECTIONID+"','"+arrData[i].X+"','"+arrData[i].Y+"'";
            }
        }
        execSql(sql,initWelderInfo);
    });
}


/*
 * 焊工信息初始化
 */
function initWelderInfo()
{
    execSql("delete from dcswelder where 1=1 ",insertWelderInfo);
}
function insertWelderInfo(err,data)
{
    var url = common_rest_url + "postfordata.do?class=dcsWelderController&function=findPage&rows=2000";
    var postData = {active:"1"};
    jasHttpPost(getRandNum(),url,function(id, state, result) {
        var resultset = JSON.parse(result);
        uexXmlHttpMgr.close(id);
        if (resultset.success != null && resultset.success == 1) {
            var arrData = resultset.rows;       
            var sql = "insert into dcswelder(eventid,projecteventid,projectname,sectioneventid,sectionname,weldername,welderid,workid,registerdate,remarks)";
            for (var i = 0; i < arrData.length; i++) {
                if(i==0){
                    sql+= " select '"+arrData[i].eventid+"'";
                    sql+= ",'"+arrData[i].projecteventid+"'";
                    sql+= ",'"+arrData[i].projectname+"'";
                    sql+= ",'"+arrData[i].sectioneventid+"'";
                    sql+= ",'"+arrData[i].sectionname+"'";
                    sql+= ",'"+arrData[i].weldername+"'";
                    sql+= ",'"+arrData[i].welderid+"'";
                    sql+= ",'"+arrData[i].workid+"'";
                    sql+= ",'"+arrData[i].registerdate+"'";
                    sql+= ",'"+arrData[i].remarks+"'";
                }else{
                    sql+= " union all select '"+arrData[i].eventid+"'";
                    sql+= ",'"+arrData[i].projecteventid+"'";
                    sql+= ",'"+arrData[i].projectname+"'";
                    sql+= ",'"+arrData[i].sectioneventid+"'";
                    sql+= ",'"+arrData[i].sectionname+"'";
                    sql+= ",'"+arrData[i].weldername+"'";
                    sql+= ",'"+arrData[i].welderid+"'";
                    sql+= ",'"+arrData[i].workid+"'";
                    sql+= ",'"+arrData[i].registerdate+"'";
                    sql+= ",'"+arrData[i].remarks+"'";
                }
          }
          execSql(sql,initWelderTeamInfo);
      } 
    },JSON.stringify(postData));
}

/*
 * 机组数据同步
 */
function initWelderTeamInfo()
{
    execSql("delete from dcsweldteam where 1=1 ",insertWelderTeamInfo);
}
function insertWelderTeamInfo(err,data)
{
    var url = common_rest_url + "postfordata.do?class=constructionController&function=findPage&rows=2000";
    var postData = {active:"1"};
    jasHttpPost(getRandNum(),url,function(id, state, result) {
        var resultset = JSON.parse(result);
        uexXmlHttpMgr.close(id);
        if (resultset.success != null && resultset.success == 1) {
            var arrData = resultset.rows;       
            var sql = "insert into dcsweldteam(eventid,projecteventid,projectname,sectioneventid,sectionname,cooperativeunitid,cooperativeunitidname,unitname,unitcode,unitleader,remarks)";
            for (var i = 0; i < arrData.length; i++) {
                if(i==0){
                    sql+= " select '"+arrData[i].eventid+"'";
                    sql+= ",'"+arrData[i].projecteventid+"'";
                    sql+= ",'"+arrData[i].projectname+"'";
                    sql+= ",'"+arrData[i].sectioneventid+"'";
                    sql+= ",'"+arrData[i].sectionname+"'";
                    sql+= ",'"+arrData[i].cooperativeunitid+"'";
                    sql+= ",'"+arrData[i].cooperativeunitidname+"'";
                    sql+= ",'"+arrData[i].unitname+"'";
                    sql+= ",'"+arrData[i].unitcode+"'";
                    sql+= ",'"+arrData[i].unitleader+"'";
                    sql+= ",'"+arrData[i].remarks+"'";
                }else{
                    sql+= " union all select '"+arrData[i].eventid+"'";
                    sql+= ",'"+arrData[i].projecteventid+"'";
                    sql+= ",'"+arrData[i].projectname+"'";
                    sql+= ",'"+arrData[i].sectioneventid+"'";
                    sql+= ",'"+arrData[i].sectionname+"'";
                    sql+= ",'"+arrData[i].cooperativeunitid+"'";
                    sql+= ",'"+arrData[i].cooperativeunitidname+"'";
                    sql+= ",'"+arrData[i].unitname+"'";
                    sql+= ",'"+arrData[i].unitcode+"'";
                    sql+= ",'"+arrData[i].unitleader+"'";
                    sql+= ",'"+arrData[i].remarks+"'";
                }
            }
            execSql(sql,alertToast("本地数据初始化完成"));
      } 
    },JSON.stringify(postData));
}