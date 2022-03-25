## 基本概念

![](https://image-static.segmentfault.com/258/703/2587037021-55bacfa692fb8_articlex)

行高是指文本行基线间的垂直距离

上一行的底线和下一行的顶线之间的距离就是行距，而同一行顶线和底线之间的距离是font-size的大小，行距的一半是半行距，半行距、font-size、line-height之间的关系看图片的右下角就一目了然了~

`半行距 = （line-height - font-size）/2`

当font-size等于line-height时，行距 = line-height - font-size = 0；而当font-size大于line-height时，则会出现行距为负值，则两行重叠

## 4种box

- inline box (行内框) 每个行内元素会生成一个行内框，行内框是一个浏览器渲染模型中的一个概念，无法显示出来，行内框的高度等于font-size，设定line-height时，行内框的高度不变，改变的是行距。

- line box （行框） 行框是指本行的一个虚拟的矩形框，由该行中行内框组成。行框也是浏览器渲染模式中的一个概念，无法显示出来。行框高度等于本行中所有行内框高度的最大值。当有多行内容时，每一行都有自己的行框。

- content area （内容区） 内容区是围绕着文字的一种box，无法显示出来，其高度取决于font-size和padding。个人觉得：内容区的高度 = font-size + padding-top + padding-bottom，有待查证，也期待小伙伴们给出答案~

 - containing box containing box 是包裹着上述三种box的box
 ![](https://image-static.segmentfault.com/244/729/2447292392-55baf65e61f73_articlex)
 
 ## 取值
 一般情况下，浏览器默认的line-height为1.2。可以自定义 line-height 覆盖这个初始值
 
| 设置方式	 | line-height	         | 计算后的line-height	               | 子元素继承的line-height|
| --------- | --------------------- | -------------------                | ----------------------|
| inherit	  | 父元素的line-height值	| 不用计算	                            | 父元素的line-height值|
| length	  | 20px	                | 不用计算	                             | 20px|
| %	        | 120%	                | 自身font-size (16px) * 120% = 19.2px	| 继承父元素计算后的line-height值 19.2px，而不是120%|
| normal	  | 1.2	                  | 自身font-size (16px) * 1.2 = 19.2px	| 继承1.2，line-height = 自身font-size(32px) * 1.2 = 38.4px|
| 纯数字	    | 1.5	                  | 自身font-size (16px) * 1.2 = 19.2px	| 继承1.5，line-height = 自身font-size(32px) * 1.5 = 48px|

设置行高的值为 纯数字 是最推荐的方式，因为其会随着对应的 font-size 而缩放

## height和line-height的联系
line-height是行高的意思，它决定了元素中文本内容的高度，height则是定义元素自身的高度。

在没有设置div的height属性时，div的高度根据line-height的大小而变化，且文字垂直居中

撑开div高度的是line-height不是文字内容

把line-height值设置为height一样大小的值可以实现单行文字的垂直居中。这句话确实是正确的，但其实也是有问题的。问题在于height，看我的表述：“把line-height设置为您需要的box的大小可以实现单行文字的垂直居中”，差别在于我把height去掉了，这个height是多余的


1. height = line-height时

![](https://img-blog.csdn.net/20180920153708614?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2EyMDEzMTI2Mzcw/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

2. height>line-height时

![](https://img-blog.csdn.net/20180920153944649?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2EyMDEzMTI2Mzcw/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

3. height<line-height时

![](https://img-blog.csdn.net/20180920154137876?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2EyMDEzMTI2Mzcw/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

4. 行高为50px和文字高度为20px

这时候文字会居中显示,因为我们把line-height设置为50px，也就是说这行文字会占50px,但是显然每个字的大小只有20px，这时候浏览器把多出来的30px,在文字上面加了15px,
