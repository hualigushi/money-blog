##### 有没有用户行为

![图片](https://mmbiz.qpic.cn/mmbiz_png/Hp2EvpxBicAhnzgHYXXojyW0WpVeqibibBZDr3man0uoM6oZNMkGTYFarFLicwBjCiavib0y5R4fGWcQibujXJej9cJYQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)



通常我们可以通过判断事件上的`isTrusted`属性来判断是不是真实的事件，

大部分情况我们都能够很好的处理，但是攻击者是很可怕的，这些简单的伎俩他们能够轻轻松松的绕过，他可以重写事件啊，比如：

```js
function clone(e) {
    const t = {};
    for (let attr in e) {
        if (typeof e[attr] === "function") {
            t[attr] = e[attr];
        } else {
            Object.defineProperty(t, attr, {
                get: () => {
                    if (attr === 'isTrusted') {
                        return true;
                    }
                    return e[attr];
                },
                set: v => {
                    e[attr] = v;
                }
            });
        }
    }
    return t;
}
const oldAEL = document.addEventListener;
window.addEventListener = document.addEventListener = function (e, func, c) {
    const newFunc = function (event) {
        const newEvent = clone(event);
        return func(newEvent);
    };
    return oldAEL.call(this, e, newFunc, c);
};js
```

通过上面的例子我们发现，不管我们怎么攻防，攻击者都是有办法绕过去的。