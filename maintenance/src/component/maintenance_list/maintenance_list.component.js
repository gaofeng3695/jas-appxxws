// 实现列表组件展示
Vue.component('main-list', {
    props: {
        dataobj: Array,
        resource: String,
        checkall: String,
        maintancechecked: Array,
    },
    template: ['<li class="sectionMargin sectionShadow" @click="clickdetail()">',
        '<div class = "ub ubb sc-border-cor">',
        '<div class = "ub ub-ac ub-f1 clr999  lh78 ulev26 " >',
        '<span>维修编号:</span>{{dataobj.maintenanceCode}}</div>',
        '<div class = "ub ub-ac" style="width:8em">',
        '<div class="ulim100 ub-f1 ulev26 clr666 pdl5" >',
        '{{dataobj.createUserName}}</div>',
        '<div class = "ulev26 clrfff  pd5 bor" v-bind:style="bgchange">',
        '<span v-if="dataobj.status==2">已完成</span><span v-else>待维修</span> </div> </div> </div>',
        '<div class = "ub pa20">',
        '<div class = "box ub ub-ac check_width ">',
        '<div class = "checkbox umar-r sc-text-active js_check"  v-bind:style="hide" >',
        '<input type = "checkbox"  class= "uabs ub-con" @click.stop="choose($event.target.value,$event.target.checked)" :value="dataobj.workId" v-model="maintancechecked">',
        '</div><img  v-bind:src="imgByOrigin">',
        ' </div> <div class = "ub-f1 pdl"  >',
        '<div class = "address lh50 ulim100 ulev28" >',
        '<span class = " clr333  "> {{dataobj.address}} </span>',
        '</div> <div class = "ub clr666 ulev28  ulim2">',
        '{{dataobj.reason}}',
        '</div> <div class = "ub  pad2 ub-ac lin4">',
        '<div class="ulev26 clr666 ub-f1">维修期限：{{dataobj.remediationTime.substring(0,10)}}</div>',
        '<div  v-bind:style="bgstatus">',
        '</div> </div> </div></div>',
        ' </li> '
    ].join(" "),
    data: function() {
        return {
            maintanceid: ''
        }
    },
    methods: {
        clickdetail: function() {
            this.checked = false;
            appcan.locStorage.val("maintenanceObj", this.dataobj);
            this.$emit('clickdetail');
        },
        choose: function(s, d) {
            this.$emit('changemaintanceids', s, d);
        }
    },
    computed: {
        hide: function() { //样式obj，控制清空按钮是否显示
            if (this.resource == "1") {
                return {
                    'display': 'none'
                };
            }
            return {};
        },
        bgchange: function() {
            if (this.dataobj.status == "2") {
                return {
                    'background': '#b4b4b2'
                }
            } else {
                return {
                    'background': '#fea235'
                }
            }
        },
        imgByOrigin: function() {
            if (this.dataobj.originTypeCode == "MO_01") {
                return '../src/images/home.png'
            } else if (this.dataobj.originTypeCode == "MO_02") {
                return '../src/images/facility.png'
            } else if (this.dataobj.originTypeCode == "MO_03") {
                return '../src/images/everyday.png'
            } else {
                return '../src/images/other.png'
            }
        },
        bgstatus: function() {
            if (this.dataobj.isUnUp) {
                return {
                    'width': '4em',
                    'height': '1.625em',
                    'background': 'url(../src/images/unup.png) no-repeat center center' ,
                    'background-size': '4em 1.625em',
                }
            }
            if (this.dataobj.isTrash) {
                return {
                    'width': '4em',
                    'height': '1.625em',
                    'background': 'url(../src/images/trash.png) no-repeat center center' ,
                    'background-size': '4em 1.625em',
                }
            }
            return {};
        }
    }
});

// window.onerror = function(msg, url, line) {
// alert("erro" + msg + "\n" + url + ":" + line);
// return true;
// };