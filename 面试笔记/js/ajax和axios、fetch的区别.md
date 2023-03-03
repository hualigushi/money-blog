# jQuery ajax

传统 Ajax 指的是 XMLHttpRequest（XHR）， 最早出现的发送后端请求技术，隶属于原始js中，核心使用XMLHttpRequest对象，多个请求之间如果有先后关系的话，就会出现回调地狱。

JQuery ajax 是对原生XHR的封装，除此以外还增添了对JSONP的支持。经过多年的更新维护，真的已经是非常的方便了，优点无需多言；如果是硬要举出几个缺点，那可能只有：

1. 本身是针对MVC的编程,不符合现在前端MVVM的浪潮
2. 基于原生的XHR开发，XHR本身的架构不清晰。
3. JQuery整个项目太大，单纯使用ajax却要引入整个JQuery非常的不合理（采取个性化打包的方案又不能享受CDN服务）
4. 不符合关注分离（Separation of Concerns）的原则
5. 配置和调用方式非常混乱，而且基于事件的异步模型不友好。


# axios

axios 是一个基于Promise 用于浏览器和 nodejs 的 HTTP 客户端，本质上也是对原生XHR的封装，只不过它是Promise的实现版本，符合最新的ES规范，它本身具有以下特征：

1. 从浏览器中创建 XMLHttpRequest
2. 支持 Promise API
3. 客户端支持防止CSRF
4. 提供了一些并发请求的接口（重要，方便了很多的操作）
5. 从 node.js 创建 http 请求
6. 拦截请求和响应
7. 转换请求和响应数据
8. 取消请求
9. 自动转换JSON数据

PS:防止CSRF:就是让你的每个请求都带一个从cookie中拿到的key, 根据浏览器同源策略，假冒的网站是拿不到你cookie中得key的，这样，后台就可以轻松辨别出这个请求是否是用户在假冒网站上的误导输入，从而采取正确的策略。


# fetch

Fetch是基于promise设计的。是原生js，没有使用XMLHttpRequest对象。

- fetch API提供了js接口，用于替代XMLHttpRequest方式的网络请求，fetch()全局方法使用起来比XHR更加方便
- fetch方法接受2个参数，参数1为请求url或 Request 对象，参数2为可选配置对象

```
// fetch方法返回一个Promise对象，可用then方法接收结果，用catch方法捕获异常，同Promise使用
// 配置对象具体配置
const config = {
  method: 'GET',      // 请求方法
  headers: {          // 头信息
    'user-agent': 'Mozilla/4.0 MDN Example',
    'content-type': 'application/json'
  },
  body: JSON.stringify({  // 请求的 body 信息，Blob, FormData 等
    data: 1
  }),
  mode: 'cors',             // 请求的模式，cors、 no-cors 或 same-origin
  credentials: 'include',   // omit、same-origin 或 include。为了在当前域名内自动发送 cookie, 必须提供这个选项
  cache: 'no-cache',        // default 、 no-store 、 reload 、 no-cache 、 force-cache 或者 only-if-cached
  redirect: 'follow',       // 可用的 redirect 模式: follow (自动重定向), error (如果产生重定向将自动终止并且抛出一个错误), 或者 manual (手动处理重定向).
  referrer: 'no-referrer',  // no-referrer、client或一个 URL。默认是 client。
  referrerPolicy: 'no-referrer', // 指定 referer HTTP头
  integrity: 'sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=', // 包括请求的  subresource integrity 值
}
// 发起请求
fetch('http://biadu.com' [, config])
```

- then的回调函数接受一个Response对象参数，其对象拥有9个属性，8个方法
- 9个属性
  - type 只读 包含Response的类型 (例如, basic, cors)
  - url 只读 包含Response的URL
  - useFinalURL 包含了一个布尔值来标示这是否是该Response的最终URL
  - status 只读 包含Response的状态码
  - ok 只读 包含了一个布尔值来标示该Response成功(状态码200-299)
  - redirected 只读 表示该Response是否来自一个重定向，如果是的话，它的URL列表将会有多个
  - statusText 只读 包含了与该Response状态码一致的状态信息
  - headers 只读 包含此Response所关联的Headers 对象
  - bodyUsed Body 只读 包含了一个布尔值来标示该Response是否读取过Body
- 8个方法
  - clone 创建一个Response对象的克隆
  - error 返回一个绑定了网络错误的新的Response对象
  - redirect(url, status) 用另一个URL创建一个新的 response
  - arrayBuffer 接受一个 Response 流, 并等待其读取完成. 并 resolve 一个 ArrayBuffer 对象
  - blob  blob()方法使用一个 Response 流，并将其读取完成
  - formData 将 Response 对象中的所承载的数据流读取并封装成为一个对象
  - json 使用一个 Response 流，并将其读取完成。解析结果是将文本体解析为 JSON
  - text 提供了一个可供读取的"返回流", 它返回一个包含USVString对象，编码为UTF-8



优点：

1.  语法简洁，更加语义化
2.  基于标准 Promise 实现，支持 async/await
3.  同构方便，使用 [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch)
4.  更加底层，提供的API丰富（request, response）
5.  脱离了XHR，是ES规范里新的实现方式

缺点：

1. fetch只对网络请求报错，对400，500都当做成功的请求，服务器返回 400，500 错误码时并不会 reject，只有网络错误这些导致请求不能完成时，fetch 才会被 reject。
2. fetch默认不会带cookie，需要添加配置项： fetch(url, {credentials: 'include'})
3. fetch不支持abort，不支持超时控制，使用setTimeout及Promise.reject的实现的超时控制并不能阻止请求过程继续在后台运行，造成了流量的浪费
4. fetch没有办法原生监测请求的进度，而XHR可以



fetch中可以设置mode为"no-cors"（不跨域）

```
fetch('/users.json', {
    method: 'post', 
    mode: 'no-cors',
    data: {}
}).then(function() { /* handle response */ });
```

会得到一个type为“opaque”的返回。需要指出的是，这个请求是真正抵达过后台的，所以我们可以使用这种方法来进行信息上报，在我们之前的image.src方法中多出了一种选择，

另外，我们在network中可以看到这个请求后台设置跨域头之后的实际返回，有助于我们提前调试接口（当然，通过chrome插件我们也可以做的到）。