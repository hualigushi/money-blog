1. vuex 就是一个仓库，仓库里放了很多对象。其中 state 就是数据源存放地，对应于一般 vue 对象里面的 data
2. state 里面存放的数据是响应式的，vue 组件从 store 读取数据，若是 store 中的数据发生改变，依赖这相数据的组件也会发生更新
3. 它通过 mapState 把全局的 state 和 getters 映射到当前组件的 computed 计算属性
4. 改变 store 中的状态的唯一途径就是显式地提交 (commit) mutation。这样使得我们可以方便地跟踪每一个状态的变化。

主要包括以下几个模块：

- State：定义了应用状态的数据结构，可以在这里设置默认的初始状态。
- Getter：允许组件从 Store 中获取数据，mapGetters 辅助函数仅仅是将 store 中的 getter 映射到局部计算属性。
- Mutation：是唯一更改 store 中状态的方法，且必须是同步函数。
- Action：用于提交 mutation，而不是直接变更状态，可以包含任意异步操作。
- Module：允许将单一的 Store 拆分为多个 store 且同时保存在单一的状态树中。



目前主要有两种数据会使用 vuex 进行管理：

1. 组件之间全局共享的数据
2. 通过后端异步请求的数据 比如做加入购物车、登录状态等都可以使用Vuex来管理数据状态。



#### Vuex中模块命名空间

通过export 导出模块，设置 `namespaced: true`来开启命名空间，这样模块就拥有自己的模块归属了，如：A模块中有一个action名称为test，则我们就可以通过 `a/test` 来找到它，避免Vuex的模块产生冲突。



#### Mutation 和 Action有什么区别

Mutation主要是用来改变state当中的数据，因此它主要作为一个中间人。它不支持异步，这样就可以被Vue监听，devtools就可以同步到它的记录。如果它是异步的，那么就很可能导致devtools无法同步它究竟什么时候发生改变。

而我们常用的方式是通过Action来提交Mutation，因为Action是一个异步的过程，所以这样做既保证了逻辑的异步调用，同时不破坏Mutation的记录良好。方便开发者调试。其实就是一个数据的交换过程。


# 使用 Vuex 只需执行 `Vue.use(Vuex)`，并在 Vue 的配置中传入一个 store 对象的示例，store 是如何实现注入的？

`Vue.use(Vuex)` 方法执行的是 install 方法，它实现了 Vue 实例对象的 init 方法封装和注入，

使传入的 store 对象被设置到 Vue 上下文环境的store中。

因此在VueComponent任意地方都能够通过this.store 访问到该 store。

# state 内部支持模块配置和模块嵌套，如何实现的？
在 store 构造方法中有 makeLocalContext 方法，所有 module 都会有一个 local context，根据配置时的 path 进行匹配。

所以执行如 dispatch('submitOrder', payload)这类 action 时，默认的拿到都是 module 的 local state，

如果要访问最外层或者是其他 module 的 state，只能从 rootState 按照 path 路径逐步进行访问。

# 在执行 dispatch 触发 action(commit 同理)的时候，只需传入(type, payload)，action 执行函数中第一个参数 store 从哪里获取的？
store 初始化时，所有配置的 action 和 mutation 以及 getters 均被封装过。

在执行如 dispatch('submitOrder', payload)的时候，actions 中 type 为 submitOrder 的所有处理方法都是被封装后的，其第一个参数为当前的 store 对象，

所以能够获取到 { dispatch, commit, state, rootState } 等数据。

# Vuex 如何区分 state 是外部直接修改，还是通过 mutation 方法修改的？
Vuex 中修改 state 的唯一渠道就是执行 `commit('xx', payload)` 方法，其底层通过执行 `this._withCommit(fn)` 设置_committing 标志变量为 true，

然后才能修改 state，修改完毕还需要还原_committing 变量。

外部修改虽然能够直接修改 state，但是并没有修改_committing 标志位，

所以只要 watch 一下 state，state change 时判断是否_committing 值为 true，即可判断修改的合法性。
