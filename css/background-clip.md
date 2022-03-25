## 文字一半红一半绿 实现
```
.test-box h2{
        display: inline-block;
        background: linear-gradient(to right, #f44e30 0%,#f44e30 50%,#29db35 51%,#29db35 100%); 
        color: transparent; //关键
        font-size: 20px;
        -webkit-background-clip: text;  //关键
    }
```
![](https://mmbiz.qpic.cn/mmbiz_jpg/vLKqut7Zx93fpMpA2fLLBbMk3GVicHmIU0qgicNibtzQEPWJZDCWeib8mdIxx6eHmds3yclvfhtjtyjnIg6qfyw3Ew/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

标了两处”关键“，是因为除了这两个地方，其他均可变，只是视觉效果不同，而这两者是必须的。

```
<div class="test-box">
         <h2>Hello world</h2>
    </div>

    .test-box h2{
        display:inline-block;
        font-size:40px;
        background: linear-gradient(to bottom, #f44e30 0%,#29db35 100%); 
        -webkit-background-clip:text;
        -webkit-text-fill-color:transparent;
    }
```
![](https://mmbiz.qpic.cn/mmbiz_jpg/vLKqut7Zx93fpMpA2fLLBbMk3GVicHmIUANqicrh0YPQOy3ZiaiafviayoTQo3EOqcVIIo0GhkeRed2RSicojdFrJ1LA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

> 小tips：上面代码我都加了display:inline-block;为什么，不加不行？不是，这关乎一个细节，很多时候，如果你用一个块元素直接包裹，它会撑满整行，那么渐变的背景也会撑满整行，而文字可能只占了它的一个片段，多数情况下，都会跟想要的视觉效果有差别，故而，我们需要渐变的区域和文字区域完全重合。
