Promise 是异步编程的一种解决方案，比传统的解决方案——回调函数和事件——更合理和更强大。

所谓Promise，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。

从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。

Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。 状态: pending（进行中）、fulfilled（已成功）和rejected（已失败）。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。




## 原理

Promise的调用流程：

1. Promise的构造方法接收一个executor()，在new Promise()时就立刻执行这个executor回调
2. executor()内部的异步任务被放入宏/微任务队列，等待执行
3. then()被执行，收集成功/失败回调，放入成功/失败队列
4. executor()的异步任务被执行，触发resolve/reject，从成功/失败队列中取出回调依次执行

观察者模式， 执行顺序是`then收集依赖 -> 异步触发resolve -> resolve执行依赖`



## Promise 的特性

1. promise 内部 分 微任何 和 宏任务　
2. promise 本身是同步的，但它的成功的回调 .then 方法 是异步的。
3. promise 的状态是不可逆的
4. then return 出去的值，会被后面的 then 接收，如果后面还跟着 then 的话，catch同理
5. promise 不管返回什么值，都会被包装成一个promise 对象，即使这个返回值是error
6. then 接收到的值，如果不是一个函数，会穿透到后面的 then
7. promise 对象如果 resolve 或者 reject 的也是一个 promise 对象，那么 promise 对象的状态会由 resolve 或者 reject 的 promise 对象的状态决定。



## Promise.then参数

```js
const newPromise = new Promise((resolve,reject)=>{

})

// 该 promise 状态由 newPromise 决定，相当于状态进行了移交
new Promise((resolve,reject)=>{
	resolve(newPromise)
}).then(res=>{

}, err=>{

})
```

```js
传入一个对象，并且这个对象有实现then方法（并且这个对象是实现了thenable）
那么会执行该then方法，并且由该then方法决定后续状态
new Promise((resolve,reject)=>{
	const obj ={
		then: function(resolve, reject){
			// resolve('success')
			reject('error')
		}
	}
	resolve(newPromise)
}).then(res=>{

}, err=>{

})
```



## Promise.all 

`Promise.all(iterable)` 返回一个新的 Promise 实例。

此实例在 `iterable` 参数内所有的 `promise` 都 `fulfilled` 或者参数中不包含 `promise` 时，状态变成 `fulfilled`；

如果参数中 `promise` 有一个失败 `rejected`，此实例回调失败，失败原因的是第一个失败 `promise` 的返回结果。



Promise.all 实现

![图片](https://mmbiz.qpic.cn/mmbiz_png/nnic7Ckj9Nq0zXqZ0Q1e2sUkKsRLQcwn5F3OQOAFicggwrrWTHRTUEPIjES9VlwEzYlEwhtia52TlDl8G1yUaIXxw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=)

### 

它的最大问题就是如果其中某个任务出现异常(reject)，所有任务都会挂掉，Promise直接进入reject 状态。

**但是其他的promise还是会执行**

解决：es 2020 `Promise.allSettled`

