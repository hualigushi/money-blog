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
  
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
```

mountComponent 核心就是先实例化一个渲染Watcher，在它的回调函数中会调用 `updateComponent` 方法，在此方法中调用 `vm._render` 方法先生成虚拟 Node，最终调用 `vm._update` 更新 DOM。

Watcher 在这里起到两个作用，一个是初始化的时候会执行回调函数，另一个是当 vm 实例中的监测的数据发生变化的时候执行回调函数

最后判断为根节点的时候设置 `vm._isMounted` 为 true， 表示这个实例已经挂载了，同时执行 mounted 钩子函数。 这里注意 `vm.$vnode` 表示 Vue 实例的父虚拟 Node，所以它为 Null 则表示当前是根 Vue 的实例。

## render 

`vm._render` 最终是通过执行 `createElement` 方法并返回的是 vnode，它是一个虚拟 Node。

```
Vue.prototype._render = function () {
  vnode = render.call(vm._renderProxy, vm.$createElement)
}
```
```
export function initRender (vm: Component) {
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
}
```
## createElement
```
function createElement (){
  return _createElement(context, tag, data, children, normalizationType)
}
```
```
function _createElement (){
  vnode = new VNode(
    config.parsePlatformTagName(tag), data, children,
    undefined, undefined, context
  )
    
  vnode = createComponent(tag, data, context, children)
}
```
每个 VNode 有 children，children 每个元素也是一个 VNode，这样就形成了一个 VNode Tree，它很好的描述了我们的 DOM Tree。

## update

```
Vue.prototype._update = function () {
  vm.$el = vm.__patch__(prevVnode, vnode)
}
```
`Vue.prototype.__patch__ = inBrowser ? patch : noop`

```
const modules = platformModules.concat(baseModules)

export const patch: Function = createPatchFunction({ nodeOps, modules })
```
```
function createPatchFunction () {
  return function patch (oldVnode, vnode, hydrating, removeOnly) {
    // create new node
     createElm(
        vnode,
        insertedVnodeQueue,
        oldElm._leaveCb ? null : parentElm,
        nodeOps.nextSibling(oldElm)
      )
   invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
   return vnode.elm
  }
}
```

createPatchFunction 内部定义了一系列的辅助方法，最终返回了一个 patch 方法，这个方法就赋值给了 `vm._update` 函数里调用的 `vm.__patch__`

```
<div>{{message}}</div>

var app = new Vue({
  el: '#app',
  render: function (createElement) {
    return createElement('div', {
      attrs: {
        id: 'app'
      },
    }, this.message)
  },
  data: {
    message: 'Hello Vue!'
  }
})
```
通过例子调试源码

整个 vnode 树节点的插入顺序是先子后父

## createComponent
```
if (typeof tag === 'string') {}else {
   vnode = createComponent(tag, data, context, children)
}


function createComponent (){
  const baseCtor = context.$options._base // baseCtor 指向 Vue 
  
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor) // 构造子类构造函数
  }
  
  installComponentHooks(data)
  
  // return a placeholder vnode
  const name = Ctor.options.name || tag
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )
  
  return vnode
}
```
组件渲染3 个关键步骤：

构造子类构造函数，安装组件钩子函数和实例化 vnode

## patch 
```
<div></div>

let App = {
  template: '<div>Hello World</div>
}


let vm = new Vue({
  el: '#app',
  render: h => h(App)
})
```
通过例子调试源码

createElm -> createComponet -> init钩子 -> createComponentInstanceForVnode -> 子组件构造函数 Vue.protetype._init -> initInternalComponent -> vm_render -> vm._update -> patch 
