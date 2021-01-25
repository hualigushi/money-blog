在 webpack 中，专注于处理 webpack 在编译过程中的某个特定的任务的功能模块，可以称为插件。它和 loader 有以下区别：

1. `loader` 是一个转换器，将 A 文件进行编译成 B 文件，比如：将 `A.less` 转换为 `A.css`，单纯的文件转换过程。webpack 自身只支持 js 和 json 这两种格式的文件，
    对于其他文件需要通过 loader 将其转换为 commonJS 规范的文件后，webpack 才能解析到。
    
2. `plugin` 是一个扩展器，它丰富了 webpack 本身，针对是 loader 结束后，webpack 打包的整个过程，它并不直接操作文件，而是基于事件机制工作，会监听 webpack 打包过程中的某些节点，执行广泛的任务。

# plugin 的特征
webpack 插件有以下特征

 - 是一个独立的模块。
 - 模块对外暴露一个 js 函数。
- 函数的原型 `(prototype)` 上定义了一个注入 `compiler` 对象的 apply 方法。
apply 函数中需要有通过 compiler 对象挂载的 webpack 事件钩子，钩子的回调中能拿到当前编译的 compilation 对象，如果是异步编译插件的话可以拿到回调 callback。
完成自定义子编译流程并处理 complition 对象的内部数据。
如果异步编译插件的话，数据处理完成后执行 callback 回调。

# 事件流机制
# 编写一个插件
# Compiler 对象 （负责编译）
# Compilation 对象
# 手写插件 1：文件清单
# 手写插件 2：去除注释
