1. 假如我一个组件有一个状态count为1，然后我在componentDidMount()里面执行执行了两次this.setState({count: ++this.state.count})，然后又执行了两次setTimeout(() => { this.setState({count: ++this.state.count}) }, 0)，最后count为多少？为什么？



## react16之前的那些不好的生命周期怎么过度到react16的新生命周期

getDriverStateFromProps替代componentWillReceiveProps，加上逻辑对比上次state和props来决定state。willupdate换成getSnapshotBeforeUpdate，willmount直接写成初始state（react16的state不先写出来是null，你需要先在class组件里面写一下state = {...}）



# componentWillReceiveProps用到了this，getDriverStateFromProps也要用，怎么办