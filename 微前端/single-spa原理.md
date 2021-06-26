[TOC]

# JS Entry

`single-spa` 就做了两件事情：

- 加载微应用（加载方法还得用户自己来实现）
- 管理微应用的状态（初始化、挂载、卸载）



而 `JS Entry` 的理念就在加载微应用的时候用到了，在使用 `single-spa` 加载微应用时，我们加载的不是微应用本身，而是微应用导出的 `JS` 文件，而在入口文件中会导出一个对象，这个对象上有 `bootstrap`、`mount`、`unmount` 这三个接入 `single-spa` 框架必须提供的生命周期方法，

其中 `mount` 方法规定了微应用应该怎么挂载到主应用提供的容器节点上，当然你要接入一个微应用，就需要对微应用进行一系列的改造，

然而 `JS Entry` 的问题就出在这儿，改造时对微应用的侵入行太强，而且和主应用的耦合性太强。

`single-spa` 采用 `JS Entry` 的方式接入微应用。微应用改造一般分为三步：

- 微应用路由改造，添加一个特定的前缀
- 微应用入口改造，挂载点变更和生命周期函数导出
- 打包工具配置更改

侵入型强其实说的就是第三点，更改打包工具的配置，使用 `single-spa` 接入微应用需要将微应用整个打包成一个 `JS` 文件，发布到静态资源服务器，然后在主应用中配置该 `JS` 文件的地址告诉 `single-spa` 去这个地址加载微应用。

不说其它的，就现在这个改动就存在很大的问题，将整个微应用打包成一个 `JS` 文件，常见的打包优化基本上都没了，比如：按需加载、首屏资源加载优化、css 独立打包等优化措施。

项目发布以后出现了 `bug` ，修复之后需要更新上线，为了清除浏览器缓存带来的应用，一般文件名会带上 `chunkcontent`，微应用发布之后文件名都会发生变化，这时候还需要更新主应用中微应用配置，然后重新编译主应用然后发布，这套操作简直是不能忍受的





# 生命周期

**single-spa** 有**12个状态**，可以分为**四个生命周期**：**加载** ---> **挂载** ---> **卸载** 和 **销毁**。四个生命周期又**对应状态**的**进行中**和**完成时**，以及**统一**的**运行失败状态**。

![single-spa生命周期](https://img-blog.csdnimg.cn/20210329104342964.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjI0NDY5MQ==,size_16,color_FFFFFF,t_70)

 



[](https://links.jianshu.com/go?to=https%3A%2F%2Fimgchr.com%2Fi%2FrzNZse)







# 实现原理

## (1). 路由问题

`single-spa`是通过监听**hashChange**和**popState**这两个原生事件来检测路由变化的，它会根据路由的变化来加载对应的应用，相关的代码可以在`single-spa`的 `src/navigation/navigation-events.js` 中找到：

```javascript
...
// 139行
if (isInBrowser) {
  // We will trigger an app change for any routing events.
  window.addEventListener("hashchange", urlReroute);
  window.addEventListener("popstate", urlReroute);
...
// 174行，劫持pushState和replaceState
  window.history.pushState = patchedUpdateState(
    window.history.pushState,
    "pushState"
  );
  window.history.replaceState = patchedUpdateState(
    window.history.replaceState,
    "replaceState"
  );
```

我们看到，`single-spa`在检测到发生`hashChange`或`popState`事件时，会执行`urlReroute`函数，这里封装了它对路由问题的解决方案。

另外，它还劫持了原生的`pushState`和`replaceState`事件，关于为什么劫持这两个事件，我们后面会介绍，我们先来看`urlReroute`函数做了什么：

```javascript
function urlReroute() {
  reroute([], arguments);
}
```

这个函数只是调用了`reroute`函数，而`reroute`函数就是`single-spa`解决路由问题的核心逻辑，

下面我们来分析一下它的实现，由于该函数较长，我们截取其中体现核心思路的代码进行分析：
**src/navigation/reroute.js**

```javascript
export function reroute(pendingPromises = [], eventArguments) {
  ...
  // getAppChanges会根据路由改变应用的状态，状态包含4类
  // 待清除、待卸载、待加载、待挂载
  const {
    appsToUnload,
    appsToUnmount,
    appsToLoad,
    appsToMount,
  } = getAppChanges();
  ...
  // 如果应用已启动，则调用performAppChanges加载和挂载应用
  // 否则，只加载未加载的应用
  if (isStarted()) {
    appChangeUnderway = true;
    appsThatChanged = appsToUnload.concat(
      appsToLoad,
      appsToUnmount,
      appsToMount
    );
    return performAppChanges();
  } else {
    appsThatChanged = appsToLoad;
    return loadApps();
  }
  ...
  function performAppChanges() {
    return Promise.resolve().then(() => {
      // 1. 派发应用更新前的自定义事件
      // 2. 执行应用暴露出的生命周期函数
      // appsToUnload -> unload生命周期钩子
      // appsToLoad -> 执行加载方法
      // appsToUnmount -> 卸载应用，并执行对应生命周期钩子
      // appsToMount -> 尝试引导和挂载应用
    })
  }
  ...
}
```

这里就是`single-spa`解决路由问题的主要逻辑。主要是以下几步：

1. 根据传入的参数`activeWhen`判断哪个应用需要加载，哪个应用需要卸载或清除，并将其push到对应的数组
2. 如果应用已经启动，则进行应用加载或切换。针对应用的不同状态，直接执行应用自身暴露出的生命周期钩子函数即可。
3. 如果应用未启动，则只去下载`appsToLoad`中的应用。

总的来看，当路由发生变化时，`hashChange`或`popState`会触发，这时`single-spa`会监听到，并触发`urlReroute`；

接着它会调用`reroute`，该函数正确设置各个应用的状态后，直接通过调用应用所暴露出的生命周期钩子函数即可。

当某个应用被推送到`appsToMount`后，它的`mount`函数会被调用，该应用就会被挂载；而推送到`appsToUnmount`中的应用则会调用其`unmount`钩子进行卸载。

![在这里插入图片描述](http://images.12345.okgoes.com/blog/images/2021/2/23/143441/20210222005822932.png)

上面我们还提到，`single-spa`除了监听`hashChange`或`popState`两个事件外，还劫持了原生的`pushState`和 `replaceState`两个方法，这是为什么呢？

通过调用`pushState`或`replaceState`，将滚动位置记录在state中，而页面的url实际上没有变化。

这种情况下，`single-spa`理论上不应该去重新加载应用，但是由于这种行为会触发页面的`hashChange`事件，所以根据上面的逻辑，`single-spa`会发生意外重载。

为了解决这个问题，`single-spa`允许开发者手动设置是否只对url值的变化监听，而不是只要发生`hashChange`或`popState`就去重新加载应用，我们可以像下面一样在启动`single-spa`时添加`urlRerouteOnly`参数：

```javascript
singleSpa.start({
  urlRerouteOnly: true,
});
```

这样除非url发生了变化，否则`pushState`和`popState`不会导致应用重载。



## (2). 应用入口

`single-spa`采用的是**协议入口**，即只要实现了`single-spa`的入口协议规范，它就是可加载的应用。`single-spa`的规范要求应用入口必须暴露出以下三个生命周期钩子函数，且必须返回Promise，以保证`single-spa`可以注册回调函数：

1. bootstrap
2. mount
3. unmount
   ![在这里插入图片描述](http://images.12345.okgoes.com/blog/images/2021/2/23/159435/20210222010751901.png)

**bootstrap**用于应用引导，基座应用会在子应用挂载前调用它。举个应用场景，假如某个子应用要挂载到基座应用内`id`为`app`的节点上：

```javascript
new Vue({
  el: '#app',
  ...
})
```

但是基座应用中当前没有`id`为`app`的节点，我们就可以在子应用的`bootstrap`钩子内手动创建这样一个节点并插入到基座应用，子应用就可以正常挂载了。所以它的作用就是做一些挂载前的准备工作。

**mount**用于应用挂载，就是一般应用中用于渲染的逻辑，即上述的`new Vue`语句。我们通常会把它封装到一个函数里，在`mount`钩子函数中调用。

**unmount**用于应用卸载，我们可以在这里调用实例的`destroy`方法手动卸载应用，或清除某些内存占用等。

除了以上三个必须实现的钩子外，`single-spa`还支持非必须的`load`、`unload`、`update`等，分别用于加载、卸载和更新应用。



## (3). 应用加载

实际上`single-spa`并没有提供自己的解决方案，而是将它开放出来，由开发者提供。

我们看一下基于`system.js`如何启动`single-spa`：

```javascript
<script type="systemjs-importmap">
  {
    "imports": {
      "app1": "http://localhost:8080/app1.js",
      "app2": "http://localhost:8081/app2.js",
      "single-spa": "https://cdnjs.cloudflare.com/ajax/libs/single-spa/4.3.7/system/single-spa.min.js"
    }
  }
</script>
... // system.js的相关依赖文件
<script>
(function(){
  // 加载single-spa
  System.import('single-spa').then((res)=>{
    var singleSpa = res;
    // 注册子应用
    singleSpa.registerApplication('app1',
      () => System.import('app1'),
      location => location.hash.startsWith(`#/app1`);
    );
    singleSpa.registerApplication('app2',
      () => System.import('app2'),
      location => location.hash.startsWith(`#/app2`);
    );
    // 启动single-spa
    singleSpa.start();
  })
})()
</script>
```

我们在调用`singleSpa.registerApplication`注册应用时提供的第二个参数就是加载这个子应用的方法。

如果需要加载多个js，可以使用多个`System.import`连续导入。

`single-spa`会调用这个函数，下载子应用代码并分别调用其`bootstrap`和`mount`方法进行引导和挂载。

从这里我们也可以看到`single-spa`的弊端。首先我们必须手动实现应用加载逻辑，挨个罗列子应用需要加载的资源，这在大型项目里是十分困难的（特别是使用了文件名hash时）；

另外它只能以js文件为入口，无法直接以html为入口，这使得嵌入子应用变得很困难，也正因此，`single-spa`不能直接加载jQuery应用。

`single-spa`的`start`方法也很简单：

```javascript
export function start(opts) {
  started = true;
  if (opts && opts.urlRerouteOnly) {
    setUrlRerouteOnly(opts.urlRerouteOnly);
  }
  if (isInBrowser) {
    reroute();
  }
}
```

先是设置`started`状态，然后设置我们上面说到的`urlRerouteOnly`属性，接着调用`reroute`，开始首次加载子应用。加载完第一个应用后，`single-spa`就时刻等待着`hashChange`或`popState`事件的触发，并执行应用的切换。

以上就是`single-spa`的核心原理，从上面的介绍中不难看出，`single-spa`只是负责把应用加载到一个页面中，至于应用能否协同工作，是很难保证的。
