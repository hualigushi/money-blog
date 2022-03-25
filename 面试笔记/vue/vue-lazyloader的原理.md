![](https://img-blog.csdn.net/20170619211724922?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDAxNDY1OA==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

原理简述：

1. vue-lazyload是通过指令的方式实现的，定义的指令是v-lazy指令
2. 指令被bind时会创建一个listener，并将其添加到listener queue里面， 并且搜索target dom节点，为其注册dom事件(如scroll事件)
3. 上面的dom事件回调中，会遍历 listener queue里的listener，判断此listener绑定的dom是否处于页面中perload的位置，如果处于则加载异步加载当前图片的资源
4. 同时listener会在当前图片加载的过程的loading，loaded，error三种状态触发当前dom渲染的函数，分别渲染三种状态下dom的内容

![](https://pic2.zhimg.com/v2-111075a4bd7461037abd62798c1a9df7_1200x500.jpg)
![](https://pic2.zhimg.com/80/v2-091c0d9e97f15d5bbb73af492eec77cd_720w.jpg)
