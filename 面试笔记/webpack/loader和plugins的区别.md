# Loader

模块转换器，将非js模块转化为webpack能识别的模块

`Loader` 本质就是一个函数，在该函数中对接收到的内容进行转换，返回转换后的结果。 因为 Webpack 只认识 JavaScript，所以 Loader 就成了翻译官，对其他类型的资源进行转译的预处理工作。

`Loader` 在 module.rules 中配置，作为模块的解析规则，类型为数组。每一项都是一个 Object，内部包含了 test(类型文件)、loader、options (参数)等属性。

**解析顺序**：`从下向上，从右向左`



##### 在实际工程中，配置文件上百行乃是常事，如何保证各个loader按照预想方式工作？

可以使用 `enforce` 强制执行 `loader` 的作用顺序，`pre` 代表在所有正常 loader 之前执行，`post` 是所有 loader 之后执行。(inline 官方不推荐使用)





# Plugin

- webpack本质是一个事件流机制，核心模块：tabable(Sync + Async)Hooks 构造出 === Compiler(编译) + Compiletion(创建bundles)
- compiler对象代表了完整的webpack环境配置。这个对象在启动webpack时被一次性建立，并配置好所有可操作的设置，包括options、loader和plugin。当在webpack环境中应用一插件时，插件将收到此compiler对象的引用。可以使用它来访问webpack的主环境
- compilation对象代表了一次资源版本构建。当运行webpack开发环境中间件时，每当检测到一个文件变化，就会创建一个新的compilation,从而生成一个新的编译资源。一个compilation对象表现了当前的模块资源、编译生成资源、变化的文件、以及被跟踪依赖的状态的信息。compilation对象也提供了很多关键时机的回调，以供插件做自定义处理时选择使用
- 在 Webpack 运行的生命周期中会广播出许多事件，Plugin 可以监听这些事件，在合适的时机通过 Webpack 提供的 API 改变输出结果。
   

在`plugins`中单独配置。 类型为数组，每一项是一个`plugin`的实例，参数都通过构造函数传入。



 ```js
 const pluginName = 'ConsoleLogOnBuildWebpackPlugin';
 
 class ConsoleLogOnBuildWebpackPlugin {
   apply(compiler) {
     compiler.hooks.run.tap(pluginName, compilation => {
       console.log('webpack 构建过程开始！');
     });
   }
 }
 
 module.exports = ConsoleLogOnBuildWebpackPlugin;
 ```

**webpack 插件是一个具有 apply方法的 JavaScript 对象。**

**apply 方法会被 webpack compiler 调用，并且在整个编译生命周期都可以访问 compiler 对象。**

