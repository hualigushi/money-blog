## WebSocket和HTTP之间的关系
客户端开始建立WebSocket连接时要发送一个header标记了 Upgrade的**HTTP请求**，表示请求协议升级。
所以服务器端做出响应的简便方法是，直接在现有的HTTP服务器软件和现有的端口上实现WebSocket协议，然后再回一个状态码为101的HTTP响应完成握手，
再往后发送数据时就没 HTTP的事了。也就是说WebSocket只是使用HTTP协议来完成一部分握手。

## 建立连接
首先建立TCP连接, 3次握手, 第4次由客户端发起HTTP请求

#### 客户端请求报文 Header
客户端请求报文：
```
GET / HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Host: example.com
Origin: http://example.com
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Key: sN9cRrP/n9NdMgdcy2VJFQ==
Sec-WebSocket-Version: 13
```
必须为GET请求

与传统 HTTP 报文不同的地方：
```
Upgrade: websocket
Connection: Upgrade
```
这两行表示发起的是 WebSocket 协议。
```
Sec-WebSocket-Key: sN9cRrP/n9NdMgdcy2VJFQ==
Sec-WebSocket-Version: 13
```
`Sec-WebSocket-Key` 是一个Base64加密的密钥,是由浏览器随机生成的，提供基本的防护，防止恶意或者无意的连接。  

`Sec-WebSocket-Version` 表示 WebSocket 的版本,header字段的值必须为13

`OriginOrigin`可以预防在浏览器中运行的脚本，在未经 WebSocket 服务器允许的情况下，对其发送跨域的请求。
浏览器脚本在使用浏览器提供的 WebSocket 接口对一个 WebSocket 服务发起连接请求时，
浏览器会在请求的 Origin 中标识出发出请求的脚本所属的源，然后 WebSocket 在接受到浏览器的连接请求之后，就可以根据其中的源去选择是否接受当前的请求。

`Sec-WebSocket-Protocol` 是用于标识客户端想和服务端使用哪一种子协议（都是应用层的协议，比如 chat 表示采用 “聊天” 这个应用层协议）。

创建 WebSocket 对象：

`var ws = new websocket("ws://127.0.0.1:8001");`  
ws 表示使用 WebSocket 协议，后面接地址及端口

#### 服务端响应报文 Header

服务端的响应报文：
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: HSmrc0sMlYUkAGmm5OPpG2HaGWk=
Sec-WebSocket-Protocol: chat
```
1. 101 状态码表示服务器已经理解了客户端的请求，并将通过 Upgrade 消息头通知客户端采用不同的协议来完成这个请求；
2. `Sec-WebSocket-Accept` 这个则是经过服务器确认，并且加密过后的 `Sec-WebSocket-Key`
