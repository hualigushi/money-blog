## javascript事件循环

1. 所有同步任务偶在主线程上执行，形成一个很执行栈
2. 主线程之外，还存在一个任务队列（task queue）只要异步任务有了运行结果，就在“任务队列”之中放置一个事件。
3. 一旦“执行栈”中的所有同步任务执行完毕，系统就会读取“任务队列”，看看里面有哪些事件。那些对应的异步任务，就结束等待状态，进入执行栈开始被执行。
4. 主线程不断重复以上三步。也就是常说的event loop（事件循环）

js引擎存在monitoring process进程，会持续不断的检查主线程执行栈是否为空，一旦为空，就会去Event Queue那里检查是否有等待被调用的函数。

```
例4
<div class="outer">
  <div class="inner"></div>
</div>

var outer = document.querySelector('.outer');
var inner = document.querySelector('.inner');

new MutationObserver(function() {
  console.log('mutate');
}).observe(outer, {
  attributes: true
});

function onClick() {
  console.log('click');

  setTimeout(function() {
    console.log('timeout');
  }, 0);

  Promise.resolve().then(function() {
    console.log('promise');
  });

  outer.setAttribute('data-random', Math.random());
}

inner.addEventListener('click', onClick);
outer.addEventListener('click', onClick);

// 同时点击到两个div时执行结果
click
promise
mutate
click
promise
mutate
timeout
timeout
```

没点击前：
1. 绑定new MutationObserver 存入浏览器资源
2. 绑定两个div元素的click事件 存入浏览器资源

3. 触发outer元素click的onClick 存入浏览器资源
4. 触发inner元素click的onClick 存入浏览器资源
5. 先执行outer的回调
6. 输出click
7. 执行setTimeout - macrotask存入浏览器资源
8. 执行outer.setAttribute('data-random', Math.random())，触发MutationObserver - marcotask 等待microtask先执行
9. 执行Promise.resolve - microtask 输出promise
10. microtask 执行完毕，执行MutationObserver输出mutate

-----下面执行的并不是outer回调里的setTimeout------

11. 执行inner的回调
12. 输出inner回调的click
13. 执行inner回调的setTimeout - macrotask存入浏览器资源
14. 执行inner回调outer.setAttribute('data-random', Math.random())，触发MutationObserver - marcotask 等待microtask先执行
15. 执行inner回调的Promise.resolve - microtask 输出promise
16. microtask 执行完毕，执行MutationObserver输出mutate

最后因为两个setTimeout都是在触发inner回调后存入浏览器资源的

所以最后两个setTimeout回调完成排入队列执行.
