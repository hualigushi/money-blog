[TOC]

# 自定义loader

loader本质上是一个函数，传入指定要处理的文件，然后loader再对这些文件进行处理并返回

```js
loader.js

module.exports = function (content, map, meta) {
    console.log('content', content);
    return content
}
```

```js
webpack.config.js

const path = require('path')
module.exports = {
    mode: 'development',
    module: {
        rules: [{
            test: /\.js/,
        }]
    },
    // 配置loader解析规则
    resolveLoader: {
        modules: [
            'node_modules',
            path.resolve(__dirname, 'loaders')
        ]
    }
}
```

运行 `npx webpack`



## 注意事项

1. loader的执行顺序在use数组里面是从下往上执行

2. loader里面有一个pitch方法，use数组中pitch方法的执行顺序是从上往下执行，因此我们如果想先执行某些功能，可以先在pitch方法中定义

   ```js
   loader1.js
   
   module.exports = function (content, map, meta) {
       console.log('111');
       return content
   }
   
   
   module.exports.pitch = function () {
       console.log('pitch 111');
   }
   
   loader2.js
   
   module.exports = function (content, map, meta) {
       console.log('222');
       return content
   }
   
   module.exports.pitch = function () {
       console.log('pitch 222');
   }
   
   loader3.js
   
   module.exports = function (content, map, meta) {
       console.log('333');
       return content
   }
   
   module.exports.pitch = function () {
       console.log('pitch 333');
   }
   
   
   
   module: {
           rules: [{
               test: /\.js/,
               use:[
                   'loader1',
                   'loader2',
                   'loader3',
               ]
           }]
       },
       
   打印顺序为：
   pitch111
   pitch222
   pitch333
   333 
   222
   111
   ```



pitch 方法共有三个参数：

1. **remainingRequest**：loader 链中排在自己后面的 loader 以及资源文件的**绝对路径**以`!`作为连接符组成的字符串。
2. **precedingRequest**：loader 链中排在自己前面的 loader 的**绝对路径**以`!`作为连接符组成的字符串。
3. **data**：每个 loader 中存放在上下文中的固定字段，可用于 pitch 给 loader 传递数据。

在 pitch 中传给 data 的数据，在后续的调用执行阶段，是可以在 `this.data` 中获取到的：

```javascript
module.exports = function (content) {
  return someSyncOperation(content, this.data.value);// 这里的 this.data.value === 42
};

module.exports.pitch = function (remainingRequest, precedingRequest, data) {
  data.value = 42;
};
```



 

## 同步loader

```js
// 方式一
module.exports = function (content, map, meta) {
  console.log(111);

  return content;
}
// 方式二
 /** this.callback(
      err: Error | null, // 一个无法正常编译时的 Error 或者 直接给个 null
      content: string | Buffer,// 我们处理后返回的内容 可以是 string 或者 Buffer（）
      sourceMap?: SourceMap, // 可选 可以是一个被正常解析的 source map
      meta?: any // 可选 可以是任何东西，比如一个公用的 AST 语法树
    ); **/
module.exports = function (content) {
  // 获取到用户传给当前 loader 的参数
  const options = this.getOptions()
  const res = someSyncOperation(content, options)
  this.callback(null, res, sourceMaps);
  // 注意这里由于使用了 this.callback 直接 return 就行
  return
}
```

> 从 webpack 5 开始，this.getOptions 可以获取到 loader 上下文对象。它用来替代来自[loader-utils](https://github.com/webpack/loader-utils#getoptions)中的 getOptions 方法。



## 异步loader(推荐)

```js
// 异步loader（推荐使用，loader在异步加载的过程中可以执行其余的步骤）

module.exports = function (content) {
  var callback = this.async()
  someAsyncOperation(content, function (err, result) {
    if (err) return callback(err)
    callback(null, result, sourceMaps, meta)
  })
}
```



## "Raw" loader

默认情况下，资源文件会被转化为 UTF-8 字符串，然后传给 loader。通过设置 raw 为 true，loader 可以接收原始的 Buffer。每一个 loader 都可以用 String 或者 Buffer 的形式传递它的处理结果。complier 将会把它们在 loader 之间相互转换。大家熟悉的 file-loader 就是用了这个。 **简而言之**：你加上 `module.exports.raw = true;` 传给你的就是 Buffer 了，处理返回的类型也并非一定要是 Buffer，webpack 并没有限制。


```javascript
module.exports = function (content) {
  console.log(content instanceof Buffer); // true
  return doSomeOperation(content)
}
// 划重点↓
module.exports.raw = true;
```



## 获取&校验loader的options

`npm install loader-utils schema-utils -D`

```javascript
loader.js

// 1.1 获取options 引入
const {
	getOptions
} = require('loader-utils');
// 2.1 获取validate（校验options是否合法）引入
const {
	validate
} = require('schema-utils');

// 2.3创建schema.json文件校验规则并引入使用
const schema = require('./schema');

module.exports = function(content, map, meta) {
	// 1.2 获取options 使用
	const options = getOptions(this);

	console.log(333, options);

	// 2.2校验options是否合法 使用
	validate(schema, options, {
		name: 'loader3'
	})

	return content;
}

module.exports.pitch = function() {
	console.log('pitch 333');
}
```

```javascript
schema.json

{
	"type": "object",
	"properties": {
		"name": {
			"type": "string",
			"description": "名称～"
		}
	},
	"additionalProperties": false // 如果设置为true表示除了校验前面写的string类型还可以  接着  校验其余类型，如果为false表示校验了string类型之后不可以再校验其余类型
}
```

```javascript
webpack.config.js

const path = require('path')
module.exports = {
    mode: 'development',
    module: {
        rules: [{
            test: /\.js$/,
            use: [{
                loader: 'loader3',
                // options部分
                options: {
                    name: 'jack',
                    age: 18 // 根据规则，这个字段非法
                }
            }]
        }]
    },
    // 配置loader解析规则：我们的loader去哪个文件夹下面寻找（这里表示的是同级目录的loaders文件夹下面寻找）
    resolveLoader: {
        modules: [
            'node_modules',
            path.resolve(__dirname, 'loaders')
        ]
    }
}
```



# plugin

##  tapable

1. 安装tapable：`npm install tapable -D`

2. 初始化hooks容器 

    2.1 同步hooks，任务会依次执行:SyncHook、SyncBailHook 

    2.2 异步hooks，异步并行：AsyncParallelHook，异步串行：AsyncSeriesHook

3. 往hooks容器中注册事件/添加回调函数

4. 触发hooks

5. 启动文件：node tapable.test.js

```javascript
tapable.test.js

const {
  SyncHook,
  SyncBailHook,
  AsyncParallelHook,
  AsyncSeriesHook
} = require('tapable');

class Lesson {
  constructor() {
    // 初始化hooks容器
    this.hooks = {
      // 同步hooks，任务回依次执行
      // go: new SyncHook(['address'])
      // SyncBailHook：一旦有返回值就会退出～
      go: new SyncBailHook(['address']),

      // 异步hooks
      // AsyncParallelHook：异步并行
      // leave: new AsyncParallelHook(['name', 'age']),
      // AsyncSeriesHook: 异步串行
      leave: new AsyncSeriesHook(['name', 'age'])
    }
  }
  tap() {
    // 往hooks容器中注册事件/添加回调函数
    this.hooks.go.tap('class0318', (address) => {
      console.log('class0318', address);
      return 111;
    })
    this.hooks.go.tap('class0410', (address) => {
      console.log('class0410', address);
    })

    this.hooks.leave.tapAsync('class0510', (name, age, cb) => {
      setTimeout(() => {
        console.log('class0510', name, age);
        cb();
      }, 2000)
    })

    this.hooks.leave.tapPromise('class0610', (name, age) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('class0610', name, age);
          resolve();
        }, 1000)
      })
    })
  }

  start() {
    // 触发hooks
    this.hooks.go.call('c318');
    this.hooks.leave.callAsync('jack', 18, function () {
      // 代表所有leave容器中的函数触发完了，才触发
      console.log('end~~~');
    });
  }
}

const l = new Lesson();
l.tap();
l.start();


输出：
class0318 c318
class0510 jack 18
class0610 jack 18
end~~~
```



 ## Compiler and Compilation

`compiler` 对象可以理解为一个和 webpack 环境整体绑定的一个对象，它包含了所有的环境配置，包括 options，loader 和 plugin，当 webpack **启动**时，这个对象会被实例化，并且他是**全局唯一**的，上面我们说到的 `apply` 方法传入的参数就是它。

`compilation` 在每次构建资源的过程中都会被创建出来，一个 compilation 对象表现了当前的模块资源、编译生成资源、变化的文件、以及被跟踪依赖的状态信息。它同样也提供了很多的 hook 。


 

## compiler的hooks使用

```javascript
Plugin.js

class Plugin1 {
  apply(complier) {

    complier.hooks.emit.tap('Plugin1', (compilation) => {
      console.log('emit.tap 111');
    })

    complier.hooks.emit.tapAsync('Plugin1', (compilation, cb) => {
      setTimeout(() => {
        console.log('emit.tapAsync 111');
        cb();
      }, 1000)
    })

    complier.hooks.emit.tapPromise('Plugin1', (compilation) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('emit.tapPromise 111');
          resolve();
        }, 1000)
      })
    })

    complier.hooks.afterEmit.tap('Plugin1', (compilation) => {
      console.log('afterEmit.tap 111');
    })

    complier.hooks.done.tap('Plugin1', (stats) => {
      console.log('done.tap 111');
    })

  }
}

module.exports = Plugin1;
```

```
weboack.config.js

const Plugin1 = require('./plugins/Plugin1')

module.exports = {
  plugins: [
     new Plugin1()
  ]
}
```

工作方式：异步串行执行，

因此码输出顺序如下： emit.tap 111 

​                                      1秒后输出 emit.tapAsync 111 

​                                      1秒后输出 emit.tapPromise 111 

​                                      afterEmit.tap 111 

​                                      done.tap 111

tapAsync 和 tapPromise表示异步



 ##  compilation钩子

```javascript
const fs = require('fs');
const util = require('util');
const path = require('path');

const webpack = require('webpack');
const { RawSource } = webpack.sources;

// 将fs.readFile方法变成基于promise风格的异步方法
const readFile = util.promisify(fs.readFile);

/*
  1. 初始化compilation钩子
  2. 往要输出资源中，添加一个a.txt文件
  3. 读取b.txt中的内容，将b.txt中的内容添加到输出资源中的b.txt文件中
      3.1 读取b.txt中的内容需要使用node的readFile模块
      3.2  将b.txt中的内容添加到输出资源中的b.txt文件中除了使用 2 中的方法外，还有两种形式可以使用
          3.2.1 借助RawSource
          3.2.2 借助RawSource和emitAsset
*/

class Plugin2 {

  apply(compiler) {
    // 1.初始化compilation钩子
    compiler.hooks.thisCompilation.tap('Plugin2', (compilation) => {
      // debugger
      // console.log(compilation);
      // 添加资源
      compilation.hooks.additionalAssets.tapAsync('Plugin2', async (cb) => {
        // debugger
        // console.log(compilation);

        const content = 'hello plugin2';

        // 2.往要输出资源中，添加一个a.txt
        compilation.assets['a.txt'] = {
          // 文件大小
          size() {
            return content.length;
          },
          // 文件内容
          source() {
            return content;
          }
        }

        const data = await readFile(path.resolve(__dirname, 'b.txt'));

        // 3.2.1 compilation.assets['b.txt'] = new RawSource(data);
        // 3.2.1
        compilation.emitAsset('b.txt', new RawSource(data));

        cb();

      })
    })

  }

}

module.exports = Plugin2;
```



## 自定义CopyWebpackPlugin

**CopyWebpackPlugin的功能**：将public文件夹中的文件复制到dist文件夹下面（忽略index.html文件）

1. 创建schema.json校验文件

   ```json
   {
     "type": "object",
     "properties": {
       "from": {
         "type": "string"
       },
       "to": {
         "type": "string"
       },
       "ignore": {
         "type": "array"
       }
     },
     "additionalProperties": false
   }
   ```

2. 创建CopyWebpackPlugin.js插件文件

​      编码思路 :  下载schema-utils和globby：npm install globby schema-utils -D 将from中的资源复制到to中，输出出去 

1. 过滤掉ignore的文件 
2. 读取paths中所有资源 
3. 生成webpack格式的资源
4. 添加compilation中，输出出去

```javascript
const path = require('path');
const fs = require('fs');
const {promisify} = require('util')

const { validate } = require('schema-utils');
const globby = require('globby');// globby用来匹配文件目标
const webpack = require('webpack');

const schema = require('./schema.json');
const { Compilation } = require('webpack');

const readFile = promisify(fs.readFile);
const {RawSource} = webpack.sources

class CopyWebpackPlugin {
  constructor(options = {}) {
    // 验证options是否符合规范
    validate(schema, options, {
      name: 'CopyWebpackPlugin'
    })

    this.options = options;
  }
  apply(compiler) {
    // 初始化compilation
    compiler.hooks.thisCompilation.tap('CopyWebpackPlugin', (compilation) => {
      // 添加资源的hooks
      compilation.hooks.additionalAssets.tapAsync('CopyWebpackPlugin', async (cb) => {
        // 将from中的资源复制到to中，输出出去
        const { from, ignore } = this.options;
        const to = this.options.to ? this.options.to : '.';
        
        // context就是webpack配置
        // 运行指令的目录
        const context = compiler.options.context; // process.cwd()
        // 将输入路径变成绝对路径
        const absoluteFrom = path.isAbsolute(from) ? from : path.resolve(context, from);

        // 1. 过滤掉ignore的文件
        // globby(要处理的文件夹，options)
        const paths = await globby(absoluteFrom, { ignore });

        console.log(paths); // 所有要加载的文件路径数组

        // 2. 读取paths中所有资源
        const files = await Promise.all(
          paths.map(async (absolutePath) => {
            // 读取文件
            const data = await readFile(absolutePath);
            // basename得到最后的文件名称
            const relativePath = path.basename(absolutePath);
            // 和to属性结合
            // 没有to --> reset.css
            // 有to --> css/reset.css(对应webpack.config.js中CopyWebpackPlugin插件的to的名称css)
            const filename = path.join(to, relativePath);

            return {
              // 文件数据
              data,
              // 文件名称
              filename
            }
          })
        )

        // 3. 生成webpack格式的资源
        const assets = files.map((file) => {
          const source = new RawSource(file.data);
          return {
            source,
            filename: file.filename
          }
        })
        
        // 4. 添加compilation中，输出出去
        assets.forEach((asset) => {
          compilation.emitAsset(asset.filename, asset.source);
        })

        cb();
      })
    })
  }

}

module.exports = CopyWebpackPlugin;
```



```javascript
const CopyWebpackPlugin = require('./plugins/CopyWebpackPlugin')

module.exports = {
  mode: 'development',
  plugins: [
    new CopyWebpackPlugin({
      from: 'public',
      to: 'css',
      ignore: ['**/index.html']
    })
  ]
}
```



# 自定义Webpack

## Webpack 执行流程

1. 初始化 Compiler：webpack(config) 得到 Compiler 对象

2. 开始编译：调用 Compiler 对象 run 方法开始执行编译

3. 确定入口：根据配置中的 entry 找出所有的入口文件。

4. 编译模块：从入口文件出发，调用所有配置的 Loader 对模块进行编译，再找出该模块依赖的模块，递归直到所有模块被加载进来

5. 完成模块编译： 在经过第 4 步使用 Loader 编译完所有模块后，得到了每个模块被编译后的最终内容以及它们之间的依赖关系。

6. 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表。（注意：这步是可以修改输出内容的最后机会）

7. 输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统



## 准备工作

1. 创建文件夹myWebpack

2. 创建src-->(add.js / count.js / index.js)，写入对应的js代码

3. 创建config-->webpack.config.js写入webpack基础配置（entry和output）

   ```
   const path = require('path');
   
   module.exports = {
     entry: './src/index.js',
     output: {
       path: path.resolve(__dirname, '../dist'),
       filename: 'main.js'
     }
   }
   ```

4. 创建lib文件夹，里面写webpack的主要配置

5. 创建script-->build.js（将lib文件夹下面的myWebpack核心代码和config文件下的webpack基础配置引入并调用run()函数开始打包）

   ```javascript
   build.js
   
   const myWebpack = require('../lib/myWebpack');
   const config = require('../config/webpack.config');
   
   const compiler = myWebpack(config);
   // 开始打包webpack
   compiler.run();
   ```

   ```javascript
   lib/myWebpack/index.js
   
   const Compiler = require('./Compiler');
   
   function myWebpack(config) {
     return new Compiler(config);
   }
   
   
   module.exports = myWebpack;
   ```

   ```javascript
   lib/myWebpack/Compiler.js
   
   const path = require('path');
   const fs = require('fs');
   const { getAst, getDeps, getCode } = require('./parser')
   
   class Compiler {
     constructor(options = {}) {
       // webpack配置对象
       this.options = options;
       // 所有依赖的容器
       this.modules = [];
     }
     // 启动webpack打包
     run() {
       // 入口文件路径
       const filePath = this.options.entry;
       
       // 第一次构建，得到入口文件的信息
       const fileInfo = this.build(filePath);
   
       this.modules.push(fileInfo);
   
       // 遍历所有的依赖
       this.modules.forEach((fileInfo) => {
         /**
          {
             './add.js': 'myWebpack/src/add.js',
             './count.js': 'myWebpack/src/count.js'
           } 
          */
         // 取出当前文件的所有依赖
         const deps = fileInfo.deps;
         // 遍历
         for (const relativePath in deps) {
           // 依赖文件的绝对路径
           const absolutePath = deps[relativePath];
           // 对依赖文件进行处理
           const fileInfo = this.build(absolutePath);
           // 将处理后的结果添加modules中，后面遍历就会遍历它了～
           this.modules.push(fileInfo);
         }
         
       })
   
       console.log(this.modules);
   
       // 将依赖整理更好依赖关系图
       /*
         {
           'index.js': {
             code: 'xxx',
             deps: { 'add.js': "xxx" }
           },
           'add.js': {
             code: 'xxx',
             deps: {}
           }
         }
       */
      const depsGraph = this.modules.reduce((graph, module) => {
        return {
          ...graph,
          [module.filePath]: {
            code: module.code,
            deps: module.deps
          }
        }
      }, {})
   
      console.log(depsGraph);
   
      this.generate(depsGraph)
   
     }
   
     // 开始构建
     build(filePath) {
       // 1. 将文件解析成ast
       const ast = getAst(filePath);
       // 2. 获取ast中所有的依赖
       const deps = getDeps(ast, filePath);
       // 3. 将ast解析成code
       const code = getCode(ast);
   
       return {
         // 文件路径
         filePath,
         // 当前文件的所有依赖
         deps,
         // 当前文件解析后的代码
         code
       }
     }
   
     // 生成输出资源
     generate(depsGraph) {
   
       /* index.js的代码
         "use strict";\n' +
         '\n' +
         'var _add = _interopRequireDefault(require("./add.js"));\n' +
         '\n' +
         'var _count = _interopRequireDefault(require("./count.js"));\n' +
         '\n' +
         'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
         '\n' +
         'console.log((0, _add["default"])(1, 2));\n' +
         'console.log((0, _count["default"])(3, 1));
       */
   
       const bundle = `
         (function (depsGraph) {
           // require目的：为了加载入口文件
           function require(module) {
             // 定义模块内部的require函数
             function localRequire(relativePath) {
               // 为了找到要引入模块的绝对路径，通过require加载
               return require(depsGraph[module].deps[relativePath]);
             }
             // 定义暴露对象（将来我们模块要暴露的内容）
             var exports = {};
   
             (function (require, exports, code) {
               eval(code);
             })(localRequire, exports, depsGraph[module].code);
             
             // 作为require函数的返回值返回出去
             // 后面的require函数能得到暴露的内容
             return exports;
           }
           // 加载入口文件
           require('${this.options.entry}');
   
         })(${JSON.stringify(depsGraph)})
       `
       // 生成输出文件的绝对路径
       const filePath = path.resolve(this.options.output.path, this.options.output.filename)
       // 写入文件
       fs.writeFileSync(filePath, bundle, 'utf-8');
     }
   }
   
   module.exports = Compiler;
   ```

   ```js
   lib/myWebpack/parser.js
   
   const fs = require('fs');
   const path = require('path');
   
   /** npm install @babel/parser -D用来将代码解析成ast抽象语法树
   npm install @babel/traverse -D用来遍历ast抽象语法树代码
   npm install @babel/core-D用来将代码中浏览器不能识别的语法进行编译
   **/
   const babelParser = require('@babel/parser');
   const traverse = require('@babel/traverse').default;
   const { transformFromAst } = require('@babel/core');
   
   const parser = {
     // 将文件解析成ast
     getAst(filePath) {
       // 读取文件
       const file = fs.readFileSync(filePath, 'utf-8');
       // 将其解析成ast抽象语法树
       const ast = babelParser.parse(file, {
         sourceType: 'module' // 解析文件的模块化方案是 ES Module
       })
       return ast;
     },
     // 获取依赖
     getDeps(ast, filePath) {
       const dirname = path.dirname(filePath);
   
       // 定义存储依赖的容器
       const deps = {}
   
       // 收集依赖
       traverse(ast, {
         // 内部会遍历ast中program.body，判断里面语句类型
         // 如果 type：ImportDeclaration 就会触发当前函数
         ImportDeclaration({node}) {
           // 文件相对路径：'./add.js'
           const relativePath = node.source.value;
           // 生成基于入口文件的绝对路径
           const absolutePath = path.resolve(dirname, relativePath);
           // 添加依赖
           deps[relativePath] = absolutePath;
         }
       })
   
       return deps;
     },
     // 将ast解析成code
     getCode(ast) {
       const { code } = transformFromAst(ast, null, {
         presets: ['@babel/preset-env']
       })
       return code;
     }
   };
   
   module.exports = parser;
   ```

   

6. 为了方便启动，控制台通过输入命令 `npm init -y`拉取出`package.json`文件，修改文件中scripts部分为`"build": "node ./script/build.js"`表示通过在终端输入命令`npm run build`时会运行/script/build.js文件，在scripts中添加`"debug": "node --inspect-brk ./script/build.js"`表示通过在终端输入命令`npm run debug`时会调试/script/build.js文件中的代码

   ```json
   package.json
   
   "scripts": {
       "build": "node ./script/build.js",
       "debug": "node --inspect-brk ./script/build.js",
       "test": "echo \"Error: no test specified\" && exit 1"
     },
   ```

   