## 为什么要使用KeepAlive？

终极的原因就是需要加快客户端和服务端的访问请求速度。KeepAlive就是浏览器和服务端之间保持长连接，这个连接是可以复用的。当客户端发送一次请求，收到相应以后，第二次就不需要再重新建立连接（慢启动的过程）,就可以直接使用这次的连接来发送请求了。在HTTP1.0及各种加强版中，是默认关闭KeepAlive的，而在HTTP1.1中是默认打开的。

 

HTTP头是Connection: Keep-Alive

要设置保持多少时间和连接使用：

Keep-alive: 300

 

KeepAlive是不是设置越长越好？

并不是这样的。KeepAlive在增加访问效率的同时，也会增加服务器的压力。对于静态文件是会提高其访问性能，但是对于一些动态请求，如果在一次和下一次的请求过程中占用了服务器的资源，则会导致意想不到的结果。

 

在nginx中关闭keepalive使用keepalive_timeout 0;就可以进行关闭。记住如果没有设置的话默认是开启的。

 

## http的基础知识

http是一个请求——响应模式的典型范例，即客户端向服务器发送一个请求信息，服务器响应这个信息。

在老的http版本中：

**每一个请求都创建一个TCP连接，当一次请求被响应后，tcp四次挥手，连接断开。**

这个模式的优点：简单，易实现，易理解，且满足无连接的特点。*

这个模式的缺点：效率低。



**HTTP /1.0**

在这个版本的协议上，如果客户端浏览器支持Keep-Alive，那么就在HTTP请求头部添加一个Connection:Keep-Alive，当服务器收到附带Connection:Keep-Alive的请求，也会在响应头部添加一个同样的字段来使用Keep-Alive。

这样一来，客户端和服务器端之间的TCP连接就会保持，不会断开（超过Keep-Alive规定的时间，意外断电等情况外），当客户端发送另外一个到这个服务器的请求还是会使用这个已经建立的连接。

 

**HTTP/1.1**

默认情况下所在HTTP1.1中所有连接都被保持，除非在请求头或响应头中指明要关闭：Connection: Close这也就是为什么Connection: Keep-Alive字段再没有意义的原因。另外，还添加了一个新的字段Keep-Alive:，因为这个字段并没有详细描述用来做什么，可忽略它。

 

**Not reliable（不可靠）**

HTTP是一个无状态协议，这意味着每个请求都是独立的，Keep-Alive没能改变这个结果。另外，Keep-Alive也不能保证客户端和服务器之间的连接一定是活跃的，在HTTP1.1版本中也如此。唯一能保证的就是当连接被关闭时你能得到一个通知，所以不应该让程序依赖于Keep-Alive的保持连接特性，否则会有意想不到的后果

 

## 容易犯的误区

1. HTTP是一个无状态的面向连接的协议，无状态不代表HTTP不能保持TCP连接，更不能代表HTTP使用的是UDP协议（无连接

2. 从HTTP/1.1起，默认都开启了Keep-Alive，保持连接特性，简单地说，当一个网页打开完成后，客户端和服务器之间用于传输HTTP数据的TCP连接不会关闭，如果客户端再次访问这个服务器上的网页，会继续使用这一条已经建立的连接

3. Keep-Alive不会永久保持连接，它有一个保持时间，可以在不同的服务器软件（如Apache）中设定这个时间

 

## nginx配置

```
upstream test_keepalive{
    server 127.0.0.1:5002;
    keepalive 4; 
}
server {
    listen       80;
    location / {
        proxy_pass http://test_keepalive;
        proxy_set_header Host            $host:8000;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

upstream里面的有几个配置是跟keepalive相关的：

- keepalive: 4， 每个nginx worker可以保留的idle连接，也就是说最多可保留的长连接，如果超过这个数量，会根据LRU算法，least recently used 用的最少的连接会被close，需要注意的是，这个参数不会限制worker的跟upstream的连接数。
- keepalive_timeout :60， nginx跟upstreamd的 idle 空闲长连接，最大超时时间，超过时间没有数据往来则超时关闭
- keepalive_requests : 100，设置每个长连接最多能处理的请求次数，超过了以后连接就会被close，定期关闭对于清理每个连接的占用的内存是非常必要的，否则连接占用的内存会越来越大，这是不推荐的。

对于location里面的配置，主要是修改http版本为1.1, 并且把nginx默认传递给upsteam connection：close的行为去掉
 http_version需要指定用1.1  ，以及原有的Connection头部要被擦掉

- proxy_http_version 1.1;
- proxy_set_header Connection "";

