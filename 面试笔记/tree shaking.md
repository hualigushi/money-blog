### js ------tree-shaking
tree-shaking的消除原理是依赖于ES6的模块特性,来分析js文件的import和export，把未引用代码(dead code)剔除掉。

ES6 module 特点：

- 只能作为模块顶层的语句出现,不能出现在 function 里面或是 if 里面
- 不管 import 的语句出现的位置在哪里，在模块初始化的时候所有的 import 都必须已经导入完成。换句话说，ES6 imports are hoisted。
- import 的模块名只能是字符串常量
- import binding 是 immutable的

ES6模块依赖关系是确定的，和运行时的状态无关，可以进行可靠的静态分析，这就是tree-shaking的基础

### css ------tree-shaking

css的tree-shaking就是遍历选择器然后与dom结构的选择器和js中匹配，从而去除没有用到的样式代码。

如何优雅的遍历所有的选择器呢？

其实css世界有利器------postCss。

PostCSS 提供了一个解析器，它能够将 CSS 解析成AST抽象语法树。然后我们能写各种插件，对抽象语法树做处理，最终生成新的css文件，以达到对css进行精确修改的目的。
