### 页面流畅与 FPS

页面是一帧一帧绘制出来的，当每秒绘制的帧数（FPS）达到 60 时，页面是流畅的，小于这个值时，用户会感觉到卡顿。

1s 60帧，所以每一帧分到的时间是 1000/60 ≈ 16 ms。所以我们书写代码时力求不让一帧的工作量超过 16ms。

### Frame

那么浏览器每一帧都需要完成哪些工作？

![img](https:////upload-images.jianshu.io/upload_images/3963958-432f5165ba423f57.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

通过上图可看到，一帧内需要完成如下六个步骤的任务：

- 处理用户的交互
- JS 解析执行
- 帧开始。窗口尺寸变更，页面滚去等的处理
- requestAnimationFrame(rAF)
- 布局
- 绘制

### requestIdleCallback

上面六个步骤完成后没超过 16 ms，说明时间有富余，此时就会执行 `requestIdleCallback` 里注册的任务。

![img](https:////upload-images.jianshu.io/upload_images/3963958-01ac3e74fd8c0acf.png?imageMogr2/auto-orient/strip|imageView2/2/w/717/format/webp)

从上图也可看出，和 **`requestAnimationFrame` 每一帧必定会执行，`requestIdleCallback` 是浏览器空闲来执行任务。**

如此一来，假如浏览器一直处于非常忙碌的状态，`requestIdleCallback` 注册的任务有可能永远不会执行。此时可通过设置 `timeout` （见下面 API 介绍）来保证执行。

#### API

```dart
var handle = window.requestIdleCallback(callback[, options])
```

- callback：回调，即空闲时需要执行的任务，该回调函数接收一个IdleDeadline对象作为入参。其中IdleDeadline

  对象包含：

  - `didTimeout`，布尔值，表示任务是否超时，结合 `timeRemaining` 使用。
  - `timeRemaining()`，表示当前帧剩余的时间，也可理解为留给任务的时间还有多少。

- options：目前 options 只有一个参数

  - `timeout`。表示超过这个时间后，如果任务还没执行，则强制执行，不必等待空闲。

#### cancelIdleCallback

与 `setTimeout` 类似，返回一个唯一 id，可通过 `cancelIdleCallback` 来取消任务。



### 总结

一些低优先级的任务可使用 `requestIdleCallback` 等浏览器不忙的时候来执行，同时因为时间有限，它所执行的任务应该尽量是能够量化，细分的微任务（micro task）。

因为它发生在一帧的最后，此时页面布局已经完成，**所以不建议在 `requestIdleCallback` 里再操作 DOM**，这样会导致页面再次重绘。**DOM 操作建议在 rAF 中进行**。同时，操作 DOM 所需要的耗时是不确定的，因为会导致重新计算布局和视图的绘制，所以这类操作不具备可预测性。

**Promise 也不建议在这里面进行，因为 Promise 的回调属性 Event loop 中优先级较高的一种微任务，会在 `requestIdleCallback` 结束时立即执行，不管此时是否还有富余的时间，这样有很大可能会让一帧超过 16 ms。**



### 额外补充一下`window.requestAnimationFrame`

在没有 `requestAnimationFrame` 方法的时候，执行动画，我们可能使用 `setTimeout` 或 `setInterval` 来触发视觉变化；但是这种做法的问题是：回调函数执行的时间是不固定的，可能刚好就在末尾，或者直接就不执行了，经常会引起丢帧而导致页面卡顿。

![img](https:////upload-images.jianshu.io/upload_images/3963958-634e481776dbd2f4.jpg?imageMogr2/auto-orient/strip|imageView2/2/w/720/format/webp)



归根到底发生上面这个问题的原因在于时机，也就是浏览器要知道何时对回调函数进行响应。**`setTimeout` 或 `setInterval` 是使用定时器来触发回调函数的，而定时器并无法保证能够准确无误的执行，有许多因素会影响它的运行时机，比如说：当有同步代码执行时，会先等同步代码执行完毕，异步队列中没有其他任务，才会轮到自己执行**。并且，我们知道每一次重新渲染的最佳时间大约是 16.6 ms，如果定时器的时间间隔过短，就会造成 [过度渲染](https://links.jianshu.com/go?to=https%3A%2F%2Flink.zhihu.com%2F%3Ftarget%3Dhttps%3A%2F%2Fwww.zhangxinxu.com%2Fwordpress%2F2013%2F09%2Fcss3-animation-requestanimationframe-tween-%E5%8A%A8%E7%94%BB%E7%AE%97%E6%B3%95%2F)，增加开销；过长又会延迟渲染，使动画不流畅。

`requestAnimationFrame` 方法不同与 `setTimeout` 或 `setInterval`，它是由系统来决定回调函数的执行时机的，会请求浏览器在下一次重新渲染之前执行回调函数。无论设备的刷新率是多少，**`requestAnimationFrame` 的时间间隔都会紧跟屏幕刷新一次所需要的时间**；例如某一设备的刷新率是 75 Hz，那这时的时间间隔就是 13.3 ms（1 秒 / 75 次）。需要注意的是这个方法虽然能够**保证回调函数在每一帧内只渲染一次**，但是**如果这一帧有太多任务执行，还是会造成卡顿的；因此它只能保证重新渲染的时间间隔最短是屏幕的刷新时间。**

