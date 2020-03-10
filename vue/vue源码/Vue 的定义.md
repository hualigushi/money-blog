Runtime + Compiler 构建出来的 Vue.js

⼊⼝是 src/platforms/web/entry-runtime-with-compiler.js

# Vue的定义

`src/core/instance/index.js`中定义Vue

```
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
```

⼀个⽤ Function 实现的类，我们只能通过new Vue 去实例化它

为何 Vue 不⽤ ES6 的 Class 去实现呢？

我们往后看这⾥有很多 xxxMixin的函数调⽤，并把 Vue 当参数传⼊，它们的功能都是给 Vue 的 prototype 上扩展⼀些⽅法，

Vue 按功能把这些扩展分散到多个模块中去实现，⽽不是在⼀个模块⾥实现所有，这种⽅式是⽤ Class 难以实现的。

这么做的好处是⾮常⽅便代码的维护和管理

# initGlobalAPI

```
src/core/index.js 调用

initGlobalAPI(Vue)
```

`src/core/global-api/index.js` 中实现

Vue.js 在整个初始化过程中，除了给它的原型 prototype 上扩展⽅法，还会给 Vue 这个对象本⾝扩展
全局的静态⽅法