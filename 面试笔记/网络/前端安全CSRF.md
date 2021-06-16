## 攻击过程

角色：

- 正常浏览网页的用户：User
- 正规的但是具有漏洞的网站：WebA
- 利用CSRF进行攻击的网站：WebB

流程：
1.用户登录、浏览并信任正规网站WebA，同时，WebA通过用户的验证并在用户的浏览器中产生Cookie。
![img](https://i.loli.net/2018/03/19/5aaf72e9147f0.png)

2.攻击者WebB通过在WebA中添加图片链接等方式诱导用户User访问网站WebB。
![img](https://i.loli.net/2018/03/19/5aaf7332f2eec.png)
3.在用户User被诱导访问WebB后，WebB会利用用户User的浏览器访问第三方网站WebA，并发出操作请求。
![img](https://i.loli.net/2018/03/19/5aaf73dee5c0d.png)
4.用户User的浏览器根据WebB的要求，带着步骤一中产生的Cookie访问WebA。
![img](https://i.loli.net/2018/03/19/5aaf7491b60ff.png)
5.网站WebA接收到用户浏览器的请求，WebA无法分辨请求由何处发出，由于浏览器访问时带上用户的Cookie，因此WebA会响应浏览器的请求，如此一来，攻击网站WebB就达到了模拟用户操作的目的。
![img](https://i.loli.net/2018/03/19/5aaf74c4538e3.png)



# 跨站请求伪造具有以下几个特点：

1. 采用cookie来进行用户校验

2. 用户在受攻击站点已经登录，且没有正常退出。

3. 受攻击站点的会话失效时间比较长。而且失效时间越长受攻击机率越高。

4. 受攻击站点的特殊敏感操作没有严谨的用户身份标识验证。

5. 受害者主动访问含有伪造请求的页面。



### CSRF的防御

1. 尽量使用POST，限制GET

2. 将cookie设置为HttpOnly
    通过程序（如JavaScript脚本、Applet等）就无法读取到cookie信息，避免了攻击者伪造cookie的情况出现。 
    在Java的Servlet的API中设置cookie为HttpOnly的代码如下：`response.setHeader( "Set-Cookie", "cookiename=cookievalue;HttpOnly");`  

3. 在请求地址中添加tokon验证

   CSRF 攻击之所以能够成功，是因为黑客可以完全伪造用户的请求，该请求中所有的用户验证信息都是存在于      cookie 中，因此黑客可以在不知道这些验证信息的情况下直接利用用户自己的 cookie 来通过安全验证。要抵御 CSRF，关键在于在请求中放入黑客所不能伪造的信息，并且该信息不存在于 cookie 之中。可以在 HTTP 请求中以参数的形式加入一个随机产生的 token，并在服务器端建立一个拦截器来验证这个 token，如果请求中没有 token 或者 token 内容不正确，则认为可能是 CSRF 攻击而拒绝该请求。

4. Samesite Cookie属性
  该属性表示 Cookie 不随着跨域请求发送
  
5. 同源检测
   由于CSRF都是通过三方网站发起，因此我们如果能判断服务器每次收到的请求来自哪些网站，就可以过滤那些存在安全风险的网站发起的请求，降低被攻击的风险。
   
   Referer和Origin是http请求的头部字段之一，用来标志该请求是从哪个页面链接过来的。因此后台服务器可以通过检查该字段是否是来自自己的网站链接，来避免第三方网站发起CSRF攻击。

   但是同源检测的可靠性并不高，比如在302重定向的时候，为了保护来源，http请求不会携带Origin字段，而Referer字段会受到Referer Policy规则的限制而不发送。

6. 增加二次验证
   针对一些有危险性的请求操作（比如删除账号，提现转账）我们可以增加用户的二次，比如发起手机或者邮箱验证码检验，进而降低CSRF打来的危害。
