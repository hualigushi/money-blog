[【React进阶系列】 虚拟dom与diff算法](https://segmentfault.com/a/1190000016723305)

[React diff原理探究以及应用实践](https://segmentfault.com/a/1190000018914249)

[浅谈 React/Vue/Inferno 在 DOM Diff 算法上的异同](http://www.imooc.com/article/details/id/295545)


传统diff算法通过循环递归对比差异，算法复杂度为O(n3)。react diff算法制定了三条策略，将算法复杂度从 O(n3)降低到O(n)。

- WebUI中DOM节点跨节点的操作特别少，可以忽略不计。
- 拥有相同类的组件会拥有相似的DOM结构。拥有不同类的组件会生成不同的DOM结构。
- 同一层级的子节点，可以根据唯一的ID来区分。

针对这三个策略，react diff实施的具体策略是:

- diff对树进行分层比较，只对比两棵树同级别的节点。跨层级移动节点，将会导致节点删除，重新插入，无法复用。
- diff对组件进行类比较，类相同的递归diff子节点，不同的直接销毁重建。diff对同一层级的子节点进行处理时，会根据key进行简要的复用。两棵树中存在相同key的节点时，只会移动节点。

