
    //<num-tip :now="now" :total="total" :isfooter="true"></num-tip>

Vue.component('num-tip', {
    props: {
        now: Number,
        total: Number,
        isfooter: Boolean,
    },
    template: [
        '<div v-if="now" class="" :style="[style.wrapper,btmstyle]">',
        '<div :style="style.now">',
        '<span class="ulev26">{{now}}</span>',
        '</div>',
        '<div style="height:1.4em;"><span class="ulev26">{{total}}</span></div>',
        '</div>'
    ].join(''),
    data: function() {
        return {
            style: {
                wrapper: {
                    'position': 'fixed',
                    'right': '1.1em',
                    'height': '2.8em',
                    'width': '2.8em',
                    'border-radius': '50%',
                    'background': 'rgba(11,11,11,0.4)',
                    'color': 'white',
                    'text-align': 'center',
                    'line-height': '1em',
                },
                now: {
                    'line-height': '1.4em',
                    'height': '1.4em',
                    'box-sizing': 'border-box',
                    'border-bottom': '1px solid white',
                    'margin': '0 .4em',
                }

            }
        };
    },
    computed: {
        btmstyle: function() {
            var btm = this.isfooter ? 0.2 : 3.2;
            return {
                'bottom': btm + 'em'
            };
        }
    }
})
