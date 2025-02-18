## 前言

> ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/807ee34bf2ce4b369941b0f89c821180~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

> *原文链接：* [*https://umijs.org/docs/introduce/philosophy#import-all-from-umi*](https://umijs.org/docs/introduce/philosophy#import-all-from-umi "https://umijs.org/docs/introduce/philosophy#import-all-from-umi")

从这段话中我们发现了一个有趣的功能 `import all from 'umi'`，简单说就是所有能力都从 `umi` 中去 `import` 获取，Umi 还支持通过插件扩展 `import all from 'umi'` 的能力。

## 源码分析

### 从 demo 说起

我们先从一个一般性的使用案例着手分析，这里以 `$ pnpm dlx create-umi@latest` 创建的一个新 Umi 项目为例：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/68ddc974fd0e461bbde2010f3eff04cc~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

可以看到，在页面中是直接通过 `import { useModel } from '@umijs/max'` 来使用 `useModel` 方法的。

由此顺藤摸瓜，我们直接到 `/examples/with-use-model/node_modules/@umijs/max/index.js` 下的 `@umijs/max` 看下是否有导出 `useModel` 方法：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87d75a9c8a9a4bfaac2de06fbba271a1~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

`@umijs/max` 导出的其实是 `umi` 包的全部方法，那么继续在 `node_modules` 中看下 `umi` 的代码，其入口在 `/examples/with-use-model/node_modules/.pnpm/node_modules/dist/index.js` 中：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1ef2466a62b04ecbb5f6bae7b7129c58~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

由此看出，其实 `umi` 包也没有实际导出 `useModel` 方法。

### `webpack` 构建时

按照 Umi 官方的说法，`@umijs/max` 是一个[插件集](https://umijs.org/docs/max/introduce "https://umijs.org/docs/max/introduce")，`@umijs/max` 内置了[数据流管理插件](https://github.com/umijs/umi/blob/master/packages/plugins/src/model.ts "https://github.com/umijs/umi/blob/master/packages/plugins/src/model.ts")，那么 `useModel` 一定是由插件注入的，`.umirc.ts` 配置文件也证实了这点：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/40070cf529424fd8b9a6c03858a2587c~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

但由于我们的主题并不是研究 Umi 插件本身，所以在这里我们不过多去纠结 Umi 插件实现原理，而专注于分析 Umi 插件是如何搞定 `webpack` 构建时并以此来支持通过插件扩展 `import from 'umi'` 的能力的。

#### `alias`

这个时候我们需要翻看下`@umijs/max` 的源码，在 `/packages/max/src/plugins/maxAlias.ts` 文件中，`@umijs/max` 基于 [Umi 插件协议](https://umijs.org/docs/guides/plugins "https://umijs.org/docs/guides/plugins")修改了 `webpack` 配置，配置了 `alias` 别名 `@@/exports` ：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7482a9d15c5f4114975acbd006d18179~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

那么 `@@/eports` 的物理文件究竟又指向哪里呢？我们可以在 `/packages/preset-umi/src/features/configPlugins/configPlugins.ts` 中找到答案：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf2e60906a2948628a600bace4e4976e~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

也就是说，实际上 `@umijs/max` 或 `@@/exports` 最后都是指向的同一个物理文件，即 `/examples/with-use-model/src/.umi/exports`：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3ac4bacfa5cc4277b921e4db2d892725~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

#### 模板

众所周知，Umi 项目中 `.umi` 目录下存放的是临时文件，那么这个 `/.umi/exports` 临时文件又是如何生成的呢？答案在 `packages/preset-umi/src/features/tmpFiles/tmpFiles.ts` 中：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2259299ced744e63b01896e158069e19~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

这里向插件 [register](https://umijs.org/docs/guides/plugins#register--registermethod-%E4%BB%A5%E5%8F%8A-applyplugins "https://umijs.org/docs/guides/plugins#register--registermethod-%E4%BB%A5%E5%8F%8A-applyplugins") 了一个临时文件的生产方法 `hooks` 供 `applyPlugins` 使用，在项目 `dev` 或 `build` 的时候就会生成 `/.umi/exports` 文件。

以上，便是 Umi 实现 "import all from '@umijs/max' " 的全过程。

综上，`umi` 的实现思路大体是类似的：

+   首先，定义了构建时插件机制，让插件能拓展 `import all from 'xxx'` 的能力。
+   其次，通过临时文件(`.umi`)或临时依赖(`.vitekit-package`) 的方式，把各个插件拓展的能力收集在一个文件或者包中，统一导出，供业务中统一使用。
+   最后，通过 `alias` 别名或者 `node_modules` 依赖的方式，实际暴露 `import all from 'xxx'` 的能力。

## 手写实践

本着 `talk is cheap, show me the code` 的原则，我们参考 `umi` 的思路，尝试来写一个极简的 demo，并以此完成本次学习之旅。

第一步，编写一个生成一个临时文件 `exports` 的函数：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/877b801cf0334dacbeaa655f12bf5b87~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

第二步，修改 `webpack` 配置，配置 `alias` 别名：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ee22aad6ad55492aabf7a674cd9920c2~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

第三步，准备好测试 `demo`。这里我们以一个简单输出 `hello world` 的函数为例，并在页面中引用这个函数：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/83d8e7080938414bb6c8ec3fcdb0d24d~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5f75676c45bb4e39b71e17489b8e7961~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

最后，执行 `pnpm start` 启动项目，可以看到最后生成的临时文件：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/af669cd657c844bbb89776d9bd68c1e5~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

同时去检查下页面展现和控制台输出，与预期相符：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8ae42a39585144c2b387638d58ce338e~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)
