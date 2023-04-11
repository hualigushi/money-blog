# **React Query 的本质**

在 Reacr Query 中，代表请求唯一标识的并不是请求 path，而是 queryKey，它作为 useQuery 必传的第一个参数，接收字符串，数组，对象等一切可以被序列化的值。

上面声明的 queryKey 都为 `'todos'`，接收到 queryKey 后，useQuery 会在内部找到或者创建与之对应的 Query 实例，Query 实例包含 isLoading，data 等状态，queryKey 与 Query 实例一一对应。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/44c2f29c88de48849d4b8831364c25c3~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

于是请求也都收敛到了 Query 实例内部发出，直接与服务端交互。

3 个 queryKey 对应 1 个 Query 实例，所以只会有一次请求。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/604b1353ea284819852141c295f9b690~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

那么 Query 实例保存在哪个地方呢？在 React 组件内部吗？

还记得最开始我们在 App 中做过什么吗，我们有初始化过 QueryClient，并把它注入到了整个应用中。

```javascript
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

function App () {
  return (
   <QueryClientProvider client={queryClient}>
     <Example />
   </QueryClientProvider>
  )
}
```

它会在内部将 Query 管理起来，可以将 queryClient 看作一个外部的 store。Query 以 map 键值对的方式保存在 store 中，key 为 `queryHash`（也就是 queryKey 序列化过后的值），value 为 Query。

```ini
this.queriesMap = {};

this.queriesMap[query.queryHash] = query;
```

在图上加上 queryClient，整体流程如下，**它的本质就是一个外部的状态管理库。**

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/289c8574b5b84c77819364ffafbd8396~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

这又引出了一个新的问题：

既然 Query 保存在组件外部，请求的 data，loading 等状态也都脱离了 React 管理，那么 React 是如何感知到它们的变化，来影响渲染的呢？

# 观察者设计模式

**如何观测数据，观测到数据变更后如何更新。** 这其实是所有状态管理库的核心命题。

React Query 的实现使用了**观察者设计模式**，这也是它的一个核心。

上面的例子中，App 内有多个地方都依赖了 queryClient 中的同一个 todos 数据。有了观察者，就可以在这部分数据更新时，通知到每一个订阅者。

当每次调用 useQuery 时，内部都会实例一个观察者对象 observer。

```javascript
const [observer] = React.useState(
    () =>
      new Observer<TQueryFnData, TError, TData, TQueryData, TQueryKey>(
        queryClient,
        defaultedOptions,
      ),
  )
```

observer 会订阅 query 的状态，当这些状态变化时，触发 React 强制更新。

在 React 中，手动强制触发更新无非就是 forceUpdate。React Query 在 v3 版本就是这么做的：

```scss
const [, forceUpdate] = React.useState(0);

React.useEffect(() => {
    // ...
    // 省略了部分代码，只保留了订阅的部分
    const unsubscribe = observer.subscribe(
      notifyManager.batchCalls(() => {
        if (mountedRef.current) {
          forceUpdate(x => x + 1)
        }
      })
    )

    return () => {
      unsubscribe()
    }
  }, [...])
```

传入 `notifyManager.batchCalls` 的就是触发更新的方法。

但是在 React 18 发布后，由于 concurrent 并发特性的原因，forceUpdate 可能会造成**撕裂问题，** 已经不能再继续使用了。

# 撕裂问题

什么是撕裂问题？这里引用[【3Shain的回答 - 知乎】](https://link.juejin.cn?target=https%3A%2F%2Fwww.zhihu.com%2Fquestion%2F502917860%2Fanswer%2F2252338680)简单描述一下：

浏览器 JS 是单线程的，当控制权交给 js 代码时，直到代码执行同步完毕之前浏览器都是阻塞的。所以如果代码执行时间过长，用户就会感知到明显的不流畅。

解决办法有两个方向：

- 一是减少计算量

- 二是将计算任务分成多个小块，每执行一小块后就把控制权还给浏览器，浏览器在某个时间再把控制权再还回来。

在之前的 react 版本中，render 过程是不能被中断的，而 react 18 引入的 fiber 设计就使得 render 这个过程能够切分成以 fiber 为最小单位的多次任务。

这里就引出了问题的根源：一次 render 可能不是整体同步执行的，中间还可能穿插着其他的非 render 任务被执行，其中就有可能包含了对外部状态的修改。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5905ba7afea240e88ab47d3d833bc501~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

假设我们的一次 render 被分成了两部分，两部分都读取了外部状态 A。如果两部分任务之间，浏览器处理了一个事件使得外部状态 A 发生了变化，那前半部分的任务读取到的是旧值，后半部分读取到的却是新值，这就造成了渲染结果的不一致性，这就是撕裂问题，也叫 tearing。

[github.com/reactwg/rea…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Freactwg%2Freact-18%2Fdiscussions%2F69)

# **useSyncExternalStore**

为了防止 tearing 的出现，React 18 给出了官方答案，推出了新的 API：**useSyncExternalStore，** 直译为 “同步外部 store”。

用来从外部数据源读取和订阅状态，并且与并发特性兼容。是 Recat 专门提供给第三方库的 hook，通常不用于常规的 App 开发。

它的原理就是在 tearing 出现时，通知 React 之前读取过的外部状态发生了变化，让 React 重新触发一次同步更新，以保证最终结果一致性。

它的用法如下，基于外部的 store 创建一个 state，接收 3 个参数：

```ini
const state = useSyncExternalStore(subscribe, getSnapshot[, getServerSnapshot]);
```

- subscribe：订阅函数 ，react 会给订阅函数传入一个 onStoreChange 函数，当外部 store 改变时，必须调用 onStoreChange 通知到 React

- getSnapshot：要订阅的状态

- getServerSnapshot：在 SSR 时要订阅的状态，可选。

于是，React Query 在最新的 v4 将 forceUpdate 换成了 `useSyncExternalStore`。

```scss
useSyncExternalStore(
    React.useCallback(
      (onStoreChange) =>
        isRestoring
          ? () => undefined
          : observer.subscribe(notifyManager.batchCalls(onStoreChange)),
      [observer, isRestoring],
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult(),
  )
```

可以看到，传入`notifyManager.batchCalls` 触发更新方法从 `forceUpdate` 换成了 react 提供在 API 里提供的 `onStoreChange`。

现在 Query 的变化可以触发 React 更新了，省略了其它 Query，最终整体流程如下：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c7caeb8b8d384f0d877981b0260610ae~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

# 与框架无关

简单总结一下 React Query 的流程：

1. 与请求相关的底层逻辑都封装在了 Query 中，直接与服务端交互

1. 同时 Query 又被保管在外部 store 的 queryClient 中

1. queryClient 会在 App 顶层使用 Provider 全局注入到 React

1. 组件使用 hook 与 Query 建立连接，订阅状态触发更新

可以发现，1，2 点是请求 Query 的核心逻辑，它是与框架无关的。3，4 点是与 React 框架结合，建立通信的部分。

所以作者在组织代码的时候，有意将这两部分代码进行了拆分，从架构上**实现了「** **数据获取** **」这个领域逻辑与 React 框架逻辑的分离。**

这两部分在源码文件目录里分别命名为 `query-core` 和 `react-query`，拆分成了两个文件夹单独管理，并在 v4 版本实现单独发布。仓库也从 react-query 更名为 query。

```erlang
packages/
├── query-core/
├── react-query/
├── ...
```

作为与框架无关的 `query-core` 部分，它可以与 React 结合出 react-query。

那么它也肯定可以和其它框架结合，诞生出比如 vue-query，solid-query。从官网上也可以看出这也是目前作者正在做的事。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a6769e64037642c08a468bf1c27433f6~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

除了实现领域逻辑的分离，React Query 文件夹内部的文件组织也非常值得学习。

来看看 query-core 和 react-query 这两个文件夹。

```erlang
query-core/
├── src/
│     ├── query.ts
│     ├── queryCache.ts
│     ├── queryClient.ts
│     ├── queryObserver.ts
│     ...
...

react-query/
├── src/
│     ├── QueryClientProvider.tsx
│     ├── useMutation.ts
│     ├── useQueries.ts
│     ├── useQuery.ts
│     ...
...

```

文件都以 API 名称命名，非常清晰，一目了然。即使是第一次阅读源码的人也能直观地理解到这些文件的功能大概。

# 总结

以上就是本文的所有内容，总结一下：

- React Query 本质是一个外部的**状态管理库，** 它的核心逻辑与 React 框架无关。

- 在处理与框架连接部分，使用了观察者设计模式来处理请求状态的订阅和更新。

- 由于核心逻辑与框架不耦合，使得它也能与 Vue，Solid 这些框架结合。