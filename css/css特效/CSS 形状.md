 

[TOC]

## 平行四边形

平行四边形也是页面中常出现的一种图形，我们可能很容易就想到，使用skew()将矩形倾斜一定角度即可。



![img](https://user-gold-cdn.xitu.io/2018/12/24/167e0e673c45fa47?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



```
.parallelograms{
    transform: skew(-45deg);
    /*...... */
}
```

可惜效果不如人意，文字也跟着倾斜了，这时候很容易想到，借助一层dom结构，再把内部文字倾斜回来。

```
<div class="parallelograms">
    <div>二十首情诗与绝望的歌</div>
</div>

 .parallelograms{
    margin: 50px auto;
    max-width: 200px;
    padding: 10px;
    line-height: 30px;
    text-align: center;
    color:#fff;
    background-color: #58a;
    transform:skew(-45deg);
}
.parallelograms div{
    transform: skew(45deg);
}
```



![img](https://user-gold-cdn.xitu.io/2018/12/24/167e0e36f9000832?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

很好，效果不错，但是却添加额外的 HTML 元素。我们不做过多讨论。

接下来我们讨论第二种方式，使用 **伪元素来实现**，这时候就体现了伪元素的好处。

思路：我们可以把伪元素作为第一种方法中的辅助结构层，把所有样式(背景、边框等)应用到伪元素上，然后再对伪元素进行变形，得到我们的平行四边形形状，而正式内容不受影响，然后把伪元素定位`z-index`设为-1，便可漏出正文的内容。

```
 .parallelograms{
    margin: 50px auto;
    max-width: 200px;
    padding: 10px;
    line-height: 30px;
    text-align: center;
    color:#fff;
    position: relative;
}
.parallelograms:before{
    content:'';
    position: absolute;
    left:0;
    top:0;
    right:0;
    bottom:0;
    background-color: #58a;
    transform:skew(-45deg);
    z-index: -1;
}
```

提醒： 这个技巧不仅对 `skew()` 变形来说很有用，还适用于其他任何变形样式， 当我们想变形一个元素而不想变形它的内容时就可以用到它。



## 菱形图片



![img](https://user-gold-cdn.xitu.io/2018/12/24/167e0ee3aa340527?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



看到这个图形状，是不是马上想起上一小节平行四边形的制作，一样的道理，需要把图片用一个 

 包裹起来，然后对其应用相反的 `rotate()` 变形样式:



```
<div class="diamond">
    <img src="https://avatars1.githubusercontent.com/u/8121621?v=4" alt="..." />
</div>

.diamond {
    margin:30px auto;
    width: 100px;
    height: 100px;
    transform: rotate(45deg);
    overflow: hidden;
    border: 1px solid red; /*为了更好的展示问题*/
}

.diamond img {
    max-width: 100%;
    transform: rotate(-45deg);
}
```



![img](https://user-gold-cdn.xitu.io/2018/12/24/167e0eb18a1585db?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



奈何，天不遂人愿！问题在于 `max-width:100%` 中的100%是指width的100%，也就是400px，而正方形旋转后最长边为对角线，是 根号2倍的width，自然图片的宽度不够了，我们可以使用 scale() 变形样式来把这个图片放大。找到问题后，我们修复它，



![img](https://user-gold-cdn.xitu.io/2018/12/24/167e0edbf4aab733?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

代码如下：



```
.diamond {
    margin:30px auto;
    width: 100px;
    height: 100px;
    transform: rotate(45deg);
    overflow: hidden;
    border: 1px solid red; /*为了更好的展示问题*/
}

.diamond img {
    max-width: 100%;
    transform: rotate(-45deg) scale(1.42);
}
```

这个方法需要一层额外的 HTML 标签，这是我们不做优先考虑的。同时有一个最大的问题就是，只能处理正方形图片，否则就会失效。

在上节中我们使用过伪元素的技巧，同样可以用在这里，代码如下：

```
 .diamond{
    margin:30px auto;
    width: 100px;
    height: 100px;
    overflow: hidden;
    position: relative;
    transform: rotate(45deg);
}
.diamond:before{
    content:'';
    position: absolute;
    left: 0;
    right:0;
    top:0;
    bottom:0;
    transform: rotate(-45deg) scale(1.42);
    background: url(https://avatars1.githubusercontent.com/u/8121621?v=4);
    background-size: cover;
}
```

原理与上面借助结构层是一样的，所以面临同样的问题，只能处理正方形图片。

接下来我们使用一种更为好用的方法来解决不是正方形的图片。（裁切路径方案）



![img](https://user-gold-cdn.xitu.io/2018/12/25/167e0f653ad7062e?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

抛出代码：



```
.diamond{
    /*......*/
    clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
}
```

`clip-path` 属性是从svg中借鉴过来的，裁切路径允许我们把元素裁剪为我们想要的任何形状。polygon()函数允许我们用一系列(以逗号分隔的)坐标点来指定任意的多边形。

 该方法同样可以实现上个章节中的平行四边形，以下章节中的切角、梯形等等任意形状，只需要按顺序排列坐标点即可，以下章节不再做过多展示，自己可以多多尝试。



## 切角效果



![img](https://user-gold-cdn.xitu.io/2018/12/25/167e0fa50814f956?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



切角效果，很容易想到的就是我的上篇文章 [你该知道的《css揭秘》--背景与边框篇](https://juejin.im/post/6844903745818624007#heading-4) 中的条纹背景制作中用到的线性渐变 `linear-gradient()`

我们很轻易的可以实现一个角被切掉的效果，代码如下：

```
.bevel-corners{
    background: #58a; /*linear-gradient不支持的情况下，作为代码回退机制*/ 
    background:linear-gradient(-45deg, transparent 15px, #58a 0);
}
复制代码
```

接下来使用两层渐变背景实现两个角被切掉。



![img](https://user-gold-cdn.xitu.io/2018/12/25/167e0fbd5d0ad824?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

首先分析一下，默认情况下， 这两层渐变都会填满整个元素，因此它们会相互覆盖。需要让它们都缩小一些，于是我们使用 `background-size` 让每层渐变分别只占据整个元素一半的面积，并且`background-repeat`设为`no-repeat`。



代码如下：

```
.bevel-corners{
    background: #58a;
    background:
    linear-gradient(-45deg, transparent 15px, #58a 0) right,
    linear-gradient(45deg, transparent 15px, #58a 0) left;
    background-size:50% 100%;
    background-repeat:no-repeat;
}
```

同样的原理，我们把每层渐变改为整个元素的四分之一，则四层渐变色，可以实现四个角被切掉。



![img](https://user-gold-cdn.xitu.io/2018/12/25/167e0fcaf61bf329?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

代码如下：



```
.bevel-corners{
    background:#58a;
    background:
    linear-gradient(-45deg,transparent 15px, #58a 0) bottom right,
    linear-gradient(45deg,transparent 15px, #58a 0) bottom left,
    linear-gradient(135deg,transparent 15px, #58a 0) top left,
    linear-gradient(-135deg,transparent 15px, #58a 0) top right;
    background-size:50% 50%;
    background-repeat:no-repeat;
}
```

继续增加难度，实现 **弧形切角**， 原理都一样，换汤不换药，只需将线性渐变改为径向渐变即可。



![img](https://user-gold-cdn.xitu.io/2018/12/25/167e0feedea297f6?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

实现代码如下：



```
.scoop-corners{
    background: #58a; 
    background:
    radial-gradient(circle at top left, transparent 15px, #58a 0) top left,
    radial-gradient(circle at top right, transparent 15px, #58a 0) top right,
    radial-gradient(circle at bottom right, transparent 15px, #58a 0) bottom right,
    radial-gradient(circle at bottom left, transparent 15px, #58a 0) bottom left;
    background-size: 50% 50%; 
    background-repeat: no-repeat;
}
```