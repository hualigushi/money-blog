```
const win = {a:456};
console.log(win);

(function(){
  with (win) {
    var a = 123;
    var b = 456;
    console.log(win);
  }
})();

console.log(win);
```
```
{a:456}
{a:123}
{a:123}
```

已知：with 是在一个 IIFE（用于独立的作用域）里触发的，变量 a （通过 var 声明）写到了 with 对应的变量空间 win 对象上

求：如果变量 a 的声明可以写到 win 对象上，为啥变量 b 没有写上去？

因为对象 win 上已经存在属性 a，但是并不存在属性 b。从结果推测原因的话，可能得出一个初步结论：

在 with 代码块里，对于 scope 里已有的属性声明+赋值，是会直接写到 scope 变量上的。而对于 scope 变量不存在的属性 + 赋值，则不会写到 scope 变量上。

## ES Spec 追踪
简言之就是，在通过 var 初始化变量时，如果它是被套在 with 声明里的，则会先去检查当前 with 处理过后的词法环境里是否有重名变量，

如果有的话则直接将值写给同名属性，否则按正常流程，写到当前的词法环境（对应的 variable environment）里。

> 注：with(expression) statement 语法会在运行时根据 expression 对应的值，同当前执行上下文的词法环境做一次合并，并将合并后的结果作为后面 statement 的词法环境。
> 而 with block 执行完之后，则会将词法环境恢复成合并前的状态。
> 要完整理解上面这段话需要去翻 with statement + 执行上下文 相关的 spec，篇幅较长不在本文展开了。

## 回到原始问题
回到问题本身，Bigfish 4 的那个问题跟上面 with statement + variable declaration 有什么关系？ 

从表象上看，是因为 Bigfish 4 的产物中有顶层作用域的 helpers：

上述产物在经 esbuild 压缩后，全局作用域的 helpers 变量有可能出现碰撞，

比如父应用和子应用的 __hasOwnProp 都被压缩成 aB；那么子应用的代码在加载时，

内部的 with statement + variable declaration 会先从 window.proxy 上写 aB变成沙箱内的全局变量，

因为值是一个 function，下次获取就会绑定 window 作为 this 执行上下文。

整体过程如下：
```
/*
 * Stage 1: 父应用初始化
 */
// window.aB 被赋值
var aB = Object.prototype.hasOwnProperty;

/*
 * Stage 2: 子应用初始化
 */
with (window.proxy) {
  var aB = Object.prototype.hasOwnProperty;
}

// 由于 with 的行为，上述代码等同于↓
var aB = window.proxy.aB = Object.prototype.hasOwnProperty;

/*
 * Stage 3: 沙箱绑定
 */
// 由于变量直接写到了沙箱的全局变量上，为了确保返回的对象能正常调用，所以需要 bind 顶层 window，上述代码最终成为↓
var aB = (window.proxy.aB = Object.prototype.hasOwnProperty).bind(window);

/*
 * Stage 4: 子应用消费
 */
// helpers 消费 aB 将永远获得错误的结果，因为 call 不再有效
aB.call(object, prop);
```

而运行时爆栈是因为 helpers 的执行始终不符预期，导致原本正常的框架逻辑进入死循环，至此问题逐渐清晰。


### 为什么 Bigfish 4 的产物里会有挂载到全局作用域的 helpers？
因为 Bigfish 4 默认启用 esbuild 来压缩代码，当 esbuild 发现代码中有不满足 target（默认为 Chrome 80）的语法时，

就会进行 helpers 替换；但 esbuild 压缩输出是不能带模块输出规范的，所以就直接暴露在全局作用域了

### 为什么父应用和子应用压缩后的全局变量会碰撞？

推测是因为 esbuild 内部的算法，导致同样的顶层 helpers 产出了同样的压缩变量；但该行为也不是 100% 稳定的，所以并非所有 Bigfish 4 应用都会有这个问题

### 为什么 helpers 要由一个压缩器来加？
由于 esbuild 会对 es5 做反向优化以节省尺寸，所以我们必须给它明确的 target 以防止压缩后的产物不符合预期，但同时也会让 esbuild 压缩时处理产物中的高级语法，目前没有好的解法
