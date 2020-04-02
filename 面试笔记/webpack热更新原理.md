在启动 devServer 的时候，sockjs 在服务端和浏览器端建立了一个 webSocket 长连接，以便将 webpack 编译和打包的各个阶段状态告知浏览器，最关键的步骤还是 webpack-dev-server 调用 webpack api 监听 compile的 done 事件，当compile 完成后，webpack-dev-server通过 _sendStatus 方法将编译打包后的新模块 hash 值发送到浏览器端。

-----------------------------------------------------------------------------------------------------------------------------------------------------

![HMR原理](https://user-gold-cdn.xitu.io/2019/9/2/16cf203824359397?w=2088&h=1430&f=jpeg&s=302980)
右侧Server端使用webpack-dev-server去启动本地服务，内部实现主要使用了webpack、express、websocket。

 - 使用express启动本地服务，当浏览器访问资源时对此做响应。
- 服务端和客户端使用websocket实现长连接
- webpack监听源文件的变化，即当开发者保存文件时触发webpack的重新编译。

  - 每次编译都会生成hash值、已改动模块的json文件、已改动模块代码的js文件
  - 编译完成后通过socket向客户端推送当前编译的hash戳
- 客户端的websocket监听到有文件改动推送过来的hash戳，会和上一次对比

  - 一致则走缓存
  - 不一致则通过ajax和jsonp向服务端获取最新资源
- 使用内存文件系统去替换有修改的内容实现局部刷新

--------------------------------------------------------------------------------------------------------------------------------------------------

![HMR 工作流程图解](https://pic1.zhimg.com/80/v2-f7139f8763b996ebfa28486e160f6378_hd.jpg)

 首先要知道server端和client端都做了处理工作

1. 第一步，在 webpack 的 watch 模式下，文件系统中某一个文件发生修改，webpack 监听到文件变化，
  根据配置文件对模块重新编译打包，并将打包后的代码通过简单的 JavaScript 对象保存在内存中。
  
2. 第二步是 webpack-dev-server 和 webpack 之间的接口交互，而在这一步，主要是 dev-server 的中间件 webpack-dev-middleware 和 webpack 之间的交互，
  webpack-dev-middleware 调用 webpack 暴露的 API对代码变化进行监控，并且告诉 webpack，将代码打包到内存中。
  
3. 第三步是 webpack-dev-server 对文件变化的一个监控，这一步不同于第一步，并不是监控代码变化重新打包。
  当我们在配置文件中配置了devServer.watchContentBase 为 true 的时候，Server 会监听这些配置文件夹中静态文件的变化，
  变化后会通知浏览器端对应用进行 live reload。注意，这儿是浏览器刷新，和 HMR 是两个概念。
  
4. 第四步也是 webpack-dev-server 代码的工作，该步骤主要是通过 sockjs（webpack-dev-server 的依赖）在浏览器端和服务端之间建立一个 websocket 长连接，
  将 webpack 编译打包的各个阶段的状态信息告知浏览器端，同时也包括第三步中 Server 监听静态文件变化的信息。
  浏览器端根据这些 socket 消息进行不同的操作。当然服务端传递的最主要信息还是新模块的 hash 值，后面的步骤根据这一 hash 值来进行模块热替换。
  
5. webpack-dev-server/client 端并不能够请求更新的代码，也不会执行热更模块操作，而把这些工作又交回给了 webpack，
   webpack/hot/dev-server 的工作就是根据 webpack-dev-server/client 传给它的信息以及 dev-server 的配置决定是刷新浏览器呢还是进行模块热更新。
   当然如果仅仅是刷新浏览器，也就没有后面那些步骤了。
   
6. HotModuleReplacement.runtime 是客户端 HMR 的中枢，它接收到上一步传递给他的新模块的 hash 值，
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

4. webpack-dev-server不是一个插件，而是一个web服务器，所以不要想当然地将其引入

content-base 用于设定生成的文件所在目录
