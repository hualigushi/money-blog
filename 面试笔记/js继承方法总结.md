# 1. 继承分类
先来个整体印象。如图所示，JS中继承可以按照是否使用object函数（在下文中会提到），将继承分成两部分（Object.create是ES5新增的方法，用来规范化这个函数）。

其中，原型链继承和原型式继承有一样的优缺点，构造函数继承与寄生式继承也相互对应。寄生组合继承基于Object.create, 同时优化了组合继承，成为了完美的继承方式。

ES6 Class Extends的结果与寄生组合继承基本一致，但是实现方案又略有不同。

![](https://image-static.segmentfault.com/136/122/1361227592-5b550040b1c6c_articlex)

# 2. 继承方式

## 2.1 原型链继承
核心：将父类的实例作为子类的原型

```
SubType.prototype = new SuperType() 
// 所有涉及到原型链继承的继承方式都要修改子类构造函数的指向，否则子类实例的构造函数会指向SuperType。
SubType.prototype.constructor = SubType;
```
优点：父类方法可以复用
缺点：

  - 父类的引用属性会被所有子类实例共享
  - 子类构建实例时不能向父类传递参数

[「JavaScript」js中的继承方法总结](https://segmentfault.com/a/1190000015324440)
