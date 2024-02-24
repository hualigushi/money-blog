[TOC]



# 1. ECMAScript 模块

在 Node 12 中将一个新属性附加到你的应用程序（或库）的 pacakge.json 即可：  
```
// package.json
{
    "name": "my-application",
    "type": "module" // Required for ECMASCript modules
}
```
在 Node.js 12 及更高版本上使用 type 方法时，它还有一个额外的好处，就是加载的所有依赖项都支持 ECMAScript 模块。因此随着越来越多的库迁移到“原生”JavaScript，你用不着再担心当不同的库打包不同的模块系统时如何处理 import 或 require 了。

# 2. 异步控制流程
不需要baebl,直接使用promise async/await
```
// log.js
async function delayedLogger(...messages) {
    return new Promise((resolve) => {
        setImmediate(() => {
            console.debug(...messages);
            resolve(true);
        });
    });
}

async function doLogs() {
    delayedLogger('2. Then I run next!');
    console.log('1. I run first!');
    await delayedLogger('3. Now I run third because I "await"');
    console.log('4. And I run last!');
}

doLogs();
```

启用异步堆栈跟踪，需要升级到 Node 12 并对特定版本使用 --async-stack-traces 开关。
```
$ node temp.js --async-stack-traces
Error: Oops
    at stepThree (/Users/joelgriffith/Desktop/temp.js:24:11)
    at async stepTwo (/Users/joelgriffith/Desktop/temp.js:19:5)
    at async stepOne (/Users/joelgriffith/Desktop/temp.js:14:5)
    at async execute (/Users/joelgriffith/Desktop/temp.js:9:5)
```

# 3.node 如何获取命令行传来的参数

答案是：`process.argv`。

process是一个全局变量，它提供当前 Node.js 进程的有关信息，而process.argv 属性则返回一个数组，数组中的信息包括启动Node.js进程时的命令行参数

- process.argv[0] : 返回启动Node.js进程的可执行文件所在的绝对路径
- process.argv[1] : 为当前执行的JavaScript文件路径
- process.argv.splice(2) : 移除前两者后，剩余的元素为其他命令行参数(也就是我们自定义部分)

关于获取命令行传来的参数还可以结合commander的 `commander.parse(process.argv);`



# 4. node有哪些相关的文件路径？

Node 中的文件路径有 `__dirname`, `__filename`, `process.cwd()`, `./ 或者 ../`

- `__dirname`: 总是返回被执行的 js 所在文件夹的绝对路径
- `__filename`: 总是返回被执行的 js 的绝对路径
- `process.cwd()`: 总是返回运行 node 命令时所在的文件夹的绝对路径



# 5.node相关path API 有哪些？

- `path.dirname()`：返回 path 的目录名
- `path.join()`：所有给定的 path 片段连接到一起，然后规范化生成的路径
- `path.resolve()`：方法会将路径或路径片段的序列解析为绝对路径，解析为相对于当前目录的绝对路径，相当于cd命令
