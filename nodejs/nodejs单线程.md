Node.js 中最核心的是 V8 引擎，在 Node.js 启动后，会创建 V8 的实例，这个实例是多线程的。
- 主线程：编译、执行代码。
- 编译/优化线程：在主线程执行的时候，可以优化代码。
- 分析器线程：记录分析代码运行时间，为 Crankshaft 优化代码执行提供依据。
- 垃圾回收的几个线程。

所以大家常说的 Node.js 是单线程的指的是 JavaScript 的执行是单线程的(开发者编写的代码运行在单线程环境中)，但 Javascript 的宿主环境，无论是 Node 还是浏览器都是多线程的因为 libuv 中有线程池的概念存在的，libuv 会通过类似线程池的实现来模拟不同操作系统的异步调用，这对开发者来说是不可见的。

## V8中什么时候会创建额外进程

### 某些异步 IO 会占用额外的线程
我们在定时器执行的同时，去读一个文件：
```
const fs = require('fs')

setInterval(()=>{
   console.log(newDate().getTime())
}, 3000)
fs.readFile('./kaola.html',()=>{})
```
线程数量变成了 11 个，这是因为在 Node 中有一些 IO 操作（DNS，FS）和一些 CPU 密集计算（Zlib，Crypto）会启用 Node 的线程池，而线程池默认大小为 4，因为线程数变成了 11。

### 手动更改线程池默认大小：
`process.env.UV_THREADPOOL_SIZE = 64`

修改线程池默认大小后，轻松把线程变成 71。

### Libuv
Libuv 是一个跨平台的异步 IO 库，它结合了 UNIX 下的 libev 和 Windows 下的 IOCP 的特性，最早由 Node.js 的作者开发，专门为 Node.js 提供多平台下的异步IO支持。Libuv 本身是由 C++ 语言实现的，Node.js 中的非阻塞 IO 以及事件循环的底层机制都是由 libuv 实现的。

在 Windows 环境下，libuv 直接使用Windows的 IOCP 来实现异步IO。在 非Windows 环境下，libuv使用多线程（线程池Thread Pool）来模拟异步IO