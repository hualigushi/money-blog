```
// app.js

// 创建Vue的实例
const app = new Vue({})

// 通过Vuex管理app中所有的数据
const store = new Vuex.Store({})

// 视图组件,不同的url访问不同的组件
const router = new Router({
    routes: [
        {path: '/p1', component: Page1},
        {path: '/p2', component: Page2},
        {path: '/p3', component: Page3},
    ]
})




// 后端项目中创建服务器入口文件
// entry-server.js
// 暴露出能拿到上下文对象的函数
export default context = {
    router.push(context。url) // 当前http请求的url地址放入router中

    // 通过Promise返回vue的实例app
    return Promise.all(router.getMatchedComponents().map( // 拿到当前url对应的哪些组件
        component => { // 对组件进行遍历
            if (component.fetchServerData) { // 判断组件是否需要请求服务器端数据
                return component.fetchServerDta(store) // 需要的话就把数据请求到
            }
        }
    )).then(() => {
        context.state = store.state // 组件数据全部拿到后，更新context上的状态
        return app
    })
}

// 客户端入口文件
// 把服务器端数据同步过来，把vue实例挂载到服务端渲染的dom上
store.replaceState(window.__INITISL_STATE__)
app.$mount('#app')
``` 