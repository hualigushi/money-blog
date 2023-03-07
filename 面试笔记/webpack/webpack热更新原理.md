

![HMR 工作流程图解](https://pic1.zhimg.com/80/v2-f7139f8763b996ebfa28486e160f6378_hd.jpg)

 首先要知道server端和client端都做了处理工作

1. 第一步，在 webpack 的 watch 模式下，文件系统中某一个文件发生修改，webpack 监听到文件变化，
    根据配置文件对模块重新编译打包，并将打包后的代码通过简单的 JavaScript 对象保存在内存中。

  

2. 第二步是 `webpack-dev-server`和 webpack 之间的接口交互，而在这一步，主要是 dev-server 的中间件 `webpack-dev-middleware` 和 webpack 之间的交互，
     `webpack-dev-middleware` 调用 webpack 暴露的 API对代码变化进行监控，并且告诉 webpack，将代码打包到内存中。

     

3. 第三步是 `webpack-dev-server` 对文件变化的一个监控，这一步不同于第一步，并不是监控代码变化重新打包。
     当我们在配置文件中配置了`devServer.watchContentBase` 为 true 的时候，Server 会监听这些配置文件夹中静态文件的变化，

     变化后会通知浏览器端对应用进行 live reload。注意，这儿是浏览器刷新，和 HMR 是两个概念。

     

4. 第四步也是 webpack-dev-server 代码的工作，该步骤主要是通过 sockjs（webpack-dev-server 的依赖）在浏览器端和服务端之间建立一个 websocket 长连接，
     将 webpack 编译打包的各个阶段的状态信息告知浏览器端，同时也包括第三步中 Server 监听静态文件变化的信息。
     浏览器端根据这些 socket 消息进行不同的操作。当然服务端传递的最主要信息还是新模块的 hash 值，后面的步骤根据这一 hash 值来进行模块热替换

     

5. `webpack-dev-server/client` 端并不能够请求更新的代码，也不会执行热更模块操作，而把这些工作又交回给了 webpack，
   webpack/hot/dev-server 的工作就是根据 webpack-dev-server/client 传给它的信息以及 dev-server 的配置决定是刷新浏览器呢还是进行模块热更新。
   当然如果仅仅是刷新浏览器，也就没有后面那些步骤了。

   

6. `HotModuleReplacement.runtime` 是客户端 HMR 的中枢，它接收到上一步传递给他的新模块的 hash 值，
     它通过 JsonpMainTemplate.runtime 向 server 端发送 Ajax 请求，服务端返回一个 json，该 json 包含了所有要更新的模块的 hash 值，
       获取到更新列表后，该模块再次通过 jsonp 请求，获取到最新的模块代码。这就是上图中 7、8、9 步骤。

     

7. 而第 10 步是决定 HMR 成功与否的关键步骤，在该步骤中，HotModulePlugin 将会对新旧模块进行对比，决定是否更新模块，
     在决定更新模块后，检查模块之间的依赖关系，更新模块的同时更新模块间的依赖引用。

8. 最后一步，当 HMR 失败后，回退到 live reload 操作，也就是进行浏览器刷新来获取最新打包代码

-----------------------------------------------------------------------------------------------------------------------------------------


### webpack-dev-server原理及要点笔记

webpack-dev-server启动了一个使用express的Http服务器，这个服务器与客户端采用websocket通信协议，当原始文件发生改变，webpack-dev-server会实时编译。

这里注意两点:

1. webpack-dev-server伺服的是资源文件，不会对index.html的修改做出反应

2. webpack-dev-server生成的文件在内存中，因此不会呈现于目录中，生成路径由content-base指定，不会输出到output目录中。

3. 默认情况下: webpack-dev-server会在content-base路径下寻找index.html作为首页

4. webpack-dev-server不是一个插件，而是一个web服务器，所以不要想当然地将其引入content-base 用于设定生成的文件所在目录





## webpack 的热更新原理

其实是自己`开启了express应用`，添加了对webpack编译的监听，添加了和浏览器的websocket长连接，当文件变化触发webpack进行编译并完成后，`会通过sokcet消息告诉浏览器准备刷新`。

而为了减少刷新的代价，就是`不用刷新网页`，而是`刷新某个模块`，webpack-dev-server可以支持热更新，通过生成 文件的hash值来比对需要更新的模块，浏览器再进行热替换

### 服务端

- 启动 webpack-dev-server服务器
- 创建webpack实例
- 创建server服务器
- 添加webpack的done事件回调
- 编译完成向客户端发送消息
- 创建express应用app
- 设置文件系统为内存文件系统
- 添加 webpack-dev-middleware 中间件
- 中间件负责返回生成的文件
- 启动webpack编译
- 创建http服务器并启动服务
- 使用sockjs在浏览器端和服务端之间建立一个websocket长连接
- 创建socket服务器

### 客户端

- webpack-dev-server/client端会监听到此hash消息
- 客户端收到ok消息后会执行reloadApp方法进行更新
- 在reloadApp中会进行判断，是否支持热更新，如果支持的话发生 webpackHotUpdate事件，如果不支持就直接刷新浏览器
- 在 webpack/hot/dev-server.js 会监听 webpackHotUpdate 事件
- 在check方法里会调用module.hot.check方法
- HotModuleReplacement.runtime请求Manifest
- 通过调用 JsonpMainTemplate.runtime 的 hotDownloadManifest方法
- 调用JsonpMainTemplate.runtime的hotDownloadUpdateChunk方法通过JSONP请求获取最新的模块代码
- 补丁js取回来或会调用 JsonpMainTemplate.runtime.js 的 webpackHotUpdate 方法
- 然后会调用 HotModuleReplacement.runtime.js 的 hotAddUpdateChunk方法动态更新 模块代码
- 然后调用hotApply方法进行热更新

