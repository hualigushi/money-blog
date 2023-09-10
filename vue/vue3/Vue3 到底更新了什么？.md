[TOC]

## 一、Composition API

使用传统的option配置方法写组件的时候问题，随着业务复杂度越来越高，代码量会不断的加大；由于相关业务的代码需要遵循option的配置写到特定的区域，导致后续维护非常的复杂，同时代码可复用性不高，而composition-api就是为了解决这个问题而生。

### **「1.1 Options API 的问题」**

使用传统OptionsAPI时，新增或者修改一个需求，就需要分别在data，methods，computed里修改 。当业务逻辑和功能越来越多的时候理解和维护复杂组件变得困难。

![图片](https://mmbiz.qpic.cn/mmbiz_gif/3xDuJ3eiciblnTtibjia05DgbZdUaukBjZqIV9IE6DrCuzvSXicAY7nicXjyiceNHfsBcsSbziaaLv1PeH6I3nddwtrW2Q/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

### **「1.2 Composition API 的优势」**

而Vue3 的组合式 API 将每个功能点抽成一个function使我们可以更加优雅的组织我们的代码。让相关功能的代码更加有序的组织在一起。

![图片](https://mmbiz.qpic.cn/mmbiz_gif/3xDuJ3eiciblnTtibjia05DgbZdUaukBjZqIjGP2E42G5ZIGHUwfPSo61eaeoj2aEWVVUnehTKSdH07AuAeFJRwmkA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

### **「1.3 reactive对比ref」**

在 vue2.x 中，数据都是定义在`data`中。但是 Vue3.x 可以使用`reactive`和`ref`来进行数据定义。那么ref和reactive他们有什么区别呢?

- 从原理角度对比：

- - ref用来创建一个包含响应式的数据的引用对象

接收数据可以是：基本数据类型、对象类型

基本类型的数据：响应式依然是靠object.defineProperty()的get与set完成的

对象类型：内部求助vue3.0中一个新函数reactive函数通过proxy实现

![图片](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eiciblnTtibjia05DgbZdUaukBjZqIaUx9LnbT02B1g1ZM0Xdb3JuWQTzroycOVN3zcmspbAGBMTxGOGCdKQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

源码地址：https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/ref.ts

- - reactive用来定义：对象和数组通过使用Proxy来实现响应式（数据劫持）, 并通过Reflect操作源对象内部的数据。

- 从使用角度对比：

- - ref定义的数据：操作数据需要`.value`，读取数据时模板中不需要`.value`直接使用即可。

- - reactive定义的数据：操作数据与读取数据：均不需要`.value`。

### 1.4 新增 `watchEffect` 函数

- `watch` 函数需要指明监视的属性，并在回调函数中执行。默认情况仅在侦听的源数据变更时才执行回调。也可以加上`immediate: true`来使其立即生效
- watchEffect不用指明监视哪个属性，监视的回调中用到哪个属性，就监视哪个属性。

```js
//watchEffect所指定的回调中用到的数据只要发生变化，则直接重新执行回调。

watchEffect(()=>{
   const x1 = sum.value
    const x2 = person.age
    console.log('watchEffect执行了回调')
})
```

## 二、重写 VDOM

优化前`Virtual Dom`的`diff`算法，需要遍历所有节点，而且每一个节点都要比较旧的props和新的props有没有变化。在Vue3.0中，只有带`PatchFlag`的节点会被真正的追踪，在后续更新的过程中，Vue不会追踪静态节点，只追踪带有`PatchFlag`的节点来达到加快渲染的效果。

```js
<div>
    <span>vue</span>
    <span>{{msg}}</span>
    <span :id= hello  class= bar >{{msg}}</span>
</div>
export function render(_ctx，_cache，$props, $setup，$data，$options){
    return (_openBlock(),_createBlock(  span ,null,[
    _createVNode( span ,null, vue ),
    _createVNode( span ,null,_toDisplayString(_ctx.msg), 1 /* TEXT */),
    _createVNode( span ,{
        id: _ctx,hello
        class:  bar 
    },_toDisplayString(_ctx.msg),9 /* TEXT, PROPS */, [ id ])

}
```

上面的源码中`1 /* TEXT */`这个标记就是 `PatchFlag`，Vue只会追踪第二个和第三个带有`PatchFlag`的节点。

在第三个span标签中`PatchFlag`变成了 `9 /* TEXT, PROPS */, [ id ]`，提示我们这个dom元素中不仅有`TEXT`的变化，`PROPS`也可能会变化，后边数组中的内容则是有可能发生变化的属性。而静态添加的class没有被标记是因为 dom 元素的静态属性在渲染的时候就已经创建了，并且是不会变动的。在后面进行更新的时候，diff 算法是不会去管它的。

## 三、响应式实现

### 3.1 Vue2.x 的响应式

- vue官方文档：https://cn.vuejs.org/v2/guide/reactivity.html

- 实现原理：

- - 对象类型：通过`Object.defineProperty()`对属性的读取、修改进行拦截（数据劫持）。
  - 数组类型：通过重写更新数组的一系列方法来实现拦截。（对数组的变更方法进行了包裹）。

```js
Object.defineProperty(data, 'count', {
    get () {}, 
    set () {}
})
```

- 存在问题：

- - 新增属性、删除属性, 界面不会更新。
  - 无法监听数组下标和length长度的变化。
  - 不支持 Map、Set、WeakMap 和 WeakSet。

### 3.2 Vue3.0 的响应式

- 实现原理:

- - Proxy：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy

- - Reflect：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect

- - 通过Proxy（代理）: 拦截对象中任意属性的变化——属性值的读写、属性的添加、属性的删除等。
  - 通过Reflect（反射）: 对源对象的属性进行操作。
  - MDN文档中对Proxy与Reflect描述：

```js
new Proxy(data, {
        // 拦截读取属性值
    get (target, prop) {
            return Reflect.get(target, prop)
    },
    // 拦截设置属性值或添加新属性
    set (target, prop, value) {
            return Reflect.set(target, prop, value)
    },
    // 拦截删除属性
    deleteProperty (target, prop) {
            return Reflect.deleteProperty(target, prop)
    }
})

proxy.name = 'tom'   
```

## 四、新的生命周期钩子

- 去掉了vue2.0中的 beforeCreate 和 created 两个阶段，新增了一个`setup`。执行`setup` 时，组件实例尚未被创建。
- 每个生命周期函数必须导入才可以使用，并且所有生命周期函数需要统一放在 `setup` 里使用。
- `destroyed` 销毁后被重命名为 `unmounted`卸载后；`beforeDestroy` 销毁前生命周期选项被重命名为 `beforeUnmount`卸载前。

![图片](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eiciblnTtibjia05DgbZdUaukBjZqIW9CiciaJ5opnk5iacgNrMDN13M6xhdXIWmpIemMkrsmbTSpNUFG43RRKg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

## 五、新的组件

### **「5.1 片段（Fragment）」**

- Vue2: 组件必须有一个根标签

```html
<template>
    <div>
        <span></span>
        <span></span>
    </div>
</template>
```

- Vue3: 组件可以没有根标签, 可以直接写多个根节点,内部会将多个标签包含在一个Fragment虚拟元素中

```html
<template>
    <span></span>
    <span></span>
</template>
```

- 好处: 减少标签层级, 减小内存占用，提升了渲染性能

### 5.2 Teleport

`Teleport` 就像是一个「任意门」，将包裹组件html结构传送到任何指定的地方。

例如我们日常开发中经常会使用到弹窗组件，Dialog组件会被渲染到一层层子组件内部，处理样式、定位都变得十分困难。

这时我们希望将组件挂载在body上面，来更方便的控制Dialog的样式。

简单来说,我们既希望继续在组件内部使用Dialog,又希望渲染的 DOM 结构不嵌套在组件内部的 DOM 中。

就可以用到`<Teleport>`, 它可以在**「不改变组件内部元素父子关系」**的情况下,建立一个传送门将Dialog渲染的内容传送到body上面。

```html
<teleport to= body >
<div v-if= isShow  class= dialog >
    <div class= dialog >
        <h3>弹窗</h3>
        <button @click= isShow = false >关闭弹窗</button>
    </div>
</div>
</teleport>
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eiciblnTtibjia05DgbZdUaukBjZqIUtlPJyxLnic5wZKAYm4T3WAbCr3AapT8fZro9icsUcMeuVialic28Hfic9A/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 5.3 Suspense

- 等待异步组件时渲染一些额外内容，让应用有更好的用户体验
- 它提供两个`template slot`, 刚开始会渲染一个 `fallback`插槽下的内容， 直到到达某个条件后才会渲染 `default` 插槽的正式内容， 通过使用`Suspense`组件进行展示异步渲染更加简单。

```html
<template>
    <div class= app >
        <h3>我是App组件</h3>
        <Suspense>
            <template v-slot:default>
                <NewSuspense/>
            </template>
            <template v-slot:fallback>
                <h3>加载中.....</h3>
            </template>
        </Suspense>
    </div>
</template>
```