## 异步加载

#### 1. 利用媒体查询

设置一个当前浏览器不支持的值：

```
<link rel="stylesheet" href="./index.css" media="none" onload="this.media='all'">
```

这样浏览器将会异步加载这个`CSS`文件（优先度比较低），在加载完毕之后，使用`onload`属性将`link`的媒体类型设置为`all`，然后便开始渲染。

如果有如下代码：

```
<link rel="stylesheet" href="./index2.css" media="none" onload="this.media='all'">
<link rel="stylesheet" href="./index1.css">
```

浏览器加载优先级如下：

![img](https://mmbiz.qpic.cn/mmbiz_png/iaibsyicqkwnjvZic7ibLEjKHMkqBVnqPfmUibJ9QicficGasiamWWvnRuxdKiaez2et0qccZDOS2FdUyZkC77HIrLU3sbkA/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

又或者有如下代码：

```
<link rel="stylesheet" href="./index1.css" media="screen and (max-width: 800px)">
<link rel="stylesheet" href="./index2.css" media="screen and (min-width: 800px)">
```

刷新页面时，如果`视窗`宽度小于`800px`，那么优先加载`index1.css`，如果大于`800px`，则相反：

![img](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjvZic7ibLEjKHMkqBVnqPfmUibFmI3ibg9u9fdyVyHftzKvy9CFn7K6jXUjFoopORGkUtuk6KwjvemtfQ/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

总结：媒体查询不匹配的样式优先级低。



#### 2. 提前加载资源

这个跟上述类似，但是优先级是`最高`的，不过还是异步加载，不会阻塞DOM的渲染，只是浏览器支持度比较低。

```
<link rel="preload" href="./index.css" as="style">
```

告诉浏览器`"请提前加载好此资源，我后面会用到！"`。当用到的时候，浏览器便从缓存中拿取。

所以正确操作跟媒体查询一样：

```
<link rel="preload" href="./index.css" as="style" onload="this.rel='stylesheet'">
```

当然，该属性还可以应用于其他资源，当你需要用到这些资源的时候，浏览器会直接从`缓存`中拿，不再次发送请求了。

```
<link rel="preload" href="./index.js" as="script">
<link rel="preload" href="./index.png" as="image">
<link rel="preload" href="./index.mp4" as="video" type="video/mp4">
```



#### 3. 

```
let link = document.createElement("link");
link.rel = "stylesheet";
link.href = "./index1.css";

document.head.appendChild(link);
```