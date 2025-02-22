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



# 18 虚线效果

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/R1mJgWWSMA3oCVBoskibbAuTXGVgWRe6yMZqIkW0E0qc7gfrgy7UKvzFFzAeYffKicMKtTWlMXNkXDTCft5iavdyg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

```css
.dotted-line{    
	border: 1px dashed transparent;    
  background: linear-gradient(white,white) padding-box, repeating-linear-gradient(-45deg,#ccc 0, #ccc .25em,white 0,white .75em);
}

```

css自带的border-style属性 dotted/ dashed . 效果展示出来太密了，并不符合UI设计

> 具体的虚线的颜色和间距都可以通过repeating-linear-gradient生成的条纹背景去调整。



# 19 时间轴效果

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/R1mJgWWSMA3oCVBoskibbAuTXGVgWRe6yYx8AFJs3Djia8O92md45gQgszDuqqeL1VUNV0lar4FXRBxbRfA1xRMQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

html结构

```htmlh t
<div class="timeline-content">  
	<div v-for='(item, index) in timeLine' :key='index' class="time-line">    
	<div :class="`state-${item.state} state-icon`"></div>    
	<div class="timeline-title">{{item.title}}</div></div>
</div>
```

css样式

```css
/** 时间轴 */
.timeline-content{  
  display: flex;  
  .time-line{    
    padding: 10px 10px 10px 20px;    
    position: relative;    
    &::before{      
      content: '';      
      height: 1px;      
      width: calc(100% - 34px);      
      background: #EBEBEB;      
      position: absolute;      
      left: 24px;      
      top: 0;    
    }  
  }  
  .state-icon{    
    width: 20px;    
    height: 20px;    
    position: absolute;    
    top: -12px;    
    left: 0;  
  }  
  .state-1{    
    background: url('https://static.daojia.com/assets/project/tosimple-pic/fen-zu-7-copy-6bei-fen_1589266208621.png') no-repeat;    
    background-size: cover;  
  }  
  .state-2{    
    background: url('https://static.daojia.com/assets/project/tosimple-pic/12_1589266226040.png') no-repeat;    
    background-size: cover;  
  }  
  .state-3{    
    background: url('https://static.daojia.com/assets/project/tosimple-pic/fen-zu-7-copy-3_1589266140087.png') no-repeat;    
    background-size: cover;  
  }
}
```

> calc()函数 用来计算css属性的值。

```
/** 属性：calc（expression）*/宽度：calc（100％ - 34px）;
```



# 20 卡券效果

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/R1mJgWWSMA3oCVBoskibbAuTXGVgWRe6y6DQ6rZ88ibibbrV0Q9koKtZpicEjUtUHB6r4JOXPiawI9Bmia8ia0tfHxfuQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

```css
.coupon{  
	width: 300px;  
  height: 100px;  
  position: relative;  
  background: radial-gradient(circle at right bottom, transparent 10px, #ffffff 0) top right /50% 51px no-repeat,    radial-gradient(circle at left bottom, transparent 10px, #ffffff 0) top left / 50% 51px no-repeat,    radial-gradient(circle at right top, transparent 10px, #ffffff 0) bottom right / 50% 51px no-repeat,    radial-gradient(circle at left top, transparent 10px, #ffffff 0) bottom left / 50% 51px no-repeat;  
  filter: drop-shadow(2px 2px 2px rgba(0,0,0,.2));
}
```

# 21 阴影效果

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/R1mJgWWSMA3oCVBoskibbAuTXGVgWRe6yy21ibc447pMgTJFod3XSdKeouyDhdtkzTlIHCWxVu2ic7iafRYeebmntA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

```css
// 三角形阴影
.shadow-triangle{    
  width: 0;    
  height: 0;    
  border-style: solid;    
  border-width: 0 50px 50px 50px;    
  border-color: transparent transparent rgb(245, 129, 127) transparent;    
  filter:drop-shadow(10px 0px 10px  rgba(238, 125, 55,0.5));
}
// 缺圆投影
.circle-square{    
  width:100px;    
  height:50px;    
  line-height: 50px;    
  background: radial-gradient(circle at bottom right, transparent 20px, rgb(245, 129, 127) 15px);     		filter: drop-shadow(2px 2px 2px rgba(238, 132, 66, 0.9));
}
// 气泡阴影
.tip {    
  width: 100px;    
  height: 30px;    
  line-height: 30px;    
  border: 1px solid rgb(245, 129, 127);    
  border-radius: 4px;    
  position: relative;    
  background-color: #fff;    
  filter: drop-shadow(0px 2px 4px rgba(245, 129, 127, 0.9));    
  &::before {      
    content: "";      
    width: 0;      
    height: 0;      
    border-style: solid;      
    border-width: 0 10px 10px 10px;      
    border-color: transparent transparent #fff transparent;      
    position: absolute;      
    top: -10px;      
    left: 0;      
    right: 0;      
    margin: auto;      
    z-index: 2;    
  }    
  &::after {      
    content: "";      
    width: 0;      
    height: 0;      
    border-style: solid;      
    border-width: 0 10px 10px 10px;      
    border-color: transparent transparent rgb(245, 129, 127) transparent;      
    position: absolute;      
    top: -11px;      
    left: 0;      
    right: 0;      
    margin: auto;      
    z-index: 1;    
  }
}
```

