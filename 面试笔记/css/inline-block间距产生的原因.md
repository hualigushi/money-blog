# 背景介绍

**1、inline-block到底是什么？**

inline-block 后的元素创建了一个行级的块容器，该元素内部（内容）被格式化成一个块元素，同时元素本身则被格式化成一个行内元素。

一句话解释：它是一个格式化为行内元素的块容器。

兼具行内元素和块元素的特点。

**2、inline-block为什么会有间距？**

归根结底这是一个西文排版的问题。举一个很简单的例子：

I am very happy

南京市长江大桥欢迎您

英文有空格作为词分界，而中文则没有。（这背后延伸出一个中文分词的问题）

这个问题的原因可以上述到SGML(标准通用标记语言)和TeX(排版工具)，它实际上是一个行内（inline）的问题，它由空格、换行或回车所产生空白符所致



# 解决方案

**方法1：font-size**

这个方法，基本上可以解决大部分浏览器下inline-block元素之间的间距。



![img](https:////upload-images.jianshu.io/upload_images/7995515-8972e8ed8f1b0f7f.png?imageMogr2/auto-orient/strip|imageView2/2/w/353/format/webp)



 

**方法2：使用word-spacing或letter-spacing**

一个是字符间距(letter-spacing)一个是单词间距(word-spacing)，大同小异。

letter-spacing子元素要设置letter-spacing为0，不然会继承父元素的值；使用word-spacing时，只需设置父元素word-spacing为合适值即可。

使用letter-spacing和word-spacing时，其在不同浏览器下效果不同。



![img](https:////upload-images.jianshu.io/upload_images/7995515-6d407af6ca680228.png?imageMogr2/auto-orient/strip|imageView2/2/w/312/format/webp)

