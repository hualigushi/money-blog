# 一、babel-loader导致Tree-shaking失效的原因
Tree-shaking实现的前提是必须要使用ES Modules去组织我们的代码，也就是说由webpack打包的代码必须使用ESM。
webpack在打包所有模块之前，先是将模块根据配置交给不同的loader去处理，最后再将所有loader处理过后的结果打包到一起。
为了转换代码中的ECMAScript新特性，很多时候我们都会选择babel-loader去处理我们的js文件。而在babel转换我们的代码时，就有可能处理掉我们代码中的ES Modules把它们转换成CommonJS，这取决于我们有没有使用转换ESM的插件。
我们所使用的preset-env插件集合，它里面就有这么一个插件，所以当preset-env这个插件集合开始工作的时候，我们代码中ESM的部分就应该会被转换成CommonJS的方式，webpack打包时拿到的代码就是以CommonJS组织的代码，所以Tree-shaking就不能生效。

二、配置babel-loader后尝试打包

```js
// webpack.config.js
module.exports = {
    mode:"none",
    entry:"./src/main.js",
    output:{
        filename:"bundle.js"
    },
    module:{
        rules:[
            {
                test:/\.js$/,
                use:[
                    {
                        loader:"babel-loader",
                        options:{
                            presets:['@babel/preset-env']
                        }
                    }
                ]
            }
        ]
    },
    // optimization是用来集中配置一些webpack优化功能的
    optimization:{
        usedExports:true, // 表示输出结果中只导出那些在外部使用了的成员
    }
}
```


执行打包

![](https://img-blog.csdnimg.cn/20201130125624668.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NTA0NzAzOQ==,size_16,color_FFFFFF,t_70#pic_center)

我们发现usedExports功能正常执行了，也就是说如果我们开启minimize压缩代码的话，这些未引用代码依然会被移除，Tree-shaking并没有失效。
这是因为在最新版本的babel-loader中，已经自动帮我们关闭了ESM转换的插件。

![](https://img-blog.csdnimg.cn/20201130125952921.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NTA0NzAzOQ==,size_16,color_FFFFFF,t_70#pic_center)

我们可以在`babel-loader/lib/injectCaller.js`中看到当前是支持ESM的。

![]()

而在preset-env中根据injectCaller.js中的标识禁用了ESM的转换。

所以最后webpack最终打包时得到的还是ESM组织的代码，Tree-shaking也就可以正常工作了。

如果不确定ESM转换是否被禁用，我们还可以手动禁用，确保webpack最终打包的是ESM的代码。

```
presets:[ 
	// 注意，这里的结构，还是一个数组
	// 如果想要转CommonJS，可以设置成modules: "commonjs"
    ['@babel/preset-env', { modules: false }]
]
```

