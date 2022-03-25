最近在项目中使用了typescript + rollup，满心欢喜测试打包结果的时候，发现打包出来的文件竟然无法运行，具体报错如下：

```
    throw new ERR_INVALID_ARG_TYPE('superCtor', 'Function', superCtor);
    ^
TypeError [ERR_INVALID_ARG_TYPE]: The "superCtor" argument must be of type function. Received undefined
```

乍一看这个错误非常抽象，在平时的开发中也很少会遇到，定位到错误行，发现是这样的代码：

```
util$3.inherits(Duplex$1, _stream_readable);
```

这里传入的 `_stream_readable` 应该是`undefined`从而导致致报错。

感觉可能是rollup配置的问题，于是去谷歌了一下，发现这其实是rollup的一个bug。

在翻了github上几个issue之后，终于弄清了报错的原因。为了讲清楚问题，首先介绍一下问题发生的背景：

### 背景1

我们都知道rollup本身是不支持commonjs模块的，要想打包commonjs模块的代码，必须借助`@rollup/plugin-node-resolve`和`@rollup/plugin-commonjs`这两个插件，并且在打包过程中会把cjs的模块转成es modules。而cjs模块机制和esm模块机制在处理循环引用的时候，行为是不同的。

### 背景2

nodejs中的`readable stream`和`duplex stream`两个模块之间产生了循环引用。

具体来说就是Duplex（在`_stream_duplex.js`中定义）继承了Readable（在`_stream_readable.js`中定义），但是在ReadableState（也在`_stream_readable.js`中定义）中做了和Duplex类型相关的检查，因此在代码执行的过程中引入了`_stream_duplex.js`，构成了循环引用。

那么cjs和esm在处理循环引用的时候到底有什么区别呢，为什么会最终导致错误呢？

又是一番研究，通过几个demo终于理解了二者的区别，顺便复习了两个模块系统的基础知识。

## commonjs

一提起cjs，大家想到的就是它的灵活，因为它是在执行时加载的，模块的名字和路径不仅可以是常量，也可以是表达式，这也是为什么cjs模块不能使用treeshaking优化，因为要到js实际执行的时候才能知道到底引入了哪个模块。

第一次require模块之后，就会执行整个模块的脚本，并把结果缓存起来，后续引入这个模块的时候，直接读取缓存的结果。

所以第一次导入后，即使原模块发生了变化，再次导入值也是不变的。

因此遇到循环引用的时候，cjs的这种读取缓存的方法虽然避免了无限循环，但也会导致一些不容易察觉的错误，比如：

```js
//a.js
const bar = require("./b.js");
function foo() {  
    bar();  
    console.log("执行完毕");
}
module.exports = foo
foo();

//b.js
const foo = require("./a.js")
function bar(){
  foo()
}
module.exports = bar
```

执行a.js会直接报错`TypeError: foo is not a function`

`a`先加载`b`，然后`b`又加载`a`，这时`a`还没有任何执行结果，所以输出结果为`null`，即对于`b.js`来说，变量`foo`的值等于`null`，后面的`foo()`就会报错。

如果你在a.js第一行就导出foo，就可以避免这个问题，但是不推荐在实际代码中这样写，实在要用到循环引用，只要保证require的对象已被实际导出就好了。

## es modules

在esm模块加载机制中，import是静态执行的，export是动态绑定的。

也就是说，js引擎会对import语句进行提升，不管你import写在哪，总是最先执行的，并递归加载所有导入的模块，遇到加载过的模块直接跳过，是一个深度优先遍历的过程。

而动态绑定指的是export导出的接口，与其对应的值是动态绑定的，运行的时候从模块内部实时取值。

所以**esm模块加载机制根本不关心是否出现了循环应用，只是生成一个指向被加载模块的引用，需要开发者自己保证，真正取值的时候能够取到值。**

如果不注意，esm中的循环引用也会导致一些令人困惑的结果，比如：

```js
//foo.mjs
console.log('foo is running');
import {bar} from './bar.mjs'
console.log('bar = %j', bar);
setTimeout(() => 
           console.log('bar = %j after 500 ms', bar), 
           500);
export var foo = false;
console.log('foo is finished');

//bar.mjs
console.log('bar is running');
import {foo} from './foo.mjs';
console.log('foo = %j', foo)
export var bar = false;
setTimeout(() => bar = true, 500);
console.log('bar is finished');
```

执行`node foo.mjs`结果如下

```
bar is running
foo = undefined
bar is finished
foo is running
bar = false
foo is finished
bar = true after 500 ms
```

可以看到`bar.mjs`中输出了`foo = undefined，`但我们在`foo.mjs`确实导出了`foo。`

为什么会这样呢，仔细看这一句`export var foo = false`，由于`var`存在变量提升，所以我们确实导出了`foo`，但`foo`的值还未被初始化，因此在`bar.mjs`中`foo`的值为`undefined`。

如果我们改成`export let foo = false`，那么执行`foo.mjs`就会直接报错：

```
ReferenceError: Cannot access 'foo' before initialization

```

这也提醒了我们使用`let/const`替代`var`，否则可能会出现难以预测的情况

## 总结

导致rollup打包问题的原因为：**打包的过程中rollup将cjs模块转换成esm，由于esm会跳过之前已加载过的模块，实际引入的变量变成了undefined，导致在最终生成的代码中存在undefined的变量。**

这个问题至今尚未有效解决，涉及到大量commonjs模块时，建议使用webpack打包。

 