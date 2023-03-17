那微前端怎么实现呢？

其实也简单，一句话就可以说明白：**当路由切换的时候，去下载对应应用的代码，然后跑在容器里。**

比如 single-spa，它做的就是监听路由变化，路由切换的时候加载、卸载注册的应用的代码。

只不过 single-spa 的入口是一个 js 文件，需要代码里手动指定要加载啥 js、css 等，不方便维护。

qiankun 只是对 single-spa 的升级。

它升级了啥东西呢？

第一个就是入口，改为了 html 作为入口，解析 html，从中分析 js、css，然后再加载，这个是 import-html-entry 这个包实现的。

所以你在 qiankun 的 package.json 里可以看到 single-spa 和 import-html-entry 这俩依赖。

![img](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f84c11fca03d485c988b2730328e0101~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

加载之后呢？

自然是放容器里运行呀。

这个容器 single-spa 也没做，qiankun 做了。

它是把 js 代码包裹了一层 function，然后再把内部的 window 用 Proxy 包一层，这样内部的代码就被完全隔离了，这样就实现了一个 JS 沙箱。

这部分代码在 import-html-entry 里，也就是加载后的 js 就被包裹了一层：

![img](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/539dfe4a030142f096c6952336ec82e4~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

原理很容易理解，就是 function 包裹了一层，所以代码放在了单独作用域跑，又用 with 修改了 window，所以 window 也被隔离了。

这是 qiankun 的 JS 沙箱实现方案，其他的微前端方式实现沙箱可能用 iframe、web components 等方式。

微前端方案的功能就那一句话：当路由切换的时候，去下载对应应用的代码，然后跑在容器里。只不过这个容器的实现方案有差异。

此外，还要设计一套通信机制，这个倒是很容易。

除了 JS 隔离，还有 CSS 的隔离，不得不说，qiankun 的样式隔离是真的坑，也是我这主要想吐槽的点。





**qiankun 的启动调用方式和 single-spa 非常相似，但是在 single-spa 的基础上增加了一些功能**

1. import-html-entry
2. js沙箱
3. 更丰富的生命周期
4. prefetch



### 技术难点

#### 1.应用隔离

- js 沙箱实现

通过proxy代理window对象，监听对应的get set方法

在应用的 bootstrap 及 mount 两个生命周期开始之前分别给全局状态打下快照，然后当应用切出/卸载时，将状态回滚至 bootstrap 开始之前的阶段，确保应用对全局状态的污染全部清零。而当应用二次进入时则再恢复至 mount 前的状态的，从而确保应用在 remount 时拥有跟第一次 mount 时一致的全局上下文

![图片](https://mmbiz.qpic.cn/mmbiz_png/ttVWurLoGVjIBD01gnwQmrmmJ3icXfrwRxAuZzm4p8d4OGNAwcXJHGvuQhmfrM0ibqiavBiac1gKDpWyZQXarKkPug/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)



- 对象，函数劫持

setInterval、setTimeout，addEventListener，removeEventListener，appendChild

- 单实例 多实例的场景

#### 2.样式隔离

- Shadow DOM
- CSS Module? BEM
- Dynamic Stylesheet

#### 3.html-entry

- 获取html页面内容
- 解析成dom，script，style，entry入口文件
- 获取style的内容填充到html中
- 通过sandbox执行script代码

#### 4.应用通信

initGloabalState，props





