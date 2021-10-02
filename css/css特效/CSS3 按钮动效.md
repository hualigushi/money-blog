[TOC]

## 按钮阴影（box-shadow）

利用 `box-shadow` 和 `hover` 状态，实现鼠标移动到按钮产生悬浮效果。利用 `transition`，展示动态的浮动过程。

```css
.button {
  background-color: #4caf50;
  border: none;
  border-radius: 20px;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  transition-duration: 0.4s;
}

.button:hover {
  box-shadow: 0 12px 16px 0 rgba(0, 0, 0, 0.24), 0 17px 50px 0 rgba(0, 0, 0, 0.19);
}
```

![01.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/91e2e22a6b8e4ecbb0f657486aedba06~tplv-k3u1fbpfcp-watermark.awebp)

## 按钮禁用（disabled）

添加灰度、透明度和禁用鼠标图标，告诉用户该按钮是禁用的；`pointer-events` 保护禁用的按钮不触发任何事件。

```css
.disabled {
  opacity: 0.6;
  filter: grayscale(100%);
  pointer-events: none;
  cursor: not-allowed;
}
```

![01.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e0cc117487bb451c8b2464f9ee017e86~tplv-k3u1fbpfcp-watermark.awebp)

## 按钮动画

### 出现箭头

通过改变箭头的透明度（opacity）和 right 定位，hover 时从右向左插入箭头；此时配合文字的 padding-right，产生文字左移的效果：

```css
/* span：文字容器 */
.button span {
  cursor: pointer;
  display: inline-block;
  position: relative;
  transition: 0.5s;
}

/* 箭头：>> */
.button span:after {
  content: "»";
  position: absolute;
  opacity: 0;
  top: 0;
  right: -20px;
  transition: 0.5s;
}

/* 文字左移 */
.button:hover span {
  padding-right: 25px;
}

/* 箭头从右侧出现 */
.button:hover span:after {
  opacity: 1;
  right: 0;
}
```

![01.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/91f67daefe6c4127b47e38d3d14b1673~tplv-k3u1fbpfcp-watermark.awebp)

### “波纹” 效果

我们用一个伪元素来实现水波纹（`:after`），通过设置点击状态（`:active`）和普通状态间的差异来实现水波纹效果。

普通状态下，伪元素是一个完全覆盖按钮的带透明度的圆形，默认隐藏。

```css
button:after {
  content: "";
  position: absolute; /* 为了保持和button的位置关系 */
  bottom: 0;
  left: 0;
  width: 150px;
  height: 150px;
  border-radius: 50% 50%; /* 水波纹圆形 */
  background: rgba(255, 255, 255, 0.4); /* 水波纹颜色 */
  transform: scale(2);
  opacity: 0;
  transition: all 0.8s;
}
```

点击按钮时，触发`:active`状态，我们让伪元素迅速缩小，即没有过渡效果（`transition-duration: 0s`），并显示（`opacity: 1`）。

```css
button:active:after {
  transform: scale(0);
  opacity: 1;
  transition-duration: 0s;
}
```

当 `:active` 状态消失时，伪元素的复原（放大）过程就会产生水波纹效果。

到这里是纯 CSS 实现的效果，如果希望水波纹的波心由鼠标点击位置决定，可以通过改变伪元素的定位实现（点击时获取位置，赋值给伪元素）。

![01.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9c4cbc2ce1f4488daf95977dd76da0eb~tplv-k3u1fbpfcp-watermark.awebp)

### “按压” 效果

`:hover` 和 `:active` 时，加深按钮背景色；`:active` 时，缩短按钮的阴影范围（比如 4px）并让按钮向下平移减少的距离（4px），同时加深阴影颜色：

```css
.button {
  /* 其他按钮样式... */
  background-color: #4caf50;
  box-shadow: 0 9px #999;
}

.button:hover {
  background-color: #3e8e41;
}

.button:active {
  background-color: #3e8e41;
  box-shadow: 0 5px #666;
  transform: translateY(4px);
}
复制代码
```

![01.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fa85ddd5f69a4de2aca8c5decc67e6bf~tplv-k3u1fbpfcp-watermark.awebp)


