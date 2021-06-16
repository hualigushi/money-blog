**合成事件** React将事件绑在虚拟DOM上（合成的只配在虚拟dom上，难受），在document处监听所有支持的事件，当事件发生并冒泡至document处时，React将事件内容封装并交由真正的处理函数运行。

**原生事件** 绑定在真实的DOM上，一般在componentDidMount阶段进行绑定，在componentWillUnmount阶段进行解绑，以免内存泄漏