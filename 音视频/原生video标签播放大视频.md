视频比较大，直接在加载整个页面显然不是最好的选择，于是想到了m3u8流媒体，将一个大的媒体文件进行分片直接用播放器进行在线播放

> m3u8是HLS协议的部分内容，由苹果公司提出的基于http的流媒体网络传输协议，实现的基本原理是将一个大的媒体文件进行分片，可以理解为m3u8为一个视频播放列表。
>
> 移动端大都支持，但是在pc端除了safari需要引入相应的库来实现



## **具体实现步骤**

- 安装hls.js依赖：npm install hls.js --save
- 代码实现

```js
const Hls = require("hls.js");
mounted(){
    const video = document.getElementById('m3u8video');
    if(!video) return false;
    const videoSrc = video.src
    if (video&&video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
    }
}
```

- 看效果

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e2ce57f3d9dd4a688f34d3d44eea3cc8~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp)

> 发现在谷歌浏览器播放缓存引起了跨域问题，于是想到了最快的解决办法就是就是加时间戳解决缓存问题const videoSrc = video.src+'?time='+(new Date().getTime());效果如下

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f7cacc29cf5d44bb95172c11fe4c4025~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp)

> 可以在视频播放时通过调试查看Network里的xhr请求，会发现一个m3u8文件，和每隔一段时间请求几个ts文件。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cd4fe81bd451469f816b38014343b22c~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp)


