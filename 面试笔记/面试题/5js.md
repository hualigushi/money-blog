1. js基础类型，引用类型

4. Object.is和===的区别

6. 判断对象的数据类型(instanceOf、isPrototypeof、Object.prototype.toString.call())

7. 如何判断是不是数组(Array.isArray())

8. instanceof 和 Array.isArray 是如何实现的

9. 如何判断Symbol类型，作用(getOwnPropertySymbols, Reflect.ownKeys)

11. null 和 undefined

12. let var const 区别

13. let/const声明的变量在windows上面吗

15. 作用域是指什么

16. ES6 中的 let 有块级作用域，那 ES5 是如何实现块级作用域的呢(闭包)

17. 什么是闭包，作用， 优缺点

    如何对闭包进行垃圾回收

19. class 方法中的this 指向 与 普通方法中的this指向

20. 普通函数和箭头函数的区别

22. map中的键值会不会被回收（weakMap，weakSet等）

    什么是强引用、弱引用、循环引用

23. new操作符干了什么

26. es6  class 的 super 是如何实现的

29. 数组去重

32. forEach, for of 区别

33. 深浅拷贝原理和实现，  深拷贝循环引用如何处理

36. 事件委托

39. Event对象中，target和currentTarget的区别

40. 移动端的点击穿透，原理及解决方法？

41. 移动端的click事件行为与PC端有什么不同？如何屏蔽掉这个不同？

42. 简单介绍前端模块化，amd，cmd，commonjs，es6 的 module

43. Commonjs 和 es6 的 module 哪个支持异步

44. CommonJS 中的 require/exports 和 ES6 中的 import/export 区别

45. 模块在同一个页面引入两次，会引起几次js渲染？为什么？

47. require 的运行机制和缓存策略你了解吗？

48. require 加载模块的是同步还是异步？谈谈你的理解

49. exports 和 module.exports 的区别是什么？

50. require 加载模块的时候加载的究竟是什么？

51. import 在浏览器中怎么运行的

52. JS 异步解决方案的发展历程以及优缺点

53. promise原理 优缺点

    如何中断promise 在事件循环中的执行，过程是怎样的,

    promise.race,promise.all作用

54. promise的resolve函数中最多能携带几个参数？(1个)

55. 如何统一管理promise的错误处理函数？

57. async await 和 promise 的关系(async await 是 promise 和 generator 函数组合的一个语法糖)

59. 描述二叉树的几种遍历方式

60. 函数式编程

61. Koa 的中间件原理，介绍一下 compose 函数, 手写compose

62. NodeJS 是单线程还是多线程，都有哪些线程，JS 为什么是单线程的

64. NodeJS的eventEmitter的实现

69. Events 监听函数的执行顺序是异步还是同步的？

72. 单例模式、原型模式、工厂模式、观察者模式、策略模式、代理模式   功能、代码实现、使用场景

74. ts 的泛型是什么作用(泛型决定了一个类型在不同的场景下能够在每个场景下从始至终的保持类型一致)

47. ts的type和interface什么区别

48. 保持socket连接，如何保持当前socket连接正常的

做一个定时的ping操作，这里成为：“心跳响应”，每隔一定的时间使用ws.send()发送一个无意义的ping消息。告诉后台我还在连接。后台收到后，也就继续推送消息。而如果ping 消息错误了。那么就说明ws可能意外的中断了，那么会走onerror()方法，这时候，我可以从新开始唤醒它。这样就能对webSocket保持一个相对的连接持久化了。

74. 图片懒加载


81. babel 原理

83. 内存泄露如何发现，如何解决

84. setTimeout是否准时，如果不是则应该提前还是延迟

85. 大型文件上传

    - 文件切片
    - 用 web-work 单独线程计算文件的 hash 值
    - 上传由于和其他接口同一域名，所以要做并发数处理
    - 进度条
    - 对于已经传过的文件进行跳过秒传，对于失败做失败重传处理
    - 然后有说了一下感觉还能改进的地方
    
85. 数组和链表在计算机中存储的方式？计算机中增加一个数组元素的方式？

    
