# preload
声明式的资源获取请求，可以指明哪些资源是在页面加载完成后即刻需要的

`<link rel="preload" href="fonts/cicle_fina-webfont.woff" as="font" type="font/woff" crossorigin="anonymous">`

1. rel="preolad"声明这是一个preload
2. href指明资源的位置
3. as指明资源类型（这是为了让浏览器精确设置优先级，设置正确的CSP、Accept头部）(值类型：script style image media document font)
   - 浏览器可以确保请求是符合内容安全策略的，比如，如果我们的安全策略是Content-Security-Policy: script-src 'self'，
      只允许浏览器执行自家服务器的脚本，as 值为 script 的外部服务器资源就不会被加载。
   - 浏览器能根据 as 的值发送适当的 Accept 头部信息
   - 浏览器通过 as 值能得知资源类型，因此当获取的资源相同时，浏览器能够判断前面获取的资源是否能重用。
   - 如果对所 preload 的资源不使用明确的 “as” 属性，将会导致二次获取
   - 忽略 as 属性，或者错误的 as 属性会使 preload 等同于 XHR 请求，浏览器不知道加载的是什么，因此会赋予此类资源非常低的加载优先级。
   - preload as="style" 将会获得比 as=“script” 更高的优先级
4. crossorigin 指明使用的跨域设置
5. preload 字体不带 crossorigin 会二次获取！ 

   确保对 preload 的字体添加 crossorigin 属性，否则字体文件会被下载两次，这个请求使用匿名的跨域模式。
   
   这个建议也适用于字体文件在相同域名下，也适用于其他域名的获取(比如说默认的异步获取)

### preload和onload事件
`<link rel="preload" href="..." as="..." onload="preloadFinished()">`

添加preload声明之后，浏览器初次加载的资源变多了，但preload并不会阻塞onload事件的触发。

preload是声明式获取，促使浏览器请求资源但不阻塞document的onload事件。

### 响应式预加载
link标签还可以接收一个media属性，进行简单的媒体查询。例如这样：

```
<link rel="preload" href="bg-image-narrow.png" as="image" media="(max-width: 600px)">
<link rel="preload" href="bg-image-wide.png" as="image" media="(min-width: 601px)">
```
### 动态加载
```
var link = document.createElement("link");
link.href = "myscript.js";
link.rel = "preload";
link.as = "script";
document.head.appendChild(link);
```

上面这段代码可以让你预先加载脚本，下面这段代码可以让脚本执行
```
var script = document.createElement("script");
script.src = "myscript.js";
document.body.appendChild(script);
```


# prefetch
prefetch是对浏览器的暗示，暗示将来可能需要某些资源，但由代理决定是否加载以及什么时候加载这些资源。

该方法的加载优先级非常低,该方式的作用是加速下一个页面的加载速度。

场景：用户正在登陆页面，登陆成功之后会跳转到首页。我是否可以在登陆页面就去请求首页的资源呢？

`<link rel="prefetch" href="main.js">`

prefetch跟preload不同在于，用户从A页面进入B页面，preload的会失效，而prefetch的内容可以在B页面使用。

preload 和 prefetch 混用的话，并不会复用资源，而是会重复加载

# webpack中的应用
使用preload:
`import(/* webpackPreload: true */ 'ChartingLibrary');`

使用prefetch
`import(/* webpackPrefetch: true */ 'LoginModal');`
