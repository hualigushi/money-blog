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



## Promise.all 缺陷

都知道 Promise.all 具有并发执行异步任务的能力。但它的最大问题就是如果其中某个任务出现异常(reject)，所有任务都会挂掉，Promise直接进入reject 状态。

**但是其他的promise还是会执行**

解决：es 2020 `Promise.allSettled`
```javascript
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



# **取消promise**

```
      // 方法一 取消promise方法   promise.race方法
      function wrap(p) {
        let obj = {};
        let p1 = new Promise((resolve, reject) => {
          obj.resolve = resolve;
          obj.reject = reject;
        });
        obj.promise = Promise.race([p1, p]);
        return obj;
      }

      let promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(123);
        }, 1000);
      });
      let obj = wrap(promise);
      obj.promise.then(res => {
        console.log(res);
      });
      obj.resolve("请求被拦截了");

      obj.reject("请求被拒绝了");


      //方法二 取消promise方法   新包装一个可操控的promise

      function wrap(p) {
        let res = null;
        let abort = null;

        let p1 = new Promise((resolve, reject) => {
          res = resolve;
          abort = reject;
        });

        p1.abort = abort;
        p.then(res, abort);

        return p1;
      }

      let promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(123);
        }, 1000);
      });
      let obj = wrap(promise);
      obj.then(res => {
        console.log(res);
      });
      obj.abort("请求被拦截");
```

