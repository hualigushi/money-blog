## 对于定长和不定长的数据，HTTP 是怎么传输的？

### 定长包体

对于定长包体而言，发送端在传输的时候一般会带上 `Content-Length`, 来指明包体的长度。

我们用一个`nodejs`服务器来模拟一下:

```js
const http = require('http');

const server = http.createServer();

server.on('request', (req, res) => {
  if(req.url === '/') {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', 10);
    res.write("helloworld");
  }
})

server.listen(8081, () => {
  console.log("成功启动");
})
```

启动后访问: **localhost:8081**。

浏览器中显示如下:

```
helloworld
```

这是长度正确的情况，那不正确的情况是如何处理的呢？

我们试着把这个长度设置的小一些:

```
res.setHeader('Content-Length', 8);
```

重启服务，再次访问，现在浏览器中内容如下:

```
hellowor
```

那后面的`ld`哪里去了呢？实际上在 http 的响应体中直接被截去了。

然后我们试着将这个长度设置得大一些:

```
res.setHeader('Content-Length', 12);
```

此时浏览器显示如下:



![img](https://user-gold-cdn.xitu.io/2020/3/22/170ffd6f598bea62?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



直接无法显示了。可以看到`Content-Length`对于 http 传输过程起到了十分关键的作用，如果设置不当可以直接导致传输失败。

### 不定长包体

上述是针对于`定长包体`，那么对于`不定长包体`而言是如何传输的呢？

这里就必须介绍另外一个 http 头部字段了:

```
Transfer-Encoding: chunked
```

表示分块传输数据，设置这个字段后会自动产生两个效果:

- Content-Length 字段会被忽略
- 基于长连接持续推送动态内容

我们依然以一个实际的例子来模拟分块传输，nodejs 程序如下:

```js
const http = require('http');

const server = http.createServer();

server.on('request', (req, res) => {
  if(req.url === '/') {
    res.setHeader('Content-Type', 'text/html; charset=utf8');
    res.setHeader('Content-Length', 10);
    res.setHeader('Transfer-Encoding', 'chunked');
    res.write("<p>来啦</p>");
    setTimeout(() => {
      res.write("第一次传输<br/>");
    }, 1000);
    setTimeout(() => {
      res.write("第二次传输");
      res.end()
    }, 2000);
  }
})

server.listen(8009, () => {
  console.log("成功启动");
})
```

访问效果入下:



![img](https://user-gold-cdn.xitu.io/2020/3/22/170ffd728ba3840d?imageslim)



用 telnet 抓到的响应如下:



![img](https://user-gold-cdn.xitu.io/2020/3/22/170ffd78332368a0?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



注意，`Connection: keep-alive`及之前的为响应行和响应头，后面的内容为响应体，这两部分用换行符隔开。

响应体的结构比较有意思，如下所示:

```
chunk长度(16进制的数)
第一个chunk的内容
chunk长度(16进制的数)
第二个chunk的内容
......
0

```

最后是留有有一个`空行`的，这一点请大家注意。
