按照官方文档的解释，如果我们想引用一个库，但是又不想让webpack打包，并且又不影响我们在程序中以CMD、AMD或者window/global全局等方式进行使用，那就可以通过配置externals。

这个功能主要是用在创建一个库的时候用的，但是也可以在我们项目开发中充分使用。

假设：我们开发了一个自己的库，里面引用了lodash这个包，经过webpack打包的时候，发现如果把这个lodash包打入进去，打包文件就会非常大。那么我们就可以externals的方式引入。也就是说，自己的库本身不打包这个lodash，需要用户环境提供。

使用lodash

```
import _ from 'lodash';
```

配置externals

```js
externals: {
  "lodash": {
        commonjs: "lodash",//如果我们的库运行在Node.js环境中，import _ from 'lodash'等价于const _ = require('lodash')
        commonjs2: "lodash",//同上
        amd: "lodash",//如果我们的库使用require.js等加载,等价于 define(["lodash"], factory);
        root: "_"//如果我们的库在浏览器中使用，需要提供一个全局的变量‘_’，等价于 var _ = (window._) or (_);
  }
}
```

> 总得来说，externals配置就是为了使`import _ from 'lodash'`这句代码，在本身不引入lodash的情况下，能够在各个环境都能解释执行。

有一点需要注意的是，假如lodash中在浏览器环境中不提供`_`的全局变量，那么就没有办法使用。这个"_"是不能随便乱写的。如果外部库lodash提供的是全局变量`lodash`,那你就得使用`lodash`。

> 如果你写的库要支持各种环境，你需要设置output中的libraryTarget为umd，也就是将打包的文件，生成为umd规范，适用于各种环境。libraryTarget和externals有藕断丝连的关系，后面会提到。



### externals支持模块上下文的方式

- global - 外部 library 能够作为全局变量使用。用户可以通过在 script 标签中引入来实现。这是 externals 的默认设置。
- commonjs - 用户(consumer)应用程序可能使用 CommonJS 模块系统，因此外部 library 应该使用 CommonJS 模块系统，并且应该是一个 CommonJS 模块。
- commonjs2 - 类似上面几行，但导出的是 module.exports.default。
- amd - 类似上面几行，但使用 AMD 模块系统。



### 不同环境设置externals方式

如果你的代码想运行在Node环境中，那么你需要在external中添加前缀commonjs2或者commonjs

```
externals:{
  react:'commonjs2 react',
  jquery:'commonjs2 jquery'
}
```

如果需要requirejs等符合AMD规范的环境中加载，那就要添加amd

```
externals:{
  react:'amd React',
  jquery:'amd jQuery'
}
```

如果要在浏览器中运行，那么不用添加什么前缀，默认设置就是global。

```
externals:{
  react:'React',
  jquery:'jQuery'
}
```

也可以这样

```
externals:["React","jQuery"]
```

这种方式配置下，就是配置你所引用你的库暴露出的全局变量。上面两种模式下或者说，如果你想运行代码在浏览器中，你所引用的包，必须暴露出一个全局变量。如果没有，这种方式不适合在浏览器下使用，可以尝试dll的方式。

这里你可以看出，不同模式下，value是不一样的。2，3模式下，是要引入去全局变量，1模式是要加载包名。那如果这个包的包名和在浏览器下引入的全局变量一致，上面就可以写成一样了，比如moment。



### `externals`和`libraryTarget`的关系

- libraryTarget配置如何暴露 library。如果不设置library,那这个library就不暴露。就相当于一个自执行函数
- externals是决定的是以哪种模式去加载所引入的额外的包
- libraryTarget决定了你的library运行在哪个环境，哪个环境也就决定了你哪种模式去加载所引入的额外的包。也就是说，externals应该和libraryTarget保持一致。library运行在浏览器中的，你设置externals的模式为commonjs，那代码肯定就运行不了了。
- 如果是应用程序开发，一般是运行在浏览器环境libraryTarget可以不设置，externals默认的模式是global，也就是以全局变量的模式加载所引入外部的库。



### webpack 配置

以抽离项目中vue和vue-router为例。

##### 第一步：配置externals

这个配置最好在生产环境的时候配置，如果静态资源是cdn引入的话本地开发依赖网络。

```jsx
//webpack.config.base.js
const webpack = require("webpack");
const path = require("path");
const MODE = 'development'
module.exports = {
    mode: MODE,
    entry: {
        index: path.resolve(__dirname, '../src/main.ts')
    },
    ...
    externals: process.env.NODE_ENV === 'production' ? {
        "vue": "Vue",
        'vue-router': 'VueRouter'
    } : {}
    ...
}
```

说一下这里的键值对配置，key值`vue`这个值是import from 'vue'时用的名称，value值是为`Vue`，这个值是通过script方式引入js库后它的全局变量 ，这时vue库的全局变量是首字母大写的 'Vue'。

##### 第二步：引入静态资源

用externals配置后，因为vender.js里面没有了静态资源文件，所以需要额外引入，可以在`index.html`引用cdn引入或者本地引入。

```jsx
//cdn
<script src="https://cdn.bootcss.com/vue/2.6.10/vue.min.js"></script>
<script src="https://cdn.bootcss.com/vue-router/3.0.6/vue-router.min.js"></script>

//本地
<script src="./static/vue.min.js"></script>
<script src="./static/vue-router.min.js"></script>
```

##### 配置完成

如果你是CDN引入的会发现打包出来的vendor.js体积会变小，减少的部分就是静态资源的大小。

> 不过使用externals属性要注意的是，虽然可以优化首屏加载速度，但是由于静态资源分离，也会增加http请求数量。所以如果是小项目，最好就不要用externals属性，因为小项目打包的出来的vender.js体积不大，建议项目体量较大的项目再用比较合适。