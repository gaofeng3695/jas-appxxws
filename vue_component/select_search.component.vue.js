
    // <select-search
    //     title="维修状态"
    //     v-model="query.status"
    //     :valuename="query.status"
    //     :options="statusoptions"
    // ></select-search>
Vue.component('select-search',{
    model : {
        prop: 'value',
        event: 'change'        
    },
    props : {
        title : {
            type : String,
            default : '请选择'
        },
        value : String,
        valuename : String,
        options:{
            type : Array,
        }
    },
    template : [
        '<div class="select clr333 " style="height:2.2em;">',
            '<div class="text  downIcon" style="padding: 0 .8em 0 .5em;line-height:2.2em;">',
                '<span class="ulev30">{{valuename || title}}</span>',
                '<span class="fa-sort-desc" style="font:normal normal normal 14px/1 FontAwesome;position: absolute;font-size: 0.75em !important;top: .8em;right: 0;" ></span>',
            '</div>',
            '<select :value="value" @change="triggerChange($event.target.value)">',
                '<option v-for="option in options" :value="option.value">{{option.text}}</option>',            
            '</select>',
        '</div>'
    ].join(''),
    data : function(){
        return {

        };
    },
    methods : {
        triggerChange : function(s){
            this.$emit('change',s);
        }
    }
});




Vue.component('select-search-group',{
    props : ['value1','valuename1','title1','options1','value2','valuename2','title2','options2','value3','valuename3','title3','options3',],    
    template : [
        '<div class="ub" style=" border-bottom: 1px solid #ccc;border-top: 1px solid #ccc;">' ,

            '<div v-if="options1" class="ub-f1 ub ub-ac ub-pc lh01 bgfff width1000 uof" style="width:2000px;">',
                '<select-search :title="title1"  :value="value1" @change="changevalue1" :valuename="valuename1" :options="options1"></select-search>',
            '</div>',
            '<div v-if="options2" class="ub-f1 ub ub-ac ub-pc lh01 bgfff width1000 uof" style="width:2000px;">',
                '<select-search :title="title2"  :value="value2" @change="changevalue2" :valuename="valuename2" :options="options2"></select-search>',
            '</div>',
            '<div v-if="options3" class="ub-f1 ub ub-ac ub-pc lh01 bgfff width1000 uof" style="width:2000px;">',
                '<select-search :title="title3"  :value="value3" @change="changevalue3" :valuename="valuename3" :options="options3"></select-search>',
            '</div>',
        '</div>',
    ].join(''),
    methods : {
        changevalue1 : function(s){
            this.$emit('change1',s);
        },
        changevalue2 : function(s){
            this.$emit('change2',s);
        },
        changevalue3 : function(s){
            this.$emit('change3',s);
        }        
    },
});
