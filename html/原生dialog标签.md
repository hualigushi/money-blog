## 使用方法

#### 1. 基础的用法

```
<dialog open>我是一个对话框</dialog>
```

可以`open`属性控制`dialog`是否显示，效果如下：

![img](https://mmbiz.qpic.cn/mmbiz_png/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBL2iatPcEZGq6dtomWxgxlvHEibZogNYHObhyiaicfnPJT8Y7icMGjQjnduXg/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

看看浏览器渲染的默认样式：不是`全屏居中`、`有透明遮罩`

![img](https://mmbiz.qpic.cn/mmbiz_png/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBLthQf1h7uFMJDlwsWhSicgTQtdxkDaF1x61ELFapOYtSwDVs6RJUqdkQ/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)



#### 2. 使用JS API

也可以用`JS`来控制元素的显示跟隐藏。常用的有三个方法：

| 名称      | 说明                                               |
| :-------- | :------------------------------------------------- |
| show      | 显示`dialog`元素（跟open属性控制一样）             |
| showModal | 显示`dialog`元素，并且全屏居中，并带有黑色透明遮罩 |
| close     | 隐藏`dialog`元素                                   |

简单的用法：

```
<dialog>
  <p>我是一个对话框</p>
  <button onclick="hideDialog()">隐藏对话框</button>
</dialog>

<button onclick="showDialog()">显示对话框</button>

<script>
  let dialog = document.querySelector("dialog");
  
  // 显示对话框
  function showDialog() {
    dialog.show();
  }
  
  // 隐藏对话框
  function hideDialog() {
    dialog.close();
  }
</script>
```

效果如下：

![img](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBLCndWrIxmGjxNHLuRGVVbsjTTUYHq5JNGNBMDLXy6Zyb3iajCN74zAVQ/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

将`dialog.show()`改成`dialog.showModal()`，看看效果：

![img](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBL7C1mKJ1wN72tPMJCdaibXZGUqwHLOxfUIlCVCeGgHymibNb229F5IXMQ/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)



默认样式倒没变，只是多加了一`个::backdrop`伪元素（透明遮罩）：

![img](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBL5Su7b8W5Sic9gNiaGJkuPqQgC9U9PIdhM7tavj0pRrgvuhZ70ZibD3OicQ/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

#### 3. 修改背景色

想改`背景颜色`可以直接`覆盖`掉样式：

```
dialog::backdrop {
  background: linear-gradient(45deg, black, transparent);
}
```

效果如下：

![img](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBLmzWTOSOFSDlxYq57wZIFdYvbelYPQNr9sA3I3mnbg7BQ6EzcgNKamw/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

![img](https://mmbiz.qpic.cn/mmbiz_jpg/iaibsyicqkwnjvZic7ibLEjKHMkqBVnqPfmUibP4YIBUiaBp9U6k4BQjf5gn9I9aLurTMQlYWdw2SdHt2ryUsia9MRhbuQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1



## 多个对话框 

如果同时出现多个`对话框`，会根据调用的先后顺序`叠加`上去。

假设布局如下（省略`JS`代码）：

```
<dialog>
  <p>我是第一个对话框</p>
  <button onclick="hideDialog1()">隐藏对话框</button>
  <button onclick="showDialog2()">显示第二个对话框</button>
</dialog>

<dialog>
  <p>我是第二个对话框</p>
  <p>我是第二个对话框</p>
  <button onclick="hideDialog2()">隐藏对话框</button>
</dialog>

<button onclick="showDialog1()">显示第一个对话框</button>
```

效果如下：

![img](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBLficeoGICxwY1o4bHHnbZvPib0eQ9avDOGNNTq9TTsWnSayKDzkUUoh5g/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

既然是`叠加`，那么背景色一定会`叠加`（同时存在多个`dialog`元素），这是必然的

`dialog`本身的样式也可以修改，直接覆盖即可：

```
dialog {
  border: none;
  border-radius: 8px;
}
```

效果如下：

![img](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBL1m1POHAOS5zLVROibxauiaMibgKNiaU0VJBeyW95VSIoQvEt5hqfmmKXicQ/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)



## 点击遮罩关闭对话框

目前并没有`参数/属性`可以设置`"点击遮罩进行关闭对话框"`

给dialog添加一个click事件，当点击的目标为遮罩的时候，然后把自己隐藏掉就行了。

```
dialog.onclick = function(event) {
  console.log(event.target);
};
```

但是事实却没那么顺利：

![img](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBLP7YW5vRvbSibunlO3vZ8CQmlkCgZQjVNqLkKwU2whOdhvryiaIdN7yaQ/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

无论你点哪里，目标元素都是`dialog`😭，但是，有一个非常机智的方法。



我把结构变成如下：

```
<dialog>
  <div class="content">
    // 这是内容...
  </div>
</dialog>
```

然后把`dialog`默认的`padding`转移到`.content`上!

```
dialog {
  padding: 0;
  
  .content {
    padding: 1rem;
  }
}
```

这样点击话，就可以区分出来啦

![img](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBLGeiczlsK7r5cxLMv4Efn9VIibr3VkN7oUNAcmoKCic5RPicAgrkiaZ2hoibg/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

然后判断一下，大功告成：

```
dialog.onclick = function(event) {
  if (event.target.tagName.toLowerCase() == "dialog") this.close();
};
```

效果如下：

![img](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBLWeKJxgYNKZ0dibicibAVhOtBqFicrUHZHctme1m79fGIU698bwRyNDLT7A/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)



## 把"可点击遮罩关闭"配置化

约定一个属性`closeByMask`，若标签上存在该属性，则可以进行点击关闭：

```
<dialog closeByMask></dialog>

<dialog closeByMask></dialog>
```

然后添加以下脚本即可：

```
document.querySelectorAll("dialog[closeByMask]").forEach(dialog => {
  dialog.onclick = function(event) {
    if(event.target.tagName.toLowerCase() == "dialog") this.close();
  }
});
```

然后不管你怎么`嵌套`都行啦🤣

假如两个`dialog`都存在`closeByMask`属性：

![img](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBLXLAHJ1Yy9OxYluMiahtWib1txpA8vd0ZAO16Hl44xDMxMw9zcvNT056g/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

假如第二个`dialog`才存在`closeByMask`属性：

![img](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBL6yyuCOfEdP8Q5Del4Jn81VCKP7AicyFOuVibtoQz1cOluGV4u5O2yibsw/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)



## 如何加过渡动画

#### 1. 使用animation

```
dialog {
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    transform: translateY(-100px);
  }

  to {
    transform: translateY(0);
  }
}
```

效果如下：

![img](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBLZZTXOGgDBU53cSY2pZgxMYrnP8qkFAfibJP3rhYc5INYRsLeib2O5dsw/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

缺点：关闭的时候没有动画😭



#### 2. 使用transition

没有`open`属性的`dialog`元素是被默认设置成`display: none`的。

![img](https://mmbiz.qpic.cn/mmbiz_png/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBLYVdH56QdPFc6RhV6ctlND9Uj5yic3Fr7P4Ccqw5fvkHRUcUfLicZ9QJA/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

`transition`是不支持`display`过渡的

所以把`display: none`换成`opacity: 0`就可以支持过渡

```
dialog {
   transition: opacity 0.4s ease;
   opacity: 1;
}

dialog:not([open]) {
  display: block;
  opacity: 0;
}
```

效果如下：

![img](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBLPjK5jWqwFNccgMHXLDMretsFd8wN1bUdJaQr4C5ASyiaWMRWaI8Za2w/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

但是`opacity`只是设置透明度为而已，实际上`dialog`元素还是存在的，如果`dialog`里面`绑定了点击事`件，一样会执行，即使你看不见它

比如这样：

![img](https://mmbiz.qpic.cn/mmbiz_gif/iaibsyicqkwnjtlowN4X2sfjGxDIaJsbKBLklrPibsNoUoXu66dfriaN6jehNC1LLtllu3JOZjCuT27Eiaib5EZfhnaZw/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

`visibility`，所以CSS代码改成如下：

```
dialog:not([open]) {
  display: block;
  opacity: 0;
  visibility: hidden;
}
```

显示跟隐藏都有过渡效果了

`遮罩`背景并没有过渡效果，只是`dialog`元素本身有