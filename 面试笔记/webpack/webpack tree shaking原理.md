# js ------tree-shaking
tree-shaking的消除原理是依赖于ES6的模块特性,来分析js文件的import和export，把未引用代码(dead code)剔除掉。

tree shaking只能在静态modules下工作。

ECMAScript 6 模块加载是静态的,因此整个依赖树可以被静态地推导出解析语法树。

ES6 module 特点：

- 只能作为模块顶层的语句出现,不能出现在 function 里面或是 if 里面
- 不管 import 的语句出现的位置在哪里，在模块初始化的时候所有的 import 都必须已经导入完成。换句话说，ES6 imports are hoisted。
- import 的模块名只能是字符串常量
- import binding 是 immutable的

ES6模块依赖关系是确定的，和运行时的状态无关，可以进行可靠的静态分析，这就是tree-shaking的基础



### tree shaking的原理

ES6 Module引入进行静态分析，故而编译的时候正确判断到底加载了那些模块

静态分析程序流，判断那些模块和变量未被使用或者引用，进而删除对应代码



# css ------tree-shaking

css的tree-shaking就是遍历选择器然后与dom结构的选择器和js中匹配，从而去除没有用到的样式代码。

如何优雅的遍历所有的选择器呢？

其实css世界有利器------postCss。

PostCSS 提供了一个解析器，它能够将 CSS 解析成AST抽象语法树。然后我们能写各种插件，对抽象语法树做处理，最终生成新的css文件，以达到对css进行精确修改的目的。



# 失效原因 --- 副作用

Babel--由于它的编译，一些原本看似没有副作用的代码，便转化为了(可能)有副作用的。



# 避免方法

  - 对于 ES6 模块来说，会有 `defaut export` 和 `named export` 的区别。  
    有些开发者喜欢把所有东西都弄成一个对象塞到 default 里面。  
      `Default export` 在概念上来说并不仅仅一个名字叫做 default 的 export，虽然它会被这样转译。  
      把一切东西都塞到 default 里面是一个错误的选择，会让 `tree-shaking` 无效。  
    从语意上来说，`default export` 用来说明这个模块是什么，`named export` 用来说明这个模块有什么。  
    合理的模块拆分是一定可以让编译器只打包到所需的代码的。  
  
  - **使用 `ES6 Module`**：不仅是项目本身，引入的库最好也是 es 版本，  
     比如用 lodash-es 代替 lodash。
     
     另外注意 TypeScript 和 Babel 的配置是否会把代码编译成非 es module 版本。
     
  - **最纯函数调用使用 PURE 注释**：由于无法判断副作用，所以对于导出的函数调用最好使用 PURE 注释，不过一般来说有相关的 babel 插件自动添加。

  - 尽量不写带有副作用的代码。诸如编写了立即执行函数，在函数里又使用了外部变量等。

  - 如果对ES6语义特性要求不是特别严格，可以开启babel的loose模式，这个要根据自身项目判断，如：是否真的要不可枚举class的属性。

  - 如果是开发JavaScript库，请使用rollup。并且提供ES6 module的版本，入口文件地址设置到package.json的module字段。

  - 如果JavaScript库开发中，难以避免的产生各种副作用代码，可以将功能函数或者组件，打包成单独的文件或目录，以便于用户可以通过目录去加载。如有条件，也 可为自己的库开发单独的webpack-loader，便于用户按需加载。

  - 如果是工程项目开发，对于依赖的组件，只能看组件提供者是否有对应上述3、4点的优化。对于自身的代码，除1、2两点外，对于项目有极致要求的话，可以先进行打包，最终再进行编译。

  - 如果对项目非常有把握，可以通过uglify的一些编译配置，如：pure_getters: true，删除一些强制认为不会产生副作用的代码。





 #### 打包工具库、组件库，还是rollup好用，为什么呢？

  1. 它支持导出ES模块的包。
  2. 它支持程序流分析，能更加正确的判断项目本身的代码是否有副作用。

我们只要通过rollup打出两份文件，一份umd版，一份ES模块版，它们的路径分别设为main，module的值。这样就能方便使用者进行tree-shaking。

