/*
combined files : 

kg/rightClick/2.0.0/index

*/
/**
 * @fileoverview
 * @author 骏隆<junlong.hjl@alibaba-inc.com>
 * @module rightClick
 **/
KISSY.add('kg/rightClick/2.0.0/index',function(S, Node, Base, Event, Juicer) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     *
     * @class RightClick
     * @constructor
     * @extends Base
     */

    function RightClick(comConfig) {
        var self = this;
        //调用父类构造函数
        RightClick.superclass.constructor.call(self, comConfig);
    }
    Node.prototype.rightClick = Node.rightClick || function(settings, obj) {

        var callbackFunc = S.isFunction(settings) ? settings : ((settings && settings.callback) || function() {});

        var settings = S.merge({
            stopContextmenu: true,
            preventDefault: false,
            stopPropagation: false,
            callback: callbackFunc
        }, settings);

        $(this).each(function(item) {
            var $$ = $(item);
            //阻止系统的默认右键菜单
            if (settings.stopContextmenu) {
                $$.on('contextmenu', function(e) {
                    return false;
                })
            }
            $$.on('mouseup', function(e) {
                var currNode = e;
                if (e.which ? e.which == 3 : e.button == 2) {
                    if (settings.preventDefault)
                        event.preventDefault();

                    if (settings.stopPropagation)
                        event.stopPropagation();

                    // if returning false, then we automate the preventDefault and stopPropagation events
                    if (settings.callback.apply(obj || this, [event]) === false) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            })
        });

    }
    S.extend(RightClick, Base, /** @lends RightClick.prototype*/ {
        _plugins: [],
        RIGHTMENU_TPL: '<div class="rightMenu" style="display:none;position: absolute; float: left;">\
                          <ul>\
                          {@each items as item}\
                            <li class="rm_sub rm_${item.key}" data-action="${item.key}">$${item.desc}\
                            </li>\
                          {@/each}\
                          </ul>\
                        </div>',
        initializer: function() {
            var self = this;
            self._initPlugin();
            self._initContextMenu();
            $(this.get('node')).rightClick(self.showContextMenu, self);
            self._initEvent();
        },
        //缓存插件
        _initPlugin: function() {
            var self = this,
                plugins = this.get('plugins');
            if (plugins) {
                var keys = [];
                self._plugins = []; //清空缓存数组
                S.each(plugins, function(val, key) {
                    if (val.desc && key && S.indexOf(key, keys) == -1) {
                        keys.push(key);
                        self._plugins.push({
                            key: key,
                            desc: val.desc,
                            fn: val.fn || function() {}
                        });
                    } else {
                        S.log('插件key描述不能为空,或者已经存在');
                    }
                });
                keys = null;
            }
        },
        //初始化右键菜单内容
        _initContextMenu: function() {
            if (this._plugins && this._plugins.length) {
                var menuHtml = Juicer(this.RIGHTMENU_TPL, {
                    items: this._plugins
                });
                if (this._contextMentContainer) {
                    this._contextMentContainer.remove();
                }
                this._contextMentContainer = $(menuHtml);
                //绑定菜单点击事件
                this._contextMentContainer.detach('click');
                this._contextMentContainer.on('click', function(e) {
                    var curNode = $(e.target),
                        plugins = this.get('plugins');
                    var actionKey = curNode.attr('data-action') || $(S.DOM.parent(curNode, 'li[data-action]')).attr('data-action');
                    return plugins[actionKey].fn && plugins[actionKey].fn($(this.get('node')), e);
                }, this);
                $('body').append(this._contextMentContainer);
            }

        },
        /*初始化事件*/
        _initEvent: function() {
            //插件变化监听事件
            this.on('afterPluginsChange', function(e) {
                this._initPlugin();
                this._initContextMenu();
            }, this);
            /*//注册右键菜单事件
            this._contextMentContainer && this._contextMentContainer.on('click', function(e) {
                var curNode = $(e.target),
                    plugins = this.get('plugins');
                var actionKey = curNode.attr('data-action') || $(S.DOM.parent(curNode, 'li[data-action]')).attr('data-action');
                return plugins[actionKey].fn && plugins[actionKey].fn($(this.get('node')), e);
                //alert(curNode.attr('data-action'));
            }, this)*/
            //页面点击时隐藏右键菜单
            $(window).on('click', function(e) {
                this.hideContextMenu();
            }, this)
        },
        /*
         * 定位右键菜单位置
         */
        _positionRightMenu: function(e) {
            var curNode = $(this.get('node')),
                container = S.one(this.get('container')),
                left, top;
            var mouseX = e.pageX,
                mouseY = e.pageY,
                offsetX = this.get('offset').x,
                offsetY = this.get('offset').y;
            container = container || $('body');

            //容器太小时，以body为容器
            if(this._contextMentContainer.width()>container.width()||this._contextMentContainer.height()>container.height()) {
                container=$('body');
            }

            var bottomedge = container.offset().top + container.height() - mouseY;
            var rightedge = container.offset().left + container.width() - mouseX;
            if (bottomedge < this._contextMentContainer.height() + offsetY) {
                top = mouseY - offsetY - this._contextMentContainer.height();
            } else {
                top = mouseY + offsetY;
            }
            if (rightedge < this._contextMentContainer.width() + offsetX) {
                left = mouseX - offsetX * 2 - this._contextMentContainer.width();
            } else {
                left = mouseX + offsetX;
            }
            S.DOM.css(this._contextMentContainer, {
                'left': left,
                'top': top
            });

        },
        /*添加插件*/
        addPlugin: function(key, desc, fn) {
            var tempData = S.clone(this.get('plugins')) || {};
            tempData[key] = {
                desc: desc,
                fn: fn
            };
            this.set('plugins', tempData);
        },
        showContextMenu: function(e) {
            this._positionRightMenu(e);
            this._contextMentContainer.show();
        },
        hideContextMenu: function() {
            S.DOM.css(this._contextMentContainer, {
                'left': '0px',
                'top': '0px'
            });
            this._contextMentContainer.hide();
        }
    }, {
        ATTRS: /** @lends RightClick*/ {
            node: {
                value: ''
            },
            container: {
                value: ''
            },
            /**自定义插件属性,格式
             **{del:{
             *    desc:'删除元素',
             *    fn:function(){
             *       .....//your code
             *    }
             * },
             * ...
             * }
             */
            plugins: {
                value: {}
            },
            /**
             *  右键菜单与鼠标的偏移值，鼠标距右边框或下边框距离太小时，会自适应取负值
             *
             */
            offset: {
                value: {
                    x: 10,
                    y: 10
                }
            }
        }
    });
    return RightClick;
}, {
    requires: ['node', 'base', 'event', 'kg/juicer/1.3/index']
});

