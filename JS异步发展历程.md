# 1. 回调函数callback

优点：解决了异步的问题。

缺点：

 - 回调地狱：多个回调函数嵌套的情况，各个部分之间高度耦合,使代码看起来很混乱，不易于维护

 - 每个任务只能指定一个回调函数

 - 不能捕获异常 （try catch 同步执行，回调函数会加入队列，无法捕获错误）
 
 - 无法使用return语句返回值，并且也不能使用throw关键字


# 2. Promise

promise的状态只能从pending变成fulfilled，和pending变成rejected，状态一旦改变，就不会再改变，且只有异步操作的结果才能改变promise的状态。

promise是一个容器，里面保存着某个未来才会结束的事件 (比如 异步操作的结果)

优点：解决了回调地狱的问题，将异步操作以同步操作的流程表达出来

缺点：
  - 无法取消promise。如果不设置回调函数
  - Promise内部抛出的错误，不会反应到外部。错误不能被 try catch
  - 当处于Pending状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。当执行多个Promise时，一堆then看起来也很不友好。
  - promise一旦新建，就会立即执行，无法取消
  
# 3. Generator

Generator是es6提出的另一种异步编程解决方案，需要在函数名之前加一个*号，函数内部使用yield语句。

Generaotr函数会返回一个遍历器，可以进行遍历操作执行每个中断点yield。

优点：
 - 没有了Promise的一堆then(),异步操作更像同步操作，代码更加清晰。
     
 - 错误可以被try catch

缺点：不能自动执行异步操作，需要写多个next()方法，需要配合使用Thunk函数和Co模块才能做到自动执行。

# 4. async/await

async是es2017引入的异步操作解决方案，可以理解为Generator的语法糖，async等同于Generator和co模块的封装，async 函数返回一个 Promise。

优点：内置执行器，比Generator操作更简单。async/await比*/yield语义更清晰。返回值是Promise对象，可以用then指定下一步操作。代码更整洁。可以捕获同步和异步的错误。

缺点：暂时没有人提及这种写法的缺点
