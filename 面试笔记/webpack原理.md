 ## webpack打包原理解析

 webpack通过自定义了一个可以在node和浏览器环境都能执行`__webpack_require__`函数来模拟Node.js中的require语句，将源码中的所有require语句替换为`__webpack_require__·`，同时从入口文件开始遍历查找入口文件依赖，并且将入口文件及其依赖文件的路径和对应源码映射到一个modules对象上，当`__webpack_require__`执行的时候，首先传入的是入口文件的id，就会从这个modules对象上去取源码并执行，由于源码中的require语句都被替换为了`__webpack_require__`函数，所以每当遇到`__webpack_require__`函数的时候都会从modules对象上获取到对应的源码并执行，从而实现模块的打包并且保证源码执行顺序不变。

 ## webpack打包流程分析

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



[一看就懂之webpack原理解析与实现一个简单的webpack](https://segmentfault.com/a/1190000020353337)


[深入理解webpack打包机制(二)](https://segmentfault.com/a/1190000018411480)

[深入理解webpack打包机制(三)](https://segmentfault.com/a/1190000018424867)

[深入理解webpack打包机制(四)](https://segmentfault.com/a/1190000018445745)


[webpack4.0的学习配置](https://github.com/weikehang/webpack4.0-learn)