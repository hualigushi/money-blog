1. react hook解决了什么问题

2. React Hooks 的使用有哪些注意事项

3. 为什么请求放在useEffect里，放在外面和放里面有什么区别？在useEffect里想使用async/await怎么用

4. useLayoutEffect和useEffect具体执行时机

5. function component

6. react 的virtual dom和diff算法的实现方式

7. React diff算法是如何优化的，o(n3)和o(n)是如何计算出来的

8. 简述 React 类组件的新老生命周期，谈谈 React Fiber 架构的引入

9. Fiber架构相对于以前的递归更新组件有有什么优势

10. 既然你说Fiber是将组件分段渲染，那第一段渲染之后，怎么知道下一段从哪个组件开始渲染呢？

11. 怎么决定每次更新的数量

12. 如何调度时间才能保证流畅

13. react16版本的reconciliation阶段和commit阶段是什么

14. react16之前的那些不好的生命周期怎么过度到react16的新生命周期

15. componentWillReceiveProps用到了this，getDriverStateFromProps也要用，怎么办

16. A组件包裹B组件，B组件包裹C组件，它们的 componentDidMount 触发顺序如何

17. react组件通信

18. React setState 到底是异步还是同步的，其更新原理是什么

19. 假如我一个组件有一个状态count为1，然后我在componentDidMount()里面执行执行了两次this.setState({count: ++this.state.count})，然后又执行了两次setTimeout(() => { this.setState({count: ++this.state.count}) }, 0)，最后count为多少？为什么？

20. React 的合成事件机制

21. React HOC 的用途，什么是装饰器模式

22. 受控组件和非受控组件

23. 如何在React中使用innerHTML

24. constructor和super

25. jsx原理(createElement), jsx是如何转化为浏览器可识别的js的（babel）

26. React性能优化

27. react-router实现方式

28. react-router原理    React路由懒加载和实现原理（就是在问react-loadable的实现原理）

29. 实现一个redux，如果是用ts写，怎么写

30. redux为什么每次reducer要返回一个新对象，面对大量节点如何优化

    新的props导致更新。大量节点使用immutable

31. 详细介绍一下 Redux 状态管理，如何和 React 组件连接

32. Mobx 的实现原理, 如数据劫持，发布订阅

33. 谈下mobx和redux的差异和选择

34. redux-saga作用是什么  (处理redux的副作用)

35. redux-saga 和 mobx 的比较

36. React为什么把reducer设置成纯函数