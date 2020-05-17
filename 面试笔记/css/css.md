
# 经常li之间有看不见的间隔，造成的原因
回车和空格会被应用样式,解决方法：把字符大小设置成font-size:0



# 如果需要手动写动画，你认为最小时间间隔是多久，为什么？
多数显示屏默认频率是60hz，所以理论上最小间隔1/60*1000ms = 16.7ms



# 在css中，padding-top或padding-bottom的百分比值是根据容器的width来计算的。



# canvas渲染较大画布的时候性能会较低：因为canvas依赖于像素，在绘制过程中是一个一个像素去绘制的，当画布足够大，像素点也就会足够多，那么想能就会足够低。



# 前端如何实现图片剪裁

canvas 的 drawImage 或 getImageData() 来截取



# 如何给一组列表首尾之外的元素添加样式

```
// 考察了css伪类的使用

// DOM
<ul class="list">
  <li class="item">1</li>
  <li class="item">2</li>
  <li class="item">3</li>
  <li class="item">4</li>
  <li class="item">5</li>
</ul>

// Style

.list > .item:not(:first-child):not(:last-child) {
  /* ... style */
}
```



# 文本省略

```
// 单行
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

```
// 多行
overflow : hidden;
text-overflow: ellipsis;
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
```

```
// 多行
p {
    position:relative;
    line-height:1.4em;
    /* 3 times the line-height to show 3 lines */
    height:4.2em;
    overflow:hidden;
}
p::after {
    content:"...";
    font-weight:bold;
    position:absolute;
    bottom:0;
    right:0;
    padding:0 20px 1px 45px;
    background:url(/newimg88/2014/09/ellipsis_bg.png) repeat-y;
}
```

