# tree shaking

- tree shaking 是一个术语，通常用于描述移除 JavaScript 上下文中的未引用代码。
- 它依赖于 ES2015 模块系统中的静态结构特性，例如 import 和 export。
- 配置：

  模块化语法使用 ES2015 模块化 (注意不能让babel将ES6的模块化语法转化成commonjs了)
  
  使用模式 production ，会自动使用 UglifyJSPlugin 压缩 js 代码
  
 ```
  {
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
    loader: "babel-loader",
    options: {
      presets: [
        [
          '@babel/preset-env',
          {
            "modules": false  //关掉babel将ES6模块化转化为commonjs，webpack自带了这个功能
          }
        ]
      ]
    }
  }
}
```
启用抽离代码

```
// webpack 4.x版本之前的commonChunkPlugins
  optimization: {
    // 分割代码块
    splitChunks: {
      // 缓存组
      cacheGroups: {
        // 公共模块
        common: {
          chunks: "initial",
          minSize: 0,
          // 最小公用模块次数
          minChunks: 2
        },
        vendor: {
          priority: 1,
          // 抽离出来
          test: /node_modules/,
          chunks: "initial",
          minSize: 0,
          minChunks: 2
        }
      }
    }
  }
  ```

# 懒加载

- 让特定的js文件不要一上来就加载
- 下载babel相关的包
  - npm i @babel/plugin-syntax-dynamic-import @babel/plugin-transform-runtime @babel/runtime -D
  - @babel/plugin-syntax-dynamic-import 允许解析import()语法
  - @babel/plugin-transform-runtime 用于语法转换
  - @babel/runtime 用于解决 Module not found: Error: Can't resolve '@babel/runtime/regenerator' 这个错误，需要下载当前包
- 下载eslint相关的包
  - npm i babel-eslint eslint-config-airbnb eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react -D
  - babel-eslint 用于支持eslint不支持的语法或实验性功能
  - eslint-config-airbnb airbnb的配置，其他包都是其相关的依赖
- eslint的package.json配置

```
"eslintConfig": {
  "extends": "airbnb",   //著名的eslint标准
  "parser": "babel-eslint", // 替代 eslint 默认的解析库以支持还未标准化的语法。比如 import()。
  "parserOptions": {
    "ecmaVersion": 8,
    "sourceType": "module"
  },
  "rules": {
    "linebreak-style": [0, "error", "windows"]  //忽略换行符 CRLF 的错误
  },
  "env": {
    "browser": true  //支持浏览器的全局变量
  }
}
```

- 修改loader

```
{
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
    loader: "babel-loader",
    options: {
      presets: [...],
      plugins: [
        "@babel/plugin-syntax-dynamic-import",   //解析import()
        [
          require.resolve("@babel/plugin-transform-runtime"),  //帮助解析regenerator的错误
          {
            "absoluteRuntime": false,
            "corejs": false,
            "helpers": false,  //只需要修改这个，其他都是默认配置，可以不加
            "regenerator": true,
            "useESModules": false
          }
        ]
      ]
    }
  }
},
```

- 修改output

```
output: {
  filename: 'js/[name].[hash:8].js',   //添加了hash值, 实现静态资源的长期缓存
  chunkFilename: 'js/[name].bundle.js', // 非入口 chunk 的名称
  publicPath: '/'  //所有输出资源的公共路径
},
```

- 使用

```
async function getComponent() {
  const element = document.createElement('div');
  /*
    webpackChunkName: "模块名称"
    '模块路径'
  */
  const module = await import(/* webpackChunkName: "module2" */ './module2');  
  const Person = module.default;
  const { name, age } = new Person('jack', 18);
  element.innerHTML = `name: ${name}  age: ${age}`;
  return element;
}
/*
  只有触发了onclick事件才会动态加载module2文件，从而执行其中代码
*/
document.getElementById('box1').onclick = () => {
  getComponent().then((component) => {
    document.body.appendChild(component);
  });
};
```

# code split
- 代码分割，提取公共代码成单独模块。方便缓存。
- 配置

```
optimization: {
  /*
  runtimeChunk 设置为 true, webpack 就会把 chunk 文件名全部存到一个单独的 chunk 中，
  这样更新一个文件只会影响到它所在的 chunk 和 runtimeChunk，避免了引用这个 chunk 的文件也发生改变。
  */
  runtimeChunk: true, 
  splitChunks: {
    chunks: 'all'  // 默认 entry 的 chunk 不会被拆分, 配置成 all, 就可以了
  }
}
```

# 缓存
- hash: hash 是整个编译过程产生的一个总的 hash 值，而不是单个文件的 hash 值，项目中任何一个文件的改动，都会造成这个 hash 值的改变。 占位符 [hash] 是始终存在的，但我们不希望修改一个文件导致所有输出的文件 hash 都改变，这样就无法利用浏览器缓存了。因此这个 [hash] 意义不大。
- chunk: 代码中引用的文件（js、css、图片等）会根据配置合并为一个或多个包，我们称一个包为 chunk。每个 chunk 包含多个 modules。无论是否是 js，webpack 都将引入的文件视为一个 module。
- chunkhash: 这个 chunk 的 hash 值，文件发生变化时该值也会变。使用 [chunkhash] 作为文件名可以防止浏览器读取旧的缓存文件。
- 配置插件

```
/*
  使用文件路径的 hash 作为 moduleId。
  虽然我们使用 [chunkhash] 作为 chunk 的输出名，但仍然不够。
  因为 chunk 内部的每个 module 都有一个 id，webpack 默认使用递增的数字作为 moduleId。
  如果引入了一个新文件或删掉一个文件，可能会导致其他文件的 moduleId 也发生改变，
  那么受影响的 module 所在的 chunk 的 [chunkhash] 就会发生改变，导致缓存失效。
  因此使用文件路径的 hash 作为 moduleId 来避免这个问题。
*/
new webpack.HashedModuleIdsPlugin()
```
- 修改文件输出路径
  - `js/[name].[hash:8].js --> js/[name].[chunkhash:8].js`
  - `css/[name].[hash:8].css --> css/[name].[chunkhash:8].css`
  
 # 渐进式网络应用程序
- 渐进式网络应用程序(PWA)，是一种可以提供类似于原生应用程序(native app)体验的网络应用程序(web app)。
- PWA 可以用来做很多事。其中最重要的是，在离线时应用程序能够继续运行功能。
- 下载插件
  - `npm i workbox-webpack-plugin -D`
- 引入插件
  - `const WorkboxPlugin = require('workbox-webpack-plugin');`
- 配置插件
```
new WorkboxPlugin.GenerateSW({
  // 这些选项帮助 ServiceWorkers 快速启用
  // 不允许遗留任何“旧的” ServiceWorkers
  // 更多配置详见：https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin
  clientsClaim: true,
  skipWaiting: true,
  importWorkboxFrom: 'local',  //打包到本地， 默认值是'cdn' 访问的是国外cdn需要翻墙
  include: [/\.html$/, /\.js$/, /\.css$/],  //包含资源
  exclude: [/\.(png|jpg|gif|svg)/]  //排除资源
})
```
- 入口文件配置
```
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('SW registered: ', registration);
    }).catch((registrationError) => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
```
- 运行指令
  - `npm run build`
  - `serve -s dist`
  
此时在浏览器控制台就能看到 service worker 注册成功，你可以尝试关掉服务器或者断开网络，这时神奇的事就发生了，我们网页还能正常浏览~

# noParse
- noParse 配置项可以让 Webpack 忽略对部分没采用模块化的文件的递归解析和处理，这样做的好处是能提高构建性能。 原因是一些库例如 jQuery 、ChartJS 它们庞大又没有采用模块化标准，让 Webpack 去解析这些文件耗时又没有意义。
- 启用noParse
```
module: {
    // 不去解析jquery的依赖关系
    noParse: /jquery/
  },
 ```
 
 # ignorePlugin
 - moment 2.18 会将所有本地化内容和核心功能一起打包）。可以使用 IgnorePlugin 在打包时忽略本地化内容，经过实验，使用 ignorePlugin 之后 ? 之后的体积由 1.2M 降低至 800K
 - ignorePlugin启用方法
 ```
 // 用法：
new webpack.IgnorePlugin(requestRegExp, [contextRegExp]);
 
//eg.
plugins: [new webpack.IgnorePlugin(/\.\/local/, /moment/)];
```

# DllPlugin
- DllPlugin 是基于 Windows 动态链接库（dll）的思想被创作出来的。这个插件会把第三方库单独打包到一个文件中，这个文件就是一个单纯的依赖库。这个依赖库不会跟着你的业务代码一起被重新打包，只有当依赖自身发生版本变化时才会重新打包。

- DllPlugin可以将特定的类库提前打包然后引入。这种方式可以极大的减少打包类库的次数，只有当类库更新版本才有需要重新打包，并且也实现了将公共代码抽离成单独文件的优化方案


### 用 DllPlugin 处理文件，要分两步走：
- 基于 dll 专属的配置文件，打包 dll 库
```
let path = require("path");
let webpack = require("webpack");
 
module.exports = {
  mode: "development",
  entry: {
    react: ["react", "react-dom"]
  },
  output: {
    filename: "_dll_[name].js", // 产生的文件名
    path: path.resolve(__dirname, "dist"),
    library: "_dll_[name]"
  },
  plugins: [
    // name要等于library里的name
    new webpack.DllPlugin({
      name: "_dll_[name]",
      path: path.resolve(__dirname, "dist", "manifest.json")
    })
  ]
}
```
- 基于 webpack.config.js 文件，打包业务代码
```
let path = require("path");
let HtmlWebpackPlugin = require("html-webpack-plugin");
let webpack = require("webpack");
 
module.exports = {
  mode: "development",
  // 多入口
  entry: {
    home: "./src/index.js"
  },
  devServer: {
    port: 3000,
    open: true,
    contentBase: "./dist"
  },
  module: {
    // 不去解析jquery的依赖关系
    noParse: /jquery/,
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: path.resolve("src"),
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
          }
        }
      }
    ]
  },
  output: {
    // name -> home a
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: path.resolve(__dirname, "dist", "manifest.json")
    }),
    new webpack.IgnorePlugin(/\.\/local/, /moment/),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html"
    }),
    new webpack.DefinePlugin({
      DEV: JSON.stringify("production")
    })
  ]
};
```

# Happypack——将 loader 由单进程转为多进程
- 大家知道，webpack 是单线程的，就算此刻存在多个任务，你也只能排队一个接一个地等待处理。这是 webpack 的缺点，好在我们的 CPU 是多核的，Happypack 会充分释放 CPU 在多核并发方面的优势，帮我们把任务分解给多个子进程去并发执行，大大提升打包效率。
- happypack的使用方法：将loader中的配置转移到happypack中就好
```
let path = require("path");
let HtmlWebpackPlugin = require("html-webpack-plugin");
let webpack = require("webpack");
// 模块 happypack 可以实现多线程?
let Happypack = require("happypack");
 
module.exports = {
  mode: "development",
  // 多入口
  entry: {
    home: "./src/index.js"
  },
  devServer: {
    port: 3000,
    open: true,
    contentBase: "./dist"
  },
  module: {
    // 不去解析jquery的依赖关系
    noParse: /jquery/,
    rules: [
      {
        test: /\.css$/,
        use: "Happypack/loader?id=css"
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: path.resolve("src"),
        use: "Happypack/loader?id=js"
      }
    ]
  },
  output: {
    // name -> home a
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [
    new Happypack({
      id: "css",
      use: ["style-loader", "css-loader"]
    }),
    new Happypack({
      id: "js",
      use: [
        {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
          }
        }
      ]
    }),
    new webpack.DllReferencePlugin({
      manifest: path.resolve(__dirname, "dist", "manifest.json")
    }),
    new webpack.IgnorePlugin(/\.\/local/, /moment/),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html"
    }),
    new webpack.DefinePlugin({
      DEV: JSON.stringify("production")
    })
  ]
}
```
# 优化 Loader 配置
- 由于 Loader 对文件的转换操作很耗时，所以需要让尽可能少的文件被 Loader 处理。可以通过 test/include/exclude 三个配置项来命中 Loader 要应用规则的文件。

```
module .exports = {
            module : {
                rules : [{
                //如果项目源码中只有 文件，就不要写成/\jsx?$/，以提升正则表达式的性能
                test: /\.js$/,
                //babel -loader 支持缓存转换出的结果，通过 cacheDirectory 选项开启
                use: ['babel-loader?cacheDirectory'] ,
                //只对项目根目录下 src 目录中的文件采用 babel-loader
                include: path.resolve(__dirname,'src'),
                }],
            }
        }
```

把Babel编译过的文件缓存起来

下次只需要编译更改过的代码文件即可

`loader: 'babel-loader?cacheDirectory=ture'`

# 优化 resolve.modules 配置

- resolve.modules 的默认值是［'node_modules'］，含义是先去当前目录的 node_modules 目录下去找我们想找的模块，如果没找到就去上一级目录 ../node_modules 中找，再没有就去 ../../node_modules 中找，以此类推。这和 Node.js 的模块寻找机制很相似。当安装的第三方模块都放在项目根目录的 node_modules 目录下时，就没有必要按照默认的方式去一层层地寻找，可以指明存放第三方模块的绝对路径，以减少寻找.

```
module.exports = {
        resolve: {
            modules: [path.resolve( __dirname,'node modules')]
        },
    }
```

# 优化 resolve.mainFields 配置

- 在安装的第三方模块中都会有一个 package.json 文件，用于描述这个模块的属性,其中可以存在多个字段描述入口文件，原因是某些模块可以同时用于多个环境中，针对不同的运行环境需要使用不同的代码。

resolve.mainFields 的默认值和当前的 target 配置有关系，对应的关系如下。

target web 或者 webworker 时，值是［'browser','module','main']。
target 为其他情况时，值是［ 'module','main']。
以 target 等于 web 为例， Webpack 会先采用第三方模块中的 browser 字段去寻找模块的入口文件，如果不存在，就采用 module 字段，以此类推。

为了减少搜索步骤，在明确第三方模块的入口文件描述字段时，我们可以将它设置得尽量少。由于大多数第三方模块都采用 main 字段去描述入口文件的位置，所以可以这样配置：

```
module.exports = {
        resolve: {
        //只采用 main 字段作为入口文件的描述字段，以减少搜索步骤
        mainFields: ['main']
        }
    }
```

# 优化 resolve.alias 配置

resolve.alias 配置项通过别名来将原导入路径映射成一个新的导入路径。

在实战项目中经常会依赖一些庞大的第三方模块，以 React 库为例，发布出去的 React 库中包含两套代码

- 一套是采用 CommonJS 规范的模块化代码，这些文件都放在 lib 录下，以 package.json 中指定的入口文件 react.js 为模块的入口
- 一套是将 React 的所有相关代码打包好的完整代码放到一个单独的文件中， 这些代码没有采用模块化，可以直接执行。其中 dist/react.js 用于开发环境，里面包含检查和警告的代码。dist/react.min.js 用于线上环境，被最小化了。
在默认情况下， Webpack 会从入口文件 ./node_modules/react/react.js 开始递归解析和处理依赖的几十个文件，这会是一个很耗时的操作 通过配置 resolve.alias, 可以让 Webpack 在处理 React 库时，直接使用单独、完整的 react.min.js 文件,从而跳过耗时的递归解析操作.

```
module.exports = {
        resolve: {
        //使用 alias 将导入 react 的语句换成直接使用单独、完整的 react.min.js 文件，
        //减少耗时的递归解析操作
            alias: {
                'react': path.resolve( __dirname ,'./node_modules/react/dist/react.min.js'),
            }
        }
    }
```

但是，对某些库使用本优化方法后，会影响到使用 Tree-Sharking 去除无效代码的优化，因为打包好的完整文件中有部分代码在我们的项目中可能永远用不上。一般对整体性比较强的库采用本方法优化，因为完整文件中的代码是一个整体，每一行都是不可或缺的 但是对于一些工具类的库，则不建议用此方法。

# 优化 resolve.extensions 配置

在导入语句没带文件后缀时，Webpack 会自动带上后缀去尝试询问文件是否存在。如果这个列表越长，或者正确的后缀越往后，就会造成尝试的次数越多，所以resolve .extensions 的配置也会影响到构建的性能 在配置resolve.extensions 时需要遵守 以下几点，以做到尽可能地优化构建性能。

- 后缀尝试列表要尽可能小，不要将项目中不可能存在的情况写到后缀尝试列表中。
- 频率出现最高的文件后缀要优先放在最前面，以做到尽快退出寻找过程。
- 在源码中写导入语句时，要尽可能带上后缀 从而可以避免寻找过程。例如在确定的情况下将 require ( './data '） 写成 require （'./data.json'）

```
module.exports = {
            resolve : {
                //尽可能减少后缀尝试的可能性
                extensions : ['js'],
            }
        }
```
# 压缩JS：Webpack内置UglifyJS插件
- 会分析JS代码语法树，理解代码的含义，从而做到去掉无效代码、去掉日志输入代码、缩短变量名等优化。
```
const UglifyJSPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
//...
plugins: [
    new UglifyJSPlugin({
        compress: {
            warnings: false,  //删除无用代码时不输出警告
            drop_console: true,  //删除所有console语句，可以兼容IE
            collapse_vars: true,  //内嵌已定义但只使用一次的变量
            reduce_vars: true,  //提取使用多次但没定义的静态值到变量
        },
        output: {
            beautify: false, //最紧凑的输出，不保留空格和制表符
            comments: false, //删除所有注释
        }
    })
]
```
使用webpack --optimize-minimize 启动webpack，可以注入默认配置的UglifyJSPlugin

# 压缩ES6：第三方UglifyJS插件
- 随着越来越多的浏览器支持直接执行ES6代码，应尽可能的运行原生ES6，这样比起转换后的ES5代码，代码量更少，且ES6代码性能更好。直接运行ES6代码时，也需要代码压缩，第三方的uglify-webpack-plugin提供了压缩ES6代码的功能

```
npm i -D uglify-webpack-plugin@beta //要使用最新版本的插件
//webpack.config.json
const UglifyESPlugin = require('uglify-webpack-plugin');
//...
plugins:[
    new UglifyESPlugin({
        uglifyOptions: {  //比UglifyJS多嵌套一层
            compress: {
                warnings: false,
                drop_console: true,
                collapse_vars: true,
                reduce_vars: true
            },
            output: {
                beautify: false,
                comments: false
            }
        }
    })
]
```
另外要防止babel-loader转换ES6代码，要在.babelrc中去掉babel-preset-env，因为正是babel-preset-env负责把ES6转换为ES5。

# 使用 ParallelUglifyPlugin

webpack默认提供了UglifyJS插件来压缩JS代码，但是它使用的是单线程压缩代码，也就是说多个js文件需要被压缩，它需要一个个文件进行压缩。所以说在正式环境打包压缩代码速度非常慢(因为压缩JS代码需要先把代码解析成用Object抽象表示的AST语法树，再去应用各种规则分析和处理AST，导致这个过程耗时非常大)。

当webpack有多个JS文件需要输出和压缩时候，原来会使用UglifyJS去一个个压缩并且输出，但是ParallelUglifyPlugin插件则会开启多个子进程，把对多个文件压缩的工作分别给多个子进程去完成，但是每个子进程还是通过UglifyJS去压缩代码。无非就是变成了并行处理该压缩了，并行处理多个子任务，效率会更加的提高。

```
npm i -D webpack-parallel-uglify-plugin

// webpack.config.json
const ParallelUglifyPlugin = require('wbepack-parallel-uglify-plugin');
//...
plugins: [
    new ParallelUglifyPlugin({
        uglifyJS:{
            //...这里放uglifyJS的参数
        },
        //...其他ParallelUglifyPlugin的参数，设置cacheDir可以开启缓存，加快构建速度
    })
]
```

# 优化文件监听的性能

在开启监听模式时，默认情况下会监听配置的 Entry 文件和所有 Entry 递归依赖的文件，在这些文件中会有很多存在于 node_modules 下，因为如今的 Web 项目会依赖大量的第三方模块， 所以在大多数情况下我们都不可能去编辑 node_modules 下的文件，而是编辑自己建立的源码文件，而一个很大的优化点就是忽略 node_modules 下的文件，不监听它们。

```
 module.export = {
        watchOptions : {
            //不监听的 node_modules 目录下的文件
            ignored : /node_modules/,
        }
    }
```

采用这种方法优化后， Webpack 消耗的内存和 CPU 将会大大减少。


