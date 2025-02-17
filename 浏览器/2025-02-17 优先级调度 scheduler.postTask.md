[TOC]

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
1. 检查 `window.shceduler` 是否可用
首先，你需要检查当前浏览器是否支持 `window.scheduler`API
```js
if('scheduler in window && 'postTask' in window.scheduler){
    console.log('supported')
} else {
    console.log('not supported')
}
```
2. 使用 `postTask`
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
## 实际使用

### 1.资源预加载
预加载轮播图中的下一个图像或者在用户加载页面之前加载详细信息可以显着提高站点的性能和用户的感知性能。

我们最近使用postTask调度程序实现了一个延迟、分阶段和可取消的图像预加载程序，用于我们的主搜索图像轮播。

让我们看看如何使用postTask构建一个简单版本。

**图片轮播预加载的触发时机：**
1. 列表在屏幕上显示大约 50%时
2. 延迟一秒；如果用户仍在查看它，则在轮播中加载下一张图片
3. 如果用户滑动图像，则预加载下三张图像，每张图片之间间隔100ms
4. 如果轮播在一秒计时器结束之前的任何时候离开视口，我们应该取消所有尚未完成的预加载任务。如果用户导航到另一个页面，也取消所有预加载任务
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f88e81367836489c9c88fab2d7f85dc5~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

当下一张幻灯片滚动到视图中时，将加载第二张图片。一旦我们滑动，接下来的 3 次加载，每次都在前一次加载后 100 毫秒开始
让我们首先看一下这个问题的第一部分，即用户将卡片滚动到视图中一半以上且维持一秒钟以上，则预加载轮播中的下一张图像。
虽然在接下来的几个示例中我们使用React，但这并非必需的。
这里所有的概念也可以使用其他框架，甚至你也可以不用任何框架。
我们假设有一个名为 preloadImages 的方法，它开始获取下一张图片并在完成预加载图片时切换一个布尔值。
```js
const [hasPreloadedNextImage, setHasPreloadedNextImage] = useState(false);
const preloadImages = useCallback((imageUrls) => {
  imageUrls.forEach((url) => preloadImage(url))
  setHasPreloadedNextImage(true);
}, []);
```
我们可以将 `Intersection Observer` 和 `postTask` 调度程序相结合，实现在视图中50%一秒后加载第二张图像。
```js
const controller = useRef<TaskController | null>(null);
const [carouselDomRef, carouselIsInView] = useInView({ 
  skip: hasPreloadedNextImage, 
  threshold: 0.5, 
});
 
useEffect(() => {
 if (carouselIsInView) {
   controller.current = new TaskController('background');
   scheduler.postTask(() => preloadImages([cardPhotoUrls[1]]), { delay: 1000, signal: controllerRef.current?.signal });
 } else {
   controller.current?.abort();
   controller.current = null;
 }
}, [carouselIsInView, preloadImages]);
```
这里我们使用了 `useInView` 用于检测元素是否在视图中。
我们设置了一个阈值为 0.5 ，这意味着元素的一半必须在视图中才会被视为“可见”。
我们还设置了 skip 属性，以便在我们预加载下一张图片时跳过这个元素。
当元素进入视图时，我们创建了一个新的 `TaskController` ，用于控制预加载任务的优先级。
然后，我们使用 `postTas`k 调度程序调用 `preloadImages`，预加载下一张图片。
我们设置了一个延迟参数为1000ms，这意味着用户必须在视图中至少停留1秒钟，然后才会开始预加载下一张图片。
我们还将`TaskController`的信号传递给 postTask，以便在用户滚动出视图时可以取消预加载任务。
当元素不再在视图中时，我们使用 `TaskController` 的 `abort` 方法取消任何挂起的预加载任务。

**将网络资源分阶段载入**
我们需要实现的最后一个要求是，在用户滑动轮播图后，每个图像请求之间间隔100毫秒。
让我们看看如何使用postTask 调度程序修改现有代码以应对这种情况。
首先，让我们添加一个 hook，在用户与之交互时调用我们的预加载逻辑，以预加载三个图像。
我们将跳过第一张图像，因为我们已经加载了它。
```js
useEffect(() => {
 if (hasInteractedWithCarousel) {
   preloadImages(imageUrls.slice(1, 4));
 }
}, [hasInteractedWithCarousel]);

// We use the list index combined with delay to 
// stagger the call to preload each image by 100ms each.
const preloadImages = useCallback((imageUrls) => {
 imageUrls.forEach((url, index) => {
   scheduler.postTask(() => preloadImage(url), {
     delay: index * 100,
     signal: controller.current.signal,
   });
 });
 
 setHasPreloadedNextImages(true);
}, []);
```
postTask 调度程序的一个目标是提供一个低级别的API，以便在其之上构建。我们已经构建了一个集成，使我们在React中使用时可以执行许多不同的模式或策略，我们认为这非常有用。

### 2.在React中使用postTask

尽管与 React、Vue、Angular、Lit 等进行自定义集成并不是必需的，但这样做可以获得一些重大的好处。
例如，在React中，当一个组件卸载时，我们通常希望取消任何仍在排队的任务。
我们可以在 useEffect 的返回的函数中做到这一点。
然而，每次都靠人去这样做是一项不小的挑战，而不这样做可能会导致内存泄漏。
还有一个挑战是记得在调用 abort() 时捕获调度程序抛出的任何·AbortError·，因为这些错误是非常可预期的，但我们不能为其做出全面的异常处理。

**以下是一个 ·usePostTaskScheduler· 钩子的一些希望具备的功能，这将使它更容易使用：**
- 传递一个 enabled 标志，允许绕过调度程序以便于A/B测试；
- 允许轻松取消任务，包括在卸载时自动取消；
- 自动将信号传播到 scheduler.postTask 和 scheduler.wait；
- 捕获和抑制 AbortErrors 或类似的错误；
- 支持强大的调试功能；
- 允许为通用模式指定策略，例如我们在本文中介绍的两个模式；
- 添加一个等待延迟完成的钩子。

虽然本文不会深入讨论如何实现这个钩子，但是我们可以看到，它简化了在 React 中使用 postTask 调度程序的过程。
例如，我们可以使用 postTask 调度程序来延迟加载一个成本高、重要性低的 React 组件，直到 load 事件触发后，并清理一些旧的 localStorage 状态。
```js
const hasLoadingCompleted = useWaitForDelay({ event: 'load' }, () => {
 cleanupLocalStorageKeys();
});
 
return (
 <>
   {hasLoadingCompleted && <ExpensiveComponent />}
   <ExistingComponents />
 </>
);
```
在上面的例子中，如果在事件发生之前卸载了该组件，我们将取消清理 `localStorageKeys` 的任务，并且不会渲染 `<ExpensiveComponent />`。
在我们的情况下，`ExpensiveComponent` 是异步加载的，因此通过延迟它，我们显著降低了初始水合成本，包括阻塞时间和 bundle 大小的成本。
让我们看看如何在后台load事件触发后延迟5s加载我们的 `service worker`
在这里，我们可以看到如何使用 postTask 调度程序来延迟加载我们的 `service worker`。
它将在load事件触发5秒后加载，从而减少初始加载的成本。
```js
const { scheduler } = usePostTaskScheduler({ priority: 'background' });
 
useEffect(() => {
 scheduler.postTask(() => initializeServiceWorkers(path), {
   delay: 5000,
   event: 'load',
 })
}, []);
```

## 总结

**优先级调度**可以应用在很多领域，比如：

+   资源提前、延后请求
    
+   第三方资源延迟加载
