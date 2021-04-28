

Vue.component('textarea-common',{

    props : {
        value : String,
        placeholder : String,

        title : {
            default : '输入类目'
        },
        required : {
            type: [String,Boolean],
            default: false,            
        }            
    },

    template : [
           '<div class="ub" style="line-height: 2.2em;margin-bottom: .625em">',
                '<div style="padding-right:.625em;min-width:3.25em;overflow: hidden;">',
                    '<span class="clr666 ulev26" :style="wordstyle">{{title}}</span>',
                    '<em v-if="required" style="font-size:.8125em;color:red;position: absolute;right: .3em;">*</em>',                    
                '</div>',
                '<div class="ub ub-f1 ub-fv uinput clr333" style="background:#f4f4f4;padding:0 .625em;" >',

                    '<textarea :value="value" @input="emitInput($event)" :placeholder="placeholder" class="ulev26" style="line-height: 1.2;min-height: 5em; " maxlength="200" cols="30" rows="4"></textarea>',
                    
                '</div>',
            '</div>',
    ].join(''),

    data : function(){
        return {

        };
    },
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
        emitInput : function(e){
            //alert()
            var s = this.filterEmoji(e.target.value);
            e.target.value = s;
            this.$emit('input',s); 
        },
        // /ud83c[udc00-udfff]|ud83d[udc00-udfff]|[u2000-u2fff]/g
        filterEmoji : function(s){ //过滤emoji
            var ranges = [
                '\ud83c[\udf00-\udfff]', 
                '\ud83d[\udc00-\ude4f]', 
                '\ud83d[\ude80-\udeff]',
                '\ud83d[\udc00-\udfff]',
                '[\u2000-\u2fff]'
            ];
            return s.replace(new RegExp(ranges.join('|'), 'g'),'');
            //return s.replace(/\ud83c[\udc00-\udfff]|\ud83d[\udc00-\udfff]|[\u2000-\u2fff]/g,'');
        }       
    }


});