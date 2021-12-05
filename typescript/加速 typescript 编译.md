## ts.createIncrementalProgram

在 tsconfig.json 中有一个编译器选项 incremental（[https://www.typescriptlang.org/docs/handbook/compiler-options.html](https://link.zhihu.com/?target=https%3A//www.typescriptlang.org/docs/handbook/compiler-options.html)）。

设置了这个，编译之后会出现 tsbuildinfo 文件。第二次编译的时候就可以比之前快一些。

如果用的是 typescript api 的话，对应的方法是 `ts.createIncrementalProgram`。

注意不要每次传入不一样的 rootNames，如果不一样的话，下次就会全量编译而不是增量编译。

传入的 rootNames 不是让你指定这次要编译哪些文件的意思，而是这个项目总共有哪些文件。

所以不要自作聪明的过滤一些，妄图节省时间。

`ts.createIncrementalProgram` 自己会根据缓存决定哪些文件做重编译的。

## ts.createEmitAndSemanticDiagnosticsBuilderProgram

经过 chrome inspect 构建过程之后，发现即便是用了 `ts.createIncrementalProgram`，第二次编译仍然要花大量的时间在重新构建 ts.SourceFile 上。

有没有办法把 compiler 缓存在内存中，第二次编译复用第一次编译的中间结果呢？

typescript 官方提供了 `ts.createEmitAndSemanticDiagnosticsBuilderProgram` 来到达这个目的。

这个方法有一个 oldProgram 的参数，允许把第一次的 program 传给第二次编译。

但是仅仅是传递 oldProgram 是不够的， 

 typescript 内部还会检查一下 oldProgram 是不是可以被复用。

我的解决办法是让 compiler host 的 getSourceFile 带上版本：



![img](https://pic2.zhimg.com/80/v2-735cc67581ca9e9f10f1575ae411ad95_720w.jpg)

sourceFiles 是一个全局的 map 缓存了之前读取的 sourceFile。最后创建 program 的逻辑就是判断一下是不是有 old program 可以复用：

![img](https://pic4.zhimg.com/80/v2-49e72c22e6f2badc683ef9f143d7e2af_720w.jpg)

