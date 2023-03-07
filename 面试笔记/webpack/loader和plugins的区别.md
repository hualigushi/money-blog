# Loader

模块转换器，将非js模块转化为webpack能识别的模块

`Loader` 本质就是一个函数，在该函数中对接收到的内容进行转换，返回转换后的结果。 

因为 Webpack 只认识 JavaScript，所以 Loader 就成了翻译官，对其他类型的资源进行转译的预处理工作。

`Loader` 在 module.rules 中配置，作为模块的解析规则，类型为数组。每一项都是一个 Object，内部包含了 test(类型文件)、loader、options (参数)等属性。

`loader`是支持以数组的形式配置多个的，因此当`Webpack`在转换该文件类型的时候，会按顺序链式调用每一个`loader`，前一个`loader`返回的内容会作为下一个`loader`的入参。因此`loader`的开发需要遵循一些规范，比如返回值必须是标准的`JS`代码字符串，以保证下一个`loader`能够正常工作，同时在开发上需要严格遵循“单一职责”，只关心`loader`的输出以及对应的输出。

**解析顺序**：`从下向上，从右向左`



##### 在实际工程中，配置文件上百行乃是常事，如何保证各个loader按照预想方式工作？

可以使用 `enforce` 强制执行 `loader` 的作用顺序，`pre` 代表在所有正常 loader 之前执行，`post` 是所有 loader 之后执行。(inline 官方不推荐使用)





# Plugin

- webpack本质是一个事件流机制，核心模块：tabable(Sync + Async)Hooks 构造出 === Compiler(编译) + Compiletion(创建bundles)

- 基于发布订阅模式，在运行的生命周期中会广播出许多事件，插件通过监听这些事件，就可以在特定的阶段执行自己的插件任务，从而实现自己想要的功能。

- compiler对象代表了完整的webpack环境配置。这个对象在启动webpack时被一次性建立，并配置好所有可操作的设置，包括options、loader和plugin。当在webpack环境中应用一插件时，插件将收到此compiler对象的引用。可以使用它来访问webpack的主环境

- compilation对象代表了一次资源版本构建。当运行webpack开发环境中间件时，每当检测到一个文件变化，就会创建一个新的compilation,从而生成一个新的编译资源。一个compilation对象表现了当前的模块资源、编译生成资源、变化的文件、以及被跟踪依赖的状态的信息。compilation对象也提供了很多关键时机的回调，以供插件做自定义处理时选择使用

  

  

  `Plugin`的开发需要遵循一些开发上的规范和原则：

  - 插件必须是一个函数或者是一个包含 `apply` 方法的对象，这样才能访问`compiler`实例；
  - 传给每个插件的 `compiler` 和 `compilation` 对象都是同一个引用，若在一个插件中修改了它们身上的属性，会影响后面的插件;
  - 异步的事件需要在插件处理完任务时调用回调函数通知 `Webpack` 进入下一个流程，不然会卡住;

  


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
