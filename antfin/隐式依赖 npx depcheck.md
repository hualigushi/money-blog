隐式依赖 npx depcheck
npm cli 工具 depcheck 能辅助我们找到项目中 Unused dependencies（无用依赖）和 Phantom dependencies（幻影依赖），分别表示写入 package.json 但没被项目使用、被项目引用了但没有写入 package.json。
depcheck 更像是一个缩小排查范围的过滤器，不能轻信其打印结果。例如，depcheck 默认无法识别特殊挂载的 plugin。



dependency-cruiser 
用于可视化和校验模块之间的依赖关系。

它支持前端常用的 JavaScript，TypeScript 语言和 ESM，CommonJS 等模块规范。

在项目里通常与 ESLint 配套使用，一个用于代码检查，一个用于依赖检查。
使用方式

依赖安装

首先安装 Graphviz，用来生成依赖关系图。
brew install graphviz
复制代码
接着在项目里安装 dependency-cruiser。
npm i dependency-cruiser -D
复制代码

生成图片

安装好就可以直接执行命令使用了：
npx depcruise —output-type dot src | dot -T svg > dependency-graph.svg
复制代码
执行后会在根目录下得到一张 svg 格式的依赖关系图。
上方的核心命令是 depcruise src，表示对 src 下的文件进行依赖追踪。
其余参数用来控制输出格式：

—-output-type dot 表示输出格式为 dot，意味着使用 Graphviz 来输出。
dot -T svg > dependency-graph.svg 为 Graphviz 的命令行语法，表示输出名为 dependency-graph 的 svg 文件。


建议将该命令放在 package.json 的 npm 脚本中，还能配合 CI/CD 完成依赖图生成自动化。

其它参数
除了控制输出格式，我们还能通过一些参数对依赖图进行控制。

—-exclude：用于过滤掉图上不关心的依赖。
--include-only：与 --exclude 相反，只保留范围内的依赖。
-—do-not-follow：会过滤掉某个依赖的后续依赖。
—-max-depth：指定依赖树的深度。将依赖图的输出大小保持在可控范围内。

比如设置 --max-depth 1后生成的 preact 依赖图为：

复杂度会减小很多。

更多案例可以参考官方文档 Real world samples。


VS Code 插件
除了命令，使用 VSCode 插件 Dependency Cruiser Extension 也能快速查看依赖图。

使用方式也很简单，安装插件后在文件右键菜单中点击「View Dependencies」即可看到基于该文件的依赖图。

图中可以看到它的文件层级与下游依赖，对于临时地查看某个文件的依赖关系，这样会更方便。
依赖关系校验
dependency-cruiser 也可以像 ESLint 一样自定义规则来对依赖关系进行校验。
它能够前置规避掉可能出现的各种依赖关系问题，使用起来也非常简单。
使用方式

依赖安装

npm i dependency-cruiser -D
复制代码

初始化配置文件

npx depcruise -—init
复制代码
根据命令行提示完成操作。

会在根目录下生成 .dependency-cruiser.js 配置文件。

配置文件看起来很长很劝退，其实主要由两大块组成：

被禁止的依赖用法规则列表，放在 forbidden 字段下。


规则列表由一个个规则项组成，自动生成后会内置一些推荐规则。


其它配置，放在 options 字段下


包括依赖追踪范围，模块规范，TS、Webpack config 文件路径等，也是自动生成的，通常不需要改动。

简化后的整体结构如下：
// .dependency-cruiser.js
module.exports = {
  forbidden: [
    {...}, // 规则1
    {...}, // 规则2
    {...}, // 规则3
    // ...
	],
  options: {
   // ...
  }
}
复制代码
排除掉不太需要关心的配置后，是不是看起来更清晰了？

后文会详细说明规则项如何配置。


校验依赖

执行命令
npx depcruise src --config .dependency-cruiser.js
复制代码
依赖关系校验未通过会像 ESLint 一样抛出异常。


建议将命令放在 package.json 中的 npm scripts 中，并结合 git hook 或 CI 设置卡点。

内置规则
默认配置文件为我们内置了一些推荐规则，一起来看看。
「禁止循环引用」规则
循环引用指的是，模块 A 依赖模块 B，而模块 B 又依赖模块 A。
// moduleA.ts
import moduleB from './moduleB';

export default function moduleA() {
  return 'moduleA';
}

moduleB();
复制代码
// moduleB.ts
import moduleA from './moduleA';

export default function moduleB() {
  return 'moduleB';
}

moduleA();
复制代码
如果处理地不好，可能导致程序异常。依赖关系复杂的大项目难免会出现这样的情况。
禁止循环引用规则就是用来检测这种场景的，规则配置如下：
{
  // ----- 规则基本配置 -----
  name: 'no-circular', // 规则名称
  severity: 'error', // 严重等级
  comment: '禁止循环引用', // 规则描述
  // ----- 规则内容 -----
  from: {}, // 不填则表示所有引用
  to: {
    "circular": true, // 不允许成环
  },
},
复制代码
name，severity 和 comment 用于描述规则的基本信息。
from 和 to 描述规则的具体内容，from 表示「依赖方」，to 表示「被依赖方」。
上方的配置表示：任何依赖引用，只要成环，就会报错 error（默认等级是 warn，这里改成 error 用于演示）。
测试一下上方 moduleA 和 B 循环依赖的例子，执行校验命令会在控制台看到报错，阻塞后续流程。

其他内置规则
内置规则除了「禁止循环引用」，还有：

not-to-unresolvable：禁止引用不存在的模块，这会导致程序出错。


2. no-orphans：检测未被使用的模块，提醒我们及时进行代码清理，避免干扰。

3. not-to-dev-dep：禁止生产环境代码使用开发依赖，这在开发 node 应用或者 npm 包时可能会存在问题。

自定义规则
我们也可以根据项目场景自定义规则。
「禁止跨模块引用」规则
两个非相关的模块如果出现跨模块引用会导致强耦合。
比如 pageA 和 pageB 是两个独立的页面组件，但 pageA 下面的 component 直接引用了 pageB 的 utils。
// pageA/component.tsx
// 引用了 pageB 的模块
import utils from '../pageB/utils';

export default function component() {
  // ...
  return 'page A 下的组件';
}
复制代码
这样会导致两个页面纠缠不清，应该尽量避免。
正确的做法应该是将用到公共模块放到更高的层级 src/utils，页面从公共模块中引入。
但实际开发中这也是很难避免的，我们可以基于此场景配置一条规则：「禁止 pageA 引入其它页面模块」。
{
  // ----- 规则基本配置 -----
  name: 'no-cross-module-import',
  severity: 'error', // 严重等级
  comment: '禁止跨模块引用',
  // ----- 规则内容 -----
  from: {
    path: '^src/pageA',
  },
  to: {
    pathNot: [
      // 只能引入自己或公共的模块
      '^src/pageA',
      '^src/utils',
    ]
	},
},
复制代码
任何 pageA 的依赖引用，只要不是来自自身或者全局 utils，就会报错 error。
测试一下，执行校验命令会在控制台看到报错。

其它自定义规则
这里再简单介绍两个自定义的规则。

「禁止直接引用某个模块」

如果项目中有对 axios 进行封装，业务开发时应该使用封装后的请求库。
为了避免直接使用 axios，可以配置一条「禁止直接引用 axios」规则。
{
  // ----- 规则基本配置 -----
  name: 'not-direct-axios',
  comment: '禁止直接使用 axios',
  severity: 'error',
  // ----- 规则内容 -----
  from: {}, // 所有引用
  to: {
    path: 'axios',
  },
},
复制代码

「叶子依赖禁止再依赖其它模块」

还是封装的场景，比如项目内基于浏览器的 cookie api 封装了一个 cookie 库。
cookie 库只依赖 cookie api，不依赖其它模块，可以配置一条规则来「强制它是一个叶子依赖」。
{
  // ----- 规则基本配置 -----
  name: 'cookies-leaf',
  comment: 'cookies 库不应该有其它依赖',
  severity: 'error',
  // ----- 规则内容 -----
  from: {
    path: '^src/lib/cookies',
  },
  to: {}, // 不能引用任何其它依赖
},
复制代码
其它更多场景，欢迎留言讨论交流。
总结
本文我们介绍了 dependency-cruiser 治理项目模块依赖关系的两种使用方式。


依赖关系可视化：使用命令可以生成和控制输出的依赖关系图。对于追踪单个文件的依赖关系的场景，使用 VS Code 插件会更方便。


依赖关系校验：可以像 ESLint 一样通过命令来校验依赖关系，而且支持自定义规则，比如「禁止循环依赖」，「禁止跨模块引用」等。


当然，这仅仅是它能力的冰山一角，可以去 Github 主页了解更多高级用法。


