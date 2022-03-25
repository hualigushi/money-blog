# Ajax 请求放在 componentDidMount 里进行处理还是放在componentWillMount 里进行处理比较合适？

JS 是单线程，Ajax 请求不会 "返回" 并且触发，当我们正在 rendering 的时候（Ajax  的执行结果会放到任务队列中，等主线程执行完后采取读取任务队列中的任务进行执行），因为理论上放在哪里结果都一样，都会执行两次 render。



由于JavaScript中异步事件的性质，当您启动API调⽤时，浏览器会在此期间返回执⾏其他⼯作。当React渲染⼀个组件时，它不会等待componentWillMount它完成任何事情。React继续前进并继续render，没有办法“暂停”渲染以等待数据到达。

⽽且在componentWillMount请求会有⼀系列潜在的问题。⾸先，在服务器渲染时，如果在componentWillMount⾥获取数据，fetch data会执⾏两次，⼀次在服务端⼀次在客户端，这造成了多余的请求。其次，在React 16进⾏React Fiber重写后, componentWillMount可能在⼀次渲染中多次调⽤。

⽬前官⽅推荐的异步请求是在componentDidmount中进⾏。如果有特殊需求需要提前请求，也可以在特殊情况下在constructor中请求。react 17之后 componentWillMount会被废弃，仅仅保留UNSAFE_componentWillMount。
