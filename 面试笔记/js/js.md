# ES5 实现块级作用域

```
function outputNumbers(count){
  (function(){
    for(var i = 0; i < count; ++i){
      console.log(i);
    }  
  })();
  console.log(i);//Uncaught ReferenceError: i is not defined
}
outputNumbers(5);
```



# instanceof 和 Array.isArray 是如何实现的

instanceof

```
能在实例的原型对象链中找到改构造函数的prototype属性所指向的原型对象，返回true
instance.[_proto_] === instance.constructor.prototype
```

Array.isArray

```
通过Object.prototype.toString.call()
```



## +0 === -0   true



## new/字面量 与 Object.create(null) 创建对象的区别

- new 和 字面量创建的对象的原型指向 Object.prototype，会继承 Object 的属性和方法。
- 而通过 Object.create(null) 创建的对象，其原型指向 null，null 作为原型链的顶端，没有也不会继承任何属性和方法。



## js 实现数值千分位

`number.toLocaleString()`



## 页面可见性（Page Visibility API） 可以有哪些用途 ？

- 通过 visibilityState 的值检测页面当前是否可见，以及打开网页的时间等;
- 在页面被切换到其他后台进程的时候，自动暂停音乐或视频的播放；



## [] == []  false

两个操作数都是空数组，都是Object对象,存放在不同的堆中



### [] == ![]结果是什么？为什么？

== 中，左右两边都需要转换为数字然后进行比较。

[]转换为数字为0。

![] 首先是转换为布尔值，由于[]作为一个引用类型转换为布尔值为true,

因此![]为false，进而在转换成数字，变为0。

0 == 0 ， 结果为true




## console.log(typeof NaN === "number");  // true



## 如何检查一个数字是否是整数？

一个最简单的方法是判断除以1的余数是否为0.

```
function isInt(num) {
  return num % 1 === 0;
}

console.log(isInt(4)); // true
console.log(isInt(12.2)); // false
console.log(isInt(0.3)); // false
```





## Javascript中，有一个函数，执行时对象查找时，永远不会去查找原型，这个函数是？

Object.hasOwnProperty(name),返回布尔值，不会去寻找原型链上的属性





# 去除字符串里面的重复字符

```javascript
[...new Set('ababbc')].join('')
```







