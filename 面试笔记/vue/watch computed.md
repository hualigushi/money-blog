computed：

①有缓存机制,当依赖的计算值没有发生改变时，computed会保持当前的值不变化

②不能接受参数；

③可以依赖其他computed，甚至是其他组件的data；

④不能与data/methds中的属性重复





watch：

①可接受两个参数；

②监听时可触发一个回调，并做一些事情；

③监听的属性必须是存在的；

④允许异步



watch配置：handler、deep（是否深度）、immeditate （是否立即执行）

总结：

当有一些数据需要随着另外一些数据变化时，建议使用computed

当有一个通用的响应数据变化的时候，要执行一些业务逻辑或异步操作的时候建议使用watch
