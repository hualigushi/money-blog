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

3. Node.js 单线程 
