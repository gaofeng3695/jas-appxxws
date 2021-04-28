Vue.component('item-rate', {
    props: {

        name: {
            default: '满意度'
        },
        rate: {
            type: [Number, String],
            default: 0,
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
        '<span v-if="nRate !== 0">',
        '<img :style="style.rate" v-for="n in nRate" :src="lightStar">',
        '<img :style="style.rate" v-for="n in (5-nRate)" :src="whiteStar">',
        '</span>',
        '<span class="clr666" style="margin-left:0.4875em;"><span class="ulev28">{{tip}}</span></span>',
        '</div>',

        '</div>'
    ].join(''),
    data: function() {
        return {
            style: {
                rate: {
                    'height': '1.096em',
                    'margin-right': '0.325em',
                    'vertical-align': 'top',
                },
                imgStyle: {
                    'padding-right': '3em',
                    'box-sizing': 'border-box',
                    'width': '100%',
                    'display': 'inline-block',
                    'height': '6em',
                    'text-align': 'center',
                    'line-height': '6em',
                }
            },
            whiteStar: 'data:image/png;base64,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',
            lightStar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGkAAABkCAYAAACFHB7kAAASw0lEQVR4nO2de5BkVX3HP79zbz+np2fZx8wsICIusNzdNUKbLCCwC0Yl5QNNKEqNmhRVicSk8oeSiEghlZRKKimt/CEaU2Uskxh8oURQYyxN1FgVy1sxljYoBIOwsK/Z2Z5X9/S99/zyx7m908Oywzz69kxP+Fbdmju7M/f8zv3095zf+d3HwCaThsE96x3D81pCGgbXaxiohsH16x1LL2XWO4Ae6y4tNAHuWuc4eqpNA0nD4FX47f129AnItfdvJjdtGkjA7bZ6AihihydgE7lpU0DSMDiI3z6glQhbvBOtxOC392sYXLvesfVCmwIScJetnkDNQWAr6r0C5yrev65R9UgDD0nD4CBefEDLbdS7DtSi3rVoOQI/OqBhcHC9Y1yrBh4ScJutTqD+NSBlQIEi6l+NHT4Bm2BuGmhIGgaX48Wv1tI8al4Bqkh8P6ii5hVoaR68+ICGwVXrHetaNNCQgLvs8ATqXwWUIPkJkvwLJD8GSqmbJgDuWN8w16aBhbTgoiZqrgG1mORzAJjkC25uMgc7bnq1hsHl6xvx6jWwkIA7bGUS9a8AGQZbB51wU5JOuO+ljPqXYyuDvW4aSEgaBpfixa/R8ixqrgNVTHLfop8xyefTuelatNzsuGn/OoW8Jg0kJOD9dmgS9S4HhsA+CnosdVFnOwHJw8AQ6l2OHZoEeO86xrxqDRwkDYNLMfENWp5BzdVAOhctAuQ2Y+8DLGoOoOU5MPENGgaXrmf8q9HAQQLutEMnUVMDqmD/x7no2aTH3P9TQb2XYSuTMIBViIGCpGEQYJLURQddRhff96wuOuWm+Isu05Or0dIMmGTg3DRQkIA77dCkqHcpSBX0CUSPIsoS2zHQx0CqqHfZQM5NAwMpddFNlKZRcesiL/7isn7Xi+9P3XQNODfdqGEQZBxyzzQwkIA7tXxS1NuHm4ueBD285FC3sB1xP08V9V6KlicFuHN9urFyDQQkDYMLEXuTlqaxpC56xrroueQl94FaLFd25qabBsVNAwEJeJ9z0R6QLcBR545luYgFN+khkC2otwctNYQBqelteEgaBrsQ+1YtT2HlqjSj+xKorHjzEjc3WbkKLU+B2Js0DHatdx+fSxseEnCHlk56KheDbgE9iuhTqzuSHgE9CroFlQAtn/QYADdtaEgaBhcg9q1amsKal+OqC/evcJhbvJnkfsBizRVoqQFi37rR3bShIQF/qsWGp+ZC0K2gE4g+vaYDij6duuksVC5CS40N76YNC0nD4DzE3qzlBlauTK8XPbAmFy246YF0brqy46a3aBic1/9eLk8bFhJwuxYbOTUvRtiKMInYJ3sCSezT7nhsRc0utNjIAbf3vYfL1IaE5FykN2uxgbI/ddGDPW3DJA+6KgSn5qabN6qbNiQk4FYtTOXUnA+6HfRkWmGgd5t9EnQynZvOR4tTG9ZNGw6ShsFORH9Pi5Oo7MdldN/oLaBTc9PXAIvKfrRwEkRv1jA4u5/9XY42FCQNgxxwhxamigsumgb9ZUYNHkqPvx0156OFqRzwvjSODSPpd4MaBh5wHnBRuu3q2n8hJvbs8JNY7zeBMYz9UnaQAOQ8rHkjcByTfB4zfQ7YXAI8DjwC/Ax4tGv/l1KrJ9kF9CwhZnFQDQMBzsUBuBi4sGv/AkycUxOBF0H69dT3lFDOR7kWmMUkn8SNT1lJsN7NwBDCvyH8AmhCkkNsDpIcpF/F5sD6EfAYi+H9PP36pNTqPQ92TZA0DMZxAC7EOaED4yIkKS46+SZCvbaDIgVgC8oIMPKM/YWRxtivgD6+lhCXJ3kB1tzQ9Q8R0EBoACcX7+s82ByS5BfDS3KgXgsHq7N14D0itfrhVYf3XD+gYbCN00G4TeywO/mpI7r3xQdGULYA1a79ESC/RIsRok8jHEbsD8nWRR0Jal6GMo7KTro/KKerzWKAU0gKEo1TgKn7uvfVzNAFjcUAJ5aODtAwqHJmEFsx3Y6I0/02iAdUF1ygXfsUl2g2QTgMegRhAjiJMOs+pdglT2d/ZEAKKGWcy7eDjKGMAf4Sv9fCAZwCabAAcwo0gSTfGTK7hs8cqDnBmR04JRoGnwbetmg46oYi4FxQxTliS9d+eYmALXAM0cMIx91ah1lE54G+zrs9lodKARhy16bYjso4sIOlk+U5nOumWHDgFA6gLobWPZzC34uGQR74gvrN1+nQYWALqpfgwAwDlSUatsBkCuIYzvIzCC33yfn/JvFQiiBDuA/zjhTgWSwNcAZhGmgg8jAwicyOI3HpK8CNneEuBTX3Oi0fR/l1VHd2HWQS0SOIHHerdDog4mw6uxklvgNIBeQsVLejMoYDmP6IPI3wTWRuOxKXHaBavX0qcUhBfUr95pu1fBzV61DGgRjP3pvOF8+rp5ICiXkT4LtESb6VAirdC/yO1OpteEZ2ly40P61+8y0O1NWongu08OwXnwfVS0mBxPwWUETkECLf6QD6DPD27gXzaSl4Curv8ObfZktHUa5C9RyghadfBm31ryObVVIgkTdyChDfwzRHISn8A/C7z6xoPOs6Ka0Y3IM3f4stHUX1itRREUa/jGgz+45sUqmUsPIGIJc66PsdQB8H3vlsFYszLmZPB/WrqL4QB+r+50GtQg7QDThAjyPyA0xzbElA8BwVhxTUX2La77alI6i+rAvUg4jO9L4nm1QqQ1h5LQuAfugA2fyHgVuXqvktq3anYXA3pv0eB+qlqH0RYDH6wPOgliGVSgrIIOZ/EfmvDqC/kFr9tuf6/WUXWDUMPoCJbrfFp1H9FVQvwIH6KqLTa+nDppYD9BrAIPIYIv+Nae0Em7tbavVlPd2xoiq4hsFtmOhDDtQ+1F4AKEa/gWhjNX3Y1FIZwcorcQ76BSI/7gB6r9Tqdy/3OCu+VLEA6jBqL0btRYBi+FfEZgBK6E8hvMdSM4LllYAg5hHEPIxpja8YEKzyepKGwR8j8V9r8TBWL0LtLhyobyN2cmUHE0m37v0zhGUV1IK1GxucbCGR63CAHsXIz5HWOKj/LqnVP7Liw602Dg2DP0Die7R4GGtfnDoKDP+O2CUuj4iAkcVfVyNrIbaugryBpGYblgMAiHkEYx7tAHqn1OofW80x13pl9hYk+ajmjxjlBdhkNwCG7yB6oqsVAWPWBuVMshbijVFxV9nqnp8CjPcwwhNIe3RNgKAH9zhoGPw2knx6AdTFLkh+gJij2YA5LQhF4sQNh+skNaMkXAGA8X6WAhqzqPd2qdX/cS3H7snZWwxqHBu7B+jEPIHxf9qLJpYliRM3BPZZDpB72YrxHnKXHHoECHp4t5CGwY1gP6P5IzlltAvUoRRUnz7liXWw+iSVURJ+DQDj1xGOIu2xCMzbpFb/bC/a6Ok4pGHwerBf0PyRnOp2bHwJLsM5jMn9hL6BsopEcebNWXM2Vl8KKMZ/GJFjHUA3Sq3+z71qp+eTRQrqc5o7VlC2dIE6gvHr9A2UKhIlLrHIQNacjeUlOEAPuac0otGeA4Lsbo68DvQBzR0tKSPYqAPqOCb3U/p6R1Bn+OtVqi6ClXOxGgCKyT2E0ECi0SbI66VW/2ZvGupqstcH7OgUKP9oSalgoz04UBP9BwWrh5Wu59QIGB8b70XtNhygOsI0Eo82QV4rtfq3sgg909xYw+BqB+pYVSljowAH6gQmV2dd7rFTBWsRq+nIq4CcOhPaXfUQ6TpDBhtd8gxAc0i8YwrkDVKrfzurkDO/Yd+9CFC/4UCVsO3dgEH8Qxj/F1k33zPZ+EVofA6gmPxDCM0OoFdJrf6fWbad+aMvrgPyKol3zAoziDnhJnVtZ/LMUVab6LyL20ykQ9yO2X4Agj49n5SCmgGL2hKgYOb60XTvZOYARW3n3eMy2w9A0CdIGgZbQcdAweZBLcIcq3mryXptQhNXgc/jINlRDYMd/Th//XrSbx8SobboJm6NQNp9arpHkjYQgVrXD4kA9vSj6X5B2ou0wZbcuC4DNtSlcu5X1w8HaV8/2l3qOY5eao8SobaKm4+afSs89FRmDuwQaouomUI2nZOIwBbcfDSoTpLOvFTEPQ3I3n602y8n7YUITdI5iQF1Ek1QRZMC/YSUuZM0DM4BexYoqA9YxAzm/eQubuv6oQB2RMPg3Kzb7cdwF0BXZkcEMqDPNUmMy/AU1UInQ83cTf0Y7tx8lKTzkWm5tceASqSJ2iFIiuDFAAHw9Szb7IeT9qm4pEFQxAz2jf5iWki6KFeXhr8k6zb74aQ9aASJqzQg8wOaNKSSlutHksc9rJ19Gp6pk9KnMva4zM5P0+/BflpQZN5VHZIcaYYXaBhkeh6zHu5eCMmQq395uIXsYEPCtHGZqknn1qQMnJ9pk1keHHiJSxryC5kdNrtLCkkBbe1Ik5SM2sByKsNL8mmfsi0PZQ0pTb9zaWaXkYtsDm2OYmfPRtsV97U52nlZRc/lMlSbHj/7RW3WicM+1RjiQlfS0MP02/pou4pGnReCWDcc2TwaldCohORmkXwDTA/XZtIGLUKcQ3MtRMj0zylkDWkPGrl1BepeidMLqXFw2hU6z8aI33IwvBgSH22PoHERjcoOVn4GyU+B9OC+ChMBilof0Rgk2+EuM0gaBj6w281JvrtEsVZIatB2BW0PLzjSm0cKDcRPEKmClEHmwJuE2EPnRyDJo/MVtD2E5KeR/MyaYIlpo6quX264261h4EutnkkpJcs5aRfEBbHGzbVqEYme4w9SnWkTmK9gp0fRVsXdoSptTOk4XnkCkysjZnwKKd8F7ETKd4oZb5hc2f1/6bhLna2iLXcc5iuIyuriMXE6J4FYA8Q53NvNMlGWw90eNEYTDzdXJK6HK5S2y9j5oTSFB0yEKcwguXkwwyDbWiAfBe6WWv14+mt/rmHwMWToPXjlPxIzWxR/Ao0K2PkKWA/bqsB82R0rv9JLJ+nQbT008REvAvH3APUVd3AZytJJ+1ylIR3qJFpRqqvtIsn0dmxzGKwBEkyhgTc0geRz4I0nyPAnQHZJrX5rFyAApFY/LrX6n4C8GKn8Dd7ORPI5vKHjmEIDSMAKtjlMMr0dbRdXFJ/rj0LiudsBMqw8ZAnJJQ0ppOUmDRrnsTNbsXNVSAxgMYVpvMoEUvTAH1dM9V4wu6VWf4fU6oeWOp7U6k9JrX4LyG5M9Z/wd6oUfbzKBKYwDSSQGOxcFTuzFY0Ly+ud6ayVfNK3lWVWw8vWSUSnTrR4S8+pGuewMyPY2SqaGJAEKczgDR9HSgK5MTBbHgRzmdTqb5Za/dGVBCO1+qNSq78FzKWYkQfIjSElwRueQAozIAmaGOzsMHZmBI2XXmO5/ti0f648tJJ4VhR7FgdNX8s2R/SUl0yNgAqmMoV4pz83pImHtkqLTork5zHFFngFMFUQ/7vAe6VW/48exngl8EE0PoCdgqSFnS+h8wtOEj9Cis0zxm1nqiCKV21A7mwLDEmt3vMrmlklDpegsYeV9HZvPb2j1mCbJTTqwFEk307h5MHbDpL7EXC71Opf63WAUqt/HzioYXA93tYPYqJLjZmCfAPbKqLtPBr5aDSM5CJMqQlmIW0XL735XwEroLFB/N3Aj3oda1bD3V40QmPjUlUTd9XXDHa2RNKooG3PpeZ+G68yhSnHkN8K/rZHkNybgMuyANQtqdW/DtSQ3E34235GfhumHONVphA/rXi3PZJGBTtbcsNbJ3lIU3HXz+xqeFk5Kb2GZABFTAIq2FYebefTQqW6BWhpHvENeGeBKT4B/BnwqawWhs+m9OVLn9cw+BKSfzu5HXfhtV5g/Ck0bqPNPBr7aNsnaftIoY0ptt2yIpEUXASUMsnwsoK0FxujiTgnJZA0yqeqyOJZpNRGcgL+CJjSBPAB4ONSq6/bpdv0g/FJDYPPYIq3YIp3iNfcJt4UGqWwEoO2fJJ53w1/atFEEBuDl00anlXi8BjtIy+yDd9lap3GPIuUIiQPeMPgDU0DHwb+Smr1Dfe6Lw2DCvBu4F0ks1WSabQN2syd1i8zEkN+7HGp1c/vdRxZPDNbAZ1m/imSyfQF7kYxpRgpaAdOC+Qe4EPPXIRuRGkYbAduA/1DktkiyTQ6L9im75IGwDurBYWzARnu9Qcui8ThEmwMsQGxmFKEV42Q0hDkxxO8yt+CXCi1+rsHARCcql7cCrILr/IJ8uOJlIbwqhGmFLlibWzAxpDBtaUsIO1DY/AUbyRGhkpQGFP84c+C7JZa/felVn8yg3Yzl9Tqh6RWfwfIbvzheymMqQyV8UZcf9PKQ88XtVlA2ouNwZShMAr+yFcRU5Na/U0rrRJsVKXVizcj5jL86oMURsErd5zU8/JQFtndHnLDAN/FLUS/l0EbG0JSq/8IeK2GwcvJbfkgcA19etJiTdIweEDD4DfWO471kIbB9RoGvf0znsD/AYfTKv1VhD+fAAAAAElFTkSuQmCC',
        };
    },
    computed: {
        nRate: function() {
            return +this.rate || 0;
        },
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
        },
        tip: function() {
            var aRate = ['无', '非常不满', '不满意', '一般', '满意', '非常满意'];
            return aRate[this.rate];
        }
    },
    methods: {

    },
});
