overscroll-behavior是overscroll-behavior-x和overscroll-behavior-y的简写属性，它控制的是元素滚动到边界时的表现。

在CSS世界里，滚动也有冒泡机制，当内部元素滚动到边界时，如果继续滚动，会带动外层祖先元素发生滚动，这种现象被称为滚动链，

结合我们实际开发场景来看，通常是我们的页面中需要开发一个弹窗，但是弹出弹窗后，用户滚动滚轮仍然可以滚动页面。

那么我们利用这个属性就可以在弹出弹窗后禁止滚动背后的页面。

## 属性

先看一张MDN官方的属性值及其描述的图。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2033a66ff7964d60b43ed86539e1c6d0~tplv-k3u1fbpfcp-watermark.image)

auto： 默认值，但是要注意，这里的auto是包含移动端的触底效果的

contain：本文的主要讲解属性

none：禁止滚动效果（包含触底）

## 看个案例

官方示例是添加属性之后，为了方便掩饰，我使用了默认值进行录制。

而这也是我们经常遇到的情况，在有弹窗时，滚动弹窗会导致页面跟随滚动。

[官方实例看这里](https://mdn.github.io/css-examples/overscroll-behavior/)

![demo.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f62fb4625bcb4e30b7a89a33d6af62dc~tplv-k3u1fbpfcp-watermark.image)

跟随官方示例，如果希望做到滚动弹窗而不影响页面时，我们只需要在摊床上添加属性**oversroll-behavior:contain**即可以实现滚动弹窗而不影响页面的效果了。

## 兼容

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3908c67df3dd4c3d82f48a4d2c233812~tplv-k3u1fbpfcp-watermark.image)

不能说是完全没法用，只能说是有点惨烈。

不过主流的Chrome、Firefox、edge的兼容都是还可以的。

所以如果有需要应用的话，还是值得考虑的。

部分不兼容的页面最多是没有这个效果，但是主流浏览器的用户都可以正常访问使用。