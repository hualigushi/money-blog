# 1. `Object.defineProperty` 真的无法监测数组下标的变化吗？
事实上，`Object.defineProperty` 本身是可以监控到数组下标的变化的，只是在 Vue 的实现中，从性能 / 体验的性价比考虑，放弃了这个特性。
```js
function defineReactive(data, key, value) {
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
     get: function defineGet() {
      console.log(`get key: ${key} value: ${value}`)
      return value
    },
     set: function defineSet(newVal) {
      console.log(`set key: ${key} value: ${newVal}`)
      value = newVal
    }
  })
}
function observe(data) {
  Object.keys(data).forEach(function(key) {
    defineReactive(data, key, data[key])
  })
}
let arr = [1, 2, 3]
observe(arr)
```

### 1. 通过下标获取某个元素和修改某个元素的值
![](https://mmbiz.qpic.cn/mmbiz_png/XIibZ0YbvibkVTs4Fpzl9OsLQqmQgZy7WYqIRrytTBbInrSZEnAUM9TVNe5X8gT7R6SumVue1yLbsVAhmsmh8ABg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)
可以看到，通过下标获取某个元素会触发 getter 方法, 设置某个值会触发 setter 方法。

### 2. 数组的 push 方法
![](https://mmbiz.qpic.cn/mmbiz_png/XIibZ0YbvibkVTs4Fpzl9OsLQqmQgZy7WYDpELzvM1w9LVrwelqUjaCpkicMhYeHUlRHg1Cg3355QTSgV9yHiaTicDg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)
push 并未触发 setter 和 getter方法，

数组的下标可以看做是对象中的 key ，

这里 push 之后相当于增加了下索引为 3 的元素，但是并未对新的下标进行 observe ，所以不会触发。

### 3. 数组的 unshift 方法
![](https://mmbiz.qpic.cn/mmbiz_png/XIibZ0YbvibkVTs4Fpzl9OsLQqmQgZy7WYTALsjpGrxduicWUMk7sgdQeGtRsU067CROhedjEZINgcNIZBDMCERZg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)
unshift 操作会导致原来索引为 0、1、2、3 的值发生变化，

这就需要将原来索引为 0、1、2、3 的值取出来，然后重新赋值，

所以取值的过程触发了 getter ，赋值时触发了 setter 。

尝试通过索引获取一下对应的元素：
![](https://mmbiz.qpic.cn/mmbiz_png/XIibZ0YbvibkVTs4Fpzl9OsLQqmQgZy7WY8lZy4QMr5DmTqtWibV3HnrJC5UFUN5zltggzWE0gN9icGnIaPOYicAW9A/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)
只有索引为 0、1、2 的属性才会触发 getter 。

这里我们可以对比对象来看，arr 数组初始值为 [1, 2, 3]，即只对索引为 0，1，2 执行了 observe 方法，

所以无论后来数组的长度发生怎样的变化，依然只有索引为 0、1、2 的元素发生变化才会触发。

其他的新增索引，就相当于对象中新增的属性，需要再手动 observe 才可以。

### 4. 数组的 pop 方法
![](https://mmbiz.qpic.cn/mmbiz_png/XIibZ0YbvibkVTs4Fpzl9OsLQqmQgZy7WYsNfzoRPd8WyuGAiabMQicpNl0H0SGkSXJtCuD5AeXRpsvibMl45UonKTQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

当移除的元素为引用为 2 的元素时，会触发 getter 。

![](https://mmbiz.qpic.cn/mmbiz_png/XIibZ0YbvibkVTs4Fpzl9OsLQqmQgZy7WY3kTZzTuaibx0Gz9ibmHNt3s5WgUlY9FIkk93OianITAz0gMbsKAghvCIw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

删除了索引为 2 的元素后，再去修改或获取它的值时，不会再触发 setter 和 getter 。

这和对象的处理是同样的，数组的索引被删除后，就相当于对象的属性被删除一样，不会再去触发 observe。

### 总结
`Object.defineProperty` 在数组中的表现和在对象中的表现是一致的，数组的索引就可以看做是对象中的 key。
  - 通过索引访问或设置对应元素的值时，可以触发 getter 和 setter 方法。
  - 通过 push 或 unshift 会增加索引，对于新增加的属性，需要再手动初始化才能被 observe。
  - 通过 pop 或 shift 删除元素，会删除并更新索引，也会触发 setter 和 getter 方法。

所以，Object.defineProperty是有监控数组下标变化的能力的，只是 Vue2.x 放弃了这个特性。


# 2. 分析 Vue2.x 中对数组 Observe 部分源码。
Vue 的 Observer 类定义在 core/observer/index.js 中。
![](https://mmbiz.qpic.cn/mmbiz_png/XIibZ0YbvibkVTs4Fpzl9OsLQqmQgZy7WYRE5gF3kCWXlXCtQstu1FoOpmQ74Jn4gQ2yYCcD14oibqUtUZ7m6XxrQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

Vue 的 Observer 对数组做了单独的处理。

![](https://mmbiz.qpic.cn/mmbiz_png/XIibZ0YbvibkVTs4Fpzl9OsLQqmQgZy7WYUdaEJjqw1Kn9CtOXNL1KWKrzXCZwgbsMYPevTslajBLK8GPXUQ22Ug/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

hasProto 判断数组的实例是否有 proto 属性，如果有 proto 属性就会执行 protoAugment 方法，

将 arrayMethods 重写到原型上。hasProto 的定义如下：
![](https://mmbiz.qpic.cn/mmbiz_png/XIibZ0YbvibkVTs4Fpzl9OsLQqmQgZy7WYmFvCFoUWaS8p3JtiaVrM6yKdCS2xV8bouhrms4rY7PzWncctKwkomWQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

arrayMethods 是对数组的方法进行重写，定义在 core/observer/array.js 中，下面是这部分源码的分析：
```js
/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */
import { def } from '../util/index'
// 复制数组构造函数的原型，Array.prototype 也是一个数组。
const arrayProto = Array.prototype
// 创建对象，对象的 __proto__ 指向 arrayProto，所以 arrayMethods 的 __proto__ 包含数组的所有方法。
export const arrayMethods = Object.create(arrayProto)
// 下面的数组是要进行重写的方法
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
/**
 * Intercept mutating methods and emit events
 */
// 遍历 methodsToPatch 数组，对其中的方法进行重写
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  // def 方法定义在 lang.js 文件中，是通过 object.defineProperty 对属性进行重新定义。
  // 即在 arrayMethods 中找到我们要重写的方法，对其进行重新定义
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      // 上面已经分析过，对于 push，unshift 会新增索引，所以需要手动 observe
      case 'push':
      case 'unshift':
        inserted = args
        break
      // splice 方法，如果传入了第三个参数，也会有新增索引，所以也需要手动 observe
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // push，unshift，splice 三个方法触发后，在这里手动 observe，其他方法的变更会在当前的索引上进行更新，所以不需要再执行 ob.observeArray
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
```

# 3. 对比Object.defineProperty和 Proxy。
