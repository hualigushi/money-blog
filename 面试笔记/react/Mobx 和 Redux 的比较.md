Redux 认为，数据的一致性很重要，为了保持数据的一致性，要求Store 中的数据尽量范式化，也就是减少一切不必要的冗余，为了限制对数据的修改，要求 Store 中数据是不可改的（Immutable），只能通过 action 触发 reducer 来更新 Store。

Redux三原则：

- 单一数据源：整个应用的state被存储在一个object tree 中，并且这个object tree 只存在唯一一个store中
- 纯函数Reducer： 为了描述Action如何改变状态书，需要编写一个纯函数的Reducer
- state是只读的：唯一可改变state的方法就是触发Action,Action是用于描述已发生事件的普通对象

这三大原则使redux调试工具实现了时间回溯功能，通过录制回放Action,可以完整重现整个应用的操作路径





Mobx 也认为数据的一致性很重要，但是它认为解决问题的根本方法不是让数据范式化，而是不要给机会让数据变得不一致。

所以，Mobx 鼓励数据干脆就“反范式化”，有冗余没问题，只要所有数据之间保持联动，改了一处，对应依赖这处的数据自动更新，那就不会发生数据不一致的问题。

Mobx是通过监听数据的属性变化直接在数据上更改来触发UI的渲染

Mobx的监听方式：

- 在Mobx 5 之前采用Object.defineProperty
- 在Mobx 5 以后采用Proxy 方案



虽然 Mobx 最初的一个卖点就是直接修改数据，但是实践中大家还是发现这样无组织无纪律不好，所以后来 Mobx 还是提供了 action 的概念。

和 Redux 的 action 有点不同，Mobx 中的 action 其实就是一个函数，不需要做 dispatch ，调用就修改对应数据





总结一下 Redux 和 Mobx 的区别，包括这些方面：


- Redux 鼓励一个应用只用一个 Store，Mobx 鼓励使用多个 Store；


- Redux 使用“拉”的方式使用数据，这一点和 React是一致的，但 Mobx 使用“推”的方式使用数据，和 RxJS 这样的工具走得更近；


- Redux 鼓励数据范式化，减少冗余，Mobx 容许数据冗余，但同样能保持数据一致。
