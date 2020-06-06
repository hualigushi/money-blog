简单来说，diff算法有以下过程

- 同级比较，再比较子节点
- 先判断一方有子节点一方没有子节点的情况(如果新的children没有子节点，将旧的子节点移除)
- 比较都有子节点的情况(核心diff)
- 递归比较子节点

正常Diff两个树的时间复杂度是`O(n^3)`，但实际情况下我们很少会进行`跨层级的移动DOM`，所以Vue将Diff进行了优化，从`O(n^3) -> O(n)`，只有当新旧children都为多个子节点时才需要用核心的Diff算法进行同层级比较。

Vue2的核心Diff算法采用了`双端比较`的算法，同时从新旧children的两端开始进行比较，借助key值找到可复用的节点，再进行相关操作。相比React的Diff算法，同样情况下可以减少移动节点次数，减少不必要的性能损耗，更加的优雅。

Vue3.x借鉴了 [ivi](https://github.com/localvoid/ivi)算法和 [inferno](https://github.com/infernojs/inferno)算法

在创建VNode时就确定其类型，以及在`mount/patch`的过程中采用`位运算`来判断一个VNode的类型，在这个基础之上再配合核心的Diff算法，使得性能上较Vue2.x有了提升。(实际的实现可以结合Vue3.x源码看。)

该算法中还运用了`动态规划`的思想求解最长递归子序列。





Vue2 diff算法的流程：

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

