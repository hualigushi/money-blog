- `$route` 是“路由信息对象”，包括`path，params，hash，query，fullPath，matched，name`等路由参数。
- `$router` 是“路由实例”对象, 包括了路由的跳转方法，钩子函数等, 想要导航到不同URL，则使用`$router.push`方法



# 导航守卫

## 1.全局守卫
vue-router全局有三个守卫：
1. router.beforeEach 全局前置守卫 进入路由之前
2. router.beforeResolve 全局解析守卫(2.5.0+) 在beforeRouteEnter调用之后调用
3. router.afterEach 全局后置钩子 进入路由之后

## 2.路由独享守卫
beforeEnter

## 3.路由组件内的守卫
1. beforeRouteEnter 进入路由前, 在路由独享守卫后调用 不能 获取组件实例 this，组件实例还没被创建.

   可以通过给 next 传入一个回调来访问组件实例。在导航被确认时，会执行这个回调，这时就可以访问组件实例了.

   仅仅是 beforRouteEnter 支持给 next 传递回调，其他两个并不支持，因为剩下两个钩子可以正常获取组件实例 this

2. beforeRouteUpdate (2.2) 路由复用同一个组件时, 在当前路由改变，但是该组件被复用时调用 可以访问组件实例 this

3. beforeRouteLeave 离开当前路由时, 导航离开该组件的对应路由时调用，可以访问组件实例 this



如何通过路由将数据传入下一个跳转的页面呢？

答： params 和 query

params

```
传参
this.$router.push({
 name:"detail",
 params:{
   name:'xiaoming',
 }
});
接受
this.$route.params.name
```

query

```
传参
this.$router.push({
  path:'/detail',
  query:{
    name:"xiaoming"
  }
 })
接受 //接收参数是this.$route
this.$route.query.id  
```

那query和params什么区别呢？

① params只能用name来引入路由，query既可以用name又可以用path（通常用path）

② params类似于post方法，参数不会再地址栏中显示

query类似于get请求，页面跳转的时候，可以在地址栏看到请求参数





# 路由模式

- hash模式下，URL中会带有一个 `#` 号，history没有。
- history路由如果后端部署没有更改页面指向则会出现刷新和跳转404的问题，而hash路由却不会
- hash路由相对history兼容比较好。



hash  路由模式的实现主要是基于下面几个特性：

- URL 中 hash 值只是客户端的一种状态，也就是说当向服务器端发出请求时，hash 部分不会被发送；
- hash 值的改变，都会在浏览器的访问历史中增加一个记录。因此我们能通过浏览器的回退、前进按钮控制hash 的切换；
- 可以通过 a 标签，并设置 href 属性，当用户点击这个标签后，URL 的 hash 值会发生改变；或者使用  JavaScript 来对 loaction.hash 进行赋值，改变 URL 的 hash 值；
- 我们可以使用 hashchange 事件来监听 hash 值的变化，从而对页面进行跳转（渲染）。



history 路由模式的实现主要基于存在下面几个特性：

- pushState 和 repalceState 两个 API 来操作实现 URL 的变化 ；
- 我们可以使用 popstate  事件来监听 url 的变化，从而对页面进行跳转（渲染）；
- history.pushState() 或 history.replaceState() 不会触发 popstate 事件，这时我们需要手动触发页面跳转（渲染）。








# 原理

```
//                               获取新的组件 ------->  Render新组件
//                                   |
//                                   |
//                                   |
//                                   |
//                                   |
//                               获取current变量的监视者
//                                   |
//                                   |
//                                   |
//                                   |
// url改变---->触发监听时间---->改变vue-router里的current变量

class History {
  constructor () {
    this.current = null
  }
}
class myRouter {
  constructor(options) {
    this.mode = options || 'hash'
    this.history = new History()
    this.routes = options.routes || []
    this.routersMap = this.createMap(this.routes)
    this.init()
  }

  // 设置监听
  init() {
    if (this.mode === 'hash') {
      // 自动加上#
      location.hash ? '' : location.hash = '/'
      window.addEventListener('load', () => {
        this.history.current = location.hash.slice(1)
      })

      window.addEventListener('hashchange', () => {
        this.history.current = location.hash.slice(1)
      })
    } else {
      location.hash ? '' : location.hash = '/'
      window.addEventListener('load', () => {
        this.history.current = location.pathname
      })

      window.addEventListener('popstate', () => {
        this.history.current = location.pathname
      })
    }
  }

  // 数组转成对象
  createMap (router) {
    return router.reduce((memo, current) => {
      memo[current.path] = current.component
      return memo
    }, {})
  }
}

myRouter.install = function (Vue) {
  Vue.mixin({
    beforeCreate() {
      // this 指向当前组件的实例
      // router 指向下面实例的router
      // new Vue({
      //   router,
      //   store,
      //   render: h => h(App)
      // }).$mount('#app')
      if (this.$options && this.$options.router) {
        this._root = this
        this._router = this.$options.router
        // 设置监听，监听current
        Vue.util.defineReactive(this, 'current', this._router.history.current)
      } else { // 如果没有，向上查找
        this._root = this.$parent._root
      }

      // 对外暴露this.$route,但是不能修改$route和内部的变量
      Object.defineProperty(this, '$route', {
        get () {
          return this._root._router
        }
      })
    },
  })
  // current 更新，router-view也会更新，触发render方法，
  Vue.component('router-view', {
    render (h) {
      // 根据current的值渲染对应的组件

      // 如何根据当前的current,获取到对应的组件
      let current = this._self._root_router.history.current

      // 取出对应的component
      let routeMap = this._selft_root_router.routeMap
      return h(routeMap[current])
    }
  })
}
export default myRouter


// import Vue from 'vue'
// import VueRouter from 'vue-router'
// import Home from '../views/Home.vue'

// Vue.use(VueRouter)

// const routes = [
//   {
//     path: '/',
//     name: 'Home',
//     component: Home
//   },
//   {
//     path: '/about',
//     name: 'About',
//     // route level code-splitting
//     // this generates a separate chunk (about.[hash].js) for this route
//     // which is lazy-loaded when the route is visited.
//     component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
//   }
// ]

// const router = new VueRouter({
//   mode: 'history',
//   base: process.env.BASE_URL,
//   routes
// })

// export default router
```