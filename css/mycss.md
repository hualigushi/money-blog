## 1.尺寸单位使用rem

```
<script>
export default {}
document.addEventListener('DOMContentLoaded', () => {
  const html = document.querySelector('html')
  let fontSize = window.innerWidth / 10
  fontSize = fontSize > 50 ? 50 : fontSize
  html.style.fontSize = fontSize + 'px'
})

</script>
 
<style>
 #app {
    font-size: 1rem;
  }
</style>


$ratio: 375 / 10;

@function px2rem($px) {
  @return $px / $ratio + rem;
}

 font-size: px2rem(20);
```
&nbsp;

## 2.不允许用户在界面进行长按操作
```
body {
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  -ms-user-select: none;
}

none ：禁止用户选中
text：对用户的选择没有限制
all：目标元素将整体被选中，也就是说不能只选中一部分，浏览器会自动选中整个元素里的内容
```
&nbsp;
## 3.appearance:none 去除浏览器默认样式
```
input {
  appearance:none;
  -moz-appearance:button; /* Firefox */
  -webkit-appearance:none; /* Safari and Chrome */
}
```
&nbsp;
## 4. outline: none 定义无轮廓

outline （轮廓）是绘制于元素周围的一条线，位于边框边缘的外围，可起到突出元素的作用。

注释：轮廓线不会占据空间，也不一定是矩形。
&nbsp;
## 5. ::-webkit-slider-thumb

这是type为range的input标签内的一种伪类样式,用于设置range的滑块的具体样式,该伪类只在内核为webkit/blink的浏览器中有效
&nbsp;
## 6. input type=range 进度条样式

使用linear-gradient 和 background-size 可实现进度条颜色设置

```
.progress {
    background: -webkit-linear-gradient(#5d6268, #5d6268) no-repeat, #b4b5b7;
    background-size: 66% 100%;
}
```
&nbsp;
## 7. font-size:0

```
<div>
  <span>111</span>
</div>
```
div后面和span前面存在间距，可以设置font-size:0
&nbsp;
## 8.多行文本省略

```
@mixin ellipsis2($line) {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: $line;
  word-break: keep-all;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: break-word;
}
```
&nbsp;
## 9.-webkit-overflow-scrolling: touch;

解决移动端滚动卡顿问题

属性控制元素在移动设备上是否使用滚动回弹效果.

auto: 使用普通滚动, 当手指从触摸屏上移开，滚动会立即停止。
touch: 使用具有回弹效果的滚动,当手指从触摸屏上移开，内容会继续保持一段时间的滚动效果。继续滚动的速度和持续的时间和滚动手势的强烈程度成正比。同时也会创建一个新的堆栈上下文。

原理：该属性开启了硬件加速

缺点：耗内存

引发的bug（仅ios）

    3.1 在设置了该属性的滚动容器内手动设置scrollTop时容器会变空白，（内容绘制出错，应该是浏览器底层的问题）

    3.2 手动设置scrollTop,某些机型上的scrollTop值改变了，但是页面不滚动

    3.3 滑动时偶尔卡顿

解决方案

    3.1 & 3.2（规避问题）：在手动改变scrollTop前先将-webkit-overflow-scrolling属性设置为auto,scrollTop改变后再设置回touch

    3.1: 可先让页面延时100ms再滚动1px,空白可以恢复正常

    3.2：给容器的某个子元素高度加1px

    3.3：给容器设置position:static
&nbsp;
## 10.-webkit-tap-highlight-color

这个属性只用于iOS (iPhone和iPad)。
当你点击一个链接或者通过Javascript定义的可点击元素的时候，它就会出现一个半透明的灰色背景。
要重设这个表现，你可以设置-webkit-tap-highlight-color为任何颜色。
想要禁用这个高亮，设置颜色的alpha值为0即可。
&nbsp;
## 11.修改输入框placeholder文字默认颜色  ::-webkit-input-placeholder
&nbsp;
## 12.animation-fill-mode
动画的时间外属性，可设none，forwards，backwards，both。
默认值none表示动画播完后，恢复到初始状态。
forwards当动画播完后，保持@keyframes里最后一帧的属性。
backwards表示开始播动画时，应用@keyframes里第一帧的属性，要看出效果，通常要设animation-delay延迟时间。
both表示forwards和backforwards都应用。
&nbsp;
## 13.CSS3 box-pack box-align 属性
对 div 框的子元素进行居中
```
<style> 
div
{
width:350px;
height:100px;
border:1px solid black;

/* W3C */
display:box;
box-pack:center;
box-align:center;
}
</style>
</head>
<body>

<div>
<p>我是居中对齐的。</p>
</div>
```