1. 创建一个新对象，如：var obj = {};

2. 新对象的_proto_属性指向构造函数的原型对象。

3. 将构造函数的作用域赋值给新对象。（也所以this对象指向新对象）

4. 执行构造函数内部的代码，将属性添加给obj中的this对象。

5. 返回新对象obj。



模拟

```
function newOperator(ctor, ...args) {
    if(typeof ctor !== 'function'){
      throw 'newOperator function the first param must be a function';
    }
    let obj = Object.create(ctor.prototype);
    let res = ctor.apply(obj, args);
    
    let isObject = typeof res === 'object' && res !== null;
    let isFunction = typoof res === 'function';
    return isObect || isFunction ? res : obj;
};
```

