1. 假如我一个组件有一个状态count为1，然后我在componentDidMount()里面执行执行了两次this.setState({count: ++this.state.count})，然后又执行了两次setTimeout(() => { this.setState({count: ++this.state.count}) }, 0)，最后count为多少？为什么？



## react16之前的那些不好的生命周期怎么过度到react16的新生命周期

getDriverStateFromProps替代componentWillReceiveProps，加上逻辑对比上次state和props来决定state。willupdate换成getSnapshotBeforeUpdate，willmount直接写成初始state（react16的state不先写出来是null，你需要先在class组件里面写一下state = {...}）



# componentWillReceiveProps的触发条件是什么

[参考答案] componentWillReceiveProps会在接收到新的props的时候调用





### 为什么使用jsx的组件中没有看到使用react却需要引入react？

本质上来说JSX是`React.createElement(component, props, ...children)`方法的语法糖。在React 17之前，如果使用了JSX，其实就是在使用React， `babel` 会把组件转换为 `CreateElement` 形式。在React 17之后，就不再需要引入，因为 `babel` 已经可以帮我们自动引入react。





### React.Children.map和js的map有什么区别？

JavaScript中的map不会对为null或者undefined的数据进行处理，而React.Children.map中的map可以处理React.Children为null或者undefined的情况。
