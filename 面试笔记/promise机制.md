promise里面的then函数仅仅是注册了后续需要执行的代码，真正的执行是在resolve方法里面执行的，

现在回顾下Promise的实现过程，其主要使用了设计模式中的观察者模式：
 
1. 通过Promise.prototype.then和Promise.prototype.catch方法将观察者方法注册到被观察者Promise对象中，同时返回一个新的Promise对象，以便可以链式调用。

2. 被观察者管理内部pending、fulfilled和rejected的状态转变，同时通过构造函数中传递的resolve和reject方法以主动触发状态转变和通知观察者。


在new Promise()的时候，传入的函数执行异步请求，将异步请求的回调通过调用.then()方法将回调注册入callbacks里，异步请求成功之后执行reslove(result)的方法，将异步回调全部执行。这就是一个Promise最基础版本的实现


Promise的出现，让异步请求的执行更加语义化，它将异步请求串行，开始只关注异步请求，承诺（promise）在后面处理请求结果，从此再也不担心异步问题了。


一个 Promise 对象代表一个目前还不可用，但是在未来的某个时间点可以被解析的值。它允许你以一种同步的方式编写异步代码。例如，如果你想要使用 Promise API 异步调用一个远程的服务器，你需要创建一个代表数据将会在未来由 Web 服务返回的 Promise 对象。唯一的问题是目前数据还不可用。当请求完成并从服务器返回时数据将变为可用数据。在此期间，Promise 对象将扮演一个真实数据的代理角色。接下来，你可以在 Promise 对象上绑定一个回调函数，一旦真实数据变得可用这个回调函数将会被调用。


什么是回调地狱？

　　由于某些业务的需要， 每个接口都需要依赖前一个接口的返回，在代码中一次性写多层的回调嵌套，回调嵌套后的代码维护难度 和 无法快速排除bug ，这个就被称为 回调地狱。

　　该如何解决回调地狱？在工作中的一般处理方式是使用 promise 或者async

　　promise: 如 req1().then(req2).then(req3)

　　Promise 的特性：（等待：pending；完成：resolve   拒绝：reject）

　　　　1、promise 内部 分 微任何 和 宏任务　

　　　　2、promise 本身是同步的，但它的成功的回调 .then 方法 是异步的。

　　　　3、promise 的状态是不可逆的

　　　　4、then return 出去的值，会被后面的 then 接收，如果后面还跟着 then 的话，catch同理

　　　　5、promise 不管返回什么值，都会被包装成一个promise 对象，即使这个返回值是error

　　　　6、then 接收到的值，如果不是一个函数，会穿透到后面的 then

　　　　7、promise 对象如果 resolve 或者 reject 的也是一个 promise 对象，那么 promise 对象的状态会由 resolve 或者 reject 的 promise 对象的状态决定。