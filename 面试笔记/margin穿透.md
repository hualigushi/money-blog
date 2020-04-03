## 现象
子元素margin超出父元素而未被父元素包含的现象，设置的是子元素的margin值，结果最后却作用在了父元素上

## 原因：

所有毗邻的两个或更多盒元素的margin将会合并为一个margin共享之。

毗邻的定义为：同级或者嵌套的盒元素，并且它们之间没有非空内容、Padding或Border分隔。

因为嵌套也属于毗邻，所以在样式表中优先级更高的 

## 解决办法：
1. 给父元素加border
2. 给父元素设置overflow:auto
3. 父级或子元素使用浮动或者绝对定位absolute
4. 父级设置padding（破坏非空白的折叠条件）
5. 利用伪元素给子元素的前面添加一个空元素
```
.son:before{ content:"";
             overflow:hidden; 
            }
```             

## 注意：
如果子元素不是div,p,h1等块级标签，而是a,span等行内标签的话，则不会出现margin击穿问题。

此外，如果父元素和子元素之间还有别的内容，即html代码如下所示的话也不会导致margin击穿问题。
```
<body>
   <div class="parent">
       我是父亲
    <div class="son">我是儿子 </div>
   </div>
</body>
```

