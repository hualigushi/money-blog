### JavaScript 中的原生函数

在 JavaScript 中，“原生函数”（Native function） 是那些源代码被编译为原生机器码的函数。

我们可以在 [JavaScript 标准内置对象](https://link.zhihu.com/?target=https%3A//developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects) 中找到原生函数（诸如 `eval()`，`parseInt()`） ，或者在 [浏览器 Web API](https://link.zhihu.com/?target=https%3A//developer.mozilla.org/zh-CN/docs/Web/API) 找到（诸如 `fetch()`，`localStorage.getItem()`）。

由于 JavaScript 的动态特性，开发者可以覆盖浏览器暴露出的原生函数。这种技巧被我们称作 [猴子补丁（Monkey patching ）](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/Monkey_patch) 。

### 猴子补丁

猴子补丁主要用于修改浏览器内置 API 和原生函数的默认行为。这通常是添加特定功能、polyfill 特性、hook 到 API 的唯一方法，因为我们没法直接对这些 API 进行访问。

例如，像是 [Bugsnag](https://link.zhihu.com/?target=https%3A//www.bugsnag.com/) 这样的监测工具，重写了 Fetch 和 XMLHttpRequest 的 API 来获取由 JavaScript 代码触发的网络连接相关信息。

猴子补丁是个强大而危险的技巧，因为你没法控制那些被你覆盖的代码：未来 JavaScript 引擎的更新可能会打破你在补丁中做出的一些假设，并导致严重的 Bug。

另外，对那些并非由你负责的代码打猴子补丁，可能会覆盖一些被其他开发者加入的猴子补丁，引入潜在的冲突。

由于种种原因，有时需要确定给定函数是否是原生函数，是否被打了猴子补丁，但是我们能做到吗？

### 用 `toString()` 来检查函数上的猴子补丁

检查一个函数是否 “干净”（没有猴子补丁） 最常用的方式那就是检查函数的 `toString()` 输出。

默认情况下，原生函数的 `toString()` 返回这么一行 `"function fetch() { [native code] }"`



![img](https://pic4.zhimg.com/80/v2-be35f19ef0f0f3446bf640f148934e63_1440w.webp)



依照运行 JavaScript 引擎的不同，输出结果会略有不同。不过，在大多数浏览器中，还是可以很安全的假定返回的字符串中会包含 `"[native code]"` 。

打过猴子补丁的原生函数，它的 `toString()` 将不会返回包含 `"[native code]"` 的字符串，而是会返回字符串化的函数体。

所以说，想要知道函数是否仍是原生的，我们可以通过检测 `toString()` 输出是否包含 `"[native code]"` 来简单判断。

基本的检测方式如下：

```js
function isNativeFunction(f) {
  return f.toString().includes("[native code]");
}

isNativeFunction(window.fetch); // → true

// 对 fetch API 打猴子补丁
(function () {
  const { fetch: originalFetch } = window;
  window.fetch = function fetch(...ƒargs) {
    console.log("Fetch call intercepted:", ...args);
    return originalFetch(...args);
  };
})();

window.fetch.toString(); // → "function fetch(...args) {\n console.log("Fetch...

isNativeFunction(window.fetch); // → false
```

这种方式在大多数场景下都能正常生效。然而，你得清楚，很多伎俩可以让函数绕过这个检测。无论是出于恶意目的（注入恶意代码）还是说你不希望自己的覆盖行为被发现，有几种方法可以让函数看起来很 “原生”。

比如，可以添加一些包含 `"[native code]"` 的代码（甚至是一条注释！）在函数体里：

```js
(function () {
  const { fetch: originalFetch } = window;
  window.fetch = function fetch(...args) {
    // function fetch() { [native code] }
    console.log("Fetch call intercepted:", ...args);
    return originalFetch(...args);
  };
})();

window.fetch.toString(); // → "function fetch(...args) {\n // function fetch...

isNativeFunction(window.fetch); // → true
```

… 或者，可以重写 `toString()` 方法，返回包含 `"[native code]"` 的字符串：

```js
(function () {
  const { fetch: originalFetch } = window;
  window.fetch = function fetch(...args) {
    console.log("Fetch call intercepted:", ...args);
    return originalFetch(...args);
  };
})();

window.fetch.toString = function toString() {
  return `function fetch() { [native code] }`;
};

window.fetch.toString(); // → "function fetch() { [native code] }"

isNativeFunction(window.fetch); // → true
```

… 或者，可以用 `bind` 创建猴子补丁函数，这会生成一个原生函数：

```js
(function () {
  const { fetch: originalFetch } = window;
  window.fetch = function fetch(...args) {
    console.log("Fetch call intercepted:", ...args);
    return originalFetch(...args);
  }.bind(window.fetch); //  
})();

window.fetch.toString(); // → "function fetch() { [native code] }"

isNativeFunction(window.fetch); // → true
```

… 或者，可以通过 ES6 的 [Proxy](https://link.zhihu.com/?target=https%3A//developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 来捕获 `apply()` 调用，这样一来，从外部来看，函数完全是原生的：

```js
window.fetch = new Proxy(window.fetch, {
  apply: function (target, thisArg, argumentsList) {
    console.log("Fetch call intercepted:", ...argumentsList);
    Reflect.apply(...arguments);
  },
});

window.fetch.toString(); // → "function fetch() { [native code] }"

isNativeFunction(window.fetch); // → true
```

好了，我就不举例子了。

我主要想强调的是： **开发者可以轻易地绕开你的 `toString()` 检测**。

我觉得大多数情况下，不需要太在意上面那些边缘情况。但是如果你想的话，还是可以用一些额外检测来覆盖上面的用例。

例如： - 可以使用一次性的 iframe 来获取 “干净” 的 `toString()` 值，再做严格匹配； - 可以多次调用 `.toString().toString()` 确保 `toString()` 不被重写； - 使用元编程技巧，对 `Proxy` 构造函数自身来打个猴子补丁，以此来确定原生函数是否被代理过了（因为依照规范，无法察觉到什么东西是 `Proxy`） - 等等 …

这完全取决于你想在 `toString()` 这个兔子洞里钻多深。

但是这真的值得吗？我们能够覆盖所有的边缘情况吗？

### 从 `iframe` 获取干净的函数

如果你需要调用一个 “干净” 的函数，而不是去检查原生函数是不是被打过猴子补丁，那么我们可以从同源的 `iframe` 中获取：

```js
// 创建一个同源的 iframe
// 你可能需要添加一些样式先隐藏 iframe，稍后再从 DOM 中彻底删除
const iframe = document.createElement("iframe");
document.body.appendChild(iframe);
// 新的 iframe 会创建它自身的 “干净” window 对象，这样你就可以从这里拿到你想要的函数了
const cleanFetch = iframe.contentWindow.fetch;
```

尽管，我觉得这种方式比调用 `toString()` 去做验证要好，但也会有一些局限性； - iframe 有时会由于 [强 CSP](https://link.zhihu.com/?target=https%3A//developer.mozilla.org/en-US/docs/Web/HTTP/CSP) 或者 你的代码没有通过浏览器运行 而导致不可用。 - 尽管不太现实，但第三方可以给 iframe API 上猴子补丁。所以还是不能 100% 信任生成 iframe 的 window 对象。 - 修改或调用 DOM 的原生函数（比如 `document.createElement`）没法使用这种方法，因为它们会指向 iframe 的 DOM 而不是顶层的 DOM。

这个解决方案来自 [https://lobste.rs/s/pppun8/checking_if_javascript_native_function](https://link.zhihu.com/?target=https%3A//lobste.rs/s/pppun8/checking_if_javascript_native_function) 。

### 通过判断引用是否相等来检查函数上的猴子补丁

如果安全是你首要考虑的因素，我认为你可以选择一种不同的方法：长期存储一个 “干净” 的原生函数引用，然后，用它来和可能的猴子补丁函数进行比较：

```text
<html>
  <head>
    <script>
      // 在其他脚本修改原生函数之前，保存 “干净” 原生函数的原始引用。
      // 在这个例子中，我们保存了 fetch API 的原始引用
      // 并把它保存在闭包里。如果你无法预先决定要检查什么 API，
      // 那可以存储多个 window 对象。
      (function () {
        const { fetch: originalFetch } = window;
        window.__isFetchMonkeyPatched = function () {
          return window.fetch !== originalFetch;
        };
      })();
      // 现在开始，你可以调用 window.__isFetchMonkeyPatched()
      // 来检查 fetch API 是不是被打了猴子补丁
      //
      // 例如：
      window.fetch = new Proxy(window.fetch, {
        apply: function (target, thisArg, argumentsList) {
          console.log("Fetch call intercepted:", ...argumentsList);
          Reflect.apply(...arguments);
        },
      });
      window.__isFetchMonkeyPatched(); // → true
    </script>
  </head>
</html>
```

通过严格的引用检查，我们可以避免所有的 `toString()` 漏洞。甚至这种方式也能应用于Proxy，因为 Proxy 没法捕获相等性比较 。

这种方法最大的问题在于有点不切实际。它需要在运行任何 app 中其他代码之前，保存函数的原始引用，以确保函数没有被动过手脚。但我们有时根本没法做到这一点（比如，你构建的是库）。

> 可能有些方式能绕过这项测试，但是我在撰写本文时没有想到。欢迎大家补充。

### 那么，如何确定 JavaScript 原生函数是否被重写过呢？

我 **需要** 检查函数上猴子补丁的次数，用一只手都能数得过来。

不过我对这个问题很感兴趣，我认为对于很多场景，不存在真正万无一失的判定方法。

- 如果你能控制整个网页，可以预先在函数都还是 “干净” 的时候存储它们，之后再进行比较。
- 不然，你可以使用 iframe，创建一次性的 iframe 并从中获取 “干净” 的函数。但你要明白你还是无法 100% 确定 iframe API 是否被动了手脚。
- 再者，由于 JavaScript 的动态特性，你可以简单使用 `toString().includes("[native code])"` 来检查（但恶意代码很容易绕过这种检测）。你还可以增加大量的安全检测来覆盖大多数（没法做到全部）的边缘情况。