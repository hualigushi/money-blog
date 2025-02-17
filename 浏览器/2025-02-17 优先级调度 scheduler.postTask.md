## 什么是优先级调度

假设，我们有个**「记录日志」**的脚本需要在页面初始化后执行：

```scss
initCriticalTracking();
```

调用栈火炬图如下：

可以看到，这是个执行了249.08ms的长任务，在执行期间浏览器会掉帧（表现为：浏览器卡顿）。

现在，我们将其包裹在**优先级调度函数scheduler.postTask**的回调函数中：

```javascript
scheduler.postTask(() => initCriticalTracking());
```

长任务被分解为多个短任务：

在每个任务之间浏览器有机会重排、重绘，减少了掉帧的可能性。

这种**根据任务优先级将任务拆解，分配执行时间的技术**，就是**优先级调度**。

scheduler.postTask是`Chrome`实现的**优先级调度API**。

> scheduler.postTask属于试验功能，需要在 chrome://flags 中打开 #enable-experimental-web-platform-features

## 之前是如何实现优先级调度的

在`scheduler.postTask`出现之前，通常使用浏览器提供的**会在不同阶段调用的API**模拟**优先级调度**，比如：

+   `requestAnimationFrame`（简称`rAF`）一般用来处理动画，会在浏览器渲染前触发
    
+   `requestIdleCallback`（简称`rIC`）在每一帧没有其他任务的空闲时间调用
    
+   `setTimeout`、`postMessage`、`MessageChannel`在渲染之间触发
    

`React`使用`MessageChannel`实现优先级调度，`setTimeout`作为降级方案。

但是，这些`API`毕竟都有本职工作。用他们实现的**优先级调度**比较粗糙。

基于此原因，`postTask Scheduler`诞生了。

## postTask Scheduler的使用

`scheduler.postTask`有3种可选优先级：

| 优先级 | 描述 | polyfill实现 |
| --- | --- | --- |
| user-blocking | 最高优先级，可能会阻塞用户交互 | 使用 MessageChannel 调度任务， setTimeout作为降级方案 |
| user-visible | 第二优先级，对用户可见，但不会阻塞用户交互。比如：渲染第二屏内容。这是默认优先级 | 在 user-blocking 实现的基础上通过优先级队列控制 |
| background | 最低优先级，通常执行不紧急任务，例如记录日志 | 使用 rIC 实现，setTimeout(0)作为降级方案 |

使用方式很简单，通过以下方式注册的回调函数会以**默认优先级**调度：

```javascript
// 默认优先级
scheduler.postTask(() => console.log('Hello, postTask'));
```

你也可以指定优先级与执行延迟：

```javascript
// 调用后延迟1秒执行，优先级最低
scheduler.postTask(() => console.log('Hello, postTask'), {
   delay: 1000,
   priority: 'background',
});
```

`postTask`建立在AbortSignal API上，所以我们可以取消尚在排队还未执行的回调函数。

通过使用`TaskController API`控制：

```javascript
const controller = new TaskController('background');
window.addEventListener('beforeunload', () => controller.abort());
 
scheduler.postTask(() => console.log('Hello, postTask'), {
   signal: controller.signal,
});
```

同时，实验性的`schedule.wait`方法可以让我们轻松的等待某一时机后再执行任务。

比如，我们可以在页面加载完成后异步加载`xxx.js`：

```javascript
async function loadxxx() {
  // 等待事件被派发
  await scheduler.wait('myPageHasLoaded');
  return import('xxx.js');
}
 
// 页面加载后派发事件
window.dispatchEvent(new CustomEvent('myPageHasLoaded'));
```

以上代码被简化为`postTask`的`event`配置项：

```dart
scheduler.postTask(() => import('xxx.js'), {
   event: 'myPageHasLoaded'
})
```

## 总结

**优先级调度**可以应用在很多领域，比如：

+   资源提前、延后请求
    
+   第三方资源延迟加载
