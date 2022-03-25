![](https://upload-images.jianshu.io/upload_images/2155778-00aaaa2a79f56541.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

## Event Loop 的特点

 - 每个 phase 阶段都有存放与自己相关回调的 queue
 - 进入一个 phase 后，都会执行完自己 queue 的回调才会进入下一个 phase
 - 在回调中执行长时间任务会被阻塞
 - 在每次运行的事件循环之间，Node.js 检查它是否在等待任何异步 I/O 或计时器，如果没有的话，则关闭干净, 事件循环就结束了



 ## Event Loop 各阶段说明

  - timers 阶段：执行已经准备好的 setTimeout、setInterval 回调。
  - pending callbacks 阶段：执行被延迟到下一个 event loop 的I/O回调。如网络、stream、tcp错误回调
  - idle, prepare 阶段：内部使用。
  - poll 阶段：取出新的 I/O 事件回调执行，除close 事件、setImmediate、timers 回调， node 程序将在这个阶段阻塞。
  - check 阶段：setImmediate() 将在这个阶段调用。
  - close callbacks 阶段：close 事件的回调将在这执行，如 socket.on('close', ...)



## setTimeout() 与 setImmediate() 对比

 - setTimeout() 属于 timers phase，设计在定时完成后执行。
 - setImmediate() 属于 check phase。每次 poll phase 后执行。
 - 如果在 I/O 循环中调用，setImmediate 一定先执行 (因为下一个阶段就是 check 阶段)。否则 setImmediate() 与 setTimeout(cb, 0) 的执行顺序不可预测
 > 两者在执行顺序上不能确定

```
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout');
  }, 0);
  setImmediate(() => {
    console.log('immediate');
  });
});
```



## 理解 process.nextTick()

 - process.nextTick() 不属于 Event Loop 的各个阶段
 - process.nextTick() 的回调在每个阶段结束后进入下个阶段前同步执行
 - 绝不可在 process.nextTick 的 callback 中执行 long-running task
 - 不要执行会返回process.nextTick 的函数，不然这个阶段会一直认为还有回调需要执行，事件循环会被阻塞在这个阶段。
 ```
let bar;
function someAsyncApiCall(callback) { 
	callback(); 
}
someAsyncApiCall(() => {
	// 同步的执行，但此时变量还没赋值
	console.log('bar', bar); // undefined
});
bar = 1;
 ```

```
let bar;
function someAsyncApiCall(callback) {
  process.nextTick(callback);
}
someAsyncApiCall(() => {
  // process.nextTick 使此回调在阶段结束后才执行
  console.log('bar', bar); // 1
});
bar = 1;
```

```
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {
  constructor() {
    super()
    this.emit('event'); // 不会正常触发，事件还没绑定
  }
}

const myEmitter = new MyEmitter();

myEmitter.on('event', () => {
  console.log('an event occurred!');
});
```

```
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {
  constructor() {
    super()
    process.nextTick(() => {
      this.emit('event'); // 会正常触发，因为是在继承阶段结束后才执行
    })
  }
}

const myEmitter = new MyEmitter();

myEmitter.on('event', () => {
  console.log('an event occurred!');
});
```



## process.nextTick() 与 setImmediate() 对比

 - process.nextTick() 不属于 Event Loop 的各个阶段
 - process.nextTick() 的回调在每个阶段结束后进入下个阶段前同步执行
 - process.nextTick() 在同一个阶段立即执行。
 - setImmediate() 只每次 poll phase 后进入 check phase 才执行。
 - process.nextTick() 比 setImmediate() 触发得更直接。
 - setImmediate() 更容易理解，如果需要拆分 long-running task 请使用 setImmediate()
