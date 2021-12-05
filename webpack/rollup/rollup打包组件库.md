[TOC]

# 常用配置

## 1.input

入口文件地址

## 2.output

```js
output:{
    file:'bundle.js', // 输出文件
    format: 'cjs,  //  五种输出格式：amd /  es6 / iife / umd / cjs
    name:'A',  //当format为iife和umd时必须提供，将作为全局变量挂在window(浏览器环境)下：window.A=...
    sourcemap:true  //生成bundle.map.js文件，方便调试
}
```

## 3.plugins

各种插件使用的配置

## 4.external

```js
external:['lodash'] //告诉rollup不要将此lodash打包，而作为外部依赖
```

## 5.global

```js
global:{
    'jquery':'$' //告诉rollup 全局变量$即是jquery
}
```

**附一份react-redux开源项目的rollup配置文件**

```js
import nodeResolve from 'rollup-plugin-node-resolve' // 帮助寻找node_modules里的包
import babel from 'rollup-plugin-babel' // rollup 的 babel 插件，ES6转ES5
import replace from 'rollup-plugin-replace' // 替换待打包文件里的一些变量，如process在浏览器端是不存在的，需要被替换
import commonjs from 'rollup-plugin-commonjs' // 将非ES6语法的包转为ES6可用
import uglify from 'rollup-plugin-uglify' // 压缩包

const env = process.env.NODE_ENV

const config = {
  input: 'src/index.js',
  external: ['react', 'redux'], // 告诉rollup，不打包react,redux;将其视为外部依赖
  output: { 
    format: 'umd', // 输出 ＵＭＤ格式，各种模块规范通用
    name: 'ReactRedux', // 打包后的全局变量，如浏览器端 window.ReactRedux　
    globals: {
      react: 'React', // 这跟external 是配套使用的，指明global.React即是外部依赖react
      redux: 'Redux'
    }
  },
  plugins: [
    nodeResolve(),
    babel({
      exclude: '**/node_modules/**'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
    commonjs()
  ]
}

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  )
}

export default config
```


 

# rollup配置文件

在项目开发中，我们通常会使用配置文件，这不仅可以简化命令行操作，同时还能启用rollup的高级特性。

在项目根目录下创建`rollup.config.js`。

```js
export default {
  input: "./src/index.js",
  output: [
    {
      file: './dist/my-lib-umd.js',
      format: 'umd',
      name: 'myLib'   
      //当入口文件有export时，'umd'格式必须指定name
      //这样，在通过<script>标签引入时，才能通过name访问到export的内容。
    },
    {
      file: './dist/my-lib-es.js',
      format: 'es'
    },
    {
      file: './dist/my-lib-cjs.js',
      format: 'cjs'
    }
  ]
}
```

使用Rollup的配置文件，可以使用`rollup --config`或者`rollup -c`指令。

```
//修改package.json的script字段

"dev": "rollup -c"                 // 默认使用rollup.config.js
"dev": "rollup -c my.config.js"    //使用自定义的配置文件，my.config.js
```

`src/index.js`内容：

```
import { hello } from './hello'
hello()
export const world = 'world'
```

打包后的文件： ![img](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b51193aed2a942bb8fc2f9bd59df9cfc~tplv-k3u1fbpfcp-watermark.awebp) ![img](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dd58556022bd4c5ca0aab37b3ab84f8e~tplv-k3u1fbpfcp-watermark.awebp) 可以看出，同样的入口文件，es格式的文件体积最小。

# rollup插件

上面我们知道了rollup的基础用法，在实际应用中，会有很多更复杂的需求，比如，怎样支持es6语法，怎样打包.vue文件，怎样压缩我们js的代码等等。在rollup中，我们借助插件来完成。

在webpack中，使用loader对源文件进行预处理，plugin完成构建打包的特定功能需求。rollup的plugin兼具webpack中loader和plugin的功能。

![img](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/041aa1da5fe747fea303944cb49c94fe~tplv-k3u1fbpfcp-watermark.awebp)

一些常用的插件。

### rollup-plugin-babel

`rollup-plugin-babel`用于转换es6语法。

将`src/hello.js`中的内容改写成：

```
export const hello = () => {
  console.log('hello world')
}
```

在未使用babel插件的情况下，打包结果：

![img](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1412e5d784c84eb8a8f89b557525e11e~tplv-k3u1fbpfcp-watermark.awebp)

使用babel插件：

```js
npm i rollup-plugin-babel @babel/core @babel/preset-env --D
//rollup.dev.js
import babel from 'rollup-plugin-babel'
export default {
  input: ...,
  output: ...,
  plugins:[
    babel({
        exclude: 'node_modules/**'
    })
  ]
}
```

在项目根目录创建`.babelrc`文件。

```js
{
  "presets": [
      [
        "@babel/preset-env",
         {
             “modules": false,
         }
      ]
    ]
}
```

设置` "modules": false` ，否则 Babel 会在 Rollup 有机会做处理之前，将我们的模块转成 CommonJS ，导致 Rollup 的一些处理失败。

再次打包： ![img](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e024a02483774d8f8789c7a8beda97d6~tplv-k3u1fbpfcp-watermark.awebp)

### rollup-plugin-commonjs

rollup默认是不支持CommonJS模块的，自己写的时候可以尽量避免使用CommonJS模块的语法，但有些外部库的是cjs或者umd（由webpack打包的），所以使用这些外部库就需要支持CommonJS模块。

新建一个`src/util.js`文件，内容如下：

```
module.exports = {
  a: 1
}
```

在`src/index.js`中引入`util.js`

```
import util from './util'
console.log(util.a)
```

`npm run dev`打包会报错： ![img](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8def0c2bd2b949c4875d3949c986c50f~tplv-k3u1fbpfcp-watermark.awebp)

这就需要使用`rollup-plugin-commonjs`，首先，`npm i rollup-plugin-commonjs --D`.

在`rollup.config,js`中加入：

```
import commonjs from 'rollup-plugin-commonjs'
export default {
  input: ...,
  output: ...,
  plugins:[
    commonjs()
  ]
}
```

再`npm run dev`打包，没有报错。

我们还可以在代码使用require引入模块：

```
// src/index.js
const util = require('./util')
console.log(util.a)
```

`rollup-plugin-commonjs`可以识别require语法，并打包成es模块语法，打包的出的my-lib-es.js的内容如下：

```
var util = {
  a: 1
};

console.log(util.a);

var src = {

};

export default src;
```

### rollup-plugin-postcss

处理css需要用到的插件是`rollup-plugin-postcss`。它支持css文件的加载、css加前缀、css压缩、对scss/less的支持等等。

首先，安装，`npm i rollup-plugin-postcss postcss --D`，然后在`rollup.config.js`中配置：

```
import postcss from 'rollup-plugin-postcss'
export default {
  input: ...,
  output: ...,
  plugins:[
    postcss()
  ]
}
```

然后，新建一个test.css，在index.js中引入。 ![img](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/22bf0417fd4b48b6bb2ced5678bbb65d~tplv-k3u1fbpfcp-watermark.awebp) 打包后得到的umd文件：

```
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z = "body{\r\n  color: green;\r\n}";
  styleInject(css_248z);

})));
```

导入的css文件将用于生成style标签，插入到head中。

我们新建一个测试文件，引入该umd文件。可以看到head中有我们在`test.css`写入的内容。

```
<body>
  test css
</body>
<script src="../dist/my-lib-umd.js"></script>
```

![img](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bc285c0cde0c49a384fa61b44ce75124~tplv-k3u1fbpfcp-watermark.awebp)

#### css加前缀

借助`autoprefixer`插件来给css3的一些属性加前缀。安装`npm i autoprefixer@8.0.0 --D`，配置：

```
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
export default {
  input: ...,
  output: ...,
  plugins:[
    postcss({
      plugins: [  
        autoprefixer()  
      ]
    })
  ]
}
```

使用`autoprefixer`除了以上配置，还需要配置browserslist，有2种方式，一种是建立.browserslistrc文件，另一种是直接在package.json里面配置，我们在package.json中，添加"browserslist"字段。

```
"browserslist": [
  "defaults",
  "not ie < 8",
  "last 2 versions",
  "> 1%",
  "iOS 7",
  "last 3 iOS versions"
]
```

修改`test.css`的内容：

```
body{
  color: green;
  display: flex;
}
```

打包，刷新刚才的测试页面。 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8dee6aef876041828942d871d878f992~tplv-k3u1fbpfcp-watermark.awebp)

#### css压缩

cssnano对打包后的css进行压缩。使用方式也很简单，和autoprefixer一样，安装`cssnano`，然后配置。

```
plugins:[
  postcss({
    plugins: [
      autoprefixer(),
      cssnano()
    ]
  })
]
```

![img](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8021a4df5cc3484db8333e121c60960f~tplv-k3u1fbpfcp-watermark.awebp)

#### 抽离单独的css文件

`rollup-plugin-postcss`可配置是否将css单独分离，默认没有`extract`，css样式生成`style`标签内联到head中，配置了`extract`，就会将css抽离成单独的文件。

```
postcss({
  plugins: [
    autoprefixer(),
    cssnano()
  ],
  extract: 'css/index.css'  
})
```

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5c3805dc16cb4d32a930fb0847504064~tplv-k3u1fbpfcp-watermark.awebp)

当然，在页面也需要单独引入打包好的css文件。

#### 支持scss/less

实际项目中我们不太可能直接写css，而是用scss或less等预编译器。`rollup-plugin-postcss`默认集成了对scss、less、stylus的支持，在我们项目中，只要配置了`rollup-plugin-postcss`，就可以直接使用这些css预编译器，很方便的。

### rollup-plugin-vue

rollup-plugin-vue用于处理.vue文件。**vue2和vue3项目所用的rollup-plugin-vue版本不一样，vue的编译器也不一样**。

- vue2：`rollup-plugin-vue^5.1.9` + `vue-template-compiler`
- vue3：`rollup-plugin-vue^6.0.0` + `@vue/compiler-sfc`

以vue2为例：

```
npm i rollup-plugin-vue@5.1.9 vue-template-compiler --D
```

在`rollup.dev.js`中加入`rollup-plugin-vue`

```
import vue from 'rollup-plugin-vue'
export default {
  ...
  plugins:[
    vue()
  ]
}
```

新建一个vue文件，并修改`src/index.js` ![img](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ece4a584238446588ca014ba0896da2b~tplv-k3u1fbpfcp-watermark.awebp)

`npm run dev`打包，我们来看看生成的`umd`文件。

![img](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2d7a7688f757453ca23bdcbc666cc936~tplv-k3u1fbpfcp-watermark.awebp) 测试umd文件：

```
<body>
  <div id="app">
    <hello></hello>
  </div>
</body>
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<script src="../dist/my-lib-umd.js"></script>
<script>
  Vue.use(myLib)
  new Vue({
    el: '#app'
  })
</script>
```

![img](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/54bd87e991e84c1193a9606d1430047a~tplv-k3u1fbpfcp-watermark.awebp) 组件使用成功，说明我们的配置可以编译、打包.vue文件了。

`rollup-plugin-vue`也是默认支持scss、less、stylus，可以在项目中直接使用。给.vue文件中的css自动加前缀，需要在`rollup-plugin-vue`中配置。更多配置参考[rollup-plugin-vue](https://link.juejin.cn?target=https%3A%2F%2Frollup-plugin-vue.vuejs.org%2Foptions.html%23style-postcssoptions)

```
import vue from 'rollup-plugin-vue'
import autoprefixer from 'autoprefixer'  //同样要配置browserslist
import cssnano from 'cssnano'
export default {
  ...
  plugins:[
    vue({
      style: {
        postcssPlugins: [
          autoprefixer(),
          cssnano()
        ]
      }
    })
  ]
}
```

### rollup-plugin-terser

在生产环境中，代码压缩是必不可少的。我们使用`rollup-plugin-terser`进行代码压缩。

```js
import { terser } from 'rollup-plugin-terser'
export default {
  ...
  plugins:[
    terser()
  ]
}
```

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7b1c4b3879034641bf56d32fac596e1d~tplv-k3u1fbpfcp-watermark.awebp)

在上面的过程中，我们都是打包好文件，然后通过script引入，或npm link然后在别的项目中调试，这更像是组件库的调试方法。

如果我们用rollup打包一个应用，它能否像webpack那样热更新呢？答案是可以的。我们需要借助`rollup-plugin-serve`和`rollup-plugin-livereload`。

### rollup-plugin-serve、rollup-plugin-livereload

这两个插件常常一起使用，`rollup-plugin-serve`用于启动一个服务器，`rollup-plugin-livereload`用于文件变化时，实时刷新页面。

```js
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
export default {
  ...
  plugins:[
    serve({
      contentBase: '',  //服务器启动的文件夹，默认是项目根目录，需要在该文件下创建index.html
      port: 8020   //端口号，默认10001
    }),    
    livereload('dist')   //watch dist目录，当目录中的文件发生变化时，刷新页面
  ]
}
```

![img](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a6f5e127bf5742699e0932c5c764248c~tplv-k3u1fbpfcp-watermark.awebp) 我们需要在index.html手动加入打包后的文件，js或者css，因为此时并没有自动注入。

然后访问`http://localhost:8020`就可以看到index.html中的内容。

然而，此时修改src中的文件，页面并不会实时刷新，因为dist目录下的文件并没有更新。 

rollup监听源文件的改动很简单，就是在执行打包命令时，添加 `-w` 或者 `--watch` ![img](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/83c331e7fcdb4950991b1eda9c471393~tplv-k3u1fbpfcp-watermark.awebp)

```
//package.json
"scripts": {
   "dev": "rollup -wc"
},
```

大功告成，再修改源文件的代码，你就会发现浏览器实时更新了。



### @rollup/plugin-node-resolve @rollup/plugin-commonjs

> 在某些时候，您的项目可能取决于从NPM安装到node_modules文件夹中的软件包。

与Webpack和Browserify等其他捆绑软件不同，Rollup不知道如何``开箱即用''如何处理这些依赖项-我们需要添加一些插件配置。

> rollup.js编译源码中的模块引用默认只支持 ES6+的模块方式import/export。然而大量的npm模块是基于CommonJS模块方式，这就导致了大量 npm 模块不能直接编译使用。所以辅助rollup.js编译支持 npm模块和CommonJS模块方式的插件就应运而生。

- @rollup-plugin-node-resolve 插件允许我们加载第三方模块
- @rollup/plugin-commons 插件将它们转换为ES6版本


 ### @rollup/plugin-typescript

使用typescript

### rollup-plugin-eslint 

 js代码检测

### @rollup/plugin-alias

使用别名替换相对路径

```js
import alias from '@rollup/plugin-alias'

const path = require('path')
const resolveDir = dir => path.join(__dirname, dir)

export default {
	plugins: [
		alias(
			{
				entries: [
					{
						find: '@', replace,ent: resolveDir('src')
					}
				]
			}
		)
	]
}
```

### rollup-plugin-uglify

用于压缩混淆打包后的js

### rollup-plugin-filesize

打包后在控制台显示文件大小。

### @rollup/plugin-image

> 可导入JPG，PNG，GIF，SVG和WebP文件。

> 图像是使用base64编码的，这意味着它们将比磁盘上的大小大33％。更多使用详情查看 [github.com/rollup/plug…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Frollup%2Fplugins%2Ftree%2Fmaster%2Fpackages%2Fimage)

### @rollup/plugin-json

> 可将.json文件转换为ES6模块。更多使用详情查看 [github.com/rollup/plug…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Frollup%2Fplugins%2Ftree%2Fmaster%2Fpackages%2Fjson)

### rollup-plugin-copy

> 复制文件和文件夹，并具有glob支持。 更多使用详情查看 [github.com/vladshcherb…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fvladshcherbin%2Frollup-plugin-copy)

### rollup-plugin-visualizer

> 可视化并分析您的Rollup捆绑包，以查看哪些模块占用了空间。更多使用详情查看 [github.com/btd/rollup-…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fbtd%2Frollup-plugin-visualizer)

### rollup-plugin-web-worker-loader

> 处理Web Worker。更多使用详情查看 [github.com/darionco/ro…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fdarionco%2Frollup-plugin-web-worker-loader)



# 打包按需加载的组件库

都到这里了，打包按需加载组件就太简单了。

**对于组件库项目，支持按需加载需要满足：组件库以ES模块化方式导出。** 

而rollup本来就支持ES模块的导出。

新建两个vue组件，hello和test：

![img](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf9774d53df64d4f8495ddc73f62b45c~tplv-k3u1fbpfcp-watermark.awebp) ![img](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a36e00901c3a46909b4ec1e0a87e22c5~tplv-k3u1fbpfcp-watermark.awebp)

修改`src/index.js`:

```js
import Hello from "./components/Hello"
import Test from "./components/Test"
function install(Vue){
  Vue.use(Hello)
  Vue.use(Test)
}

/***
在es模块中， 能被按需引入的变量需要用这些方式导出：
export const a = 1
export function a(){}
export { a, b }
而不能使用export default
***/

export {    
  Hello,
  Test
}

export default install  //umd
```

修改`rollup.config.js`如下：

```js
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import vue from 'rollup-plugin-vue'
import autoprefixer from 'autoprefixer'
export default {
  input: "./src/index.js",
  output: [
    {
      file: './dist/my-lib-umd.js',
      format: 'umd',
      name: 'myLib'
    },
    {
      file: './dist/my-lib-es.js',
      format: 'es'
    },
    {
      file: './dist/my-lib-cjs.js',
      format: 'cjs'
    }
  ],
  plugins:[
    babel({
        exclude: 'node_modules/**'
    }),
    vue({
      style: {
        postcssPlugins: [
          autoprefixer()
        ]
      }
    }),
    commonjs()
  ],
  external:[  //外部库， 使用'umd'文件时需要先引入这个外部库
    'vue'
  ]
}
```

打包后，修改package.json:

```
"main": "dist/my-lib-cjs.js",
"module": "dist/my-lib-es.js",
```

然后就可以在测试项目中进行测试了。具体可以参考[怎样在本地调试组件库](https://juejin.cn/post/6932736907830886413#heading-4)

```
import { Hello } from "my-lib-new"
Vue.use(Hello)
```

至此，我们用rollup打包按需加载的组件库就完成了，整体感觉，要比webpack方便很多，按需加载组件的时候也不需要借助插件，在类库打包方面是挺优秀的了。



# rollup中打包axios异常问题

```js
import Axios from 'axios';
改成 ========>>
import Axios from 'axios/dist/axios';
```

