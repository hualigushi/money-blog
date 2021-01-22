当我们在组件上设置事件处理器时，React并不会在该DOM元素上直接绑定事件处理器. React内部自定义了一套事件系统，在这个系统上统一进行事件订阅和分发.

具体来讲，React利用事件委托机制在Document上统一监听DOM事件，再根据触发的target将事件分发到具体的组件实例。另外上面e是一个合成事件对象(SyntheticEvent), 而不是原始的DOM事件对象.

> React版本是16.8.6

# 那为什么要自定义一套事件系统?

# 基本概念
React自定义一套事件系统的动机有以下几个:

1. **抹平浏览器之间的兼容性差异。** 这是估计最原始的动机，React根据W3C 规范来定义这些合成事件(SyntheticEvent), 意在抹平浏览器之间的差异。

2. **事件‘合成’, 即事件自定义**。事件合成除了处理兼容性问题，还可以用来自定义高级事件，比较典型的是React的onChange事件，它为表单元素定义了统一的值变动事件。另外第三方也可以通过React的事件插件机制来合成自定义事件，尽管很少人这么做。

3. **抽象跨平台事件机制。** 和 `VirtualDOM` 的意义差不多，`VirtualDOM` 抽象了跨平台的渲染方式，那么对应的`SyntheticEvent`目的也是想提供一个抽象的跨平台事件机制。

4. **React打算做更多优化。**比如利用事件委托机制，大部分事件最终绑定到了Document，而不是DOM节点本身. 这样简化了DOM事件处理逻辑，减少了内存开销. 但这也意味着，React需要自己模拟一套事件冒泡的机制。

5. **React打算干预事件的分发。**v16引入Fiber架构，React为了优化用户的交互体验，会干预事件的分发。不同类型的事件有不同的优先级，比如高优先级的事件可以中断渲染，让用户代码可以及时响应用户交互。

## 整体的架构
![](https://pic3.zhimg.com/80/v2-a82905e2456a8cf9747244cc7e4b477e_720w.jpg)

- **ReactEventListener** - 事件处理器. 在这里进行事件处理器的绑定。当DOM触发事件时，会从这里开始调度分发到React组件树

- **ReactEventEmitter** - 暴露接口给React组件层用于添加事件订阅

- **EventPluginHub** - 如其名，这是一个‘插件插槽’，负责管理和注册各种插件。在事件分发时，调用插件来生成合成事件

- **Plugin** - React事件系统使用了插件机制来管理不同行为的事件。这些插件会处理自己感兴趣的事件类型，并生成合成事件对象。目前ReactDOM有以下几种插件类型:

  - **SimpleEventPlugin** - 简单事件, 处理一些比较通用的事件类型，例如click、input、keyDown、mouseOver、mouseOut、pointerOver、pointerOut
  
  - **EnterLeaveEventPlugin** - mouseEnter/mouseLeave 和 pointerEnter/pointerLeave 这两类事件比较特殊, 和*over/*leave事件相比, 它们不支持事件冒泡, *enter会给所有进入的元素发送事件, 行                                为有点类似于:hover; 而*over在进入元素后，还会冒泡通知其上级. 
  
                               如果树层次比较深，大量的mouseenter触发可能导致性能问题。另外其不支持冒泡，无法在Document完美的监听和分发, 所以ReactDOM使用*over/*out事件来模拟这些                                        *enter/*leave。
                               
  - **ChangeEventPlugin** - change事件是React的一个自定义事件，旨在规范化表单元素的变动事件。它支持这些表单元素: input, textarea, select
  
  - **SelectEventPlugin** - 和change事件一样，React为表单元素规范化了select(选择范围变动)事件，适用于input、textarea、contentEditable元素.
  
  - **BeforeInputEventPlugin** - beforeinput事件以及composition事件处理。
  
## 事件分类与优先级
# 实现细节
## 事件是如何绑定的？
## 事件是如何分发的？
### 事件触发调度
### 插件是如何处理事件?
### 批量执行
# 未来
## 初探Responder的创建
## react-events意义何在?

