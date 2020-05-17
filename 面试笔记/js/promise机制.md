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

## Promise.all 缺陷
都知道 Promise.all 具有并发执行异步任务的能力。但它的最大问题就是如果其中某个任务出现异常(reject)，所有任务都会挂掉，Promise直接进入reject 状态。

解决：es 2020 `Promise.allSettled`
```
Promise.allSettled([
    Promise.reject({code: 500, msg: '服务异常'}),
    Promise.resolve({ code: 200, list: []}),
    Promise.resolve({code: 200, list: []})
])
.then((ret) => {
    /*
        0: {status: "rejected", reason: {…}}
        1: {status: "fulfilled", value: {…}}
        2: {status: "fulfilled", value: {…}}
    */
    // 过滤掉 rejected 状态，尽可能多的保证页面区域数据渲染
    RenderContent(ret.filter((el) => {
        return el.status !== 'rejected';
    }));
});
```