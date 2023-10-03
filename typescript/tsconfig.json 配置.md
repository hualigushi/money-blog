[TOC]

![图片](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHSJlmgLXRLdQib1icTSBlS7TaIvJb8UZjukBh8G4KxalnFOFPjQfLnrxTogoPtzzQFp01nG9KoicEmHg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

# 一、前置知识 💡

## 1.1 TypeScript 是什么？

**TypeScript** 是一种基于 **JavaScript** 的**强类型编程语言**，它使得在前端项目开发过程中更加严谨且流畅，一定程度上保证了大型前端项目程序的健壮性。

> - TypeScript 是由微软开发的一款开源的编程语言；
> - TypeScript 是 JavaScript 的超集，遵循最新的 ESM 规范，TypeScript 扩展了 JavaScript 的语法；
> - TypeScript 更像后端 JAVA、C# 这样的面向对象语言，可以让 JS 开发大型企业级项目。

但是 **TypeScript** 并不可以直接运行，而是需要转换成 **JavaScript** 代码才可以在 Node.js 或浏览器环境下执行，因此我们需要通过“编译器”将 TS 代码转换为 JS 代码。

## 1.2 什么是 tsc ？

**tsc** 的全称是 `TypeScript Compiler`，也就是将 TypeScript 转码为 JavaScript 代码的编译器。

**tsc** 的全局安装方式：

```shell
npm install typescript -g
```

当我们编译一份 `index.ts` 文件时，会使用下面的命令：

```shell
tsc ./index.ts
```

这样就可以得到一份编译成为 JavaScript 代码的 `./index.js` 文件。

**tsc** 实际就是将 TS 转为 JS 的编译（器）脚手架工具，如果是一个 TS 的前端工程项目，那么就可以通过项目中的 `tsconfig.json` 文件来自定义配置 TS 编译相关规则。

项目中的 `tsconfig.json` 文件，我们一般会通过如下快捷命令生成：

```shell
tsc --init
```

执行完后，会在项目根目录生成一个简单的初始化 `tsconfig.json` 配置描述文件，如果没有特别的要求，该初始化配置就足以支持你愉快地使用 TS 开发啦！

更多相关 TS 编译配置和使用说明可以通过 `tsc -h` 查看。

## 1.3 tsconfig.json 文件

[**tsconfig.json**](*https://www.typescriptlang.org/docs/handbook/tsconfig-json.html*) 文件是用于描述将 **TypeScript** 转为 **JavaScript** 代码的配置文件。

IDE（代码编辑器）将会根据 `tsconfig.json` 文件来对当前项目中支持不同程度的类型约束，同时也是对 TSC 编译 TypeScript 代码过程做一些预定义、约束入口和编译输出目录等配置。

因此对于一个支持 TypeScript 编程语言的工程来说，`tsconfig.json` 文件就是编码的基础。

# 二、tsconfig.json 配置详解 ⚙️

有了上面的前置知识作为基石，相信大家会对 `tsconfig.json` 文件的配置项也会更加容易理解。

- tsconfig 的详细配置：https://www.typescriptlang.org/tsconfig
- tsconfig 的协议描述网址：http://json.schemastore.org/tsconfig

![图片](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHSJlmgLXRLdQib1icTSBlS7TaSTU3iarXelN7f1Sm3A4ib8wibZgDbNENN8SAxQjTKy9Xk6ibAJxUA2WS0Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

## 2.1 files

`files` 字段用于指明需要 tsc 编译的一个或多个 ts 文件，例如：

```json
{
  "files": ["index.ts", "global.d.ts"],
}
```

当指定的文件或文件夹不存在时，会提示 ❌ 错误！

## 2.2 include

`include` 字段用于指明需要被 tsc 编译的文件或文件夹列表，例如：

```json
{
  "include": [
    "src",
    "global.d.ts"
  ],
}
```

## 2.3 exclude

`exclude` 字段用于排除不需要 tsc 编译的文件或文件夹列表，例如：

```json
{
  "exclude": ["test.ts", "src/test.ts"],
}
```

**注意：** `exclude` 字段中的声明只对 `include` 字段有排除效果，对 `files` 字段无影响，即与 `include` 字段中的值互斥。

如果 tsconfig.json 文件中 `files` 和 `include` 字段都不存在，则默认包含 tsconfig.json 文件所在目录及子目录的所有文件，且排除在 `exclude` 字段中声明的文件或文件夹。

## 2.4 compileOnSave

`compileOnSave` 是声明是否需要在保存时候自动触发 tsc 编译的字段，一般来说，我们的代码编译过程会通过 Rollup、Webpack 等打包构建工具，并且使用热更新，因此无需配置该项，保持缺省即可。

```json
{
  "compileOnSave": false,
}
```

## 2.5 extends

`extends` 字段用于指明**继承**已有的 tsconfig 配置规则文件。

该字段可以说是非常有用了，因为我们的 tsconfig 配置其实各个项目之间大同小异，因此完全可以结合自己团队的情况，抽离一个基础且公共的 tsconfig 配置，并将其发包，然后作为 `extends` 字段的值来继承配置。

tsconfig 推荐默认配置可以参考官方的包：[**@tsconfig/recommended**](*https://www.npmjs.com/package/@tsconfig/recommended*)

`@tsconfig/recommended` 的配置如下：

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Recommended"
}
```

例如继承一个发包后的 tsconfig 基础配置，并通过显示声明编译的目标代码版本为 `ES2016` 来覆盖覆盖 `@tsconfig/recommended` 中对应配置项。

```json
{
  "extends": "@tsconfig/recommended/tsconfig.json",
  "compilerOptions": {
    "target": "ES2016"
  }
}
```

作为一些实践经验，社区也提供了一些常见环境（例如：Nuxt、Vite、Node 等）最佳实践后的基础配置，推荐参阅：[**https://github.com/tsconfig/bases/**](https://github.com/tsconfig/bases/)

## 2.6 compilerOptions

`compilerOptions` 是一个描述 TypeScript 编译器功能的“大”字段，其值类型是“对象”，因此包含了很多用于描述编译器功能的**子字段**，其子字段的功能如下：

### (1). target

`target` 字段指明经过 TSC 编译后的 ECMAScript 代码语法版本，根据 ECMAScript 语法标准，默认值为 `ES3`。

TypeScript 是 JavaScript 的超集，是对 JavaScript 语法和类型上的扩展，因此我们可以使用 ES5、ES6，甚至是最新的 **ESNext** 语法来编写 TS。例如当我们使用 ES2021 语法来编码 TS 文件，同时配置如下：

```json
{
  "compilerOptions": {
    "target": "ES5",
  }
}
```

则会将对应使用了最新 ECMAScript 语法的 TS 文件编译为符合 ES5 语法规范的 `*.js` 文件。

延伸一下知识点，思考一下 tsc 是如何将高版本（ECMAScript 规范）代码向低版本代码转换的？这个转换的结果靠谱吗？与 Babel 有何差异？

![图片](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHSJlmgLXRLdQib1icTSBlS7Tas6TtHISQh3WXgZLue5slH4BLbHHx8iapztWXmOuXoOjVDDW2cxcr3Gw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)一图看 ECMAScript 各版本功能差异



通过一个实验，在 `src/index.ts` 文件中使用了 Map、Async/Await、Promise、扩展运算符，并在 `tsconfig.jon` -> `target` 设置为 `ES5`：

![图片](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHSJlmgLXRLdQib1icTSBlS7TaPRqN9Y8hsVUib9tM1Sq5z3TEuOXbSK4LYUQkrSLjWvUv2KD9326QAag/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)验证 target 降级处理

然后发现在右侧的 `dist/index.js` 文件中，依然存在 `new Map()` 、Promise 语法，因此可以得出结论：**tsc 的代码降级编译并不能完全处理兼容性**。

通过官方文档了解到：

![图片](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHSJlmgLXRLdQib1icTSBlS7TaeE1ps0aIFhk3XAv9ibHDLrvZvRMxlVQY5wblHkSgVfHC73fiak9icKQUQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

这里提到了 `lib` 字段，意思是 `target` 不同的值会有对应默认的 `lib` 字段值，当然也支持开发者显示指明 `lib` 字段的值，那么接下来看看 `lib` 是干嘛的吧！

### (2). lib

`lib` 字段是用于为了在我们的代码中显示的指明需要支持的 **ECMAScript** 语法或环境对应的类型声明文件。

例如我们的代码会使用到浏览器中的一些对象 `window`、`document`，这些全局对象 API 对于 **TypeScript Complier** 来说是不能识别的：

![图片](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHSJlmgLXRLdQib1icTSBlS7Ta6dst1Ygp5DdmXibwvglLfLhcklYcTXDvuxryQzp8PAE65neic5nnNELg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)lib 未显示引入 DOM 会提示类型错误

因而需要在 `lib` 字段中如下配置：

```json
{
  "compilerOptions": {
    "target": "ES5",
    "lib": ["ES5", "ES6", "DOM"],
  }
}
```

来显式引入在 **DOM** 即浏览器环境下的一些默认类型定义，即可在代码中使用，`window`、`document` 等浏览器环境中的对象，TS 在运行时以及编译时就不会报类型错误。

![图片](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHSJlmgLXRLdQib1icTSBlS7Tak3icmDRpjcicODrrPUDoSWcd1yzB76hDYF9sPOTYkGq7mk7zEWE6ArMQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)引入类型定义后无错误提示

综合 `target` 和 `lib` 字段的实际功能表现，我们可以得出**结论**：

TSC 的编译结果只有部分特性做了 pollyfill 处理，**ES6** 的一些特性仍然被保留，想要支持完全的降级到 ES5 还是需要额外引入 pollyfill（也就是我们在项目的入口文件处 `import 'core-js'`），但建议是将 `target` 字段值设置为 `ES6`，提升 TSC 的速度。

因此，笔者对于使用 TSC 编译的观点是：

**不应该将 `TSC` 作为编译项目的工具，应该将 `TSC` 作为类型检查工具，代码编译的工作尽量交给 `Rollup`、`Webpack` 或 `Babel` 等打包工具!**

另外推荐阅读《[为什么说用 babel 编译 typescript 是更好的选择](https://mp.weixin.qq.com/s?__biz=Mzg3OTYzMDkzMg==&mid=2247484704&idx=1&sn=a8e8204610eb4be92b3e52f916923ddf&scene=21#wechat_redirect)》

### (3). module

`module` 字段指明 tsc 编译后的代码应该符合何种“模块化方案”，可以指定的枚举值有：`none`, `commonjs`, `amd`, `system`, `umd`, `es2015`, `es2020`, 或 `ESNext`，默认值为 `none`。

在如今的前端开发趋势来讲，主要是使用 ESM、CommonJS、UMD、IIFE 四种模块化方案，未来会趋向于 ESM，当然我们会根据项目的应用场景来决定使用何种模块化方案，例如：NodeJS 使用 CommonJS，浏览器里可以使用 ESM，不过现在的打包工具，会自动处理 CommonJS 和 ESM 的差异，并包装成符合指定模块化规范的代码，

在 tsconfig.json 可以设置 `allowSyntheticDefaultImports` 字段为 `true`，来允许合成默认导入。

### (4). esModuleInterop

简单来说，就是支持合成默认导入。

在前端项目开发时，使用 ESM 编写代码引入了 CJS 的模块，由于 CJS 模块没有默认导出内容，因此需要通过我们的工具去自动化合成 CJS 的默认导出，以支持在 ESM 下流畅开发。

参阅文章《[**esModuleInterop 到底做了什么？**]( *https://zhuanlan.zhihu.com/p/148081795*)》，讲得非常详细也非常好。

当 `esModuleInterop` 字段设置为 `true` 时候，上述提到的 `allowSyntheticDefaultImports` 字段也会自动设置为 `true`。

### (5). moduleResolution

`moduleResolution` 声明如何处理模块，枚举值：`classic`、`node`，会根据 `module` 字段决定默认值。

推荐手动设置为 `node`，更符合现在大家的编码认识一些，而且大部分的构建打包工具都是基于 Node。

举个🌰，遇到 `import {a} from 'a-lib';` 这样的模块引入代码应该如何去（解析）查找到对应的模块文件。

### (6). baseUrl & paths

`baseUrl`：设置基本目录以解析非绝对模块名称（定义一个根目录，以此进行绝对文件路径解析）

`paths`：用于设置模块名或路径映射列表，这样就可以简写项目中自定义模块的文件路径。

举一个 🌰：

```json
{
  "compilerOptions": {
    // 注意：baseUrl 必选，与 paths 成对出现，以 tsconfig.json 文件所在目录开始
    "baseUrl": ".", 
    "paths": {
      // 映射列表
      "@/*": [
        "src/*"
      ],
      "moduleA": [
        "src/libs/moduleA"
      ]
    }
  }
}

// 代码里这么写
import Toast from '@/components/Toast.ts' // 模块实际位置: src/components/Toast.ts
import TestModule from 'moduleA/index.js' // 模块实际位置: src/libs/moduleA/index.js
```

**⚠️ 注意：** 如果需要自动生成（导出）类型定义文件，TSC 不会处理路径别名，需要引入 [**typescript-transform-paths**](*https://www.npmjs.com/package/typescript-transform-paths*) 插件，以及 [**TTypescript**](*https://www.npmjs.com/package/ttypescript*)来转换路径别名为相对路径。

由于当前的 TypeScript 不支持 tsconfig.json 中的自定义转换器，且无法使用 tsc 命令使用自定义转换器编译文件，所以引入了 TTypescript 作为包装器

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./",
    // 配置路径别名映射
    "paths": {
      "@/*": ["src/*"]
    },
    "plugins": [
      // 转换输出 js 文件中的路径
      { "transform": "typescript-transform-paths" },

      // 转换输出 .d.ts 文件中的路径
      { "transform": "typescript-transform-paths", "afterDeclarations": true }
    ]
  }
}
```

[**plugins**](*https://www.typescriptlang.org/tsconfig#plugins*)是用于扩展 TSC 编译器功能的字段。

例如在 Rollup 打包环境下，可以如下配置：

```js
import typescript from '@rollup/plugin-typescript';
import ttypescript from 'ttypescript';

export default [
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: 'index.js',
    },
    plugins: [
      typescript({
        typescript: ttypescript,
      }),
    ],
  },
];
```

如果是有自动导出类型定义文件的需求，才需要搞这一套插件～

### (7). rootDir & outDir

`rootDir`：指定 TypeScript 识别读取的根目录，用于所有非声明输入文件的最长公共路径

> 例如：`'"rootDir": "./src"`，则 src 目录下的 TS 文件不能引用 src 目录以外的 ts 文件，一般我们会设置为 `./src` 或 `./`（即 tsconfig.json 所在目录）

`outDir`：输出目录，即 tsc 编译后的文件输出的文件夹路径（基于 tsconfig.json 文件的相对路径）

> 例如：`"outDir": "./dist"`，及将 TSC 编译输出的 JS 文件，统一输出的 `./dist` 目录下。

### (8). jsx

如果是有 jsx 语法需要支持的项目，可以设置值 `preserve`、`react` 等

```json
{
  "compilerOptions": {
    "jsx": "preserve", // 一般 preserve 即可
  },
}
```

### (9). importHelpers

`importHelpers` 决定是否启用从 `tslib` 库引入语法降级辅助函数，以避免重复冗余的辅助函数声明。

个人建议是设置为 `true` 来启用。

### (10).experimentalDecorators

`experimentalDecorators` 用于声明是否启实验性用装饰器模式。

TypeScript 和 ES6 中引入了 Class 的概念，同时在 **Decorators** 提出了装饰器模式，通过引入装饰器模式，能极大简化书写代码。

当前对于 Decorator 的支持性不太好，如果是一些涉及到使用了装饰器的需要，就需要开启这个属性。

### (11). noEmit

`noEmit` 设置是否输出 js 文件，一般是设置为 `false`，将打包等工作交给 Webpack 等工具。

# 三、tsconfig.json 全解析 📚

上面针对 tsconfig.json 中一些常见配置做了详细解释，将一些不常用的配置字段组合在一起，做一个 Checklist 如下：

```json
{
  "compilerOptions": {
    /* 基本选项 */
    "target": "es6", // 指定 ECMAScript 目标版本: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', or 'ESNEXT'
    "module": "commonjs", // 指定使用模块: 'commonjs', 'amd', 'system', 'umd' or 'es2015'
    "lib": [], // 指定要包含在编译中的库文件
    "allowJs": true, // 允许编译 javascript 文件
    "checkJs": true, // 报告 javascript 文件中的错误
    "jsx": "preserve", // 指定 jsx 代码的生成: 'preserve', 'react-native', or 'react'
    "declaration": true, // 生成相应的 '.d.ts' 文件
    "declarationDir": "./dist/types", // 生成的 '.d.ts' 文件保存文件夹
    "sourceMap": true, // 生成相应的 '.map' 文件
    "outFile": "./", // 将输出文件合并为一个文件
    "outDir": "./dist", // 指定输出目录
    "rootDir": "./", // 用来控制输出目录结构 --outDir.
    "removeComments": true, // 删除编译后的所有的注释
    "noEmit": true, // 不生成输出文件
    "importHelpers": true, // 从 tslib 导入辅助工具函数
    "isolatedModules": true, // 将每个文件做为单独的模块 （与 'ts.transpileModule' 类似）.

    /* 严格的类型检查选项 */
    "strict": true, // 启用所有严格类型检查选项
    "noImplicitAny": true, // 在表达式和声明上有隐含的 any类型时报错
    "strictNullChecks": true, // 启用严格的 null 检查
    "noImplicitThis": true, // 当 this 表达式值为 any 类型的时候，生成一个错误
    "alwaysStrict": true, // 以严格模式检查每个模块，并在每个文件里加入 'use strict'

    /* 额外的检查 */
    "noUnusedLocals": true, // 有未使用的变量时，抛出错误
    "noUnusedParameters": true, // 有未使用的参数时，抛出错误
    "noImplicitReturns": true, // 并不是所有函数里的代码都有返回值时，抛出错误
    "noFallthroughCasesInSwitch": true, // 报告switch语句的fallthrough错误。（即，不允许switch的case语句贯穿）

    /* 模块解析选项 */
    "moduleResolution": "node", // 选择模块解析策略： 'node' (Node.js) or 'classic' (TypeScript pre-1.6)
    "baseUrl": "./", // 用于解析非相对模块名称的基础目录
    "paths": {}, // 模块名到基于 baseUrl 的路径映射的列表
    "rootDirs": [], // 根文件夹列表，其组合内容表示项目运行时的结构内容
    "typeRoots": [], // 包含类型声明的文件列表
    "types": [], // 需要包含的类型声明文件名列表
    "allowSyntheticDefaultImports": true, // 允许从没有设置默认导出的模块中默认导入。
    "esModuleInterop": true, // 支持合成模块的默认导入
  
    /* Source Map Options */
    "sourceRoot": "./", // 指定调试器应该找到 TypeScript 文件而不是源文件的位置
    "mapRoot": "./", // 指定调试器应该找到映射文件而不是生成文件的位置
    "inlineSourceMap": true, // 生成单个 soucemaps 文件，而不是将 sourcemaps 生成不同的文件
    "inlineSources": true, // 将代码与 sourcemaps 生成到一个文件中，要求同时设置了 --inlineSourceMap 或 --sourceMap 属性

    /* 其他选项 */
    "experimentalDecorators": true, // 启用装饰器
    "emitDecoratorMetadata": true // 为装饰器提供元数据的支持
  },
  /* 指定编译文件或排除指定编译文件 */
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"],
  "files": ["index.ts", "test.ts"],
  // 从另一个配置文件里继承配置
  "extends": "@tsconfig/recommended",
  // 让 IDE 在保存文件的时候根据 tsconfig.json 重新生成文件
  "compileOnSave": true // 支持这个特性需要Visual Studio 2015， TypeScript 1.8.4 以上并且安装 atom-typescript 插件
}
```

# 四、打包工具中的 TypeScript 🦁

前文讲到了为什么不推荐直接使用 TSC 作为项目的打包编译工具，那么接下来就简单看看在常见的几款打包工具中针对 TypeScript 的编译方案是如何设计的？

## 4.1 Rollup + TypeScript

在 Rollup 打包中，我们一般只需要添加 **@rollup/plugin-typescript**[12] 插件即可，该插件会默认读取项目根目录下的 `tsconfig.json` 配置文件。

Rollup 的配置就像这样：

```js
// file: rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'output',
    format: 'cjs'
  },
  plugins: [typescript()]
};
```

结合其源码：

![图片](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHSJlmgLXRLdQib1icTSBlS7TaYia2KUGGjKL9xYgdibFUiaMFuFDsstzD8lkEiaXO3fibeC4tajTbyLxSyRw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)默认使用 TSC 作为 TS 的编译器

因为 typescript 声明了是 `peerDependencies`，因此会采用项目中安装的 typescript 版本，即是使用我们项目中的 TS 编译器。

通过阅读 `@rollup/plugin-typescript` 源码，可以看到该插件会默认使我们自己项目中的 tsconfig.json 文件作为 TSC 编译的配置，但会做一些配置预设覆盖：

会调用 `ts.parseJsonConfigFileContent()` 方法，将 `FORCED_COMPILER_OPTIONS` 值 merge 到用户的自定义配置中。

![图片](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHSJlmgLXRLdQib1icTSBlS7TaaoLfpiaCxX9DEp3sd6T9QnxWyyaazLia4UTB41qmAZ5zepLWsdpIRbBQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)FORCED_COMPILER_OPTIONS

通过英文解释看到，因为需要 TSC 编译获得 JS 产物，所以会将 `noEmit` 设置为 `false`，也就是 TSC 编译会输出文件，但为什么我们在输出目录却没有看到对应的 TSC 产物呐？

![图片](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHSJlmgLXRLdQib1icTSBlS7TaPsJIGB1VDA7JYMneiatLNFuWbcbNmK2rhlpqVE4cmd0LNqbtt38NCsg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)TSC 编译结果存储到内存中

但是如果开启了 `declaration`，则会将 TSC 解析得到的 `*.d.ts` 文件输出到指定目录。

## 4.2 Webpack + TypeScript

在 [**Webpack 中的 TypeScript**](*https://webpack.docschina.org/guides/typescript/*) 官方文档中，指明了需要安装：`typescript` 和 `ts-loader` 两个模块。

配置 Webpack 并支持 TypeScript 的配置如下：

```js
// file: webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
```

可以看出 Webpack 主要是依赖 `ts-loader` 实现对 TypeScript 语法的编译支持，再看看对 `ts-loader` 的介绍：

![图片](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHSJlmgLXRLdQib1icTSBlS7TayWIM8eicctbx557REmh5aJGNR5uVjNFdwxwichVOzo1Gg3jy955vC8CA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)ts-loader

换句话说，ts-loader 实际调用了 TSC 来编译 TS 文件，TSC 的配置依赖于你项目中的 tsconfig.json 文件。

如果使用了 Babel，则可以使用 [**@babel/preset-typescript**]( *https://babeljs.io/docs/en/babel-preset-typescript*) 来处理，但 Babel 不会做 TS 类型校验，在打包工具 Rollup 和 Webpack 中都可以引入 Babel，那么接下来看看 Babel 是如何处理 TypeScript 的吧！

## 4.3 Babel + TypeScript

Babel 处理 TS 需要安装 @babel/preset-typescript 模块，然后在 babel 项目配置文件中声明:

```json
// 配置说明：https://babeljs.io/docs/en/babel-preset-typescript
{
  "presets": ["@babel/preset-typescript"]
}
```

但 Babel 中只会对 TS 代码转为 JS 代码（通过 parse TS 文件为 AST，并直接移除类型信息，然后打印目标代码），不会去做 TS 类型检查，所以 Babel 编译 TS 文件相较于 TSC 的速度更快！

同时，因为 Babel 会根据不同的兼容环境，按需引入 pollyfill，比 TSC 直接引入 `core-js` 更优雅，因此使用了 Babel 打包的体积也会更小。

TS 类型检查工作可以交给代码编辑器承担，当然同时可以新增 TS 检查的命令：

```json
// package.json
{
  "script": {
    "tsCheck": "tsc --noEmit",
  }
}
```

可以把类型检查放到特定的 npm scripts 生命周期之前，另外其实也可以将类型检查放到 git commit 阶段，用于做必要的 TS 类型检查，保证项目的正确性。

## 4.4 ESbuild + TypeScript

通过 Vite 体会到了 **ESbuild**带来的开发热更新“极速”体验，针对 TS 项目，ESbuild 和 Babel 是相同的编译策略，即**仅编译，不校验类型**。

**ESbuild 处理 TypeScript**[16] 同样可以带来飞一般的感觉！

> Vite 使用 esbuild 将 TypeScript 转译到 JavaScript，约是 tsc 速度的 20~30 倍，同时 HMR 更新反映到浏览器的时间小于 50ms。—— **Vite Docs**

但在 ESbuild 中需要启用 tsconfig 中的 `isolatedModules` 功能，然后在类型引入的时候需要替换，规则参考如下：

```
// old
import { UserType } from './types';

// new
import type { UserType } from './types';
```

因为 ESbuild 是单独编译每个文件，无法判断引入的是 Type（类型） 还是 值，所以需要开发者显示地声明是“Type”。

同时还需要启用 `esModuleInterop` 功能，用于支持 ESM 模块合成默认导入，以兼容 CJS 和 ESM 规范。

另外 ESbuild 不支持：`emitDecoratorMetadat`、`const enum` 类型和 `*.d.ts` 文件

此外，关注到兼容性处理这方面，Bable 和 ESbuild 是类似的，因此会存在兼容性问题：

![图片](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHSJlmgLXRLdQib1icTSBlS7Ta7GLlj9XcBma9iaAFUEdjTYIqENu8FHw9PB6m7yXeAFRndkHqoeDJMjw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)兼容性

对于装饰器处理不支持，因为 TS 是 JS 的超集，ESnext 的规范提案某些还不是稳定的，因此如果有这方面诉求的项目，可以借助 TSC 做预编译，例如使用 Rollup 的 typescript 插件 或 Webpack 的 ts-loader 方式。

# 五、总结 📒

针对 TypeScript 项目的类型检查和编译流程算是完整过了一遍，相信已足以支撑大家在工作中自定义化配置 TS 前端项目！

另外，**tsconfig.json 推荐配置策略**如下：

1. 借助 extends 字段，并结合项目应用场景，继承官方推荐配置
2. 针对项目特点，按需修改对应功能配置
3. 建议启用 `importHelpers`、`esModuleInterop`，取消 `noEmit` 输出
4. TS 项目的打包构建，推荐使用 Webpack、Rollup、Bable 等专业工具来保证正确性和构建优化