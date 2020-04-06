## slice()和splice()区别

1. slice(start,end)：方法可从已有数组中返回选定的元素，返回一个新数组，包含从start到end（不包含该元素）的数组元素。

注意：该方法不会改变原数组，而是返回一个子数组，如果想删除数组中的一段元素，应该使用Array.splice()方法。

- start参数：必须，规定从何处开始选取，如果为负数，规定从数组尾部算起的位置，-1是指最后一个元素。
- end参数：可选（如果该参数没有指定，那么切分的数组包含从start倒数组结束的所有元素，如果这个参数为负数，那么规定是从数组尾部开始算起的元素）。

2. splice()：该方法向或者从数组中添加或者删除项目，返回被删除的项目。（该方法会改变原数组）

splice（index,howmany,item1,...itemX）

- index参数：必须，整数，规定添加或者删除的位置，使用负数，从数组尾部规定位置。
- howmany参数：必须，要删除的数量，如果为0，则不删除项目。
- tem1,...itemX参数：可选，向数组添加的新项目。

## 字符串反转

```
function reverse(str) {
  if (str.length === 1) {
    return str
  }
  return str.slice(-1) + reverse(str.slice(0, -1))
}

function reverse(str) {
  return str.split('').reduce((prev, next) => next + prev)
}

function reverse(str) {
  return str
    .split('')
    .reverse()
    .join('')
}
```

## typeof null 等于 Object

不同的对象在底层原理的存储是用二进制表示的，在 javaScript中，如果二进制的前三位都为 0 的话，系统会判定为是 Object类型。null的存储二进制是 000，也是前三位，所以系统判定 null为 Object类型。

扩展：

这个 bug 个第一版的 javaScript留下来的。俺也进行扩展一下其他的几个类型标志位：

- 000：对象类型。
- 1：整型，数据是31位带符号整数。
- 010：双精度类型，数据是双精度数字。
- 100：字符串，数据是字符串。
- 110：布尔类型，数据是布尔值。

1. typeof null==='object'  //true

2. null instanceof Object  //false


## ES6 中的 class 语法糖

```
class A{}
console.log(A instanceof Function) // true
```

## 转布尔类型

```
Boolean({})		    // true
Boolean([])		    // true
```

## 转数字类型
```
Number(null);      // 0  
Number('');        // 0  
Number([]);        // 0 
Number([1,2]);     // NaN
Number('10a');     // NaN
Number(undefined); // NaN
```

## +0 === -0 true

## new/字面量 与 Object.create(null) 创建对象的区别

- new 和 字面量创建的对象的原型指向 Object.prototype，会继承 Object 的属性和方法。
- 而通过 Object.create(null) 创建的对象，其原型指向 null，null 作为原型链的顶端，没有也不会继承任何属性和方法。

## js 实现数值千分位

`number.toLocaleString()`

## 建设多语言网站必须要注意的细节

1. 各语言间的切换
2. 切换语言后能确保停留在当前页面
3. 检测用户默认语言
4. 编码和字体
5. 语言是从左到右，还是从右到左
6. 日期格式、时区和货币
7. 验证码的使用
8. 电话号码

## 前端缓存

![](https://upload-images.jianshu.io/upload_images/13277068-efe830b68127838c.png?imageMogr2/auto-orient/strip|imageView2/2/w/800/format/webp)

## 页面可见性（Page Visibility API） 可以有哪些用途 ？

- 通过 visibilityState 的值检测页面当前是否可见，以及打开网页的时间等;
- 在页面被切换到其他后台进程的时候，自动暂停音乐或视频的播放；

## [] == []  false

两个操作数都是空数组，都是Object对象,存放在不同的堆中

## 连续二进制

计算一个整数的二进制表示中连续出现1最多的次数。

比如13的二进制是：1101，那么他的二进制表示中连续出现的1最多为2次，所以答案就是2：

输入描述:
一个整数n表示要计算的数字。（1<=n<=1018）

输出描述:
输出一个数字表示n的二进制表示中连续出现1最多的次数。

## 请说出三种减少网页加载时间的方法

1. 尽量减少页面中重复http请求数量
2. 服务器开启gzip压缩
3. css样式的定义放置在文件的头部
4.  JavaScript脚本放置在文件末尾
5. 压缩合并JavaScript.css代码
6. 使用多域名负载网页内的多个文件.图片

## http协议中与资源缓存相关的协议头有哪些？

## DOM Tree与Render Tree之间的区别是什么?

- Dom Tree 包含了所有的HTMl标签，包括display：none  ，JS动态添加的元素等。
- Dom Tree 和样式结构体结合后构建呈现Render Tree。Render Tree 能识别样式，每个node都有自己的style，且不包含隐藏的节点（比如display : none的节点）。


## console.log(typeof NaN === "number");  // logs "true"

## Symbol 不会被序列化

```
const a = {
    key1: Symbol(),
    key2: 10
}
// What will happen?
console.log(JSON.stringify(a));

{"key2":10}

```

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

# 箭头函数

普通函数和箭头函数的区别：

1. 箭头函数没有prototype(原型)，所以箭头函数本身没有this
2. 箭头函数的this在定义的时候继承自外层第一个普通函数的this。
3. 如果箭头函数外层没有普通函数，严格模式和非严格模式下它的this都会指向window(全局对象)
4. 箭头函数本身的this指向不能改变，但可以修改它要继承的对象的this。
5. 箭头函数的this指向全局，使用arguments会报未声明的错误。
6. 箭头函数的this指向普通函数时,它的argumens继承于该普通函数
7. 使用new调用箭头函数会报错，因为箭头函数没有constructor
8. 箭头函数不支持new.target
9. 箭头函数不支持重命名函数参数,普通函数的函数参数支持重命名

[箭头函数](https://juejin.im/post/5c76972af265da2dc4538b64)

## promise resolve 只能接受并处理一个参数，多余的参数会被忽略掉
使用对象传递多个参数
```
promise2 = new Promise((resolve,reject)=>{
    let a = 1
    let b = 2
    let c = 3
    resolve({a,b,c}) 
})

promise2.then(obj=>{
    console.log(obj.a,obj.b,obj.c)
})
```

## Javascript中，有一个函数，执行时对象查找时，永远不会去查找原型，这个函数是？
Oject.hasOwnProperty(name),返回布尔值，不会去寻找原型链上的属性

## Object.is()
Object.is在处理-0和+0是返回false,但是Object.is(NaN, NaN)返回true

## 如何检查一个数字是否为整数
检查一个数字是小数还是整数，可以使用一种非常简单的方法，就是将它对 1 进行取模，看看是否有余数
```
function isInt(num) {
  return num % 1 === 0;
}

console.log(isInt(4)); // true
console.log(isInt(12.2)); // false
console.log(isInt(0.3)); // false
```