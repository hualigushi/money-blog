[TOC]



# 1 px rem 转换

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

# 2 不允许用户在界面进行长按操作
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

# 3 appearance:none 去除浏览器默认样式
```
input {
  appearance:none;
  -moz-appearance:button; /* Firefox */
  -webkit-appearance:none; /* Safari and Chrome */
}
```
&nbsp;

# 4 outline: none 定义无轮廓

outline （轮廓）是绘制于元素周围的一条线，位于边框边缘的外围，可起到突出元素的作用。

注释：轮廓线不会占据空间，也不一定是矩形。
&nbsp;

# 5 ::-webkit-slider-thumb

这是type为range的input标签内的一种伪类样式,用于设置range的滑块的具体样式,该伪类只在内核为webkit/blink的浏览器中有效
&nbsp;

# 6 input type=range 进度条样式

使用linear-gradient 和 background-size 可实现进度条颜色设置

```
.progress {
    background: -webkit-linear-gradient(#5d6268, #5d6268) no-repeat, #b4b5b7;
    background-size: 66% 100%;
}
```
&nbsp;

# 7 font-size:0

```
<div>
  <span>111</span>
</div>
```
div后面和span前面存在间距，可以设置font-size:0
&nbsp;

# 8 -webkit-tap-highlight-color

这个属性只用于iOS (iPhone和iPad)。
当你点击一个链接或者通过Javascript定义的可点击元素的时候，它就会出现一个半透明的灰色背景。
要重设这个表现，你可以设置-webkit-tap-highlight-color为任何颜色。
想要禁用这个高亮，设置颜色的alpha值为0即可。

&nbsp;

# 9.修改输入框placeholder文字默认颜色  ::-webkit-input-placeholder
&nbsp;


# 10 CSS3 box-pack box-align 属性

对 div 框的子元素进行居中
```css
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



# 11 图片引入 `image-set()`

```css
.logo {
    background-image: image-set(url(logo@1x.png);
    background-image: image-set(url(logo@1x.png) 1x,url(logo@2x.png) 2x);
}
```
根据不同的dpr显示不同的图像



# 12 img srcset sizes

```html
<img src="lighthouse-200.jpg" sizes="50vw"
    srcset="lighthouse-100.jpg 100w, lighthouse-200.jpg 200w,
            lighthouse-400.jpg 400w, lighthouse-800.jpg 800w,
            lighthouse-1000.jpg 1000w, lighthouse-1400.jpg 1400w,
            lighthouse-1800.jpg 1800w" alt="a lighthouse">
```

如果没有设置srcset属性，或者没值，那么sizes属性也将不起作用

渲染了一张宽度为视窗宽度一半（sizes="50vw"）的图像，根据浏览器的宽度及其设备像素比，允许浏览器选择正确的图像，而不考虑浏览器窗口有多大。



# 13 p 标签不能包含 div

p 标签中的内容构成 `Phrasing content`, 如果包含则将div从p中提取出来

p元素是不能包含块级元素（包括p自身）

```
address,article,aside,base,blockquote,body,caption,col,colgroup,dd,
  details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,
  h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,
  optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,
  title,tr,track
```



# 14 快速重置表单元素 unset

`button { all: unset; }`



# 15 规定图像展示方式

显示图片的时候会遇到这种问题，对面返回的图片宽高比例是不一样的。但是设置的容器大小是一样的，这个时候需要让图片保持比例最大填充容器。

`object-fit：fill | contain | cover | none | scale-down`



# 16 模拟input的placeholder

思路：利用伪类添加自定义属性 （在input为空并且失焦添加placeholder属性）

tip：也可以用此方法来改变placeholder默认颜色

```css
.input:empty:not(:focus):before{
  content: attr(placeholder);
  color: #aaaeb9;
  font-size: 14px;
  line-height: 22px;
}
```





# 17 `background-attatchment` 

图片是否会随着页面滚动而滚动

