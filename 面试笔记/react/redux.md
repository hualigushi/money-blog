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



# redux与mobx的区别？

两者对⽐：

- redux将数据保存在单⼀的store中，mobx将数据保存在分散的多个store中
- redux使⽤plain object保存数据，需要⼿动处理变化后的操作；mobx适⽤observable保存数据，数据变化后⾃动处理响应的操作
- redux使⽤不可变状态，这意味着状态是只读的，不能直接去修改它，⽽是应该返回⼀个新的状态，同时使⽤纯函数；mobx中的状态是可变的，可以直接对其进⾏修改

mobx相对来说⽐较简单，在其中有很多的抽象，mobx更多的使⽤⾯向对象的编程思维；redux会⽐较复杂，因为其中的函数式编程思想掌握起来不是那么容易，同时需要借助⼀系列的中间件来处理异步和副作⽤

- mobx中有更多的抽象和封装，调试会⽐较困难，同时结果也难以预测；⽽redux提供能够进⾏时间回溯的开发⼯具，同时其纯函数以及更少的抽象，让调试变得更加的容易

场景辨析：

- 基于以上区别，我们可以简单得分析⼀下两者的不同使⽤场景。
- mobx更适合数据不复杂的应⽤：mobx难以调试，很多状态⽆法回溯，⾯对复杂度⾼的应⽤时，往往⼒不从⼼。
- redux适合有回溯需求的应⽤：⽐如⼀个画板应⽤、⼀个表格应⽤，很多时候需要撤销、重做等操作，由于redux不可变的特性，天然⽀持这些操作。
- mobx适合短平快的项⽬：mobx上⼿简单，样板代码少，可以很⼤程度上提⾼开发效率。
- 当然mobx和redux也并不⼀定是⾮此即彼的关系，你也可以在项⽬中⽤redux作为全局状态管理，⽤mobx作为组件局部状态管理器来⽤。



# redux中如何进⾏异步操作？

- 当然，我们可以在componentDidmount中直接进⾏请求⽆须借助redux。
- 但是在⼀定规模的项⽬中，上述⽅法很难进⾏异步流的管理，通常情况下我们会借助redux的异步中间件进⾏异步处理。
- redux异步流中间件其实有很多，但是当下主流的异步中间件只有两种redux-thunk、redux-saga，当然redux-observable可能也有资格占据⼀席之地，其余的异步中间件不管是社区活跃度还是npm下载量都⽐较差了。



#### redux异步中间件之间的优劣？

redux-thunk优点：

- 体积⼩：redux-thunk的实现⽅式很简单，只有不到20⾏代码；
- 使⽤简单：redux-thunk没有引⼊像redux-saga或者redux-observable额外的范式，上⼿简单。

redux-thunk缺陷：

- 样板代码过多：与redux本身⼀样，通常⼀个请求需要⼤量的代码，⽽且很多都是重复性质的；
- 耦合严重：异步操作与redux的action偶合在⼀起，不⽅便管理；
- 功能孱弱：有⼀些实际开发中常⽤的功能需要⾃⼰进⾏封装。



redux-saga优点：

- 异步解耦：异步操作被被转移到单独saga.js中，不再是掺杂在action.js或component.js中；
- action摆脱thunk function: dispatch的参数依然是⼀个纯粹的 action (FSA)，⽽不是充满 “⿊魔法” thunk function；
- 异常处理：受益于 generator function 的saga实现，代码异常/请求失败都可以直接通过try/catch语法直接捕获处理；
- 功能强⼤：redux-saga提供了⼤量的Saga辅助函数和Effect创建器供开发者使⽤，开发者⽆须封装或者简单封装即可使⽤；
- 灵活：redux-saga可以将多个Saga可以串⾏/并⾏组合起来，形成⼀个⾮常实⽤的异步flow；
- 易测试，提供了各种case的测试⽅案，包括mock task，分⽀覆盖等等。

redux-saga缺陷：

- 额外的学习成本：redux-saga不仅在使⽤难以理解的generator function，⽽且有数⼗个API，学习成本远超reduxthunk，最重要的是你的额外学习成本是只服务于这个库的，与redux-observable不同，redux-observable虽然也有额外学习成本但是背后是rxjs和⼀整套思想；
- 体积庞⼤：体积略⼤，代码近2000⾏，min版25KB左右；
- 功能过剩：实际上并发控制等功能很难⽤到，但是我们依然需要引⼊这些代码；
- ts⽀持不友好：yield⽆法返回TS类型。
