# Ajax 请求放在 componentDidMount 里进行处理还是放在componentWillMount 里进行处理比较合适？

JS 是单线程，Ajax 请求不会 "返回" 并且触发，当我们正在 rendering 的时候（Ajax  的执行结果会放到任务队列中，等主线程执行完后采取读取任务队列中的任务进行执行），因为理论上放在哪里结果都一样，都会执行两次 render。

这样的话，就没必要在`componentWillMount`中调用 Ajax，以避免理解不到位，对state的结果预计错误。`componentDidMount`的执行很明了，不会引起歧义，所以在`componentDidMount`中最合理了。

