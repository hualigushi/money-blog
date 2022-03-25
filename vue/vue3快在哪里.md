[TOC]

Vue 3 与 Vue 2 相比：

- 在 bundle 包大小方面（tree-shaking 减少了 41% 的体积）

- 初始渲染速度方面（快了 55%）

- 更新速度方面（快了 133%）

- 内存占用方面（减少了 54%）

  

# 源码体积优化

![img](https://pic4.zhimg.com/80/v2-1045927191ffa00ea7bdd718d532960b_720w.png)

tree-shaking，它的原理很简单，tree-shaking 依赖 ES2015 模块语法的静态结构（即 import 和 export），通过编译阶段的静态分析，找到没有引入的模块并打上标记。利用 tree-shaking 技术，如果你在项目中没有引入无关的组件，那么它们对应的代码就不会打包，这样也就间接达到了减少项目引入的 Vue.js 包体积的目的。

Vue3.0 中最直接使用 tree-shaking 技术的一个例子，在 createApp 时会通过 ensureRenderer 创建渲染器对象，但是这里并不是直接创建渲染器对象，而是延时创建渲染器，目的是当用户只依赖响应式包的时候，可以通过 tree-shaking 移除核心渲染逻辑相关的代码。



# 数据劫持优化

在 Vue.js 3.0 使用了 Proxy API 做数据劫持，它是这样的：

```text
observed = new Proxy(data, {
  get() {
    // 收集
  },
  set() {
    // 更新
  }
});
```

### 为什么替换 Object.defineProperty 到 Proxy

Object.defineProperty 和 Proxy 都可以进行数据的劫持，那为什么还要将 Object.defineProperty 替换为 Proxy 了。原因有两个：

![img](https://pic2.zhimg.com/80/v2-c140006961db4144f64af8ad47b399d9_720w.jpg)

### Proxy 是如何解决 Object.defineProperty API 的缺陷

![img](https://pic4.zhimg.com/80/v2-5118dd71c6f82619b8df55f5624dccef_720w.jpg)





# 编译优化

![img](https://pic3.zhimg.com/80/v2-2c5ff035cb5cbbcc4799fbc36317d80e_720w.png)

通过数据劫持和依赖收集，Vue.js 2.x 的数据更新并触发重新渲染的粒度是组件级的：

```html
<template>
  <div id="content">
    <p class="text">1</p>
    <p class="text">2</p>
    <p class="text">3</p>
    <p class="text">{{message}}</p>
    <p class="text">4</p>
    <p class="text">5</p>
    <p class="text">6</p>
  </div>
</template>
```

![img](https://pic4.zhimg.com/80/v2-7541a5ccd2750540e85926e4d2123e7f_720w.jpg)



虽然这段代码中只有一个动态节点，但在如果 message 发生改变，单个组件内部依然需要遍历该组件的整个 vnode 树，所以这里有很多 diff 和遍历其实都是不需要的，这就会导致 vnode 的性能跟模版大小正相关，跟动态节点的数量无关，当一些组件的整个模版内只有少量动态节点时，这些遍历都是性能的浪费。

Vue.js 3.0 做到了，它通过编译阶段对静态模板的分析，编译生成了 Block tree。Block tree 是一个将模版基于动态节点指令切割的嵌套区块，每个区块内部的节点结构是固定的，而且每个区块只需要以一个 Array 来追踪自身包含的动态节点。

借助 Block tree，Vue.js 将 vnode **更新性能**由与模版整体大小相关提升为**与动态内容的数量相关**，这是一个非常大的性能突破。



![img](https://pic1.zhimg.com/80/v2-233cea7defae3694a1aae1ff2023ef98_720w.png)



除此之外，Vue.js 3.0 在编译阶段还包含了对 Slot 的编译优化、事件侦听函数的缓存优化，并且在运行时重写了 diff 算法。



# PatchFlag(静态标记)

Vue 2.x 中的虚拟 DOM 是全量对比的模式，而到了 Vue 3.0 开始，新增了静态标记（PatchFlag）。

在更新前的节点进行对比的时候，只会去对比带有静态标记的节点。

并且 `PatchFlag` 枚举定义了十几种类型，用以更精确的定位需要对比节点的类型。

```html
<div>
  <p>老八食堂</p>
  <p>{{ message }}</p>
</div>
```

在 Vue 2.x 的全量对比模式下，如下图所示：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6bfaa5a5f5044a5aabc91fb98803a8a8~tplv-k3u1fbpfcp-zoom-1.image)

通过上图，我们发现，Vue 2.x 的 diff 算法将每个标签都比较了一次，最后发现带有 `{{message}}` 变量的标签是需要被更新的标签，显然这还有优化的空间。

在 Vue 3.0 中，对 diff 算法进行了优化，在创建虚拟 DOM 时，根据 DOM 内容是否会发生变化，而给予相对应类型的静态标记（PatchFlag），如下图所示：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7d28e33a69f6425e95d3f152d7125b16~tplv-k3u1fbpfcp-zoom-1.image)

观察上图，不难发现试图的更新只对带有 flag 标记的标签进行了对比（diff），所以只进行了 1 次比较，

而相同情况下，Vue 2.x 则进行了 3 次比较。这便是 Vue 3.0 比 Vue2.x 性能好的第一个原因。

我们再通过把模板代码转译成虚拟 DOM，来验证我们上述的分析是否正确。我们可以打开模板转化网站，对上述代码进行转译：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3f25d55eba824ab587164db8e805fdb1~tplv-k3u1fbpfcp-zoom-1.image)

上图蓝色框内为转译后的虚拟 DOM 节点，第一个 P 标签为写死的静态文字，而第二个 P 标签则为绑定的变量，所以打上了 1 标签，代表的是 TEXT（文字），标记枚举类型如下：
```
export const enum PatchFlags {
  
  TEXT = 1,// 动态的文本节点
  CLASS = 1 << 1,  // 2 动态的 class
  STYLE = 1 << 2,  // 4 动态的 style
  PROPS = 1 << 3,  // 8 动态属性，不包括类名和样式
  FULL_PROPS = 1 << 4,  // 16 动态 key，当 key 变化时需要完整的 diff 算法做比较
  HYDRATE_EVENTS = 1 << 5,  // 32 表示带有事件监听器的节点
  STABLE_FRAGMENT = 1 << 6,   // 64 一个不会改变子节点顺序的 Fragment
  KEYED_FRAGMENT = 1 << 7, // 128 带有 key 属性的 Fragment
  UNKEYED_FRAGMENT = 1 << 8, // 256 子节点没有 key 的 Fragment
  NEED_PATCH = 1 << 9,   // 512
  DYNAMIC_SLOTS = 1 << 10,  // 动态 solt
  HOISTED = -1,  // 特殊标志是负整数表示永远不会用作 diff
  BAIL = -2 // 一个特殊的标志，指代差异算法
}
```



# hoistStatic(静态提升)

没有做静态提升前：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/737d52dc98c44b1882e9bffcdbffefd8~tplv-k3u1fbpfcp-zoom-1.image)
选择 Option 下的 `hoistStatic`：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/44a84e743d524c8e8c457010c64052f3~tplv-k3u1fbpfcp-zoom-1.image)
静态提升后：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fee6f705308444968c604392cb13ee78~tplv-k3u1fbpfcp-zoom-1.image)

老八食堂 被提到了 `render` 函数外，每次渲染的时候只要取 `_hoisted_1` 变量便可。

` _hoisted_1` 被打上了 `PatchFlag` ，静态标记值为 -1 ，特殊标志是负整数表示永远不会用作 Diff。

也就是说被打上 -1 标记的，将不在参与 Diff 算法，这又提升了 Vue 的性能。



# cacheHandler(事件监听缓存)

默认情况下 `@click` 事件被认为是动态变量，所以每次更新视图的时候都会追踪它的变化。

但是正常情况下，我们的 `@click` 事件在视图渲染前和渲染后，都是同一个事件，基本上不需要去追踪它的变化，所以 Vue 3.0 对此作出了相应的优化叫事件监听缓存

```
<div>
  <p @click="handleClick">屋里一giao</p>
</div>
```
编译后如下图所示（还未开启 cacheHandler）：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/21aaab832def4c4eb889f5a3e3eff72a~tplv-k3u1fbpfcp-zoom-1.image)

在未开启事件监听缓存的情况下，我们看到这串代码编译后被静态标记为 8，

之前讲解过被静态标记的标签就会被拉去做比较，而静态标记 8 对应的是“动态属性，不包括类名和样式”。 

`@click` 被认为是动态属性，所以我们需要开启 `Options` 下的 `cacheHandler` 属性，如下图所示：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/41e97c23f5a14a9e86b183d02b16b983~tplv-k3u1fbpfcp-zoom-1.image)

开启 `cacheHandler` 之后，编译后的代码已经没有静态标记（PatchFlag），也就表明图中 P 标签不再被追踪比较变化，进而提升了 Vue 的性能。



# SSR 服务端渲染

当你在开发中使用 SSR 开发时，Vue 3.0 会将静态标签直接转化为文本，相比 React 先将 jsx 转化为虚拟 DOM，再将虚拟 DOM 转化为 HTML，Vue 3.0 已经赢了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0332824ca4e84aa481cc7448ec25ae41~tplv-k3u1fbpfcp-zoom-1.image)



# StaticNode(静态节点)

上述 SSR 服务端渲染，会将静态标签直接转化为文本。在客户端渲染的时候，只要标签嵌套得足够多，编译时也会将其转化为 HTML 字符串，如下图所示：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/731f830fb6dd4ee79cc8d9d03ebc9a5b~tplv-k3u1fbpfcp-zoom-1.image)

- 需要开启 Options 下的 hoistStatic
