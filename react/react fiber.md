[浅谈 React Fiber](https://blog.csdn.net/sinat_17775997/article/details/93383254)

[React-Fiber介绍及组织结构](https://axiu.me/coding/fiber-intro-and-structure/)

[React Fiber 初探](https://gitbook.cn/gitchat/geekbook/5c4abd3b4ab8b926cf73acc5/topic/5c55594a1d9d3040d6af0c1c)

[完全理解React Fiber](http://www.ayqy.net/blog/dive-into-react-fiber/#articleHeader7)




`React Fiber`之前的 `Stack Reconciler`，是自顶向下的递归 `mount/update`，无法中断(持续占用主线程)，这样主线程上的布局、动画等周期性任务以及交互响应就无法立即得到处理，影响体验。


`React Fiber`解决过去 `Reconciler`存在的问题的思路是把渲染/更新过程(递归diff)拆分成一系列小任务，每次检查树上的一小部分，做完看是否还有时间继续下一个任务，有的话继续，没有的话把自己挂起，主线程不忙的时候再继续

