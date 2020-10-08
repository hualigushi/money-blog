`for...in`语法令人难以置信的缓慢。在测试中就已经比正常情况下慢近9倍的循环。

这是因为 `for...in`语法是第一个能够迭代对象键的JavaScript语句。

循环对象键（ {}）与在数组（ []）上进行循环不同，

**因为引擎会执行一些额外的工作来跟踪已经迭代的属性。**

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXFKUbqw1tz6nUYVQNV4n5OaGEkLXIWWicwkPcbuwwBhwmXIgnLicPT4IRQJsygQoKfoYE1jsqe1klg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)