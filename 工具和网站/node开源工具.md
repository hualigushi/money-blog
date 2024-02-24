

[TOC]



# node开源工具

### 1.Git

#### 1.1 应用场景1: 要实现git提交前 eslint 校验和 commit 信息的规范校验？

可以使用以下工具：

- `husky` - 现代化的本地Git钩子使操作更加轻松
- `pre-commit` - 自动在您的git储存库中安装git pre-commit脚本，该脚本在pre-commit上运行您的npm test。
- `yorkie` 尤大改写的yorkie，yorkie实际是fork husky，让 Git 钩子变得简单(在 vue-cli 3x 中使用)

#### 1.2 应用场景2: 如何通过node拉取git仓库？（可用于开发脚手架）

可以使用以下工具：

- `download-git-repo` - 下载和提取Git仓库 (支持GitHub, GitLab, Bitbucket)。

#### 1.3 应用场景3: 如何在终端看git 流程图？

可以使用以下工具：

- `gitgraph` -  在 Terminal 绘制 git 流程图（支持浏览器、React）。

#### 1.4 其他

- `git-url-parse` - 高级别git解析。

- `giturl` - 将Git链接转化成Web链接。

  

### 2.环境

#### 2.1 应用场景1: 如何根据不同环境写入不同环境变量？

可以使用以下工具：

- `cross-env` -  跨平台环境脚本的设置，你可以通过一个简单的命令（设置环境变量）而不用担心设置或者使用环境变量的平台。
- `dotenv` -   从 .env文件 加载用于nodejs项目的环境变量。
- `vue-cli --mode` -  可以通过传递 --mode 选项参数为命令行覆写默认的模式

### 3.NPM

#### 3.1 应用场景1: 如何切换不同npm源？

可以使用以下工具：

- `nrm` -   快速切换npm注册服务商，如npm、cnpm、nj、taobao等，也可以切换到内部的npm源
- `pnpm` -  可比yarn，npm 更节省了大量与项目和依赖成比例的硬盘空间

#### 3.2 应用场景2: 如何读取package.json信息？

可以使用以下工具：

- `read-pkg-up` -  读取最近的package.json文件。
- `node-pkginfo` -  从package.json读取属性的简单方法。

#### 3.3 应用场景3：如何查看当前package.json依赖允许的更新的版本

可以使用以下工具：

- `npm-check-updates` -  找当前package.json依赖允许的更新的版本。

![图片](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib0N9sSTlQ9DIZ2DQtz2HRBBBR38BwsV91gBqAoAvISwnoibNoMJKfAxDcT6pbibVOPIMciclDM0LfTZQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### 3.4 应用场景4：如何同时运行多个npm脚本

> ❝
>
> 通常我们要运行多脚本或许会是这样`npm run build:css && npm run build:js` ，设置会更长通过`&`来拼接
>
> ❞

可以使用以下工具：

- `npm-run-all` -  命令行工具，同时运行多个npm脚本（并行或串行）

npm-run-all提供了三个命令，分别是 npm-run-all run-s run-p，后两者是 npm-run-all 带参数的简写，分别对应串行和并行。而且还支持匹配分隔符，可以简化script配置

或者使用

- `concurrently` -   并行执行命令，类似 npm run watch-js & npm run watch-less但更优。（不过它只能并行）

#### 3.5 应用场景5：如何检查NPM模块未使用的依赖。

可以使用以下工具：

- `depcheck` -  检查你的NPM模块未使用的依赖。![图片](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib0N9sSTlQ9DIZ2DQtz2HRBBdGCUlZz3vaV0WbAbmLUwT9J7pwicel013tmmqg1iaibaaNiaWBcq3RgkzQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### 3.6 其他：

- `npminstall` - 使 npm install 更快更容易，cnpm默认使用
- `semver` - NPM使用的JavaScript语义化版本号解析器。

关于npm包在线查询，推荐一个利器 `npm.devtool.tech`

![图片](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib0N9sSTlQ9DIZ2DQtz2HRBBmFxcibuE5x6iaFicv46Iicmc11RNZQQXwCGgLicxIeHvj3gGyPicM9sgaLuQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 4.文档生成

#### 4.1 应用场景1：如何自动生成api文档？

- `docsify` -  API文档生成器。

- `jsdoc` -  API文档生成器，类似于JavaDoc或PHPDoc。

  

### 5.日志工具

#### 5.1 应用场景1：如何实现日志分类?

- `log4js-nodey` -  不同于Java log4j的日志记录库。

- `consola` - 优雅的Node.js和浏览器日志记录库。

- `winston` - 多传输异步日志记录库（古老）

  

### 6.命令行工具

#### 6.1 应用场景1: 如何解析命令行输入？

> ❝
>
> 我们第一印象会想到的是`process.argv`，那么还有什么工具可以解析吗？
>
> ❞

可以使用以下工具：

- `minimist` -  命令行参数解析引擎
- `arg` -  简单的参数解析
- `nopt` - Node/npm 参数解析

#### 6.2 应用场景2：如何让用户能与命令行进行交互？

![图片](https://mmbiz.qpic.cn/mmbiz_gif/lXoAxSVgJib0N9sSTlQ9DIZ2DQtz2HRBBzJDpYgzJYuKeISuX1Hic1PvVLH4r02x8ufrC5ZuWaBPKPjVMwUv4XXA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

可以使用以下工具：

- `Inquirer.js` -  通用可交互命令行工具集合。
- `prompts` -  轻量、美观、用户友好的交互式命令行提示。
- `Enquirer` -  用户友好、直观且易于创建的时尚CLI提示。

#### 6.3  应用场景3: 如何在命令行中显示进度条？

可以使用以下工具：

- `progress` -  Node.js的灵活ascii进度条。
- `progress-estimator` -  记录进度条并估计完成承诺所需的时间。

#### 6.4 应用场景4: 如何在命令行执行多任务？

![图片](https://mmbiz.qpic.cn/mmbiz_gif/lXoAxSVgJib0N9sSTlQ9DIZ2DQtz2HRBBASZibqjNOmoSwxaNKPWLEk71mxGZG3rL1N9GJXq5wOBlJWLZiaRWnCfw/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

可以使用以下工具：

- `listr` -  命令行任务列表。

  

#### 6.5 应用场景5: 如何给命令行“锦上添花”？

![图片](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib0N9sSTlQ9DIZ2DQtz2HRBBSEZ8HNmNcqXhkBCAmOrseta86qLm5SSndMJiaiaqekwe8WH1mibTgjNBQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

可以使用以下工具：

- `chalk` -  命令行字符串样式美化工具。
- `ora` -   优雅的命令行loading效果。
- `colors.js` -   获取Node.js控制台的颜色。
- `qrcode-terminal` -   命令行中显示二维码。
- `treeify` -   将javascript对象漂亮地打印为树。
- `kleur` -  最快的Node.js库，使用ANSI颜色格式化命令行文本。



### 7.加解密

> ❝
>
> 一般为了项目安全性考虑，我们通常会对账号密码进行加密，一般会通过MD5、AES、SHA1、SM，那开源社区有哪些库可以方便我们使用？
>
> ❞

可以使用以下工具：

- `crypto-js` -  JavaScript加密标准库。支持算法最多

- `node-rsa` -   Node.js版Bcrypt。

- `node-md5` -   一个JavaScript函数，用于使用MD5对消息进行哈希处理。

- `aes-js` -  AES的纯JavaScript实现。

- `sm-crypto` -  国密sm2, sm3, sm4的JavaScript实现。

- `sha.js` -  使用纯JavaScript中的流式SHA哈希。

  

### 8.静态网站生成 & 博客

![图片](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib0N9sSTlQ9DIZ2DQtz2HRBBJUkvGs3yETOFeOenkb6lRqrWEOGHyFwFSK3T32vibGFiaibpkJE3MicibOg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

可以使用以下工具：

- `hexo` -  使用Node.js的快速，简单，强大的博客框架。
- `vuepress` -  极简的Vue静态网站生成工具。（基于nuxt SSR）
- `netlify-cms` -   基于Git的静态网站生成工具。
- `vitepress` -  Vite & Vue.js静态网站生成工具。

### 9.数据校验工具

可以使用以下工具：

- `validator.js` -   字符串校验库。
- `joi` -  基于JavaScript对象的对象模式描述语言和验证器。
- `async-validator` -  异步校验。
- `ajv` - 最快的JSON Schema验证器
- `superstruct` -  用简单和可组合的方式在JavaScript和TypeScript中校验数据。

### 10.解析工具

#### 10.1应用场景1: 如何解析markdown？

可以使用以下工具：

- `marked` -  Markdown解析器和编译器，专为提高速度而设计。
- `remark` -  Markdown处理工具。
- `markdown-it` -支持100%通用Markdown标签解析的扩展&语法插件。

#### 10.2应用场景2: 如何解析csv？

可以使用以下工具：

- `PapaParse` -  快速而强大的 CSV（分隔文本）解析器，可以优雅地处理大文件和格式错误的输入。
- `node-csv` - 具有简单api的全功能CSV解析器，并针对大型数据集进行了测试。
- `csv-parser` -旨在比其他任何人都快的流式CSV解析器。

#### 10.3应用场景3: 如何解析xml？

可以使用以下工具：

- `xml2js` -  将XML转换为JavaScript对象的转换器。

- `fast-xml-parser` - 具验证&解析 XML。

  

### 1.图形处理 🖼️

#### 1.1 应用场景1: 如何实现给图片做裁剪、格式转换、旋转变换、滤镜添加等操作

可以使用以下工具：

- `sharp` ：调整JPEG，PNG，WebP和TIFF格式图像大小的最快模块。
- `jimp` ：纯JavaScript中的图像处理。
- `gm` ：GraphicsMagick 和 ImageMagick 封装
- `lwip` ：不需要ImageMagick的轻量级图像处理器

如下裁剪图所示

![图片](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25oOhj9f4PHPlFseu9RKPe0ZOKqHMLz3hYf1jjygvCGkZy3vO8zJ92q7gAHXM9kkUYiaUAtmb7WUQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

> ❝
>
> 啊翔同学：上面提到`ImageMagick`是个什么鬼？官方介绍：ImageMagick是一套功能强大、稳定而且开源的工具集和开发包，可以用来读、写和处理超过89种基本格式的图片文件，包括流行的TIFF、JPEG、GIF、 PNG、PDF以及PhotoCD等格式。利用ImageMagick，你可以根据web应用程序的需要动态生成图片, 还可以对一个(或一组)图片进行改变大小、旋转、锐化、减色或增加特效等操作
>
> ❞

#### 1.2  应用场景2: 如何实现生成二维码和条形码

可以使用以下工具：

- `node-qrcode` ：二维码和条形码生成器
- `qr-image` ：二维码生成器

> ❝
>
> 啊乐同学：如果我想解析二维码的话，有没有什么轮子可以用？
>
> ❞

你可以使用：

- `jsQR` ：一个纯javascript的二维码读取库。该库接收原始图像，并将定位、提取和解析其中发现的任何二维码。

#### 1.3  应用场景3: 如何对比图片像素是否一致？

可以使用以下工具：

- `pixelmatch` ： 最小、最简单、最快的 JavaScript 像素级图像比较库。
- `resemble.js` ：图片像素对比工具

#### 1.4  应用场景4: 如何检验图片类型？

可以使用以下工具：

- `image-type` ： 检测Buffer / Uint8Array的图像类型.

### 2.构建工具 ⛏️

#### 2.1 应用场景1: 构建工具都有哪些？

可以使用以下工具：

- `webpack` ：打包浏览器的模块和资产。
- `parcel` ：快速，零配置的Web应用构建工具。
- `esbuild` ：极快的JavaScript打包压缩工具，不使用 AST
- `rollup` ：新一代的 ES2015 打包构建工具。
- `grunt` ：JavaScript任务执行器。
- `gulp` ：流式快速构建系统，支持代码而不是配置。
- `snowpack` ：是一个相对轻量的 bundless 方案

#### 2.2 应用场景2：支持esm的构建工具有哪些？

可以使用以下工具：

- `vite` ：新一代前端构建工具。
- `snowpack` ：由ESM支持的前端构建工具。即时，轻量级，无捆绑开发

> ❝
>
> 👩‍  啊开童鞋：什么是`Bundleless`？
>
> ❞

Bundleless 模式是利用浏览器能够自主加载的特性，通过跳过打包环节，使得我们在项目启动时可以直接获取到极快的启动速度，而在本地更新时只需要重新编译单个文件

![图片](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25oOhj9f4PHPlFseu9RKPeCkYJ7dY8s9zBsgrGE8k5L0EBGsO1DXibC1HWBibLglr8HR6zI8UunHUg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 3.缓存  📦

#### 3.1 应用场景1: 基于LRU缓存工具算法有哪些？

LRU 全称叫`Least Recently Used`，也叫最近最少使用，是一种缓存淘汰算法。核心是内容是如果数据最近被访问过,那么将来被访问的几率也更高，相如果是很久都没用过的数据会优先对其删除，常用于`优化缓存查询性能`，包括我们使用的框架vue中的`keep-alive`也是基于该算法开发的

- `lru-cache` ：最近最少使用的缓存（LRU）实现。
- `hashlru` ：更轻量更快的LRU算法。
- `ylru` ：基于hashlru添加过期时间，允许空值。

#### 3.2 应用场景2: 基于Node的缓存工具有哪些？

- `node-cache` ：Node.js内存缓存模块。
- `node-cache-manager` ：Node.js Cache模块。

### 4.最小化 💧

#### 4.1 应用场景1: js的文件压缩工具有哪些？

- uglify-js: JavaScript压缩工具。

> ❝
>
> 👩‍🎓 啊乐童鞋：我记得之前好像有个webpack插件叫`uglifyjs-webpack-plugin`，跟你说的这个有什么关系？
>
> ❞

uglifyjs-webpack-plugin就是基于`uglifyjs`开发的插件，只不过UglifyJs不支持直接处理ES6文件，只能处理ES5文件，对于ES6语法，我们之前的代码最小化过程如下所示向下

![图片](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25oOhj9f4PHPlFseu9RKPeDgC5SM1b4utSveD9q4peKZ8mrBRFtmuahoaxmm2RZAB0Kicpy6McRnA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)


虽然后来出了`Uglify-ES`支持处理ES6文件，但也因为存在bug太多，目前该项目也停止维护了。不过后来`Terser`fork了Uglify-ES然后进行了维护迭代，也就后来有了`terser-webpack-plugin`

> ❝
>
> 👩‍🎓 啊乐童鞋：那有没有可以支持处理ES6 code的压缩工具
>
> ❞

随着浏览器对es6特性支持更多，我们的代码最小化过程如下

![图片](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25oOhj9f4PHPlFseu9RKPeamMmXBjSPbCyMHppZUL6bavFuOBWMNDFM2yY7vLryOic8kqwicric1tHQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

可以使用以下工具：

- babel-minify：基于Babel工具链的 ES6+ 压缩库, 以前叫 `babili`
- terser: 用于es6的javascript解析器和混淆压缩工具包

下面是个对比图👇

![图片](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25oOhj9f4PHPlFseu9RKPe5ouYlqpK8gW22ewk2WfGXy0kibdfqzeDPh0d0MULIhOCVdXE9mgTc5w/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

####  4.2 应用场景2: css的文件压缩工具有哪些？

可以使用以下工具：

- cssnano: 建立在PostCSS生态系统之上模块化的压缩工具。
- clean-css: CSS压缩工具。

#### 4.3 应用场景3: 图片压缩工具有哪些？

- imagemin: Image压缩工具。

#### 4.4 应用场景4：webpack生态有哪些比较主流的压缩插件？

- uglifyjs-webpack-plugin: 基于uglifyjs压缩js文件，不支持es6
- terser-webpack-plugin: 支持压缩 ES6 (Webpack4)
- html-webpack-plugin: 简化 HTML 文件创建
- optimize-css-assets-webpack-plugin: 优化减少CSS资源的Webpack插件。webpack5中改为：css-minimizer-webpack-plugin

### 5. 网络🏄

#### 5.1 应用场景1: 如何获取用户ip地址？

一般可以从下面的这些信息获取，当然有蛮多好的“轮子“可以使用哦～![图片](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25oOhj9f4PHPlFseu9RKPe4cqGp6QJsB18NMteiadibLjEcmwaXicyR0GzdO4KCnW4H0yHSjsfkk9dw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

可以使用以下工具：

- node-ip: NodeJS IP地址工具。
- public-ip: 非常快的获取你的公网IP地址。
- request-ip: 在服务器中获取请求的IP地址。

#### 5.2 应用场景2: 如何知道当前该使用哪个新的端口？

我们在vue-cli源码中，可以看到它使用的是`node-portfinder`, 它不仅可以自动检测当前端口是否被占用如果占用还会返回新端口

![图片](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25oOhj9f4PHPlFseu9RKPeNlX0jTP12ALVzxOVyV2UiaHz3L5NvyEFmIic0CSg4cIZA15HkfwyVF4A/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

- node-portfinder :在当前机器上查找开放端口 或 域套接字的简单工具。
- get-port :获取一个可用的端口。

### 6. HTTP 🌍

#### 6.1 应用场景1 ：有哪些请求库工具可以使用？

可以使用以下工具：

- axios: 基于Promise 的HTTP客户端（也可以在浏览器中工作）。
- request: 简单的 HTTP 请求客户端。
- superagent: HTTP请求库。
- node-fetch:  Node.js的 window.fetch 实现。

#### 6.2 应用场景2: 我如何用node起一个服务？

- http-server: 零配置的命令行Http服务端。
- anywhere: 随时随地将你的当前目录变成一个静态文件服务器的根目录。
- json-server: 在不到30秒的时间内获得具有零编码的完整伪造的REST API。



你可以使用比如pm2来启动服务，可以保证进程永远都活着

可以使用以下工具：

- pm2: 高级进程管理工具。
- nodemon: 监视应用程序中的更改并自动重新启动服务器。
- forever: 简单的CLI工具，用于确认提供的代码持续运行。
- supervisor: 当脚本崩溃时重新启动脚本，或者当`*.js`文件更改时重新启动脚本。

#### 6.3 应用场景3: 我如何用Node起一个代理服务？

> ❝
>
> 我们常常可以在webpack中看到webpack-dev-server的配置，然后配置本地开发接口映射，以此接解决本地开发跨域存在的问题，本质上就是基于`http-proxy-middleware`中间件 ，通过把后端的API的请求代理到本地服务器上。包括mock服务也是一种代理服务，代理服务器只是起一个中转作用，总结用于解决以下三点
>
> ❞

- 本地开发
- 代理访问
- 防止跨域

可以使用以下工具：

- http-proxy: 高级进程管理工具。
- http-proxy-middleware : ⚡用于connect，express和browser-sync的单线Node.js Http代理中间件。
- fast-proxy:  Node.js框架，使您可以将http请求转发到另一个HTTP服务器。支持的协议：HTTP，HTTPS，HTTP2。

### 7. 模版引擎 🚀

> ❝
>
> 模板引擎是一个通过结合页面模板、要展示的数据生成HTML页面的工具，本质上是后端渲染（SSR）的需求，加上Node渲染页面本身是纯静态的，当我们需要页面多样化、更灵活，我们就需要使用模板引擎来强化页面，更好的凸显服务端渲染的优势
>
> ❞

可以使用以下工具：

- pug: 是一款健壮、灵活、功能丰富的模板引擎,专门为 Node.js 平台开发
- mustache: 轻量的JavaScript模板引擎{{八字须}}。
- art-template: 高性能JavaScript模板引擎。
- handlebars: Mustache 模板的超集，添加了强大的功能，如helper和更高级的block。
- doT: 最快简洁的JavaScript模板引擎。

针对性能，我们将不同的工具进行渲染速度对比，可参考下图👇

![图片](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25oOhj9f4PHPlFseu9RKPe6rHck8T8pj1s3mLKqLdnLibp0AUgu3hdbbYYbEVeRqH0pV0SnfqEicrg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 8. 函数式编程 🍉

> ❝
>
> 函数式编程大量使用函数，使得我们重复代码减少，同时也不会改变外界的状态，因为如果依赖，会造成系统复杂性大大提高
>
> ❞

可以使用以下工具：

- immer: 函数式响应式编程。
- immutable: 不可变的数据集合。
- lodash:可提供一致性、自定义、性能和其他功能的实用程序库，比Underscore.js更好更快。
- rxjs: 用于转换、组合和查询各种数据的函数式响应式库。
- lazy:  类似于lodash/underline的工具库，但具有惰性计算，在许多情况下可以转换为卓越的性能.

### 9. 文件系统 🥤

> ❝
>
> 我们知道Node体系中有`fs`模块, 对有关文件进行相应目录的创建、写入及删除操作等等。除了现有的api还有没有其他现成的轮子可以用
>
> ❞

#### 9.1 应用场景1: fs模块相关的工具？（文件读取，目录创建，删除）

可以使用以下工具：

- fs-extra : 为 fs 模块提供额外方法。
- graceful-fs:graceful-fs可以替代fs模块，并做了各种改进。
- filesize: 生成人类可读的文件大小字符串。
- make-dir: 递归创建文件夹，类似 mkdir -p。
- find-up:  通过上级父目录查找文件或目录。
- ncp:  使用Node.js进行异步递归文件复制。
- rimraf:  递归删除文件，类似 rm -rf。

#### 9.2 应用场景2: 如何监控文件变更？

> ❝
>
> 替换 `fs.watch`
>
> ❞

可以使用以下工具：

- chokidar : 最小且高效的跨平台Watch库。