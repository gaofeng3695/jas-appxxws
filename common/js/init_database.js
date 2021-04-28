var initAppDB = {
    /*
     * 创建本地ip配置库
     */
    createIpConfig: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists IpConfig (id INTEGER PRIMARY KEY AUTOINCREMENT,protocol text,ip text,port text);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createInsRecord();
            }
        });
    },
    /*
     * 创建本地巡检记录表 InsRecord
     * sf 2016-11-02
     */
    createInsRecord: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists InsRecord (id INTEGER PRIMARY KEY AUTOINCREMENT,localID text,recordID text,partURL text,postdata text,flag int);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createInsTrajectory();
            }
        });
    },
    /*
     * 创建本地巡检轨迹表 InsTrajectory
     * sf 2016-11-02
     */
    createInsTrajectory: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists InsTrajectory (id INTEGER PRIMARY KEY AUTOINCREMENT,localID text,recordID text,partURL text,postdata text,flag int);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createInsRecordForRB();
            }
        });
    },
    /*
     * 创建本地巡检记录表 InsRecordForRB
     * sf 2017-06-15
     */
    createInsRecordForRB: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists InsRecordForRB (id INTEGER PRIMARY KEY AUTOINCREMENT,enterpriseId text,userId text,recordId text,postData text,flag int);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createInsTrajectoryForRB();
            }
        });
    },
    /*
     * 创建本地巡检轨迹表 InsTrajectoryForRB
     * sf 2017-06-15
     */
    createInsTrajectoryForRB: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists InsTrajectoryForRB (id INTEGER PRIMARY KEY AUTOINCREMENT,recordId text,postData text,flag int);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createInsMonitor();
            }
        });
    },
    /*
     * 创建本地监控记录表
     * sf 2016-11-02
     */
    createInsMonitor: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists InsMonitor (id INTEGER PRIMARY KEY AUTOINCREMENT,localID text,recordID text,partURL text,postdata text,flag int);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createEventList();
            }
        });
    },
    /*
     * 创建事件的草稿箱列表
     */
    createEventList: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists eventlist (id INTEGER PRIMARY KEY AUTOINCREMENT,localId text,eventId text,partURL text,postdata text,enterpriseId text,userId text,state int);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createEventAttachment();
            }
        });
    },
    /*
     * 创建事件的草稿箱附件的列表
     */
    createEventAttachment: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists event_attachment (id INTEGER PRIMARY KEY AUTOINCREMENT,localID text,eventId text,attaType text,localURL text,postdata text,state int);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createLoginInfo();
            }
        });
    },
    /*
     * 创建手机号和密码的记录表
     */
    createLoginInfo: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists login_info (id INTEGER PRIMARY KEY AUTOINCREMENT,registNum text,pwd text,lastLoginDate text);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createEventType();
            }
        });
    },
    /*
     * 事件类型域值
     */
    createEventType: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists eventType (id INTEGER PRIMARY KEY AUTOINCREMENT,parentId text,objectId text,typeName text,indexNum int);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createCustomEventType();
            }
        });
    },
    /*
     * 事件类型域值(自定义)
     * 2017-8-10 新增
     */
    createCustomEventType: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists customEventType (id INTEGER PRIMARY KEY AUTOINCREMENT,parentId text,objectId text,typeName text,parentIndexNum int,indexNum int,iconName text);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createFavContacts();
            }
        });
    },
    /*
     * 创建常用联系人
     */
    createFavContacts: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists favcontacts (id INTEGER PRIMARY KEY AUTOINCREMENT,userId text,enterpriseId text,jsonData text,usedCount int);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createLocalNews();
            }
        });
    },
    /*
     * 创建消息草稿箱
     */
    createLocalNews: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists localnews (id INTEGER PRIMARY KEY AUTOINCREMENT,localId text,objectId text,userId text,enterpriseId text,postdata text,state int);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createLocalNewsAtta();
            }
        });
    },
    /*
     * 创建消息草稿箱的附件表
     */
    createLocalNewsAtta: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists localnewsatta (id INTEGER PRIMARY KEY AUTOINCREMENT,localId text,objectId text,attaType text,localURL text,postdata text,state int);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createGuidePage();
            }
        });
    },
    /*
     * 创建引导页记录
     */
    createGuidePage: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists guidepage (id INTEGER PRIMARY KEY AUTOINCREMENT,state int);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createEhscRecord();
            }
        });
    },
    /*
     * 创建入户安检记录
     */
    createEhscRecord: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists ehscRecord (id INTEGER PRIMARY KEY AUTOINCREMENT,localId text,objectId text,planId text,postData text,userId text,userName text,securityCheckTime text,enterpriseId text,enterhomeAddress text,enterhomeUserName text,state int,groupId text);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createEhscRecordAttachment();
            }
        });
    },
    /*
     * 创建入户安检记录附件
     */
    createEhscRecordAttachment: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists ehscRecord_attachment (id INTEGER PRIMARY KEY AUTOINCREMENT,localId text,recordId text,attaType text,postData text,state int);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createPlfFacility();
            }
        });
    },
    /*
     * 创建管网设施表
     */
    createPlfFacility: function() {
        var that = this;
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists plf_facility (id integer primary key autoincrement,objectId text,facilityName text,facilityCode text,facilityTypeCode text,pipelineTypeCode text,facilityStatusCode text,address text,postData text,createUserId text,createUserName text,enterpriseId text,createTime text,state integer default 0)";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createPlfFacilityRecord();
            }
        });
    },
    /**
     *管网设施检查记录表 
     */
    createPlfFacilityRecord: function() {
        var that = this;
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists plf_facility_record (id integer primary key autoincrement,objectId text,facilityId text,facilityName text,address text,facilityTypeName text,facilityTypeCode text,facilityCheckTime text,createUserId text,createUserName text,enterpriseId text,facilityCheckResult integer,postData text,state integer)";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createMaintenance();
            }
        });
    },
    /*
     * 创建维修维护
     */
    createMaintenance: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists maintenance (id INTEGER PRIMARY KEY AUTOINCREMENT,workId text,objectId text,maintenanceData text,userId text,userName text,originTypeCode text,enterpriseId text,remediationTime text,address text,reason text,createUserName text,relationshipPersonNames text,state int);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createMaintenanceAttachment();
            }
        });
    },
    /*
     * 创建维修维护记录附件
     */
    createMaintenanceAttachment: function() {
        var that = this;
        //!必须有
        var dbOperation = new DataBaseOperation();
        var sql = "create table if not exists maintenance_attachment (id INTEGER PRIMARY KEY AUTOINCREMENT,workId text,objectId text,attaType text,postData text,state int);";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.createDomainTable();
            }
        });
    },
    /**
     * 创建阈值表 
     */
    createDomainTable: function() {
        var that = this;
        var dbOperation = new DataBaseOperation();
        //var sql = "create table if not exists domain_table (id integer primary key autoincrement,objectId integer,domianName text,domainNameCN text,valueColumn text,codeColumn text,descColumn text,active integer,orderColumn integer)";
        var sql = "create table if not exists domain_table (id integer primary key autoincrement,objectId integer,domainName text,domainNameCN text,domainValue text,domainCode text,remark text,active integer,rowIndex integer)";
        dbOperation.dbCreateTable(sql, function(err, data) {
            if (err == null && data >= 0) {
                that.initSysConfig();
            }
        });
    },
    /*
     * 初始化网络配置(important)
     */
    initSysConfig: function() {
        var dbOperation = new DataBaseOperation();
        dbOperation.dbSelect("select * from IpConfig", function(err, data) {
            if (err != null) {
                appcan.locStorage.setVal('serverProtocol', 'https://');
                appcan.locStorage.setVal('serverIP', 'apigw.zyax.cn');
                appcan.locStorage.setVal('serverPort', '');
                return;
            }

            if (err == null && data == "") {
                appcan.locStorage.setVal('serverProtocol', 'https://');
                appcan.locStorage.setVal('serverIP', 'apigw.zyax.cn');
                appcan.locStorage.setVal('serverPort', '');
                dbOperation.dbExec("INSERT INTO IpConfig (protocol,ip,port) VALUES ('https://','apigw.zyax.cn','');", function(err2, data2) {});
                return;
            }

            if (err == null && data != null) {
                appcan.locStorage.setVal('serverProtocol', data[0].protocol);
                appcan.locStorage.setVal('serverIP', data[0].ip);
                appcan.locStorage.setVal('serverPort', data[0].port);
                return;
            }
        });
    },
    /*
     * 初始化方法
     */
    initDB: function() {
        // this.createIpConfig();
        this.initTable();
    },
    initTable:function(){
        var init_sql=[
            "create table if not exists IpConfig (id INTEGER PRIMARY KEY AUTOINCREMENT,protocol text,ip text,port text);",
            "create table if not exists InsRecord (id INTEGER PRIMARY KEY AUTOINCREMENT,localID text,recordID text,partURL text,postdata text,flag int);",
            "create table if not exists InsTrajectory (id INTEGER PRIMARY KEY AUTOINCREMENT,localID text,recordID text,partURL text,postdata text,flag int);",
            "create table if not exists InsRecordForRB (id INTEGER PRIMARY KEY AUTOINCREMENT,enterpriseId text,userId text,recordId text,postData text,flag int);",
            "create table if not exists InsTrajectoryForRB (id INTEGER PRIMARY KEY AUTOINCREMENT,recordId text,postData text,flag int);",
            "create table if not exists InsMonitor (id INTEGER PRIMARY KEY AUTOINCREMENT,localID text,recordID text,partURL text,postdata text,flag int);",
            "create table if not exists eventlist (id INTEGER PRIMARY KEY AUTOINCREMENT,localId text,eventId text,partURL text,postdata text,enterpriseId text,userId text,state int);",
            "create table if not exists event_attachment (id INTEGER PRIMARY KEY AUTOINCREMENT,localID text,eventId text,attaType text,localURL text,postdata text,state int);",
            "create table if not exists login_info (id INTEGER PRIMARY KEY AUTOINCREMENT,registNum text,pwd text,lastLoginDate text);",
            "create table if not exists eventType (id INTEGER PRIMARY KEY AUTOINCREMENT,parentId text,objectId text,typeName text,indexNum int);",
            "create table if not exists customEventType (id INTEGER PRIMARY KEY AUTOINCREMENT,parentId text,objectId text,typeName text,parentIndexNum int,indexNum int,iconName text);",
            "create table if not exists favcontacts (id INTEGER PRIMARY KEY AUTOINCREMENT,userId text,enterpriseId text,jsonData text,usedCount int);",
            "create table if not exists localnews (id INTEGER PRIMARY KEY AUTOINCREMENT,localId text,objectId text,userId text,enterpriseId text,postdata text,state int);",
            "create table if not exists localnewsatta (id INTEGER PRIMARY KEY AUTOINCREMENT,localId text,objectId text,attaType text,localURL text,postdata text,state int);",
            "create table if not exists guidepage (id INTEGER PRIMARY KEY AUTOINCREMENT,state int);",
            "create table if not exists ehscRecord (id INTEGER PRIMARY KEY AUTOINCREMENT,localId text,objectId text,planId text,postData text,userId text,userName text,securityCheckTime text,enterpriseId text,enterhomeAddress text,enterhomeUserName text,state int,groupId text);",
            "create table if not exists ehscRecord_attachment (id INTEGER PRIMARY KEY AUTOINCREMENT,localId text,recordId text,attaType text,postData text,state int);",
            "create table if not exists plf_facility (id integer primary key autoincrement,objectId text,facilityName text,facilityCode text,facilityTypeCode text,pipelineTypeCode text,facilityStatusCode text,address text,postData text,createUserId text,createUserName text,enterpriseId text,createTime text,state integer default 0)",
            "create table if not exists plf_facility_record (id integer primary key autoincrement,objectId text,facilityId text,facilityName text,address text,facilityTypeName text,facilityTypeCode text,facilityCheckTime text,createUserId text,createUserName text,enterpriseId text,facilityCheckResult integer,postData text,state integer)",
            "create table if not exists maintenance (id INTEGER PRIMARY KEY AUTOINCREMENT,workId text,objectId text,maintenanceData text,userId text,userName text,originTypeCode text,enterpriseId text,remediationTime text,address text,reason text,createUserName text,relationshipPersonNames text,state int);",
            "create table if not exists maintenance_attachment (id INTEGER PRIMARY KEY AUTOINCREMENT,workId text,objectId text,attaType text,postData text,state int);",
            "create table if not exists domain_table (id integer primary key autoincrement,objectId integer,domainName text,domainNameCN text,domainValue text,domainCode text,remark text,active integer,rowIndex integer)"
        ];
        var dbOperation = new DataBaseOperation();
        dbOperation.dbTrans(init_sql, function (err) {
            if(!err){
                dbOperation.dbSelect("select * from IpConfig", function(err, data) {
                    if (err != null) {
                        appcan.locStorage.setVal('serverProtocol', 'https://');
                        appcan.locStorage.setVal('serverIP', 'apigw.zyax.cn');
                        appcan.locStorage.setVal('serverPort', '');
                        return;
                    }
        
                    if (err == null && data == "") {
                        appcan.locStorage.setVal('serverProtocol', 'https://');
                        appcan.locStorage.setVal('serverIP', 'apigw.zyax.cn');
                        appcan.locStorage.setVal('serverPort', '');
                        dbOperation.dbExec("INSERT INTO IpConfig (protocol,ip,port) VALUES ('https://','apigw.zyax.cn','');", function(err2, data2) {});
                        return;
                    }
        
                    if (err == null && data != null) {
                        appcan.locStorage.setVal('serverProtocol', data[0].protocol);
                        appcan.locStorage.setVal('serverIP', data[0].ip);
                        appcan.locStorage.setVal('serverPort', data[0].port);
                        return;
                    }
                });
            }
        });
    }
}