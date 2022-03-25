# `requestAnimationFrame` 的执行机制

`requestAnimationFrame` 在浏览器每一帧开始绘制之前会执行。

借助 `requestAnimationFrame` 高效的执行效率，我们可以使用`requestAnimationFrame` 进行动画操作、FPS 的计算、甚至可以通过算每一帧所需要的真实时间，来增加帧数。 ![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/636e3fb0e4d146989352eb8ac2180fa5~tplv-k3u1fbpfcp-watermark.awebp)

在[MDN](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FAPI%2FWindow%2FrequestAnimationFrame)中，还有这样一句话：**在多数遵循W3C建议的浏览器中，回调函数执行次数通常与浏览器屏幕刷新次数相匹配**。



# 屏幕刷新率特别快怎么办？

这句话令人深思。在如今高刷显示器盛行的年代，我依然在使用60hz的MacBook。

虽然MDN写着匹配，但这个也不一定对。带着这个疑问，我开始了探索之旅。

作为一个半数码党，对于现在数码产品显示器的刷新率种类还是懂一点的。有120hz，144hz等等。我抱着试试看的心态，去搜了144hz下 `requestAnimationFrame` 的状况



## 现状

果然不出所料。我通过搜索，找到了一篇问答帖：这位网友讲，它使用了`165hz`的显示器，但通过`requestAnimationFrame` 计算出来的`FPS`依然只有`30-60fps`。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/838ddbe4a7cb4d5a9081d728a9456fd3~tplv-k3u1fbpfcp-watermark.awebp)

那就证明了，的确在一部分用户下，刷新率和 `requestAnimationFrame` 存在不同步问题。可是在回答区，有一部分用户也反馈，他们屏幕刷新率和 `requestAnimationFrame` 是同步的。**这样也印证了大概率是一个Bug。**



## 真的是 Bug

于是我去`Chromium Bugs`网站内去查找，找到了这样的一个[Issue](https://link.juejin.cn?target=https%3A%2F%2Fbugs.chromium.org%2Fp%2Fchromium%2Fissues%2Fdetail%3Fid%3D535392)。内容也在写，使用了`144hz`刷新率的显示器，但FPS上限依然只有60。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5b517a4d03c244f6abbbe947e2e3a02a~tplv-k3u1fbpfcp-watermark.awebp)

于是我抛弃掉一部分争论，直接找修复的代码和备注。继续向下翻，找到了`chromium`官方人员关于只有`60fps`的解释：

> On Linux Nvidia we use GLX_SGI_video_sync to time vsyncs. Unfortunatelyit's difficult to calculate an accurate refresh rate with it because itsvideo sync counter is wrong. Before, we hardcoded 60 FPS. Now insteadwe use xrandr to get the refresh rate of the primary monitor.

其大意是，由于在`Linux`下的`Nvdia`驱动，在使用`GLX_SGI_video_sync`进行计算`vsyncs`(垂直同步)的时间时，由于计数器错误，于是官方直接将`60FPS`**进行硬编码**。现在，他们换成了使用`xrandr`进行获取刷新率计算。

> xrandr 是一款Linux官方的 RandR (Resize and Rotate)。它可以设置屏幕显示的大小、方向、镜像等。[wiki.archlinux.org/index.php/X…](https://link.juejin.cn?target=https%3A%2F%2Fwiki.archlinux.org%2Findex.php%2FXrandr_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))

既然是`Bug`，那我们就看下`Chromium`到底是怎么修复的



## 修复逻辑

找到回答中具体的`commit`记录，然后链接到`Chromium Gerrit`平台。来到了这个[CR详情](https://link.juejin.cn?target=https%3A%2F%2Fchromium-review.googlesource.com%2Fc%2Fchromium%2Fsrc%2F%2B%2F1812241)

来到 [gl_surface_glx.cc](https://link.juejin.cn?target=https%3A%2F%2Fchromium-review.googlesource.com%2Fc%2Fchromium%2Fsrc%2F%2B%2F1812241%2F4%2Fui%2Fgl%2Fgl_surface_glx.cc)这个文件。`glx`是`Chromium`中硬件加速相关的代码

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f9b8c38c9a064507b35ea542ca92e9f8~tplv-k3u1fbpfcp-watermark.awebp)

可以看到，其中的一个float变量叫 `refresh_rate`，这个就是最后计算刷新率的值。

然后使用 `(1 / refresh_rate)`，计算出刷新一次所控制的秒。

如果是`60hz`，则 `1000ms / 60次 = 16.66ms` 1次。

这里我们继续跟 `refresh_rate` 的计算方法 => `GetRefreshRateFromXRRModeInfo`。

找到 [x11_display_util.cc](https://link.juejin.cn?target=https%3A%2F%2Fchromium-review.googlesource.com%2Fc%2Fchromium%2Fsrc%2F%2B%2F1812241%2F4%2Fui%2Fbase%2Fx%2Fx11_display_util.cc) 文件可以看到逻辑

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9e9bcb18cdf84d719177491b040d2e64~tplv-k3u1fbpfcp-watermark.awebp)

这里可以看到，其计算逻辑是 `Pixel Clock / (Horizontal Total * Vertical Total)`。

那么这三个数值代表什么意思呢？

- `Pixel Clock` 时钟频率，是显示器每秒钟绘制的像素数。
- `Horizontal Total` 每一帧绘制的水平像素数量
- `Vertical Total` 每一帧绘制的垂直像素数量

即`时钟每秒处理的像素数量 / (水平像素数量) * (行像素数量)`。



## 关于多显示器

从`Chromium Gerrit`平台提交的代码注释中可以看到，多显示器支持其实是存在问题的。

这里可以参考另外一个[Bug](https://link.juejin.cn?target=https%3A%2F%2Fbugs.chromium.org%2Fp%2Fchromium%2Fissues%2Fdetail%3Fid%3D726842)。这位同学使用了`144hz + 60hz`的显示器，但输出依然是`60fps`

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ed1a442887ef4d78988eea9827f0a088~tplv-k3u1fbpfcp-watermark.awebp)

目前官方人员只提出了解决方案，但没有看到任何`commit`有产出。所以这还是个`Bug`