

    // <item-detail 
    //     name="维修编号" 
    //     :value="query.maintenanceCode" 
    //     :borderbottom="true"
    //     icon="../src/images/plus.png"
    //     @clickicon="clickicon"
    // ></item-detail>  

Vue.component('item-detail',{
    props:{
        icon : String,
        name : {
            default : '输入类目'
        },
        value : {
            type: [String,Number],
            default: ''
        },
        iconwidth : {
            default : '1.4em'
        },
        borderbottom : {
            default : false
        },
        btn:String
    },
    template : [
            '<div class="ub" style="padding:.5em 0;margin: 0 .625em;line-height:1.4em;" :style="borderbtm">',
                '<div class="leftStyle ub ub-ac" style="padding-right:.625em;min-width:3.25em;overflow: hidden;">',
                    '<span class="ulev26 clr666" :style="wordstyle">{{name}}</span>',
                '</div>',
                '<div class="ub-f1" style="border-left: 1px solid #ececec;word-break: break-all;overflow: auto;padding-left:.625em ;">',
                    '<span class="clr333 ulev28">{{value}}</span>',
                '</div>',
                '<div v-if="icon" :style="[style.icontip]" @click="triggerClickIcon"></div>',  
                '<div v-if="btn" :style="[style.btntip]" @click="triggerClickbtn">{{btn}}</div>',      
            '</div>'            
    ].join(''),
    data : function(){
        return {
            style:{
                icontip :{
                    background : 'url('+this.icon+') no-repeat center center',
                    'background-size': this.iconwidth,
                    width: +this.iconwidth.split('em')[0]+0.2+'em',
                    'margin-left': '.4em'                                         
                },
                btntip:{
                    border:'1px solid #ececec',
                    padding:'0px 10px',
                    color:'#333'
                }
            }
        };
    },
    computed : {
        wordstyle : function(){
            if (this.name.length === 3) {
                return{
                    'letter-spacing': '.5em',
                    'margin-right': '-.5em'
                };
            }
            if (this.name.length === 2) {
                return{
                    'letter-spacing': '2em',
                    'margin-right': '-2em'
                };
            }
            return {};           
        },
        borderbtm : function(){
            if (this.borderbottom) {
                return {
                    'border-bottom' : '1px solid #ececec'
                };
            }
            return {};
        }
    },
    methods: {
        triggerClickIcon : function(){
            this.$emit('clickicon',this.name);
        },
        triggerClickbtn:function(){
            this.$emit('clickbtn'); 
        }     
    },    
});