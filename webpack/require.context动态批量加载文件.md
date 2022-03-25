# 需求
在组件中一次性引入十张图片
```
// 就是这么任性，下标从0开始~
import frame0 from './assets/frame_0.png'
import frame1 from './assets/frame_1.png'
import frame2 from './assets/frame_2.png'
// ..省略n张
import frame7 from './assets/frame_8.png'
import frame8 from './assets/frame_9.png'
import frame9 from './assets/frame_10.png'
```

# require.context
```js
require.context(
  directory: String,
  includeSubdirs: Boolean /* 可选的，默认值是 true */,
  filter: RegExp /* 可选的，默认值是 /^\.\/.*$/，所有文件 */,
  mode: String  /* 可选的，'sync' | 'eager' | 'weak' | 'lazy' | 'lazy-once'，默认值是 'sync' */
)
```

指定一系列完整的依赖关系，通过一个 directory 路径、一个 includeSubdirs 选项、一个 filter 更细粒度的控制模块引入和一个 mode 定义加载方式。

然后可以很容易地解析模块.

```js
const frames = []
const context = require.context('./assets/images', false, /frame_\d+.png/)
context.keys().forEach(k => {
    frames.push(context(k))
})
```
这里的代码通过 require.context 创建了一个 require 上下文。

 - 第一个参数指定了需要加载的文件夹，即组件当前目录下的 ./assets/images 文件夹

 - 第二个参数指定是否需要包含子目录，由于没有子目录，所以传 false

 - 第三个参数指定需要包含的文件的匹配规则，我们用一个正则表示
 
 然后使用 context.keys() 就能拿到该上下文的文件路径列表，而 context 本身也是一个方法，
 
 相当于设置过上下文的 require，我们将 require 后的文件放入数组中，数组中的路径其实是带 hash 值的
 
 ## 重构一下
 公共模块：
```js
/**
 * 批量加载帧图片
 * @param {Function} context - require.context 创建的函数
 * @returns {Array<string>} 返回的所有图片
 */
function loadFrames (context) {
  const frames = []
  context.keys().forEach(k => {
    frames.push(context(k))
  })
  return frames
}
```

组件中：
```js
const context = require.context('./assets/images', false, /frame_\d+.png/)
const frames = loadFrames(context)
```
