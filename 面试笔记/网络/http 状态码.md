# HTTP 状态码

![](https://img-blog.csdnimg.cn/20190530105724767.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2lkd3R3dA==,size_16,color_FFFFFF,t_70)

**101 Switching Protocols**。在`HTTP`升级为`WebSocket`的时候，如果服务器同意变更，就会发送状态码 101。

**206 Partial Content**顾名思义，表示部分内容，它的使用场景为 HTTP 分块下载和断点续传，当然也会带上相应的响应头字段`Content-Range`。



# 401 403

401 Unauthorized： 该HTTP状态码表示认证错误，它是为了认证设计的，而不是为了授权设计的。收到401响应，表示请求没有被认证—压根没有认证或者认证不正确—但是请重新认证和重试。（一般在响应头部包含一个WWW-Authenticate来描述如何认证）。通常由web服务器返回，而不是web应用。从性质上来说是临时的东西。（服务器要求客户端重试）

403 Forbidden：该HTTP状态码是关于授权方面的。从性质上来说是永久的东西，和应用的业务逻辑相关联。它比401更具体，更实际。收到403响应表示服务器完成认证过程，但是客户端请求没有权限去访问要求的资源。



#  301重定向

[永久重定向](https://www.dujin.org/tag/永久重定向)，意为旧的URL已经不在使用，已永久转移至新的地址。

当浏览器接收到服务端301（永久）重定向返回码时，会将original_url和redirect_url1存储在浏览器缓存中，当再次请求original_url时，浏览器会从本地缓存中读取redirect_url1直接进行跳转，不再请求服务端。

在浏览器未清理缓存或缓存未失效的情况下，即使服务端将重定向地址修改为redirect_url2，浏览器依然会跳转到redirect_url1。



# 302重定向

[临时重定向](https://www.dujin.org/tag/临时重定向)，意为某个时间段因为某些原因临时进行的跳转行为，旧的URL地址依然使用并存在。

当浏览器接收到服务端302（临时）重定向返回码时，不会进行缓存。每次请求original_url时，都会请求一下服务端。



### 网站什么时候使用301重定向?

1、网站进行了改版，新的URL结构和旧的URL结构不一致，此时，需要讲所有旧网站的URL全部301到新的网站上，并且要保持URL的一一对应，万不可全部跳转至首页，或跳转对应错误。

2、不带www的主域名跳转至到www的网址版本，如：http://googlenb.com 301 至 http://www.googlenb.com 。 需注意的是，此时跳转也需全站跳转，不要只做首页跳转。

3、http模式跳转至https模式，如：http://www.googlenb.com 301 至 https://www.googlenb.com ，如果网站启用https，该规则是必须存在的，此规则如果存在，需特别注意不要和上述第二条跳转规则重复跳转，避免301两次或多次跳转。即应该： http://googlenb.com 、 http://www.googlenb.com 、 https://googlenb.com , 一次性统一跳转至：https://www.googlenb.com

4、内容重复，内容合并等跳转，同一篇内容存在多个URL都能到达访问，此时需要设置跳转至标准且唯一的URL版本，避免网站权重分散。



### 网站什么时候使用302重定向？

1、移动端访问PC端的网站，或PC端访问移动端网站，此时建议使用302跳转，如移动端访问http://www.163.com， 302至 http://3g.163.com。

2、临时活动或临时跳转，在举行重大活动，需对活动进行宣传，如：用户访问首页或某些页面时时临时跳转至活动专页，待活动结束后取消跳转。

3、一般是访问某个网站的资源需要权限时，会需要用户去登录，跳转到登录页面之后登录之后，还可以继续访问。