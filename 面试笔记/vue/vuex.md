1. vuex 就是一个仓库，仓库里放了很多对象。其中 state 就是数据源存放地，对应于一般 vue 对象里面的 data

2. state 里面存放的数据是响应式的，vue 组件从 store 读取数据，若是 store 中的数据发生改变，依赖这相数据的组件也会发生更新

3. 它通过 mapState 把全局的 state 和 getters 映射到当前组件的 computed 计算属性

目前主要有两种数据会使用 vuex 进行管理：

1. 组件之间全局共享的数据
2. 通过后端异步请求的数据 比如做加入购物车、登录状态等都可以使用Vuex来管理数据状态。



#### Vuex中模块命名空间

通过export 导出模块，设置 `namespaced: true`来开启命名空间，这样模块就拥有自己的模块归属了，如：A模块中有一个action名称为test，则我们就可以通过 `a/test` 来找到它，避免Vuex的模块产生冲突。



#### Mutation 和 Action有什么区别

Mutation主要是用来改变state当中的数据，因此它主要作为一个中间人。它不支持异步，这样就可以被Vue监听，devtools就可以同步到它的记录。如果它是异步的，那么就很可能导致devtools无法同步它究竟什么时候发生改变。

而我们常用的方式是通过Action来提交Mutation，因为Action是一个异步的过程，所以这样做既保证了逻辑的异步调用，同时不破坏Mutation的记录良好。方便开发者调试。其实就是一个数据的交换过程。