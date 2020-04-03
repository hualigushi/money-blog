1. react hook解决了什么问题
2. 为什么请求放在useEffect里，放在外面和放里面有什么区别？在useEffect里想使用async/await怎么用
3. useLayoutEffect和useEffect具体执行时机
4. 假如我一个组件有一个状态count为1，然后我在componentDidMount()里面执行执行了两次this.setState({count: ++this.state.count})，然后又执行了两次setTimeout(() => { this.setState({count: ++this.state.count}) }, 0)，最后count为多少？为什么？
