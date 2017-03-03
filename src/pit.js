/**
 * Created by Administrator on 2017/2/24.
 */
;(function(root, document){
    /**
     * 构造函数
     * @param opt 默认参数见this.options
     * @returns {*}
     * @constructor
     */
    function Pit(opt){
        var self = this;
        // 将数据挂到this上，方便调用
        this.transformData.call(self, opt);
        // 初始化此坑
        this.init();
    }
    // Define methods
    Pit.prototype = {
        l: function(key){
            console.log(this[key]);
        },
        /**
         * 简单的dom选择器
         * @param selector 类似jquery
         * @returns {NodeList}
         */
        $: function(selector){
            return document.querySelectorAll(selector || this.el)
        },
        /**
         * Pit渲染
         */
        init: function(){
            var that = this;
            // 生成dom
            var pitDom = this.$(this.el);
            this.$el = pitDom[0];
            var models = this.$(this.el+" [p-model]"),
                inText = this.$(this.el+" [p-text]");
            // console.log(models,inText);
            // 给所有p-model赋值
            models.forEach(function(c){
                c.value = that[c.getAttribute('p-model')]
            });
            inText.forEach(function(c){
                that.pText(c)
            });

            models.on("keyup",function(e){
                // console.log(this);
                that[this.getAttribute('p-model')] = this.value;
            })
        },

        /**
         * object合并函数 copy form zepto
         * @param target 合并目标项
         * @param source 要合并项
         * @param deep 默认true
         */
        extend: function (target, source, deep) {
            if(typeof deep != 'boolean')deep = true;
            for (var key in source) {
                if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                    if (isPlainObject(source[key]) && !isPlainObject(target[key]))
                        target[key] = {};
                    if (isArray(source[key]) && !isArray(target[key]))
                        target[key] = [];
                    this.extend(target[key], source[key], deep)
                }
                else if (source[key] !== undefined) target[key] = source[key]
            }

            return target
        },
        /**
         * 改造数据，将options的属性添加到构造函数上
         * @param options
         * @returns {Pit}
         */
        transformData: function(options){
            var self = this;
            for(var key in options){
                // 如果是对象，递归下面的key挂到this上
                if(isPlainObject(options[key])){
                    for(var k in options[key]){
                        if(key === 'data'){
                            setTimeout((function(k){
                                var _value = options[key][k];
                                // console.log(_value);
                                Object.defineProperty(self, k, {
                                    get: function(){
                                        return _value
                                    },
                                    set: function(v){
                                        _value = v;
                                        // 渲染view层
                                        self.render(k, v)
                                    }
                                    // value: options[key][k]
                                })
                            })(k),0);
                        }else{
                            self[k] = options[key][k];
                        }

                    }
                }
                // 其他直接挂在到this上
                else{
                    self[key] = options[key]
                }
            }
            return self
        },
        /**
         * 在上面创建
         * @param c
         */
        pText: function(c){
            // 创建文档碎片
            var oFragmeng = document.createDocumentFragment(),
                op = document.createElement("span"),
                oText = document.createTextNode(this[c.getAttribute('p-text')]);
            op.appendChild(oText);
            //先附加在文档碎片中
            oFragmeng.appendChild(op);
            // 清空再append文档
            c.innerHTML = "";
            c.appendChild(oFragmeng);
        },
        render: function(name){
            var self = this;
            this.$el.querySelectorAll("[p-text="+name+"]").forEach(function(c){
                self.pText(c)
            })
        }
    };
    function isPlainObject(obj) {
        return Object.prototype.toString.call( obj ) === "[object Object]";
    }
    function isArray(obj){
        return Array.isArray(obj);
    }

    //绑定事件
    Element.prototype.on = Element.prototype.addEventListener;
    Element.prototype.off = Element.prototype.removeEventListener;
    NodeList.prototype.on = function (event, fn) {
        []['forEach'].call(this, function (el) {
            el.on(event, fn);
        });
        return this;
    };
    NodeList.prototype.trigger = function (event) {
        []['forEach'].call(this, function (el) {
            el['trigger'](event);
        });
        return this;
    };

    root.Pit = Pit;
})(this,document);