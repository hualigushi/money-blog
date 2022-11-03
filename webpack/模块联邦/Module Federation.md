[TOC]

# MF是什么

Module Federation，中文翻译为`"模块联邦"`，是 webpack5 中的一个号称 `改变JavaScript架构的游戏规则`的功能。其文档中定义的使用目的为：

> 多个独立的构建可以形成一个应用程序。这些独立的构建不会相互依赖，因此可以单独开发和部署它们。这通常被称为微前端，但并不仅限于此。

简单说，MF 实际上就是可以把多个无单独依赖的、单独部署的应用合为一个。或者说不止是应用，MF 支持的粒度更细。它可以把多个模块、多个npm包合为一个。



# MF 的特点

1. 支持在项目中直接导出某个模块，直接单独打包。

目前，我们在跨项目/跨团队项目间复用时，主要用的方式还是以导出 npm包 为主，而npm包的抽离、发布、维护都需要一定的成本。而且当多个项目依赖同一个npm包时，若npm有升级，则所有依赖项目都要相应更新，然后重新发布。而且往往你在写某个逻辑的时候，可能并没有预想到后来有复用的可能，那么这个时候抽成npm包来复用还是比较麻烦的。

而 MF 模块是可以在项目中直接导出某个模块，单独打包的，如下图： ![GitHub](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0cfa149b31574b5385d39ca3b8ed3538~tplv-k3u1fbpfcp-zoom-1.image) 这样就很灵活，在复用逻辑的时候可以做到尽可能对现有项目少改造，快速导出。



2. 支持运行时加载，可以减少打包时的代码体积，使用起来和在同一个项目下无区别

![GitHub](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c3ec0a9af342493f8223c340c89c4c26~tplv-k3u1fbpfcp-zoom-1.image) 



因为拆分打包，所以有了更小的加载体积，而且当前子系统已经下载的chunk可以被共享，如果可以复用，下一个子系统将不会再次下载。这也就具备了可以在项目运行时同步更新不同项目间的同一模块逻辑依赖且节约了代码构建成本，维护成本等。

1. 相比过去， externals 无法多版本共存，dll 无法共享模块，MF 完美解决。
2. 借助运行时动态加载模块的特性，可以做到更好的A/B test
3. MF 可以和服务端渲染结合使用，也与 CDN 的边缘计算契合的很好，畅想一下，它还能结合 serverless 做按需编译的加载。



# MF的缺点

1. 对环境要求略高，需要使用webpack5，旧项目改造成本大。
2. 对代码封闭性高的项目，依旧需要做npm那一套管理和额外的拉取代码，还不如npm复用方便。
3. 拆分粒度需要权衡,虽然能做到依赖共享，但是被共享的lib不能做tree-shaking，也就是说如果共享了一个lodash，那么整个lodash库都会被打包到shared-chunk中。虽然依赖共享能解决传统微前端的externals的版本一致性问题。
4. webpack为了支持加载remote模块对runtime做了大量改造，在运行时要做的事情也因此陡然增加，可能会对我们页面的运行时性能造成负面影响。
5. 运行时共享也是一把双刃剑，如何去做版本控制以及控制共享模块的影响是需要去考虑的问题。
6. 远程模块 typing 的问题。



# 项目中如何使用Module Federation？

使用Module Federation前，先明确一下本地模块与远程模块的概念：

1. 本地模块是普通模块，它们是当前应用的一部分；远程模块不存在于当前应用，是在运行时从其他地方引用的模块。
2. 本地模块与远程模块是相对的，一个模块既可以是本地模块也可以是远程模块（可以引用别的模块也可以被其他模块引用）。

### ModuleFederationPlugin插件

在原有项目引入webpack5自带ModuleFederationPlugin的插件，修改配置项即可，无需做其他操作。

1. ModuleFederationPlugin插件引用

```js
const {ModuleFederationPlugin} = require("webpack").container;
```

2. ModuleFederationPlugin插件配置项

```js
module.exports = { 
    ...
    plugins: [
        new ModuleFederationPlugin({
        
            // 作为远程模块时必须提供的配置项
            name: 'remote', //当前应用的别名，被其他模块引用时作为模块名称
            filename: 'remoteEntry.js', //作为远程模块，被其他模块引用的入口文件名。
            exposes: { //提供给其他模块使用的组件，key为在其他模块引入时的相对路径
                "./About": "./src/views/About.js", 
            },
            // 作为远程模块时可选配置项
            library: { // 定义如何将输出内容暴露给应用。
                type: 'var', //暴露变量的方式，常用 var、window，默认为 var。
                name: 'remote' //暴露给外部应用的变量名
            },
            
            // 作为本地模块时必须提供的配置项
            remotes: { //加载其他远程模块的入口文件
                remote: "remote@http://localhost:8001/remoteEntry.js",
            },
            
            // 作为本地模块和远程模块共用的可选配置项
            shared: {
                'vue': {
                    import: 'false', //false｜string，
                    singleton: false, 
                    // 是否开启单例模式。
                    // 默认不开启，当前模块的依赖版本与其他模块共享的依赖版本不一致时，分别加载各自的依赖；
                    //开启后，加载的依赖的版本为共享版本中较高的。（本地模块不开启，远程模块开启，只加载本地模块，远程模块即使版本更高，也不加载。）
                    
                    version: '3.2.6', //指定共享依赖的版本
                    requiredVersion: '3.2.6', //指定当前模块需要的版本，默认值为当前应用的依赖版本
                    strictVersion: 'false', //是否需要严格的版本控制。如果开启，单例模式下，strictVersion与实际应用的依赖的版本不一致时，会抛出异常。
                    packageName: 'string', //用于从描述文件中确定所需版本的包名称。仅当无法从请求中自动确定包名称时才需要这样做。
                    sharedKey: 'string', //共享依赖的别名, 默认值 shared 配置项的 key 值.
                    shareScope: 'default' //当前共享依赖的作用域名称，默认为 default
                    eager: false, //共享依赖在打包过程中是否被分离为单独文件，默认分离打包。如果为true，共享依赖会打包到入口文件，不会分离出来，失去了共享的意义。
                }
            },
            
        })

    ]
}
```

### 一个简单的例子

1. 远程应用模块设置

```js
plugins: [
    new ModuleFederationPlugin({
        name: "remote",
        filename: "remoteEntry.js",
        exposes: { //提供了Button和About两个组件
            "./Button": "./src/components/Button.js",
            "./About": "./src/views/About.js",
        },
    }),
],
```

2. 本地应用模块设置

```js
plugins: [
    new ModuleFederationPlugin({
        remotes: {
            remote: "remote@http://localhost:8002/remoteEntry.js", //生产环境替换成真实的URL地址
        },
    }),
],
```

3. 在本地应用引入远程模块的组件

```js
const About = () => import("remote/About");
const routes = [
    ...
    {
        path: '/about',
        name: 'About',
        component: About
    },
]
```

以上就是使用ModuleFederationPlugin的全部操作，就是这么简单。



# ModuleFederationPlugin的工作原理

### 1. 远程模块组件的加载

使用上面的配置，启动本地环境，页面加载了远程模块的About组件（8000端口是本地模块服务，8002端口是远程模块服务）。

我们可以发现，远程模块一共有3个js文件被加载了，他们分别是：

- remoteEntry.js：远程模块的入口文件
- node_modules_vue_dist_vue_runtime_esm-bundler_js.js：远程模块的依赖文件
- src_views_About_vue.js：远程模块的About组件文件

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/647ac4ff67334d0aa40023100a814d95~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

如果你留意本地模块的配置，可以发现：本地模块只是引用了远程模块的入口文件remoteEntry.js。那么，远程模块的依赖文件和远程模块的组件文件是何如加载的呢？

首先，我们看看作为远程模块时，会打包出那些文件：

1. 入口文件remoteEntry.js
2. 依赖文件
3. 若干组件文件（每个组件都会单独被打包）

入口文件remoteEntry.js在本地项目运行时就会同步加载，它记录了每个远程模块组件的name与资源地址（依赖和组件本身都记录）的映射关系，当在本地模块使用到某个远程组件时，就会异步加载所需要的资源。所以，依赖文件和组件文件，都是通过入口文件异步加载的。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/afe633290308488888837a68c0a0c845~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

### 2. 依赖共享的实现

#### 依赖共享配置

在ModuleFederationPlugin配置项里添加需要共享的依赖信息

本地模块配置

```js
new ModuleFederationPlugin({
    remotes: {
        remote: "remote@http://localhost:8002/remoteEntry.js",
    },
    shared: {
        vue: {
            version: '3.2.5',
            singleton: true
        },
    },
}),
```

远程模块配置

```js
plugins: [
    new ModuleFederationPlugin({
        name: "remote",
        filename: "remoteEntry.js",
        exposes: { //提供了Button和About两个组件
            "./Button": "./src/components/Button.js",
            "./About": "./src/views/About.js",
        },
        shared: {
            vue: {
                version: '3.2.0',
                singleton: true
            },
        },
    }),
],
```

重启服务，可以看到，远程模块的依赖文件没有被加载了。而是使用本地模块的依赖文件（本地的依赖文件版本更高；如果是远程模块的依赖版本更高，则加载的是远程模块依赖，本地模块依赖不加载）。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f7f44deadf8a43f5a7ecba9d02fcc72d~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

#### 依赖共享原理

当模块都配置了共享信息，每个依赖都会单独打包成一个文件。

- 远程模块的入口文件会记录共享的依赖的版本信息以及依赖加载规则。
- 本地模块加载远程模块的入口文件后，会根据共享规则，选择加载哪个版本的依赖文件。 被共享的依赖文件通过这种异步加载的方式，避免了多个模块之间重复加载各自依赖的情况。






### [ExternalTemplateRemotesPlugin](https://link.juejin.cn?target=https%3A%2F%2Fgist.github.com%2Fmatthewma7%2F915b28846ad99d582e6b4ddea6dfc309)

有需求在构建中使用上下文处理处理动态 Url 的，且需要解决缓存失效问题的，可以看一下这个插件。

> from [github.com/module-fede…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fmodule-federation%2Fmodule-federation-examples%2Fissues%2F566)
>
> - Dynamic URL, have the ability to define the URL at runtime instead of hard code at build time.
> - Cache invalidation.

```javascript
// from webpack.config
plugins: [
    new ModuleFederationPlugin({
        //...config
        remotes: {
          'my-remote-1': 'my-remote-1@[window.remote-1-domain]/remoteEntry.js?[getRandomString()]',
        },
    }),
    new ExternalTemplateRemotesPlugin(), //no parameter,
]
```

## 



