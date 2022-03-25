本文主要分析了Webpack打包后的源码；在Webpack打包文件出问题的时候，我们可以根据基本的程序结构来进行调试定位。

例如：在执行Webpack构建后，将生成的文件放到dist目录，我们分析的即是dist目录的built.js。

#### 1. 示例项目的Webpack相关配置：

```lua
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devtool: 'none',
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'built.js',
    path: path.resolve('dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
}
```

#### 2. 主体结构

1. 打包后的文件就是一个函数自调用，当前函数调用时传入一个对象
2. 这个对象我们为了方便将之称为是模块定义，它就是一个键值对
3. 这个键名就是当前被加载模块的文件名与某个目录的拼接（）
4. 这个键值就是一个函数，和 node.js 里的模块加载有一些类似，会将被加载模块中的内容包裹于一个函数中
5. 这个函数在将来某个时间点上会被调用，同时会接收到一定的参数，利用这些参数就可以实现模块的加载操作
6. 针对于上述的代码就相当于是将模块定义： {"模块id":(function(){})} 传递给了 modules

```javascript
(function(modules){
    //....
})({
    "模块id":(function(){})
})
```

1. 示例：

```javascript
(function (modules) { // webpackBootstrap
    //....
})({
    "./src/index.js":
      (function (module, exports) {
        console.log('index.js内容')
        module.exports = '入口文件导出内容'
    })
});
```

#### 3. 构建流程

1、启动 webpack
2、启动 webpack-cli
3、创建编译对象 compiler
4、实例化编译对象 compiler，预埋核心钩子
5、执行方法 compiler.run()，启动编译
6、执行方法 compiler.compile()，完成编译，输出文件

#### 4. 核心函数功能（待补充）

```js
  // 缓存模块，如果已经加载过的模块就直接使用缓存
  var installedModules = {};

  // 下面的这个方法就是 webpack 当中自定义的，它的核心作用就是返回模块的 exports 
  function __webpack_require__(moduleId) {}

  // 将模块定义保存一份，通过 m 属性挂载到自定义的方法身上
  __webpack_require__.m = modules;

  // 将所有模块的缓存数据保存一份
  __webpack_require__.c = installedModules;

  // 判断被传入的对象 obj 身上是否具有指定的属性 **** ,如果有则返回 true 
  __webpack_require__.o = function (object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
  
  // 如果当前 exports 身上不具备 name 属性，则条件成立，则给 exports 添加一个 name 属性并停工一个访问器 getter
  __webpack_require__.d = function (exports, name, getter) {
    if (!__webpack_require__.o(exports, name)) {
      Object.defineProperty(exports, name, { enumerable: true, get: getter });
    }
  };


  // define __esModule on exports
  // 判断是否ES Modules，然后添加标记
  __webpack_require__.r = function (exports) {
    // 下面的条件如果成立就说明是一个  esModule 
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      // 往exports身上添加一个属性，值是Module；
      // 该值可以通过 Object.prototype.toString.call(exports) 访问
      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    }
    // 如果条件不成立，我们也直接在 exports 对象的身上添加一个 __esModule 属性，它的值就是true 
    Object.defineProperty(exports, '__esModule', { value: true });
  };

  // 如果module是ES Modules模块，返回default
  // getDefaultExport function for compatibility with non-harmony modules
  __webpack_require__.n = function (module) {
    var getter = module && module.__esModule ?
      function getDefault() { return module['default']; } :
      function getModuleExports() { return module; };
    __webpack_require__.d(getter, 'a', getter);
    return getter;
  };

  // __webpack_public_path__
  __webpack_require__.p = "";

  // __webpack_require__.s 存储模块id值
  return __webpack_require__(__webpack_require__.s = "./src/index.js");
```

__webpack_require__.r 方法添加的标记：

![img](https://segmentfault.com/img/bVcS4W1)

__webpack_require__.d 给属性age添加getter方法（返回age）：
![img](https://segmentfault.com/img/bVcS4Xc)

#### 5. 功能函数使用场景

**1. CommonJS模块打包** ，Webpack 默认使用 CommonJS 规范处理打包内容：

- 如果模块是使用 CommonJS 方式导入，Webpack不需要额外处理。

```javascript
let obj = require('./login.js')
```

- 如果模块是使用 CommonJS 方式导出，Webpack不需要额外处理。

```javascript
module.exports = '拉勾教育'
```

**2. ES Modules模块打包**

- 如果模块是使用ES Modules方式导入，那么Webpack会进行处理。

```javascript
import name, { age } from './login.js'
```

- 如果模块是使用ES Modules方式导出，那么Webpack会进行处理。

```javascript
export default '拉勾教育'
export const age = 100
```

- 导入导出都用ES Modules的示例：

```javascript
(function (modules) { // webpackBootstrap
  //...

  return __webpack_require__(__webpack_require__.s = "./src/index.js");
})({
    // modules作为参数：{KEY: VALUE}
    "./src/index.js":
      (function (module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__); // 标记为ES Modules
        var _login_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/login.js"); // 加载login.js这个模块
        console.log('index.js内容加载了')
        console.log(_login_js__WEBPACK_IMPORTED_MODULE_0__["default"], '---->', _login_js__WEBPACK_IMPORTED_MODULE_0__["age"])
      }),
    "./src/login.js":
      (function (module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        __webpack_require__.d(__webpack_exports__, "age", function () { return age; });
        __webpack_exports__["default"] = ('拉勾教育');
        const age = 100
      })
  });
```

#### 6. 按需加载模块执行流程（重要）

**加载示例代码：**

```javascript
// idnex.js
let oBtn = document.getElementById('btn')

oBtn.addEventListener('click', function () {
  import(/*webpackChunkName: "login"*/'./login.js').then((login) => {
    console.log(login)
  })
})

console.log('index.js执行了')
// login.js
module.exports = "懒加载导出内容"
```

**加载流程梳理：**

1. 触发了模块的异步加载后，首先执行 __webpack_require__.e 方法
2. __webpack_require__.e 方法加载js文件，返回值为：promise

- e 方法功能1：判断是否加载过模块

  > 1. 已经加载 => 使用本地缓存
  > 2. 没加载过 => 继续执行加载

- e 方法功能2：采用`jsonp`的方式加载js文件模块

  > jsonp是如何加载js模块的？
  >
  > 1. 在html中创建一个script标签，script标签的src指向js文件
  > 2. js文件中定义了callback方法，js文件加载完成后执行callback方法

- 全局变量：变量赋值，定义一些别名方便模块加载后全局调用

  > 1. webpackJsonp = jsonpArray //非代码，表明相等而已
  > 2. webpackJsonp.push = jsonpArray.push = webpackJsonpCallback

3. 加载js文时执行callback方法：webpackJsonp.push（这里的jsonp和promise是怎么配合的？）

> 1. webpackJsonp.push已经提前定义好，且在模块中实际调用的是webpackJsonpCallback
> 2. webpackJsonpCallback的作用是：合并异步加载的模块到modules里面，改变promise状态；

4. 然后执行 __webpack_require__.t 方法加载模块并返回模块的内容

> - t方法功能：加载模块内容，在根据模块导入方式（CommonJS或ES Modules）进行处理，然后再导出。
> - 其中涉及到按位与的功能设计：
> - 说明：& 与运算，二进制数某一位两者相同返回1，不同返回0
> - 例如：0001、0010、0100、1000为4个二进制开关1/2/4/8， 7表示打开了1,2,4的开关；8关闭的意思

1. 最后拿到模块导出的内容，使用其数据执行后续代码

存在的问题，使用Single-Spa动态加载不同子系统的同名文件时，模块名id会出现冲突

