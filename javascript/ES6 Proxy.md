[TOC]



# Proxy简介

> **Proxy** 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。

其基本语法如下：

```js
const p = new Proxy(target, handler);
```

参数说明：
**target**: 即我们要代理的对象。我们都知道在JS里“万物皆对象”，因此这个target 可以是任何类型的对象，包括原生数组，函数，甚至另一个Proxy对象。

同时，请注意到定义里的关键词“用于创建一个对象的代理”，因此Proxy只能代理对象，任何原始值类型都是无法代理的 。如对number, boolean类型的原始值代理都会得到 “Cannot create proxy with a non-object as target or handler”的错误：

![图片](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL00PQ5nOg80CxJancrFqraMOh3wrT94uRCr2icQNdrDZvwgwu3QWo9d0icA6Wa36ufDh8uxicXLnjtavQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

**handler：**其是一个属性全部为函数类型的对象**。**这些函数类型的属性 ，也 称之为捕获器（trap），其作用就是为了实现定义里说的“基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）”，注意，这里的拦截其实是对代理对象p的基本操作拦截，而并不是对被代理的对象target的拦截handler对象总共有以下截图共计13个属性方法



# Proxy 拦截方式？

![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHFMTibiazjk7P11OFXrh6W9WHK1HHROw6bcRqcN0G43l6Yia8Z1nExR7UYLA48kx1uz6xkRsugeowK3A/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

1. **get(target, prop, receiver)**：拦截对象属性的访问。

2. **set(target, prop, value, receiver)**：拦截对象属性的设置，最后返回一个布尔值。

3. **apply(target, object, args)**：用于拦截函数的调用，比如 proxy()。

4. **construct(target, args)**：方法用于拦截 new 操作符，比如 new proxy()。为了使 new操作符在生成的Proxy对象上生效，用于初始化代理的目标对象自身必须具有 [[Construct]] 内部方法（即 new target 必须是有效的）。

5. **has(target, prop)**：拦截例如 prop in proxy的操作，返回一个布尔值。

6. **deleteProperty(target, prop**)：拦截例如 delete proxy[prop] 的操作，返回一个布尔值。

7. **ownKeys(target)**：拦截 Object.getOwnPropertyNames(proxy)、Object.keys(proxy)、for in 循环等等操作，最终会返回一个数组。

7. **getOwnPropertyDescriptor(target, prop)**：拦截 Object.getOwnPropertyDescriptor(proxy, propKey)，返回属性的描述对象。

8. **defineProperty(target, propKey, propDesc)**：拦截 Object.defineProperty(proxy, propKey, propDesc）、Object.defineProperties(proxy, propDescs)，返回一个布尔值。

9. **preventExtensions(target)**：拦截 Object.preventExtensions(proxy)，返回一个布尔值。

10. **getPrototypeOf(target)**：拦截 Object.getPrototypeOf(proxy)，返回一个对象。

11. **isExtensible(target)**：拦截 Object.isExtensible(proxy)，返回一个布尔值。

12. **setPrototypeOf(target, proto)**：拦截 Object.setPrototypeOf(proxy, proto)，返回一个布尔值。如果目标对象是函数，那么还有两种额外操作可以拦截。



# 用法

```js
const obj = {
  foo: 'bar',
  fn () {
    console.log('fn调用了');
  }
};
const handler = {
  get (target, key) {
    console.log(`我被读取了${key}属性`);
    return target[key];
  },
  set (target, key, val) {
    console.log(`我被设置了${key}属性, val: ${val}`);
    target[key] = val;
  },
  apply (target, thisArg, argumentsList) {
    console.log('fn调用被拦截');
    return target.call(thisArg, ...argumentsList);
  }
};
const p = new Proxy(obj, handler);
p.foo; // 输出：我被读取了foo属性
p.foo = 'bar1'; // 输出：我被设置了foo属性, val: bar1
p.fn(); // 输出：我被读取了fn属性 fn调用了
```

在上述代码中，并没有拦截到obj.fn()函数调用操作，而却是只是输出了“我被读取了fn属性”。

究其原因，我们可以再次从Proxy的定义里的关键词“基本操作”找到答案 。

那么何为**基本操作**呢？在上述代码中就表明了对象属性的读取（p.foo） 、设置(p.foo='xxx')就是基本操作，与之对应的就是非基本操作，我们可以称之为**复合操作**。

而obj.fn()就是一个典型的复合操作，它是由两个基本操作组成的分别是读取操作（obj.fn）, 和函数调用操作（取到obj.fn的值再进行调用），而我们代理的对象是obj，并不是obj.fn。因此，我们只能拦截到fn属性的读取操作。

这也说明了**Proxy只能对对象的基本操作进行代理**，这点尤为重要。



```js
const handler = {
  apply (target, thisArg, argumentsList) {
    console.log('函数调用被拦截');
    return target.call(thisArg, ...argumentsList);
  }
};
new Proxy(() => {}, handler)();  // 输出：函数调用被拦截
```

表明函数的调用也是基本操作，是可以被apply拦截到的



# Reflex和 Proxy

首先还是要来看下Reflex在MDN里的定义：

> **Reflect** 是一个内置的对象，它提供拦截 JavaScript 操作的方法。这些方法与proxy handlers 的方法相同.

不难发现，Reflex对象的方法和proxy的拦截器（第二个入参handler）的方法完全一致，同样有着13个方法：
![图片](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL00PQ5nOg80CxJancrFqraMOp5PIFTyUlA9ia1800Tlx3St5a3QpnZ5UVF8VIf1PBBl4B6pspUVcp9g/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

那么，Reflect对象的作用是 什么呢，拿Reflect.get举例简单来说其作用之一就是提供了访问一个对象属性的默认行为，如以下代码：

```js
const obj = {foo: 'foo'};
obj.foo; 
// 等同于
Reflect.get(obj, 'foo');
```

既然 作用一致 ，那么使用Reflect.get有何意义呢，在回答这个问题之前，我们先看下以下代码：

```js
const obj = {
  foo: 'foo',
  get bar () {
    return this.foo;
  }
};
const handler = {
  get (target, key, receiver) {
    console.log(`我被读取了${key}属性`);
    return target[key];
  },
  set (target, key, val, receiver) {
    console.log(`我被设置了${key}属性, val: ${val}`);
    target[key] = val;
  }
};
const p = new Proxy(obj, handler);
p.bar; // 输出：我被读取了bar属性
// Q： 为什么读取foo属性没有被拦截
```

在上述代码中我们定义了一个foo属性和bar属性，其中bar属性是一个访问器属性，通过get函数 return this.foo获取得到 的，因此按理来说我们在读取bar属性时候会触发读取foo属性，也同样会被get的trap所拦截到，但实际代码运行结果并没有拦截到foo属性。

这是为什么呢，答案的关键在于bar访问器里的this指向。

梳理下代码运行过程：p.bar 实际上会被handler的get捕获 返回 target['bar']，而这里的target实际上就是obj，所以这时候bar访问器里的this指向obj，this.foo，实际就是obj.foo。

而obj并不是proxy对象p，所以访问其foo属性并不会被拦截到。

那么如何也能触发到foo属性的拦截呢，这时候Reflect就派上用场了，有以下代码：

```js
const obj = {
  foo: 'foo',
  get bar () {
    return this.foo;
  }
};
const handler = {
  get (target, key, receiver) {
    console.log(`我被读取了${key}属性`);
    return Reflect.get(target, key, receiver);
  },
  set (target, key, val, receiver) {
    console.log(`我被设置了${key}属性, val: ${val}`);
    return Reflect.set(target, key, val, receiver);
  }
};
const p = new Proxy(obj, handler)
p.bar; // 输出：我被读取了bar属性   我被读取了foo属性
```

如上面代码所示，我们能正确地触发了foo属性的拦截，其实现的关键在于Reflect.get的第三个参数receiver ，其作用就是改变this指向，在MDN里有以下描述：

> 如果target对象中指定了getter，receiver则为getter调用时的this值。

而我们这里的receiver就是p对象，this.foo 等同于 p.foo，因此访问bar属性的 时候同样可以拦截得到。

也正是因为this指向的问题，所以建议在proxy对象拦截器里的属性方法都通过Reflect.*去操作。



# Proxy 可以做哪些有意思的事情？

## 骚操作：代理类
使用 `construct` 可以代理类, 类的本质也是构造函数和原型（对象）组成的，完全可以对其进行代理。

有这么一个需求，需要拦截对属性的访问，以及计算原型上函数的执行时间, 可以对属性设置 `get` 拦截，对原型函数设置 `apply` 拦截。

先考虑对下面的 `Person` 类的原型函数进行拦截。使用 `Object.getOwnPropertyNames` 来获取原型上面所有的函数，遍历这些函数并对其使用 `apply` 拦截。
```js
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  say() {
    console.log(`my name is ${this.name}, and my age is ${this.age}`)
  }
}
const proxyTrack = (targetClass) => {
  const prototype = targetClass.prototype;
  Object.getOwnPropertyNames(prototype).forEach((name) => {
        targetClass.prototype[name] = new Proxy(prototype[name], {
            apply(target, context, args) {
                console.time();
                target.apply(context, args);
                console.timeEnd();
            }
        })
  })

  return new Proxy(targetClass, {
    construct(target, args) {
      const obj = new target(...args);
      return new Proxy(obj, {
        get(target, prop) {
              console.log(`${target.name}.${prop} is being getting`);
              return target[prop]
        }
      })
    }
  })       
}

const MyClass = proxyTrack(Person);
const myClass = new MyClass('tom', 21);
myClass.say();
myClass.name;
```



## 等不及可选链：深层取值（get）

平时取数据的时候，经常会遇到深层数据结构，如果不做任何处理，很容易造成 JS 报错。

为了避免这个问题，也许你会用多个 && 进行处理

最新的 ES 提案中提供了可选链的语法糖，支持我们用下面的语法来深层取值。

`country?.province?.city?.name`

但是这个特性只是处于 stage3 阶段，还没有被正式纳入 ES 规范中，更没有浏览器已经支持了这个特性。

```js
let isFirst = true;
function noop() {}
let proxyVoid = get(undefined);
function get(obj) {
   if (obj === undefined) {
       if (!isFirst) {
           return proxyVoid;
       }
       isFirst = false;
   }
   // 注意这里拦截的是 noop 函数
   return new Proxy(noop, {
       // 这里支持返回执行的时候传入的参数
       apply(target, context, [arg]) {
           return obj === undefined ? arg : obj;
       },
       get(target, prop) {
           if (
               obj !== undefined &&
               obj !== null &&
               obj.hasOwnProperty(prop)
           ) {
               return get(obj[prop]);
           }
           return proxyVoid;
       }
   })
}
this.get = get;

get(obj)() === obj; // true
get(obj).person.name(); // undefined
get(obj).person.name.xxx.yyy.zzz(); // Cannot read property 'xxx' of undefined
```



##  管道

```js
const pipe = (value) => {
    const stack = [];
    const proxy = new Proxy({}, {
        get(target, prop) {
            if (prop === 'execute') {
                return stack.reduce(function (val, fn) {
                    return fn(val);
                }, value);
            }
            stack.push(window[prop]);
            return proxy;
        }
    })
    return proxy;
}
var double = n => n * 2;
var pow = n => n * n;
pipe(3).double.pow.execute;
```
注意：这里为了在 stack 存入方法，使用了 window[prop] 的形式，是为了获取到对应的方法。也可以将 double 和 pow 方法挂载到一个对象里面，用这个对象替换 window。
