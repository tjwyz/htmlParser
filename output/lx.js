define('lx', ['require', 'exports', 'module'  ,"tjwyz" ], function(require, exports, module) {

    /* get render function */
    var _module1 = {
        exports: {}
    };
    (function(module, exports) {


        module.exports = {
            render: function() {
                with(this) {
    return _c('div', {
        directives: [{
            name: "show",
            rawName: "v-show",
            value: (show),
            expression: "show"
        }],
        staticClass: "c-atom-aftclk",
        on: {
            "click": function() {
                tjwyz = 111
            }
        }
    }, [_c('img', {
        staticClass: "c-atom-aftclk-title",
        attrs: {
            "text": title,
            "icon": "baidu"
        }
    }), _v(" "), _c('div', {
        staticClass: "c-scroll-wrapper"
    }, [_c('div', {
        staticClass: "c-scroll-touch"
    }, [_c('div', {
        staticClass: "c-gap-bottom-small"
    }, [_l((upList), function(rsitem, index) {
        return [_c('tjwyz', {
            staticClass: "c-scroll-item",
            attrs: {
                "url": rsitem.href,
                "text": rsitem.text,
                "type": "auto"
            }
        })]
    })], 2)])]), _v(" "), _c('div', {
        staticClass: "c-atom-aftclk-cover"
    })])
}
            },
            staticRenderFns: [
                            ]
        };


    })(_module1, _module1.exports);


    /* get script output data */
    var _module2 = {
        exports: {}
    };
    (function(module, exports) {
        'use strict';

        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        

    exports.default = {
        mounted: function () {
            this._init();
        },
        methods: {
            _init: function() {
                console.log("ls");
            },
            toggle: function (bool) {
                if (bool) {
                    this.show = this.upList && this.upList.length;
                }else {
                    this.show = 0;
                }
            },
            replace: function(data) {
                this.upList = data.upList;
                this.downList = data.downList;
            }
        }
    };
    })(_module2, _module2.exports);

    var obj = _module2.exports.default || _module2.exports;
    obj.render = obj.render || _module1.exports.render;
    obj.staticRenderFns = _module1.exports.staticRenderFns;


    /* get config */
    var _module3 = {
        exports: {}
    };
    (function(module, exports) {
        'use strict';

        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        module.exports = 

    {
        props: {
            upList: {
                type: Array
            },
            downList: {
                type: Array
            },
            title: {
                type: String,
                default: '大家还搜'
            },
            order: {
                type: Number,
                required: true
            }
        },
        components: {
            tjwyz:require('tjwyz')

        },
        data: function(){
            return{
                show: 0
            }
        }
    }


    })(_module3, _module3.exports);

    _module3.exports.data && (obj.data = _module3.exports.data);
    _module3.exports.props && (obj.props = _module3.exports.props);
    _module3.exports.components && (obj.components = _module3.exports.components);


    obj._scopeId = "vue-7c1e60b0-2cf7-11e8-91fa-c375603acd0f";

    module.exports = obj;
});