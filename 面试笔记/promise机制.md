promise里面的then函数仅仅是注册了后续需要执行的代码，真正的执行是在resolve方法里面执行的，

现在回顾下Promise的实现过程，其主要使用了设计模式中的观察者模式：
 
1. 通过Promise.prototype.then和Promise.prototype.catch方法将观察者方法注册到被观察者Promise对象中，同时返回一个新的Promise对象，以便可以链式调用。

2. 被观察者管理内部pending、fulfilled和rejected的状态转变，同时通过构造函数中传递的resolve和reject方法以主动触发状态转变和通知观察者。


在new Promise()的时候，传入的函数执行异步请求，将异步请求的回调通过调用.then()方法将回调注册入callbacks里，异步请求成功之后执行reslove(result)的方法，将异步回调全部执行。这就是一个Promise最基础版本的实现


Promise的出现，让异步请求的执行更加语义化，它将异步请求串行，开始只关注异步请求，承诺（promise）在后面处理请求结果，从此再也不担心异步问题了。