#  CSS

1. box-sizing

box-sizing: border-box/content 

content-box的宽高计算方法是 width/height = content
content-box的内外边距不包含在width/height当中，而是在实际渲染时附加在原有基础上

border-box的宽高计算方法是 width/height = content + padding + border

应用场景: 通过百分比设定整体盒子的宽高,子元素整个盒子撑满父元素的内容区域,
        边框和填充被计算到盒模型内，不会破坏布局
        
# BFC

BFC(块级格式化上下文：block formatting context)规定了内部的Block Box如何布局。
定位方案：

1. 内部的Box会在垂直方向上一个接一个放置。

2. Box垂直方向的距离由margin决定，属于同一个BFC的两个相邻Box的margin会发生重叠。

3. 每个元素的margin box 的左边，与包含块border box的左边相接触。

4. BFC的区域不会与float box重叠。

5. BFC是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。

6.计算BFC的高度时，浮动元素也会参与计算。


满足下列条件之一就可触发BFC

1. 根元素，即html

2. float的值不为none（默认）

3. overflow的值不为visible（默认）

4. display的值为inline-block、table-cell、table-caption

5. position的值为absolute或fixed

# 浮动

浮动元素碰到包含它的边框或者浮动元素的边框停留。由于浮动元素不在文档流中，所以文档流的块框表现得就像浮动框不存在一样。浮动元素会漂浮在文档流的块框上。

浮动带来的问题：

1. 父元素的高度无法被撑开，影响与父元素同级的元素

2. 与浮动元素同级的非浮动元素（内联元素）会跟随其后

3. 若非第一个元素浮动，则该元素之前的元素也需要浮动，否则会影响页面显示的结构。

 

清除浮动的方式：

1. 父级div定义height

2. 最后一个浮动元素后加空div标签 并添加样式clear:both。

3. 包含浮动元素的父标签添加样式overflow为hidden或auto。

4. 父级div定义zoom


# 经常li之间有看不见的间隔，造成的原因
回车和空格会被应用样式,解决方法：把字符大小设置成font-size:0

# 元素浮动后,display变成了什么 display: inline-block

# 如果需要手动写动画，你认为最小时间间隔是多久，为什么？
多数显示屏默认频率是60hz，所以理论上最小间隔1/60*1000ms = 16.7ms

# 在css中，padding-top或padding-bottom的百分比值是根据容器的width来计算的。