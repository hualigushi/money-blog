在 HTTP 缓存领域，stale 用来形容一个缓存过期了，比如说是`max-age`指定的缓存时间到了。

一个资源的缓存过期之后，如果想再次使用它，需要先对该缓存进行 revalidate。在 revalidate 执行期间，客户端就得等待，直到 revalidate 请求结束，在一些特别注重性能的场景下，这种传统的同步更新缓存的机制被认为是有性能问题的。

`stale-while-revalidate`就是说当 revalidate 请求进行时，客户端可以不等待，直接使用过期的缓存，revalidate 完了缓存就更新了，下次用的就是新的了。所以`stale-while-revalidate`实现的功能用通俗的词语解释就是“后台缓存刷新”、“异步缓存更新”之类的。

`stale-while-revalidate`的用法和`max-age`类似，需要指定一个秒数作为参数。比如`Cache-Control: max-age=60, stale-while-revalidate=3600`是说，这个缓存在 60 秒内是新鲜的，从 60 秒到 3660 秒的这一个小时内，虽然缓存是过期了，但仍可以直接使用这个过期缓存，同时进行异步 revalidate，在 3660 秒之后，就是完全过期了，需要进行传统的同步 revalidate。



![img](https://pic4.zhimg.com/80/v2-c8782d31146c6d7991afb1770ef7ca2f_720w.jpg)



在`stale-while-revalidate`指定的时间段内读取缓存的话，Chrome DevTools 里除了能看到本身的那个直接读取过期缓存的请求（200），还可以看到异步刷新缓存的请求（304）：

![img](https://pic2.zhimg.com/80/v2-f6cef0b173f071e9517f48b7e45edd59_720w.jpg)



还有一个需要想清楚的地方，就是过期的缓存在刷新之后就不再是过期缓存了，而是会重新开启一次全新的生命周期，`stale-while-revalidate`指定的那个时间段并不是一定会经历完全。

![img](https://pic2.zhimg.com/80/v2-87cc3fd987a7a9fb63cfe52e04cb78c9_720w.jpg)stale-while-revalidate 重新计算缓存时长

上面有说到`stale-while-revalidate`在 CDN 上的应用其实并不广泛，那在浏览器端，我们有这样的需求吗？大家都知道现在大部分静态资源都是非覆盖式发布，发一个新版本就会去改变这个资源 URL 中的版本号或者 hash 值，这种情况下，该资源的缓存时长会设置特别大，比如一年、三年甚至十年，在它到期之前，早就已经不在线上使用了，也就是说它永远都不会过期。`stale-while-revalidate`对非覆盖式发布的资源没有用处。

不过总有一些场景，资源的 URL 是不能变的，比如网站首页，例如 [https://www.taobao.com/](https://link.zhihu.com/?target=https%3A//www.taobao.com/)（淘宝首页是可缓存的静态页面）；又或者说要变 URL 的话成本很大，比如要交给第三方使用的 URL。这些场景下 `stale-while-revalidate`才可能派上用场。

`stale-while-revalidate`是为了加载速度牺牲了资源的新鲜性（通常就牺牲一次），但有些场景下，可能一次也无法接受，比如就说淘宝首页，给它指定个一天的 `stale-while-revalidate`，那假如用户在双十一前一天访问过首页，页面会被缓存下来，然后第二天也就是双十一早上再打开，可能会发现页面和昨天一模一样，并没有双十一氛围的样式，虽然只有一次，但可能也无法接受。

所以说 `stale-while-revalidate`该不该用，该用多大的数字，需要自己视情况而定。不过就我目前的理解，`stale-while-revalidate`大、`max-age`小应该是主流的选择。甚至极端一点的`Cache-Control: max-age=0, stale-while-revalidate=36000000` 有应用场景也说不定。

上篇文章中讲到的 `must-revalidate`指令，可以屏蔽 `stale-while-revalidate`指令，比如：

```text
Cache-Control: max-age=60, stale-while-revalidate=3600, must-revalidate
```

或者再追加一个单独的 `Cache-Control`响应头：

```text
Cache-Control: max-age=60, stale-while-revalidate=3600
Cache-Control: must-revalidate 
```

但为何不直接把 `stale-while-revalidate`指令直接删掉？所以`must-revalidate` 仍然是个不应该去使用的东西。