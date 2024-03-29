[TOC]

### 一、开场白

我个人认为性能优化可以从三个方面来进行，一是代码层面的优化，二是项目打包的优化，三是项目部署的优化。



### 二、代码层面的优化

#### 1、利用v-if和v-show减少初始化渲染和切换渲染的性能开销

在页面加载时，利用v-if来控制组件仅在首次使用时渲染减少初始化渲染，随后用v-show来控制组件显示隐藏减少切换渲染的性能开销。

也许上面描述不够清楚，下面用一个实例来加深印象。

iview弹窗组件大家很经常用吧，弹窗组件是用v-show来控制其显示和隐藏，那么在页面加载时，弹窗组件（包括里面的内容）是会被初始化渲染的，如果一个页面中只有一个弹窗组件，不会对性能造成影响，但是假如一个页面中有几十个弹窗组件，会不会影响到性能，大家可以做一个右键菜单去试一下。

ps: 偷偷告诉大家，element弹窗组件初次渲染时，弹窗body里面的内容不会被渲染的。

下面用代码来实现一下。

```xml
<template>
    <div>
        <Button type="primary" @click.native="add">添加</Button>
        <add v-model="add.show" v-bind="add"></add>
    </div>
</template>
<script>
export default{
    data(){
        return{
            add:{
                show:false,
                init:false
            }
        }
    },
    components:{
        add:() =>import('./add.vue')
    },
    methods:{
        add(){
            this.add.show=true;
            this.add.init=true
        }
    }
}
</script>
```

```html
<template>
    <div v-if="init">
        <Modal v-model="show" title="添加" @on-cancel="handleClose"></Modal>
    </div>
</template>
<script>
export default{
    props:{
        value:{
            type:Boolean,
            default:false
        },
        init:{
            type:Boolean,
            default:false
        }
    },
    data(){
        return{
            show:false,
        }
    },
    watch:{
        value(val){
            if(val){
                this.show = val;
            }
        }  
    },
    methods:{
        handleClose(val) {
            this.$emit('input', val);
        },
    }
}
</script>
```



**原理：**

> `v-if`绑定值为false时，初始渲染时，**不会**渲染其条件块。

> `v-if`绑定值，在true和false之间切换时，**会**销毁和重新渲染其条件块。

> `v-show`绑定值不管为true还是为false，初始渲染时，总是**会**渲染其条件块。

> `v-show`绑定值，在true和false之间切换时，**不会**销毁和重新渲染其条件块，只是用`display:none`样式来控制其显示隐藏。

#### 2、computed、watch、methods区分使用场景

对于有些需求，computed、watch、methods都可以实现，但是还是要区分一下使用场景。用错场景虽然功能实现了但是影响了性能。

- computed
  - 一个数据受多个数据影响的。
  - 该数据要经过性能开销比较大的计算，如它需要遍历一个巨大的数组并做大量的计算才能得到，这时就可以利用`computed`的缓存特性，只有它计算时依赖的数据发现变化时才会重新计算，否则直接返回缓存值。
- watch
  - 一个数据影响多个数据的。
  - 当数据变化时，需要执行异步或开销较大的操作时。如果数据变化时请求一个接口。
- methods
  - 希望数据是实时更新，不需要缓存。

#### 3、提前处理好数据解决v-if和v-for必须同级的问题

因为当Vue处理指令时，`v-for`比`v-if`具有更高的优先级，意味着`v-if` 将分别重复运行于每个`v-for`循环中。

可以在computed中提前把要`v-for`的数据中`v-if`的数据项给过滤处理了。

```xml
//userList.vue
<template>
    <div>
        <div v-for="item in userList" :key="item.id" v-if="item.age > 18">{{ item.name }}</div>
    </div>
</template>
```

```js
//userList.vue
<template>
    <div>
        <div v-for="item in userComputedList" :key="item.id">{{ item.name }}</div>
    </div>
</template>
export default {
    computed:{
        userComputedList:function(){
            return this.userList.filter(function (item) {
                return item.age > 18
            })
        }
    }
}
```

也许面试官还会为什么`v-for`比`v-if`具有更高的优先级？这个问题已经涉及到原理层次，如果这个也会回答，会给面试加分不少。

上面说到 “`v-if`将分别重复运行于每个`v-for`循环中”，这个过程只有在渲染页面时才有，而Vue最终是通过render函数来渲染页面的，先把组件编译生成的render打印出来。

```xml
//home.vue
<script>
import userList from './userList'
console.log(userList.render)
</script>
```

打印出来的内容如下所示

```javascript
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    _vm._l(_vm.userList, function(item) {
      return item.age > 18
        ? _c("div", { key: item.id }, [_vm._v(_vm._s(item.name))])
        : _vm._e()
    }),
    0
  )
}
var staticRenderFns = []
render._withStripped = true
export { render, staticRenderFns }
复制代码
```

其中`_l`方法是`v-for`指令通过`genFor`函数生成的renderList方法，`item.age > 18? `是`v-if`指令通过`genIf`函数生成的三元运算符的代码，`_v`方法是createTextVNode方法用来创建文本节点，`_e`方式是createEmptyVNode方法用来创建空节点。到这里是不是已经很清楚，`v-if`运行在每个`v-for`中。

归根到底还是在生成render函数中，导致`v-for`比`v-if`具有更高的优先级，我们去render函数的生成过程中看一下。

Vue提供了2个版本，一个是Runtime + Compiler 的，一个是 Runtime only 的，前者是包含编译代码的，可以把编译过程放在运行时做，后者是不包含编译代码的，需要借助 webpack 的 vue-loader 事先把模板编译成 render函数。

这里不研究vue-loader，所以用Runtime + Compiler来研究，也是用CDN引入Vue.js，此时Vue的入口在*src/platforms/web/entry-runtime-with-compiler.js*中。

```ini
const vm = new Vue({
    render: h => h(App)
}).$mount('#app')
```

Vue实例是通过`$mount`挂载到DOM上。在入口文件中寻找`$mount`方法，在其方法中再找`render`字段，发现以下代码

```js
const { render, staticRenderFns } = compileToFunctions(template, {
    outputSourceRange: process.env.NODE_ENV !== 'production',
    shouldDecodeNewlines,
    shouldDecodeNewlinesForHref,
    delimiters: options.delimiters,
    comments: options.comments
}, this)
options.render = render
options.staticRenderFns = staticRenderFns
```

说明render函数是通过compileToFunctions方法生成，再去寻找compileToFunctions方法在哪里。

compileToFunctions方法在*src/platforms/web/compiler/index.js*中定义。

```arduino
const { compile, compileToFunctions } = createCompiler(baseOptions)
export { compile, compileToFunctions }
```

compileToFunctions方法又是createCompiler方法生成的，继续寻找createCompiler方法。

createCompiler方法在*src/compiler/index.js*中定义。

```scss
export const createCompiler = createCompilerCreator(
    function baseCompile(template,options) {
        const ast = parse(template.trim(), options)
        if (options.optimize !== false) {
            optimize(ast, options)
        }
        const code = generate(ast, options)
        return {
            ast,
            render: code.render,
            staticRenderFns: code.staticRenderFns
        }
})
```

在上面代码中可以看到，render是code中的render，而code是generate方法生成的。

在这里额外提一下ast是什么，就是由tempalte生成的语法书，在执行generate方法前执行以下几个逻辑

- 解析模板字符串生成 ast `const ast = parse(template.trim(), options)`。
- 优化语法树 `optimize(ast, options)`。
- 生成render函数代码`const code = generate(ast, options)`。

继续寻找generate方法，其在*src/compiler/codegen/index.js*中定义。

```arduino
export function generate (ast,options){
    const state = new CodegenState(options)
    const code = ast ? genElement(ast, state) : '_c("div")'
    return {
        render: `with(this){return ${code}}`,
        staticRenderFns: state.staticRenderFns
    }
}
```

发现code是genElement方法生成的，继续寻找genElement方法，其实这里已经解决根本原因了，给出几行关键代码。

```scss
export function genElement(el,state){
    if(){
    //...
    }else if (el.for && !el.forProcessed) {
        return genFor(el, state)
    } else if (el.if && !el.ifProcessed) {
        return genIf(el, state)
    } 
}
```

由上述代码可以看出，el.for就是`v-for`，el.if就是`v-if`，el.for先于el.if判断执行，所以`v-for`比`v-if`具有更高的优先级。

另外在genFor方法最后面会继续调用genElement方法，形成一级一级往下执行。

```javascript
return `${altHelper || '_l'}((${exp}),` +
    `function(${alias}${iterator1}${iterator2}){` +
    `return ${(altGen || genElement)(el, state)}` +
'})'
```

> 把寻找原因的整个思路都写出来，就是让小伙伴在看面试题时不要死记硬背，要去理解，可以按照上面的思路，自己去阅读源码找一下原因。毕竟阅读源码能力也是可以为面试加分的。

#### 4、给v-for循环项加上key提高diff计算速度

一旦你给面试官讲了此项优化，你要做好被面试官深入提问的准备如以下两个问题。

- 为什么加key会提高diff计算速度。

  经过旧头新头、旧尾新尾、旧头新尾、旧尾新头四次交叉比对后，都没有匹配到值得比对的节点，这时如果新节点有key的话。可以通过map直接获得值得对比的旧节点的下标，如果没有key的话，就要通过循环旧节点数组用sameVnode方法判断新节点和该旧节点是否值得比较，值得就返回该旧节点的下标。显然通过map比通过循环数组的计算速度来的快。

- 什么是diff计算。

  对于渲染watcher触发时会执行`vm._update(vm._render(), hydrating)`，在`vm._undata`方法中会调用`vm.__patch__`，而`vm.__patch__`指向patch方法，diff计算是指在调用patch方法开始，用sameVnode方法判断节点是否值得比较，若不值得直接新节点替换旧节点后结束。值得对比进入patchVnode方法，分别处理一下几种情况，若新旧节点都有文本节点，新节点下的文本节点直接替换旧节点下的文本节点，如果新节点有子节点，旧节点没有子节点，那么直接把新节点查到旧节点的父级中，如果新节点没有子节点，旧节点有子节点，那么旧节点的父级下的子节点都删了。如果新旧节点都有子节点，进入updateChildren方法，通过旧头新头、旧尾新尾、旧头新尾、旧尾新头四次交叉比对，如果值得对比再进入patchVnode方法，如果都不值得对比，有key用map获得值得对比的旧节点，没有key通过循环旧节点获得值得对比的旧节点。当新节点都对比完，旧节点还没对比完，将还没对比完的旧节点删掉。当旧节点都对比完，新节点还没对比完，将新节点添加到最后一个对比过的新节点后面，完成diff计算。

这两个问题是可以连续提问，一旦你答出第一个问题，可能会被继续深入提问第二个问题。

以下是详细过程，面试中也不可能表述那么详细。主要是提供给大家理解用。

首先介绍一下什么diff计算，diff计算就是对比新旧虚拟DOM（virtual DOM），virtual DOM是将真实的DOM的数据抽取出来，以对象的形式模拟树形结构，再说简白一点，diff计算就是对两个对象进行对比。

在采取diff算法比较新旧节点的时候，比较只会在同层级进行, 不会跨层级比较。 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2434e64f4e114b66a506229959e54c5e~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) 先上步骤图，可以先看图，再看文字介绍 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3855e292967441f3b9d28e3cb6e341c7~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5f6a50d6a3614a4ca366a138684f8bb3~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) ![img](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/213b5ca1a7fb4a089b13c8734d6bd522~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) ![img](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e4c54942bc1f4ce8b71892e299979b52~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) ![img](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/472639c8f3394f4994afcc9ad626f0ac~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5169774f27f349e58974aeead903b7ae~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) 每次对比的逻辑大概如下所示

- 1、在patch方法内，用sameVnode判断新旧节点是否值得比较。
- 2、如果不值得比较，直接在旧节点的父级中添加新节点，然后删除旧节点，退出对比。
- 3、如果值得比较，调用patchVnode方法。
- 4、如果新旧节点是否完全相等，如果是，退出对比。
- 5、如果不是，找到对应的真实DOM，记为el。
- 6、如果新旧节点都有文本节点并且不相等，那么将el的文本节点设置为新节点的文本节点，退出对比。
- 7、如果新节点有子节点，旧节点没有子节点，则将新节点的子节点生成真实DOM后添加到el中，退出对比。
- 8、如果新节点没有子节点，旧节点有子节点，则删除el的子节点，退出对比。
- 9、如果新节点和旧节点都有子节点，则开始对比它们的子节点，用的是updateChildren方法。
- 10、将旧节点的子节点记为`oldCh`是个数组,其头部用`oldCh[oldStartIdx]`获取记为`oldStartVnode`，`oldStartIdx`初始为0。其尾部用`oldCh[oldEndIdx]`获取记为`oldEndVnode`，`oldEndIdx`初始为`oldCh.length - 1`。
- 11、将旧节点的子节点记为`newCh`是个数组,其头部用`newCh[newStartIdx]`获取记为`newStartVnode`，`newStartIdx`初始为0。其尾部用`newCh[newEndIdx]`获取记为`newEndVnode`，`newEndIdx`初始为`newCh.length - 1`。
- 12、将旧子节点的头部和新子节点的头部，简称旧头和新头用sameVnode判断是否值得比较。
- 13、如果值得比较，调用patchVnode方法，重新执行第3步。同时用`oldCh[++oldStartIdx]`重新获取旧子节点头部，用`newCh[++newStartIdx]`重新获取新子节点头部。
- 14、如果不值得比较，将旧子节点的尾部和新子节点的尾部，简称旧尾和新尾用sameVnode判断是否值得比较。
- 15、如果值得比较，调用patchVnode方法，重新执行第3步。同时用`oldCh[--oldEndIdx]`重新获取旧子节点尾部，重新用`newCh[--newEndIdx]`获取新子节点尾部。
- 16、如果不值得比较，将旧子节点的头部和新子节点的尾部，简称旧头和新尾用sameVnode判断是否值得比较。
- 17、如果值得比较，调用patchVnode方法，重新执行第3步。同时将旧子节点的头部`oldStartVnode`对应的真实DOM移动到旧子节点的尾部`oldEndVnode`对应的真实DOM后面。同时用`oldCh[++oldStartIdx]`重新获取旧子节点头部，用`newCh[--newEndIdx]`重新获取新子节点尾部。
- 18、如果不值得比较，将旧子节点的尾部和新子节点的头部，简称旧尾和新头用sameVnode判断是否值得比较。
- 19、如果值得比较，调用patchVnode方法，重新执行第3步。同时将旧子节点的尾部`oldEndVnode`对应的真实DOM移动到旧子节点的头部`oldStartVnode`对应的真实DOM后面。同时用`oldCh[--oldEndIdx]`重新获取旧子节点尾部，用`newCh[++newStartIdx]`重新获取新子节点头部。
- 20、如果不值得比较，如果旧子节点有key，可以用createKeyToOldIdx方法获得以旧子节点的key为健，其下标为值的map结构,记为`oldKeyToIdx`。
- 21、如果新子节点的头部`newStartVnode`有key属性，直接通过`oldKeyToIdx[newStartVnode.key]`获取对应的下标`idxInOld`。
- 22、如果新子节点的头部`newStartVnode`没有key属性，要用过findIdxInOld方法，找到值得对比的旧子节点对应的下标`idxInOld`。
- 23、经过查找。如果`idxInOld`不存在。则调用createElm方法直接生成`newStartVnode`对应的真实DOM插入`oldStartVnode`对应真实DOM前面。
- 24、如果`idxInOld`存在，则把用通过`oldCh[idxInOld]`获取到Vnode记为`vnodeToMove`和`newStartVnode`用sameVnode判断是否值得比较。
- 25、如果值得比较，调用patchVnode方法，重新执行第3步。同时执行`oldCh[idxInOld] = undefined`，免得被重复比较。同时将`vnodeToMove`对应的真实DOM移动到旧子节点的头部`oldStartVnode`对应的真实DOM前面。
- 26、如果不值得比较，则调用createElm方法直接生成`newStartVnode`对应的真实DOM插入`oldStartVnode`对应真实DOM前面。
- 27、用`newCh[++newStartIdx]`重新获取新子节点头部
- 28、如果满足`oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx`继续执行步骤9。
- 29、如果`oldStartIdx > oldEndIdx`，说明所有旧子节点已经都比对完了，还剩下未比对的新子节点都调用createElm方法生成对应的真实DOM，插到`newCh[newEndIdx + 1]`对应的真实DOM后面。
- 30、如果`newStartIdx > newEndIdx`，说明所有新子节点都比较完，那么还剩下的旧子节点都删除掉。

#### 5、利用v-once处理只会渲染一次的元素或组件

只渲染元素和组件一次。随后的重新渲染，元素/组件及其所有的子节点将被视为静态内容并跳过。这可以用于优化更新性能。

例如某个页面是合同范文，里面大部分内容从服务端获取且是固定不变，只有姓名、产品、金额等内容会变动。这时就可以把`v-once`添加到那些包裹固定内容的元素上，当生成新的合同可以跳过那些固定内容，只重新渲染姓名、产品、金额等内容即可。

和`v-if`一起使用时，`v-once`不生效。在`v-for`循环内的元素或组件上使用，必须加上key。

讲到此优化，要防止面试官问你`v-once`怎么实现只渲染一次元素或组件？

说到渲染应该和`render`函数有关，那要去生成`render`函数的地方去寻找答案。

在*src/compiler/codegen/index.js*中，找到genElement方法

```scss
else if (el.once && !el.onceProcessed) {若设置v-once，则调用genOnce()函数
    return genOnce(el, state)
 } 
```

再看genOnce方法

```javascript
function genOnce(el, state){
    el.onceProcessed = true
    if (el.if && !el.ifProcessed) {//如果有定义了v-if指令
        //...
    } else if (el.staticInFor) {//如果是在v-for下面的元素或组件上
        //...
        return `_o(${genElement(el, state)},${state.onceId++},${key})`
    } else {
        return genStatic(el, state)
    }
}
```

如果有定义`v-if`指令，如果`v-if`指令的值不存在，最后还是会调用genStatic方法。再看genStatic方法

```javascript
function genStatic(el, state) {
	//...
    state.staticRenderFns.push(`with(this){return ${genElement(el, state)}}`)
    return `_m(${state.staticRenderFns.length - 1}${el.staticInFor ? ',true' : ''})`
}
```

其中_m方法就是*src\core\instance\render-helpers\render-static.js*中的renderStatic方法，这个方法就是`v-once`实现只渲染一次元素或组件的关键所在。

```kotlin
function renderStatic(index,isInFor){
    const cached = this._staticTrees || (this._staticTrees = [])
    let tree = cached[index]
    if (tree && !isInFor) {
        return tree
    }
    tree = cached[index] = this.$options.staticRenderFns[index].call(this._renderProxy,null,this)
 	return tree
}
```

其中`cached`是带`v-once`的元素或组件渲染生成的虚拟DOM节点的缓存，如果某个虚拟DOM节点的缓存存在，且虚拟DOM节点不是在`v-for`中直接返回该虚拟DOM节点缓存，如果该虚拟DOM节点没有缓存，则调用`genStatic`方法中存在`staticRenderFns`数组中的渲染函数，渲染出虚拟DOM节点且存在`cached`，以便下次不用重新渲染直接返回该虚拟DOM节点，并同时调用`markOnce`方法在该虚拟DOM节点上加上`isOnce`标志，值为`true`。

如果有定义`v-for`，最终会调用`_o(${genElement(el, state)},${state.onceId++},${key})`,其中`_o`方法就是*src\core\instance\render-helpers\render-static.js*中的markOnce方法，其作用是在生成的虚拟DOM节点上加上`isOnce`标志，为true代表该虚拟DOM节点是静态节点，当 patch 时，会判断`vnode.isOnce`是否为`true`，为`true`时，直接返回旧节点，不进行比对，相当实现渲染一次。

#### 6、利用Object.freeze()冻结不需要响应式变化的数据

```!
Vue初始化过程中，会把data传入observe函数中进行数据劫持，把data中的数据都转换成响应式的。
```

在observe函数内部调用defineReactive函数处理数据，配置getter/setter属性，转成响应式，如果使用`Object.freeze()`将data中某些数据冻结了，也就是将其configurable属性（可配置）设置为false。

defineReactive函数中有段代码，检测数据上某个key对应的值的configurable属性是否为false，若是就直接返回，若不是继续配置getter/setter属性。

```vbnet
export function defineReactive(obj,key,val,customSetter,shallow){
    //...
    const property = Object.getOwnPropertyDescriptor(obj, key)//获取obj[key]的属性
    if (property && property.configurable === false) {
        return
    }
    //...
}
```

在项目中如果遇到不需要响应式变化的数据，可以用`Object.freeze()`把该数据冻结了，可以跳过初始化时数据劫持的步骤，大大提高初次渲染速度。

#### 7、提前过滤掉非必须数据，优化data选项中的数据结构

Vue初始化时，会将选项data传入observe函数中进行数据劫持，

```javascript
initData(vm){
    let data = vm.$options.data
    //...
    observe(data, true)
}
```

在observe函数会调用

```scss
observe(value,asRootData){
   //...
   ob = new Observer(value);
}
```

在Observer原型中defineReactive函数处理数据，配置getter/setter属性，转成响应式

```ini
walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
        defineReactive(obj, keys[i])
    }
}
```

defineReactive函数中,会将数据的值再次传入observe函数中

```scss
export function defineReactive(obj,key,val,customSetter,shallow){
    //...
    if (arguments.length === 2) {
        val = obj[key]
    }
    let childOb = observe(val);
    //...
}
```

observe函数中有段代码，将数据传入，Observer类中。

```javascript
export function observe(value,asRootData){
  //...
  ob = new Observer(value)
  //...
  return ob
}
```

以上构成了一个递归调用。

接收服务端传来的数据，都会有一些渲染页面时用不到的数据。服务端的惯例，宁可多传也不会少传。

所以要先把服务端传来的数据中那些渲染页面用不到的数据先过滤掉。然后再赋值到data选项中。可以避免去劫持那些非渲染页面需要的数据，减少循环和递归调用，从而提高渲染速度。

#### 8、避免在v-for循环中读取data中数组类型的数据

```vbnet
export function defineReactive(obj,key,val,customSetter,shallow){
    const dep = new Dep()
    const property = Object.getOwnPropertyDescriptor(obj, key)
    const getter = property && property.get;
    const setter = property && property.set;
    if ((!getter || setter) && arguments.length === 2) {
        val = obj[key]
    }
    let childOb = !shallow && observe(val);
    Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
        const value = getter ? getter.call(obj) : val
        if (Dep.target) {
            dep.depend()
            if (childOb) {
                childOb.dep.depend()
                if (Array.isArray(value)) {
                    dependArray(value)
                }
            }
        }
        return value
    }
    })
}
function dependArray (value: Array<any>) {
    for (let e, i = 0, l = value.length; i < l; i++) {
        e = value[i]
        e && e.__ob__ && e.__ob__.dep.depend()
        if (Array.isArray(e)) {
            dependArray(e)
        }
    }
}
export function observe (value, asRootData){
  	if (!isObject(value) || value instanceof VNode) {
    	return
  	}
  	//...
}
```

为什么要避免在v-for循环中读取data中数组类型的数据，因为在数据劫持中会调用defineReactive函数中。由于 getter是函数，并且引用了 `dep`、`childOb`，形成了闭包，所以 `dep`、`childOb` 一直存在于内存（每个数据的getter函数）中，`dep`是每个数据的依赖收集容器，`childOb`是经过响应式处理后的数据。

在渲染视图、使用watch监听、使用计算属性过程中，读取数据，都会对`Dep.target`进行赋值，其值为Watcher（依赖），例如在渲染视图过程中读取数据时，`Dep.target`为renderWatcher。

接着先调用`dep.depend()`给自身收集依赖，如果val（自身的值）不是对象，则`childOb`为false。如果val（自身的值）是对象，用`childOb.dep.depend()`收集依赖，若value（自身的值）是数组用`dependArray(value)`递归每一项来收集依赖。

为什么要避免在v-for循环中读取data中数组类型的数据，其原因就是**若value（自身的值）是数组用`dependArray(value)`递归每一项来收集依赖**

举个简单的栗子，表格中每行有两个输入框，分别可以输入驾驶员和电话，代码这么实现。

```xml
<template>
    <div class="g-table-content">
        <el-table :data="tableData">
            <el-table-column prop="carno" label="车牌号"></el-table-column>
            <el-table-column prop="cartype" label="车型"></el-table-column>
            <el-table-column label="驾驶员">
                <template slot-scope="{row,column,$index}">
                    <el-input v-model="driverList[$index].name"></el-input>
                </template>
            </el-table-column>
            <el-table-column label="电话">
                <template slot-scope="{row,column,$index}">
                    <el-input v-model="driverList[$index].phone"></el-input>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
```

假设表格有500条数据，那么读取driverList共500次，每次都读取driverList都会进入`dependArray(value)`中，总共要循环500*500=25万次，若有分页，每次切换页码，都会至少循环25万次。

如果我们在从服务获取到数据后，做了如下预处理，在赋值给`this.tableData`，会是怎么样？

```ini
res.data.forEach(item =>{
    item.name='';
    item.phone='';
})
```

模板这样实现

```xml
<template>
    <div class="g-table-content">
        <el-table :data="tableData">
            <el-table-column prop="carno" label="车牌号"></el-table-column>
            <el-table-column prop="cartype" label="车型"></el-table-column>
            <el-table-column label="驾驶员">
                <template slot-scope="{row}">
                    <el-input v-model="row.name"></el-input>
                </template>
            </el-table-column>
            <el-table-column label="电话">
                <template slot-scope="{row,column,$index}">
                    <el-input v-model="row.phone"></el-input>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
```

也可以实现需求，渲染过程中求值时也不会进入`dependArray(value)`中,也不会造成25万次的不必要的循环。大大提高了性能。

#### 9、防抖和节流

防抖和节流是针对用户操作的优化。首先来了解一下防抖和节流的概念。

- 防抖：触发事件后规定时间内事件只会执行一次。简单来说就是防止手抖，短时间操作了好多次。
- 节流：事件在规定时间内只执行一次。
- 应用场景： 节流不管事件有没有触发还是频繁触发，在规定时间内一定会只执行一次事件，而防抖是在规定时间内事件被触发，且是最后一次被触发才执行一次事件。假如事件需要定时执行，但是其他操作也会让事件执行，这种场景可以用节流。假如事件不需要定时执行，需被触发才执行，且短时间内不能执行多次，这种场景可以用防抖。

在用Vue Cli脚手架搭建的Vue项目中，可以通过引用Lodash工具库里面的debounce防抖函数和throttle节流函数。

```javascript
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
export default{
	methods:{
    	a: debounce(function (){
        	//...
        },200,{
            'leading': false,
            'trailing': true
        }),
        b: throttle(function (){
        	//...
        },200,{
            'leading': false,
            'trailing': true
        })
    }
}
```

- `debounce(func, [wait=0], [options={}])` 创建一个防抖函数，该函数会从上一次被调用后，延迟 wait 毫秒后调用 func 方法。返回一个防抖函数debounceFn，`debounce.cancel`取消防抖，`debounce.flush` 立即调用该func。
  - `options.leading`为true时，func在延迟开始前调用。
  - `options.trailing`为true时，func在延迟开始结束后调用。
  - `options.maxWait`设置func 允许被延迟的最大值。
- `throttle(func, [wait=0], [options={}])` 创建一个节流函数，在 wait 秒内最多执行 func 一次的函数。 返回一个节流函数throttleFn，`throttleFn.cancel`取消节流，`throttleFn.flush` 立即调用该func。
  - `options.leading`为true时，func在节流开始前调用。
  - `options.trailing`为true时，func在节流结束后调用。
  - `leading`和`trailing`都为true，func在wait期间多次调用。

#### 10、图片大小优化和懒加载

关于图片大小的优化，可以用image-webpack-loader进行压缩图片，在webpack插件中配置，具体可以看本文中这点。

关于图片懒加载，可以用vue-lazyload插件实现。

执行命令`npm install vue-lazyload --save`安装vue-lazyload插件。在main.js中引入配置

```go
import VueLazyload from 'vue-lazyload';
Vue.use(VueLazyload, {
  preLoad: 1.3,//预载高度比例
  error: 'dist/error.png',//加载失败显示图片
  loading: 'dist/loading.gif',//加载过程中显示图片
  attempt: 1,//尝试次数
})
```

在项目中使用

```ini
<img v-lazy="/static/img/1.png">
```

#### 11、利用挂载节点会被替换的特性优化白屏问题

```javascript
import Vue from 'vue'
import App from './App.vue'
new Vue({
    render: h => h(App)
}).$mount('#app')
```

> Vue 选项中的 render 函数若存在，则 Vue 构造函数不会从 template 选项或通过 el 选项指定的挂载元素中提取出的 HTML 模板编译渲染函数。

也就是说渲染时，会直接用render渲染出来的内容替换`<div id="app"></div>`。

Vue项目有个缺点，首次渲染会有一段时间的白屏原因是首次渲染时需要加载一堆资源，如js、css、图片。很多优化策略，最终目的是提高这些资源的加载速度。但是如果遇上网络慢的情况，无论优化到极致还是需要一定加载时间，这时就会出现白屏现象。

首先加载是index.html页面，其是没有内容，就会出现白屏。如果`<div id="app"></div>`里面有内容，就不会出现白屏。所以我们可以在`<div id="app"></div>`里添加首屏的静态页面。等真正的首屏加载出来后就会把`<div id="app"></div>`这块结构都替换掉，给人一种视觉上的误差，就不会产生白屏。

#### 11、组件库的按需引入

组件库按需引入的方法，一般文档都会介绍。

如element UI库，用babel-plugin-component插件实现按需引入。

执行命令`npm install babel-plugin-component --save-dev`，安装插件。

在根目录下.babelrc.js文件中按如下配置

```lua
{
  "presets": [["es2015", { "modules": false }]],
  "plugins": [
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      }
    ]
  ]
}
```

其中`libraryName`为组件库的名称，`styleLibraryName`为组件库打包后样式存放的文件夹名称。 在main.js中就可以按需引入。

```javascript
import Vue from 'vue';
import { Button, Select } from 'element-ui';
Vue.use(Button)
Vue.use(Select)
```

其实babel-plugin-component插件是element用babel-plugin-import插件改造后特定给element UI使用。一般的组件库还是babel-plugin-import插件实现按需引入。

执行命令`npm install babel-plugin-import --save-dev`，安装插件。

在根目录下.babelrc.js文件中按如下配置

```json
{
  "plugins": [
    ["import", {
      "libraryName": "vant",
      "libraryDirectory": "es",
      "style": true
    }]
  ]
}
```

其中`libraryName`为组件库的名称，`libraryDirectory`表示从库的package.json的main入口文件或者module入口文件所在文件夹名称，否则默认为lib。

在介绍`style`选项配置之前。先看一下Vant 组件库打包后生成文件的结构和内容。 ![img](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/42990946918c4045b7d74ddba8eec282~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

index.js文件内容如下所示

![img](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/defb215cea674b0ba2ae8a67888d870d~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

less.js文件内容如下所示

![img](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/553ce8c0e6a7401589f8c8f2e968c33d~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

`style`为true时，会按需在项目中引入对应style文件中的index.js。

`style`为css时，会按需在项目中引入对应style文件中的less.js。

`style`为Function，babel-plugin-import将自动导入文件路径等于函数返回值的文件。这对于组件库开发人员很有用。 可以看我另一篇文章[Vue CLI3搭建组件库并实现按需引入实战操作](https://juejin.cn/post/6844904000655998984#heading-28)。

### 三、项目打包的优化

在说这个之前，先要明确什么是打包。通俗来说，就是把一个项目打包成一个个js文件、css文件等资源，最后在index.html文件中引入，大家可以看一下项目中dist文件夹中的index.html。

如下图,红框中就是一个项目通过打包出来的资源。其实说优化，就是优化这些资源。那么要怎么优化这些资源呢？ ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/41e9c6bd76de45c4abd710c7e4654459~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) 在早期没有Webpack时，这些资源都是开发者按照团队规范来处理和引入。并通过优化来实现最快的、最合理从服务器下载这些资源。这时期的优化主要体现在:

- js、css代码按需引入。
- js、css代码公用代码提取。
- js、css代码的最小化压缩。
- 图片资源的压缩。

现在项目是用Webpack打包的，可以通过配置Webpack来优化。

如果你的Vue项目是用Vue Cli3搭建起来，可以在根目录新建一个*vue.config.js*文件，在这个文件中配置Webpack来优化这些资源。

优化还是提现在上面四点。下面总结了5个优化手段，其中两个手段虽然在生产环境已经是默认优化的，但是还是要了解一下。

优化自然要前后对比，先安装插件webpack-bundle-analyzer，可以帮助你可视化的分析打包后的各个资源的大小。

```css
npm install webpack-bundle-analyzer --save-dev
```

在*vue.config.js*中引入这插件

```ini
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports={
    configureWebpack:config =>{
        return {
            plugins:[
                new BundleAnalyzerPlugin()
            ]
        }
    }
}
```

执行命令`npm run build`，会在浏览器打开一份打包分析图，如下图所示。 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cbebd7b867534f6f947bc626b6725960~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

#### 1、利用import()异步引入组件实现按需引入

说起`import()`，我们自然会想到路由懒加载，所谓的懒加载就是用`import()`异步引入组件。

在网上随便一搜，懒加载还可以通过`resolve =>require(['需要加载组件的地址'],resolve)`来实现。

```javascript
component: () =>import('views/home.vue'),
component: resolve =>require(['views/home.vue'],resolve)
```

但是用`resolve =>require(['需要加载组件的地址'],resolve)`来异步引入组件，通过Webpack4打包后，发现所有组件的代码被打包成一个js文件这和预期的不符，预期应该是每个组件的代码都被打包成对应的js文件，加载组件时会对应加载js文件，这才是懒加载。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7d260f74249948e980c212e26b2503a2~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

用`import()`来异步引入组件后，执行命令`npm run build`后，看一下打包分析图。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2469067189f9414890c8d2b66fc0c57b~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

对比后发现，原来一个1.42MB的js文件不见了，被拆分成许多如32.55KB、31.69KB的js小文件。这些js小文件只有在对应的组件加载时才会加载，这才是懒加载。

或许你看这些js文件名会感到混乱，不能和项目中的组件一一对上，现在教你一个小技巧。[webpackChunkName](https://link.juejin.cn?target=https%3A%2F%2Fwebpack.docschina.org%2Fapi%2Fmodule-methods%2F%23magic-comments)：chunk文件的名称。[request]表示实际解析的文件名。

```javascript
function load(component) {
    return () => import(/* webpackChunkName: "[request]" */ `views/${component}`)
}
```

执行命令`npm run build`，看一下打包分析图。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/19ff6bb406cc4b24ad68218fb56dbb91~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) 

如图中红框的js文件是views/flow_card_manage/flow_card_list/index.vue这个组件打包出来的。

在浏览器上打开项目，用F12抓包看一下，搜一下`flow_card_manage-flow_card_list.67de1ef8.js`这个文件。在首页时，还没加载到这个路由组件时。这个js文件是有被加载，只是预取（prefetch）一下，没有返回内容的。目的是告诉浏览器，空闲的时候给我加载这个js文件。 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b65fb0b253dd4091ae5dacfa2de8e512~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/669a7734e900429a81005d5d9b4de352~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) 直到真正加载这个路由组件时，这个js文件再次被加载，如果浏览器已经加载好了直接返回内容，如果浏览器还没加载好，就去服务器请求这个js文件，再返回内容。这样就是懒加载，按需加载。 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/090ca9ab658c4a00abc861782e9cd11e~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) **原理：** 可以看一下我的另一篇文章[🚩四年前端带你理解路由懒加载的原理](https://juejin.cn/post/6844904180285456398)

#### 2、利用externals提取第三方依赖并用CDN引入

从打包分析图中可以发现chunk-vendors.js和chunk-80f6b79a.js这两个文件还是很大。这两个文件内有element-ui、jquery、xlsx等第三方依赖的资源。 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a0853dff9994f8f8987c4ac0d5035ff~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e8e14d6f560c46789437ab7839e7b6a3~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

在Webpack中的`externals`配置选项，可避免将第三方依赖打包，而是在项目运行时从外部获取第三方依赖。

具体操作可以看一下我的另一篇文章[Webpack之externals用法详解](https://juejin.cn/post/6844904190083350542)。

执行命令`npm run build`，看一下打包分析图。 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0d59b4dafd304e92af593ee72a4de5f6~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) 

chunk-vendors.js和chunk-80f6b79a.js的文件大小和之前相比，有大幅度的减小。

> 用externals提取第三方依赖时，需切记中庸之道。虽然我们的最终目的是减少http请求资源大小，但是过犹不及，提取的过细将会增加http请求数量。

#### 3、利用SplitChunks插件提取公共js代码和分割js代码

用Webpack打包后，还是有很多资源被重复打包到各个js文件，可以用SplitChunks插件进一步优化，减少打包生成文件的总体大小。

另外CDN是第三方，具有不稳定性，万一CDN突然挂了，系统也就崩了，有一定的风险。也可以用SplitChunks插件实现`externals`配置的效果，第三方依赖还是在自己服务器上，减少风险。

具体操作可以看一下我的另一篇文章[Webpack之SplitChunks插件用法详解](https://juejin.cn/post/6844904198023168013)

#### 4、利用MiniCssExtractPlugin插件提取css样式

在用Vue Cli3搭建的Vue项目中是用`css.extract`来控制MiniCssExtractPlugin插件是否启用，虽然在生产环境中，`css.extract`默认是为`true`，也就是说MiniCssExtractPlugin插件是启用的。但是还是要熟悉一下MiniCssExtractPlugin插件的用法，以防面试官细问。

具体操作可以看一下我的另一篇文章[Webpack之MiniCssExtractPlugin插件用法详解](https://juejin.cn/post/6850418117500715015)。

#### 5、利用OptimizeCssnanoPlugin插件压缩和去重css样式文件

在用Vue Cli3搭建的Vue项目中默认是使用OptimizeCssnanoPlugin插件来压缩和去重css样式文件，

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/01b2a9b813f444ed8893d377854fa9fc~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

这里来讲一下怎么使用这款插件。 先安装OptimizeCssnanoPlugin插件

```css
cnpm install --save-dev @intervolga/optimize-cssnano-plugin
```

在*vue.config.js*中这么配置

```javascript
const OptimizeCssnanoPlugin = require('@intervolga/optimize-cssnano-plugin');
module.exports={
    configureWebpack:config =>{
        return {
            plugins:[
                new OptimizeCssnanoPlugin({
                    sourceMap: false,
                    cssnanoOptions: {
                        preset: [
                            'default',
                            {
                              mergeLonghand: false,
                              cssDeclarationSorter: false
                            }
                        ]
                    },
                }),
            ]
        }
    }
}
```

其中cssnanoOptions的配置可以看[这里](https://link.juejin.cn?target=https%3A%2F%2Fcssnano.co%2Fguides%2Foptimisations)。

`mergeLonghand:false`,表示关闭如margin，padding和border类似css样式属性合并。

```css
.box {
    margin-top: 10px;
    margin-right: 20px;
    margin-bottom: 10px;
    margin-left: 20px;
}
//压缩后
.box {
    margin: 10px 20px;
}
```

`cssDeclarationSorter:false`，表示关闭根据CSS的属性名称对CSS进行排序。

```css
body {
   animation: none;
   color: #C55;
   border: 0;
}
//压缩后
body {
   animation: none;
   border: 0;
   color: #C55;
}
```

#### 6、开启optimization.minimize来压缩js代码

`optimization.minimize`选项有两个值`true`和`false`，为`true`开启压缩js代码，为`false`关闭压缩js代码。

在生产环境中默认为`true`，在开发环境中默认为`false`。

如果你在开发环境不需要用debug调试代码，可以也设置为`true`来压缩js代码，提高页面加载速度。

在*vue.config.js*中这么配置

```arduino
module.exports={
    configureWebpack:config =>{
        return {
            optimization:{
                minimize: true
            }
        }
    }
}
```

在Vue Cli3中默认用TerserPlugin插件来压缩js代码，其中配置已经是最优了。

如果想用其它插件来压缩js代码，可以在`optimization.minimizer`选项中添加，其值为数组。

用chainWebpack来添加，其中WebpackPlugin为插件名称，args为插件参数。

```ini
const WebpackPlugin = require(插件名称)
module.exports = {
    chainWebpack: config =>{
        config.optimization
            .minimizer(name)
            .use(WebpackPlugin, args)
    },
}
```

#### 7、利用image-webpack-loader进行压缩图片

用Vue Cli3搭建的Vue项目中，图片是没进行压缩就直接用url-loader和file-loader处理。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/51c1cd91b0644744910f533943dfa361~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

优化一下用image-webpack-loader进行压缩图片后再给url-loader和file-loader处理。

在Vue Cli3已经配置了对图片处理的loader，要对其进行修改，具体方法可以看我另一篇文章[Webpack之loader配置详解](https://juejin.cn/post/6847902222873788430#heading-17)。

先安装image-webpack-loader

```arduino
cnpm install image-webpack-loader --save-dev
```

然后在*vue.config.js*中这么配置

```arduino
module.exports = {
    chainWebpack: config =>{
        config.module
            .rule('images')
            .use('imageWebpackLoader')
            .loader('image-webpack-loader')
    },
}
```

添加image-webpack-loader前，打包后 homeBg.png 图片 如下所示 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8e45a80d6b544a09aaac542ecdea6961~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

添加image-webpack-loader后，打包后 homeBg.png 图片 如下所示 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1c2d22c308d14358a63ea396eb5a0239~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

可以看到图片大小从251KB减少到110KB，优化效果明显。

[image-webpack-loader](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fimage-webpack-loader)支持压缩PNG，JPEG，GIF，SVG和WEBP图片，下面介绍一下其常用的参数。

- bypassOnDebug `ture/false`，默认为`false`，为`true`时禁用压缩图片，在[webpack@1.x](https://link.juejin.cn?target=mailto%3Awebpack%401.x)中使用。

- disable `ture/false`，默认为`false`，为`true`时禁用压缩图片，在[webpack@2.x](https://link.juejin.cn?target=mailto%3Awebpack%402.x)及更高版本中使用。 可以在开发环境中禁用压缩图片，使其编译速度更快。

  ```arduino
  module.exports = {
      chainWebpack: config =>{
          config.module
              .rule('images')
              .use('imageWebpackLoader')
              .loader('image-webpack-loader')
              .options({
                  disable: process.env.NODE_ENV === 'development',
              })
      },
  }
  ```

- mozjpeg：  控制压缩JPEG图像的配置，默认启用。参数值为对象，常用的子参数有：

  - quality 压缩质量，范围0（最差）至100（最完美）。

- optipng：控制压缩PNG图像的配置，默认启用。参数值为对象，常用的子参数有：

  - OptimizationLevel 优化级别，在0和7之间选择一个优化级别，数值越高，压缩质量越好，但是速度越慢，默认为3。

- pngquant：控制压缩PNG图像的配置，默认启用。参数值为对象，常用的子参数有：

  - speed 压缩速度，在1到11，数值越高，压缩速度越快，默认值为4。值为10时质量降低5％，但比默认速度快8倍。
  - quality 压缩质量，值为数组，如`[0 , 1]`，最小值是0（最差）和最大值是1（完美）。

- gifsicle：控制压缩GIF图像的配置，默认启用。参数值为对象，常用的子参数有: -OptimizationLevel 优化级别，在1和3之间选择一个优化级别，优化级别确定完成多少优化；较高的水平需要更长的时间，但可能会有更好的效果。

- webp： 将JPG和PNG图像压缩为WEBP，默认不启用，需要配置后才启用。启用后，可以将JPG和PNG图像压缩输出大小更小的图片，但比用mozjpeg、optipng、pngquant压缩更耗时，会影响编译打包速度，需自己取舍。

  参数值为对象，常用的子参数有

  - quality 品质因数，在0和之间100设置，默认为75，值越高品质越好。
  - lossless 是否无损压缩，默认为false，为true时开启无损压缩。
  - nearLossless 使用额外的有损预处理步骤进行无损编码，其品质因数介于0（最大预处理）和100（等于lossless）之间。

```php
module.exports = {
    chainWebpack: config =>{
        config.module
            .rule('images')
            .use('imageWebpackLoader')
            .loader('image-webpack-loader')
            .options({
                disable: process.env.NODE_ENV === 'development',
                mozjpeg:{
                    quality:75
                },
                optipng:{
                    OptimizationLevel:3
                },
                pngquant:{
                    speed:4,
                    quality:[0.2,0.5]
                },
                gifsicle:{
                    OptimizationLevel:1
                },
                webp:{
                    quality:75,
                    lossless:true,
                    nearLossless:75
                }
            })
    },
}
```

### 四、项目部署的优化

这里只讲一个比较常见和简单的优化手段，gzip压缩。其实还有其他优化手段，涉及到服务端，如果面试官深究会其反作用。

#### 1、识别gzip压缩是否开启

这个很简单，只要看响应头部（Response headers）中 有没有`Content-Encoding: gzip`这个属性即可，有代表有开启gzip压缩。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d251ee56f34c42fca4027794c7138062~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

#### 2、在Nginx上开启gzip压缩

在nginx/conf/nginx.conf中配置

```ini
http {
    gzip  on;
    gzip_min_length 1k;
    gzip_comp_level 5;
    gzip_types application/javascript image/png image/gif image/jpeg text/css text/plain;
    gzip_buffers 4 4k;
    gzip_http_version 1.1;
    gzip_vary on;
}
```

- `gzip`：on | off ，默认为off，on为开启gzip，off为关闭gzip。
- `gzip_min_length`：number，压缩起点，文件大于多少才进行压缩，单位默认为字节，也可用k表示千字节。
- `gzip_comp_level`：压缩级别，1-9，数字越大，压缩后的大小越小，也越占用CPU，花费时间越长。
- `gzip_types`：需要进行压缩的文件类型。类型去Response headers中看Content-Type属性。
- `gzip_buffers`：number size，设置系统获取几个单位的缓存用于存储gzip的压缩结果数据流。 例如 4 4k代表以4k为单位，按照原始数据大小以4k为单位的4倍申请内存。如原始数据大小为17K，则申请 （17/4）*4 = 17k内存。
- `gzip_http_version`：设置gzip压缩针对的HTTP协议版本以上。
- `gzip_vary`：on | off，是否在http header中添加Vary:Accept-Encoding，on表示添加。Vary:Accept-Encoding告诉代理服务器缓存两种版本的资源：压缩和非压缩，避免一个浏览器不支持压缩资源，而先请求了服务器，服务器缓存了非压缩的资源，然后一个浏览器支持压缩资源，再去请求了服务器，结果得到非压缩资源，但是又去解压它，结果会出错。所以建议设置为on。

开启gzip压缩前 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f23b7e864eb84b1b9e02126abe053680~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) 开启gzip压缩后

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3c65180c285d436eb39856d97ef72f02~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

对比一下，优化效果非常明显。自己也可以在本地尝试一下，怎么用Nginx部署Vue项目可以看我[这篇文章](https://juejin.cn/post/6844903974697435150)。

#### 3、在Webpack上开启gzip压缩

利用CompressionWebpack插件来实现gzip压缩。

首先安装CompressionWebpack插件

```css
npm install compression-webpack-plugin --save-dev
```

然后在*vue.config.js*中这么配置

```ini
const CompressionPlugin = require('compression-webpack-plugin');
module.exports = {
    configureWebpack: config =>{
        return {
            plugins: [
                new CompressionPlugin()
            ],
        }
    }
}
```

执行`npm run build`命令后，打开*dist*文件，会发现多出很多名字相同的文件，只是其中一个文件后缀为`.gz`，这就是用gzip压缩后的文件。 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/52c0d290451147229d0bb6d81eb9f671~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

#### 4、Nginx和Webpack压缩的区别

- 不管Nginx还是Webpack压缩，在Nginx中都要开启gzip压缩，不然浏览器加载还是未压缩的资源。

  还可以在Nginx加上`gzip_static on;`的配置。`gzip_static`启用后， 浏览器请求资源时，Nginx会先检查是否存该资源名称且后缀为`.gz`的文件，如果有则直接返回该gz文件内容，可以避免Nginx对该资源再进行gzip压缩，浪费服务器的CPU。

- 用Nginx压缩会占用服务器的CPU，浏览器每次请求资源，Nginx会对该资源实时压缩，压缩完毕后才会返回该资源，如果资源很大的话，还是压缩级别设置很高，都会导致返回资源的时间过长，造成不好的用户体验。

- 用Webpack会使打包时间变长。但是用CompressionPlugin插件压缩，会有缓存，可以相对减少打包时间。

- 建议Nginx和Webpack压缩都开启压缩，且在Nginx加上`gzip_static on;`的配置，减少服务器的CPU的使用，当然还是要根据项目的情况实际选择。

#### 5、CompressionPlugin插件的参数详细详解

- ```
  test：String|RegExp|Array<String|RegExp>，
  ```

  资源的名称

  符合条件的才会被压缩，默认为undefined，即全部符合，例如只要压缩js文件

  ```css
  plugins: [
      new CompressionPlugin({
          test: /\.js(\?.*)?$/i,
      })
  ],
  ```

- `include`：String|RegExp|Array<String|RegExp>，**资源的名称**符合条件的才会被压缩，默认为undefined，是在`test`参数的范围内在进行筛选，满足`test`参数的条件，且满足`include`参数的条件的资源才会被压缩。

- `exclude`：String|RegExp|Array<String|RegExp>，压缩时排除**资源的名称**符合条件的资源，默认为undefined，是在`test`参数的范围内在进行排除，满足`test`参数的条件，不满足`exclude`参数的条件的资源才会被压缩。

- `algorithm`：压缩算法/功能，默认gzip，一般不做更改。

- ```
  compressionOptions
  ```

  ，对

  ```
  algorithm
  ```

  参数所选用的压缩功能的参数设置，一般用来设置压缩级别，1-9，数字越大，压缩后的大小越小，也越占用CPU，花费时间也越长。

  ```css
  plugins: [
      new CompressionPlugin({
          compressionOptions: { level: 1 },
      })
  ],
  ```

- `threshold`：Number，设置被压缩资源的最小大小，单位为字节。默认为0。

- `minRatio`：Number，设置压缩比率，压缩比率 = 压缩后的资源的大小/压缩后的资源，小于压缩比率的资源才会被压缩。和`threshold`参数是‘与’的关系。

- `filename`：类型：String|Function，设置压缩资源后的名称，默认值：[path].gz[query]， [file]被替换为原始资产文件名。 [path]替换为原始资产的路径。 [dir]替换为原始资产的目录。 [name]被替换为原始资产的文件名。 [ext]替换为原始资产的扩展名。 [query]被查询替换。 下面用函数把各类的值都打印出来。

```javascript
 new CompressionPlugin({
    filename(info) {
        console.log(info)
        return `${info.path}.gz${info.query}`;
    },
})
```

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b24d3455d8364959bf7468a89b628207~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

- `deleteOriginalAssets`：Boolean，默认为`false`，为`true`时删除原始资源文件。不建议设置。
- `cache`：Boolean|String，默认为`true`，为`true`时，启用文件缓存。缓存目录的默认路径：*node_modules/.cache/compression-webpack-plugin*。值为String时。启用文件缓存并设置缓存目录的路径。

```arduino
new CompressionPlugin({
      cache: 'path/to/cache',
}),
```

