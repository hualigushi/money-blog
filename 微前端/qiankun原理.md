[TOC]

# qiankun实现原理

## (1). 应用加载

上面我们说到了，`single-spa`提供的应用加载方案是开放式的。

针对上面我们谈到的几个弊端，`qiankun`进行了一次封装，给出了一个更完整的应用加载方案，`qiankun`的作者将其封装成了npm插件`import-html-entry`。

该方案的主要思路是允许以html文件为应用入口，然后通过一个html解析器从文件中提取js和css依赖，并通过fetch下载依赖，于是在`qiankun`中你可以这样配置入口：

```javascript
const MicroApps = [{
  name: 'app1',
  entry: 'http://localhost:8080',
  container: '#app',
  activeRule: '/app1'
}]
```

`qiankun`会通过`import-html-entry`请求`http://localhost:8080`，得到对应的html文件，解析内部的所有`script`和`style`标签，依次下载和执行它们，这使得应用加载变得更易用。

我们看一下这具体是怎么实现的。

`import-html-entry`暴露出的核心接口是`importHTML`，用于加载html文件，它支持两个参数：

1. **url**，要加载的文件地址，一般是服务中html的地址
2. **opts**，配置参数

url不必多说。opts如果是一个函数，则会替换默认的fetch作为下载文件的方法，此时其返回值应当是Promise；如果是一个对象，那么它最多支持四个属性：`fetch`、`getPublicPath`、`getDomain`、`getTemplate`，用于替换默认的方法，这里暂不详述。

我们截取该函数的主要逻辑：

```javascript
export default function importHTML(url, opts = {}) {
  ...
  // 如果已经加载过，则从缓存返回，否则fetch回来并保存到缓存中
  return embedHTMLCache[url] || (embedHTMLCache[url] = fetch(url)
		.then(response => readResAsString(response, autoDecodeResponse))
		.then(html => {
		  // 对html字符串进行初步处理
		  const { template, scripts, entry, styles } = 
		    processTpl(getTemplate(html), assetPublicPath);
		  // 先将外部样式处理成内联样式
		  // 然后返回几个核心的脚本及样式处理方法
		  return getEmbedHTML(template, styles, { fetch }).then(embedHTML => ({
				template: embedHTML,
				assetPublicPath,
				getExternalScripts: () => getExternalScripts(scripts, fetch),
				getExternalStyleSheets: () => getExternalStyleSheets(styles, fetch),
				execScripts: (proxy, strictGlobal, execScriptsHooks = {}) => {
					if (!scripts.length) {
						return Promise.resolve();
					}
					return execScripts(entry, scripts, proxy, {
						fetch,
						strictGlobal,
						beforeExec: execScriptsHooks.beforeExec,
						afterExec: execScriptsHooks.afterExec,
					});
				},
			}));
		});
}
```

省略的部分主要是一些参数预处理，我们从return语句开始看，具体过程如下：

1. 检查是否有缓存，如果有，直接从缓存中返回
2. 如果没有，则通过fetch下载，并字符串化
3. 调用`processTpl`进行一次模板解析，主要任务是扫描出外联脚本和外联样式，保存在`scripts`和`styles`中
4. 调用`getEmbedHTML`，将外联样式下载下来，并替换到模板内，使其变成内部样式
5. 返回一个对象，该对象包含处理后的模板，以及`getExternalScripts`、`getExternalStyleSheets`、`execScripts`等几个核心方法
   ![在这里插入图片描述](http://images.12345.okgoes.com/blog/images/2021/2/23/120176/20210222012610595.png)

`processTpl`主要基于正则表达式对模板字符串进行解析，这里不进行详述。

我们来看`getExternalScripts`、`getExternalStyleSheets`、`execScripts`这三个方法：

**getExternalStyleSheets**

```javascript
export function getExternalStyleSheets(styles, fetch = defaultFetch) {
  return Promise.all(styles.map(styleLink => {
	if (isInlineCode(styleLink)) {
	  // if it is inline style
	  return getInlineCode(styleLink);
	} else {
	  // external styles
	  return styleCache[styleLink] ||
	  (styleCache[styleLink] = fetch(styleLink).then(response => response.text()));
	}
  ));
}
```

遍历styles数组，如果是内联样式，则直接返回；

否则判断缓存中是否存在，如果没有，则通过fetch去下载，并进行缓存。

**getExternalScripts**与上述过程类似。

**execScripts**是实现js隔离的核心方法，我们放在下一部分js隔离里讲解。

通过调用`importHTML`方法，`qiankun`可以直接加载html文件，同时将外联样式处理成内部样式表，并且解析出JavaScript依赖。

更重要的是，它获得了一个可以在隔离环境下执行应用脚本的方法`execScripts`。



## (2). js隔离

上面我们说到，`qiankun`通过`import-html-entry`，可以对html入口进行解析，并获得一个可以执行脚本的方法`execScripts`。

`qiankun`引入该接口后，首先为该应用生成一个window的代理对象，然后将代理对象作为参数传入接口，以保证应用内的js不会对全局`window`造成影响。

由于IE11不支持proxy，所以`qiankun`通过快照策略来隔离js，缺点是无法支持多实例场景。

我们先来看基于`proxy`的js隔离是如何实现的。首先看`import-html-entry`暴露出的接口，照例我们只截取核心代码:
**execScripts**

```javascript
export function execScripts(entry, scripts, proxy = window, opts = {}) {
  ... // 初始化参数
  return getExternalScripts(scripts, fetch, error)
	.then(scriptsText => {
	  // 在proxy对象下执行脚本的方法
	  const geval = (scriptSrc, inlineScript) => {
	    const rawCode = beforeExec(inlineScript, scriptSrc) || inlineScript;
	    const code = getExecutableScript(scriptSrc, rawCode, proxy, strictGlobal);
        (0, eval)(code);
        afterExec(inlineScript, scriptSrc);
	  };
	  // 执行单个脚本的方法
      function exec (scriptSrc, inlineScript, resolve) { ... }
      // 排期函数，负责逐个执行脚本
      function schedule(i, resolvePromise) { ... }
      // 启动排期函数，执行脚本
      return new Promise(resolve => schedule(0, success || resolve));
    });
});
```

这个函数的关键是定义了三个函数：`geval`、`exec`、`schedule`，其中实现js隔离的是`geval`函数内调用的`getExecutableScript`函数。

我们看到，在调这个函数时，我们把外部传入的`proxy`作为参数传入了进去，而它返回的是一串新的脚本字符串，这段新的字符串内的`window`已经被`proxy`替代，具体实现逻辑如下：

```javascript
function getExecutableScript(scriptSrc, scriptText, proxy, strictGlobal) {
	const sourceUrl = isInlineCode(scriptSrc) ? '' : `//# sourceURL=${scriptSrc}\n`;

	// 通过这种方式获取全局 window，因为 script 也是在全局作用域下运行的，所以我们通过 window.proxy 绑定时也必须确保绑定到全局 window 上
	// 否则在嵌套场景下， window.proxy 设置的是内层应用的 window，而代码其实是在全局作用域运行的，会导致闭包里的 window.proxy 取的是最外层的微应用的 proxy
	const globalWindow = (0, eval)('window');
	globalWindow.proxy = proxy;
	// TODO 通过 strictGlobal 方式切换切换 with 闭包，待 with 方式坑趟平后再合并
	return strictGlobal
		? `;(function(window, self, globalThis){with(window){;${scriptText}\n${sourceUrl}}}).bind(window.proxy)(window.proxy, window.proxy, window.proxy);`
		: `;(function(window, self, globalThis){;${scriptText}\n${sourceUrl}}).bind(window.proxy)(window.proxy, window.proxy, window.proxy);`;
}
```

![在这里插入图片描述](http://images.12345.okgoes.com/blog/images/2021/2/23/198044/202102211816117.png)
核心代码就是由两个矩形框起来的部分，它把解析出的`scriptText`（即脚本字符串）用`with(window){}`包裹起来，然后把`window.proxy`作为函数的第一个参数传进来，所以`with`语法内的`window`实际上是`window.proxy`。

这样，当在执行这段代码时，所有类似`var name = '张三'`这样的语句添加的全局变量`name`，实际上是被挂载到了`window.proxy`上，而不是真正的全局`window`上。当应用被卸载时，对应的`proxy`会被清除，因此不会导致js污染。而当你配置`webpack`的打包类型为`lib`时，你得到的接口大概如下：

```javascript
var jquery = (function(){})();
```

如果你的应用内使用了jquery，那么这个jquery对象就会被挂载到`window.proxy`上。

不过如果你在代码内直接写`window.name = '张三'`来生成全局变量，那么`qiankun`就无法隔离js污染了。

`import-html-entry`实现了上述能力后，`qiankun`要做的就很简单了，只需要在加载一个应用时为其初始化一个`proxy`传递进来即可：
**proxySandbox.ts**

```javascript
export default class ProxySandbox implements SandBox {
  ...
  constructor(name: string) {
    ...
    const proxy = new Proxy(fakeWindow, {
      set () { ... },
      get () { ... }
    }
  }
}
```

每次加载一个应用，`qiankun`就初始化这样一个`proxySandbox`，传入上述`execScripts`函数中。

在IE下，由于`proxy`不被支持，并且没有可用的`polyfill`，所以`qiankun`退而求其次，采用快照策略实现js隔离。它的大致思路是，在加载应用前，将`window`上的所有属性保存起来（即拍摄快照）；等应用被卸载时，再恢复`window`上的所有属性，这样也可以防止全局污染。但是当页面同时存在多个应用实例时，`qiankun`无法将其隔离开，所以IE下的快照策略无法支持多实例模式。

关于快照模式我们就不详细介绍了，接下来看一下`qiankun`如何实现css样式隔离。



## (3). css隔离

目前`qiankun`主要提供了两种样式隔离方案，一种是基于`shadowDom`的；

另一种则是实验性的，思路类似于Vue中的`scoped`属性，给每个子应用的根节点添加一个特殊属性，用作对所有css选择器的约束。

开启样式隔离的语法如下：

```javascript
registerMicroApps({
  name: 'app1',
  ...
  sandbox: {
    strictStyleIsolation: true
    // 实验性方案，scoped方式
    // experimentalStyleIsolation: true
  },
})
```

当启用`strictStyleIsolation`时，`qiankun`将采用`shadowDom`的方式进行样式隔离，即为子应用的根节点创建一个`shadow root`。

最终整个应用的所有DOM将形成一棵`shadow tree`。我们知道，`shadowDom`的特点是，它内部所有节点的样式对树外面的节点无效，因此自然就实现了样式隔离。

但是这种方案是存在缺陷的。因为某些UI框架可能会生成一些弹出框直接挂载到`document.body`下，此时由于脱离了`shadow tree`，所以它的样式仍然会对全局造成污染。

此外`qiankun`也在探索类似于`scoped`属性的样式隔离方案，可以通过`experimentalStyleIsolation`来开启。这种方案的策略是为子应用的根节点添加一个特定的随机属性，如：

```javascript
<div
  data-qiankun-asiw732sde
  id="__qiankun_microapp_wrapper__"
  data-name="module-app1"
>
```

然后为所有样式前面都加上这样的约束：

```javascript
.app-main { 
  字体大小：14 px ; 
}
// ->
div[data-qiankun-asiw732sde] .app-main {  
  字体大小：14 px ; 
}
```

经过上述替换，这个样式就只能在当前子应用内生效了。虽然该方案已经提出很久了，但仍然是实验性的，因为它不支持@ keyframes，@ font-face，@ import，@ page（即不会被重写）。



## (4). 应用通信

一般来说，微前端中各个应用之前的通信应该是尽量少的，而这依赖于应用的合理拆分。反过来说，如果你发现两个应用间存在极其频繁的通信，那么一般是拆分不合理造成的，这时往往需要将它们合并成一个应用。

当然了，应用间存在少量的通信是难免的。`qiankun`官方提供了一个简要的方案，思路是基于一个全局的`globalState`对象。

这个对象由基座应用负责创建，内部包含一组用于通信的变量，以及两个分别用于修改变量值和监听变量变化的方法：`setGlobalState`和`onGlobalStateChange`。

以下代码用于在基座应用中初始化它：

```javascript
import { initGlobalState, MicroAppStateActions } from 'qiankun';

const initialState = {};
const actions: MicroAppStateActions = initGlobalState(initialState);

export default actions;
```

这里的`actions`对象就是我们说的`globalState`，即全局状态。基座应用可以在加载子应用时通过`props`将`actions`传递到子应用内，而子应用通过以下语句即可监听全局状态变化：

```javascript
actions.onGlobalStateChange (globalState, oldGlobalState) {
  ...
}
```

同样的，子应用也可以修改全局状态：

```javascript
actions.setGlobalState(...);
```

![在这里插入图片描述](http://images.12345.okgoes.com/blog/images/2021/2/23/119701/20210222014614441.png)

此外，基座应用和其他子应用也可以进行这两个操作，从而实现对全局状态的共享，这样各个应用之间就可以通信了。

这种方案与Redux和Vuex都有相似之处，只是由于微前端中的通信问题较为简单，所以官方只提供了这样一个精简方案。

