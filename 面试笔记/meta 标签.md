## 作用

 - 搜索引擎（SEO）优化；
 - 定义页面使用语言；
 - 自动刷新页面；
 - 控制页面缓存；
 - 网页定级评价；
 - 控制页面显示的窗口；
 
## 使用

<meta>标签总共有 2 个属性，不同的属性和值组成了网页不同的功能：

 - name
 - http-equiv
 
 ### name 属性
 name属性主要是用于描述网页的，对应content属性中的内容是便于搜索引擎查找和分类信息。
 
 1. name="keywords",它是用来设置，让搜索引擎获取网页的关键字
 2. name="description",它是用来设置，让搜索引擎获取网页的内容描述
 3. name="robots",它是用来设置，让搜索引擎哪些页面需要索引，哪些页面不需要索引。content 有如下参数：
  - all：文件将被检索，且页面上的链接可以被查询；
  - none：文件将不被检索，且页面上的链接不可以被查询；
  - index：文件将被检索；
  - noindex：文件将不被检索，但页面上的链接可以被查询；
  - follow：页面上的链接可以被查询；
  - nofollow：文件将被检索，但页面上的链接不可以被查询。
 4. name="author",它是来设置页面的作者
 5. name="generator",它是来设置网站采用什么软件制作的
 6. name="COPYRIGHT",它是来设置网站的版权信息的
 7. name="revisit-after",它是来设置网站的重访，30day代表30天
 8. name="viewport",它是来控制浏览器窗口的大小和缩放的  
    `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />`
 
 ### http-equiv 属性
http-equiv相当于 HTTP 的文件头的设置

 1. http-equiv="expires",它是来设置网页的过期时间的
 2. http-equiv="Pragma",它是来设置禁止浏览器从本地缓存中访问页面   
    `<meta http-equiv="Pragma" content="no-cache" />`
 3. http-equiv="Refresh",它是来设置自动刷新并跳转新页面，其中content第一个数字代表 5 秒后自动刷新  
    `<meta http-equiv="Refresh" content="5;URL=http://m.baichanghui.com" />`
 4. http-equiv="Set-Cookie",它是来设置 Cookie 的  
    `<meta http-equiv="Set-Cookie" content="cookie value=xxx;expires=Friday,12-Jan-200118:18:18GMT；path=/" />`
 5. http-equiv="Window-target",强制页面在当前窗口以独立页面显示  
    `<meta http-equiv="Window-target" content="top" />`
 6. http-equiv="content-Type",它是来设置页面使用的字符集  
    `<meta http-equiv="content-Type" content="text/html;charset=gb2312" />`
 7. http-equiv="Content-Language",它是来设置页面的语言的  
    `<meta http-equiv="Content-Language" content="zh-cn" />`
 8. http-equiv="Cache-Control",它是设置页面缓存  
    `<meta http-equiv="Cache-Control" content="no-cache" />`
 9. http-equiv="Content-Script-Type",它是设置页面中脚本的类型  
    `<meta http-equiv="Content-Script-Type" content="text/javascript" />`
    
    
  ```
  <!DOCTYPE html> <!-- 使用 HTML5 doctype，不区分大小写 -->
<html lang="zh-cmn-Hans"> <!-- 更加标准的 lang 属性写法 http://zhi.hu/XyIa -->
<head>
    <!-- 声明文档使用的字符编码 -->
    <meta charset='utf-8'>
    <!-- 优先使用 IE 最新版本和 Chrome -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <!-- 页面描述 -->
    <meta name="description" content="不超过150个字符"/>
    <!-- 页面关键词 -->
    <meta name="keywords" content=""/>
    <!-- 网页作者 -->
    <meta name="author" content="name, email@gmail.com"/>
    <!-- 搜索引擎抓取 -->
    <meta name="robots" content="index,follow"/>
    <!-- 为移动设备添加 viewport -->
    <meta name="viewport" content="initial-scale=1, maximum-scale=3, minimum-scale=1, user-scalable=no">
    <!-- `width=device-width` 会导致 iPhone 5 添加到主屏后以 WebApp 全屏模式打开页面时出现黑边 http://bigc.at/ios-webapp-viewport-meta.orz -->

    <!-- iOS 设备 begin -->
    <meta name="apple-mobile-web-app-title" content="标题">
    <!-- 添加到主屏后的标题（iOS 6 新增） -->
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <!-- 是否启用 WebApp 全屏模式，删除苹果默认的工具栏和菜单栏 -->

    <meta name="apple-itunes-app" content="app-id=myAppStoreID, affiliate-data=myAffiliateData, app-argument=myURL">
    <!-- 添加智能 App 广告条 Smart App Banner（iOS 6+ Safari） -->
    <meta name="apple-mobile-web-app-status-bar-style" content="black"/>
    <!-- 设置苹果工具栏颜色 -->
    <meta name="format-detection" content="telphone=no, email=no"/>
    <!-- 忽略页面中的数字识别为电话，忽略email识别 -->
    <!-- 启用360浏览器的极速模式(webkit) -->
    <meta name="renderer" content="webkit">
    <!-- 避免IE使用兼容模式 -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!-- 不让百度转码 -->
    <meta http-equiv="Cache-Control" content="no-siteapp" />
    <!-- 针对手持设备优化，主要是针对一些老的不识别viewport的浏览器，比如黑莓 -->
    <meta name="HandheldFriendly" content="true">
    <!-- 微软的老式浏览器 -->
    <meta name="MobileOptimized" content="320">
    <!-- uc强制竖屏 -->
    <meta name="screen-orientation" content="portrait">
    <!-- QQ强制竖屏 -->
    <meta name="x5-orientation" content="portrait">
    <!-- UC强制全屏 -->
    <meta name="full-screen" content="yes">
    <!-- QQ强制全屏 -->
    <meta name="x5-fullscreen" content="true">
    <!-- UC应用模式 -->
    <meta name="browsermode" content="application">
    <!-- QQ应用模式 -->
    <meta name="x5-page-mode" content="app">
    <!-- windows phone 点击无高光 -->
    <meta name="msapplication-tap-highlight" content="no">
    <!-- iOS 图标 begin -->
    <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-57x57-precomposed.png"/>
    <!-- iPhone 和 iTouch，默认 57x57 像素，必须有 -->
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/apple-touch-icon-114x114-precomposed.png"/>
    <!-- Retina iPhone 和 Retina iTouch，114x114 像素，可以没有，但推荐有 -->
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="/apple-touch-icon-144x144-precomposed.png"/>
    <!-- Retina iPad，144x144 像素，可以没有，但推荐有 -->
    <!-- iOS 图标 end -->

    <!-- iOS 启动画面 begin -->
    <link rel="apple-touch-startup-image" sizes="768x1004" href="/splash-screen-768x1004.png"/>
    <!-- iPad 竖屏 768 x 1004（标准分辨率） -->
    <link rel="apple-touch-startup-image" sizes="1536x2008" href="/splash-screen-1536x2008.png"/>
    <!-- iPad 竖屏 1536x2008（Retina） -->
    <link rel="apple-touch-startup-image" sizes="1024x748" href="/Default-Portrait-1024x748.png"/>
    <!-- iPad 横屏 1024x748（标准分辨率） -->
    <link rel="apple-touch-startup-image" sizes="2048x1496" href="/splash-screen-2048x1496.png"/>
    <!-- iPad 横屏 2048x1496（Retina） -->

    <link rel="apple-touch-startup-image" href="/splash-screen-320x480.png"/>
    <!-- iPhone/iPod Touch 竖屏 320x480 (标准分辨率) -->
    <link rel="apple-touch-startup-image" sizes="640x960" href="/splash-screen-640x960.png"/>
    <!-- iPhone/iPod Touch 竖屏 640x960 (Retina) -->
    <link rel="apple-touch-startup-image" sizes="640x1136" href="/splash-screen-640x1136.png"/>
    <!-- iPhone 5/iPod Touch 5 竖屏 640x1136 (Retina) -->
    <!-- iOS 启动画面 end -->

    <!-- iOS 设备 end -->
    <meta name="msapplication-TileColor" content="#000"/>
    <!-- Windows 8 磁贴颜色 -->
    <meta name="msapplication-TileImage" content="icon.png"/>
    <!-- Windows 8 磁贴图标 -->

    <link rel="alternate" type="application/rss+xml" title="RSS" href="/rss.xml"/>
    <!-- 添加 RSS 订阅 -->
    <link rel="shortcut icon" type="image/ico" href="/favicon.ico"/>
    <!-- 添加 favicon icon -->

    <!-- sns 社交标签 begin -->
    <!-- 参考微博API -->
    <meta property="og:type" content="类型" />
    <meta property="og:url" content="URL地址" />
    <meta property="og:title" content="标题" />
    <meta property="og:image" content="图片" />
    <meta property="og:description" content="描述" />
    <!-- sns 社交标签 end -->

    <title>标题</title>
</head>
```
