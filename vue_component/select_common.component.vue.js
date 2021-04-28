

Vue.component('select-common',{
    model :{
        prop: 'value',
        event: 'change'
    },
    props:{
        value : String,
        valuename : String,
        options : {

        },
        placeholder : String,
        valid : {
            default: true,
        },
        title : {
            default : '输入类目'
        },
        keyname : String,
        required : {
            type: [String,Boolean],
            default: false,            
        }        
    },
    template : [
        '<div class="ub" style="height: 2.2em;line-height: 2.2em;margin-bottom: .625em">',
            '<div style="padding-right:.625em;min-width:3.25em;overflow: hidden;">',
                '<span class="clr666 ulev26" :style="wordstyle">{{title}}</span>',
                '<em v-if="required" style="font-size:.8125em;color:red;position: absolute;right: .3em;">*</em>',
                
            '</div>',
            '<div class="select ub-f1" style="background:#f4f4f4;padding: 0 .4em 0 .625em;" >',

                    '<div class="text ulev26 clr333" style="padding:0;">',
                        '{{valuename}}',
                        '<span class="clr999" v-if="!valuename">{{placeholder}}</span>',
                    '</div>',
                    '<div class="icon clr666"></div>',
                    '<select v-bind:value="value" @change="triggerChange($event.target.value)">',
                        '<option v-for="option in options" :value="option.value">{{option.text}}</option>',
                    '</select>',

            '</div>',
        '</div>',
    ].join(''),

    computed : {
        wordstyle : function(){
            if (this.title.length === 3) {
                return{
                    'letter-spacing': '.5em',
                    'margin-right': '-.5em'
                };
            }
            if (this.title.length === 2) {
                return{
                    'letter-spacing': '2em',
                    'margin-right': '-2em'
                };
            }
            return {};           
        }
    },    
    methods : {
        triggerChange : function(s){
            this.$emit('change',s);
        }
    }

});