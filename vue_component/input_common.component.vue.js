

Vue.component('input-common',{
    props:{
        icon : String,
        placeholder : String,
        disabled : [String,Boolean],
        types:String,//用于区分 input框本身有的属性 type
        type : {
            type : String,
            default : 'text',
        },
        valid : {
            default: true,
        },
        title : {
            default : '输入类目'
        },
        keyname : String,
        value : {
            type: [String,Number],
            default: ''
        },
        iconwidth : {
            default : '1.4em'
        },
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
                '<div class="ub ub-f1 ub-fv" style="background:#f4f4f4;" @click="emitclick()">',

                    '<div class="ub-f1" style="padding: 0 .625em;">',
                        '<input :type="type" style="background: #f4f4f4;width: 99%;outline:none;border:none;" class="ulev26 clr333" :placeholder="placeholder" v-bind:value="value" @input="emitInput($event)" @blur="emitBlur($event.target.value)" :disabled=" disabled||icon">',
                    '</div>',
                    '<div v-show="!valid" class="bgSelectDate" :style="[style.caution]"></div>',
                    '<div v-if="icon" class="bgSelectDate" :style="[style.icontip]"></div>',      
                    
                '</div>',
            '</div>',
    ].join(''),
    watch:{
      value:function(){
          if(this.types=='number'){
              this.value=this.value.replace(/[^\d.]/g, '');
              Vue.set(this.value); 
          }
      }  
    },
    data : function(){
        return {

            style:{
                icontip :{
                    background : 'url('+this.icon+') no-repeat center center',
                    'background-size': this.iconwidth,
                    width: +this.iconwidth.split('em')[0]+0.2+'em',
                    'margin-right': '.5em'                                         
                },
                caution :{
                    background:'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAYAAAAe2bNZAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjJENzlCQUVEMUI1MjExRTdBN0M2RUFBOTY1QUFDQjFBIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjJENzlCQUVFMUI1MjExRTdBN0M2RUFBOTY1QUFDQjFBIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MkQ3OUJBRUIxQjUyMTFFN0E3QzZFQUE5NjVBQUNCMUEiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MkQ3OUJBRUMxQjUyMTFFN0E3QzZFQUE5NjVBQUNCMUEiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4DBx2CAAAC90lEQVR42rSYz2sTURDHJ5ttghZS7SF6KdRDU2+1KEp6sP4qeOjJQ89Kz0UFhVK0BwtFoaD/gdKTXoRS0ItW66UKCq2nJhfpqbGU2h9p87NZvxNn4+42kH1vk4HPYZN9M1923rz35oWyo6OkYGEwCK6DCyABToIOsAP+gDT4DhbAZ3Do13nIp5g4uA9ug9MK4jPgFXgONhq9bDT4PwIegV9gXFEIyfvjMv6x+NMSwyn4BqbAcQpmPP6J+OtVFTMoA89Rc439fRX/vsRcA+/ACWqNsd/3EsdlpueZP+Fbv2kxBwaobWgI9SIFEwpRYXaWKmtrjYYekziXQKqemCh4LWXqy4x4nIyuLnd5xmJ+h3OcNyKo4E3TA9U5Uslkjv5YKqm46AMPvXPmFJhQzn6l4n62LLKyWVUvExK/JuauVvkieMAvY8+fe7YYnjd3dMrC2turM5EMHVcc3+SRlzVW1vqBUU2aYjhNVw3Z9LTMyufdz7kcWfv7uu5usJjz2ssXB3bOm2KRyCNQpbJYzFltMab5LzXOtOmlqbrgGnIe0UvTwYE7VcHEdPLImPaXYSGcGkeaLOezmsVYzK62GE/1WF5xarZryFFRL01cPUiVS5y+bbGYVe3hqKSQQ0AoEgkiJsVifgQ6nTgF1Nse/NsKbwUftTZJew7PzDQjRWwfWMwX8NveOZU37vV1NDDh/wcsPeP4n1hMGbyUU7yShRMJioyMkNHdXX0uLy1RcW6OrM1NVVccv2zX5QuQU/UQHRurCakuyMkkmf39qm5yEr92nuHPNK1cTBtH+7Ly8rKqm2mJ7+ooo9Ke9Ple89rbqW14mMI9PdU1pzQ/T4fptFIFOc/A3va2VwR1UOttx9sdeHc1/uMWV2yLheQlTqpRE8e3BzfBdouEbIv/Bb/t7SJIgp9NFrIifhdVG3/esy6CSZ2yr1O+kzJHVnWvRApyC3EGPPVzx+Ixfv+ZjJ+yqyboZZHz5uqKNO32zVWnHND4XLQV5ObqrwADAOGczmCEHRePAAAAAElFTkSuQmCC") no-repeat center center',
                    'background-size': '1.2em',
                    width:'1.4em',
                    'margin-right': '.5em'                             
                },
            }
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
    methods: {
        emitclick : function(){
            this.$emit('click');
        },
        emitBlur : function(s){
            this.$emit('verify',s,this.keyname);
        },
        emitInput : function(e){
            //alert()
            // var s = this.filterEmoji(e.target.value);
            // e.target.value = s;
            // this.$emit('input',s); 
            this.$emit('input',e.target.value); 
        },
        filterEmoji : function(s){ //过滤emoji
            var ranges = [
                '\ud83c[\udf00-\udfff]', 
                '\ud83d[\udc00-\ude4f]', 
                '\ud83d[\ude80-\udeff]',
                '\ud83d[\udc00-\udfff]',
                '[\u2000-\u2fff]'
            ];
            return s.replace(new RegExp(ranges.join('|'), 'g'),'');
        }                  
    },    
    mounted : function(){

    }

});