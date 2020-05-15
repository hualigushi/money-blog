## 攻击过程

![](https://pic002.cnblogs.com/img/hyddd/200904/2009040916453171.jpg)

第一步，用户C打开浏览器，输入账号和密码请求登录受信任网站A；

第二步，用户信息通过验证后，网站A将产生的Cookie信息返回给浏览器，用户便成功登录网站A；

第三步，用户在登录网站A的同时，在同一浏览器中访问网站B；

第四步，网站B接收到用户登录请求后，返回的不是Cookie信息，而是一些攻击性代码，同时发出请求要求访问第三方站点A；

第五步，浏览器在接收到这些攻击性代码后，根据网站B的请求，在用户不知情的情况下向网站A发出访问请求，并执行网站B的恶意代码。

跨站请求伪造在受害者是毫不知情的情况下，以受害者名义伪造请求并发送给受攻击的站点，这样就能以受害者的身份和权限执行一些特殊敏感的操作。

跨站请求伪造具有以下几个特点：

1. 采用cookie来进行用户校验
2. 用户在受攻击站点已经登录，且没有正常退出。

3. 受攻击站点的会话失效时间比较长。而且失效时间越长受攻击机率越高。

4. 受攻击站点的特殊敏感操作没有严谨的用户身份标识验证。

5. 受害者主动访问含有伪造请求的页面。

## 攻击手段

一般在`(4)`处`恶意网站(B)`的攻击手段如下（必须是指向`A`的地址，否则无法带上cookie）：

```
// 1.譬如在网站内的图片资源中潜入恶意的转账操作
<img src=http://www.bank.example/transfer?toBankId=hello&amount=1000000 width='0' height='0'>

// 2.构建恶意的隐藏表单，并通过脚本提交恶意请求
<iframe style="display: none;" name="csrf-frame"></iframe>
<form method='POST' action='http://www.bank.example/transfer' target="csrf-frame" id="csrf-form">
  <input type='hidden' name='toBankId' value='hello'>
  <input type='hidden' name='amount' value='1000000'>
  <input type='submit' value='submit'>
</form>
<script>document.getElementById("csrf-form").submit()</script>
```

而且，从头到尾，攻击网站都没有获取到过 cookie，都是通过浏览器间接实现（利用Web的cookie隐式身份验证机制），所以`HttpOnly`并不会影响这个攻击

### CSRF的防御

1. 尽量使用POST，限制GET
2. 将cookie设置为HttpOnly
通过程序（如JavaScript脚本、Applet等）就无法读取到cookie信息，避免了攻击者伪造cookie的情况出现。 
在Java的Servlet的API中设置cookie为HttpOnly的代码如下：`response.setHeader( "Set-Cookie", "cookiename=cookievalue;HttpOnly");`  
3. 增加token
4. Samesite Cookie属性
