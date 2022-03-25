[TOC]

## 介绍

**craco** 全称 **Create React App Configuration Override**，取首字母即组成了工具名称。

是为了无 **eject** 、可配置式的去修改 **CRA** 默认提供的工程配置，

这样既能享受 **CRA** 带来的便利和后续升级，也能自己去自定义打包配置完成项目需要，一举两得。



## 开始使用

### 安装

**craco** 的安装过程如下:

```
$ yarn add @craco/craco

# OR

$ npm install @craco/craco --save
```

### 配置及改造

在项目的根目录配置加一个 **craco.config.js** 的配置文件(也可以是 **.cracorc.js** 、**.cracorc**，[cosmiconfig](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fdavidtheclark%2Fcosmiconfig) 了解一下）。

第一步，导出一个默认配置:

```
module.exports = {}
```

常用配置查看链接：**[craco Configuration](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fgsoft-inc%2Fcraco%2Fblob%2Fmaster%2Fpackages%2Fcraco%2FREADME.md)**

第二步，修改 **package.json** 中的启动命令:

```
/* 将 react-scripts 全部替换为 craco */
"scripts": {
   "start": "craco start", // 原本是 "react-scripts start"
   "build": "craco build", // 原本是 "react-scripts build"
   "test": "craco test"    // 原本是 "react-scripts test"
}
```

## 项目使用

### 项目背景

因为出于开发/业务等需要，需要对 **webpack** 进行以下配置：

1. 支持 **less**、**less module**；
2. 支持 **babel-plugin-import** 插件去做 antd 的动态引入；
3. 支持 **circular-dependency-plugin** 插件，去做循环引用的判断；
4. 支持 **webpack** 自带的 **DefinePlugin** 去做变量注入；
5. 支持 **antd-dayjs-webpack-plugin** 将 **antd** 的 **moment** 替换为 **dayjs**
6. 支持 **speed-measure-webpack-plugin** 、**webpack-bundle-analyzer** 等插件做打包统计；
7. 支持 **webpack-aliyun-oss** 插件将打包的静态资源地址上传到OSS；
8. 支持 **react-dev-inspector** 工具的 **babel** 插件，做到开发环境的快速开发文件资源定位；
9. and so on...

基于以上几点需求，将 **craco.config.js** 改造成如下：

```js
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

// 初始化webpack配置实例
// 配置参考：https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#configuration-file
const webpackConfig = {
  alias: {},
  plugins: {
    // antd 使用dayjs替换 moment 的插件
    add: [new AntdDayjsWebpackPlugin()] /* An array of plugins */,
    remove: [] /* An array of plugin constructor's names (i.e. "StyleLintPlugin", "ESLintWebpackPlugin" ) */,
  },
}

module.exports = {
	webpack: webpackConfig,
  babel: {
    plugins: [
      // antd 的按需加载
      [
        'import',
        {
          libraryName: 'antd',
          libraryDirectory: 'lib',
          style: true,
        },
      ],
    ],
  },
  devServer: {
    quiet: false,
    stats: {
      timings: true,
      colors: true,
      performance: true,
      overlay: true,
    },
    noInfo: false,
  }
};
```

### 遇到的问题

#### 支持 less 以及 less module

好嘛，问题来了，**CRA** 是不支持 **less** 的，怎么要 **CRA** 通过 **craco** 支持 **less**嘞？

其实社区提供了许多的craco的插件: **[Community Maintained Plugins](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fgsoft-inc%2Fcraco%23community-maintained-plugins)**

使用 **craco-less** 解决 **less** 使用问题，但是 **less module** 问题就来了，社区似乎没有解决方案，也可能是我没找到。

**CRA** 自己本身是支持 **sass module** 的，***.module.sass** 命名就行了，但是 **less module** 要咋整？看看 **craco-less** 是怎么支持 **less** 的吧。

好家伙，直接照着 **CRA** 内部的 **sass** 配置，改改正则匹配搞一份 **less** 的！这套路我熟啊，作为前端造轮子大军的吊车尾，自己魔改一个 **craco-less-module** 问题不大！

重新用 **CRA** 创建了一个临时项目，跑 **yarn eject** **eject** 一份 **CRA** 的 **webpack** 配置看看，发现 **sass** 和 **sass module** 的两个配置及其相似。再看看 **craco-less** 的源码，魔改一份 so easy！参照：**[less-module-plugin](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2FSaberWang8023%2Fcustomize-cra-extensions%2Fblob%2Fmaster%2Fsrc%2Fcraco%2Fless-module-plugin.js)**。

#### 复用之前 custom-cra-extensions 包

解决了 **less module** 的问题，回到了一些插件编写上的问题，最早在 **custom-cra** 的时候，我封装过基于 **circular-dependency-plugin** 、 **DefinePlugin** 、 **speed-measure-webpack-plugin** 、**webpack-bundle-analyzer** 等插件的 **custom-cra** 扩展版本：**[customize-cra-extensions](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2FSaberWang8023%2Fcustomize-cra-extensions)**。本质上是接收一个函数配置，返回一个以 **webpackConfig** 为参数的闭包函数，样例如下：

```js
/**
 * 往 ‘DefinePlugin’ 上定义内容
 * @param {Object} value 要添加的env变量对象
 */
export const addDefinitionsEnvValue = (value) => (config) => {
  const plugin = getWebpackPlugin(config.plugins, 'DefinePlugin');
  if (plugin) {
    const processEnv = plugin.definitions['process.env'] || {};
    plugin.definitions['process.env'] = {
      ...processEnv,
      ...value,
    };
  }
  return config;
};
```

那有没有办法能让 **craco** 也复用这个包呢？翻翻 **craco** 的 **webpack** 节点的配置吧：

```js
webpack: {
    alias: {},
    plugins: {
        add: [], /* An array of plugins */ 
        remove: [],  /* An array of plugin constructor's names (i.e. "StyleLintPlugin", "ESLintWebpackPlugin" ) */ 
    },
    configure: { /* Any webpack configuration options: https://webpack.js.org/configuration */ },
    configure: (webpackConfig, { env, paths }) => { return webpackConfig; }
},
```

webpack.configure 也支持函数式调用方式，并且第一个参数也是 webpackConfig，这不就来了嘛，只要能有一个链式调用的方法，那 **webpack.configure** 也能用之前也的包了！那要怎么才能有一个链式调用呢？最早 **react-app-rewired** 是借助了 **customize-cra** 用一个 **override** 函数实现的，我能不能把那边的 **override** 函数也搬过来呢，翻翻源码：

```js
const flow = require('lodash/flow');

module.exports = (...plugins) => flow(...plugins.filter((f) => f));
```

哦了，两行代码搞定一个 **override** 函数，本质就是借助了 **loadash** 的 **flow** 方法。

既然都要用 **customize-cra** 的 **override** 函数了，似乎在 **craco** 的基础上复用 **customize-cra** 是可行的。

那接下来的解决方案就成了下面的样子。

### 解决方案

改造一下 webpackConfig 的 configure 节的位置吧：

```js
const { override, fixBabelImports, addBundleVisualizer } = require('customize-cra');

// @indata/custom-cra-extensions 是发布在内部npm的包名，
// 与 https://github.com/SaberWang8023/customize-cra-extensions 内容几乎相同
const {
  LessModulePlugin,
  addReactInspectorPlugin,
  addWebpackAliyunOssPlugin,
  addSpeedMeasurePlugin,
  addDefinitionsEnvValue,
  addCircularDependencyPlugin,
  addZipFilesWebpack,
} = require('@indata/custom-cra-extensions'); 

const CracoLessPlugin = require('craco-less');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

// 初始化webpack配置实例
// 配置参考：https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#configuration-file
const webpackConfig = {
  alias: {},
  plugins: {
    // antd 使用dayjs替换 moment 的插件
    add: [new AntdDayjsWebpackPlugin()] /* An array of plugins */,
    remove: [] /* An array of plugin constructor's names (i.e. "StyleLintPlugin", "ESLintWebpackPlugin" ) */,
  },
  configure: override(
    // 循环依赖检测
    addCircularDependencyPlugin(),
    // 入住环境变量到系统内的插件
    addDefinitionsEnvValue({ API_ENV: JSON.stringify(process.env.API_ENV) }),
    // 阿里云OSS上传插件
    addWebpackAliyunOssPlugin(),
    // react 调试插件
    addReactInspectorPlugin(),
    // 分析打包插件，启动命令后加 --analyze 就生效
    addBundleVisualizer({}, true),
    // 分析打包时长插件，启动命令后加 --analyze 就生效
    addSpeedMeasurePlugin({}, true),
    // 打包压缩成 html.tar.gz 压缩包，用于CI
    addZipFilesWebpack(),
    // antd按需加载 - 无须在入口文件【import antd/dist/antd.css】
    fixBabelImports('antd', {
      libraryDirectory: 'es',
      style: true, // 为 true 为使用 less
    }),
  ),
};

module.exports = {
  webpack: webpackConfig,
  babel: {
    plugins: [],
  },
  devServer: {
    quiet: false,
    stats: {
      timings: true,
      colors: true,
      performance: true,
      overlay: true,
    },
    noInfo: false,
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#0364FF', // 全局主色
              '@heading-color': 'rgba(10, 15, 44, 1)', // 标题色
              '@text-color': 'rgba(10, 15, 44, 0.85)', // 主文本色
              '@text-color-secondary': 'rgba(10, 15, 44, 0.65)', // 次文本色
              '@disabled-color': 'rgba(10, 15, 44, 0.25)', // 失效色
              '@border-color-base': '#DBDBE0', // 边框色
            },
            javascriptEnabled: true,
          },
        },
      },
    },
    {
      plugin: LessModulePlugin,
    },
  ],
};
```

完美，perfect!

## 总结

其实 **craco** 相比于 **react-app-rewired** + **customize-cra** ，本质上都是为了以低入侵式的配置方式，不 **eject** 从而达到配置 **CRA** 的能力。**craco** 的配置形式更加灵活多变，有 **craco** 层面的插件，有单独配置 **webpack** 的配置节点，还有配置 **babel**，**style** 等等的配置节点，配置形式有对象跟函数，但是万变不离其宗，只要掌握了 **webpack** 的配置，对 **webpackConfig** 函数式配置的要点，两者在使用层面其实相差并不大～

