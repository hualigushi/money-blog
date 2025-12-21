[TOC]



## 可取的值

+   普通字符
    
+   unicode
    
+   attr函数
    
+   url函数
    
+   counter函数
    
+   css变量  
    



### 1\. 普通字符

最普通的值：

```
content: "我是文字内容";
```

### 2\. unicode

浏览器自带的特殊字符：

```css
p {
  &:after {
    content: "\02691";
    color: red;
  }
}
```

显示如下：

![](https://mmbiz.qpic.cn/mmbiz_jpg/iaibsyicqkwnjv05XlCNFQCMMRT0Bia9tmOVL9J7riczhNIibonNd2UsG8MDHrAEI8jicWfzGribknXSvu6ibe5ia8lOMdvQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)



iconfont自定义字体图标：

```
<span class="icon icon-close"></span>
```

```css
@font-face {
  font-family: "iconfont";
  src: url('//at.alicdn.com/t/font_1209853_ok7e8ntkhr.ttf?t=1560857741304') format('truetype');
}.icon {
  font-family: "iconfont";
}.icon-close::before {
  content: "\e617";
}
```

显示如下：

![](https://mmbiz.qpic.cn/mmbiz_jpg/iaibsyicqkwnjv05XlCNFQCMMRT0Bia9tmOVqChvnVk891A8iaCnTMARnEibYJJGncExpCkL6748VbYyQyuR29c3JxzQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 3\. attr函数

这个函数可以获取html元素中某一属性的值，如id、class、style等😍

```
<p data-content="我是文字内容"></p>
```

```
content: attr(data-content);
```



### 4\. url函数

```
content: url("https://user-gold-cdn.xitu.io/2019/8/7/16c681a0fb3e84c4?imageView2/1/w/180/h/180/q/85/format/webp/interlace/1");
```

显示如下：

![](https://mmbiz.qpic.cn/mmbiz_jpg/iaibsyicqkwnjsUy3VXWrnaFeqv37SPEPT7c9mENbHsIJSzFbJLs719UmMBYMauZIChy4uo6lS5WJiaUcC6Ku0U3Tw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

缺点就是无法控制图片的大小😂

### 5\. counter函数

counter函数的作用是插入计数器的值，配合content属性可以把计数器里的值显示出来🎲，介绍用法之前，得先熟悉两个属性counter-reset跟counter-increment😎

counter-reset的作用是定义一个计数器：

```
counter-reset: count1 0; // 声明一个计数器count1，并从0开始计算
counter-reset: count2 1; // 声明一个计数器count2，并从1开始计算
counter-reset: count3 0 count4 0 count5 0; // 声明多个计数器
```

* * *

counter-increment使计数器的值递增，可以理解成javascript中的+=：

```
counter-reset: count 0;
counter-increment: count 2; // 使count自增2，当前count的值为2
counter-increment: count -2; // 使count自增-2，当前count的值为-2
```

注意，这里的计数器count的值为什么不是变回了0，可以理解成样式覆盖，就如以下代码：

```
div {
  width: 100px;
  width: 200px; // 实际渲染的宽度
}
```

### 6\. css变量

显示变量的时候，如果变量是string类型则可以直接显示，如果是int类型，则需要借用counter函数😒

```css
// string类型
--name: "不会写前端";p {
  &::after {
    content: var(--name); // 显示为"不会写前端"
  }
}---------- 我是分割线 ----------// int类型
--count: 60;p {
  &::after {
    counter-reset: color var(--count);
    content: counter(count); // 显示为"60"
  }
}---------- 我是分割线 ----------// 不支持的类型及情况
--count: 60.5; // 显示为"0"，不支持小数
--count: 60px; // 显示为""，不支持css属性值
```



## 实用案例

### 1\. 当a标签内容为空时，显示其href属性里面的值：

```
<a href="https://juejin.im/user/587e1822128fe1005706db1c"></a>
```

```css
a {
  &:empty {
    &::after {
      content: "链接内容为：" attr(href);
    } 
  }
}
```

显示如下：  

![](https://mmbiz.qpic.cn/mmbiz_jpg/iaibsyicqkwnjv05XlCNFQCMMRT0Bia9tmOVIkwFuT5RfpY8E7t5KNc9jACbqZvkkdtbI8ickeiaF3RE6QNANGHsIvUg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 2\. 面包屑跟分隔符

```
<ul>
  <li>首页</li>
  <li>商品</li>
  <li>详情</li>
</ul>
```

```css
ul {
  display: flex;
  font-weight: bold;  li {
    &:not(:last-child) {
      margin-right: 5px;              &::after {
        content: "\276D";
        margin-left: 5px;
      }
    }
  }
}
```

显示如下：

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/iaibsyicqkwnjv05XlCNFQCMMRT0Bia9tmOVibib6GjYCRfZ22ibkIowHicjmJMmflUaEkYticMGC4NCgB01X1fV4ZqqCtg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 3\. 进度条

```
<div class="progress" style="--percent: 14;"></div>
<div class="progress" style="--percent: 41;"></div>
<div class="progress" style="--percent: 94;"></div>
```

```css
.progress {
  width: 400px;
  height: 17px;
  margin: 5px;
  color: #fff;
  background-color: #f1f1f1;
  font-size: 12px;  &::before {
    counter-reset: percent var(--percent);
    content: counter(percent) "%"; // 文字显示        display: inline-block;
    width: calc(100% * var(--percent) / 100); // 宽度计算
    max-width: 100%; // 以防溢出
    height: inherit;
    text-align: right;
    background-color: #2486ff;
  }
}
```

显示如下：

![](https://mmbiz.qpic.cn/mmbiz_jpg/iaibsyicqkwnjv05XlCNFQCMMRT0Bia9tmOVfgQ6Me2QdYEicZDu2YSoHbI7DShobwicAmKibibkTUcw41ToicVcCd9Dykg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

加个过渡效果：

```
transition: width 1s ease; // 页面首次进入没有过渡效果，因为width必须要发生变化才行
```

![](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjsUy3VXWrnaFeqv37SPEPT7eyRA8EDXiblLv1nMciaIyEBicjWNCnbfM2OAt9qibUVZibPcfuWvYRlHlUg/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

鱼和熊掌不可兼得，如果只靠css，想在页面首次进入触发动画效果，那只有animation才能做到了😭

```css
.progress {
  &::before {
    // 移除width跟transition属性
    animation: progress 1s ease forwards;
  }    @keyframes progress {
    from {
      width: 0;
    }    to {
      width: calc(100% * var(--percent) / 100);
    }
  }
}
```

页面刷新后效果如下：

![](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjsUy3VXWrnaFeqv37SPEPT79uYWx8YnDaMfOJib96qzfNiaOyftbL3JpPKPE3jbX7jz0vmsibFGKxUQQ/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

### 4\. tooltip提示

```
<button data-tooltip="我是一段提示">按钮</button>
```

```css
[data-tooltip] {
  position: relative;    &::after {
    content: attr(data-tooltip); // 文字内容
    display: none; // 默认隐藏
    position: absolute;        // 漂浮在按钮上方并居中
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translate(-50%, 0);        padding: 5px;
    border-radius: 4px;
    color: #fff;
    background-color: #313131;
    white-space: nowrap;
    z-index: 1;
  }      // 鼠标移入button的时候显示tooltip
  &:hover {
    &::after {
      display: block;
    }
  }
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjsUy3VXWrnaFeqv37SPEPT7aXJ5jib3LGBFtzib81U1hjUVDTKsmCvnJxs8auCE9BYrMuzsFjJXA7hw/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

### 5\. 计算checkbox选中的个数

```
<form>
  <input type="checkbox" id="one">
  <label for="one">波霸奶茶</label>
  <input type="checkbox" id="two">
  <label for="two">烤奶</label>
  <input type="checkbox" id="three">
  <label for="three">咖啡</label>    <!-- 输入结果 -->
  <div class="result">已选中：</div>
</form>
```

```css
form {
  counter-reset: count 0;    // 当checkbox选中的时候，计数器自增1
  input[type="checkbox"] {
    &:checked {
      counter-increment: count 1;
    }
  }    // 输出结果
  .result {
    &::after {
      content: counter(count);
    }
  }
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjsUy3VXWrnaFeqv37SPEPT7YpQbR4v05A0UNR7s8QWaMwsEYYDvmdPIiay7v5GUOok5R51EkkZ0UCQ/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

### 6\. 给目录加章节计数

```
<!-- 章节 -->
<ul class="section">
  <li>
    <h1>自我介绍</h1>    <!-- 子章节 -->
    <ul class="subsection">
      <li>
        <h2></h2>
      </li>
      <li>
        <h2></h2>
      </li>
    </ul>
  </li>    <li>
    <h1>写一段css代码</h1>
  </li>
</ul>
```

```css
// 章节
.section {
  counter-reset: section 0; // 外层计数器  h1 {
    &::before {
      counter-increment: section 1; // 自增1
      content: "Section" counter(section) ". ";
    }
  }  // 子章节
  .subsection {
    counter-reset: subsection 0; // 内层计数器    h2 {
      &::before {
        counter-increment: subsection 1; // 自增1
        content: counter(section) "." counter(subsection); // 计数器是有作用域的，这里可以访问外层计数器
      }
    }
  }
}
```

显示如下：

![](https://mmbiz.qpic.cn/mmbiz_jpg/iaibsyicqkwnjsUy3VXWrnaFeqv37SPEPT7nmibV7UU5G3xrLgdAfsCwoibu7G8CumdiclBGic2x6DzA1xrJiapMVJtTAw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 7\. 加载中... 动画

```
<p>加载中</p>
```

```css
p {
  &::after {
    content: ".";
    animation: loading 2s ease infinite;    @keyframes loading {
      33% {
        content: "..";
      }      66% {
        content: "...";
      }
    }
  }
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjsUy3VXWrnaFeqv37SPEPT7FOrqNpgwjpGoicYB4jgZJfSXcPgH1iaEmkReRxiaeibdZpxytDqfQVRIzg/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

### 8\. 无更多数据

```
<div class="no-more">无更多数据</div>
```

```css
.no-more {
  &::before {
    content: "——";
    margin-right: 10px;
  }  &::after {
    content: "——";
    margin-left: 10px;
  }
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/iaibsyicqkwnjsUy3VXWrnaFeqv37SPEPT7ibKvic1a855O4meTBoyS7icffpMek1ib9tl2sA532j0ZJgWAicSxoYibpwLQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)