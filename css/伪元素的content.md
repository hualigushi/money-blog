## 可取的值

1. 普通字符
2. `unicode`
3. `attr`函数
4. `url`函数
5. `counter`函数
6. `css`变量



下面有部分`content`属性在外层省略父元素：

```
// 原始
p {
  &::after {
    content: "";  
  }
}

// 省略后
content: "";
```

#### 1. 普通字符

```
content: "我是文字内容";
```

#### 2. unicode

浏览器自带的特殊字符：

```
p {
  &:after {
    content: "\02691";
    color: red;
  }
}
复制代码
```

显示如下：

![img](https://user-gold-cdn.xitu.io/2019/8/15/16c949a29dc1de00?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

------

`iconfont`自定义字体图标：

```
<span class="icon icon-close"></span>
```

```
@font-face {
  font-family: "iconfont";
  src: url('//at.alicdn.com/t/font_1209853_ok7e8ntkhr.ttf?t=1560857741304') 		format('truetype');
}

.icon {
  font-family: "iconfont";
}

.icon-close::before {
  content: "\e617";
}
```

显示如下：

![img](https://user-gold-cdn.xitu.io/2019/8/15/16c949b9cab0a580?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



#### 3. attr函数

这个函数可以获取`html`元素中某一属性的值，如`id`、`class`、`style`等😍

```
<p data-content="我是文字内容"></p>
```

```
content: attr(data-content);
```



#### 4. url函数

显示掘金头像：

```
content: url("https://user-gold-cdn.xitu.io/2019/8/7/16c681a0fb3e84c4?imageView2/1/w/180/h/180/q/85/format/webp/interlace/1");
```

显示如下：

![img](https://user-gold-cdn.xitu.io/2019/8/15/16c949cf4133dddf?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

缺点就是无法控制图片的大小



#### 5. counter函数

`counter`函数的作用是插入计数器的值，配合`content`属性可以把计数器里的值显示出来🎲，介绍用法之前，得先熟悉两个属性`counter-reset`跟`counter-increment`

------

`counter-reset`的作用是定义一个计数器：

```
counter-reset: count1 0; // 声明一个计数器count1，并从0开始计算
counter-reset: count2 1; // 声明一个计数器count2，并从1开始计算
counter-reset: count3 0 count4 0 count5 0; // 声明多个计数器
```

------

`counter-increment`使计数器的值递增，可以理解成`javascript`中的`+=`：

```
counter-reset: count 0;
counter-increment: count 2; // 使count自增2，当前count的值为2
counter-increment: count -2; // 使count自增-2，当前count的值为-2
```



#### 6. css变量

显示变量的时候，如果变量是`string`类型则可以直接显示，如果是`int`类型，则需要借用`counter`函数😒

```
// string类型
--name: "不会写前端";

p {
  &::after {
    content: var(--name); // 显示为"不会写前端"
  }
}

---------- 我是分割线 ----------

// int类型
--count: 60;

p {
  &::after {
    counter-reset: color var(--count);
    content: counter(count); // 显示为"60"
  }
}

---------- 我是分割线 ----------

// 不支持的类型及情况
--count: 60.5; // 显示为"0"，不支持小数
--count: 60px; // 显示为""，不支持css属性值
```



## 拼接

普通字符串拼接：

```
content: "xxx" + "xxx";
```

字符串拼接函数：

```
// 不能使用 + 连接符，也可以不需要空格，这里只是为了区分
content: "我支持" attr(xx);
count: "我的掘金头像：" url("xxxxx");
content: "计数器的值为：" counter(xx);
```

隐性转换：

```
content: 0; // 显示为""
content: "" + 0; // 显示为"0"
content: "" + attr(name); // 显示为"attr(name)"
```



## 实用案例

#### 1. 当a标签内容为空时，显示其`href`属性里面的值：

```
<a href="https://juejin.im/user/587e1822128fe1005706db1c"></a>
```

```
a {
  &:empty {
    &::after {
      content: "链接内容为：" attr(href);
    } 
  }
}
```

显示如下：

![img](https://user-gold-cdn.xitu.io/2019/8/15/16c94d9acc98459a?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



#### 2. 面包屑跟分隔符

```
<ul>
  <li>首页</li>
  <li>商品</li>
  <li>详情</li>
</ul>
```

```
ul {
  display: flex;
  font-weight: bold;

  li {
    &:not(:last-child) {
      margin-right: 5px;
        
      &::after {
        content: "\276D";
        margin-left: 5px;
      }
    }
  }
}
```

显示如下：

![img](https://user-gold-cdn.xitu.io/2019/8/16/16c9834971e7641e?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

![img](https://user-gold-cdn.xitu.io/2019/8/16/16c98360273981f6?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



#### 3. 进度条

```
<div class="progress" style="--percent: 14;"></div>
<div class="progress" style="--percent: 41;"></div>
<div class="progress" style="--percent: 94;"></div>
```

```
.progress {
  width: 400px;
  height: 17px;
  margin: 5px;
  color: #fff;
  background-color: #f1f1f1;
  font-size: 12px;

  &::before {
    counter-reset: percent var(--percent);
    content: counter(percent) "%"; // 文字显示
    
    display: inline-block;
    width: calc(100% * var(--percent) / 100); // 宽度计算
    max-width: 100%; // 以防溢出
    height: inherit;
    text-align: right;
    background-color: #2486ff;
  }
}
```



显示如下：

![img](https://user-gold-cdn.xitu.io/2019/8/16/16c9877c47169b04?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



加个过渡效果：

```
transition: width 1s ease; // 页面首次进入没有过渡效果，因为width必须要发生变化才行
```



![img](https://user-gold-cdn.xitu.io/2019/8/16/16c9882fafa444f5?imageslim)



如果只靠`css`，想在页面首次进入触发动画效果，那只有`animation`才能做到了

```
.progress {
  &::before {
    // 移除width跟transition属性
    animation: progress 1s ease forwards;
  }
  
  @keyframes progress {
    from {
      width: 0;
    }

    to {
      width: calc(100% * var(--percent) / 100);
    }
  }
}
```

页面刷新后效果如下：

![img](https://user-gold-cdn.xitu.io/2019/8/16/16c988685491bc7d?imageslim)



#### 4. tooltip提示

```
<button data-tooltip="我是一段提示">按钮</button>
```

```
[data-tooltip] {
  position: relative;
  
  &::after {
    content: attr(data-tooltip); // 文字内容
    display: none; // 默认隐藏
    position: absolute;
    
    // 漂浮在按钮上方并居中
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translate(-50%, 0);
    
    padding: 5px;
    border-radius: 4px;
    color: #fff;
    background-color: #313131;
    white-space: nowrap;
    z-index: 1;
  }
    
  // 鼠标移入button的时候显示tooltip
  &:hover {
    &::after {
      display: block;
    }
  }
}
```



效果如下：

![img](https://user-gold-cdn.xitu.io/2019/8/16/16c98467c903e1bb?imageslim)



#### 5. 计算checkbox选中的个数

```
<form>
  <input type="checkbox" id="one">
  <label for="one">波霸奶茶</label>
  <input type="checkbox" id="two">
  <label for="two">烤奶</label>
  <input type="checkbox" id="three">
  <label for="three">咖啡</label>
  
  <!-- 输入结果 -->
  <div class="result">已选中：</div>
</form>
```

```
form {
  counter-reset: count 0;
  
  // 当checkbox选中的时候，计数器自增1
  input[type="checkbox"] {
    &:checked {
      counter-increment: count 1;
    }
  }
  
  // 输出结果
  .result {
    &::after {
      content: counter(count);
    }
  }
}
```

效果如下：

![img](https://user-gold-cdn.xitu.io/2019/8/16/16c98515482fbbed?imageslim)



#### 6. 给目录加章节计数

```
<!-- 章节 -->
<ul class="section">
  <li>
    <h1>自我介绍</h1>

    <!-- 子章节 -->
    <ul class="subsection">
      <li>
        <h2></h2>
      </li>
      <li>
        <h2></h2>
      </li>
    </ul>
  </li>
  
  <li>
    <h1>写一段css代码</h1>
  </li>
</ul>
```

```
// 章节
.section {
  counter-reset: section 0; // 外层计数器

  h1 {
    &::before {
      counter-increment: section 1; // 自增1
      content: "Section"counter(section) ". ";
    }
  }

  // 子章节
  .subsection {
    counter-reset: subsection 0; // 内层计数器

    h2 {
      &::before {
        counter-increment: subsection 1; // 自增1
        content: counter(section) "."counter(subsection); // 计数器是有作用域的，这里可以访问外层计数器
      }
    }
  }
}
```

显示如下：

![img](https://user-gold-cdn.xitu.io/2019/8/15/16c94ee7e29c3b54?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



#### 7. 加载中...动画

```
<p>加载中</p>
```

```
p {
  &::after {
    content: ".";
    animation: loading 2s ease infinite;

    @keyframes loading {
      33% {
        content: "..";
      }

      66% {
        content: "...";
      }
    }
  }
}
```

效果如下：

![img](https://user-gold-cdn.xitu.io/2019/8/16/16c992eb9037c7e0?imageslim)



#### 8. 无更多数据

```
<div class="no-more">无更多数据</div>
```

```
.no-more {
  &::before {
    content: "——";
    margin-right: 10px;
  }


  &::after {
    content: "——";
    margin-left: 10px;
  }
}
```

效果如下：

![img](https://user-gold-cdn.xitu.io/2019/8/16/16c9abf207335228?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



