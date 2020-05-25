1. 创建一个新对象，如：var obj = {};

2. 新对象的_proto_属性指向构造函数的原型对象。

3. 将构造函数的作用域赋值给新对象。（也所以this对象指向新对象）

4. 执行构造函数内部的代码，将属性添加给obj中的this对象。

5. 返回新对象obj。



模拟



```
function _new(func) {
    // 第一步 创建新对象
    let obj= {}; 
    // 第二步 空对象的_proto_指向了构造函数的prototype成员对象
    obj.__proto__ = func.prototype;//
    // 一二步合并就相当于 let obj=Object.create(func.prototype)

    // 第三步 使用apply调用构造器函数，属性和方法被添加到 this 引用的对象中
    let result = func.apply(obj);
    if (result && (typeof (result) == "object" || typeof (result) == "function")) {
    // 如果构造函数执行的结果返回的是一个对象，那么返回这个对象
        return result;
    }
    // 如果构造函数返回的不是一个对象，返回创建的新对象
    return obj;
}
```

