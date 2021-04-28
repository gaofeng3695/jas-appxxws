/**
*   new CodeTimer(sId,nSecond,cb1,cb2);
*   运行init方法，传参如下
*   1.必填，dom ID值，string
*   2.倒计时秒数，number
*   3.点击的回调函数，function

*   例如： 
*   var gf = new CodeTimer('#getCode',60,function(){
        console.log('倒计时开始');
    },function(){
        console.log('倒计时结束');
    });
    
**/

                /*var gf = new CodeTimer('#getCode',60,function(){
                    that.verifyTel(that.nameDom);
                    if (that.tip === '') {
                        console.log('倒计时开始');
                        gf.setTimer();
                                                
                    }                    
                },function(){
                    console.log('倒计时结束');
                });*/


function CodeTimer(sId,nSecond,cb1,cb2){
    this.init(sId,nSecond,cb1,cb2);
    //CodeBy GaoFeng 2016.10.27
} 
CodeTimer.prototype = {
    constructor : CodeTimer,
    init : function(sId,nSecond,cb1,cb2){
        this.dom = document.querySelector(sId);
        this.second = nSecond?parseInt(nSecond):60;                
        this.originalHtml = this.dom.innerHTML;
        this.cbWhen0s = function(){ //设定倒计时为0s时，执行的回调函数
            if(typeof cb2 === 'function'){
                cb2();  
            }
        }; 
        this.bindEvent(cb1);
        this.timer = null;
    },    
    render : function(s){
        this.dom.innerHTML = s;
    },
    bindEvent : function(cb){
        var that = this;
        this.dom.onclick = function(){
            
            if (that.dom.innerHTML === that.originalHtml) {
                if( typeof cb === 'function' ){
                    cb();  
                };                
                //that.setTimer();

            }
        }
    },
    setTimer : function(){
        var that = this;
        var count = this.second;
        clearInterval(this.timer);
        that.render(''+ count +' 秒');
        this.timer = setInterval(function(){
            count -= 1;
            that.render(''+ count +' 秒');
            if (count <= 0) {
                that.render(that.originalHtml);
                that.cbWhen0s();
                clearInterval(that.timer);
            }
        },1000);
    }            
} 

