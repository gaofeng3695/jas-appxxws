/*
** 依赖appcan公共样式、js
*/

    // <footer-common
    // :btns="[{color:'#fbc484',name:'修改记录',disabled : false},{color:'#59bcf6',name:'修改录'}]"
    // @click1="click1"
    // @click2="click2">
    // </footer-common>

    // <footer-switch
    //     :btns1="[{color:'#59bcf6',name:'返回'}]"
    //     :btns2="[{color:'#59bcf6',name:'上传'},{color:'#faae3e',name:'删除'}]"
    //     :state="state"
    //     @click11="click1" 
    //     @click21="click2" 
    //     @click22="click3" 
    // ></footer-switch> 

Vue.component('footer-common', {
    props: {
        btns : {
            type : Array //[{color:'#fbc484',name:'修改记录',disabled : false},{color:'#59bcf6',name:'修改录'}]
        },
    }, 
    template: [
        '<div class="ub topShadow">',
           '<footer-line :btns="btns" @click1="click1" @click2="click2" @click3="click3"></footer-line>',
        '</div>',
    ].join(''),
    methods : {
        click1 : function(item){
            this.$emit('click1',item);
        },
        click2 : function(item){
            this.$emit('click2',item);
        },
        click3 : function(item){
            this.$emit('click3',item);
        },                
    },
});


Vue.component('footer-switch', {
    props: {
        btns1 : {
            type : Array //[{color:'#fbc484',name:'修改记录',disabled : false},{color:'#59bcf6',name:'修改录'}]
        },
        btns2 : {
            type : Array
        },
        state : { //显示第一行还是第二行 ，1、2
            default : 1,
            type : [Number,String]
        }
    }, 
    template: [
        '<div class="ub topShadow uof" style="height:3.06em;">',
            '<div style="height:6.12em;width:100%;" :style="[style.animate,translate]">',
               '<footer-line :btns="btns1" @click1="click11" @click2="click12" @click3="click13"></footer-line>',
               '<footer-line :btns="btns2" @click1="click21" @click2="click22" @click3="click23"></footer-line>',
            '</div>',
        '</div>',
    ].join(''),
    data : function(){
        return {
            style : {
                animate : {
                    transition : 'all .4s',
                }
            }
        };
    },
    computed : {
        translate: function(){
            return +this.state === 1 ?{}:{'transform' :'translateY(-50%)'};
        } 
    },
    methods : {
        click11 : function(item){
            this.$emit('click11',item);
        },
        click12 : function(item){
            this.$emit('click12',item);
        },
        click13 : function(item){
            this.$emit('click13',item);
        },   
        click21 : function(item){
            this.$emit('click21',item);
        },
        click22 : function(item){
            this.$emit('click22',item);
        },
        click23 : function(item){
            this.$emit('click23',item);
        },                      
    },
});


Vue.component('footer-line', {
    props: {
        btns : {
            type : Array
        },
    }, 
    template: [
        '<div class="ub" :style="style.wrapper">', 
            '<div v-for="item,index in mybtns" @click.once="clickbtn($event.currentTarget,item,index)" class="js_btn uc-a1 ub-f1 bgclr ub ub-ac ub-pc" :style="[style.btnitem,{background:item.color}]" >',
                '<span class="ulev30">{{item.name}}</span>',
            '</div>',
        '</div>',
    ].join(''),
    data: function() {
        return {
            style: {
                wrapper: {
                    width : '100%',
                    background: 'white',
                    color: 'white',
                    height: '3.06em',
                    padding : '.5em .25em',
                    boxSizing : 'border-box',
                },
                btnitem :{
                    margin: '0 .25em',
                    width:'1000px',
                }
            }
        };
    },
    computed: {
        mybtns: function() {
            if (!this.btns) {
                return [{
                    color : '#59b7fc',
                    name : '确定',
                    disabled : false
                },{
                    color : '#59b7fc',
                    name : '确定',
                    disabled : false
                }];
            }
            return this.btns;
        }
    },
    methods : {
        clickbtn : function(dom,item,index){
            var that = this;
            appcan.button(dom, "btn-act", function() {
                if (that.mybtns[index].disabled) {
                    return;
                }
                that.$emit('click'+(index+1));
            });
        }
    },    
    mounted : function(){
        var that = this;
        $('.js_btn').each(function(){
            this.dispatchEvent(new Event('click'));
        });
    }
});

