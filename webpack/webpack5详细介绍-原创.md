[TOC]

# 一、webpack 五个核心概念

#### 1 Entry

入口(Entry)：指示 webpack 以哪个文件为入口起点开始打包，分析构建内部依赖图。

#### 2 Output

输出(Output)：指示 webpack 打包后的资源 bundles 输出到哪里去，以及如何命名。

#### 3 Loader

Loader：让 webpack 能够去处理那些非 JS 的文件，比如样式文件、图片文件(webpack 自身只理解 JS)

#### 4 Plugins

插件(Plugins)：可以用于执行范围更广的任务。插件的范围包括，从打包优化和压缩，一直到重新定义环境中的变量等。

#### 5 Mode

模式(Mode)：指示 webpack 使用相应模式的配置。

| 选项        | 描述                                                                                                                                                                                                                                       | 特点                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| development | 会将 DefinePlugin 中 process.env.NODE_ENV 的值设置为 development。启用 NamedChunksPlugin 和 NamedModulesPlugin。                                                                                                                           | 能让代码本地调试运行的环境 |
| production  | 会将 DefinePlugin 中 process.env.NODE_ENV 的值设置为 production。启用 FlagDependencyUsagePlugin, FlagIncludedChunksPlugin, ModuleConcatenationPlugin, NoEmitOnErrorsPlugin, OccurrenceOrderPlugin, SideEffectsFlagPlugin 和 TerserPlugin。 | 能让代码优化上线运行的环境 |

```js
const { resolve } = require("path");

module.exports = {
  // 入口文件
  entry: "./index.js",
  // 输出文件
  output: {
    filename: "bundle.js",
    path: resolve(__dirname, "dist"),
  },
  module: {
    rules: [],
  },
  plugins: [],
  mode: "development",
};
```

所有构建工具都是基于 nodejs 平台运行的，模块化默认采用 commonjs。

注意点

1. webpack 能处理 js/json 资源，不能处理 css/img 等其他资源

2. 生产环境和开发环境将 ES6 模块化编译成浏览器能识别的模块化

3. 生产环境打包出的是压缩后的代码

# 二、Webpack 开发环境的基本配置

开发环境配置主要是为了能让代码运行。主要考虑以下几个方面：

- 打包样式资源
- 打包 html 资源
- 打包图片资源
- 打包其他资源
- devServer

```js
// resolve用来拼接绝对路径的方法
const { resolve } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 引用plugin

module.exports = {
  // webpack配置
  entry: "./src/js/index.js", // 入口起点
  output: {
    // 输出
    // 输出文件名
    filename: "js/build.js",
    // __dirname是nodejs的变量，代表当前文件的目录绝对路径
    path: resolve(__dirname, "build"), // 输出路径，所有资源打包都会输出到这个文件夹下
    clean: true, // 在每次构建前清理 打包 文件夹
    publicPath: "/", // 在 server 脚本使用 publicPath，以确保文件资源能够正确地 serve 在 http://localhost:3000 下
    assetModuleFilename: "images/[hash][ext][query]", // 资源文件输出路径配置
  },
  // loader配置
  module: {
    rules: [
      // 详细的loader配置
      // 不同文件必须配置不同loader处理
      {
        // 匹配哪些文件
        test: /\.less$/,
        // 使用哪些loader进行处理
        use: [
          // use数组中loader执行顺序：从右到左，从下到上，依次执行(先执行css-loader)
          // style-loader：创建style标签，将js中的样式资源插入进去，添加到head中生效，
          // 需要下载style-loader
          "style-loader",
          // css-loader：将css文件变成commonjs模块加载到js中，里面内容是样式字符串
          // 需要下载css-loader
          "css-loader",
          // less-loader：将less文件编译成css文件，需要下载less-loader和less
          "less-loader",
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        // 处理图片资源，内置的 Asset Modules
        // 所有图片文件都将被发送到输出目录，并且其路径将被注入到 bundle 中。
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource", //  发送一个单独的文件并导出 URL
      },
      // 图片base64 编码大小配置
      //   {
      //     test: /\.(png|svg|jpg|jpeg|gif)$/i,
      //     type: 'asset/source', //
      //     parser: {
      //         dataUrlCondition: {
      //           maxSize: 8 * 1024 // 4kb
      //         }
      //       }
      //   },
      {
        test: /\.html$/,
        // 处理html文件的img图片（负责引入img，从而能被url-loader进行处理）
        // 需要下载html-loader
        loader: "html-loader",
      },
      // 加载 fonts 字体
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
    ],
  },
  // plugin的配置
  plugins: [
    // html-webpack-plugin：默认会创建一个空的html文件，自动引入打包输出的所有资源（JS/CSS）
    // 需要有结构的HTML文件可以加一个template
    new HtmlWebpackPlugin({
      // 复制这个./src/index.html文件，并自动引入打包输出的所有资源（JS/CSS）
      template: "./src/index.html",
    }),
  ],
  // 模式
  mode: "development", // 开发模式
  // 开发服务器 devServer：用来自动化，不用每次修改后都重新输入webpack打包一遍（自动编译，自动打开浏览器，自动刷新浏览器）
  // 特点：只会在内存中编译打包，不会有任何输出（不会像之前那样在外面看到打包输出的build包，而是在内存中，关闭后会自动删除）
  // 启动devServer指令为：npx webpack-dev-server
  // 需要安装 webpack-dev-server
  devServer: {
    // 项目构建后路径
    contentBase: resolve(__dirname, "build"),
    // 启动gzip压缩
    compress: true,
    // 端口号
    port: 3000,
    // 自动打开浏览器
    open: true,
  },
};
```

```
package.json

 "scripts": {
    "build": "webpack", // 打包
    "build-dll": "webpack --config webpack.dll.js", // dll打包命令
    "watch": "webpack --watch", // 观察者模式
    "start": "webpack serve --open", // 开发者模式
    "server": "node server.js" // 本地服务器
  },
```

### webpack-dev-middleware

`webpack-dev-middleware` 是一个封装器(wrapper)，它可以把 webpack 处理过的文件发送到一个 server。

`npm install --save-dev express webpack-dev-middleware`

```
根目录  server.js
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const config = require('./webpack.config.js');
const compiler = webpack(config);

// 告知 express 使用 webpack-dev-middleware，
// 以及将 webpack.config.js 配置文件作为基础配置。
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  })
);

// 将文件 serve 到 port 3000。
app.listen(3000, function () {
  console.log('Example app listening on port 3000!\n');
});
```

# 三、Webpack 生产环境的基本配置

生产环境的配置需要考虑以下几个方面：

- 提取 css 成单独文件
- css 兼容性处理
- 压缩 css
- js 语法检查
- js 兼容性处理
- js 压缩
- html 压缩

```js
const { resolve } = require("path");
const MiniCssExtractorPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// 定义node.js的环境变量，决定使用browserslist的哪个环境
process.env.NODE_ENV = "production";

// 复用loader的写法
const commonCssLoader = [
  // 这个loader取代style-loader。作用：提取js中的css成单独文件然后通过link加载
  MiniCssExtractPlugin.loader,
  // css-loader：将css文件整合到js文件中
  // 经过css-loader处理后，样式文件是在js文件中的
  // 问题：1.js文件体积会很大2.需要先加载js再动态创建style标签，样式渲染速度就慢，会出现闪屏现象
  // 解决：用MiniCssExtractPlugin.loader替代style-loader
  "css-loader",
  /*
    postcss-loader：css兼容性处理; 
    需要安装：postcss postcss-loader postcss-preset-env
    postcss需要通过package.json中browserslist里面的配置加载指定的css兼容性样式
    在package.json中定义browserslist：
    "browserslist": {
      // 开发环境 --> 设置node环境变量：process.env.NODE_ENV = development
      "development": [ // 只需要可以运行即可
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version"
      ],
      // 生产环境。默认是生产环境
      "production": [ // 需要满足绝大多数浏览器的兼容
        ">0.2%",
        "not dead",
        "not op_mini all"
      ]
    },
  */
  {
    loader: "postcss-loader",
    options: {
      postcssOptions: {
        plugins: [
          [
            "postcss-preset-env",
            {
              // 其他选项
            },
          ],
        ],
      },
    },
  },
];

module.exports = {
  entry: "./src/js/index.js",
  output: {
    filename: "js/built.js",
    path: resolve(__dirname, "build"),
    clean: true,
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [...commonCssLoader],
      },
      {
        test: /\.less$/,
        use: [...commonCssLoader, "less-loader"],
      },
      /*
        正常来讲，一个文件只能被一个loader处理
        当一个文件要被多个loader处理，那么一定要指定loader执行的先后顺序
        先执行eslint再执行babel（用enforce）
      */
      /*
        js兼容性处理：需要下载 babel-loader  @babel/core  @babel/preset-env
        基本js兼容性处理 --> 安装 @babel/preset-env
        问题：只能转换基本语法，如promise高级语法不能转换
      */
      /* 
        Babel 对一些公共方法使用了非常小的辅助代码，比如 _extend。默认情况下会被添加到每一个需要它的文件中。
        可以引入 Babel runtime 作为一个独立模块，来避免重复引入。
        下面的配置禁用了 Babel 自动对每个文件的 runtime 注入，而是引入 @babel/plugin-transform-runtime 并且使所有辅助代码从这里引用。
        注意：必须执行 npm install -D @babel/plugin-transform-runtime 来把它包含到项目中，
        然后使用 npm install @babel/runtime 把 @babel/runtime 安装为一个依赖。
     */
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            // core-js 和 webpack/buildin 如果被 Babel 转码会发生错误。
            // 需要在 babel-loader 中排除它们：
            exclude: [
              // \\ for Windows, \/ for Mac OS and Linux
              /node_modules[\\\/]core-js/,
              /node_modules[\\\/]webpack[\\\/]buildin/,
            ],
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-transform-runtime"],
          },
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource", //
      },
      {
        // 处理html中img资源
        test: /\.html$/,
        loader: "html-loader",
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      // 对输出的css文件进行重命名
      filename: "css/built.css",
    }),
    // HtmlWebpackPlugin：html文件的打包和压缩处理
    // 通过这个插件会自动将单独打包的样式文件通过link标签引入
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      // 压缩html代码
      minify: {
        // 移除空格
        collapseWhitespace: true,
        // 移除注释
        removeComments: true,
      },
    }),
  ],
  // 压缩css
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
  },
  // 生产环境下会自动压缩js代码
  mode: "production",
};
```

# 四、Webpack 优化配置

## 4.1 开发环境性能优化

### 4.1.1 HMR（模块热替换）

作用：一个模块发生变化，只会重新打包构建这一个模块（而不是打包所有模块） ，极大提升构建速度

代码：只需要在 devServer 中设置 hot 为 true，就会自动开启 HMR 功能（只能在开发模式下使用）

```
module.exports = {
  target: 'web', // !!!!!! 一定需要配置target，否则热更新不生效
};
```

```js
devServer: {
  contentBase: resolve(__dirname, 'build'),
  compress: true,
  port: 3000,
  open: true,
  // 开启HMR功能
  // 当修改了webpack配置，新配置要想生效，必须重启webpack服务
  hot: true
}
```

运行 `npm run start`

每种文件实现热模块替换的情况：

- 样式文件：可以使用 HMR 功能，因为开发环境下使用的 style-loader 内部默认实现了热模块替换功能

- js 文件：默认不能使用 HMR 功能（修改一个 js 模块所有 js 模块都会刷新）

  --> 实现 HMR 需要修改 js 代码（添加支持 HMR 功能的代码）

  ```
  // 绑定
  if (module.hot) {
    // 一旦 module.hot 为true，说明开启了HMR功能。 --> 让HMR功能代码生效
    module.hot.accept('./print.js', function() {
      // 方法会监听 print.js 文件的变化，一旦发生变化，只有这个模块会重新打包构建，其他模块不会。
      // 会执行后面的回调函数
      print();
    });
  }
  ```

  注意：HMR 功能对 js 的处理，只能处理非入口 js 文件的其他文件。

- html 文件: 默认不能使用 HMR 功能（html 不用做 HMR 功能，因为只有一个 html 文件，不需要再优化）

  使用 HMR 会导致问题：html 文件不能热更新了（不会自动打包构建）

  解决：修改 entry 入口，将 html 文件引入（这样 html 修改整体刷新）

  `entry: ['./src/js/index.js', './src/index.html']`

### 4.1.2 source-map

一种提供**源代码到构建后代码的映射**的技术 （如果构建后代码出错了，通过映射可以追踪源代码错误）

参数：`[inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map`

代码：

```
devtool: 'eval-source-map'
```

可选方案：[生成 source-map 的位置|给出的错误代码信息]

- source-map：外部，错误代码准确信息 和 源代码的错误位置
- inline-source-map：内联，只生成一个内联 source-map，错误代码准确信息 和 源代码的错误位置
- hidden-source-map：外部，错误代码错误原因，但是没有错误位置（为了隐藏源代码），不能追踪源代码错误，只能提示到构建后代码的错误位置
- eval-source-map：内联，每一个文件都生成对应的 source-map，都在 eval 中，错误代码准确信息 和 源代码的错误位
- nosources-source-map：外部，错误代码准确信息，但是没有任何源代码信息（为了隐藏源代码）
- cheap-source-map：外部，错误代码准确信息 和 源代码的错误位置，只能把错误精确到整行，忽略列
- cheap-module-source-map：外部，错误代码准确信息 和 源代码的错误位置，module 会加入 loader 的 source-map

内联 和 外部的区别：1. 外部生成了文件，内联没有； 2. 内联构建速度更快

开发/生产环境可做的选择：

**开发环境**：需要考虑速度快，调试更友好

- 速度快( eval > inline > cheap >... )
  1. eval-cheap-souce-map
  2. eval-source-map
- 调试更友好
  1. souce-map
  2. cheap-module-souce-map
  3. cheap-souce-map

**最终得出最好的两种方案 --> eval-source-map（完整度高，内联速度快） / eval-cheap-module-souce-map（错误提示忽略列但是包含其他信息，内联速度快）**

**生产环境**：需要考虑源代码要不要隐藏，调试要不要更友好

- 内联会让代码体积变大，所以在生产环境不用内联
- 隐藏源代码
  1. nosources-source-map 全部隐藏
  2. hidden-source-map 只隐藏源代码，会提示构建后代码错误信息

**最终得出最好的两种方案 --> source-map（最完整） / cheap-module-souce-map（错误提示一整行忽略列）**

## 4.2 生产环境性能优化

### 4.2.1 优化打包构建速度

#### 4.2.1.1 oneOf

oneOf：匹配到 loader 后就不再向后进行匹配，优化生产环境的打包构建速度

```js
module: {
    rules: [
        {
          // oneOf 优化生产环境的打包构建速度
          // 以下loader只会匹配一个（匹配到了后就不会再往下匹配了）
          // 注意：不能有两个配置处理同一种类型文件
          oneOf: [
              {
                  // 处理less资源
                  test: /\.less$/,
                  use: ['style-loader', 'css-loader', 'less-loader']
              },
              {
                  test: /\.css$/,
                  use: ['style-loader', 'css-loader'],
              },
              {
                  test: /\.(png|svg|jpg|jpeg|gif)$/i,
                  type: 'asset/resource', //
              },
              {
                  // 处理html中img资源
                  test: /\.html$/,
                  loader: 'html-loader'
              },
              {
                  test: /\.(woff|woff2|eot|ttf|otf)$/i,
                  type: 'asset/resource',
              },
          ]
        }
    ]
},
```

#### 4.2.1.2 缓存

1. **babel 缓存**：类似 HMR，将 babel 处理后的资源缓存起来（哪里的 js 改变就更新哪里，其他 js 还是用之前缓存的资源），让第二次打包构建速度更快

```js
{
  test: /\.m?js$/,
  exclude: /(node_modules|bower_components)/,
  use: {
    loader: "babel-loader",
    options: {
      // core-js 和 webpack/buildin 如果被 Babel 转码会发生错误。
      // 需要在 babel-loader 中排除它们：
      exclude: [
        // \\ for Windows, \/ for Mac OS and Linux
        /node_modules[\\\/]core-js/,
        /node_modules[\\\/]webpack[\\\/]buildin/,
      ],
      presets: ["@babel/preset-env"],
      plugins: ["@babel/plugin-transform-runtime"],
      // 开启babel缓存
      // 第二次构建时，会读取之前的缓存
      cacheDirectory: true,
    },
  },
},
```

2. **文件资源缓存**

文件名不变，就不会重新请求，而是再次用之前缓存的资源

1.hash: 每次 wepack 打包时会生成一个唯一的 hash 值。

问题：重新打包，所有文件的 hsah 值都改变，会导致所有缓存失效。（可能只改动了一个文件）

2.chunkhash：根据 chunk 生成的 hash 值。来源于同一个 chunk 的 hash 值一样

问题：js 和 css 来自同一个 chunk，hash 值是一样的（因为 css-loader 会将 css 文件加载到 js 中，所以同属于一个 chunk）

3.contenthash: 根据文件的内容生成 hash 值。不同文件 hash 值一定不一样(文件内容修改，文件名里的 hash 才会改变)

修改 css 文件内容，打包后的 css 文件名 hash 值就改变，而 js 文件没有改变 hash 值就不变，这样 css 和 js 缓存就会分开判断要不要重新请求资源 --> 让代码上线运行缓存更好使用

#### 4.2.1.3 多进程打包

多进程打包：某个任务消耗时间较长会卡顿，多进程可以同一时间干多件事，效率更高。

优点是提升打包速度，缺点是每个进程的开启和交流都会有开销（babel-loader 消耗时间最久，所以使用 thread-loader 针对其进行优化）

```js
/*
  thread-loader会对其后面的loader（这里是babel-loader）开启多进程打包。
  进程启动大概为600ms，进程通信也有开销。(启动的开销比较昂贵，不要滥用)
  只有工作消耗时间比较长，才需要多进程打包
*/
{
    test: /\.m?js$/,
    include: resolve('src'),
    use: [{
        loader: "thread-loader",
        options: {
            workers: 2 // 进程2个
        }
    }, {
        loader: "babel-loader",
        options: {
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-transform-runtime"],
        },
    }, ]
},
```

#### 4.2.1.4 externals

externals：让某些库不打包，通过 cdn 引入

```
externals: {
  // 拒绝jQuery被打包进来(通过cdn引入，速度会快一些)
  // 忽略的库名 -- npm包名
  jquery: 'jQuery'
}
```

需要在 index.html 中通过 cdn 引入：

```
<script src="https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js"></script>
```

#### 4.2.1.5 dll

dll：让某些库单独打包，后直接引入到 build 中。可以在 code split 分割出 node_modules 后再用 dll 更细的分割，优化代码运行的性能。

webpack.dll.js 配置：(将 jquery 单独打包)

```
/*
  node_modules的库会打包到一起，但是很多库的时候打包输出的js文件就太大了
  使用dll技术，对某些库（第三方库：jquery、react、vue...）进行单独打包
  当运行webpack时，默认查找webpack.config.js配置文件
  需求：需要运行webpack.dll.js文件
    --> webpack --config webpack.dll.js（运行这个指令表示以这个配置文件打包）
*/
const { resolve } = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    // 最终打包生成的[name] --> jquery
    // ['jquery] --> 要打包的库是jquery
    jquery: ['jquery']
  },
  output: {
    // 输出出口指定
    filename: '[name].js', // name就是jquery
    path: resolve(__dirname, 'dll'), // 打包到dll目录下
    library: '[name]_[hash]', // 打包的库里面向外暴露出去的内容叫什么名字
  },
  plugins: [
    // 打包生成一个manifest.json --> 提供jquery的映射关系（告诉webpack：jquery之后不需要再打包和暴露内容的名称）
    new webpack.DllPlugin({
      name: '[name]_[hash]', // 映射库的暴露的内容名称
      path: resolve(__dirname, 'dll/manifest.json') // 输出文件路径
    })
  ],
  mode: 'production'
};
```

运行`npm run build-dll`

webpack.config.js 配置：(告诉 webpack 不需要再打包 jquery，并将之前打包好的 jquery 跟其他打包好的资源一同输出到 build 目录下)

```
// 引入插件
const webpack = require('webpack');
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');

// plugins中配置：
plugins: [
  new HtmlWebpackPlugin({
    template: './src/index.html'
  }),
  // 告诉webpack哪些库不参与打包，同时使用时的名称也得变
  new webpack.DllReferencePlugin({
    manifest: resolve(__dirname, 'dll/manifest.json')
  }),
  // 将某个文件打包输出到build目录下，并在html中自动引入该资源
  new AddAssetHtmlWebpackPlugin({
    filepath: resolve(__dirname, 'dll/jquery.js')
  })
],
```

### 4.2.2 优化代码运行的性能

#### 4.2.2.1 缓存

hash                    每次重新打包都会生成新的hash值

chunkhash         打包来自同一个入口就同属于一个chunk, 一个chunk共享同一个hash值

​                             问题：样式文件也是js文件引入的，js文件变化时，css文件的hash值也变化了

contenthash      根据文件内容生成hash值

#### 4.2.2.2 tree shaking（树摇）

tree shaking：去除无用代码

前提：1. 必须使用 ES6 模块化    2. 开启 production 环境 （这样就自动会把无用代码去掉）

作用：减少代码体积

在 package.json 中配置：

`"sideEffects": false` 表示所有代码都没有副作用（都可以进行 tree shaking）

这样会导致的问题：可能会把 css / @babel/polyfill 文件干掉（副作用）

所以可以配置：`"sideEffects": ["*.css", "*.less"]` 不会对 css/less 文件 tree shaking 处理

#### 4.2.2.3 code split（代码分割）

代码分割。将打包输出的一个大的 bundle.js 文件拆分成多个小文件，这样可以并行加载多个文件，比加载一个文件更快。

1. 多入口拆分

```
entry: {
    // 多入口：有一个入口，最终输出就有一个bundle
    index: './src/js/index.js',
    test: './src/js/test.js'
  },
  output: {
    // [name]：取文件名
    filename: 'js/[name].[contenthash:10].js',
    path: resolve(__dirname, 'build')
  },
```

2. optimization：

```
optimization: {
  splitChunks: {
    chunks: 'all'
  }
},
```

- 将 node_modules 中的代码单独打包（大小超过 30kb）
- 自动分析多入口 chunk 中，有没有公共的文件。如果有会打包成单独一个 chunk(比如两个模块中都引入了 jquery 会被打包成单独的文件)（大小超过 30kb）

3. import 动态导入语法：

```
/*
  通过js代码，让某个文件被单独打包成一个chunk
  import动态导入语法：能将某个文件单独打包(test文件不会和index打包在同一个文件而是单独打包)
  webpackChunkName:指定test单独打包后文件的名字
*/
import('./test')
  .then(({ mul, count }) => {
    // 文件加载成功~
    // eslint-disable-next-line
    console.log(mul(2, 5));
  })
  .catch(() => {
    // eslint-disable-next-line
    console.log('文件加载失败~');
  });
```

```js
webpack.config.js

optimization: {
    chunkIds: "named", // 对调试更友好的可读的 id。
},
```

#### 4.2.2.4 lazy loading（懒加载/预加载）

1. 懒加载：当文件需要使用时才加载（需要代码分割）。但是如果资源较大，加载时间就会较长，有延迟。

2. 正常加载：可以认为是并行加载（同一时间加载多个文件）没有先后顺序，先加载了不需要的资源就会浪费时间。

3. 预加载 prefetch（兼容性很差）：会在使用之前，提前加载。等其他资源加载完毕，浏览器空闲了，再偷偷加载这个资源。这样在使用时已经加载好了，速度很快。所以在懒加载的基础上加上预加载会更好。

   ```js
   document.getElementById("btn").onclick = function () {
     // 将import的内容放在异步回调函数中使用，点击按钮，test.js才会被加载(不会重复加载)
     // webpackPrefetch: true表示开启预加载
     import(/* webpackPrefetch: true */ "./test").then(({ mul }) => {
       console.log(mul(4, 5));
     });
     import("./test").then(({ mul }) => {
       console.log(mul(2, 5));
     });
   };
   ```

#### 4.2.2.5 PWA（离线可访问技术）

pwa：离线可访问技术（渐进式网络开发应用程序），使用 serviceworker 和 workbox 技术。优点是离线也能访问，缺点是兼容性差。

```js
const WorkboxWebpackPlugin = require("workbox-webpack-plugin"); // 引入插件

// plugins中加入：
new WorkboxWebpackPlugin.GenerateSW({
  /*
    1. 帮助serviceworker快速启动
    2. 删除旧的 serviceworker

    生成一个 serviceworker 配置文件
  */
  clientsClaim: true,
  skipWaiting: true,
});
```

```js
entry入口文件中;
/*
  sw代码必须运行在服务器上
*/
if ("serviceWorker" in navigator) {
  // 处理兼容性问题
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js") // 注册serviceWorker
      .then(() => {
        console.log("sw注册成功了~");
      })
      .catch(() => {
        console.log("sw注册失败了~");
      });
  });
}
```

# optimization

contenthash 缓存会导致一个问题：修改 a 文件导致 b 文件 contenthash 变化。
因为在 index.js 中引入 a.js，打包后 index.js 中记录了 a.js 的 hash 值，而 a.js 改变，其重新打包后的 hash 改变，导致 index.js 文件内容中记录的 a.js 的 hash 也改变，从而重新打包后 index.js 的 hash 值也会变，这样就会使缓存失效。（改变的是a.js文件但是 index.js 文件的 hash 值也改变了）
解决办法：runtimeChunk --> 将当前模块记录其他模块的 hash 单独打包为一个文件 runtime，这样 a.js 的 hash 改变只会影响 runtime 文件，不会影响到 index.js 文件

```js
output: {
  filename: 'js/[name].[contenthash:10].js',
  path: resolve(__dirname, 'build'),
  chunkFilename: 'js/[name].[contenthash:10]_chunk.js' // 指定非入口文件的其他chunk的名字加_chunk
},
optimization: {
  splitChunks: {
    chunks: 'all',
    /* 以下都是splitChunks默认配置，可以不写
    miniSize: 30 * 1024, // 分割的chunk最小为30kb（大于30kb的才分割）
    maxSize: 0, // 最大没有限制
    minChunks: 1, // 要提取的chunk最少被引用1次
    maxAsyncRequests: 5, // 按需加载时并行加载的文件的最大数量为5
    maxInitialRequests: 3, // 入口js文件最大并行请求数量
    automaticNameDelimiter: '~', // 名称连接符
    name: true, // 可以使用命名规则
    cacheGroups: { // 分割chunk的组
      vendors: {
        // node_modules中的文件会被打包到vendors组的chunk中，--> vendors~xxx.js
        // 满足上面的公共规则，大小超过30kb、至少被引用一次
        test: /[\\/]node_modules[\\/]/,
        // 优先级
        priority: -10
      },
      default: {
        // 要提取的chunk最少被引用2次
        minChunks: 2,
        prority: -20,
        // 如果当前要打包的模块和之前已经被提取的模块是同一个，就会复用，而不是重新打包
        reuseExistingChunk: true
      }
    } */
  },
  // 将index.js记录的a.js的hash值单独打包到runtime文件中
  runtimeChunk: {
    name: entrypoint => `runtime-${entrypoint.name}`
  },
  minimizer: [
    // 配置生产环境的压缩方案：js/css
    new TerserWebpackPlugin({
      // 开启缓存
      cache: true,
      // 开启多进程打包
      parallel: true,
      // 启用sourceMap(否则会被压缩掉)
      sourceMap: true
    })
  ]
}
```



# webpack5

此版本重点关注以下内容:

- 通过持久缓存提高构建性能.
- 使用更好的算法和默认值来改善长期缓存.
- 通过更好的树摇和代码生成来改善捆绑包大小.
- 清除处于怪异状态的内部结构，同时在 v4 中实现功能而不引入任何重大更改.
- 通过引入重大更改来为将来的功能做准备，以使我们能够尽可能长时间地使用 v5.

## 自动删除 Node.js Polyfills

早期，webpack 的目标是允许在浏览器中运行大多数 node.js 模块，但是模块格局发生了变化，许多模块用途现在主要是为前端目的而编写的。webpack <= 4 附带了许多 node.js 核心模块的 polyfill，一旦模块使用任何核心模块（即 crypto 模块），这些模块就会自动应用。

尽管这使使用为 node.js 编写的模块变得容易，但它会将这些巨大的 polyfill 添加到包中。在许多情况下，这些 polyfill 是不必要的。

webpack 5 会自动停止填充这些核心模块，并专注于与前端兼容的模块。

迁移：

- 尽可能尝试使用与前端兼容的模块。
- 可以为 node.js 核心模块手动添加一个 polyfill。错误消息将提示如何实现该目标。

## Chunk 和模块 ID

添加了用于长期缓存的新算法。在生产模式下默认情况下启用这些功能。

`chunkIds: "deterministic", moduleIds: "deterministic"`

## Chunk ID

你可以不用使用 `import(/* webpackChunkName: "name" */ "module")` 在开发环境来为 chunk 命名，生产环境还是有必要的

webpack 内部有 chunk 命名规则，不再是以 id(0, 1, 2)命名了

## Tree Shaking

1. webpack 现在能够处理对嵌套模块的 tree shaking

```js
// inner.js
export const a = 1;
export const b = 2;

// module.js
import * as inner from './inner';
export { inner };

// user.js
import * as module from './module';
console.log(module.inner.a);
```

在生产环境中, inner 模块暴露的 `b` 会被删除

2. webpack 现在能够多个模块之前的关系

```js
import { something } from './something';

function usingSomething() {
  return something;
}

export function test() {
  return usingSomething();
}
```

当设置了`"sideEffects": false`时，一旦发现`test`方法没有使用，不但删除`test`，还会删除`"./something"`

3. webpack 现在能处理对 Commonjs 的 tree shaking

## Output

webpack 4 默认只能输出 ES5 代码

webpack 5 开始新增一个属性 output.ecmaVersion, 可以生成 ES5 和 ES6 / ES2015 代码.

如：`output.ecmaVersion: 2015`

## SplitChunk

```js
// webpack4
minSize: 30000;
```

```js
// webpack5
minSize: {
  javascript: 30000,
  style: 50000,
}
```

## Caching

```js
// 配置缓存
cache: {
  // 磁盘存储
  type: "filesystem",
  buildDependencies: {
    // 当配置修改时，缓存失效
    config: [__filename]
  }
}
```

缓存将存储到 `node_modules/.cache/webpack`

## 监视输出文件

之前 webpack 总是在第一次构建时输出全部文件，但是监视重新构建时会只更新修改的文件。

此次更新在第一次构建时会找到输出文件看是否有变化，从而决定要不要输出全部文件。

## 默认值

- `entry: "./src/index.js`
- `output.path: path.resolve(__dirname, "dist")`
- `output.filename: "[name].js"`