[TOC]



## **前言**

刚开始给项目接入 qiankun 的时候，时不时就会报 `Application died in status LOADING_SOURCE_CODE: You need to export the functional lifecycles in xxx entry`：

![图片](https://mmbiz.qpic.cn/mmbiz_png/oCmxRMwTTv02WMTaIwZ6eicG0IsUSgaKcarUcJY5x4SUJ4gnfK6YNGjZXSOUFpyUEeGVRYM1EpLPFtkPG6t7vEg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

开发的时候一切正常，只有在打包发布后才会报这个 Bug，让人非常恼火。相信有不少同学也遇到过这个问题，今天就来分享一下这个问题的思考和解决方案吧。

## **为什么要找生命周期**

首先，我们要知道为什么 qiankun 加载微应用时要找生命周期钩子。

早在 qiankun 出来前，已经有一个微前端框架 single-spa 了。

![图片](https://mmbiz.qpic.cn/mmbiz_png/oCmxRMwTTv02WMTaIwZ6eicG0IsUSgaKcNWAT0RyjadklAGbw2Lv4kibLphibt7Aqwgr4eIrn79C0AruBR1SoiaT3g/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

它的思想是：无论 React、Vue 还是 Angular，项目打包最终的产物都是 JS。如果在 **合适的时机** 以 **某种执行方式** 去执行微应用的 JS 代码，大概就能实现 **主-微** 结构的微前端开发了。

这里有两个关键词：**合适的时机** 和 **执行方式**。对于前者，single-spa 参考了单页应用（Single Page Application）的思路，也希望用生命周期来管理微应用的 **bootstrap, mount, update, unmount**。而对于后者，则需要开发者自己实现执行微应用 JS 的方式。

![图片](https://mmbiz.qpic.cn/mmbiz_png/oCmxRMwTTv02WMTaIwZ6eicG0IsUSgaKcVyAUIJibAkoericib6R4qvZS5III1oPVSmB1gmtr8HriaBFJM9FvSeQmuQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

总的来说，开发者需要在微应用的入口文件 `main.js` 里写好生命周期实现：

```js
export async function bootstrap() {
  // 启动微应用
}
export async function mount() {
  // 加载微应用
}
export async function unmount() {
  // 卸载微应用
}
export async function update() {
  // 更新微应用
}
```

**single-spa 会自动劫持和监听网页地址 URL 的变化，在命中路由规则后，执行这些生命周期钩子，从而实现微应用的加载、卸载和更新。**

但这就有一个严重的问题了：一般我们项目的入口文件就只有：

```js
React.render(<App/>, document.querySelector('#root'))
```

这要如何和主应用交互呢？而且里面的样式、全局变量隔离又要怎么实现呢？Webpack 又该如何改造呢？然而，single-spa 只提供了生命周期的调度，并没有解决这一系列问题。

既然前人解决不了，后人则可以基于原有框架继续优化，这就是 qiankun。

qiankun 和 single-spa 最大的不同是：qiankun 是 HTML 入口。它的原理如图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/oCmxRMwTTv02WMTaIwZ6eicG0IsUSgaKciaVg5WWMdezaicTo55gjslfC9nJCYW4MxWC55HQb4vtzmHNBIGeBhtCg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

可以看到 qiankun 自己实现了一套通过 HTML 地址加载微应用的机制，**但对于 “要在什么时候执行 JS” 依然用了 single-spa 的生命周期调度能力。这就是为什么微应用的入口文件 `main.js` 依然需要提供 single-spa 的生命周期回调。**

## **如何找入口**

现在我们来聊聊如何找入口的问题。

对于一个简单的 SPA 项目来说，一个 `<div id="app"></div>` + 一个 `main.js` 就够了，入口很好找。但真实项目往往会做分包拆包、自动注入 `<script>` 脚本等操作，使得最终访问的 HTML 会有多个 `<script>` 标签：

```js
<script>
  // 初始化 XX SDK
</script>

<body>
  ...
</body>

<script src="你真实的入口 main.js"></script>

<script src="ant-design.js"></script>
<script>
  // 打包后自动注入的静态资源 retry 逻辑
</script>
<script>
  // 公司代码网关自动注入的 JS 逻辑
</script>
```

对于这样复杂的情况，qiankun 提供了 2 种定位入口的方式：

- 找 **带有 `entry` 属性的** `<script entry src="main.js"></script>`
- 如果找不到，那么把 **最后一个 `<script>` 作为入口**

第一种方法是最稳妥的，可以使用 html-webpack-inject-attributes-plugin 这个 Webpack 插件，在打包的时候就给入口 `main.js` 添加 `entry` 属性：

```js
plugins = [
    new HtmlWebpackPlugin(),
    new htmlWebpackInjectAttributesPlugin({
        entry: "true",
    })
]
```

**不推荐大家使用最后一种方法来确定入口，这种方式很不可靠。** 因为微应用 HTML 有可能在一些公司代理、网关层中被拦截，自动注入一些脚本。这样最终拿到 HTML 里最后的一个 `<script>` 就不是原先的入口 `main.js` 文件了：

```js
<script src="你真实的入口 main.js"></script>
<script>
  // 自动注入的网关层的代理逻辑
</script>
```

## **兜底找入口**

上面两种找入口方式并不能 100% 覆盖所有情况，比如我就遇到过这样的场景：

1. 脚手架封装得太黑盒了，导致添加插件不生效，无法在打包时注入 `entry` 属性
2. 测试环境中，代理工具会自动往 HTML 插入 `<script>`，无法将最后一个 JS 作为入口

**这下 qiankun 彻底找不到我的入口了。你总不能说：手写一个 JS 脚本，然后每次打包后用正则去 `replace` HTML，以此来添加 `entry` 属性吧？？？**

![图片](https://mmbiz.qpic.cn/mmbiz_gif/oCmxRMwTTv02WMTaIwZ6eicG0IsUSgaKcPSGTRUy6xLOiadOiaGrKhib8viclupuYaWxbHPeZtL8kibJxZHef82qtalQ/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

当然不行！

曾经我在 qiankun 的文档里看到过这段配置：

```js
module.exports = {
  webpack: (config) => {
    config.output.library = `microApp`;
    config.output.libraryTarget = 'umd';
    config.output.jsonpFunction = `webpackJsonp_${name}`;
    config.output.globalObject = 'window';

    return config;
  },

  ...
};
```

文档里说这是一个兜底找入口的逻辑：

![图片](https://mmbiz.qpic.cn/mmbiz_png/oCmxRMwTTv02WMTaIwZ6eicG0IsUSgaKcTknoufNETYISPjAQ0cSv3ER75iakKa9n0F5pUJob03znicUkNMcQOq9g/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

但文档没有说这里的细节，下面就来一起研究一下。

### **微应用的 Webpack 配置**

`libraryTarget` 指定打包成 umd 格式，也即最终模块会兼容 CommonJS 和 AMD 等多种格式来进行导出，最终 `main.js` 会是这样：

```js
(function webpackUniversalModuleDefinition(root, factory) {
  // CommonJS 导出
  if (typeof exports === 'object' && typeof module === 'object')
    module.exports = factory(require('lodash'));
  // AMD 导出
  else if (typeof define === 'function' && define.amd)
    define(['lodash'], factory);
  // 另一种导出
  else if (typeof exports === 'object')
    exports['microApp'] = factory(require('lodash'));
  // 关键点
  else root['microApp'] = factory(root['_']);
})(this, function (__WEBPACK_EXTERNAL_MODULE_1__) {
  // 入口文件的内容
  // ...
  return {
    bootstrap() {},
    mount() {},
    // ...
  }
});
```

直接看最后一种导出方式 `root['microApp'] = factory(root['_'])`。Webpack 配置的 `globalObject` 和 `library` 正好对应了里面的 `root` 以及 `'microApp'`。而且上面的函数 `factory` 则是入口文件的执行函数，理论上当执行 `factory()` 后会返回模块的输出。

**最终的效果是：Webpack 会把入口文件的输出内容挂在到 `globalObject[library]`/`window['microApp']` 上：**

```
window['microApp'] = {
  // main.js 所 export 的内容
  bootstrap() {},
  mount() {},
  unmount() {},
  update() {},
  // ...
}
```

### **主应用的兜底逻辑**

把入口的内容挂载到 `window` 上有什么好处呢？我们来稍微看点源码：

```
// 发 Http 请求获取 HTML, JS 执行器
const { template, execScripts, assetPublicPath } = await importEntry(entry, importEntryOpts);

// 执行微应用的 JS，但这里不一定有入口
const scriptExports: any = await execScripts(global, sandbox && !useLooseSandbox);

// 获取入口导出的生命周期
const { bootstrap, mount, unmount, update } = getLifecyclesFromExports(
  scriptExports,
  appName,
  global,
  sandboxContainer?.instance?.latestSetProp,
);
```

上面的代码很简单，就是获取微应用 HTML 和 JS，试图从里面获取生命周期，所以下面我们来看看 `getLifecyclesFromExports` 做了什么：

```js
function getLifecyclesFromExports(
  scriptExports: LifeCycles<any>,
  appName: string,
  global: WindowProxy,
  globalLatestSetProp?: PropertyKey | null,
) {
  // 如果在获取微应用的 JS 时可以锁定入口文件，那么直接返回
  if (validateExportLifecycle(scriptExports)) {
    return scriptExports;
  }

  // 不用看
  if (globalLatestSetProp) {
    const lifecycles = (<any>global)[globalLatestSetProp];
    if (validateExportLifecycle(lifecycles)) {
      return lifecycles;
    }
  }

  // 获取 globalObject[library] 里的内容
  const globalVariableExports = (global as any)[appName];

  // 判断 globalObject[library] 里的内容是否为生命周期
  // 如果是合法生命周期，那么直接返回
  if (validateExportLifecycle(globalVariableExports)) {
    return globalVariableExports;
  }

  throw new QiankunError(`You need to export lifecycle functions in ${appName} entry`);
}
```

**从上面可以看到，在 `getLifecyclesFromExports` 最后会试图从 `windowProxy[微应用名]` 中拿导出的生命周期。**

**这也是为什么兜底找入口操作需要微应用配置 Webpack，同时主应用指定的微应用名要和 `library` 名要一样。**

*注意：qiankun 会使用 JS 沙箱来隔离微应用的环境，所以这里的 `globalObject` 并不是 `window` 而是微应用对应的沙箱对象 `windowProxy`。*

在微应用里写 `console.log(window['microApp'])` 或在主应用里输入 `console.log(window.proxy['microApp'])` 即可看到微应用导出的生命周期：

![图片](https://mmbiz.qpic.cn/mmbiz_png/oCmxRMwTTv02WMTaIwZ6eicG0IsUSgaKcFpyGGicPoh8BB8aBP3FuiaphsLblbBzSWCN5dqV9tDlcho52sIuibiabog/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

**因此，在主应用中注册微应用的时候，微应用 `name` 最好要和 Webpack 的 `output.library` 一致，这样才能命中 qiankun 的兜底逻辑。**

## **总结**

最后总结一下，qiankun 要找入口是因为要从中拿到生命周期回调，把它们给 single-spa 做调度。

qiankun 支持 2 种找入口的方式：

1. 正则匹配 **带有 `entry` 属性的 `<script>`** ，找到就把这个 JS 作为入口
2. 当找不到时，默认把 **最后一个 JS** 作为入口

如果这两种方法都无法帮你正确定位入口，那么你需要：

1. 在微应用配置 `library`, `libraryTarget` 以及 `globalObject`，**把入口导出的内容挂载到 `window` 上**
2. 加载微应用时，**主应用会试着从 `window[library]` 找微应用的生命周期回调**，找到后依然能正常加载
3. 在主应用注册微应用时，**要把微应用的 `name` 和 Webpack 的 `output.library` 设为一致**，这样才能命中第二步的逻辑

最后还要注意的是，上面说到的 `window` 并不是全局对象，而是 qiankun 提供的 JS 沙箱对象 `windowProxy`。