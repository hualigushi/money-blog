diff算法的流程：

1.调用patch函数比较Vnode和OldVnode,如果不一样直接return Vnode即将Vnode真实化后替换掉DOM中的节点

2.如果OldVnode和Vnode值得进一步比较则调用patchVnode方法进行进一步比较，分为以下几种情况：

  - Vnode有子节点，但是OldVnode没有，则将Vnode的子节点真实化后添加到真实DOM上
  - Vnode没有子节点，但是OldVnode上有，则将真实DOM上相应位置的节点删除掉
  - Vnode和OldVnode都有文本节点但是内容不一样，则将真实DOM上的文本节点替换为Vnode上的文本节点
  - Vnode和OldVnode上都有子节点，需要调用updateChildren函数进一步比较：
   1. 提取出Vnode和OldVnode中的子节点分别为vCh和OldCh，并且提出各自的起始和结尾变量标记为 oldS oldE newS newE
   2. 对这四个变量进行四次对比，如果相同进行修改相应的真实DOM上的节点，同时s和e向中间靠拢。如果不同-->3
   3. 在没有key的情况下直接在DOM的oldS位置的前面添加newS，同时newS+1。在有key的情况下会将newS和Oldch上的所有节点对比，如果有相同的则移动DOM并且将旧节点中这个位置置为null且newS+1。如果还没有则直接在DOM的oldS位置的前面添加newS且newS+1
   4. 直到出现任意一方的start>end，则有一方遍历结束，整个比较也结束
  
OldS>OldE则表示旧子节点先遍历完，那么只需要将Vnode中的子节点添加到真实DOM上即可。

newS>newE则表示新子节点先遍历完，那么只需要将真实DOM中一些多余节点删除即可。

[Vue源码解析：虚拟dom比较原理](https://segmentfault.com/a/1190000018211084)

[深入Vue2 Diff算法](https://blog.csdn.net/Sideremens/article/details/97629849?depth_1-utm_source=distribute.pc_relevant_right.none-task&utm_source=distribute.pc_relevant_right.none-task)

[vue源码解析-diff过程一探究竟](https://segmentfault.com/a/1190000019492596)

[详解vue的diff算法](https://www.cnblogs.com/wind-lanyan/p/9061684.html)

[详解vue的diff算法](https://blog.csdn.net/lynnwonder6/article/details/89738023?depth_1-utm_source=distribute.pc_relevant_right.none-task&utm_source=distribute.pc_relevant_right.none-task)
