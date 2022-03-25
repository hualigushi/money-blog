# forEach

1. 三个参数，第一个value, 第二个 index, 第三个数组体。
2. 适用于数组，set，map，不适用于字符串，Object。
3. 无法修改和删除集合数据，效率和for循环相同，不用关心集合下标的返回。
4. 不能终止循环，break，continue不能使用。



# for in

1. 索引为字符串
2. 多用于遍历对象，json，数组，无顺序，增加了转换过程所以开销比较大
3. 可扩展属性也会遍历
4. 支持break, continue

在 JavaScript 中所有的数组都是对象，这意味着你可以给数组添加字符串属性

```
array = ['a', 'b', 'c']

array.test = 'testing'
console.log(array) // [ 'a', 'b', 'c', test: 'testing' ]
```

只有 for-in 循环才能够打印出这个键值对

```
for (const key in array) {
    console.log(array[key])
}
```

通常情况下，不建议使用 for-in 来遍历数组，除非你知道这个数组对象中没有这样的属性



##### `for...in`慢的原因

这是因为 `for...in`语法是第一个能够迭代对象键的JavaScript语句。

循环对象键（ `{}`）与在数组（ `[]`）上进行循环不同，

**因为引擎会执行一些额外的工作来跟踪已经迭代的属性。**





# for of

1. 是目前遍历数组最好的方法，可以用在set，map，类数组，字符串上，但是不支持原生的Object遍历。
2. 支持break, continue

3. 并不能循环一个普通对象，但是可以循环一个拥有enumerable属性的对象，可使用内置的Object.keys()，Object.values()方法

```
let obj = {a: '1', b: '2', c: '3', d: '4'}
for (let o of obj) {
    console.log(o)   //Uncaught TypeError: obj[Symbol.iterator] is not a function
}
```

```
let obj = {a: '1', b: '2', c: '3', d: '4'}
for (let o of Object.keys(obj)) {
    console.log(o) // a,b,c,d
}
```

```
let obj = {a: '1', b: '2', c: '3', d: '4'}
for (let o of Object.values(obj)) {
    console.log(o) // 1,2,3,4
}
```

循环一个字符串

```
let str = 'love'
for (let o of str) {
    console.log(o) // l,o,v,e
}
```

循环一个Map

```
let iterable = new Map([["a", 1], ["b", 2], ["c", 3]]);

for (let [key, value] of iterable) {
  console.log(value);
}
// 1
// 2
// 3
```
```
for (let entry of iterable) {
  console.log(entry);
}
// [a, 1]
// [b, 2]
// [c, 3]
```

循环一个Set

```
let iterable = new Set([1, 1, 2, 2, 3, 3]);

for (let value of iterable) {
  console.log(value);
}
// 1
// 2
// 3
```

循环一个类型化数组

```
let iterable = new Uint8Array([0x00, 0xff]);

for (let value of iterable) {
  console.log(value);
}
// 0
// 255
```

### 数组空项

假设要遍历的数组张这样：array = ['a', , 'c']

```
// a undefined c
for (let index = 0; index < array.length; index++) {
    const element = array[index]
    console.log(element) // 没有跳过空值
}

// a c
array.forEach(element => {
    console.log(element) // 跳过空值
})

// a c
for (const key in array) {
    console.log(array[key]) // 跳过空值
}

// a undefined c
for (const iterator of array) {
    console.log(iterator) // 没有跳过空值
}
```

只有 forEach 和 for-in 遍历会跳过空值，值得注意的是，如果空值明确设置为 undefined 如 ['a', undefined, 'c'] 那么所有遍历方法都能够将 undefined 遍历出来


### Async/Await

async 异步编程中 forEach 则不会按照预期执行，如下：

```
// a undefined c
{(async () => {
    for (const iterator of array) {
        const result = await new Promise(res => setTimeout(() => { res(iterator) }, 1000))
        console.log(result)
    }
})()}

// a c
{(async () => {
    for (const key in array) {
        const result = await new Promise(res => setTimeout(() => { res(array[key]) }, 1000))
        console.log(result)
    }
})()}

// a undefined c
{(async () => {
    for (let index = 0; index < array.length; index++) {
        const result = await new Promise(res => setTimeout(() => { res(array[index]) }, 1000))
        console.log(result)
    }
})()}

// 语法错误
{(async () => {
    array.forEach(element => {
        const result = await new Promise(res => setTimeout(() => { res(element) }, 1000))
        console.log(result)
    })
})()}
```

按照上述写法 forEach 会报错，首先看一下 forEach 的原理：

本质上 forEach 就像一个 for 循环的包装：

```
Array.prototype.forEach = function (callback) {
  for (let index = 0; index < this.length; index++) {
    callback(this[index], index, this)
  }
}
```

如果按照上述写法，那么在回调函数内部调用 await 需要这个回调函数本身也是 async 函数，因此改为如下写法：

```
{(async () => {
    array.forEach(async element => {
        const result = await new Promise(res => setTimeout(() => { res(element) }, 1000))
        console.log(result)
    })
})()}
```

按照这样写法，forEach 最后会变成并行执行，而非串行。

因此建议使用 for-of 循环

或者创建一个 forEachAwait 方法：

```
async function forEachAwait(arr, cb) {
    for (let index = 0; index < array.length; index++) {
        await cb(arr[index], index, arr)
    }
}

// a undefined c
{(async () => {
    forEachAwait(array, async (elem) => {
        const result = await new Promise(res => setTimeout(() => { res(elem) }, 1000))
        console.log(result)
    })
})()}
```