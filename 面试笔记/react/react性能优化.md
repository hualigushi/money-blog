由于react中性能主要耗费在于update阶段的diff算法，因此性能优化也主要针对diff算法。

1. 减少diff算法触发次数

​		A、 setState机制在正常运行时，由于批更新策略，已经降低了update过程的触发次数。
因此，setState优化主要在于非批更新阶段中(timeout/Promise回调)，减少setState的触发次数。
常见的业务场景即处理接口回调时，无论数据处理多么复杂，保证最后只调用一次setState。

​		B、父组件的render必然会触发子组件进入update阶段（无论props是否更新）。此时最常用的优化方案即为shouldComponentUpdate方法。最常见的方式为进行this.props和this.state的浅比较来判断组件是否需要更新。或者直接使用PureComponent，原理一致。需要注意的是，父组件的render函数如果写的不规范，将会导致上述的策略失效。

​		C、使用shouldComponentUpdate钩子，根据具体的业务状态，减少不必要的props变化导致的渲染。如一个不用于渲染的props导致的update。
另外， 也要尽量避免在shouldComponentUpdate 中做一些比较复杂的操作， 比如超大数据的pick操作等。
合理设计state，不需要渲染的state，尽量使用实例成员变量。

2. 正确使用diff算法

​	不使用跨层级移动节点的操作。

​	对于条件渲染多个节点时，尽量采用隐藏等方式切换节点，而不是替换节点。

​	尽量避免将后面的子节点移动到前面的操作，当节点数量较多时，会产生一定的性能问题。

性能检测工具
React官方提供的：React.addons.Perf
