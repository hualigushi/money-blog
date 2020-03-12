## Vue 的定义
```
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
```

一个用 Function 实现的类，只能通过 new Vue 去实例化它

为何 Vue 不用 ES6 的 Class 去实现呢？我们往后看这里有很多 xxxMixin 的函数调用，并把 Vue 当参数传入，

它们的功能都是给 Vue 的 prototype 上扩展一些方法，Vue 按功能把这些扩展分散到多个模块中去实现，而不是在一个模块里实现所有，

这种方式是用 Class 难以实现的。这么做的好处是非常方便代码的维护和管理

## initGlobalAPI

Vue.js 在整个初始化过程中，除了给它的原型 prototype 上扩展方法，还会给 Vue 这个对象本身扩展全局的静态方法

## new Vue

`Vue.prototype._init = function () {}`

Vue 初始化主要就干了几件事情，合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化 data、props、computed、watcher 等等

## Vue 实例挂载

```
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function () {
  ...
  const { render, staticRenderFns } = compileToFunctions(template, {
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns
      
  return mount.call(this, el, hydrating)
}
```
Vue 不能挂载在 body、html 这样的根节点上。

所有 Vue 的组件的渲染最终都需要 render 方法，无论我们是用单文件 .vue 方式开发组件，还是写了 el 或者 template 属性，

最终都会转换成 render 方法，那么这个过程是 Vue 的一个“在线编译”的过程，它是调用 compileToFunctions 方法实现的

```
Vue.prototype.$mount = function (){
  ...
  return mountComponent(this, el, hydrating)
}
```
```
function mountComponent (){
  updateComponent = () => {
      vm._update(vm._render(), hydrating)
  }   
  new Watcher(vm, updateComponent, noop, {
      before () {
      if (vm._isMounted) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
}
```

mountComponent 核心就是先实例化一个渲染Watcher，在它的回调函数中会调用 updateComponent 方法，在此方法中调用 vm._render 方法先生成虚拟 Node，最终调用 vm._update 更新 DOM。

## 整个 vnode 树节点的插入顺序是先子后父
