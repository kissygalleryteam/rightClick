## 综述

RightClick是。

* 版本：1.0
* 作者：骏隆
* demo：[http://gallery.kissyui.com/rightClick/1.0/demo/index.html](http://gallery.kissyui.com/rightClick/1.0/demo/index.html)

##功能
* 实现右键点击，弹出右键菜单，自定义菜单项
* 为Node添加.rightClick()函数，支持S.one('#demo').rightClick(fn)
* 右键菜单根据容器边框自适应定位（包含在容器内）
* 支持添加右键菜单插件
* 更多演示请看DEMO

##快速使用

```javascript		
    S.use('gallery/rightClick/1.0/index', function(S, RightClick) {
        new RightClick({
            container: '#demo',
            plugins: {
                del: {
                    desc: '删除',
                    fn: function() {
                        alert('del');
                    }
                },
                add:{
                    desc:'添加',
                    fn:null
                }
            }
        });
    })
```
	
	

## API说明


