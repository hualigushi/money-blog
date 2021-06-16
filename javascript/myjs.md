[TOC]

# 1. img srcset sizes

```html
<img src="lighthouse-200.jpg" sizes="50vw"
    srcset="lighthouse-100.jpg 100w, lighthouse-200.jpg 200w,
            lighthouse-400.jpg 400w, lighthouse-800.jpg 800w,
            lighthouse-1000.jpg 1000w, lighthouse-1400.jpg 1400w,
            lighthouse-1800.jpg 1800w" alt="a lighthouse">
```
如果没有设置srcset属性，或者没值，那么sizes属性也将不起作用

渲染了一张宽度为视窗宽度一半（sizes="50vw"）的图像，根据浏览器的宽度及其设备像素比，允许浏览器选择正确的图像，而不考虑浏览器窗口有多大。



# 2. Promise值穿透

解释：.then 或者 .catch 的参数期望是函数，传入非函数则会发生值穿透

```js
 Promise.resolve('foo')
    .then(Promise.resolve('bar'))
    .then(function(result){
      console.log(result)
    })

foo
```
```js
Promise.resolve(1)
  .then(function(){return 2})
  .then(Promise.resolve(3))
  .then(console.log)
  
  2
```

```js
Promise.resolve(1)
  .then(function(){return 2})
  .then(function(){return Promise.resolve(3)})
  .then(console.log)
  
3
```


# 3. 根据条件添加对象属性

```js
const getUser = (emailIncluded) => {
  return {
    name: 'John',
    surname: 'Doe',
    ...(emailIncluded ? { email : 'john@doe.com' } : null)
  }
}

const user = getUser(true);
console.log(user); // 输出 { name: "John", surname: "Doe", email: "john@doe.com" }

const userWithoutEmail = getUser(false);
console.log(userWithoutEmail); // 输出 { name: "John", surname: "Doe" }
```



# 4. scrollIntoView
`Element.scrollIntoView()` 方法让当前的元素滚动到浏览器窗口的可视区域内。

`document.querySelector(`[data-cate='${alpha}']`).scrollIntoView()`



# 5. 快速幂运算
可以使用位左移运算符<<来表示以 2 为底的幂运算

```js
// 以下表达式是等效的:
Math.pow(2, n);
2 << (n - 1);
2**n;
```



# 6. 快速取整

```js
console.log(23.9 | 0);  // Result: 23
console.log(-23.9 | 0); // Result: -23
```
| 的实际行为取决于操作数是正数还是负数，所以在使用这个运算符时要确保你知道操作数是正是负。

如果 n 是正数，那么 n|0 向下取整，否则就是向上取整。它会移除小数部分，也可以使用~~ 达到同样的效果。



移除整数尾部数字
```js
console.log(1553 / 10   | 0)  // Result: 155
console.log(1553 / 100  | 0)  // Result: 15
console.log(1553 / 1000 | 0)  // Result: 1
```



# 7. 可以在 indexOf(…) 函数前面加一个~ 来进行布尔检查，看看一个项是否存在于 String 或 Array 中。



# 8. 意外的全局变量

#### 问题

在以下代码中，`typeof a`和`typeof b`的值分别是什么：

```
function foo() {
  let a = b = 0;
  a++;
  return a;
}

foo();
typeof a; // => ???typeof b; // => ???
```

#### 答案

让我们仔细看看第2行：`let a = b = 0`。这个语句确实声明了一个局部变量`a`。但是，它确实声明了一个*全局*变量`b`。

在`foo()`作用域或全局作用域中都没有声明变量 `b` ”。因此JavaScript将表达式 `b = 0` 解释为 `window.b = 0`。

![image.png](https://user-gold-cdn.xitu.io/2019/11/3/16e3029e3d0539ec?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



`b`是一个偶然创建的全局变量。

在浏览器中，上述代码片段相当于:

```
function foo() {
  let a;  window.b = 0;  a = window.b;  a++;
  return a;
}

foo();
typeof a;        // => 'undefined'
typeof window.b; // => 'number'
```

`typeof a`是 `'undefined'`。变量`a`仅在 `foo()`范围内声明，在外部范围内不可用。

`typeof b`等于`'number'`。`b`是一个值为 `0`的全局变量。



