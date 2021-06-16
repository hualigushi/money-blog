 # webpack打包流程分析

 #### webpack启动文件:

webpack首先会找到项目中的`webpack.config.js`配置文件，并以`require(configPath)`的方式，获取到整个config配置对象，接着创建webpack的编译器对象，并且将获取到的config对象作为参数传入编译器对象中，即在创建Compiler对象的时候将config对象作为参数传入Compiler类的构造函数中，编译器创建完成后调用其run()方法执行编译。

#### 编译器构造函数:

编译器构造函数要做的事：创建编译器的时候，会将config对象传入编译器的构造函数内，所以要将config对象进行保存，然后还需要保存两个特别重要的数据:
一个是入口文件的id，即入口文件相对于根目录的相对路径，因为webpack打包输出的文件内是一个匿名自执行函数，其执行的时候，首先是从入口文件开始的，会调用`__webpack_require__(entryId)`这个函数，所以需要告诉webpack入口文件的路径。

另一个是modules对象，对象的属性为入口文件及其所有依赖文件相对于根目录的相对路径，因为一个模块被`__webpack_require__`(某个模块的相对路径)的时候，webpack会根据这个相对路径从modules对象中获取对应的源码并执行，对象的属性值为一个函数，函数内容为当前模块的eval(源码)。

总之，modules对象保存的就是入口文件及其依赖模块的路径和源码对应关系，webpack打包输出文件bundle.js执行的时候就会执行匿名自执行函数中的`__webpack_require__(entryId)`，从modules对象中找到入口文件对应的源码执行，执行入口文件的时候，发现其依赖，又继续执行`__webpack_require__(dependId)`，再从modules对象中获取dependId的源码执行，直到全部依赖都执行完成。

编译器构造函数中还有一个非常重要的事情要处理，那就是安装插件，即遍历配置文件中配置的plugins插件数组，然后调用插件对象的apply()方法，apply()方法会被传入compiler编译器对象，可以通过传入的compiler编译器对象进行监听编译器发射出来的事件，插件就可以选择在特定的时机完成一些事情。

#### 编译器run:

编译器的run()方法内主要就是: `buildModule`和`emitFile`。而`buildModule`要做的就是传入入口文件的绝对路径，然后根据入口文件路径获取到入口文件的源码内容，然后对源码进行解析。

其中获取源码过程分为两步: 首先直接读出文件中的源码内容，然后根据配置的loader进行匹配，匹配成功后交给对应的loader函数进行处理，loader处理完成后再返回最终处理过的源码。

源码的解析，主要是: 将由loader处理过的源码内容转换为AST抽象语法树，然后遍历AST抽象语法树，找到源码中的require语句，并替换成webpack自己的require方法，即`webpack_require`，同时将require()的路径替换为相对于根目录的相对路径，替换完成后重新生成替换后的源码内容，在遍历过程中找到该模块所有依赖，解析完成后返回替换后的源码和查找到的所以依赖，如果存在依赖则遍历依赖，让其依赖模块也执行一遍`buildModule()`，直到入口文件所有依赖都buildModule完成。

入口文件及其依赖模块都build完成后，就可以emitFile了，首先读取输出模板文件，然后传入entryId和modules对象作为数据进行渲染，主要就是遍历modules对象生成webpack匿名自执行函数的参数对象，同时填入webpack匿名自执行函数执行后要执行的`__webpack_require__(entryId)`入口文件id。



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

