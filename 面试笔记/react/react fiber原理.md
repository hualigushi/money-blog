## React 16 之前的不足

首先我们了解一下 React 的工作过程，当我们通过render()和 setState() 进行组件渲染和更新的时候，React 主要有两个阶段：

- 调和阶段(Reconciler)：

React 会自顶向下通过递归，遍历新数据生成新的 Virtual DOM，然后通过 Diff 算法，找到需要变更的元素(Patch)，放到更新队列里面去。

- 渲染阶段(Renderer)：

遍历更新队列，通过调用宿主环境的API，实际更新渲染对应元素。宿主环境，比如 DOM、Native、WebGL 等。

在协调阶段阶段，由于是采用的递归的遍历方式，这种也被成为 Stack Reconciler，主要是为了区别 Fiber Reconciler 取的一个名字。这种方式有一个特点：一旦任务开始进行，就无法中断，那么 js 将一直占用主线程， 一直要等到整棵 Virtual DOM 树计算完成之后，才能把执行权交给渲染引擎，那么这就会导致一些用户交互、动画等任务无法立即得到处理，就会有卡顿，非常的影响用户体验。

## Fiber reconciler 优化思路

Fiber reconciler 使用了scheduling(调度)这一过程， 每次只做一个很小的任务，做完后能够“喘口气儿”，

回到主线程看下有没有什么更高优先级的任务需要处理，如果有则先处理更高优先级的任务，没有则继续执行



`React Fiber`解决过去 `Reconciler`存在的问题的思路是把渲染/更新过程(递归diff)拆分成一系列小任务，每次检查树上的一小部分，做完看是否还有时间继续下一个任务，有的话继续，没有的话把自己挂起，主线程不忙的时候再继续。




[完全理解React Fiber](http://www.ayqy.net/blog/dive-into-react-fiber/#articleHeader7)

[Deep In React之浅谈 React Fiber 架构](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651556940&idx=1&sn=d40506db3d4d78da9a94ae6c7dc61af6&chksm=80255b8db752d29bbb8edc79eb40ce4122f3fddca121a53a5c3f859259cf4b1d7402ff676a84&scene=21#wechat_redirect)
