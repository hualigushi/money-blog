在qiankun中有如下配置可以设置子应用的样式隔离

```js
// 启动应用
start({
  sandbox: {
    strictStyleIsolation: true
    experimentalStyleIsolation: true
  }
})
```

- **strictStyleIsolation：** 这种模式下 qiankun 会为每个微应用的容器包裹上一个 [shadow dom](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FWeb_Components%2FUsing_shadow_DOM) 节点，从而确保微应用的样式不会对全局造成影响。
- **experimentalStyleIsolation：** 当 experimentalStyleIsolation 被设置为 true 时，qiankun 会改写子应用所添加的样式为所有样式规则增加一个特殊的选择器规则来限定其影响范围



## 1. 严格沙箱

在加载子应用时，添加`strictStyleIsolation: true`属性，实现形式为将整个子应用放到`Shadow DOM`内进行嵌入，完全隔离了主子应用

缺点：

- 子应用的弹窗、抽屉、popover因找不到主应用的body会丢失，或跑到整个屏幕外（具体原因作者并未详细研究）
- 主应用不方便去修改子应用的样式



## 2. 实验性沙箱

在加载子应用时，添加`experimentalStyleIsolation: true`属性，实现形式类似于vue中style标签中的scoped属性，qiankun会自动为子应用所有的样式增加后缀标签，如：`div[data-qiankun-microName]`

缺点：

- 子应用的弹窗、抽屉、popover因插入到了主应用的body，所以导致样式丢失或应用了主应用了样式

qiankun内处理experimentalStyleIsolation选项的主要逻辑并不复杂：遍历所有的style标签，分别获取每个标签内所有样式的选择器和css文本（利用StyleElement.sheet获取CSSStyleSheet，从而获取各条样式的具体信息），并对其进行处理，根选择器替换为前缀，普通的选择器前面直接加上前缀。



