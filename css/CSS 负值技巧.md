## 使用负值 outline-offset 实现加号
```css
<div></div>

div {
    width: 200px; height: 200px;
    outline: 20px solid #000;
    outline-offset: -118px;
}
```
![](https://mmbiz.qpic.cn/mmbiz_gif/2FMs2KmmepgiaDIj1kRwmHvDaVmiclw3fnarTy0VicZcg6GKDVlqC1ogLaL8wn5icDzINdtxhHxUCnlClnOQFQNicxA/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

要使用负的 outline-offset 生成一个加号有一些简单的限制：

 - 容器得是个正方形

 - outline 边框本身的宽度不能太小

 - outline-offset 负值 x 的取值范围为: -(容器宽度的一半 + outline宽度的一半) < x < -(容器宽度的一半 + outline宽度)

 ## css单侧投影
 ![](https://mmbiz.qpic.cn/mmbiz/2FMs2KmmepgiaDIj1kRwmHvDaVmiclw3fnS8RgOTQLlFvvBeQXia7ND7LquTU83moOv7icQTKNx3omQcR9PXDoVUBw/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)











 ## 使用 scale(-1) 实现翻转

 ```css

.scale {
    transform: scale(1);
    animation: scale 10s infinite linear;
}

@keyframes scale{
    50% {
        transform: scale(-1);
    }
    100% {
        transform: scale(-1);
    }
}
 ```

![](https://mmbiz.qpic.cn/mmbiz_gif/2FMs2KmmepgiaDIj1kRwmHvDaVmiclw3fn1WnltSVrvhgcqkUmKlGTNZC3VEwEA2tyNFY3ulvsQhGBOsTZLt3ogA/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)
