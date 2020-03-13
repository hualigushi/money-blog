## 跨域怎么携带cookie

首先要知道，不能携带cookies是因为同源策略造成的：不允许js访问跨域cookies

解决方法
1. 服务器端使用CROS协议解决跨域访问数据问题时，需要设置响应消息头Access-Control-Allow-Credentials值为“true”
2. 同时，还需要设置响应消息头Access-Control-Allow-Origin值为指定单一域名（注：不能为通配符“*”）
3. 客户端需要设置Ajax请求属性withCredentials=true，让Ajax请求都带上Cookie。

![](https://image-static.segmentfault.com/214/846/2148460748-5d01e744cac7a_articlex)

[cookies、sessionStorage和localStorage解释及区别](https://www.cnblogs.com/pengc/p/8714475.html)

# session
服务器要知道当前请求发给自己的是谁。为了做这种区分，服务器就是要给每个客户端分配不同的"身份标识"，然后客户端每次向服务器发请求的时候，都带上这个”身份标识“，服务器就知道这个请求来自与谁了

### 过程(服务端session + 客户端 sessionId)

![](https://image-static.segmentfault.com/240/392/2403924079-5d01e744ccf87_articlex)

1. 用户向服务器发送用户名和密码
2. 服务器验证通过后,在当前对话(session)里面保存相关数据,比如用户角色, 登陆时间等;
3. 服务器向用户返回一个session_id, 写入用户的cookie
4. 用户随后的每一次请求, 都会通过cookie, 将session_id传回服务器
5. 服务端收到 session_id, 找到前期保存的数据, 由此得知用户的身份

### 存在的问题
扩展性不好

单机当然没问题， 如果是服务器集群， 或者是跨域的服务导向架构， 这就要求session数据共享，每台服务器都能够读取session。

# Token

token 也称作令牌，由uid+time+sign[+固定参数]

token 的认证方式类似于临时的证书签名, 并且是一种服务端无状态的认证方式, 非常适合于 REST API 的场景. 所谓无状态就是服务端并不会保存身份认证相关的数据。

使用 token 的 CORS 可以很好的处理跨域的问题。由于每次发送请求到后端，都需要检查 JWT，只要它们被验证通过就可以处理请求

原生移动平台并不一定和 cookie 能良好的兼容，在使用中会存在一些限制和需要注意的地方。另一方面，token 更容易在 IOS 和 Android 上实现，Token 也更容易实现物联网应用程序和服务，没有 Cookie 存储的概念。


![](https://image-static.segmentfault.com/328/265/3282657795-5d01e74493d33_articlex)

1. 用户通过用户名和密码发送请求
2. 程序验证
3. 程序返回一个签名的token给客户端
4. 客户端储存token, 并且每次用每次发送请求
5. 服务端验证Token并返回数据

# token可以抵抗csrf，cookie+session不行

假如用户正在登陆银行网页，同时登陆了攻击者的网页，并且银行网页未对csrf攻击进行防护。攻击者就可以在网页放一个表单，该表单提交src为`http://www.bank.com/api/transfer，body为count=1000&to=Tom`。倘若是`session+cookie`，用户打开网页的时候就已经转给Tom1000元了.因为form 发起的 POST 请求并不受到浏览器同源策略的限制，因此可以任意地使用其他域的 Cookie 向其他域发送 POST 请求，形成 CSRF 攻击。在post请求的瞬间，cookie会被浏览器自动添加到请求头中。但token不同，token是开发者为了防范csrf而特别设计的令牌，浏览器不会自动添加到headers里，攻击者也无法访问用户的token，所以提交的表单无法通过服务器过滤，也就无法形成攻击。

# Cookie和Session的区别
1. 存储位置不同： cookie数据存放在客户的浏览器上，session数据放在服务器上
2. 隐私策略不同：cookie不是很安全， 别人可以分析存放在本地的cookie并进行cookie欺骗，考虑到安全应当使用session
3. session会在一定时间内保存在服务器上。当访问增多，就会比较占用你服务器的性能，考虑到减轻服务器性能方面，应当使用cookie
4. 存储大小不同： 单个cookie保存的数据不能超过4k, 很多浏览器都限制一个站点最多保存20个cookie

一般建议： 将登陆信息等重要信息存放为session, 其他信息如果需要保留，可以放在cookie中

# Token和Session的区别

Session是一种HTTP储存机制， 为无状态的HTTP提供持久机制;

Token就是令牌， 比如你授权(登录)一个程序时，它就是个依据，判断你是否已经授权该软件；

Session和Token并不矛盾，作为身份认证Token安全性比Session好，因为每一个请求都有签名还能防止监听以及重放攻击，而Session就必须依赖链路层来保障通讯安全了。如上所说，如果你需要实现有状态的回话，仍然可以增加Session来在服务端保存一些状态。
