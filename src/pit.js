/**
 * Created by zhangcl07 on 2017/2/24.
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
        this.transformData.call(this, opt);
        // 初始化此坑
        this.init();
    }
    // Define methods
    Pit.prototype = {
        constructor: Pit,
        /**
         * Pit初始化
         */
        init: function(){
            var self = this;
            // 生成dom
            var pitDom = $p(this.el);
            this.$el = pitDom[0];
            var models = $p(this.el+" [p-model]"),
                inText = $p(this.el+" [p-text]");
            // console.log(models,inText);
            // 给所有p-model赋值
            models.forEach(function(c){
                c.value = self[c.getAttribute('p-model')]
            });
            inText.forEach(function(c){
                self.pText(c)
            });

            models.on("keypress",function(e){
                // console.log(this);
                self[this.getAttribute('p-model')] = this.value;
            })
        },
        /**
         * 改造数据，将options的属性添加到构造函数上
         * @param options
         * @returns {Pit}
         */
        transformData: function(options){
            var newObj = {};
            for (var key in options) {
                if (isPlainObject(options[key]) || isArray(options[key])) {
                    extend(newObj, options[key], false)
                }
                else if (options[key] !== undefined) this[key] = options[key]
            }
            return this.deepSetter(this, newObj);
        },
        deepSetter: function(target, source){
            var self = this;
            // console.log(this);
            for (var key in source) {
                if (isPlainObject(source[key]) || isArray(source[key])) {
                    if (isPlainObject(source[key]) && !isPlainObject(target[key]))
                        target[key] = {};
                    if (isArray(source[key]) && !isArray(target[key]))
                        target[key] = [];
                    this.deepSetter(target[key], source[key])
                }
                else if (source[key] !== undefined) {
                    (function(key){
                        var _value = source[key];
                        // console.log(source.constructor().name)
                        Object.defineProperty(target, key, {
                            get: function(){
                                return _value
                            },
                            set: function(v){
                                _value = v;
                                // 渲染view层 todo key并不是想要的friend.name
                                self.render(key, v)
                            }
                        })
                    })(key);

                }
            }
            return target
        },
        /**
         * p-text方法
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
            // 清空再append文档碎片
            c.innerHTML = "";
            c.appendChild(oFragmeng);
        },
        render: function(name,value){
            var self = this;
            $p(this.$el, "[p-text="+name+"]").forEach(function(c){
                self.pText(c)
            });
            $p(this.$el, "[p-model="+name+"]").forEach(function(c){
                c.value = value
            })
        }
    };
    function isPlainObject(obj) {
        return Object.prototype.toString.call( obj ) === "[object Object]";
    }
    function isArray(obj){
        return Array.isArray(obj);
    }
    /**
     * object合并函数 copy form zepto
     * @param target 合并目标项
     * @param source 要合并项
     * @param deep 默认true
     */
    function extend(target, source, deep) {
        if(typeof deep != 'boolean')deep = true;
        for (var key in source) {
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key]))
                    target[key] = {};
                if (isArray(source[key]) && !isArray(target[key]))
                    target[key] = [];
                extend(target[key], source[key], deep)
            }
            else if (source[key] !== undefined) target[key] = source[key]
        }

        return target
    }

    /**
     * 简单的dom选择器
     * @param selector
     * @returns {NodeList}
     */
    function $p(selector, child){
        if(typeof child === "undefined"){
            return document.querySelectorAll(selector)
        }else{
            return selector.querySelectorAll(child)
        }
    }

    //绑定事件
    Element.prototype.on = Element.prototype.addEventListener;
    Element.prototype.off = Element.prototype.removeEventListener;
    NodeList.prototype.on = function (event, fn) {
        // event.trim();
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
    NodeList.prototype.find = function(selector){
        return this.querySelectorAll(selector)
    };

    root.Pit = Pit;
})(this, document);