# ES5 是实现块级作用域

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

## +0 === -0 true

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



## 请说出三种减少网页加载时间的方法

1. 尽量减少页面中重复http请求数量
2. 服务器开启gzip压缩
3. css样式的定义放置在文件的头部
4.  JavaScript脚本放置在文件末尾
5. 压缩合并JavaScript.css代码
6. 使用多域名负载网页内的多个文件.图片




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

https://juejin.im/post/5c76972af265da2dc4538b64)

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
Object.hasOwnProperty(name),返回布尔值，不会去寻找原型链上的属性

### Object.is和===的区别

Object.is在处理-0和+0是返回false,但是Object.is(NaN, NaN)返回true

```

function is(x, y) {
  if (x === y) {
    //运行到1/x === 1/y的时候x和y都为0，但是1/+0 = +Infinity， 1/-0 = -Infinity, 是不一样的
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    //NaN===NaN是false,这是不对的，我们在这里做一个拦截，x !== x，那么一定是 NaN, y 同理
    //两个都是NaN的时候返回true
    return x !== x && y !== y;
  }
```



### [] == ![]结果是什么？为什么？

== 中，左右两边都需要转换为数字然后进行比较。

[]转换为数字为0。

![] 首先是转换为布尔值，由于[]作为一个引用类型转换为布尔值为true,

因此![]为false，进而在转换成数字，变为0。

0 == 0 ， 结果为true







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

## '1'.toString()为什么可以调用？

```
var s = new Object('1');
s.toString();
s = null;
```

第一步: 创建Object类实例。注意为什么不是String ？ 由于Symbol和BigInt的出现，对它们调用new都会报错，目前ES6规范也不建议用new来创建基本类型的包装类。

第二步: 调用实例方法。

第三步: 执行完方法立即销毁这个实例。

整个过程体现了`基本包装类型`的性质，而基本包装类型恰恰属于基本数据类型，包括Boolean, Number和String。




## 堆栈内存

```
let a = {},
			b = '0',
			c = 0;
		a[b] = '珠峰';
		a[c] = '培训';
		console.log(a[b]);
// 培训

let a = {},
			b = Symbol('1'),
			c = Symbol('1');
		a[b] = '珠峰';
		a[c] = '培训';
		console.log(a[b]);
// 培训

let a = {},
			b = {
				n: '1'
			},
			c = {
				m: '2'
			};
		a[b] = '珠峰';
		a[c] = '培训';
		console.log(a[b]);
// 培训
a= {
  [object Object]: "培训"
}
```

```
var test = (function (i) {
			return function () {
				alert(i *= 2);
			}
		})(2);
		test(5);
// '4'  字符串4 alert的结果都要转化为字符串

alert({})
// [object Object]
```

```
var a = 0,
			b = 0;
		function A(a) {
			A = function (b) {
				alert(a + b++);
			};
			alert(a++);
		}
		A(1);
		A(2);
// 1   执行的是 function A
// 4   执行的是  A = function   函数被重写
```

```
function Foo() {
			getName = function () {
				console.log(1);
			};
			return this;
		}
		Foo.getName = function () {
			console.log(2);
		};
		Foo.prototype.getName = function () {
			console.log(3);
		};
		var getName = function () {
			console.log(4);
		};

		function getName() {
			console.log(5);
		}
		Foo.getName();
		getName();
		Foo().getName();
		getName();
		new Foo.getName();
		new Foo().getName();
		new new Foo().getName();

// 2
// 4
// 1
// 1
// 2
// 3
// 3
// 首先变量提升          getName = func => 5
// 后面代码执行时变量定义  getName = func => 4   前面生命的函数被覆盖
// Foo().getName() 执行后 getName = func => 1 方法又被覆盖  this => window   window.getName
// new Foo.getName();  点运算符优先级高
```


