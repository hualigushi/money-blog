

[TOC]

# 1. 录制原理

rrweb 对于录制与回放的实现主要由 rrweb、rrweb-snapshot、rrweb-player 三部分组成，其对页面录制和回放有很好的支持性，

下图演示了录制和回放的大致操作流程。
 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a09a0a97f80a4dc0ad5a418e70c402e7~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp) rrweb 在录制时会首先进行首屏 DOM 快照，遍历整个页面的 DOM Tree 并通过 nodeType 映射转换为 JSON 结构数据，

同时针对增量改变的数据同步转换为 JSON 数据进行存储。整个录制的过程会生成 unique id 来确定增量数据所对应的 DOM 节点，

通过 timestamp 保证回放顺序，下图分别对应首屏快照和录制原理图。
 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d589ff7f7c964105b00d58475511cacb~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp) ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/42e58778a27e4acc87ce1563fdcce4a6~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp) 对于首屏快照后的增量数据更新，则是通过 mutationObserver 获取 DOM 增量变化，通过全局事件监听、事件（属性）代理的方式进行方法（属性）劫持，并将劫持到的增量变化数据存入 JSON 数据中。 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/32d24e77a67544bca538a8b1a33fdda2~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp)



# 2. 回放原理

回放功能的原理和录制有些类似，首先针对首屏 DOM 快照进行重建，在遍历 JSON 产物的同时通过自定义 type 映射到不同的节点构建方法，重建首屏的 DOM 结构。 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9524a3dd44494d6db4427960c4b8c6d4~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp) 而对于录制产生的增量数据，rrweb 内部则根据不同的增量类型调用不同的函数，在页面进行展现。

同时，播放时通过录制产生的时间戳来保证回放顺序，通过 Node id 作用至指定的 DOM 节点，通过 requestAnimationFrame 保证页面播放流畅度。 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/91482deaba9c450293084ee871aba7c2~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp)





# 小结

相对于视频的形式来说，通过录制页面结构和行为来实现录屏，不仅数据可操作性更强（例如可以对 JSON 产物进行加密、压缩、分段、剔除等操作），还可以进行多方式传输（例如分段传输、指定业务场景传输）。

同时，页面录制的使用场景也较为丰富，可以用来定位问题、产品使用分析、自动化测试记录、重要信息（操作）备份以及多人协作等场景。




