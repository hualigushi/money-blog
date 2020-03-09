BFC就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素,

在一个BFC中，块盒与行盒（行盒由一行中所有的内联元素所组成）都会垂直的沿着其父元素的边框排列。

# BFC的布局规则

- 内部的Box会在垂直方向，一个接一个地放置。

- Box垂直方向的距离由margin决定。属于同一个BFC的两个相邻Box的margin会发生重叠。

- 每个盒子（块盒与行盒）的margin box的左边，与包含块border box的左边相接触(对于从左往右的格式化，否则相反)。即使存在浮动也是如此。

- BFC的区域不会与float box重叠。

- BFC就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。反之也如此。

- 计算BFC的高度时，浮动元素也参与计算。

# 如何创建BFC

1、 float的值不是none。
2、 position的值不是static或者relative。
3、 display的值是inline-block、table-cell、flex、table-caption或者inline-flex
4、 overflow的值不是visible

[什么是BFC？看这一篇就够了](https://blog.csdn.net/sinat_36422236/article/details/88763187)
