[TOC]
# 一 基于proxy的Observer
## 1 什么是proxy
**Proxy 对象用于定义基本操作的自定义行为（如属性查找、赋值、枚举、函数调用等）。**

proxy是es6新特性，为了对目标的作用主要是通过handler对象中的拦截方法拦截目标对象target的某些行为（如属性查找、赋值、枚举、函数调用等）。
```
/* target: 目标对象，待要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。 */
/* handler: 一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 proxy 的行为。 */ 
const proxy = new Proxy(target, handler);
```
## 2 为什么要用proxy，改用proxy之后的利与弊
当前 Vue 2 系列中基于 Object.defineProperty 所存在的一些局限，这些局限包括：
1 对属性的添加、删除动作的监测； 

2 对数组基于下标的修改、对于 .length 修改的监测； 

3 对 Map、Set、WeakMap 和 WeakSet 的支持；

## 3 proxy中hander对象的基本用法
vue3.0 响应式用到的捕获器（接下来会重点介绍）

`handler.has()`                      ->  in 操作符 的捕捉器。    (vue3.0 用到)

`handler.get()`                      ->  属性读取  操作的捕捉器。 (vue3.0 用到)

`handler.set()`                      ->  属性设置* 操作的捕捉器。 (vue3.0 用到)

`handler.deleteProperty()`           ->  delete 操作符 的捕捉器。(vue3.0 用到)

`handler.ownKeys()`                  ->  `Object.getOwnPropertyNames` 方法和 `Object.getOwnPropertySymbols` 方法的捕捉器。(vue3.0 用到)

vue3.0 响应式没用到的捕获器（有兴趣的同学可以研究一下）

`handler.getPrototypeOf()`           ->  `Object.getPrototypeOf` 方法的捕捉器。

`handler.setPrototypeOf()`           ->  `Object.setPrototypeOf` 方法的捕捉器。

`handler.isExtensible()`             ->  `Object.isExtensible` 方法的捕捉器。

`handler.preventExtensions()`        ->  `Object.preventExtensions` 方法的捕捉器。

`handler.getOwnPropertyDescriptor()` ->  `Object.getOwnPropertyDescriptor` 方法的捕捉器。

`handler.defineProperty()`           ->  `Object.defineProperty` 方法的捕捉器。

`handler.apply()`                    ->  函数调用操作 的捕捉器。

`handler.construct()`                ->  new 操作符  的捕捉器。

### ① has捕获器
**has(target, propKey)**target:目标对象

propKey:待拦截属性名

作用:  拦截判断target对象是否含有属性propKey的操作

拦截操作： **propKey in proxy**;   不包含for...in循环

对应Reflect: **Reflect.has(target, propKey)**

```
const handler = {
    has(target, propKey){
        /*
        * 做你的操作
        */
        return propKey in target
    }
}
const proxy = new Proxy(target, handler)
```

### ② get捕获器

****get(target, propKey, receiver)**

target:目标对象

propKey:待拦截属性名

receiver: proxy实例

返回： 返回读取的属性

作用：拦截对象属性的读取

拦截操作：proxy[propKey]或者点运算符

对应Reflect：  **Reflect.get(target, propertyKey[, receiver])**

```js
const handler = {
    has(target, propKey){
        /*
        * 做你的操作
        */
        return propKey in target
    }
}
const proxy = new Proxy(target, handler)const handler = {
    get: function(obj, prop) {
        return prop in obj ? obj[prop] : '没有此水果';
    }
}

const foot = new Proxy({}, handler)
foot.apple = '苹果'
foot.banana = '香蕉';

console.log(foot.apple, foot.banana);    /* 苹果 香蕉 */
console.log('pig' in foot, foot.pig);    /* false 没有此水果 */
```

**特殊情况**

```js
const person = {};
Object.defineProperty(person, 'age', {
  value: 18, 
  writable: false,
  configurable: false
})
const proxPerson = new Proxy(person, {
  get(target,propKey) {
    return 20
    //应该return 18;不能返回其他值，否则报错
  }
})
console.log( proxPerson.age ) /* 会报错 */
```

### ③ set捕获器

**set(target,propKey, value,receiver)**

target:目标对象

propKey:待拦截属性名

value:新设置的属性值

receiver: proxy实例

返回：严格模式下返回true操作成功；否则失败，报错

作用： 拦截对象的属性赋值操作

拦截操作： proxy[propkey] = value

对应Reflect：  **Reflect.set(obj, prop, value, receiver)**

```js
let validator = {
  set: function(obj, prop, value) {
    if (prop === 'age') {
      if (!Number.isInteger(value)) { /* 如果年龄不是整数 */
        throw new TypeError('The age is not an integer')
      }
      if (value > 200) {  /* 超出正常的年龄范围 */
        throw new RangeError('The age seems invalid')
      }
    }
    obj[prop] = value
    // 表示成功
    return true
  }
}
let person = new Proxy({}, validator)
person.age = 100
console.log(person.age)  // 100
person.age = 'young'     // 抛出异常: Uncaught TypeError: The age is not an integer
person.age = 300         // 抛出异常: Uncaught RangeError: The age seems invalid
```

**当对象的属性writable为false时，该属性不能在拦截器中被修改**

```js
const person = {};
Object.defineProperty(person, 'age', {
    value: 18,
    writable: false,
    configurable: true,
});

const handler = {
    set: function(obj, prop, value, receiver) {
        return Reflect.set(...arguments);
    },
};
const proxy = new Proxy(person, handler);
proxy.age = 20;
console.log(person) // {age: 18} 说明修改失败
```

### ④ deleteProperty 捕获器

**deleteProperty(target, propKey)**

target:目标对象

propKey:待拦截属性名

返回：严格模式下只有返回true, 否则报错

作用： 拦截删除target对象的propKey属性的操作

拦截操作： delete proxy[propKey]

对应Reflect：  **Reflect.delete(obj, prop)**

```js
var foot = { apple: '苹果' , banana:'香蕉'  }
var proxy = new Proxy(foot, {
  deleteProperty(target, prop) {
    console.log('当前删除水果 :',target[prop])
    return delete target[prop]
  }
});
delete proxy.apple
console.log(foot)

/*
运行结果：
'当前删除水果 : 苹果'
{  banana:'香蕉'  }
*/
```

**特殊情况： 属性是不可配置属性时，不能删除**

```js
var foot = {  apple: '苹果' }
Object.defineProperty(foot, 'banana', {
   value: '香蕉', 
   configurable: false
})
var proxy = new Proxy(foot, {
  deleteProperty(target, prop) {
    return delete target[prop];
  }
})
delete proxy.banana /* 没有效果 */
console.log(foot)
```

### ⑤ownKeys 捕获器

**ownKeys(target)**

target：目标对象

返回： 数组（数组元素必须是字符或者Symbol,其他类型报错）

作用： 拦截获取键值的操作

拦截操作：

**1 Object.getOwnPropertyNames(proxy)**

**2 Object.getOwnPropertySymbols(proxy)**

**3 Object.keys(proxy)**

**4 for...in...循环**

对应Reflect：**Reflect.ownKeys()**

```js
var obj = { a: 10, [Symbol.for('foo')]: 2 };
Object.defineProperty(obj, 'c', {
   value: 3, 
   enumerable: false
})
var p = new Proxy(obj, {
 ownKeys(target) {
   return [...Reflect.ownKeys(target), 'b', Symbol.for('bar')]
 }
})
const keys = Object.keys(p)  // ['a']
// 自动过滤掉Symbol/非自身/不可遍历的属性

/* 和Object.keys()过滤性质一样，只返回target本身的可遍历属性 */
for(let prop in p) { 
 console.log('prop-',prop) /* prop-a */
}

/* 只返回拦截器返回的非Symbol的属性，不管是不是target上的属性 */
const ownNames = Object.getOwnPropertyNames(p)  /* ['a', 'c', 'b'] */

/* 只返回拦截器返回的Symbol的属性，不管是不是target上的属性*/
const ownSymbols = Object.getOwnPropertySymbols(p)// [Symbol(foo), Symbol(bar)]

/*返回拦截器返回的所有值*/
const ownKeys = Reflect.ownKeys(p)
// ['a','c',Symbol(foo),'b',Symbol(bar)]
```



# 二 vue3.0 如何建立响应式

vue3.0 建立响应式的方法有两种： 第一个就是运用`composition-api`中的`reactive`直接构建响应式，`composition-api`的出现我们可以在.vue文件中，直接用`setup()`函数来处理之前的大部分逻辑，也就是说我们没有必要在 `export default{ }` 中在声明生命周期 ， `data(){}` 函数，`watch{}` , `computed{}` 等 ，取而代之的是我们在setup函数中，用vue3.0 `reactive watch` 生命周期api来到达同样的效果，这样就像`react-hooks`一样提升代码的复用率，逻辑性更强。

第二个就是用传统的 `data(){ return{} }` 形式 ,vue3.0没有放弃对vue2.0写法的支持，而是对vue2.0的写法是完全兼容的，提供了**applyOptions** 来处理options形式的vue组件。但是options里面的data , watch , computed等处理逻辑，还是用了`composition-api`中的API对应处理。

## 1 composition-api reactive

Reactive 相当于当前的 Vue.observable () API，经过reactive处理后的函数能变成响应式的数据，类似于option api里面的vue处理data函数的返回值。

```js
const { reactive , onMounted } = Vue
setup(){
    const state = reactive({
        count:0,
        todoList:[]
    })
    /* 生命周期mounted */
    onMounted(() => {
       console.log('mounted')
    })
    /* 增加count数量 */
    function add(){
        state.count++
    } 
    /* 减少count数量 */
    function del(){
        state.count--
    }
    /* 添加代办事项 */
    function addTodo(id,title,content){
        state.todoList.push({
            id,
            title,
            content,
            done:false
        })
    }
    /* 完成代办事项 */
    function complete(id){
        for(let i = 0; i< state.todoList.length; i++){
            const currentTodo = state.todoList[i] 
            if(id === currentTodo.id){
                state.todoList[i] = {
                    ...currentTodo,
                    done:true
                } 
                break
            }
        }
    }
    return {
        state,
        add,
        del,
        addTodo,
        complete
    }
}
```

## 2 options data

```js
   export default {
    data(){
        return{
            count:0,
            todoList:[] 
        }
    },
    mounted(){
        console.log('mounted')
    }
    methods:{
        add(){
            this.count++
        },
        del(){
            this.count--
        },
        addTodo(id,title,content){
           this.todoList.push({
               id,
               title,
               content,
               done:false
           })
        },
        complete(id){
            for(let i = 0; i< this.todoList.length; i++){
                const currentTodo = this.todoList[i] 
                if(id === currentTodo.id){
                    this.todoList[i] = {
                        ...currentTodo,
                        done:true
                    } 
                    break
                }
            }
        }
    }
}
```

# 三 响应式原理初探

## 不同类型的Reactive

### ① reactive

建立响应式reactive，返回proxy对象，这个reactive可以深层次递归，也就是如果发现展开的属性值是**引用类型**的而且被**引用**，还会用reactive**递归处理**。而且属性是可以被修改的。

### ② shallowReactive

建立响应式shallowReactive，返回proxy对象。和reactive的区别是只建立一层的响应式，也就是说如果发现展开属性是**引用类型**也不会**递归**。

### ③ readonly

返回的proxy处理的对象，可以展开递归处理，但是属性是只读的，不能修改。可以做props传递给子组件使用。

### ④ shallowReadonly

返回经过处理的proxy对象，但是建立响应式属性是只读的，不展开引用也不递归转换，可以这用于为有状态组件创建props代理对象。


## 储存对象与proxy

用Reactive处理过并返回的对象是一个proxy对象，假设存在很多组件，或者在一个组件中被多次reactive，就会有很多对proxy对象和它代理的原对象。为了能把proxy对象和原对象建立关系，vue3.0采用了WeakMap去储存这些对象关系。WeakMaps 保持了对键名所引用的对象的弱引用，即垃圾回收机制不将该引用考虑在内。只要所引用的对象的其他引用都被清除，垃圾回收机制就会释放该对象所占用的内存。也就是说，一旦不再需要，WeakMap 里面的键名对象和所对应的键值对会自动消失，不用手动删除引用。

```const rawToReactive = new WeakMap<any, any>()
const rawToReactive = new WeakMap<any, any>()
const reactiveToRaw = new WeakMap<any, any>()
const rawToReadonly = new WeakMap<any, any>() /* 只读的 */
const readonlyToRaw = new WeakMap<any, any>() /* 只读的 */
```

vue3.0 用readonly来设置被拦截器拦截的对象能否被修改，可以满足之前的props不能被修改的单向数据流场景。

**rawToReactive**

键值对 ： { [targetObject] : obseved  }

target（键）:目标对象值(这里可以理解为**reactive**的第一个参数。) obsered（值）:经过proxy代理之后的proxy对象。



**reactiveToRaw** reactiveToRaw 储存的刚好与 rawToReactive的键值对是相反的。 键值对 { [obseved] : targetObject }



**rawToReadonly**

键值对 ： { [target] : obseved  }

target（键）：目标对象。 obsered（值）:经过proxy代理之后的只读属性的proxy对象。



**readonlyToRaw** 储存状态与rawToReadonly刚好相反。


 

## reactive入口解析

### reactive({ ...object }) 入口

```js
/* TODO: */
export function reactive(target: object) {
  if (readonlyToRaw.has(target)) {
    return target
  }
  return createReactiveObject(
    target,                   /* 目标对象 */
    rawToReactive,            /* { [targetObject] : obseved  }   */
    reactiveToRaw,            /* { [obseved] : targetObject }  */
    mutableHandlers,          /* 处理 基本数据类型 和 引用数据类型 */
    mutableCollectionHandlers /* 用于处理 Set, Map, WeakMap, WeakSet 类型 */
  )
}
```

**reactive**函数的作用就是通过createReactiveObject方法产生一个proxy,而且针对不同的数据类型给定了不同的处理方法。

### createReactiveObject

```js
const collectionTypes = new Set<Function>([Set, Map, WeakMap, WeakSet])
function createReactiveObject(
  target: unknown,
  toProxy: WeakMap<any, any>,
  toRaw: WeakMap<any, any>,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>
) {
  /* 判断目标对象是否被effect */
  /* observed 为经过 new Proxy代理的函数 */
  let observed = toProxy.get(target) /* { [target] : obseved  } */
  if (observed !== void 0) { /* 如果目标对象已经被响应式处理，那么直接返回proxy的observed对象 */
    return observed
  }
  if (toRaw.has(target)) { /* { [observed] : target  } */
    return target
  }
  /* 如果目标对象是 Set, Map, WeakMap, WeakSet 类型，那么 hander函数是 collectionHandlers 否侧目标函数是baseHandlers */
  const handlers = collectionTypes.has(target.constructor)
    ? collectionHandlers
    : baseHandlers
   /* TODO: 创建响应式对象  */
  observed = new Proxy(target, handlers)
  /* target 和 observed 建立关联 */
  toProxy.set(target, observed)
  toRaw.set(observed, target)
  /* 返回observed对象 */
  return observed
}
```

通过上面源码创建proxy对象的大致流程是这样的： 

①首先判断目标对象有没有被proxy响应式代理过，如果是那么直接返回对象。 

②然后通过判断目标对象是否是[ Set, Map, WeakMap, WeakSet  ]数据类型来选择是用**collectionHandlers** ， 还是**baseHandlers->就是reactive传进来的mutableHandlers**作为proxy的hander对象。

③最后通过真正使用new proxy来创建一个observed ，然后通过rawToReactive reactiveToRaw 保存 target和observed键值对。

大致流程图：


![](https://img-blog.csdnimg.cn/2020080915460594.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3psX0FsaWVu,size_16,color_FFFFFF,t_70)


# 四 拦截器对象baseHandlers -> mutableHandlers

baseHandlers就是调用reactive方法createReactiveObject传进来的mutableHandlers对象。

## 拦截器的作用域

```
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
}
```



# 五 组件初始化阶段

如果我们想要弄明白整个响应式原理。那么组件初始化，到初始化过程中composition-api的reactive处理data，以及编译阶段对data属性进行依赖收集是分不开的。vue3.0提供了一套从初始化，到render过程中依赖收集，到组件更新,到组件销毁完整响应式体系，我们很难从一个角度把东西讲明白，所以在正式讲拦截器对象如何收集依赖，派发更新之前，我们看看effect做了些什么操作。

## effect -> 新的渲染watcher

vue3.0用effect副作用钩子来代替vue2.0watcher。我们都知道在vue2.0中，有渲染watcher专门负责数据变化后的从新渲染视图。vue3.0改用effect来代替watcher达到同样的效果。

### 1 mountComponent 初始化mountComponent

```js
  // 初始化组件
  const mountComponent: MountComponentFn = (
    initialVNode,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    isSVG,
    optimized
  ) => {
    /* 第一步: 创建component 实例   */
    const instance: ComponentInternalInstance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent,
      parentSuspense
    ))

    /* 第二步 ： TODO:初始化 初始化组件,建立proxy , 根据字符窜模版得到 */
    setupComponent(instance)
    /* 第三步：建立一个渲染effect，执行effect */
    setupRenderEffect(
      instance,     // 组件实例
      initialVNode, //vnode  
      container,    // 容器元素
      anchor,
      parentSuspense,
      isSVG,
      optimized
    )   
  }
```

上面是整个mountComponent的主要分为了三步

 **① 第一步: 创建component 实例 。** 

**② 第二步：初始化组件,建立proxy ,根据字符窜模版得到render函数。生命周期钩子函数处理等等** 

**③ 第三步：建立一个渲染effect，执行effect。**

从如上方法中我们可以看到，在**setupComponent**已经构建了响应式对象，但是还没有**初始化收集依赖**。


### 2 setupRenderEffect 构建渲染effect

```js
 const setupRenderEffect: SetupRenderEffectFn = (
    instance,
    initialVNode,
    container,
    anchor,
    parentSuspense,
    isSVG,
    optimized
  ) => {
    /* 创建一个渲染 effect */
    instance.update = effect(function componentEffect() {
      //...省去的内容后面会讲到
    },{ scheduler: queueJob })
  }
```

**setupRenderEffect的作用**

**① 创建一个effect，并把它赋值给组件实例的update方法，作为渲染更新视图用。** 

**② componentEffect作为回调函数形式传递给effect作为第一个参数**



### 3 effect做了些什么

```js
export function effect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions = EMPTY_OBJ
): ReactiveEffect<T> {
  const effect = createReactiveEffect(fn, options)
  /* 如果不是懒加载 立即执行 effect函数 */
  if (!options.lazy) {
    effect()
  }
  return effect
}
```

**effect作用如下**

**① 首先调用createReactiveEffect** 

**② 如果不是懒加载 立即执行 由createReactiveEffect创建出来的ReactiveEffect函数**



### 4 ReactiveEffect

```js
function createReactiveEffect<T = any>(
  fn: (...args: any[]) => T, /**回调函数 */
  options: ReactiveEffectOptions
): ReactiveEffect<T> {
  const effect = function reactiveEffect(...args: unknown[]): unknown {
    try {
        enableTracking()
        effectStack.push(effect) //往effect数组中里放入当前 effect
        activeEffect = effect //TODO: effect 赋值给当前的 activeEffect
        return fn(...args) //TODO:    fn 为effect传进来 componentEffect
      } finally {
        effectStack.pop() //完成依赖收集后从effect数组删掉这个 effect
        resetTracking() 
        /* 将activeEffect还原到之前的effect */
        activeEffect = effectStack[effectStack.length - 1]
    }
  } as ReactiveEffect
  /* 配置一下初始化参数 */
  effect.id = uid++
  effect._isEffect = true
  effect.active = true
  effect.raw = fn
  effect.deps = [] /* TODO:用于收集相关依赖 */
  effect.options = options
  return effect
}
```

**createReactiveEffect**的作用主要是配置了一些初始化的参数，然后包装了之前传进来的fn，**重要的一点是把当前的effect赋值给了activeEffect,这一点非常重要，和收集依赖有着直接的关系**



## 总结

我们这里个响应式初始化阶段进行总结

**① setupComponent创建组件，调用composition-api,处理options（构建响应式）得到Observer对象。**

**② 创建一个渲染effect，里面包装了真正的渲染方法componentEffect，添加一些effect初始化属性。**

**③ 然后立即执行effect，然后将当前渲染effect赋值给activeEffect**


![](https://img-blog.csdnimg.cn/2020080915560862.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3psX0FsaWVu,size_16,color_FFFFFF,t_70)



# 六 依赖收集，get做了些什么？

## 回归mutableHandlers中的get方法

### 不同类型的get

```
/* 深度get */
const get = /*#__PURE__*/ createGetter()
/* 浅get */
const shallowGet = /*#__PURE__*/ createGetter(false, true)
/* 只读的get */
const readonlyGet = /*#__PURE__*/ createGetter(true)
/* 只读的浅get */
const shallowReadonlyGet = /*#__PURE__*/ createGetter(true, true)
```

上面我们可以知道，对于之前讲的四种不同的建立响应式方法，对应了四种不同的get,下面是一一对应关系。

**reactive ---------> get**

**shallowReactive --------> shallowGet**

**readonly ----------> readonlyGet**

**shallowReadonly --------------->   shallowReadonlyGet**

四种方法都是调用了`createGetter`方法，只不过是参数的配置不同


### createGetter

```
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: object, key: string | symbol, receiver: object) {
    const res = Reflect.get(target, key, receiver)
    /* 浅逻辑 */
    if (shallow) {
      !isReadonly && track(target, TrackOpTypes.GET, key)
      return res
    }
    /* 数据绑定 */
    !isReadonly && track(target, TrackOpTypes.GET, key)
    return isObject(res)
      ? isReadonly
        ?
          /* 只读属性 */
          readonly(res)
          /*  */
        : reactive(res)
      : res
  }
}js
```

![](https://img-blog.csdnimg.cn/2020080915563418.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3psX0FsaWVu,size_16,color_FFFFFF,t_70)

 **在vue2.0的时候。响应式是在初始化的时候就深层次递归处理了** 但是

**与vue2.0不同的是,即便是深度响应式我们也只能在获取上一级get之后才能触发下一级的深度响应式。**

比如

```
setup(){
 const state = reactive({ a:{ b:{} } })
 return {
     state
 }
}
```

**在初始化的时候，只有a的一层级建立了响应式，b并没有建立响应式，而当我们用state.a的时候，才会真正的将b也做响应式处理，也就是说我们访问了上一级属性后，下一代属性才会真正意义上建立响应式**

这样做好处是， **1 初始化的时候不用递归去处理对象，造成了不必要的性能开销。** **2 有一些没有用上的state，这里就不需要在深层次响应式处理。**


##  track->依赖收集器

```js
/* target 对象本身 ，key属性值  type 为 'GET' */
export function track(target: object, type: TrackOpTypes, key: unknown) {
  /* 当打印或者获取属性的时候 console.log(this.a) 是没有activeEffect的 当前返回值为0  */
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    /*  target -map-> depsMap  */
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    /* key : dep dep观察者 */
    depsMap.set(key, (dep = new Set()))
  }
   /* 当前activeEffect */
  if (!dep.has(activeEffect)) {
    /* dep添加 activeEffect */
    dep.add(activeEffect)
    /* 每个 activeEffect的deps 存放当前的dep */
    activeEffect.deps.push(dep)
  }
}
```

里面主要引入了两个概念 **targetMap** 和 **depsMap**

**targetMap** 键值对 proxy  :  depsMap proxy ： 为reactive代理后的 Observer对象 。 depsMap ：为存放依赖dep的 map 映射。

**depsMap** 键值对：key : deps key 为当前get访问的属性名， deps 存放effect的set数据类型。

**我们知道track作用大致是，首先根据 proxy对象，获取存放deps的depsMap，然后通过访问的属性名key获取对应的dep,然后将当前激活的effect存入当前dep收集依赖。**

主要作用 **①找到与当前proxy 和 key对应的dep。** **②dep与当前activeEffect建立联系，收集依赖。**




## 渲染effect函数如何触发get

```js
function componentEffect() {
    if (!instance.isMounted) {
        let vnodeHook: VNodeHook | null | undefined
        const { el, props } = initialVNode
        const { bm, m, a, parent } = instance
        /* TODO: 触发instance.render函数，形成树结构 */
        const subTree = (instance.subTree = renderComponentRoot(instance))
        if (bm) {
          //触发 beforeMount声明周期钩子
          invokeArrayFns(bm)
        }
        patch(
            null,
            subTree,
            container,
            anchor,
            instance,
            parentSuspense,
            isSVG
        )
        /* 触发声明周期 mounted钩子 */
        if (m) {
          queuePostRenderEffect(m, parentSuspense)
        }
        instance.isMounted = true
      } else {
        // 更新组件逻辑
        // ......
      }
}
```

这边代码大致首先会通过`renderComponentRoot`方法形成树结构，这里要注意的是，我们在最初`mountComponent`的`setupComponent`方法中，已经通过编译方法compile编译了template模版的内容，state.a state.b等抽象语法树，最终返回的render函数在这个阶段会被触发，在render函数中在模版中的表达式 state.a state.b 点语法会被替换成data中真实的属性，这时候就进行了真正的依赖收集，触发了get方法。接下来就是触发生命周期` beforeMount` ,然后对整个树结构重新patch,patch完毕后，调用mounted钩子


## 依赖收集流程总结

① 首先执行renderEffect ，赋值给activeEffect ，调用renderComponentRoot方法，然后触发render函数。

② 根据render函数，解析经过compile，语法树处理过后的模版表达式，访问真实的data属性，触发get。

③ get方法首先经过之前不同的reactive，通过track方法进行依赖收集。

④ track方法通过当前proxy对象target,和访问的属性名key来找到对应的dep。

⑤ 将dep与当前的activeEffect建立起联系。将activeEffect压入dep数组中，（此时的dep中已经含有当前组件的渲染effect,这就是响应式的根本原因）如果我们触发set，就能在数组中找到对应的effect，依次执行。

![](https://img-blog.csdnimg.cn/20200809155729316.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3psX0FsaWVu,size_16,color_FFFFFF,t_70)

# 七 set 派发更新

```

const set = /*#__PURE__*/ createSetter()
/* 浅逻辑 */
const shallowSet = /*#__PURE__*/ createSetter(true)
```

set也是分两个逻辑，set和shallowSet,两种方法都是由createSetter产生

## createSetter创建set

```js
function createSetter(shallow = false) {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    const oldValue = (target as any)[key]
    /* shallowSet逻辑 */

    const hadKey = hasOwn(target, key)
    const result = Reflect.set(target, key, value, receiver)
    /* 判断当前对象，和存在reactiveToRaw 里面是否相等 */
    if (target === toRaw(receiver)) {
      if (!hadKey) { /* 新建属性 */
        /*  TriggerOpTypes.ADD -> add */
        trigger(target, TriggerOpTypes.ADD, key, value)
      } else if (hasChanged(value, oldValue)) {
        /* 改变原有属性 */
        /*  TriggerOpTypes.SET -> set */
        trigger(target, TriggerOpTypes.SET, key, value, oldValue)
      }
    }
    return result
  }
}
```

**createSetter的流程大致是这样的**

**① 首先通过toRaw判断当前的proxy对象和建立响应式存入reactiveToRaw的proxy对象是否相等。** 

**② 判断target有没有当前key,如果存在的话，改变属性，执行trigger(target, TriggerOpTypes.SET, key, value, oldValue)。** 

**③ 如果当前key不存在，说明是赋值新属性，执行trigger(target, TriggerOpTypes.ADD, key, value)。**


## trigger

```js
/* 根据value值的改变，从effect和computer拿出对应的callback ，然后依次执行 */
export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
  /* 获取depssMap */
  const depsMap = targetMap.get(target)
  /* 没有经过依赖收集的 ，直接返回 */
  if (!depsMap) {
    return
  }
  const effects = new Set<ReactiveEffect>()        /* effect钩子队列 */
  const computedRunners = new Set<ReactiveEffect>() /* 计算属性队列 */
  const add = (effectsToAdd: Set<ReactiveEffect> | undefined) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        if (effect !== activeEffect || !shouldTrack) {
          if (effect.options.computed) { /* 处理computed逻辑 */
            computedRunners.add(effect)  /* 储存对应的dep */
          } else {
            effects.add(effect)  /* 储存对应的dep */
          }
        }
      })
    }
  }

  add(depsMap.get(key))

  const run = (effect: ReactiveEffect) => {
    if (effect.options.scheduler) { /* 放进 scheduler 调度*/
      effect.options.scheduler(effect)
    } else {
      effect() /* 不存在调度情况，直接执行effect */
    }
  }

  //TODO: 必须首先运行计算属性的更新，以便计算的getter
  //在任何依赖于它们的正常更新effect运行之前，都可能失效。

  computedRunners.forEach(run) /* 依次执行computedRunners 回调*/
  effects.forEach(run) /* 依次执行 effect 回调（ TODO: 里面包括渲染effect ）*/
}
```

**① 首先从targetMap中，根据当前proxy找到与之对应的depsMap。** 

**② 根据key找到depsMap中对应的deps，然后通过add方法分离出对应的effect回调函数和computed回调函数。** 

**③ 依次执行computedRunners 和 effects 队列里面的回调函数，如果发现需要调度处理,放进scheduler事件调度**

值得注意的的是：

**此时的effect队列中有我们上述负责渲染的renderEffect，还有通过effectAPI建立的effect，以及通过watch形成的effect。我们这里只考虑到渲染effect。至于后面的情况会在接下来的文章中和大家一起分享。**


![](https://img-blog.csdnimg.cn/20200809155749287.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3psX0FsaWVu,size_16,color_FFFFFF,t_70)

# 八 总结

我们总结一下整个数据绑定建立响应式大致分为三个阶段

1 初始化阶段： 初始化阶段通过组件初始化方法形成对应的**proxy**对象，然后形成一个负责渲染的effect。

2 get依赖收集阶段：通过解析template，替换真实data属性，来触发get,然后通过**stack**方法，通过proxy对象和key形成对应的deps，将负责渲染的effect存入deps。（这个过程还有其他的effect，比如watchEffect存入deps中 ）。

3 set派发更新阶段：当我们 this[key] = value 改变属性的时候，首先通过**trigger**方法，通过proxy对象和key找到对应的deps，然后给deps分类分成computedRunners和effect,然后依次执行，如果需要**调度**的，直接放入调度。