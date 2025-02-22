一般我们检测到这些变量的时候可以无脑的认为就是模拟器，

比如`Puppeteer`中我们启动的时候，`navigator.webdriver`这一属性的值等于`true`的，

常规浏览器中由于没有这个属性`navigator.webdriver`的值等于`undefined`的。

```js
Object.defineProperty(navigator, 'webdriver', {
 get: () => undefined,
});
```

攻击者这样篡改后我们是不是就没有办法知道是不是`webdriver`了呢？

其实我们还是有办法判断的，因为这边只是返回了`navigator.webdriver`的值是非的，

但是`navigator`上依旧有`webdriver`这个属性，我们有没有办法检测属性是否存在呢？

其实我们很容易拿到`navigator`上所有属性的。

```js
var attr = window.navigator, result = [];
do {
    Object.getOwnPropertyNames(attr).forEach(function(a) {
        result.push(a)
    })
} while (attr=Object.getPrototypeOf(attr));
```

当我们判断`navigator`上有`webdriver`这个属性的时候，就可以简单的认为这个是模拟器环境，

是不是觉得很完美的判断了是不是模拟器了，

其实不是的，攻击者甚至可以删除掉`webdriver`属性。

```js
delete navigator.__proto__.webdriver
```

这样之后就完全抹去`webdriver`变量了，通过这个办法来判断是不是模拟器就没有路子了。