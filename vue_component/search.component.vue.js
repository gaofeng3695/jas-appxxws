
    // <search-input 
    //     v-model= "keyword"
    //     @dosearch="dosearch"
    //     placeholder="搜索用户名称、地址、安检人、楼号">
    // </search-input>


Vue.component('search-input', {
    props: ['placeholder','value'],
    template: ['<div class="searchWrap ub ub-pc ">',
        '<div class="ub ub-f1 searchBox ub-ac">',
        '<div class="uinput ub ub-f1 ub-ac">',
        '<input :placeholder="placeholder" v-bind:value="value" @input="emitInput($event.target.value)" type="search" class="ub-f1" >',
        '</div>',
        '<div class="searchDelete" @click="clear();search()"  v-bind:style="deletestyle"></div>',
        '<div class="searchLine"></div>',
        '<div class="searchBtn ulev26 ub ub-ac" @click="search">搜索</div>',
        '</div>',
        '</div> '
    ].join(''),
    data: function() {
        return {
            //value: '',
        };
    },
    computed : {
        deletestyle : function(){ //样式obj，控制清空按钮是否显示
            if (this.value) {
                return {'visibility':'visible'};
            }
            return {};
        }
    },
    methods: {
        search: function() {
            this.$emit('dosearch');
        },
        clear : function(){
            this.$emit('input', '');
        },
        emitInput : function(s){
             this.$emit('input', s);
        }
    },

});
