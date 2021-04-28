    // <header-local 
    //     :localcount="localCount"
    //     @clickplus="clickPlus"
    //     @clicklocal="clickLocal"
    //     title="维修维护">                
    // </header-local>


Vue.component('header-local', {
    props: ['title', 'ishidelocal', 'ishideplus', 'localcount'], //header名字
    template: [

        '<div class="uh bc-text-head ub bc-head">',
        '<div class="nav-btn nav-bt nav-left">',
        '<div class="fa fa-angle-left fa-2x"></div>',
        '</div>',
        '<h1 class="ut ub-f1 ulev-3 ut-s tx-c" ><span class="ulev30">{{title}}</span></h1>',
        '<div class="nav-btn ">',
        '<div class=" nav-bt nav-new" v-bind:class="{uhide:ishideplus}" :style="style.iconAdd">',
        '<div class="umw2 umh4"></div>',
        '</div>',
        '<div class=" nav-bt nav-local" v-bind:class="{uhide:ishidelocal}"  >',
        '<div :style="style.local" >',
        '<span class="ulev30">本地</span>',
        '<div :style="style.localdiv" v-bind:class="{uhide:!localcount}">{{localcount}}</div>',
        '</div>',
        '</div>',
        '</div>',
        '</div>',
    ].join(''),
    data: function() {
        return {
            style: {
                iconAdd: {
                    background: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAtCAYAAAA6GuKaAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjhCRDVFRTM0QTI2MzExRTY5M0YwQjVERDI2QUYwMTYzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjhCRDVFRTM1QTI2MzExRTY5M0YwQjVERDI2QUYwMTYzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OEJENUVFMzJBMjYzMTFFNjkzRjBCNUREMjZBRjAxNjMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OEJENUVFMzNBMjYzMTFFNjkzRjBCNUREMjZBRjAxNjMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6LbQz4AAAAlklEQVR42uzXQQqAIBCFYe0WdSPPUVdPvYXNhIFEu8bFwD/wxNXwLUR4obUWJiRJck+y3h/1mDBZsvZ7kWyWy2eh30uj5fIlOBzQoEGDBg0aNGjQoEH/Q6dej5phvpqMRdSZtG6Nfc7DFI/PIyr6kFQn4FOy08b58kCDBg0aNGjQoEGDBu0KXYZ79YJ+yvJdRK2XXwIMALkjyTf8LnYzAAAAAElFTkSuQmCC") no-repeat center center',
                    backgroundSize: ' 1.4em'
                },
                local: {
                    margin: '0 .9375em',
                    width: '2.9em',
                    textAlign: 'center',
                    color: 'white',
                    border: '1px solid #9fd3fb',
                    height: '1.65em',
                    'line-height': '1.65em',
                },
                localdiv: {
                    position: 'absolute',
                    height: '1.6em',
                    'line-height': '1.6em',
                    'font-size': '.6em',
                    padding: '0 .6em',
                    'background-color': '#ff625b',
                    'border-radius': '.8em',
                    top: '0',
                    right: '0',
                    transform: 'translate(50%, -50%)',
                    '-webkit-transform': 'translate(50%, -50%);'
                }
            }
        };
    },
    mounted : function(){
        var that = this;
        appcan.button(".nav-left", "btn-act", function() {
            appcan.window.close(-1);
        });
        appcan.button(".nav-local", "btn-act", function() {
            that.$emit('clicklocal');
        });
        appcan.button(".nav-new", "btn-act", function() {
            that.$emit('clickplus');
        });                
    }
});
