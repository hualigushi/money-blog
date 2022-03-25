### HTTP2 服务器推送

服务器推送：服务端能够直接把资源推送给客户端，主要是让浏览器（用户代理）提前缓存静态资源,当客户端需要这些文件的时候，它已经在客户端了。（该推送对 Web App 是隐藏的，由浏览器处理）



### SSE

借助http协议支持分块传输这一特性。在响应报文里，设置`Content-Type: text/event-stream`，如此一来响应报文实体就可以多次从服务器返回给客户端，只需要约定好边界就好，比如SSE的边界就是以空行作为消息分隔符。



它首先由浏览器向服务端建立一个 HTTP 长连接，然后服务端不断地通过这个长连接将消息推送给浏览器。

JS API 如下：

```javascript
Copy// create SSE connection
var source = new EventSource('/dates');

// 连接建立时，这些 API 和 WebSocket 的很相似
source.onopen = function(event) {
  // handle open event
};

// 收到消息时（它只捕获未命名 event）
source.onmessage = function(event) {
  var data = event.data;  // 发送过来的实际数据（string）
  var origin = event.origin;  // 服务器端URL的域名部分，即协议、域名和端口。
  var lastEventId = event.lastEventId;  // 数据的编号，由服务器端发送。如果没有编号，这个属性为空。
  // handle message
};

source.onerror = function(event) {
  // handle error event
};
```

#### 具体的实现

在收到客户端的 SSE 请求（HTTP 协议）时，服务端返回的响应首部如下：

```headers
CopyContent-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

而 body 部分，SSE 定义了四种信息：

1. `data`：数据栏
2. `event`：自定义数据类型
3. `id` ：数据 id
4. `retry`：最大间隔时间，超时则重新连接

body 举例说明：

```text
Copy: 这种格式的消息是注释，会被忽略\n\n
: 通常服务器每隔一段时间就会发送一个注释，防止超时 retry\n\n

: 下面这个是一个单行数据\n\n
data: some text\n\n

: 下面这个是多行数据，在客户端会重组成一个 data\n\n
data: {\n
data: "foo": "bar",\n
data: "baz", 555\n
data: }\n\n

: 这是一个命名 event，只会被事件名与之相同的 listener 捕获\n\n
event: foo\n
data: a foo event\n\n

: 未命名事件，会被 onmessage 捕获\n\n
data: an unnamed event\n\n

event: bar\n
data: a bar event\n\n

: 这个 id 对应 event.lastEventId\n\n
id: msg1\n
data: message\n\n
```



### WebSocket、HTTP/2 与 SSE 的比较

1. 加密与否：
   - WebSocket 支持明文通信 `ws://` 和加密 `wss://`，
   - 而 HTTP/2 协议虽然没有规定必须加密，但是[主流浏览器都只支持 HTTP/2 over TLS](https://en.wikipedia.org/wiki/HTTP/2#Encryption).
   - SSE 是使用的 HTTP 协议通信，支持 http/https
2. 消息推送：
   - WebSocket是全双工通道，可以双向通信。而且消息是直接推送给 Web App.
   - SSE 只能**单向串行地**从服务端将数据推送给 Web App.
   - HTTP/2 虽然也支持 Server Push，但是服务器只能主动将资源推送到客户端缓存！并不允许将数据推送到客户端里跑的 Web App 本身。服务器推送只能由浏览器处理，不会在应用程序代码中弹出服务器数据，这意味着应用程序没有 API 来获取这些事件的通知。
     - 为了接近实时地将数据推送给 Web App， HTTP/2 可以结合 SSE（Server-Sent Event）使用。

WebSocket 在需要接近实时双向通信的领域，很有用武之地。而 HTTP/2 + SSE 适合用于展示实时数据。

另外在客户端非浏览器的情况下，使用不加密的 HTTP/2 也是可能的。

