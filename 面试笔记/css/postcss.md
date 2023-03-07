postcss 不是类似less的CSS预处理器， 而是一种允许用JS插件来转变样式的工具。

postcss提供了一个解析器，它能够将CSS解析成抽象语法树(AST)。



postcss的常用插件

- **autoprefixer**[15]：autoprefixer插件会给根据CanIUse的兼容性去检查你的CSS代码，然后自动为你的CSS代码加上浏览器厂商的私有前缀