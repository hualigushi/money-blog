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

通过上图，我们发现，Vue 2.x 的 diff 算法将每个标签都比较了一次，最后发现带有 `{{ message }}` 变量的标签是需要被更新的标签，显然这还有优化的空间。

在 Vue 3.0 中，对 diff 算法进行了优化，在创建虚拟 DOM 时，根据 DOM 内容是否会发生变化，而给予相对应类型的静态标记（PatchFlag），如下图所示：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7d28e33a69f6425e95d3f152d7125b16~tplv-k3u1fbpfcp-zoom-1.image)

观察上图，不难发现试图的更新只对带有 flag 标记的标签进行了对比（diff），所以只进行了 1 次比较，

而相同情况下，Vue 2.x 则进行了 3 次比较。这便是 Vue 3.0 比 Vue2.x 性能好的第一个原因。

我们再通过把模板代码转译成虚拟 DOM，来验证我们上述的分析是否正确。我们可以打开模板转化网站，对上述代码进行转译：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3f25d55eba824ab587164db8e805fdb1~tplv-k3u1fbpfcp-zoom-1.image)

# hoistStatic(静态提升)

# cacheHandler(事件监听缓存)

# SSR 服务端渲染

# StaticNode(静态节点)
