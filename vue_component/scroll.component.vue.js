Vue.component('scroll', {
    props: {
        data: {
            type: Array,
            default: function () {
                return []
            }
        },
        probeType: {
            type: Number,
            default: 1
        },
        click: {
            type: Boolean,
            default: true
        },
        listenScroll: {
            type: Boolean,
            default: false
        },
        listenBeforeScroll: {
            type: Boolean,
            default: false
        },
        direction: {
            type: String,
            default: 'vertical'
        },
        scrollbar: {
            type: null,
            default: false
        },
        pullDownRefresh: {
            type: null,
            default: false
        },
        pullUpLoad: {
            type: null,
            default: false
        },
        startY: {
            type: Number,
            default: 0
        },
        refreshDelay: {
            type: Number,
            default: 20
        },
        freeScroll: {
            type: Boolean,
            default: false
        }
    },
    template: [
        '<div ref="wrapper" :style="styleObj.listWrapper">',

        '   <div class="asd123" :style="styleObj.scrollContent">',

        '       <div ref="listWrapper">',
        '           <slot>',
        '               <ul :style="styleObj.listContent">',
        '                   <li @click="clickItem($event,item)" :style="styleObj.listItem" v-for="item in data">{{item}}</li>',
        '               </ul>',
        '           </slot>',
        '       </div>',

        '       <slot  class="_pullup" name="pullup" :pullUpLoad="pullUpLoad" :isPullUpLoad="isPullUpLoad">',
        '           <div :style="styleObj.pullupWrapper" v-if="pullUpLoad">',
        '               <div :style="styleObj.beforeTrigger" v-if="!isPullUpLoad">',
        '                   <span>{{pullUpTxt}}</span>',
        '               </div>',
        '               <div :style="styleObj.afterTrigger" v-else>',
        '                   <loading></loading>',
        '               </div>',
        '           </div>',
        '       </slot>',

        '   </div>',

        '   <slot class="_pulldown" name="pulldown" :pullDownRefresh="pullDownRefresh" :pullDownStyle="pullDownStyle" :beforePullDown="beforePullDown" :isPullingDown="isPullingDown" :bubbleY="bubbleY">',
        '       <div ref="pulldown" :style="[styleObj.pulldownWrapper,styleObj.pullDownStyle]" v-if="pullDownRefresh">',
        '           <div :style="styleObj.beforeTrigger" v-if="beforePullDown">',
        '               <bubble :y="bubbleY"></bubble>',
        '           </div>',
        '           <div :style="styleObj.afterTrigger" v-else>',
        '               <div v-if="isPullingDown" class="loading">',
        '                   <loading></loading>',
        '               </div>',
        '               <div v-else><span>{{refreshTxt}}</span></div>',
        '           </div>',
        '       </div>',
        '   </slot> ',

        '</div>',
    ].join(''),
    data: function () {
        return {
            beforePullDown: true,
            isRebounding: false,
            isPullingDown: false,
            isPullUpLoad: false,
            pullUpDirty: true,
            pullDownStyle: '',
            bubbleY: 0,

            styleObj: {
                'listWrapper': {
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    overflow: 'hidden',
                    background: '#fff',
                },
                'scrollContent': {
                    position: 'relative',
                    'z-index': 1,
                },
                'listContent': {
                    position: 'relative',
                    'z-index': 10,
                    background: ' #fff',
                },
                'listItem': {
                    'height': '60px',
                    'line-height': '60px',
                    'font-size': '18px',
                    'padding-left': '20px',
                    'border-bottom': '1px solid #e5e5e5',
                },
                'pulldownWrapper': {
                    position: 'absolute',
                    width: '100%',
                    left: 0,
                    display: 'flex',
                    'justify-content': 'center',
                    'align-items': 'center',
                    transition: 'all'
                },
                'afterTrigger': {
                    'margin-top': '10px'
                },
                'pullupWrapper': {
                    width: '100%',
                    display: 'flex',
                    'justify-content': 'center',
                    'align-items': 'center',
                    padding: '16px 0'
                }
            },
        };
    },
    computed: {
        pullUpTxt: function () {
            var moreTxt = this.pullUpLoad && this.pullUpLoad.txt && this.pullUpLoad.txt.more || '加载更多'

            var noMoreTxt = this.pullUpLoad && this.pullUpLoad.txt && this.pullUpLoad.txt.noMore || '没有更多'

            return this.pullUpDirty ? moreTxt : noMoreTxt
        },
        refreshTxt: function () {
            return this.pullDownRefresh && this.pullDownRefresh.txt || '正在刷新'
        },
        bounce : function(){
            console.log(this.pullDownRefresh)
            console.log(this.pullUpLoad)
            return !!( this.pullDownRefresh ||  this.pullUpLoad);
        }

    },
    created: function () {
        this.pullDownInitTop = -50;
    },
    mounted: function () {
        var that = this;
        setTimeout(function () {
            that.initScroll();
        }, 20);
    },

    methods: {
        initScroll: function () {
            var that = this;
            if (!this.$refs.wrapper) {
                return;
            }
            if (this.$refs.listWrapper && (this.pullDownRefresh || this.pullUpLoad)) {
                this.$refs.listWrapper.style.minHeight = '100px'
            }

            var options = {
                probeType: this.probeType,
                click: this.click,
                scrollY: this.freeScroll || this.direction === 'vertical',
                scrollX: this.freeScroll || this.direction === 'horizontal',
                scrollbar: this.scrollbar,
                pullDownRefresh: this.pullDownRefresh,
                pullUpLoad: this.pullUpLoad,
                startY: this.startY,
                freeScroll: this.freeScroll,
                bounce :this.bounce
            }

            this.scroll = new BScroll(this.$refs.wrapper, options)

            if (this.listenScroll) {
                this.scroll.on('scroll', function (pos) {
                    that.$emit('scroll', pos)
                })
            }

            if (this.listenBeforeScroll) {
                this.scroll.on('beforeScrollStart', function () {
                    that.$emit('beforeScrollStart')
                })
            }

            if (this.pullDownRefresh) {
                this._initPullDownRefresh()
            }

            if (this.pullUpLoad) {
                this._initPullUpLoad()
            }
        },
        disable: function () {
            this.scroll && this.scroll.disable()
        },
        enable: function () {
            this.scroll && this.scroll.enable()
        },
        refresh: function () {
            this.scroll && this.scroll.refresh()
        },
        scrollTo: function () {
            this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
        },
        scrollToElement: function () {
            this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
        },
        clickItem: function (e, item) {
            console.log(e)
            this.$emit('click', item)
        },
        destroy: function () {
            this.scroll.destroy()
        },
        forceUpdate: function (dirty) {
            if (this.pullDownRefresh && this.isPullingDown) {
                this.isPullingDown = false;

                this._reboundPullDown(function () {
                    this._afterPullDown()
                });

            } else if (this.pullUpLoad && this.isPullUpLoad) {
                this.isPullUpLoad = false
                this.scroll.finishPullUp()
                this.pullUpDirty = dirty
                this.refresh()
            } else {
                this.refresh()
            }
        },
        _initPullDownRefresh: function () {
            var that = this;
            this.scroll.on('pullingDown', function () {
                that.beforePullDown = false
                that.isPullingDown = true
                that.$emit('pullingDown')
            });

            this.scroll.on('scroll', function (pos) {
                if (that.beforePullDown) {
                    that.bubbleY = Math.max(0, pos.y + that.pullDownInitTop)
                    that.pullDownStyle = 'top:' + Math.min(pos.y + that.pullDownInitTop, 10) + 'px'
                } else {
                    that.bubbleY = 0
                }
                if (that.isRebounding) {
                    that.pullDownStyle = 'top:' + (10 - (that.pullDownRefresh.stop - pos.y)) + 'px'
                }
            })
        },
        _initPullUpLoad: function () {
            var that = this;
            this.scroll.on('pullingUp', function () {
                that.isPullUpLoad = true
                that.$emit('pullingUp')
            });
        },
        _reboundPullDown: function (fn) {
            var that = this;
            //const {stopTime = 600} = this.pullDownRefresh
            setTimeout(function () {
                that.isRebounding = true;
                that.scroll.finishPullDown();
                fn && fn();
            }, 600);
        },
        _afterPullDown: function () {
            var that = this;
            setTimeout(function () {
                that.pullDownStyle = 'top:' + that.pullDownInitTop + 'px';
                that.beforePullDown = true;
                that.isRebounding = false;
                that.refresh();
            }, that.scroll.options.bounceTime)
        }
    },
    watch: {
        data: function () {
            var that = this;
            setTimeout(function () {
                that.forceUpdate(true)
            }, that.refreshDelay)
        }
    },


});


Vue.component('loading', {
    template: [
        '<div>',
        '   <img :src="imageSrc" :style="[styleObj]">',
        '</div>'
    ].join(''),
    data: function () {
        return {
            styleObj: {
                width: '1.6em',
                height: '1.6em',
                display: 'block',
                margin: '0 auto'
            },
            imageSrc: 'data:image/gif;base64,R0lGODlhZABkAKIEAN7e3rq6uv///5mZmQAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpBRjA4RUZDMDI3MjA2ODExODA4M0Y1OTQyMzVDRDM3MyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCMzE0Rjk3NDdDRTgxMUUzOUJCRjk0NjAxMUE1NzRBMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCMzE0Rjk3MzdDRTgxMUUzOUJCRjk0NjAxMUE1NzRBMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDVBMTZDQjczOTIwNjgxMTgwODNGNTk0MjM1Q0QzNzMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QUYwOEVGQzAyNzIwNjgxMTgwODNGNTk0MjM1Q0QzNzMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+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',
        };
    },
    computed: {},
    methods: {},
});


Vue.component('bubble', {
    props: {
        y: {
            type: Number,
            default: 0
        }
    },
    template: [
        '<div>',
        '   <div :style="style">',
        '       <canvas ref="bubble" :width="width" :height="height" :style="style"></canvas>',
        '   </div>',
        '</div>'
    ].join(''),
    data: function () {
        return {
            width: 50,
            height: 80
        };
    },
    watch: {
        y: function () {
            this._draw();
        }
    },
    computed: {
        distance: function () {
            return Math.max(0, Math.min(this.y * this.ratio, this.maxDistance))
        },
        style: function () {
            return {
                width: this.width / this.ratio + 'px',
                height: this.height / this.ratio + 'px',
                margin: '0 auto',
            }
        }
    },

    methods: {
        _draw: function () {
            var bubble = this.$refs.bubble;
            var ctx = bubble.getContext('2d')
            ctx.clearRect(0, 0, bubble.width, bubble.height)

            this._drawBubble(ctx)

            this._drawArrow(ctx)
        },
        _drawBubble: function (ctx) {
            ctx.save()
            ctx.beginPath()

            var rate = this.distance / this.maxDistance
            var headRadius = this.initRadius - (this.initRadius - this.minHeadRadius) * rate

            this.headCenter.y = this.initCenterY - (this.initRadius - this.minHeadRadius) * rate

            // 画上半弧线
            ctx.arc(this.headCenter.x, this.headCenter.y, headRadius, 0, Math.PI, true)

            // 画左侧贝塞尔
            var tailRadius = this.initRadius - (this.initRadius - this.minTailRadius) * rate
            var tailCenter = {
                x: this.headCenter.x,
                y: this.headCenter.y + this.distance
            }

            var tailPointL = {
                x: tailCenter.x - tailRadius,
                y: tailCenter.y
            }
            var controlPointL = {
                x: tailPointL.x,
                y: tailPointL.y - this.distance / 2
            }

            ctx.quadraticCurveTo(controlPointL.x, controlPointL.y, tailPointL.x, tailPointL.y)

            // 画下半弧线
            ctx.arc(tailCenter.x, tailCenter.y, tailRadius, Math.PI, 0, true)

            // 画右侧贝塞尔
            var headPointR = {
                x: this.headCenter.x + headRadius,
                y: this.headCenter.y
            }
            var controlPointR = {
                x: tailCenter.x + tailRadius,
                y: headPointR.y + this.distance / 2
            }
            ctx.quadraticCurveTo(controlPointR.x, controlPointR.y, headPointR.x, headPointR.y)

            ctx.fillStyle = 'rgb(170,170,170)'
            ctx.fill()
            ctx.strokeStyle = 'rgb(153,153,153)'
            ctx.stroke()
            ctx.restore()
        },
        _drawArrow: function (ctx) {
            ctx.save()
            ctx.beginPath()

            var rate = this.distance / this.maxDistance
            var arrowRadius = this.initArrowRadius - (this.initArrowRadius - this.minArrowRadius) * rate

            // 画内圆
            ctx.arc(this.headCenter.x, this.headCenter.y, arrowRadius - (this.arrowWidth - rate), -Math.PI / 2, 0, true)

            // 画外圆
            ctx.arc(this.headCenter.x, this.headCenter.y, arrowRadius, 0, Math.PI * 3 / 2, false)

            ctx.lineTo(this.headCenter.x, this.headCenter.y - arrowRadius - this.arrowWidth / 2 + rate)
            ctx.lineTo(this.headCenter.x + this.arrowWidth * 2 - rate * 2, this.headCenter.y - arrowRadius + this.arrowWidth / 2)

            ctx.lineTo(this.headCenter.x, this.headCenter.y - arrowRadius + this.arrowWidth * 3 / 2 - rate)

            ctx.fillStyle = 'rgb(255,255,255)'
            ctx.fill()
            ctx.strokeStyle = 'rgb(170,170,170)'
            ctx.stroke()
            ctx.restore()
        }


    },
    created: function () {
        this.ratio = window.devicePixelRatio;
        this.width *= this.ratio;
        this.height *= this.ratio;
        this.initRadius = 18 * this.ratio;
        this.minHeadRadius = 12 * this.ratio;
        this.minTailRadius = 5 * this.ratio;
        this.initArrowRadius = 10 * this.ratio;
        this.minArrowRadius = 6 * this.ratio;
        this.arrowWidth = 3 * this.ratio;
        this.maxDistance = 40 * this.ratio;
        this.initCenterX = 25 * this.ratio;
        this.initCenterY = 25 * this.ratio;
        this.headCenter = {
            x: this.initCenterX,
            y: this.initCenterY
        }
    },
    mounted: function () {
        this._draw();
    },

});