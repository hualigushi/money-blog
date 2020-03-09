1. 当组件初始化的时候，`computed`和`data`会分别建立各自的响应系统，`Observer`遍历data中每个属性设置`get/set`数据拦截

2. 初始化`computed`会调用`initComputed`函数

  1. 注册一个watcher实例，并在内实例化一个Dep消息订阅器用作后续收集依赖（比如渲染函数的watcher或者其他观察该计算属性变化的watcher）
  
  2. 调用计算属性时会触发其`Object.defineProperty`的get访问器函数
  
  3. 调用`watcher.depend()`方法向自身的消息订阅器dep的subs中添加其他属性的watcher
  
  4. 调用watcher的evaluate方法（进而调用watcher的get方法）让自身成为其他watcher的消息订阅器的订阅者，
     首先将watcher赋给Dep.target，然后执行getter求值函数，当访问求值函数里面的属性（比如来自data、props或其他computed）时，
     会同样触发它们的get访问器函数从而将该计算属性的watcher添加到求值函数中属性的watcher的消息订阅器dep中，
     当这些操作完成，最后关闭Dep.target赋为null并返回求值函数结果。

3. 当某个属性发生变化，触发set拦截函数，然后调用自身消息订阅器dep的notify方法，遍历当前dep中保存着所有订阅者wathcer的subs数组，并逐个调用watcher的 update方法，完成响应更新。
