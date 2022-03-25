# Webpack构建流程

## webpack 核心构建流程总结

> 本文参考 webpack5.38.1 源码

#### 1. 核心构建流程总结

**1.1 启动 webpack**

   1. 执行 `node_modules/.bin/webpack.cmd`
   2. 执行 `node_modules/webpack/bin/webpack.js`


**1.2 启动 webpack-cli**

   1. 执行 `node_modules/webpack-cli/bin/cli.js`
   2. 检查 webpack 是否安装，没有则提示安装
   3. 调用 `runCLI()` 解析命令行参数，创建编译对象；

      执行顺序：runCLI() => cli.run() => cli.buildCommand()


**1.3 创建编译对象 compiler**


      调用 cli.buildCommand() => cli.createCompiler() => webpack()


**1.4 实例化编译对象 compiler，预埋核心钩子**


  1. 挂载Node文件读写能力到 compiler
  2. 挂载所有插件到 compiler
  3. 挂载默认配置到 compiler
  4. 启动核心钩子的监听：compilation、make


**1.5 执行方法 compiler.run()，启动编译**


  1. 触发 beforeRun 钩子
  2. 触发 run 钩子
     - 主要功能是 触发 compile、make 钩子，make 完成后处理回调
     - make 结束后，通过 onCompiled 写入代码到文件输出到 dist 目录


**1.6 执行方法 compiler.compile()，完成编译，输出文件**


  1. 触发钩子 beforeCompile
  2. 触发钩子 compile
  3. 触发钩子 thisCompilation、compilation
  4. 触发钩子 make（核心钩子）
     - 根据入口等配置，创建模块
     - 实现编译功能：转换代码为ast语法树，再将其转换回code代码
     - 对chunk进行处理
  5. 触发钩子 finishMake                    
  6. 触发钩子 afterCompile


#### 2. 核心钩子的监听

```arcade
- beforeRun       =>   未知 
- run             =>   未知
- beforeCompile   =>   未知
- compile         =>   未知 
- thisCompilation =>   未知
- compilation     =>   new WebpackOptionsApply() 中启动监听  => 作用：让 compilation 具备创建模块的能力
- make            =>   new WebpackOptionsApply() 中启动监听  => 作用：打包入口
- finishMake      =>   未知
- afterCompile    =>   未知
```

#### 3. 核心钩子触发顺序

```arcade
- beforeRun       =>   compiler.run()中触发
- run             =>   compiler.run()中触发
- beforeCompile   =>   compiler.compile()中触发
- compile         =>   compiler.compile()中触发
- thisCompilation =>   compiler.compile()中触发 => compiler.newCompilation()中触发
- compilation     =>   compiler.compile()中触发 => compiler.newCompilation()中触发
- make            =>   compiler.compile()中触发
- finishMake      =>   compiler.compile()中触发
- afterCompile    =>   compiler.compile()中触发
```

#### 4. 核心代码文件路径

```awk
// 基于版本：
"webpack": "^5.38.1", 
"webpack-cli": "^4.7.0"

// 文件路径：
node_modules/.bin/webpack.cmd
node_modules/webpack/bin/webpack.js
node_modules/webpack-cli/bin/cli.js
node_modules/webpack/lib/webpack.js
node_modules/webpack/lib/EntryPlugin.js
node_modules/webpack/lib/Compiler.js
node_modules/webpack/lib/Compilation.js
```

## webpack 构建流程详细分析

#### 1. 启动 webpack（命令行执行 webpack）

- 1.1 执行脚本：node_modules/.bin/webpack.cmd
- 1.2 webpack.cmd 中先根据环境变量找到 node.exe
- 1.3 webpack.cmd 中再使用 node.exe 执行js脚本：node node_modules/webpack/bin/webpack.js

```bash
# node_modules/.bin/webpack.cmd
@ECHO off
SETLOCAL
CALL :find_dp0
# 1.2. 先根据环境变量找到 node.exe
IF EXIST "%dp0%\node.exe" (
  SET "_prog=%dp0%\node.exe"
) ELSE (
  SET "_prog=node"
  SET PATHEXT=%PATHEXT:;.JS;=;%
)
# 1.3. 再使用 node.exe 执行js脚本
"%_prog%"  "%dp0%\..\webpack\bin\webpack.js" %*
ENDLOCAL
EXIT /b %errorlevel%
:find_dp0
SET dp0=%~dp0
EXIT /b
```

- 1.4 webpack.js 中判断是否安装了 webpack-cli

```node-repl
> 1.4.1 没有安装webpack-cli => 则提示安装
> 1.4.2 已经安装webpack-cli => 执行 runCli，require 了 node_modules/webpack-cli/bin/cli.js
// node_modules/webpack/bin/webpack.js
#!/usr/bin/env node
// ...
const runCli = cli => {
    const path = require("path");
    const pkgPath = require.resolve(`${cli.package}/package.json`);
    const pkg = require(pkgPath);
    require(path.resolve(path.dirname(pkgPath), pkg.bin[cli.binName]));
};

// 没有安装 webpack-cli，则提示安装
if (!cli.installed) {
    // ...
} else {
    runCli(cli);
}
```

#### 2. 启动 webpack-cli

- 2.1 启动 webpack-cli：webpack.js 中导入了 node_modules/webpack-cli/bin/cli.js
- 2.2 cli.js 中检查 webpack 是否安装，没有则提示安装
- 2.3 cli.js 中执行 runCLI()，解析命令行参数，创建编译对象。（例如：读取配置文件，合并默认配置项等。）

```stata
> 2.3.1 runCLI() 中执行 cli.run()           => 解析命令行参数  => .../lib/webpack-cli.js
> 2.3.2 cli.run() 中执行 cli.buildCommand() => 创建编译对象    => .../lib/webpack-cli.js
// node_modules/webpack-cli/bin/cli.js
#!/usr/bin/env node
// ...
// 2.2 检查 webpack 是否安装
if (utils.packageExists('webpack')) {
    // 参数1：process.argv => 命令行参数<br>
    // 参数2：Module.prototype._compile => nodejs底层的编译方法<br>
    // 2.3 执行runCLI
    runCLI(process.argv, originalModuleCompile);
} 
else{
    // ...
}
```

#### 3. 创建编译对象 compiler

- 3.1 调用 cli.createCompiler() 生成一个 compiler

```javascript
// cli.buildCommand() 中调用 cli.createCompiler() 生成一个 compiler；
// cli.buildCommand() 定义在：node_modules/webpack-cli/lib/webpack-cli.js
compiler = await this.createCompiler(options, callback);

// cli.createCompiler() 中调用 webpack(options) 返回一个 compiler
// webpack(options) 定义在：node_modules/webpack/lib/webpack.js
compiler = this.webpack(
// 合并options
// ...
)
```

- 3.2 根据参数判断是否要结束命令行，是否watch

```javascript
if (isWatch(compiler) && this.needWatchStdin(compiler)) {
    process.stdin.on('end', () => {
        process.exit(0);
    });
    process.stdin.resume();
}
```

#### 4. 实例化编译对象 compiler，预埋核心钩子

- 4.1 webpack() 中调用 createCompiler()，定义在：node_modules/webpack/lib/webpack.js
- 4.2 createCompiler() 中创建一个 comipler 实例

```node-repl
> 4.2.1 createCompiler() 中使用 new Compiler() 实例化一个 compiler，定义在：.../lib/Compiler.js
> 4.2.2 compiler 继承了 tapable，因此它具备钩子的操作能力（监听事件，触发事件，webpack是一个事件流）
```

- 4.3 在 compiler 对象身上挂载文件读写的能力：

```javascript
new NodeEnvironmentPlugin({
    infrastructureLogging: options.infrastructureLogging
}).apply(compiler);
```

- 4.4 在 compiler 对象身上挂载所有 plugins 插件
- 4.5 在 compiler 对象身上挂载默认配置项：

```javascript
applyWebpackOptionsDefaults(options);
```

- 4.6 启动 compilation、make 钩子的监听，具体流程如下：

```node-repl
> 4.6.1 createCompiler() 方法中调用 new WebpackOptionsApply().process(options, compiler);
> 4.6.2 然后启动钩子 entryOption 的监听；（注意hooks都是new Compiler时定义）
> 4.6.3 触发钩子 entryOption 的执行回调函数：启动了 compilation 钩子和 make 钩子的监听
// 4.6.2 然后启动钩子 entryOption 的监听，在 EntryOptionPlugin 中定义的。（注意hooks都在new Compiler时定义）
new EntryOptionPlugin().apply(compiler);

// 4.6.3 触发钩子 entryOption 的执行回调函数：启动了 compilation 钩子和 make 钩子的监听；回调在EntryOptionPlugin中定义的。
compiler.hooks.entryOption.call(options.context, options.entry);

// 4.6.3 触发钩子 entryOption 的执行回调时，执行如下代码；启动钩子 make 的监听。
compiler.hooks.make.tapAsync('SingleEntryPlugin', (compilation, callback) => {
  const { context, entry, name } = this
  console.log("make 钩子监听执行了~~~~~~")
  // compilation.addEntry(context, entry, name, callback)
})
```

#### 5. webpack() 中执行 compiler.run() 触发一系列钩子

> webpack() 定义在：node_modules/webpack/lib/Compiler.js

- 5.1 触发 beforeRun 钩子
- 5.2 触发 run 钩子
- 5.3 执行 compile 方法（该方法里面继续触发了一堆钩子，参考第6点）
- 5.4 执行 compile 方法成功后，执行 onCompiled 将模块代码写入文件：writeFile()

```javascript
// run() 里就是一堆钩子按着顺序触发
const run = () => {
    // 5.1 触发 beforeRun 钩子
    this.hooks.beforeRun.callAsync(this, err => {
        if (err) return finalCallback(err);
        // 5.2 触发 run 钩子
        this.hooks.run.callAsync(this, err => {
            if (err) return finalCallback(err);
            this.readRecords(err => {
                if (err) return finalCallback(err);
                // 5.3 执行 compile 方法
                this.compile(onCompiled);
            });
        });
    });
};
```

#### 6. run() 中执行 compile()

> run() 定义在：node_modules/webpack/lib/Compiler.js

- 6.1 触发钩子 beforeCompile
- 6.2 触发钩子 compile
- 6.3 触发钩子 thisCompilation、compilation (让 compilation 具备创建模块的能力)
- 6.4 触发钩子 make （重要：make 里面的 compilation.addEntry 根据入口等一些配置项创建模块，执行编译等操作）
- 6.5 触发钩子 finishMake

```javascript
const params = this.newCompilationParams();

this.hooks.beforeCompile.callAsync(params, err => {
    // ...
    this.hooks.compile.call(params);
    // 在newCompilation() 里面触发钩子 thisCompilation、compilation
    const compilation = this.newCompilation(params);
    // ...
    this.hooks.make.callAsync(compilation, err => {
        // ...
        this.hooks.finishMake.callAsync(compilation, err => {
            // ...
        });
    });
});
```

#### 7. 关于 addEntry 的分析（编译入口的重点）

- 7.1 make 钩子触发时执行 compilation.addEntry()，调用前的几个参数说明：见以下代码注释
- 7.2 make 钩子触发时接受一个 compilation 传递给 addEntry()，addEntry() 是在new compilation()里面定义

```awk
// entry 当前打包模块的相对路径（/src/index.js）
// options 里面包括 name、filename、publicPath 等配置
// context 当前项目根路径
// dep 是对当前入口模块依赖关系的处理 
const { entry, options, context } = this;
const dep = EntryPlugin.createDependency(entry, options);
// 这里是 make 钩子的监听
// compilation 是 make 钩子触发的时候传给回调函数的值，addEntry 定义在 compilation 实例化的类里面
compiler.hooks.make.tapAsync("EntryPlugin", (compilation, callback) => {
    compilation.addEntry(context, dep, options, err => {
        callback(err);
    });
});
// 这里是触发 make 钩子
this.hooks.make.callAsync(compilation, err => { // ... }）
```

- 7.3 进入入口函数过后按照以下顺序调用 => Compilation.js

```javascript
addEntry() => _addEntryItem() => addModuleTree() => handleModuleCreation()
```

- 7.4 执行 addModuleTree()，在 compilation 当中我们可以通过 NormalModuleFactory 来创建一个普通模块对象；然后通过 dependencyFactories 获取它

```javascript
// addModuleTree() 中 moduleFactory 是 NormalModuleFactory 创建的普通模块对象
const moduleFactory = this.dependencyFactories.get(Dep);
```

- 7.5 handleModuleCreation() 方法中按照以下顺序调用 => Compilation.js

```javascript
// 注意：factory 就是上面的参数 moduleFactory 
factorizeModule() => factorizeQueue() => _factorizeModule() => factory.create()
```

- 7.6 factory.create() 创建一个模块

```node-repl
> 7.6.1 factory.create() 是定义在 NormalModuleFactory 中的一个成员方法（NormalModuleFactory .js）
> 7.6.2 this.hooks.beforeResolve.callAsync 处理 loader 的路径编译工作，在回调里面触发钩子：factorize
> 7.6.3 this.hooks.factorize.callAsync 处理 loader，然后将 factoryResult 传给 callback()
```

- 7.7 factory.create() 执行完成，将 factoryResult 放到 callback() 中执行

```javascript
> 7.7.1 factory.create 的 callback() 拿到 result(实际就是 factoryResult )
const newModule = result.module;
> 7.7.2 newModule 传递给上面的 factorizeModule() 的 callback()；

// 回调 callback 拿到 newModule，然后执行addModule
this.factorizeModule({
    // ...
},(err, newModule){// 回调 callback 拿到 newModule 
    // ...
    this.addModule（）
})
```

- 7.8 factory.create() 的回调中调用 addModule(newModule) 去创建 module

```dart
this.factorizeModule => ... => factory.create() => this.addModule（）=> this.buildModule()
```

- 7.9 this.buildModule() 编译模块，最后将 doBuild 的执行结果传递给 callback；

```node-repl
> 7.9.1 doBuild() 编译完成的结果存在 this.modules 中
> 7.9.2 doBuild() 方法中实现了核心的编译功能：将 js 代码转为 ast 语法树 => 然后再转换成 code 代码
> 7.9.3 build 在 NormalModule.js 文件中，this.buildModule() => build => doBuild
```







![](https://img-blog.csdnimg.cn/img_convert/b09bdb459896058e8441bbed43d2ff92.png)





### 缓存机制
**webpack 5.x** 
这里大致介绍下webpack的两种缓存机制memory: 内存缓存和filesystem: 持久缓存。

memory 存储在内存中，用于热更新，对重新编译不起作用。实现插件为MemoryCachePlugin，存储方式为Map对象
filesystem 会生成本地文件, 编译过程中只会创建延时写入队列，在编译完之后才会循坏该队列，写入文件。缓存文件默认保存在node_modules/.cache中，一个chunk生成一个缓存文件。实现插件为IdleFileCachePlugin。并且如果配置filesystem做永久化储存，webpack还是会同时使用memory存储，用于watch模式，MemoryCachePlugin插件执行顺序在IdleFileCachePlugin插件之前。



**webpack4.x**
在webpack中，只有内存缓存，在compilation实例中，有一个实例属性cache，为对象类型, 所有的内容皆缓存在这里。

### compiler和compilation

**compiler**: 覆盖编译的整个生命周期，包括初始化、启动、暂停、开始解析、开始封装等等，可以看作是编译过程的推手。理所当然，在整个编译过程只有有一个compiler实例。



**compilation**: 每个编译过程都会生成一个compilation实例。这里的每个编译过程可以看作是watch模式下的文件修改引发的重新编译。原因也很简单，上面指出了，每次watch都会执行compiler.run方法，而初始化compilation是在这之后的。而compilation主要负责的是构建，包括模块的解析、代码生成和封装。