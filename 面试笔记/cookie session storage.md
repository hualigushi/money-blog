跨域怎么携带cookie
首先要知道，不能携带cookies是因为同源策略造成的：不允许js访问跨域cookies

解决方法
1. 服务器端使用CROS协议解决跨域访问数据问题时，需要设置响应消息头Access-Control-Allow-Credentials值为“true”
2. 同时，还需要设置响应消息头Access-Control-Allow-Origin值为指定单一域名（注：不能为通配符“*”）
3. 客户端需要设置Ajax请求属性withCredentials=true，让Ajax请求都带上Cookie。


[cookies、sessionStorage和localStorage解释及区别](https://www.cnblogs.com/pengc/p/8714475.html)
