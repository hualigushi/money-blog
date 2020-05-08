**navigator.sendBeacon()** 方法可用于通过[HTTP](https://developer.mozilla.org/zh-CN/docs/Glossary/HTTP)将少量数据异步传输到Web服务器。

该方法发送数据的 HTTP 方法是 POST，可以跨域，类似于表单提交数据。它不能指定回调函数。

发出的是异步请求，但是请求是作为浏览器任务执行的，与当前页面是脱钩的。因此该方法不会阻塞页面卸载流程和延迟后面页面的加载。

## 语法

```
navigator.sendBeacon(url, data);
```

### 参数

- `url`参数表明 `data` 将要被发送到的网络地址。

- `data` 参数是将要发送的 [`ArrayBufferView`](https://developer.mozilla.org/zh-CN/docs/Web/API/ArrayBufferView) 或 [`Blob`](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob), [`DOMString`](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMString) 或者 [`FormData`](https://developer.mozilla.org/zh-CN/docs/Web/API/FormData) 类型的数据。

  根据官方规范，需要 request header 为 CORS-safelisted-request-header，在这里则需要保证 Content-Type 为以下三种之一：

  application/x-www-form-urlencoded
  multipart/form-data
  text/plain

- **发送数据大小限制**
  目前没有给出具体的发送数据大小限制标准，不过有人做了下面的测试，当数据长度是65536时，异步请求进入浏览器发送队列失败，表明数据大小是有限制，不同的浏览器应该有所差别。

### 返回值

sendBeacon 如果成功进入浏览器的发送队列后，会返回true；如果受到队列总数、数据大小的限制后，会返回false。返回ture后，只是表示进入了发送队列，浏览器会尽力保证发送成功，但是否成功了，无法判断。

## 描述

这个方法主要用于满足统计和诊断代码的需要，这些代码通常尝试在卸载（unload）文档之前向web服务器发送数据。过早的发送数据可能导致错过收集数据的机会。然而，对于开发者来说保证在文档卸载期间发送数据一直是一个困难。因为用户代理通常会忽略在 `unload` 事件处理器中产生的异步 [`XMLHttpRequest`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest)。

为了解决这个问题， 统计和诊断代码通常要在 `unload` 或者 `beforeunload` 事件处理器中发起一个同步 `XMLHttpRequest` 来发送数据。同步的 `XMLHttpRequest` 迫使用户代理延迟卸载文档，并使得下一个导航出现的更晚。下一个页面对于这种较差的载入表现无能为力。

有一些技术被用来保证数据的发送。其中一种是通过在卸载事件处理器中创建一个图片元素并设置它的 src 属性的方法来延迟卸载以保证数据的发送。因为绝大多数用户代理会延迟卸载以保证图片的载入，所以数据可以在卸载事件中发送。另一种技术是通过创建一个几秒钟的 no-op 循环来延迟卸载并向服务器发送数据。

这些技术不仅编码模式不好，其中的一些甚至并不可靠而且会导致非常差的页面载入性能。

下面的例子展示了一个理论上的统计代码——在卸载事件处理器中尝试通过一个同步的 `XMLHttpRequest` 向服务器发送数据。这导致了页面卸载被延迟。

```js
window.addEventListener('unload', logData, false);

function logData() {
    var client = new XMLHttpRequest();
    client.open("POST", "/log", false); // 第三个参数表明是同步的 xhr
    client.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
    client.send(analyticsData);
}
```

这就是 **`sendBeacon()`** 方法存在的意义。使用 **`sendBeacon() `**方法会使用户代理在有机会时异步地向服务器发送数据，同时不会延迟页面的卸载或影响下一导航的载入性能。这就解决了提交分析数据时的所有的问题：数据可靠，传输异步并且不会影响下一页面的加载。此外，代码实际上还要比其他技术简单许多！

下面的例子展示了一个理论上的统计代码模式——通过使用 **`sendBeacon()`** 方法向服务器发送数据。

```js
window.addEventListener('unload', logData, false);

function logData() {
    navigator.sendBeacon("/log", analyticsData);
}




// 1. DOMString类型，该请求会自动设置请求头的 Content-Type 为 text/plain
const reportData = (url, data) => {
  navigator.sendBeacon(url, data);
};

// 2. 如果用 Blob 发送数据，这时需要我们手动设置 Blob 的 MIME type，
// 一般设置为 application/x-www-form-urlencoded。
const reportData = (url, data) => {
  const blob = new Blob([JSON.stringify(data), {
    type: 'application/x-www-form-urlencoded',
  }]);
  navigator.sendBeacon(url, blob);
};

// 3. 发送的是Formdata类型，
// 此时该请求会自动设置请求头的 Content-Type 为 multipart/form-data。
var data = {
   name: '前端名狮子'  ,
   age: 20
};
const reportData = (url, data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    let value = data[key];
    if (typeof value !== 'string') {
      // formData只能append string 或 Blob
      value = JSON.stringify(value);
    }
    formData.append(key, value);
  });
  navigator.sendBeacon(url, formData);
};
```