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



# react-redux是如何⼯作的？

- Provider: Provider的作⽤是从最外部封装了整个应⽤，并向connect模块传递store
- connect: 负责连接React和Redux
  - 获取state: connect通过context获取Provider中的store， 通过store.getState()获取整个store tree 上所有state
  - 包装原组件: 将state和action通过props的⽅式传⼊到原组件内部wrapWithConnect返回⼀个ReactComponent对象Connect，Connect重新render外部传⼊的原组件WrappedComponent，并把connect中传⼊的`mapStateToProps`, `mapDispatchToProps`与组件上原有的props合并后，通过属性的⽅式传给WrappedComponent
  - 监听store tree变化: connect缓存了store tree中state的状态,通过当前state状态和变更前state状态进⾏⽐较，从⽽确定是否调⽤ this.setState() ⽅法触发Connect及其⼦组件的重新渲染




