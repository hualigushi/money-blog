[TOC]

鉴于前端技术变更迅速，祭出本篇文章基于 `Webpack` 的版本号:

```
├── webpack@4.41.5 
└── webpack-cli@3.3.10 
```

本文对应的项目地址(编写本文时使用)供参考：[github.com/YvetteLau/w…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2FYvetteLau%2Fwebpack%2Ftree%2Fmaster%2Fwebpack-optimize)



## 量化

有时，我们以为的优化是负优化，这时，如果有一个量化的指标可以看出前后对比，那将会是再好不过的一件事。

`speed-measure-webpack-plugin` 插件可以测量各个插件和`loader`所花费的时间，使用之后，构建时，会得到类似下面这样的信息：



![smp.jpeg](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/3/14/170d9bf274c164c1~tplv-t2oaga2asx-watermark.awebp)

对比前后的信息，来确定优化的效果。



[speed-measure-webpack-plugin](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fspeed-measure-webpack-plugin) 的使用很简单，可以直接用其来包裹 `Webpack` 的配置:

```javascript
//webpack.config.js
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

const config = {
    //...webpack配置
}

module.exports = smp.wrap(config);
```



## 分析影响打包速度环节

打包就是从入口文件开始将所有的依赖模块打包到一个文件中的过程，当然，在打包过程中涉及各种编译、优化过程。

打包过程中，常见影响构建速度的地方有哪些喃？

#### 1. 开始打包，我们需要获取所有的依赖模块

搜索所有的依赖项，这需要占用一定的时间，即搜索时间，那么我们就确定了：

**我们需要优化的第一个时间就是搜索时间。**

#### 2. 解析所有的依赖模块（解析成浏览器可运行的代码）

webpack 根据我们配置的 loader 解析相应的文件。

日常开发中我们需要使用 loader 对 js ，css ，图片，字体等文件做转换操作，并且转换的文件数据量也是非常大。由于 js 单线程的特性使得这些转换操作不能并发处理文件，而是需要一个个文件进行处理。

**我们需要优化的第二个时间就是解析时间。**

#### 3. 将所有的依赖模块打包到一个文件

将所有解析完成的代码，打包到一个文件中，为了使浏览器加载的包更新（减小白屏时间），所以 webpack 会对代码进行优化。

JS 压缩是发布编译的最后阶段，通常 webpack 需要卡好一会，这是因为压缩  JS 需要先将代码解析成 AST 语法树，然后需要根据复杂的规则去分析和处理 AST，最后将 AST 还原成  JS，这个过程涉及到大量计算，因此比较耗时，打包就容易卡住。

**我们需要优化的第三个时间就是压缩时间。**

#### 4. 二次打包

当更改项目中一个小小的文件时，我们需要重新打包，所有的文件都必须要重新打包，需要花费同初次打包相同的时间，但项目中大部分文件都没有变更，尤其是第三方库。

**我们需要优化的第四个时间就是二次打包时间。**



## 优化搜索时间- 缩小文件搜索范围 减小不必要的编译工作

webpack 打包时，会从配置的 `entry` 触发，解析入口文件的导入语句，再递归的解析，在遇到导入语句时 webpack 会做两件事情：

- 根据导入语句去寻找对应的要导入的文件。例如 `require('react')` 导入语句对应的文件是 `./node_modules/react/react.js`，`require('./util')` 对应的文件是 `./util.js`。
- 根据找到的要导入文件的后缀，使用配置中的 Loader 去处理文件。例如使用 ES6 开发的 JavaScript 文件需要使用 babel-loader 去处理。

以上两件事情虽然对于处理一个文件非常快，但是当项目大了以后文件量会变的非常多，这时候构建速度慢的问题就会暴露出来。 虽然以上两件事情无法避免，但需要尽量减少以上两件事情的发生，以提高速度。

 

### 1.exclude/include

我们可以通过 `exclude`、`include` 配置来确保转译尽可能少的文件。顾名思义，`exclude` 指定要排除的文件，`include` 指定要包含的文件。

`exclude` 的优先级高于 `include`，在 `include` 和 `exclude` 中使用绝对路径数组，尽量避免 `exclude`，更倾向于使用 `include`。

```javascript
//webpack.config.js
const path = require('path');
module.exports = {
    //...
    module: {
        rules: [
            {
                test: /\.js[x]?$/,
                use: ['babel-loader'],
                include: [path.resolve(__dirname, 'src')]
            }
        ]
    },
}
```

下图是我未配置 `include` 和配置了 `include` 的构建结果对比：



![include:exclude.jpeg](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/3/14/170d9bf279131194~tplv-t2oaga2asx-watermark.awebp)



### 2.resolve

`resolve` 配置 `webpack` 如何寻找模块所对应的文件。假设我们确定模块都从根目录下的 `node_modules` 中查找，我们可以配置:

```javascript
//webpack.config.js
const path = require('path');
module.exports = {
    //...
    resolve: {
        modules: [path.resolve(__dirname, 'node_modules')],
    }
}
```

需要记住的是，如果你配置了上述的 `resolve.moudles` ，可能会出现问题，

例如，你的依赖中还存在 `node_modules` 目录，那么就会出现，对应的文件明明在，但是却提示找不到。

因此呢，个人不推荐配置这个。如果其他同事不熟悉这个配置，遇到这个问题时，会摸不着头脑。

另外，`resolve` 的 `extensions` 配置，默认是 `['.js', '.json']`，如果你要对它进行配置，记住将频率最高的后缀放在第一位，并且控制列表的长度，以减少尝试次数。

本项目较小，因此测试时，此处优化效果不明显。



### 3.noParse

如果一些第三方模块没有AMD/CommonJS规范版本，可以使用 `noParse` 来标识这个模块，这样 `Webpack` 会引入这些模块，但是不进行转化和解析，从而提升 `Webpack` 的构建性能 ，例如：`jquery` 、`lodash`。

[noParse](https://link.juejin.cn?target=http%3A%2F%2Fwebpack.html.cn%2Fconfiguration%2Fmodule.html) 属性的值是一个正则表达式或者是一个 `function`。

```javascript
// 编译代码的基础配置
module.exports = {
  // ...
  module: {
    // 项目中使用的 jquery 并没有采用模块化标准，webpack 忽略它
    noParse: /jquery/,
    rules: [
      {
        // 这里编译 js、jsx
        // 注意：如果项目源码中没有 jsx 文件就不要写 /\.jsx?$/，提升正则表达式性能
        test: /\.(js|jsx)$/,
        // babel-loader 支持缓存转换出的结果，通过 cacheDirectory 选项开启
        use: ['babel-loader?cacheDirectory'],
        // 排除 node_modules 目录下的文件
        // node_modules 目录下的文件都是采用的 ES5 语法，没必要再通过 Babel 去转换
        exclude: /node_modules/,
      },
    ]
  },
  resolve: {
    // 设置模块导入规则，import/require时会直接在这些目录找文件
    // 可以指明存放第三方模块的绝对路径，以减少寻找
    modules: [
      path.resolve(`${project}/client/components`), 
      path.resolve('h5_commonr/components'), 
      'node_modules'
    ],
    // import导入时省略后缀
    // 注意：尽可能的减少后缀尝试的可能性
    extensions: ['.js', '.jsx', '.react.js', '.css', '.json'],
    // import导入时别名，减少耗时的递归解析操作
    alias: {
      '@compontents': path.resolve(`${project}/compontents`),
    }
  },
};
```

我当前的 `webpack-optimize` 项目中，没有使用 `jquery` 或者是 `lodash`。

因此新建一个项目测试，只引入 `jquery` 和 `loadsh`，然后配置 `noParse` 和不配置 `noParse`，分别构建比对时间。

配置`noParse` 前，构建需要 `2392ms`。配置了 `noParse` 之后，构建需要 `1613ms`。 如果你使用到了不需要解析的第三方依赖，那么配置 `noParse` 很显然是一定会起到优化作用的。



## 合理利用缓存（缩短连续构建时间，增加初始构建时间）

### 1. cache-loader

在一些性能开销较大的 `loader` 之前添加 `cache-loader`，将结果缓存中磁盘中。

默认保存在 `node_modueles/.cache/cache-loader` 目录下。

首先安装依赖：

```
npm install cache-loader -D
```

`cache-loader` 的配置很简单，放在其他 `loader` 之前即可。修改`Webpack` 的配置如下:

```javascript
module.exports = {
    //...
    
    module: {
        //我的项目中,babel-loader耗时比较长，所以我给它配置了`cache-loader`
        rules: [
            {
                test: /\.jsx?$/,
                use: ['cache-loader','babel-loader']
            }
        ]
    }
}
```

如果你跟我一样，只打算给 `babel-loader` 配置 `cache` 的话，也可以不使用 `cache-loader`，给 `babel-loader` 增加选项 `cacheDirectory`。



![cache-loader.jpeg](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/3/14/170d9bf279c1cd59~tplv-t2oaga2asx-watermark.awebp)



`cacheDirectory`：默认值为 `false`。

当有设置时，指定的目录将用来缓存 `loader` 的执行结果。

之后的 `Webpack` 构建，将会尝试读取缓存，来避免在每次执行时，可能产生的、高性能消耗的 `Babel` 重新编译过程。

设置空值或者 `true` 的话，使用默认缓存目录：`node_modules/.cache/babel-loader`。

开启 `babel-loader`的缓存和配置 `cache-loader`，我比对了下，构建时间很接近。

### 2.HardSourceWebpackPlugin （代替DLL）（webpack 5已废弃）

`HardSourceWebpackPlugin` 为模块提供中间缓存，缓存默认的存放路径是: `node_modules/.cache/hard-source`。

配置 `hard-source-webpack-plugin`，首次构建时间没有太大变化，但是第二次开始，构建时间大约可以节约 80%。

首先安装依赖:

```
npm install hard-source-webpack-plugin -D
```

修改 `webpack` 的配置：

```javascript
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const clientWebpackConfig = {
  // ...
  plugins: [
    new HardSourceWebpackPlugin({
      // cacheDirectory是在高速缓存写入。默认情况下，将缓存存储在node_modules下的目录中
      // 'node_modules/.cache/hard-source/[confighash]'
      cacheDirectory: path.join(__dirname, './lib/.cache/hard-source/[confighash]'),
      // configHash在启动webpack实例时转换webpack配置，
      // 并用于cacheDirectory为不同的webpack配置构建不同的缓存
      configHash: function(webpackConfig) {
        // node-object-hash on npm can be used to build this.
        return require('node-object-hash')({sort: false}).hash(webpackConfig);
      },
      // 当加载器、插件、其他构建时脚本或其他动态依赖项发生更改时，
      // hard-source需要替换缓存以确保输出正确。
      // environmentHash被用来确定这一点。如果散列与先前的构建不同，则将使用新的缓存
      environmentHash: {
        root: process.cwd(),
        directories: [],
        files: ['package-lock.json', 'yarn.lock'],
      },
      // An object. 控制来源
      info: {
        // 'none' or 'test'.
        mode: 'none',
        // 'debug', 'log', 'info', 'warn', or 'error'.
        level: 'debug',
      },
      // Clean up large, old caches automatically.
      cachePrune: {
        // Caches younger than `maxAge` are not considered for deletion. They must
        // be at least this (default: 2 days) old in milliseconds.
        maxAge: 2 * 24 * 60 * 60 * 1000,
        // All caches together must be larger than `sizeThreshold` before any
        // caches will be deleted. Together they must be at least this
        // (default: 50 MB) big in bytes.
        sizeThreshold: 50 * 1024 * 1024
      },
    }),
    new HardSourceWebpackPlugin.ExcludeModulePlugin([
      {
        test: /.*\.DS_Store/
      }
    ]),
  ]
}
```



![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/3/14/170d9bf27e20fd0e~tplv-t2oaga2asx-watermark.awebp)

用另外一个比较大的项目测试了下，配置了 `HardSourceWebpackPlugin`，构建时间从 8S 左右降到了 2S 左右。

[HardSourceWebpackPlugin文档中](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fhard-source-webpack-plugin) 列出了一些你可能会遇到的问题以及如何解决，例如热更新失效，或者某些配置不生效等。



## 优化解析时间 - 开启多进程打包

### 1.happypack

由于有大量文件需要解析和处理，构建是文件读写和计算密集型的操作，特别是当文件数量变多后，`Webpack` 构建慢的问题会显得严重。

HappyPack 可利用多进程对文件进行打包(默认cpu核数-1)，对多核cpu利用率更高。

HappyPack 可以让 Webpack 同一时间处理多个任务，发挥多核 CPU 的能力，将任务分解给多个子进程去并发的执行，子进程处理完后，再把结果发送给主进程。

happypack 的处理思路是将原有的 webpack 对 loader 的执行过程从单一进程的形式扩展多进程模式，原本的流程保持不变。使用 HappyPack 也有一些限制，它只兼容部分主流的 loader，具体可以查看官方给出的 [兼容性列表](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Famireh%2Fhappypack%2Fwiki%2FLoader-Compatibility-List)。

> **注意：Ahmad Amireh 推荐使用 thread-loader，并宣布将不再继续维护 happypack，所以不推荐使用它**



首先需要安装 `happypack`:

```
npm install happypack -D
```

修改配置文件:

```javascript
const Happypack = require('happypack');
module.exports = {
    //...
    module: {
        rules: [
            {
                test: /\.js[x]?$/,
                use: 'Happypack/loader?id=js',
                include: [path.resolve(__dirname, 'src')]
            },
            {
                test: /\.css$/,
                use: 'Happypack/loader?id=css',
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'node_modules', 'bootstrap', 'dist')
                ]
            }
        ]
    },
    plugins: [
        new Happypack({
            id: 'js', //和rule中的id=js对应
            //将之前 rule 中的 loader 在此配置
            use: ['babel-loader'] //必须是数组
        }),
        new Happypack({
            id: 'css',//和rule中的id=css对应
            use: ['style-loader', 'css-loader','postcss-loader'],
        })
    ]
}
```

`happypack` 默认开启 `CPU核数 - 1` 个进程，当然，我们也可以传递 `threads` 给 `Happypack`。



![happypack.jpeg](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/3/14/170d9bf27caaa71c~tplv-t2oaga2asx-watermark.awebp)



说明：当 `postcss-loader` 配置在 `Happypack` 中，必须要在项目中创建 `postcss.config.js`。

```
//postcss.config.js
module.exports = {
    plugins: [
        require('autoprefixer')()
    ]
}
```

否则，会抛出错误: `Error: No PostCSS Config found`

另外，当你的项目不是很复杂时，不需要配置 `happypack`，因为进程的分配和管理也需要时间，并不能有效提升构建速度，甚至会变慢。

### 2.thread-loader（webpack4 官方推荐）

把 `thread-loader` 放置在其它 `loader` 之前，那么放置在这个 `loader` 之后的 `loader` 就会在一个单独的 `worker` 池中运行。

一个worker 就是一个nodeJS 进程【node.js proces】，每个单独进程处理时间上限为600ms，各个进程的数据交换也会限制在这个时间内。



在 worker 池(worker pool)中运行的 loader 是受到限制的。例如：

- 这些 `loader` 不能产生新的文件。
- 这些 `loader` 不能使用定制的 `loader` API（也就是说，通过插件）。
- 这些 `loader` 无法获取 `webpack` 的选项设置。

首先安装依赖：

```
npm install thread-loader -D
```

修改配置:

```
module.exports = {
    module: {
        //我的项目中,babel-loader耗时比较长，所以我给它配置 thread-loader
        rules: [
            {
                test: /\.jsx?$/,
                use: ['thread-loader', 'cache-loader', 'babel-loader']
            }
        ]
    }
}
```

`thread-loader` 和 `Happypack` 我对比了一下，构建时间基本没什么差别。不过 `thread-loader` 配置起来为简单。

官方上说每个 worker 大概都要花费 600ms ，所以官方为了防止启动 worker 时的高延迟，提供了对 worker 池的优化：**预热**

```js
// ...
const threadLoader = require('thread-loader');

const jsWorkerPool = {
  // options
  
  // 产生的 worker 的数量，默认是 (cpu 核心数 - 1)
  // 当 require('os').cpus() 是 undefined 时，则为 1
  workers: 2,
  
  // 闲置时定时删除 worker 进程
  // 默认为 500ms
  // 可以设置为无穷大， 这样在监视模式(--watch)下可以保持 worker 持续存在
  poolTimeout: 2000
};

const cssWorkerPool = {
  // 一个 worker 进程中并行执行工作的数量
  // 默认为 20
  workerParallelJobs: 2,
  poolTimeout: 2000
};

threadLoader.warmup(jsWorkerPool, ['babel-loader']);
threadLoader.warmup(cssWorkerPool, ['css-loader', 'postcss-loader']);


module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'thread-loader',
            options: jsWorkerPool
          },
          'babel-loader'
        ]
      },
      {
        test: /\.s?css$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'thread-loader',
            options: cssWorkerPool
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]__[local]--[hash:base64:5]',
              importLoaders: 1
            }
          },
          'postcss-loader'
        ]
      }
      // ...
    ]
    // ...
  }
  // ...
}
```



**注意：请仅在耗时的 loader 上使用。**



## 优化压缩时间

### 2.开启 JS 多进程压缩

当前 `Webpack` 默认使用的是 `TerserWebpackPlugin`，默认就开启了多进程和缓存，构建时，你的项目中可以看到 `terser` 的缓存文件 `node_modules/.cache/terser-webpack-plugin`。



## 其他

### 1.IgnorePlugin

`webpack` 的内置插件，作用是忽略第三方包指定目录。

例如: `moment` (2.24.0版本) 会将所有本地化内容和核心功能一起打包，我们就可以使用 `IgnorePlugin` 在打包时忽略本地化内容。

```
//webpack.config.js
module.exports = {
    //...
    plugins: [
        //忽略 moment 下的 ./locale 目录
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ]
}
```

在使用的时候，如果我们需要指定语言，那么需要我们手动的去引入语言包，例如，引入中文语言包:

```
import moment from 'moment';
import 'moment/locale/zh-cn';// 手动引入
```

`index.js` 中只引入 `moment`，打包出来的 `bundle.js` 大小为 `263KB`，如果配置了 `IgnorePlugin`，单独引入 `moment/locale/zh-cn`，构建出来的包大小为 `55KB`。

### 2.externals

我们可以将一些JS文件存储在 `CDN` 上(减少 `Webpack`打包出来的 `js` 体积)，在 `index.html` 中通过 `<script>` 标签引入，如:

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <div id="root">root</div>
    <script src="http://libs.baidu.com/jquery/2.0.0/jquery.min.js"></script>
</body>
</html>
```

我们希望在使用时，仍然可以通过 `import` 的方式去引用(如 `import $ from 'jquery'`)，并且希望 `webpack` 不会对其进行打包，此时就可以配置 `externals`。

```
//webpack.config.js
module.exports = {
    //...
    externals: {
        //jquery通过script引入之后，全局中即有了 jQuery 变量
        'jquery': 'jQuery'
    }
}
```



### 3.抽离公共代码

抽离公共代码是对于多页应用来说的，如果多个页面引入了一些公共模块，那么可以把这些公共的模块抽离出来，单独打包。公共代码只需要下载一次就缓存起来了，避免了重复下载。

抽离公共代码对于单页应用和多页应该在配置上没有什么区别，都是配置在 `optimization.splitChunks` 中。

```
//webpack.config.js
module.exports = {
    optimization: {
        splitChunks: {//分割代码块
            cacheGroups: {
                vendor: {
                    //第三方依赖
                    priority: 1, //设置优先级，首先抽离第三方模块
                    name: 'vendor',
                    test: /node_modules/,
                    chunks: 'initial',
                    minSize: 0,
                    minChunks: 1 //最少引入了1次
                },
                //缓存组
                common: {
                    //公共模块
                    chunks: 'initial',
                    name: 'common',
                    minSize: 100, //大小超过100个字节
                    minChunks: 3 //最少引入了3次
                }
            }
        }
    }
}
```

即使是单页应用，同样可以使用这个配置，例如，打包出来的 bundle.js 体积过大，我们可以将一些依赖打包成动态链接库，然后将剩下的第三方依赖拆出来。

这样可以有效减小 bundle.js 的体积大小。当然，你还可以继续提取业务代码的公共模块，此处，因为我项目中源码较少，所以没有配置。



![splitChunks.jpeg](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/3/14/170d9bf31f45e7a4~tplv-t2oaga2asx-watermark.awebp)



> runtimeChunk

`runtimeChunk` 的作用是将包含 `chunk` 映射关系的列表从 `main.js` 中抽离出来，在配置了 `splitChunk` 时，记得配置 `runtimeChunk`.

```
module.exports = {
    //...
    optimization: {
        runtimeChunk: {
            name: 'manifest'
        }
    }
}
```

最终构建出来的文件中会生成一个 `manifest.js`。

#### 借助 webpack-bundle-analyzer 进一步优化

在做 `webpack` 构建优化的时候，`vendor` 打出来超过了1M，`react` 和 `react-dom` 已经打包成了DLL。

因此需要借助 `webpack-bundle-analyzer` 查看一下是哪些包的体积较大。

首先安装依赖：

```
npm install webpack-bundle-analyzer -D
```

使用也很简单，修改下我们的配置：

```javascript
//webpack.config.prod.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.config.base');
module.exports = merge(baseWebpackConfig, {
    //....
    plugins: [
        //...
        new BundleAnalyzerPlugin(),
    ]
})
```

`npm run build` 构建，会默认打开： `http://127.0.0.1:8888/`，可以看到各个包的体积：



![W1.jpeg](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/3/14/170d9bf330fb2a0b~tplv-t2oaga2asx-watermark.awebp)



进一步对 `vendor` 进行拆分，将 `vendor` 拆分成了4个(使用 `splitChunks` 进行拆分即可)。

```javascript
module.exports = {
    optimization: {
    concatenateModules: false,
    splitChunks: {//分割代码块
      maxInitialRequests:6, //默认是5
      cacheGroups: {
        vendor: {
          //第三方依赖
          priority: 1,
          name: 'vendor',
          test: /node_modules/,
          chunks: 'initial',
          minSize: 100,
          minChunks: 1 //重复引入了几次
        },
        'lottie-web': {
          name: "lottie-web", // 单独将 react-lottie 拆包
          priority: 5, // 权重需大于`vendor`
          test: /[\/]node_modules[\/]lottie-web[\/]/,
          chunks: 'initial',
          minSize: 100,
          minChunks: 1 //重复引入了几次
        },
        //...
      }
    },
  },
}
```

重新构建，结果如下所示：



![W2.jpeg](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/3/14/170d9bf36fcad19c~tplv-t2oaga2asx-watermark.awebp)

