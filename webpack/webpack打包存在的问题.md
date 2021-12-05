最开始打包是基于webpack的，在按需加载上存在的体积冗余会比较大，如：

- `webpack`打包特有的模块加载器函数，这部分其实有些多余，最好去掉
- 使用`babel`转码时，`babel`带来的`helper`函数全部是内联状态，需要转成`import`或`require`来引入
- 使用`transform-rumtime`对一些新特性添加`polyfill`，也是内联状态，需要转成`import`或`require`来引入
- `vue-loader`带来的额外代码，如`normalizeComponent`，不做处理也是内联
- `transform-vue-jsx`带来的额外函数引入，如`mergeJSXProps`，不做处理也是内联

以上几个问题，如果只是一份代码，那不会有太大问题，但是如果是按需加载，用户一旦引入多个组件，以上的代码就会出现多份，带来严重的影响

```
import { Button, Icon } from 'gs-ui'
```

以上代码会转成

```
import Button from 'gs-ui/lib/button.js'
import Icon from 'gs-ui/lib/icon.js'
```

这样，就会出现多份相同的`helper`函数代码，多份`webpack`的模块加载器函数，而且还不好去重

  

