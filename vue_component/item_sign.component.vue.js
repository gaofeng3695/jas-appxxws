Vue.component('item-sign', {
    props: {

        name: {
            default: '用户签名'
        },
        src: {
            type: [Array],
        },
        bigsrc: {
            type: [Array],
        },
        borderbottom: {
            default: true
        }
    },
    template: [
        '<div class="ub" style="padding:.5em 0;margin: 0 .625em;line-height:1.4em;" :style="borderbtm">',
        '<div class="leftStyle ub ub-ac" style="padding-right:.625em;min-width:3.25em;overflow: hidden;">',
        '<span class="ulev26 clr666" :style="wordstyle">{{name}}</span>',
        '</div>',
        '<div class="ub-f1" style="border-left: 1px solid #ececec;word-break: break-all;overflow: auto;padding-left:.625em ;">',
        '<div v-show="src.length !== 0" >',
        '<div :style="style.imgStyle" ><img style="width: auto;height: 100%;" :src="src" @click="previewPic"></div>',
        '</div>',
        '</div>',
        '</div>'
    ].join(''),
    data: function() {
        return {
            style: {
                imgStyle: {
                    'padding-right': '3em',
                    'box-sizing': 'border-box',
                    'width': '100%',
                    'display': 'inline-block',
                    'height': '6em',
                    'text-align': 'center',
                    'line-height': '6em',
                }
            }
        };
    },
    computed: {
        wordstyle: function() {
            if (this.name.length === 3) {
                return {
                    'letter-spacing': '.5em',
                    'margin-right': '-.5em'
                };
            }
            if (this.name.length === 2) {
                return {
                    'letter-spacing': '2em',
                    'margin-right': '-2em'
                };
            }
            return {};
        },
        borderbtm: function() {
            if (this.borderbottom) {
                return {
                    'border-bottom': '1px solid #ececec'
                };
            }
            return {};
        }
    },
    methods: {
        previewPic: function(index) {
            this.bigsrc = this.bigsrc.length ? this.bigsrc : this.src;
            uexImage.openBrowser(JSON.stringify({
                displayActionButton: true,
                displayNavArrows: true,
                enableGrid: false,
                startOnGrid: false,
                startIndex: 0,
                data: this.bigsrc
            }));
        },
    },
});
