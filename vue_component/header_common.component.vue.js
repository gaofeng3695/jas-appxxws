
    // <header-common
    //     title="新建维修"
    //     icon1="../src/images/add.png"
    //     icon2="../src/images/add.png"
    //     @click1 = "click1"
    //     @click2="click2"
    // ></header-common>



Vue.component('header-common',{
    props : ['title','icon1','icon2'],
    template : [
        '<div class="uh bc-text-head ub bc-head">',
            '<div class="nav-btn nav-left">',
                '<div class="fa fa-angle-left fa-2x"></div>',
            '</div>',
            '<h1 class="ut ub-f1 ulev-3 ut-s tx-c" tabindex="0"><span class="ulev30">{{title}}</span></h1>',
            '<div class="nav-btn ">',
                '<div v-show="icon1" class="click1">',
                    '<div class="umw2 umh4 " :style="style.bg01"></div>',
                '</div>',
                '<div v-show="icon2" class="click2">',
                    '<div class="umw2 umh4 " :style="style.bg02"></div>',
                '</div>',
            '</div>',
        '</div>',
    ].join(''),
    data : function(){
        return {
            style :{
                bg01 : {
                    background : 'url('+this.icon1+') no-repeat center center',
                    backgroundSize : '1.4em'
                },
                bg02 : {
                    background : 'url('+this.icon2+') no-repeat center center',
                    backgroundSize : '1.4em'
                }
            }
        }
    },
    computed : {

    },
    mounted : function(){
        var that = this;
        appcan.button(".nav-left", "btn-act", function() {
            appcan.window.close(-1);
            that.$emit('return');
        });
        if (this.icon1) {
            appcan.button(".click1", "btn-act", function() {
                that.$emit('click1');
            });
        }
        if (this.icon2) {
            appcan.button(".click2", "btn-act", function() {
                that.$emit('click2');
            });
        }

    }
});

Vue.component('header-common-font',{
    props : ['title','font1','font2','isnoreturn'],
    template : [
        '<div class="uh bc-text-head ub bc-head">',
            '<div class="nav-btn nav-left">',
                '<div class="fa fa-angle-left fa-2x"></div>',
            '</div>',
            '<h1 class="ut ub-f1 ulev-3 ut-s tx-c" tabindex="0"><span class="ulev30">{{title}}</span></h1>',
            '<div class="nav-btn ">',
                '<div class="fa fa-2x umw1-5 click1" :class="font1" v-show="font1"></div>',
                '<div class="fa fa-2x umw1-5 click2" :class="font2" v-show="font2"></div>',
            '</div>',
        '</div>',
    ].join(''),
    data : function(){
        return {

        }
    },
    computed : {

    },
    mounted : function(){
        var that = this;
        appcan.button(".nav-left", "btn-act", function() {
            if(that.isnoreturn) return;
            appcan.window.close(-1);
            that.$emit('return');
        });
        
        appcan.button(".click1", "btn-act", function() {
             that.$emit('click1');
        });
        
        appcan.button(".click2", "btn-act", function() {
            that.$emit('click2');
        });
   

    }
});