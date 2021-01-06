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

通过上图，我们发现，Vue 2.x 的 diff 算法将每个标签都比较了一次，最后发现带有 $\color{#ff0000}{message}$ 变量的标签是需要被更新的标签，显然这还有优化的空间。

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

老八食堂 被提到了 render 函数外，每次渲染的时候只要取 _hoisted_1 变量便可。认真看文章的同学又会发现一个细节， _hoisted_1 被打上了 PatchFlag ，静态标记值为 -1 ，特殊标志是负整数表示永远不会用作 Diff。也就是说被打上 -1 标记的，将不在参与 Diff 算法，这又提升了 Vue 的性能。


# cacheHandler(事件监听缓存)

# SSR 服务端渲染

# StaticNode(静态节点)

