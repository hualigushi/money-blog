[TOC]



# redux的⼯作流程

![img](https://camo.githubusercontent.com/d2218268aef0f10fa2810f4c2d842375ee52d503e993efbf20364cd9e0001bae/68747470733a2f2f70332d6a75656a696e2e62797465696d672e636f6d2f746f732d636e2d692d6b3375316662706663702f39353461343862343362383334616162623039363536663131643537343238327e74706c762d6b3375316662706663702d7a6f6f6d2d312e696d616765)

⾸先，我们看下⼏个核⼼概念：

- Store：保存数据的地⽅，你可以把它看成⼀个容器，整个应⽤只能有⼀个Store；
- State：Store对象包含所有数据，如果想得到某个时点的数据，就要对Store⽣成快照，这种时点的数据集合，就叫State；
- Action： State的变化， 会导致View的变化。但是，⽤户接触不到State，只能接触到View。所以，State的变化必须是View导致的。Action就是View发出的通知，表示State应该要发⽣变化了；
- Action Creator：View要发送多少种消息，就会有多少种Action。如果都⼿写，会很麻烦，所以我们定义⼀个函数来⽣成Action，这个函数就叫Action Creator；
- Reducer：Store收到Action以后，必须给出⼀个新的State，这样View才会发⽣变化。这种State的计算过程就叫做Reducer。Reducer是⼀个函数，它接受Action和当前State作为参数，返回⼀个新的State；
- dispatch：是View发出Action的唯⼀⽅法。

然后我们过下整个⼯作流程：

1. ⾸先，⽤户（通过View）发出Action，发出⽅式就⽤到了dispatch⽅法；
2. 然后，Store⾃动调⽤Reducer，并且传⼊两个参数：当前State和收到的Action，Reducer会返回新的State；
3. State⼀旦有变化，Store就会调⽤监听函数，来更新View。

到这⼉为⽌，⼀次⽤户交互流程结束。可以看到，在整个流程中数据都是单向流动的，这种⽅式保证了流程的清晰。



一般来说，Redux 遵守下面三大原则：

- 单一数据源

在 Redux 中，所有的状态都放到一个 store 里面，一个应用中一般只有一个 store。

- State 是只读的

在 Redux 中，唯一改变 state 的方法是通过 dispatch 触发 action，action 描述了这次修改行为的相关信息。只允许通过 action 修改可以避免一些 mutable 的操作，保证状态不会被随意修改

- 通过纯函数来修改

为了描述 action 使状态如何修改，需要你编写 reducer 函数来修改状态。reducer 函数接收前一次的 state 和 action，返回新的 state。无论被调用多少次，只要传入相同的 `state 和 action，那么就一定返回同样的结果。

这三个原则使得 Redux 状态是可预测的，很容易实现时间旅行，但也带来了一些弊端，那就是上手难度比较高，模板代码太多，需要了解 `action、reducer、middleware 等概念。



### 适用场景

相比在组件里面手动去管理 `state`，Redux 将散落在组件里面的状态聚拢起来，形成了一颗大的 store 树。

修改 state 的时候需要通过发送 action 的形式，这种单向数据流的架构让状态变得容易预测，非常方便调试和时间旅行。想象一下，如果我的 state 可以被到处修改，我可能根本不知道这个 state 是哪里被修改的，后期维护起来直接爆炸。

但 Redux 并非银弹，它也有很多问题，尤其是为了这些优势做出了不少妥协。

1. 将副作用扔给中间件来处理，导致社区一堆中间件，学习成本陡然增加。比如处理异步请求的 Redux-saga、计算衍生状态的 reselect。
2. 需要书写太多的样板代码。比如我只是修改一下按钮状态，我就需要修改 actions、reducers、actionTypes 等文件，还要在 connect 的地方暴露给组件来使用。这对于后期维护也是一件很痛苦的事情。
3. reducer 中需要返回一个新的对象会造成心智负担。如果不返回新的对象或者更新的值过于深层，经常会发现我的 action 发送出去了，但为什么组件没有更新呢？

基于上面的优劣势，Redux 不适合用在小型项目中，开发成本往往比带来的收益还要更高。况且，最新的 React 已经支持了 `useReducer` 和 `useContext` 等 api，完全可以实现一个小型的 Redux 出来，就更加不需要 Redux 了。

总结，Redux 比较适合用于大型 Web 项目，尤其是一些交互足够复杂、组件通信频繁的场景，状态可预测和回溯是非常有价值的。



# react-redux是如何⼯作的？

- Provider: Provider的作⽤是从最外部封装了整个应⽤，并向connect模块传递store
- connect: 负责连接React和Redux
  - 获取state: connect通过context获取Provider中的store， 通过store.getState()获取整个store tree 上所有state
  - 包装原组件: 将state和action通过props的⽅式传⼊到原组件内部wrapWithConnect返回⼀个ReactComponent对象Connect，Connect重新render外部传⼊的原组件WrappedComponent，并把connect中传⼊的`mapStateToProps`, `mapDispatchToProps`与组件上原有的props合并后，通过属性的⽅式传给WrappedComponent
  - 监听store tree变化: connect缓存了store tree中state的状态,通过当前state状态和变更前state状态进⾏⽐较，从⽽确定是否调⽤ this.setState() ⽅法触发Connect及其⼦组件的重新渲染



