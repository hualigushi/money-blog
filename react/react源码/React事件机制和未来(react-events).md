当我们在组件上设置事件处理器时，React并不会在该DOM元素上直接绑定事件处理器. React内部自定义了一套事件系统，在这个系统上统一进行事件订阅和分发.

具体来讲，React利用事件委托机制在Document上统一监听DOM事件，再根据触发的target将事件分发到具体的组件实例。另外上面e是一个合成事件对象(`SyntheticEvent`), 而不是原始的DOM事件对象.

> React版本是16.8.6

# 那为什么要自定义一套事件系统?

# 基本概念
React自定义一套事件系统的动机有以下几个:

1. **抹平浏览器之间的兼容性差异。** 这是估计最原始的动机，React根据W3C 规范来定义这些合成事件(`SyntheticEvent`), 意在抹平浏览器之间的差异。

2. **事件‘合成’, 即事件自定义**。事件合成除了处理兼容性问题，还可以用来自定义高级事件，比较典型的是React的`onChange`事件，它为表单元素定义了统一的值变动事件。另外第三方也可以通过React的事件插件机制来合成自定义事件，尽管很少人这么做。

3. **抽象跨平台事件机制。** 和 `VirtualDOM` 的意义差不多，`VirtualDOM` 抽象了跨平台的渲染方式，那么对应的`SyntheticEvent`目的也是想提供一个抽象的跨平台事件机制。

4. **React打算做更多优化。**比如利用事件委托机制，大部分事件最终绑定到了Document，而不是DOM节点本身. 这样简化了DOM事件处理逻辑，减少了内存开销. 但这也意味着，React需要自己模拟一套事件冒泡的机制。

5. **React打算干预事件的分发。**v16引入Fiber架构，React为了优化用户的交互体验，会干预事件的分发。不同类型的事件有不同的优先级，比如高优先级的事件可以中断渲染，让用户代码可以及时响应用户交互。

## 整体的架构
![](https://pic3.zhimg.com/80/v2-a82905e2456a8cf9747244cc7e4b477e_720w.jpg)

- **ReactEventListener** - 事件处理器. 在这里进行事件处理器的绑定。当DOM触发事件时，会从这里开始调度分发到React组件树

- **ReactEventEmitter** - 暴露接口给React组件层用于添加事件订阅

- **EventPluginHub** - 如其名，这是一个‘插件插槽’，负责管理和注册各种插件。在事件分发时，调用插件来生成合成事件

- **Plugin** - React事件系统使用了插件机制来管理不同行为的事件。这些插件会处理自己感兴趣的事件类型，并生成合成事件对象。目前ReactDOM有以下几种插件类型:

  - **SimpleEventPlugin** - 简单事件, 处理一些比较通用的事件类型，例如`click`、`input`、`keyDown`、`mouseOver`、`mouseOut`、`pointerOver`、`pointerOut`
  
  - **EnterLeaveEventPlugin** - `mouseEnter/mouseLeave` 和 `pointerEnter/pointerLeave` 这两类事件比较特殊, 和*over/*leave事件相比, 它们不支持事件冒泡, *enter会给所有进入的元素发送事件, 行                                为有点类似于:hover; 而*over在进入元素后，还会冒泡通知其上级. 
     如果树层次比较深，大量的mouseenter触发可能导致性能问题。另外其不支持冒泡，无法在Document完美的监听和分发, 所以ReactDOM使用*over/*out事件来模拟这些                                        *enter/*leave。
                               
  - **ChangeEventPlugin** - change事件是React的一个自定义事件，旨在规范化表单元素的变动事件。它支持这些表单元素: `input`, `textarea`, `select`
  
  - **SelectEventPlugin** - 和change事件一样，React为表单元素规范化了`select`(选择范围变动)事件，适用于`input`、`textarea`、`contentEditable`元素.
  
  - **BeforeInputEventPlugin** - `beforeinput`事件以及`composition`事件处理。
  
- **EventPropagators** 按照DOM事件传播的两个阶段，遍历React组件树，并收集所有组件的事件处理器.
- **EventBatching** 负责批量执行事件队列和事件处理器，处理事件冒泡。
- **SyntheticEvent** 这是‘合成’事件的基类，可以对应DOM的Event对象。只不过React为了减低内存损耗和垃圾回收，使用一个对象池来构建和释放事件对象， 也就是说`SyntheticEvent`不能用于异步引用，它在同步执行完事件处理器后就会被释放。

SyntheticEvent也有子类，和DOM具体事件类型一一匹配:

- SyntheticAnimationEvent
- SyntheticClipboardEvent
- SyntheticCompositionEvent
- SyntheticDragEvent
- SyntheticFocusEvent
- SyntheticInputEvent
- SyntheticKeyboardEvent
- SyntheticMouseEvent
- SyntheticPointerEvent
- SyntheticTouchEvent
- ....

## 事件分类与优先级
`SimpleEventPlugin`将事件类型划分成了三类, 对应不同的优先级(优先级由低到高):

- **DiscreteEvent 离散事件.** 例如`blur`、`focus`、 `click`、 `submit`、 `touchStart`. 这些事件都是离散触发的
- **UserBlockingEvent 用户阻塞事件.** 例如`touchMove`、`mouseMove`、`scroll`、`drag`、`dragOver`等等。这些事件会'阻塞'用户的交互。
- **ContinuousEvent 可连续事件.** 例如`load`、`error`、`loadStart`、`abort`、`animationEnd`. 这个优先级最高，也就是说它们应该是立即同步执行的，这就是`Continuous`的意义，即可连续的执行，不被打断.

React调度(Schedule)的优先级,React有5个优先级级别:

- Immediate - 这个优先级的任务会同步执行, 或者说要马上执行且不能中断
- UserBlocking(250ms timeout) 这些任务一般是用户交互的结果, 需要即时得到反馈 .
- Normal (5s timeout) 应对哪些不需要立即感受到的任务，例如网络请求
- Low (10s timeout) 这些任务可以放后，但是最终应该得到执行. 例如分析通知
- Idle (no timeout) 一些没有必要做的任务 (e.g. 比如隐藏的内容).

目前`ContinuousEvent`对应的是Immediate优先级; `UserBlockingEven`t对应的是UserBlocking(需要手动开启); 而`DiscreteEvent`对应的也是UserBlocking, 只不过它在执行之前，先会执行完其他Discrete任务。

# 实现细节
React是怎么实现事件机制？主要分为两个部分: **绑定**和**分发**.

## 事件是如何绑定的？
React事件机制中的插件协议。 每个插件的结构如下:
```js
export type EventTypes = {[key: string]: DispatchConfig};

// 插件接口
export type PluginModule<NativeEvent> = {
  eventTypes: EventTypes,          // 声明插件支持的事件类型
  extractEvents: (                 // 对事件进行处理，并返回合成事件对象
    topLevelType: TopLevelType,
    targetInst: null | Fiber,
    nativeEvent: NativeEvent,
    nativeEventTarget: EventTarget,
  ) => ?ReactSyntheticEvent,
  tapMoveThreshold?: number,
};
```
** `eventTypes` ** 声明该插件负责的事件类型, 它通过`DispatchConfig`来描述:
```js
export type DispatchConfig = {
  dependencies: Array<TopLevelType>, // 依赖的原生事件，表示关联这些事件的触发. ‘简单事件’一般只有一个，复杂事件如onChange会监听多个, 如下图 
  phasedRegistrationNames?: {    // 两阶段props事件注册名称, React会根据这些名称在组件实例中查找对应的props事件处理器
    bubbled: string,             // 冒泡阶段, 如onClick
    captured: string,            // 捕获阶段，如onClickCapture
  },
  registrationName?: string      // props事件注册名称, 比如onMouseEnter这些不支持冒泡的事件类型，只会定义  registrationName，不会定义phasedRegistrationNames
  eventPriority: EventPriority,  // 事件的优先级，上文已经介绍过了
};
```

![](https://pic2.zhimg.com/80/v2-1e97a4fee63fd875e901be06cb2d9fc9_720w.jpg)

上面列举了三个典型的`EventPlugin`：

- **SimpleEventPlugin** - 简单事件最好理解，它们的行为都比较通用，没有什么Trick, 例如不支持事件冒泡、不支持在Document上绑定等等. 和原生DOM事件是一一对应的关系，比较好处理.

- **EnterLeaveEventPlugin** - 从上图可以看出来，mouseEnter和mouseLeave依赖的是mouseout和mouseover事件。也就是说*Enter/*Leave事件在React中是通过*Over/*Out事件来模拟的。这样做的好处是可以在document上面进行委托监听，还有避免*Enter/*Leave一些奇怪而不实用的行为。

- **ChangeEventPlugin** - onChange是React的一个自定义事件，可以看出它依赖了多种原生DOM事件类型来模拟onChange事件.

另外每个插件还会定义`extractEvents`方法，这个方法接受事件名称、原生DOM事件对象、事件触发的DOM元素以及React组件实例, 返回一个合成事件对象，如果返回空则表示不作处理. 

在ReactDOM启动时就会向`EventPluginHub`注册这些插件：
```js
EventPluginHubInjection.injectEventPluginsByName({
  SimpleEventPlugin: SimpleEventPlugin,
  EnterLeaveEventPlugin: EnterLeaveEventPlugin,
  ChangeEventPlugin: ChangeEventPlugin,
  SelectEventPlugin: SelectEventPlugin,
  BeforeInputEventPlugin: BeforeInputEventPlugin,
});
```
事件是怎么绑定的呢？ 打个断点看一下调用栈:
![](https://pic4.zhimg.com/80/v2-7f95214a6c1846576a2036ec506e25d7_720w.jpg)

通过调用栈可以看出React在props初始化和更新时会进行事件绑定。这里先看一下流程图

![](https://pic2.zhimg.com/80/v2-fc1951960382e285155ced704dd7bfd5_720w.jpg)

1. **在props初始化和更新时会进行事件绑定。** 首先React会判断元素是否是媒体类型，**媒体类型的事件是无法在Document监听的，所以会直接在元素上进行绑定**

2. **在Document上绑定.**  这里面需要两个信息，一个就是上文提到的'事件依赖列表', 比如`onMouseEnter`赖`mouseover/mouseout` 第二个是`reactBrowserEventEmitter`护的'已订阅事件表'。**处理器只需在Document订阅一次，所以相比在每个元素上订阅事件会节省很多资源.**

代码大概如下:

```js
export function listenTo(
  registrationName: string,           // 注册名称，如onClick
  mountAt: Document | Element | Node, // 组件树容器，一般是Document
): void {
  const listeningSet = getListeningSetForElement(mountAt);             // 已订阅事件表
  const dependencies = registrationNameDependencies[registrationName]; // 事件依赖

  for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i];
    if (!listeningSet.has(dependency)) {                               // 未订阅
      switch (dependency) {
        // ... 特殊的事件监听处理
        default:
          const isMediaEvent = mediaEventTypes.indexOf(dependency) !== -1;
          if (!isMediaEvent) {
            trapBubbledEvent(dependency, mountAt);                     // 设置事件处理器
          }
          break;
      }
      listeningSet.add(dependency);                                    // 更新已订阅表
    }
  }
}
```

3. **根据事件的'优先级'和'捕获阶段'(是否是capture)来设置事件处理器**
```js
function trapEventForPluginEventSystem(
  element: Document | Element | Node,   // 绑定到元素，一般是Document
  topLevelType: DOMTopLevelEventType,   // 事件名称
  capture: boolean,
): void {
  let listener;
  switch (getEventPriority(topLevelType)) {
    // 不同优先级的事件类型，有不同的事件处理器进行分发, 下文会详细介绍
    case DiscreteEvent:                      // ⚛️离散事件
      listener = dispatchDiscreteEvent.bind(
        null,
        topLevelType,
        PLUGIN_EVENT_SYSTEM,
      );
      break;
    case UserBlockingEvent:                 // ⚛️用户阻塞事件
      listener = dispatchUserBlockingUpdate.bind(
        null,
        topLevelType,
        PLUGIN_EVENT_SYSTEM,
      );
      break;
    case ContinuousEvent:                   // ⚛️可连续事件
    default:
      listener = dispatchEvent.bind(null, topLevelType, PLUGIN_EVENT_SYSTEM);
      break;
  }

  const rawEventName = getRawEventName(topLevelType);
  if (capture) {                            // 绑定事件处理器到元素
    addEventCaptureListener(element, rawEventName, listener);
  } else {
    addEventBubbleListener(element, rawEventName, listener);
  }
}
```


## 事件是如何分发的？
![](https://pic2.zhimg.com/80/v2-fc1951960382e285155ced704dd7bfd5_720w.jpg)

### 事件触发调度

通过上面的`trapEventForPluginEventSystem`函数可以知道，不同的事件类型有不同的事件处理器, 它们的区别是调度的优先级不一样

```js
// 离散事件
// discrentUpdates 在UserBlocking优先级中执行
function dispatchDiscreteEvent(topLevelType, eventSystemFlags, nativeEvent) {
  flushDiscreteUpdatesIfNeeded(nativeEvent.timeStamp);
  discreteUpdates(dispatchEvent, topLevelType, eventSystemFlags, nativeEvent);
}

// 阻塞事件
function dispatchUserBlockingUpdate(
  topLevelType,
  eventSystemFlags,
  nativeEvent,
) {
  // 如果开启了enableUserBlockingEvents, 则在UserBlocking优先级中调度，
  // 开启enableUserBlockingEvents可以防止饥饿问题，因为阻塞事件中有scroll、mouseMove这类频繁触发的事件
  // 否则同步执行
  if (enableUserBlockingEvents) {
    runWithPriority(
      UserBlockingPriority,
      dispatchEvent.bind(null, topLevelType, eventSystemFlags, nativeEvent),
    );
  } else {
    dispatchEvent(topLevelType, eventSystemFlags, nativeEvent);
  }
}

// 可连续事件则直接同步调用dispatchEvent
```

最终不同的事件类型都会调用`dispatchEvent`函数. `dispatchEvent`中会从DOM原生事件对象获取事件触发的target，再根据这个target获取关联的React节点实例.

```js
export function dispatchEvent(topLevelType: DOMTopLevelEventType, eventSystemFlags: EventSystemFlags, nativeEvent: AnyNativeEvent): void {
  // 获取事件触发的目标DOM
  const nativeEventTarget = getEventTarget(nativeEvent);
  // 获取离该DOM最近的组件实例(只能是DOM元素组件)
  let targetInst = getClosestInstanceFromNode(nativeEventTarget);
  // ....
  dispatchEventForPluginEventSystem(topLevelType, eventSystemFlags, nativeEvent, targetInst);
}
```

接着(中间还有一些步骤，这里忽略)会调用`EventPluginHub`的`runExtractedPluginEventsInBatch`，这个方法遍历插件列表来处理事件，生成一个`SyntheticEvent`列表:

```js
export function runExtractedPluginEventsInBatch(
  topLevelType: TopLevelType,
  targetInst: null | Fiber,
  nativeEvent: AnyNativeEvent,
  nativeEventTarget: EventTarget,
) {
  // 遍历插件列表, 调用插件的extractEvents，生成SyntheticEvent列表
  const events = extractPluginEvents(
    topLevelType,
    targetInst,
    nativeEvent,
    nativeEventTarget,
  );

  // 事件处理器执行, 见后文批量执行
  runEventsInBatch(events);
}
```
### 插件是如何处理事件?

以`SimpleEventPlugin`为例:
```js
const SimpleEventPlugin: PluginModule<MouseEvent> & {
  getEventPriority: (topLevelType: TopLevelType) => EventPriority,
} = {
  eventTypes: eventTypes,
  // 抽取事件对象
  extractEvents: function(
    topLevelType: TopLevelType,
    targetInst: null | Fiber,
    nativeEvent: MouseEvent,
    nativeEventTarget: EventTarget,
  ): null | ReactSyntheticEvent {
    // 事件配置
    const dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];

    // 1️⃣ 根据事件类型获取SyntheticEvent子类事件构造器
    let EventConstructor;
    switch (topLevelType) {
      // ...
      case DOMTopLevelEventTypes.TOP_KEY_DOWN:
      case DOMTopLevelEventTypes.TOP_KEY_UP:
        EventConstructor = SyntheticKeyboardEvent;
        break;
      case DOMTopLevelEventTypes.TOP_BLUR:
      case DOMTopLevelEventTypes.TOP_FOCUS:
        EventConstructor = SyntheticFocusEvent;
        break;
      // ... 省略
      case DOMTopLevelEventTypes.TOP_GOT_POINTER_CAPTURE:
      // ...
      case DOMTopLevelEventTypes.TOP_POINTER_UP:
        EventConstructor = SyntheticPointerEvent;
        break;
      default:
        EventConstructor = SyntheticEvent;
        break;
    }

    // 2️⃣ 构造事件对象, 从对象池中获取
    const event = EventConstructor.getPooled(
      dispatchConfig,
      targetInst,
      nativeEvent,
      nativeEventTarget,
    );

    // 3️⃣ 根据DOM事件传播的顺序获取用户事件处理器
    accumulateTwoPhaseDispatches(event);
    return event;
  },
};
```
SimpleEventPlugin的extractEvents主要做以下三个事情:

1️⃣ 根据事件的类型确定SyntheticEvent构造器

2️⃣ 构造SyntheticEvent对象。

3️⃣ 根据DOM事件传播的顺序获取用户事件处理器列表

**为了避免频繁创建和释放事件对象导致性能损耗(对象创建和垃圾回收)，React使用一个事件池来负责管理事件对象，使用完的事件对象会放回池中，以备后续的复用。**

这也意味着，**在事件处理器同步执行完后，SyntheticEvent对象就会马上被回收**，所有属性都会无效。所以一般不会在异步操作中访问SyntheticEvent事件对象。你也可以通过以下方法来保持事件对象的引用：

- 调用`SyntheticEvent#persist()`方法，告诉React不要回收到对象池
- 直接引用`SyntheticEvent#nativeEvent`, nativeEvent是可以持久引用的，不过为了不打破抽象，建议不要直接引用nativeEvent

构建完SyntheticEvent对象后，就需要**遍历组件树来获取订阅该事件的用户事件处理器了**:

```js
function accumulateTwoPhaseDispatchesSingle(event) {
  // 以_targetInst为基点, 按照DOM事件传播的顺序遍历组件树
  traverseTwoPhase(event._targetInst, accumulateDirectionalDispatches, event);
}
```

```js
export function traverseTwoPhase(inst, fn, arg) {
  const path = [];
  while (inst) {           // 从inst开始，向上级回溯
    path.push(inst);
    inst = getParent(inst);
  }

  let i;
  // 捕获阶段，先从最顶层的父组件开始, 向下级传播
  for (i = path.length; i-- > 0; ) {
    fn(path[i], 'captured', arg);
  }

  // 冒泡阶段，从inst，即事件触发点开始, 向上级传播
  for (i = 0; i < path.length; i++) {
    fn(path[i], 'bubbled', arg);
  }
}
```

`accumulateDirectionalDispatches`函数则是简单查找当前节点是否有对应的事件处理器:

```js
function accumulateDirectionalDispatches(inst, phase, event) {
  // 检查是否存在事件处理器
  const listener = listenerAtPhase(inst, event, phase);
  // 所有处理器都放入到_dispatchListeners队列中，后续批量执行这个队列
  if (listener) {
    event._dispatchListeners = accumulateInto(
      event._dispatchListeners,
      listener,
    );
    event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
  }
}
```

例如下面的组件树, 遍历过程是这样的：
![](https://pic4.zhimg.com/80/v2-e02b64ca1a7196fc58e36594e0d42d7b_720w.jpg)

最终计算出来的_dispatchListeners队列是这样的：`[handleB, handleC, handleA]`

### 批量执行
遍历执行插件后，会得到一个`SyntheticEvent`列表，`runEventsInBatch`就是批量执行这些事件中的`_dispatchListeners`事件队列

```js
export function runEventsInBatch(
  events: Array<ReactSyntheticEvent> | ReactSyntheticEvent | null,
) {
  // ...
  forEachAccumulated(processingEventQueue, executeDispatchesAndRelease);
}

//  

const executeDispatchesAndRelease = function(event: ReactSyntheticEvent) {
  if (event) {
    // 按顺序执行_dispatchListeners
    //  
    executeDispatchesInOrder(event);

    // 如果没有调用persist()方法则直接回收
    if (!event.isPersistent()) {
      event.constructor.release(event);
    }
  }
};

export function executeDispatchesInOrder(event) {
  // 遍历dispatchListeners
  for (let i = 0; i < dispatchListeners.length; i++) {
    // 通过调用 stopPropagation 方法可以禁止执行下一个事件处理器
    if (event.isPropagationStopped()) {
      break;
    }
    // 执行事件处理器
    executeDispatch(event, dispatchListeners[i], dispatchInstances[i]);
  }
}
```
![](https://pic1.zhimg.com/80/v2-97816326a41512598d906792c9f06a48_720w.jpg)


