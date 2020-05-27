Webpack的文件加载分为三种：

# 绝对路径

`require('/home/me/file')`
此时会首先检查参数目标是否为目录，如果是目录，则检查`package.json`的`main`字段。

如果没有`package.json`或者没有`main`字段，则会用`index`作为文件名。

经过上述过程，解析到一个绝对路径的文件名，然后会尝试为其加上扩展名（扩展名可在`webpack.config.js`中设置），第一个存在的文件作为最终的结果。



# 相对路径

`require('./file')`

使用当前路径或配置文件中的context作为相对路径的目录。

加载过程和绝对路径相似。



# 模块路径

`require('module/lib/file')`

会在配置文件中的所有查找目录中查找。

对于复杂的模块路径，还可以设置别名(resolve.alias)。

一个路径解析配置的例子：

`resolve.extensions`
用于指明程序自动补全识别哪些后缀。第一个是空字符串，对应不需要后缀的情况。

```
module.exports = {
    resolve: {
        root: [appRoot, nodeRoot, bowerRoot],
        modulesDirectories: [appModuleRoot], 
        alias: {
            'angular': 'angular/angular',
            'lodash': 'lodash/dist/lodash'
        },
        extensions: ['', '.js', '.coffee', '.html', '.css', '.scss']
    }
}
```

Webpack 中涉及路径配置最好使用绝对路径，建议通过 `path.resolve(__dirname, "app/folder") `或`path.join(__dirname, "app", "folder") `的方式来配置，以兼容 Windows 环境。



# 带表达式的 require 语句

如果request 含有表达式(expressions)，会创建一个上下文(context)，因为在编译时(compile time)并不清楚具体是哪一个模块被导入。
示例：

`require("./template/" + name + ".ejs");`

webpack 解析 require() 的调用，提取出来如下这些信息：
`Directory: ./template`
`Regular expression: /^.*.ejs$/`





