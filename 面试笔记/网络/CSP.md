# CSP概念

内容安全策略（Content Security Policy，简称CSP）是一种以可信**白名单**作机制，来限制网站中是否可以包含某来源内容。开发者明确告诉客户端，哪些外部资源可以加载和执行，等同于提供白名单。它的实现和执行全部由浏览器完成，开发者只需提供配置。

默认配置下不允许执行内联代码（``块内容，内联事件，内联样式），以及禁止执行eval() , newFunction() , setTimeout([string], …) 和setInterval([string], …) 。



#  XSS

XSS攻击的核心是利用了浏览器无法区分脚本是被第三方注入的，还是真的是你应用程序的一部分。例如Google +1按钮会从https://apis.google.com/js/plusone.js加载并执行代码，但是我们不能指望从浏览器上的图片就能判断出代码是真的来自`apis.google.com`，还是来自`apis.evil.example.com`。浏览器下载并执行任意代码的页面请求，而不论其来源。



# CSP默认特性

#### 阻止内联代码执行

CSP除了使用白名单机制外，默认配置下阻止内联代码执行是防止内容注入的最大安全保障。这里的内联代码包括：`<script>`块内容，内联事件，内联样式。

虽然CSP中已经对script-src和style-src提供了使用”unsafe-inline”指令来开启执行内联代码，但为了安全起见还是慎用”unsafe-inline”。

#### EVAL相关功能被禁用

用户输入字符串，然后经过eval()等函数转义进而被当作脚本去执行。这样的攻击方式比较常见。于是乎CSP默认配置下，eval() , newFunction() , setTimeout([string], …) 和setInterval([string], …)都被禁止运行。

同样CSP也提供了”unsafe-eval”去开启执行eval()等函数，但强烈不建议去使用”unsafe-eval”这个指令。



# CSP的分类
（1）Content-Security-Policy
           配置好并启用后，不符合 CSP 的外部资源就会被阻止加载。
（2）Content-Security-Policy-Report-Only
          表示不执行限制选项，只是记录违反限制的行为。它必须与report-uri选项配合使用。



# 使用

CSP提供了一套丰富的指令集，允许页面控制加载各种类型的资源，例如如下的类型：

- connect-src：限制连接的类型（例如XHR、WebSockets和EventSource）,不允许的情况下，浏览器会模拟一个状态为 400 的响应。

- font-src：控制网络字体的来源。

- frame-src：列出了可以嵌入的frame的来源。

- img-src：定义了可加载图像的来源。

- media-src：限制视频和音频的来源。

- object-src：限制Flash和其他插件的来源。

- style-src：类似于Script-src，只是作用于css文件。

- report-uri:  告诉浏览器如果请求的资源不被策略允许时，往哪个地址提交日志信息。 特别的：如果想让浏览器只汇报日志，不阻止任何内容，可以改用 Content-Security-Policy-Report-Only 头。

  

1. 网站管理员想要所有的内容均来自网站自己的域，不包括子域。

   `Content-Security-Policy: default-src 'self'`

2. 网站管理员想要所有的内容来自网站自己的域，还有其他子域的内容。

​      `Content-Security-Policy: default-src 'self' *.mydomain.com`

3. 网站管理员想要网站接受信任任意域的图像，指定域的音频视频和指定域的脚本。

      ```
Content-Security-Policy: default-src 'self'; img-src *; media-src media1.com media2.com; script-src userscripts.example.com
      ```

​       在这条策略中，默认情况下，网站只允许加载自己域的内容。但也有例外：

      ```
img-src * 使用*通配符可以加载任意域的图片。
media-src media1.com media2.com 视频音频只允许加载这两个域的
script-src userscripts.example.com 脚本只能加载userscripts.example.com域的
      ```

4. 网站管理员确保在线银行所有内容都通过SSL加载，确保信息不会被截获。

​       `Content-Security-Policy: default-src https:*//onlinebanking.jumbobank.com*`

5. 看github.com的真实CSP例子。Github允许加载任何域的内容，但只能加载指定域的脚本，只能加载指定域的样式并可以执行内联样式，只能通过SSL加载指定域的flash插件。

   ```
   Content-Security-Policy:default-src *; script-src 'self' https://github.global.ssl.fastly.net  https://ssl.google-analytics.com https://collector-cdn.github.com  https://embed.github.com https://raw.github.com; style-src 'self' 'unsafe-inline' https://github.global.ssl.fastly.net; object-src https://github.global.ssl.fastly.net
   ```

   

# CSP总结

CSP并不能消除内容注入攻击，但可以有效的检测并缓解跨站攻击和内容注入攻击带来的危害。

CSP不是做为防御内容注入(如XSS)的第一道防线而设计，而最适合部署在纵深防御体系中。

