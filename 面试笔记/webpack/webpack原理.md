# webpack 打包流程

1. 初始化参数： shell webpack.config.js

2. 开始编译：初始化一个Compiler对象，加载所有的配置
3. 确定入口：根据entry中的配置，找出所有的入口文件
4. 编译模块：从入口文件开始，调用所有的loader，再去递归的找依赖
5. 完成模块编译：得到每个模块被翻译后的最终以及他们之间的依赖关系
6. 

# webpack 工作流程

1. 参数解析：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数
2. 找到入口文件：从 Entry 里配置的 Module 开始递归解析 Entry 依赖的所有 Module
3. 调用 Loader 编译文件：每找到一个 Module， 就会根据配置的 Loader 去找出对应的转换规则
4. 遍历 AST，收集依赖：对 Module 进行转换后，再解析出当前 Module 依赖的 Module
5. 生成 Chunk：这些模块会以 Entry 为单位进行分组，一个 Entry 和其所有依赖的 Module 被分到一个组也就是一个 Chunk
6. 输出文件：最后 Webpack 会把所有 Chunk 转换成文件输出



**「Loader 工作流程」**

1. webpack.config.js 里配置了一个 模块 的 Loader；
2. 遇到 相应模块 文件时，触发了 该模块的 loader;
3. loader 接受了一个表示该 模块 文件内容的 source;
4. loader 使用 webapck 提供的一系列 api 对 source 进行转换，得到一个 result;
5. 将 result 返回或者传递给下一个 Loader，直到处理完毕。



**「Plugin原理」**

插件就像是一个插入到生产线中的一个功能，在特定的时机对生产线上的资源做处理。

webpack 通过 Tapable 来组织这条复杂的生产线。 

webpack 在编译过代码程中，会触发一系列 Tapable 钩子事件，插件所做的，就是找到相应的钩子，往上面挂上自己的任务，也就是注册事件，这样，当 webpack 构建的时候，插件注册的事件就会随着钩子的触发而执行了。

webpack 插件由以下组成：

- 一个 JavaScript 命名函数。
- 在插件函数的 prototype 上定义一个 apply 方法。
- 指定一个绑定到 webpack 自身的事件钩子。
- 处理 webpack 内部实例的特定数据。
- 功能完成后调用 webpack 提供的回调



**「自定义插件例子」**

```js
// 一个 JavaScript 命名函数。 
function MyExampleWebpackPlugin() { }; 

// 在插件函数的 prototype 上定义一个 apply
MyExampleWebpackPlugin.prototype.apply = function(compiler) { 
	// 指定一个挂载到 webpack 自身的事件钩子。 
	compiler.plugin('webpacksEventHook', function(compilation /* 处理 webpack 内部实例的特定数据。*/, callback) { 
	console.log("This is an example plugin!!!"); // 功能完成后调用 webpack 提供的回调。 		callback(); 
}); 
```

