# 1. Proxy 提供了哪些拦截方式？

Proxy 一般是用来架设在目标对象之上的一层拦截，来实现对目标对象访问和修改的控制。

Proxy 是一个构造函数，使用的时候需要配合 new 操作符，直接调用会报错。

Proxy 构造函数接收两个参数，第一个参数是需要拦截的目标对象，这个对象只可以是对象、数组或者函数；

第二个参数则是一个配置对象，提供了拦截方法，即使这个配置对象为空对象，返回的 Proxy 实例也不是原来的目标对象。

Proxy 支持13种拦截操作

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

# 2. Object.defineProperty
![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHFMTibiazjk7P11OFXrh6W9WHeMicTDC4F0rRUiaiaJNhic58CaJmlqgBtlu3VhrpQAB0hkAlWtuoBKhWJA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## 2.1  Object.defineProperty 不能监听所有属性
`Object.defineProperty` 无法一次性监听对象所有属性，必须遍历或者递归来实现。
```js
let girl = {
     name: "marry",
     age: 22
   }
   /* Proxy 监听整个对象*/
   girl = new Proxy(girl, {
     get() {}
     set() {}
   })
   /* Object.defineProperty */
   Object.keys(girl).forEach(key => {
     Object.defineProperty(girl, key, {
       set() {},
       get() {}
     })
   })
```

## 2.2 Object.defineProperty 无法监听新增加的属性

## 2.3. Object.defineProperty 无法响应数组操作

`Object.defineProperty` 可以监听数组的变化，`Object.defineProperty` 无法对 push、shift、pop、unshift 等方法进行响应。

```js
const arr = [1, 2, 3];
   /* Proxy 监听数组*/
   arr = new Proxy(arr, {
     get() {},
     set() {}
   })
   /* Object.defineProperty */
   arr.forEach((item, index) => {
     Object.defineProperty(arr, `${index}`, {
       set() {},
       get() {}
     })
   })

   arr[0] = 10; // 都生效
   arr[3] = 10; // 只有 Proxy 生效
   arr.push(10); // 只有 Proxy 生效
```

对于新增加的数组项，`Object.defineProperty` 依旧无法监听到。因此，在 Mobx 中为了监听数组的变化，默认将数组长度设置为1000，监听 0-999 的属性变化。
```js
const arr = [1, 2, 3];
   /* Object.defineProperty */
   [...Array(1000)].forEach((item, index) => {
     Object.defineProperty(arr, `${index}`, {
       set() {},
       get() {}
     })
   });
   arr[3] = 10; // 生效
   arr[4] = 10; // 生效
```

在 Vue 和 Mobx 中都是通过重写原型实现的。

在定义变量的时候，判断其是否为数组，如果是数组，那么就修改它的 `__proto__`，将其指向 `subArrProto`，从而实现重写原型链。
```js
const arrayProto = Array.prototype;
   const subArrProto = Object.create(arrayProto);
   const methods = ['pop', 'shift', 'unshift', 'sort', 'reverse', 'splice', 'push'];
   methods.forEach(method => {
     /* 重写原型方法 */
     subArrProto[method] = function() {
       arrayProto[method].call(this, ...arguments);
     };
     /* 监听这些方法 */
     Object.defineProperty(subArrProto, method, {
       set() {},
       get() {}
     })
   })
```

# 3. 语法

## 3.1 get

get 方法用来拦截对目标对象属性的读取，它接收三个参数，分别是目标对象、属性名和 Proxy 实例本身。
基于 get 方法的特性，可以实现很多实用的功能，比如在对象里面设置私有属性（一般定义属性我们以 _ 开头表明是私有属性） ，实现禁止访问私有属性的功能。

```js
const person = {
    name: 'tom',
    age: 20,
    _sex: 'male'
}
const proxy = new Proxy(person, {
    get(target, prop) {
        if (prop[0] === '_') {
            throw new Error(`${prop} is private attribute`);
        }
        return target[prop]
    }
})
proxy.name; // 'tom'
proxy._sex; // _sex is private attribute
```

还可以给对象中未定义的属性设置默认值。通过拦截对属性的访问，如果是 undefined，那就返回最开始设置的默认值。
```js
let person = {
    name: 'tom',
    age: 20
}
const defaults = (obj, initial) => {
    return new Proxy(obj, {
        get(target, prop) {
            if (prop in target) {
                return target[prop]
            }
            return initial
        }
    })
}
person = defaults(person, 0);
person.name // 'tom'
person.sex // 0
person = defaults(person, null);
person.sex // null
```

## 3.2 set

set 方法可以拦截对属性的赋值操作，一般来说接收四个参数，分别是目标对象、属性名、属性值、Proxy 实例。
下面是一个 set 方法的用法，在对属性进行赋值的时候打印出当前状态。
```js
const proxy = new Proxy({}, {
    set(target, key, value, receiver) {
        console.log(`${key} has been set to ${value}`);
        Reflect.set(target, key, value);
    }
})
proxy.name = 'tom'; // name has been setted ygy
```

第四个参数 receiver 则是指当前的 Proxy 实例，在下例中指代 proxy。
```js
const proxy = new Proxy({}, {
    set(target, key, value, receiver) {
        if (key === 'self') {
            Reflect.set(target, key, receiver);
        } else {
            Reflect.set(target, key, value);
        }
    }
})
proxy.self === proxy; // true
```

使用 Proxy 可以在填写表单的时候，拦截其中的字段进行格式校验。

通常来说，大家都会用一个对象来保存验证规则，这样会更容易对规则进行扩展。
```js
// 验证规则
const validators = {
    name: {
        validate(value) {
            return value.length > 6;
        },
        message: '用户名长度不能小于六'
    },
    password: {
        validate(value) {
            return value.length > 10;
        },
        message: '密码长度不能小于十'
    },
    moblie: {
        validate(value) {
            return /^1(3|5|7|8|9)[0-9]{9}$/.test(value);
        },
        message: '手机号格式错误'
    }
}
```

然后编写验证方法，用 set 方法对 form 表单对象设置属性进行拦截，拦截的时候用上面的验证规则对属性值进行校验，如果校验失败，则弹窗提示。
```js
// 验证方法
function validator(obj, validators) {
    return new Proxy(obj, {
        set(target, key, value) {
            const validator = validators[key]
            if (!validator) {
                target[key] = value;
            } else if (validator.validate(value)) {
                target[key] = value;
            } else {
                alert(validator.message || "");
            }
        }
    })
}
let form = {};
form = validator(form, validators);
form.name = '666'; // 用户名长度不能小于六
form.password = '113123123123123';
```

如果这个属性已经设置为不可写，那么 set 将不会生效（但 set 方法依然会执行）。
```js
const person = {
    name: 'tom'
}
Object.defineProperty(person, 'name', {
    writable: false
})
const proxy = new Proxy(person, {  
    set(target, key, value) {
        console.log(666)
        target[key] = 'jerry'
    }
})
proxy.name = '';
```

## 3.3. apply

`apply` 一般是用来拦截函数的调用，它接收三个参数，分别是目标对象、上下文对象（this）、参数数组。
```js
function test() {
    console.log('this is a test function');
}
const func = new Proxy(test, {
    apply(target, context, args) {
        console.log('hello, world');
        target.apply(context, args);
    }
})
func();
```

通过 apply 方法可以获取到函数的执行次数，也可以打印出函数执行消耗的时间，常常可以用来做性能分析。
```js
function log() {}
const func = new Proxy(log, {
    _count: 0,
    apply(target, context, args) {
        target.apply(context, args);
        console.log(`this function has been called ${++this._count} times`);
    }
})
func()
```

## 3.4. construct

`construct` 方法用来拦截 `new` 操作符。它接收三个参数，分别是目标对象、构造函数的参数列表、`Proxy` 对象，最后需要返回一个对象。


```js
function Person(name, age) {
    this.name = name;
    this.age = age;
}
const P = new Proxy(Person, {
    construct(target, args, newTarget) {
        console.log('construct');
        return new target(...args);
    }
})
const p = new P('tom', 21); // 'construct'
```

如果构造函数没有返回任何值或者返回了原始类型的值，那么默认返回的就是 `this`，如果返回的是一个引用类型的值，那么最终 `new` 出来的就是这个值。
因此，你可以代理一个空函数，然后返回一个新的对象。
```js
function noop() {}
const Person = new Proxy(noop, {
    construct(target, args, newTarget) {
        return {
            name: args[0],
            age: args[1]
        }
    }
})
const person = new Person('tom', 21); // { name: 'tom', age: 21 }
```

# 4. Proxy 可以做哪些有意思的事情？

## 4.1 骚操作：代理类
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
 
## 4.2 等不及可选链：深层取值（get）
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

## 4.3 管道
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
