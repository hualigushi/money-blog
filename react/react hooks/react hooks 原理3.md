React Hooks原理

- 函数组件执行函数
  - 执行函数组件 `renderWithHooks`
  - 改变 `ReactCurrentDispatcher` 对象
- 初始化hooks
  - 通过 `mountWorkInProgressHook` 生成hooks链表
  - 通过 `mountState` 来初始化 `useState`
  - 通过 `dispatchAction` 来控制无状态组件的更新
  - 通过 `mountEffect` 初始化 `useEffect`
  - 通过 `mountMemo` 初始化 `useMemo`
  - 通过 `mountRef` 初始化 `useRef`
- 更新hooks
  - 通过 `updateWorkInProgressHook` 找到对应的 `hooks` 更新 `hooks` 链表
  - 通过 `updateState` 得到最新的 `state`
  - 通过 `updateEffect` 更新 `updateQueue`
  - 通过 `updateMemo` 判断 `deps`，获取or更新缓存值
  - 通过 `update` 获取 `ref` 对象



### Q1：当你使用了hooks（ 例如 useState）时，发生了什么？

我们去看 `useState` 的源码：` react/src/ReactHooks.js`

```js
export function useState(initialState){
  const dispatcher = resolveDispatcher(); // 1
  return dispatcher.useState(initialState);
}
```

`useState(initialState)` 等价于 `dispatcher.useState(initialState)`。

 `dispatcher` 从中文意思上是 **调度员** 的意思。 也就是说你调用 `useState` 的时候只是通知了**调度员**去调度真正的 `useState`。



### Q2: 那**调度员** `dispatcher` 又是什么？

```js
function resolveDispatcher() {
  const dispatcher = ReactCurrentDispatcher.current
  return dispatcher
}
```

`dispatcher` 是从 `ReactCurrentDispatcher` 身上来。我们来把这个此分析一下，react 当前的（current）调度员（Dispatcher）。

也就是说，到这里 `Dispatcher` 就已经安排好了。



### Q3: 函数组件是什么时候被调用的？

就是说，你的 App 组件 是什么时候被调用的？ React 16 版本的架构可以分为三层：

- `Scheduler` (调度层)：调度任务的优先级，高优任务优先进入协调器
- `Reconciler` (协调层)：构建 Fiber 数据结构，比对 Fiber 对象找出差异, 记录 Fiber 对象要进行的 DOM 操作
- `Renderer` (渲染层)：负责将发生变化的部分渲染到页面上

我们知道 `render` 一个组件 首先要构建 组件的 `Fiber 链表`。

所以我们来看协调层的源码：`react-reconciler/src/ReactFiberBeginWork.js`

```js
renderWithHooks(
    null,                // current Fiber
    workInProgress,      // workInProgress Fiber
    Component,           // 函数组件本身
    props,               // props
    context,             // 上下文
    renderExpirationTime,// 渲染 ExpirationTime
);

……

renderWithHooks(
    current,             // current Fiber
    workInProgress,      // workInProgress Fiber
    Component,           // 函数组件本身
    props,               // props
    context,             // 上下文
    renderExpirationTime,// 渲染 ExpirationTime
);
```

我们先看 `renderWithHooks` 几个我们我们最熟悉的参数。`Component` 是函数本身，`props` 是我们传给函数组件的信息，`context` 代表当前的上下文。

那，有木有可能我们的 `Component` 就是在 `renderWithHooks` 方法里被调用的？接着看源码（精简了一下）。

```js
function renderWithHooks(
  current,
  workInProgress,
  Component,
  props,
  secondArg,
  nextRenderExpirationTime,
) {
  renderExpirationTime = nextRenderExpirationTime;
  currentlyRenderingFiber = workInProgress;

  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  workInProgress.expirationTime = NoWork;

  // 3 很重要！
  ReactCurrentDispatcher.current =
      current === null || current.memoizedState === null
        ? HooksDispatcherOnMount
        : HooksDispatcherOnUpdate;

  let children = Component(props, secondArg); // 2

  // code ...

  ReactCurrentDispatcher.current = ContextOnlyDispatcher;

  renderExpirationTime = NoWork;
  currentlyRenderingFiber = null;

  currentHook = null
  workInProgressHook = null;

  didScheduleRenderPhaseUpdate = false;

  return children; // end
}
```

`renderWithHooks` 的返回值是 children， 而 `children = Component(props, secondArg);`

我们的函数组件就是在 `renderWithHooks` 被调用且最终 `return` 回来。

我们再回到 3 ，`ReactCurrentDispatcher.current` 是不是前面没解释清楚的 **调度员** 的归宿？！ 解释一下这行代码： 当 `current` 为 `null` 或者 `current` 的 `memoizedState` 属性为 `null` 就把 `HooksDispatcherOnMount` 赋值给我们的**调度员**， 否则就把`HooksDispatcherOnUpdate` 赋值给我们的**调度员**。

从这两名称上又能看出个大概来，一个是 `Mount` 的 调度员，一个是 `Update` 的调度员。那也就是说，初始化 `hooks` 的时候就是 `Mount` 调度员，要更新的时候就是 `Update` 调度员？！



### Q4: workInProgress 是什么，workInProgress.memoizedState又是什么？

`workInProgress`： 从名称分析，就是**工作进度** 或者 **正在进行中的工作** 的意思吧？ 那它是个对象吧？ 那对象身上肯定会有一些属性用来描述不同信息对吧？

`workInProgress.memoizedState`：

- 使用 **`useState`** ，保存 `state` 信息
- 使用 **`useEffect`** ，保存 `effect` 对象
- 使用 **`useMemo`** ， 保存`缓存的值`和 `deps`
- 使用 **`useRef`** ， 保存 `ref` 对象。

也就是说，`workInProgress.memoizedState` 存放的是 我们所使用的hooks 的信息。



### Q5: 调用 `useState` 的时候发生了什么。

先看精简源码。

```js
function mountState(
  initialState
){
  const hook = mountWorkInProgressHook();
  
  //如果 initialState为函数，则执行initialState函数。
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  hook.memoizedState = hook.baseState = initialState;
  const queue = (hook.queue = {
    pending: null,  // 待更新的内容
    dispatch: null, // 调度函数
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState, // 最新一次渲染的 state
  });

// 负责更新的函数
  const dispatch = (queue.dispatch = (dispatchAction.bind( 
    null,
    currentlyRenderingFiber,
    queue,
  )))
  return [hook.memoizedState, dispatch];
}
```



1. 先拿到 hook 的信息 也就是 `const hook = mountWorkInProgressHook();`
2. 对入参 `initialState` 进行判别。接着将 `initialState` 赋值给 `hook.memoizedState` 和 `hook.baseState`
3. 接下来就申明了一个队列 `queue`，信息看注释。
4. 申明调度函数 dispatch ， 用来更新 state
5. 返回一个数组，方便我们解构。也就是 :

```js
const [x,setX] = useState(initialState);
```



#### 那 dispatchAction 又是什么？

```js
function dispatchAction<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A,
)
```

对照上述代码，**S 代表 什么？ A 代表什么**？

`setX` 就是调用了 `dispatchAction` 吧？  源码中显示 `dispatchAction` 已经有了 `currentlyRenderingFiber`, `queue` 两个参数了，那 `setX` 传入的参数应该就是第三个参数 `action` 了吧？



### Q6: `dispatchAction` 到底干了什么？

```js
function dispatchAction(fiber, queue, action) {
   // code ...
    
  // step 1 ： 初始化要更新的信息
  const update= {
    expirationTime,
    suspenseConfig,
    action,
    eagerReducer: null,
    eagerState: null,
    next: null,
  }
 
  // 判定是不是首次更新
  const pending = queue.pending;
  if (pending === null) {  // 证明第一次更新
    update.next = update;
  } else { // 不是第一次更新
    update.next = pending.next;
    pending.next = update;
  }
  
  queue.pending = update;
  const alternate = fiber.alternate;
  
  // 判断当前是否在渲染阶段 
  if ( fiber === currentlyRenderingFiber || (alternate !== null && alternate === currentlyRenderingFiber)) {
   // code ...
  } else { 

   // code ...
   
   // 剩下的事情交由 调度层 去完成。
    scheduleUpdateOnFiber(fiber, expirationTime);
  }
}
```



### Q7: Fiber 又是什么？ Fiber 链表又是什么？

```js
type Fiber = {
  /************************  DOM 实例相关  *****************************/
  
  // 标记不同的组件类型, 值详见 WorkTag
  tag: WorkTag,
  // 组件类型 div、span、组件构造函数
  type: any,
  // 实例对象, 如类组件的实例、原生 dom 实例, 而 function 组件没有实例, 因此该属性是空
  stateNode: any,
 
    /************************  构建 Fiber 树相关  ***************************/
  
  // 指向自己的父级 Fiber 对象
  return: Fiber | null,
  // 指向自己的第一个子级 Fiber 对象
  child: Fiber | null,
  
  // 指向自己的下一个兄弟 iber 对象
  sibling: Fiber | null,
  
  // 在 Fiber 树更新的过程中，每个 Fiber 都会有一个跟其对应的 Fiber
  // 我们称他为 current <==> workInProgress
  // 在渲染完成之后他们会交换位置
  // alternate 指向当前 Fiber 在 workInProgress 树中的对应 Fiber
    alternate: Fiber | null,
        
  /************************  状态数据相关  ********************************/
  
  // 即将更新的 props
  pendingProps: any, 
  // 旧的 props
  memoizedProps: any,
  // 旧的 state
  memoizedState: any,
        
  /************************  副作用相关 ******************************/
  // 该 Fiber 对应的组件产生的状态更新会存放在这个队列里面 
  updateQueue: UpdateQueue<any> | null,
  
  // 用来记录当前 Fiber 要执行的 DOM 操作
  effectTag: SideEffectTag,
  // 存储要执行的 DOM 操作
  firstEffect: Fiber | null,
  
  // 单链表用来快速查找下一个 side effect
  nextEffect: Fiber | null,
  
  // 存储 DOM 操作完后的副租用 比如调用生命周期函数或者钩子函数的调用
  lastEffect: Fiber | null,
  // 任务的过期时间
  expirationTime: ExpirationTime,
  
    // 当前组件及子组件处于何种渲染模式 详见 TypeOfMode
  mode: TypeOfMode,
};
```

**在 React 16 中，将整个任务拆分成了一个一个小的任务进行处理，每一个小的任务指的就是一个 Fiber 节点的构建。**

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/deae4c4f3ab7493aabd99a22f57efda5~tplv-k3u1fbpfcp-watermark.image)

**至于Fiber链表。**

`React` 通过链表结构找到下一个要执行的任务单元。 要构建链表结构，需要知道每一个节点的：

- `父级节点`是谁
- `子级节点`是谁，要知道他的
- `下一个兄弟节点`是谁。



当所有DOM的Fiber对象生成完毕，那需要执行DOM操作的Fiber就会构建出Fiber链表。至于构建Fiber 链表的原理是什么，如下代码（**不是源码，只是为了看得更清晰，手动写了一波。希望你有空也手动写一遍**）：

```js
import React from "react"
const jsx = (
<div id="a">
 <div id="b1">
   <div id="c1">
        <div id="d1"></div>
        <div id="d2">
            <div id="e1"></div>
            <div id="e2"></div>
        </div>
   </div>
   <div id="c2"></div>
 </div>
 <div id="b2"></div>
</div>
)
const container = document.getElementById("root")
/**
* 1. 为每一个节点构建 Fiber 对象
* 2. 构建 Fiber 链表
* 3. 提交 Fiber 链接
*/
// 创建根元素 Fiber 对象
const workInProgressRoot = {
stateNode: container,
  props: {
   children: [jsx]
  }
}
let nextUnitOfWork = workInProgressRoot
function workLoop(deadline) {
  // 如果下一个要构建的执行单元存在并且浏览器有空余时间
  while (nextUnitOfWork && deadline.timeRemaining() > 0) {
   // 构建执行单元并返回新的执行单元
   nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
  // 如果所有的执行单元都已经构建完成
  if (!nextUnitOfWork) {
   // 进入到第二个阶段 执行 DOM 操作
   commitRoot()
  }
}
// Fiber 工作的第一个阶段
function performUnitOfWork(workInProgress) {
  // 构建阶段向下走的过程
  // 1. 创建当前 Fiber 节点的 DOM 对象并存储在 stateNode 属性中
  // 2. 构建子级 Fiber 对象
  beginWork(workInProgress)
  // 如果子级存在
  if (workInProgress.child) {
   // 返回子级 构建子级的子级
   return workInProgress.child
  }
  // 开始构建阶段向上走的过程
  // 如果父级存在
  while (workInProgress) {
   // 构建 Fiber 链表
   completeUnitOfWork(workInProgress)
   // 如果同级存在
   if (workInProgress.sibling) {
     // 返回同级 构建同级的子级
     return workInProgress.sibling
   }
   // 同级不存在 退回父级 看父级是否有同级
   workInProgress = workInProgress.return
  }
}
function beginWork(workInProgress) {
// 如果 Fiber 对象没有存储其对应的 DOM 对象
if (!workInProgress.stateNode) {
 // 创建 DOM 对象并存储在 Fiber 对象中
 workInProgress.stateNode = document.createElement(workInProgress.type)
 // 为 DOM 对象添加属性
 for (let attr in workInProgress.props) {
   if (attr !== "children") {
     workInProgress.stateNode[attr] = workInProgress.props[attr]
   }
 }
}
// 创建子级 Fiber 对象
if (Array.isArray(workInProgress.props.children)) {
 // 记录上一次创建的子级 Fiber 对象
 let previousFiber = null
 // 遍历子级
 workInProgress.props.children.forEach((child, index) => {
   // 创建子级 Fiber 对象
   let childFiber = {
     type: child.type,
     props: child.props,
     return: workInProgress,
     effectTag: "PLACEMENT"
   }
   // 第一个子级挂载到父级的 child 属性中
   if (index === 0) {
     workInProgress.child = childFiber
   } else {
     // 其他子级挂载到自己的上一个兄弟的 sibling 属性中
     previousFiber.sibling = childFiber
   }
   // 更新上一个子级
   previousFiber = childFiber
 })
}
}
function completeUnitOfWork(workInProgress) {
  let returnFiber = workInProgress.return
  if (returnFiber) {
   // 链头上移
   if (!returnFiber.firstEffect) {
     returnFiber.firstEffect = workInProgress.firstEffect
   }
   // lastEffect 上移
   if (!returnFiber.lastEffect) {
     returnFiber.lastEffect = workInProgress.lastEffect
   }
   // 构建链表
   if (workInProgress.effectTag) {
     if (returnFiber.lastEffect) {
       returnFiber.lastEffect.nextEffect = workInProgress
     } else {
       returnFiber.firstEffect = workInProgress
     }
     returnFiber.lastEffect = workInProgress
   }
  }
}
// Fiber 工作的第二阶段
function commitRoot() {
// 获取链表中第一个要执行的 DOM 操作
let currentFiber = workInProgressRoot.firstEffect
// 判断要执行 DOM 操作的 Fiber 对象是否存在
while (currentFiber) {
 // 执行 DOM 操作
 currentFiber.return.stateNode.appendChild(currentFiber.stateNode)
 // 从链表中取出下一个要执行 DOM 操作的 Fiber 对象
 currentFiber = currentFiber.nextEffect
}
}
// 在浏览器空闲的时候开始构建
requestIdleCallback(workLoop)
```


