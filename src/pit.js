/**
 * Created by zhangcl07 on 2017/2/24.
 * 功能简单，自娱自乐，并没有根据状态来渲染。。。而且还在操作dom[笑哭]
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
            var models = $p(this.el, "[p-model]"),
                inText = $p(this.el, "[p-text]"),
                radioChecked = $p(this.el, "[p-model][type='radio']"),
                boxChecked = $p(this.el, "[p-model][type='checkbox']");
            console.log(radioChecked);
            // 给所有p-model赋值
            models.forEach(function(c){
                if(c.type === 'radio' || c.type === 'checkbox')return;
                c.value = self.deepGetter(c, 'p-model')
            });
            inText.forEach(function(c){
                self.pText(c)
            });

            models.on("input",function(e){
                viewChange(this);
            });
            models.on("keyup", function(e){
                // console.log(e.keyCode);
                /**
                 * 退格:8、Del:46
                 */
                if(e.keyCode === 8 || e.keyCode === 46){
                    viewChange(this);
                }
            });
            function viewChange(c){
                // console.log(c.value);
                var _model = c.getAttribute("p-model");
                eval('self.' + _model +' = c.value');
                self.render(_model, c.value)
            }
            radioChecked.forEach(function(c){
                c.checked = (function(c){
                    var exp = self.deepGetter(c, 'p-model');
                    // console.log(c.value, exp, c.value == exp);
                    return c.value == exp;
                })(c)
            });
            radioChecked.on("change",function(e){
                var _model = this.getAttribute("p-model");
                eval('self.' + _model +' = this.value');
            });

            boxChecked.forEach(function(c){
                c.checked = (function(c){
                    var exp = self.deepGetter(c, 'p-model');
                    return exp.indexOf(c.value)>=0;
                })(c)
            });
            boxChecked.on("change",function(e){
                var _model = this.getAttribute("p-model");
                var allChecked = self.deepGetter(this, "p-model");
                var _index = allChecked.indexOf(this.value);
                console.log(allChecked);
                if(this.checked && _index<0){
                    allChecked.push(this.value)
                }else if(!this.checked && _index>=0){
                    allChecked.splice(_index,1)
                }
                console.log(self.fruit);
            })
        },
        deepGetter: function(c, attr){
            return eval('this.' + c.getAttribute(attr));
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
                        Object.defineProperty(target, key, {
                            get: function(){
                                return _value
                            },
                            set: function(v){
                                _value = v;
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
            var _val = this.deepGetter(c, 'p-text');
            // 创建文档碎片
            var oFragmeng = document.createDocumentFragment(),
                op = document.createElement("span"),
                oText = document.createTextNode(_val);
            op.appendChild(oText);
            //先附加在文档碎片中
            oFragmeng.appendChild(op);
            // 清空再append文档碎片
            c.innerHTML = "";
            c.appendChild(oFragmeng);
        },
        render: function(name,value){
            var self = this;
            $p(this.el, "[p-text='"+name+"']").forEach(function(c){
                self.pText(c)
            });
            $p(this.el, "[p-model='"+name+"']").forEach(function(c){
                c.value = value
            })
        }
    };

    /**
     * 判断是否为真对象
     * @param obj
     * @returns {boolean}
     */
    function isPlainObject(obj) {
        return Object.prototype.toString.call( obj ) === "[object Object]";
    }
    /**
     * 判断是否为数组
     * @param obj
     * @returns {boolean}
     */
    function isArray(obj){
        return Array.isArray(obj);
    }
    /**
     * object合并函数
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
            return $p(selector)[0].querySelectorAll(child)
        }
    }

    // console.log(Object.prototype.toString.call(Event));
    //绑定事件
    Element.prototype.on = Element.prototype.addEventListener;
    Element.prototype.off = Element.prototype.removeEventListener;
    Element.prototype.trigger = function(event){
        var myEvent = new Event(event);
        this.dispatchEvent(myEvent);
    };
    NodeList.prototype.on = function (event, fn) {
        (typeof event === 'string') && event.trim();
        []['forEach'].call(this, function (el) {
            el.on(event, fn);
        });
        return this;
    };
    NodeList.prototype.trigger = function (event) {
        (typeof event === 'string') && event.trim();
        []['forEach'].call(this, function (el) {
            el['trigger'](event);
        });
        return this;
    };
    /**
     * NodeList添加forEach方法
     * @param fn
     * @returns {NodeList}
     */
    NodeList.prototype.forEach = function(fn){
        []['forEach'].call(this, fn);
        return this
    };
    /**
     * NodeList添加find方法
     * @param selector
     * @returns {NodeList}
     */
    NodeList.prototype.find = function(selector){
        return $p(this[0], selector);
    };

    root.Pit = Pit;

})(this, document);