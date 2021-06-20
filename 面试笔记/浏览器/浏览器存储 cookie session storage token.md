![](https://image-static.segmentfault.com/214/846/2148460748-5d01e744cac7a_articlex)



# Cookie 

用来做**状态存储**的，但它也是有诸多致命的缺陷的：

1. 容量缺陷。Cookie 的体积上限只有`4KB`，只能用来存储少量的信息。

2. 性能缺陷。Cookie 紧跟域名，不管域名下面的某一个地址需不需要这个 Cookie ，** 请求都会携带上完整的 Cookie**，这样随着请求数的增多，其实会造成巨大的性能浪费的，因为请求携带了很多不必要的内容。

3. 安全缺陷。由于 Cookie 以纯文本的形式在浏览器和服务器中传递，很容易被非法用户截获，然后进行一系列的篡改，在 Cookie 的有效期内重新发送给服务器，这是相当危险的。另外，在`HttpOnly`为 false 的情况下，Cookie 信息能直接通过 JS 脚本来读取。

   

### Cookies 的属性

#### Name/Value

用 JavaScript 操作 Cookie 的时候,**注意对 Value 进行编码处理**。

#### Expires

Expires 用于设置 Cookie 的过期时间。比如：

```
Set-Cookie: id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT;
```

当 Expires 属性缺省时，表示是会话性 Cookie。当为会话性 Cookie 的时候，值保存在客户端内存中，并在用户关闭浏览器时失效。需要注意的是，有些浏览器提供了会话恢复功能，这种情况下即使关闭了浏览器，会话期 Cookie 也会被保留下来，就好像浏览器从来没有关闭一样。

与会话性 Cookie 相对的是持久性 Cookie，持久性 Cookies 会保存在用户的硬盘中，直至过期或者清除 Cookie。这里值得注意的是，设定的日期和时间只与客户端相关，而不是服务端。

#### Max-Age

Max-Age 用于设置在 Cookie 失效之前需要经过的秒数。比如：

```
Set-Cookie: id=a3fWa; Max-Age=604800;
```

Max-Age 可以为正数、负数、甚至是 0。

如果 max-Age 属性为正数时，浏览器会将其持久化，即写到对应的 Cookie 文件中。

当 max-Age 属性为负数，则表示该 Cookie 只是一个会话性 Cookie。

当 max-Age 为 0 时，则会立即删除这个 Cookie。

假如 Expires 和 Max-Age 都存在，Max-Age 优先级更高。

#### Domain

Domain 指定了 Cookie 可以送达的主机名。假如没有指定，那么默认值为当前文档访问地址中的主机部分（但是不包含子域名）。

像淘宝首页设置的 Domain 就是 .taobao.com，这样无论是 a.taobao.com 还是 b.taobao.com 都可以使用 Cookie。

在这里注意的是，不能跨域设置 Cookie，比如阿里域名下的页面把 Domain 设置成百度是无效的：

```
Set-Cookie: qwerty=219ffwef9w0f; Domain=baidu.com; Path=/; Expires=Wed, 30 Aug 2020 00:00:00 GMT
```

#### Path

Path 指定了一个 URL 路径，这个路径必须出现在要请求的资源的路径中才可以发送 Cookie 首部。比如设置 `Path=/docs`，`/docs/Web/` 下的资源会带 Cookie 首部，`/test` 则不会携带 Cookie 首部。

Domain 和 Path 标识共同定义了 Cookie 的作用域：即 Cookie 应该发送给哪些 URL。

#### Secure属性

标记为 Secure 的 Cookie 只应通过被HTTPS协议加密过的请求发送给服务端。使用 HTTPS 安全协议，可以保护 Cookie 在浏览器和 Web 服务器间的传输过程中不被窃取和篡改。

#### HTTPOnly

设置 HTTPOnly 属性可以防止客户端脚本通过 document.cookie 等方式访问 Cookie，有助于避免 XSS 攻击。

#### SameSite

Chrome80 版本中默认屏蔽了第三方的 Cookie

SameSite 属性可以让 Cookie 在跨站请求时不会被发送，从而可以阻止跨站请求伪造攻击（CSRF）。

##### 属性值

SameSite 可以有下面三种值：

1. **Strict** 仅允许一方请求携带 Cookie，即浏览器将只发送相同站点请求的 Cookie，即当前网页 URL 与请求目标 URL 完全一致。
2. **Lax** 大多数情况禁止第三方cookie，但是导航到目标网址的get请求除外（例如a标签，预加载请求，get表单）
3. **None** 无论是否跨站都会发送 Cookie , 但必须设置`secure`才能生效

之前默认是 None 的，Chrome80 后默认是 Lax。



不过也会有两点要注意的地方：

1. HTTP 接口不支持 SameSite=none

如果你想加 SameSite=none 属性，那么该 Cookie 就必须同时加上 Secure 属性，表示只有在 HTTPS 协议下该 Cookie 才会被发送。

2. 需要 UA 检测，部分浏览器不能加 SameSite=none

IOS 12 的 Safari 以及老版本的一些 Chrome 会把 SameSite=none 识别成 SameSite=Strict，所以服务端必须在下发 Set-Cookie 响应头时进行 User-Agent 检测，对这些浏览器不下发 SameSite=none 属性



# 跨域怎么携带cookie

首先要知道，不能携带cookies是因为同源策略造成的：不允许js访问跨域cookies

解决方法

1. 服务器端使用CROS协议解决跨域访问数据问题时，需要设置响应消息头Access-Control-Allow-Credentials值为true

2. 同时，还需要设置响应消息头Access-Control-Allow-Origin值为指定单一域名（注：**不能为通配符“*”**）

3. 客户端需要设置Ajax请求属性withCredentials=true，让Ajax请求都带上Cookie。

   


# IndexedDB

`IndexedDB`是运行在浏览器中的`非关系型数据库`, 理论上这个容量是没有上限的。

`IndexedDB`的一些重要特性，除了拥有数据库本身的特性，比如`支持事务`，`存储二进制数据`，还有这样一些特性需要格外注意：

1. 键值对存储。内部采用`对象仓库`存放数据，在这个对象仓库中数据采用**键值对**的方式来存储。
2. 异步操作。数据库的读写属于 I/O 操作, 浏览器中对异步 I/O 提供了支持。
3. 受同源策略限制，即无法访问跨域的数据库。



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
基于服务器验证方式暴露的一些问题
1. Seesion：每次认证用户发起请求时，服务器需要去创建一个记录来存储信息。当越来越多的用户发请求时，内存的开销也会不断增加。

2. 可扩展性：在服务端的内存中使用Seesion存储登录信息，伴随而来的是可扩展性问题。

3. CORS(跨域资源共享)：当我们需要让数据跨多台移动设备上使用时，跨域资源的共享会是一个让人头疼的问题。在使用Ajax抓取另一个域的资源，就可以会出现禁止请求的情况。

4. CSRF(跨站请求伪造)：用户在访问银行网站时，他们很容易受到跨站请求伪造的攻击，并且能够被利用其访问其他的网站。

   

# Token


特点：
- 无状态、可扩展
- 支持移动设备
- 跨程序调用
- 安全

token 的认证方式类似于临时的证书签名, 并且是一种服务端无状态的认证方式, 非常适合于 REST API 的场景. 所谓无状态就是服务端并不会保存身份认证相关的数据。

使用 token 的 CORS 可以很好的处理跨域的问题。由于每次发送请求到后端，都需要检查 JWT，只要它们被验证通过就可以处理请求


![](https://image-static.segmentfault.com/328/265/3282657795-5d01e74493d33_articlex)

1. 用户通过用户名和密码发送请求
2. 程序验证
3. 程序返回一个签名的token给客户端
4. 客户端储存token, 并且每次用每次发送请求
5. 服务端验证Token并返回数据

每一次请求都需要token。token应该在HTTP的头部发送从而保证了Http请求无状态。我们同样通过设置服务器属性Access-Control-Allow-Origin:* ，让服务器能接受到来自所有域的请求。



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



# `localStorage` 是长效存储的，但是有的场景希望用它来实现数据缓存功能，并且像 `cookie` 一样可以设置时间，这该如何处理

```
/** * 设置本地存储 
	* @param {string} name key 
	* @param {*} value value 可以是string、obj等 
	* @param {number} time 缓存时间(ms) 
*/
	
export const setStorage = (name, data, cacheTime) => {  
	if (!name) return;  
	const storage = {    
		createdTime: new Date().getTime(),    
		cacheTime,    
		data,  
	};  
	window.localStorage.setItem(name, JSON.stringify(storage));}
	
/** * 获取本地存储 
	* 如果未设置缓存时间或者在缓存时间内则返回数据 
	* 如果过期则返回 undefined 
	* @param {string} name key 
*/
export const getStorage = name => {  
	if (!name) return;  
	const storage = JSON.parse(window.localStorage.getItem(name));  
	if (!storage) return;  
	if (storage.cacheTime && new Date().getTime() - storage.createdTime 
		> storage.cacheTime) {    
		clearStorage(name);    
		return;  
	}  
	return storage.data;
}
/** * 清除本地存储 
	* @param {string} name key 
*/
export const clearStorage = name => {  
	if (!name) return;  
	window.localStorage.removeItem(name);
}
```

