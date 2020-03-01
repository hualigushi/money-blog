| Tables        | Are           | Cool  |
| ---------------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |


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