[TOC]



# 1 Promise值穿透

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



# 2 根据条件添加对象属性

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



# 3 scrollIntoView
`Element.scrollIntoView()` 方法让当前的元素滚动到浏览器窗口的可视区域内。

`document.querySelector(`[data-cate='${alpha}']`).scrollIntoView()`



# 4 快速幂运算
可以使用位左移运算符<<来表示以 2 为底的幂运算

```js
// 以下表达式是等效的:
Math.pow(2, n);
2 << (n - 1);
2**n;
```



# 5 快速取整

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



# 6 可以在 indexOf(…) 函数前面加一个~ 来进行布尔检查，看看一个项是否存在于 String 或 Array 中。



# 9 意外的全局变量

#### 问题

在以下代码中，`typeof a`和`typeof b`的值分别是什么：

```js
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

```js
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



# 10 `(a, b) => a.name.localeCompare(b.name)` 

中文名排序



# 11 生成随机UID

```js
const genUid = () => {
  var length = 20
  var soupLength = genUid.soup_.length
  var id = []
  for (var i = 0; i < length; i++) {
    id[i] = genUid.soup_.charAt(Math.random() * soupLength)
  }
  return id.join('')
}
genUid.soup_ = '!#$%()*+,-./:;=?@[]^_`{|}~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
genUid() // ;l`yCPc9A8IuK}?N6,%}

```



# 12 无loop生成指定长度的数组

```js
const List = len => [...new Array(len).keys()]
const list = List(10) // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```



# 13 localStorage 监听

- localStorage.setItem监听：自定义事件 setItemEvent
- localStorage.getItem监听：自定义事件 getItemEvent
- localStorage.removeItem监听：自定义事件 removeItemEvent

```javascript
//监听自定义事件 setItemEvent
localStorage.setItem = (Orgin=>{
    return function(key,value){
        let setItemEvent = new CustomEvent('setItemEvent',{detail:{setKey:key,value}})
        window.dispatchEvent(setItemEvent)
        Orgin.call(this,key,typeof value == 'string'? value : JSON.stringify(value))
    }
})(localStorage.setItem)

//监听自定义事件 getItemEvent
localStorage.getItem = (Orgin=>{
    return function(key){
        let result = JSON.parse(Orgin.call(this,key))
        let getItemEvent = new CustomEvent('getItemEvent',{detail:{getKey:key,value:result}})
        window.dispatchEvent(getItemEvent)
        return result 
    }
})(localStorage.getItem)


//监听自定义事件 removeItemEvent
localStorage.removeItem = (Orgin=>{
    return function(key){
        let removeItemEvent = new CustomEvent('removeItemEvent',{detail:{removeKey:key}})
        window.dispatchEvent(removeItemEvent)
        Orgin.call(this,key)
    }
})(localStorage.removeItem)
```

监听：

```javascript
//localStorage.setItem监听
window.addEventListener('setItemEvent',function(e){
    console.log(e.detail)
})

//localStorage.getItem监听
window.addEventListener('getItemEvent',function(e){
    console.log(e.detail)
}) 

//localStorage.removeItem监听
window.addEventListener('removeItemEvent',function(e){
    console.log(e.detail)
})
```



# 14 a标签安全问题

使用a标签打开一个新窗口过程中的安全问题。新页面中可以使用window.opener来控制原始页面。如果新老页面同域，那么在新页面中可以任意操作原始页面。如果是不同域，新页面中依然可以通过window.opener.location，访问到原始页面的location对象

在带有target="_blank"的a标签中，加上rel="noopener"属性。如果使用window.open的方式打开页面，将opener对象置为空。

```
var newWindow = window.open();
newWindow.opener = null;
```

