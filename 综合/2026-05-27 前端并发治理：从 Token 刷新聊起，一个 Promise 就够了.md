前端没有多线程，按理说不该有并发问题。但只要你写过稍微复杂一点的项目，就一定踩过这些坑：用户连点按钮提交了两次订单、搜索框的旧结果覆盖了新结果、五个请求同时 401 触发了五次 [Token 刷新](https://zhida.zhihu.com/search?content_id=272851350&content_type=Article&match_order=1&q=Token+%E5%88%B7%E6%96%B0&zhida_source=entity)……

这些问题看着各不相同，但背后其实是同一件事——**多个异步流程在抢同一个资源**。而解决它们的核心思路，往往只需要一个 Promise。

本文从最常见的 Token 刷新场景出发，一步步拆解前端并发问题的本质和通用解法。

### 前端鉴权那些事

前端处理登录态，方案其实挺多的，不同项目的选择差异很大。

最传统的是 **Cookie + Session**：登录后服务端种一个 Cookie，之后浏览器每次请求自动带上，前端几乎不用操心。很多项目至今还在用，简单可靠。

前后端分离流行之后，**JWT Token** 成了主流：后端返回一个 Token，前端存在 localStorage 里，请求时塞进 Header。至于 Token 过期怎么办，不同团队的处理方式五花八门——

最简单的是 **401 直接跳登录页**，干脆利落，很多内部系统就是这么干的，够用了。

稍微讲究一点的会做**滑动续期**：后端在每次请求时检查 Token 是否快过期，快过期就在响应头里塞一个新 Token，前端替换掉旧的，类似 Session 的自动续期。还有一种是前端自己算过期时间，**快到期时主动刷新**，不等 401 再处理。

再往上就是**[双 Token 机制](https://zhida.zhihu.com/search?content_id=272851350&content_type=Article&match_order=1&q=%E5%8F%8C+Token+%E6%9C%BA%E5%88%B6&zhida_source=entity)**：一个短期的 access token 用于日常请求（比如 15 分钟过期），一个长期的 refresh token 用于续期（比如 7 天过期）。access token 过期时，前端用 refresh token 静默换一个新的，用户无感知。

说实话，双 Token 是不是”最佳实践”，社区一直有争论——有人觉得在自家系统里是过度设计，滑动续期就够了；也有人觉得职责分离确实更安全。这个争论不是本文的重点，但双 Token 的前端实现确实是**最能体现并发问题的场景**——因为它涉及”Token 过期后静默刷新并重发请求”，而这个过程很容易在并发时出 bug。

所以我们就用它作为切入点。双 Token 的前端实现几乎形成了一个固定范式——**请求前统一注入 Token，响应后统一拦截刷新**。

请求发出前，从存储中取出 access token，塞进请求头：

```text
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

收到 401 响应时，不直接报错，而是悄悄用 refresh token 换一个新的 access token，然后把刚才失败的请求重新发一遍，用户甚至感知不到：

```text
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axios(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

如果 refresh token 也过期了呢？那就退化回最简单的方案——清除登录态，跳回登录页。双 Token 机制不是消灭了”跳登录”，只是把它推迟到了最后一刻：

```text
async function refreshToken() {
  try {
    const { data } = await axios.post('/auth/refresh', {
      refresh_token: localStorage.getItem('refresh_token')
    });
    localStorage.setItem('access_token', data.access_token);
    return data.access_token;
  } catch {
    localStorage.clear();
    window.location.href = '/login';
    return Promise.reject();
  }
}
```

打个比方：请求拦截器负责”带上门禁卡”，响应拦截器负责”门禁卡过期时自动换卡再刷一次”，换卡也失败就”回前台重新办卡”。

到这里一切看起来很完美。但有一个问题被我们忽略了——如果页面上同时有 5 个请求，它们几乎在同一瞬间都收到了 401，会发生什么？

答案是：5 个请求各自触发一次 `refreshToken()`，连发 5 次刷新请求。

![](https://picx.zhimg.com/v2-538e04c672025c7197b2cbad8e4721f1_1440w.jpg)

这显然不对。

### 并发难题：5 个 401 只该刷新一次

这是前端 Token 鉴权最经典的并发问题。传统方案是维护一个 `isRefreshing` 标志位加一个等待队列：第一个请求负责刷新，后续请求排队等结果。这种方案能用，但代码比较啰嗦。

其实有一个更简洁的思路：**不用队列，直接缓存那个 refresh 的 Promise。** 多个请求发现 Token 过期时，如果已经有一个 refresh 在进行中，就直接 `await` 同一个 Promise——大家等的是同一件事，拿到的是同一个结果：

```text
let refreshPromise = null;

function getNewToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = axios
    .post('/auth/refresh', {
      refresh_token: localStorage.getItem('refresh_token'),
    })
    .then(({ data }) => {
      localStorage.setItem('access_token', data.access_token);
      return data.access_token;
    })
    .catch(err => {
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(err);
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}
```

![](https://picx.zhimg.com/v2-74894d8e341b77d22ff1259834117e67_1440w.jpg)

整个逻辑就靠一个变量 `refreshPromise`：有值说明刷新正在进行，所有人直接 await 它；没值就发起刷新并把 Promise 存起来。`finally` 里清空，这样下一轮过期时又能重新触发。

这个模式就叫 **[Promise Cache](https://zhida.zhihu.com/search?content_id=272851350&content_type=Article&match_order=1&q=Promise+Cache&zhida_source=entity)** 吧。

### 等一下，标志位不就够了吗？

看到这里你可能会想：搞什么 Promise Cache，我用一个布尔标志位挡住重复调用不就行了？

```text
let isRefreshing = false;

async function refreshToken() {
  if (isRefreshing) return;
  isRefreshing = true;
  try {
    const { data } = await axios.post('/auth/refresh');
    localStorage.setItem('access_token', data.access_token);
  } finally {
    isRefreshing = false;
  }
}
```

对于某些场景确实够了——比如埋点上报、按钮防连点，你只需要”别重复执行”，不关心结果。但 Token 刷新不行。看看会发生什么：

```text
请求 A 收到 401 → 发起 refresh，isRefreshing = true
请求 B 收到 401 → 发现 isRefreshing → return → 拿到 undefined → 没有新 token → 重发失败
请求 A 的 refresh 成功了 → 但 B 已经错过了
```

标志位把 B “挡回去”了，但 B 还需要结果啊。Promise Cache 不一样，B 不是被拒绝，而是”挂在同一个 Promise 上等”：

```text
请求 A 收到 401 → 发起 refresh，缓存 Promise
请求 B 收到 401 → await 同一个 Promise → 等着
refresh 成功 → A 和 B 同时拿到新 token → 各自重发
```

所以判断标准很简单：调用者只需要”别重复执行”→ 标志位就够。调用者还需要”等到结果再继续”→ 必须用 Promise Cache。打个比方，前者是”门卫拦人”，后者是”拼车到终点”。

![](https://pic1.zhimg.com/v2-3404c2a7792b433de00ca1e180570734_1440w.jpg)

### 举一反三：前端并发问题的两大类

Token 刷新只是冰山一角。一旦你理解了 Promise Cache 的本质，就会发现前端到处都有类似的并发场景。它们大致分两类：

### 第一类：多次触发，只该执行一次

这正是 Promise Cache 的主场。除了 Token 刷新，还有——

**多个组件同时请求同一个接口。** 比如页面上三个组件都需要用户信息，几乎同时调 `GET /user`，没必要发三次：

```text
const pending = new Map();

function dedupRequest(key, requestFn) {
  if (pending.has(key)) return pending.get(key);
  const p = requestFn().finally(() => pending.delete(key));
  pending.set(key, p);
  return p;
}

dedupRequest('user-info', () => axios.get('/user'));
```

**按钮防重复提交。** 用户手快连点了三次”下单”：

```text
let submitPromise = null;

async function handleSubmit(data) {
  if (submitPromise) return submitPromise;
  submitPromise = axios.post('/order', data).finally(() => {
    submitPromise = null;
  });
  return submitPromise;
}
```

模式完全一样：有在飞的 Promise 就复用，没有就新建一个。

### 第二类：多次触发，只保留最后一次

搜索联想是最典型的例子。用户快速输入 a → ab → abc，三个请求飞出去，但 `a` 的请求可能最后才返回，把 `abc` 的正确结果覆盖掉。

这里要做的不是合并，而是**丢弃过期的结果**。最简单的方案是用一个自增 ID：

```text
let currentRequestId = 0;

async function search(keyword) {
  const id = ++currentRequestId;
  const res = await axios.get('/search', { params: { q: keyword } });
  if (id !== currentRequestId) return; // 已经过时了，丢掉
  setResults(res.data);
}
```

更彻底的做法是用 `AbortController` 直接取消上一次请求，连响应都不用判断：

```text
let controller = null;

async function search(keyword) {
  controller?.abort();
  controller = new AbortController();
  const res = await axios.get('/search', {
    params: { q: keyword },
    signal: controller.signal,
  });
  setResults(res.data);
}
```

你可能会问：用时间戳代替自增 ID 行不行？能用，但有坑。浏览器里 `Date.now()` 精度通常只有 1ms，有些浏览器出于安全考虑（防 Spectre 攻击）甚至故意降到 5ms。用户快速输入时，两次调用完全可能拿到同一个时间戳，竞态又回来了。自增 ID 就没这个问题，每次 `++` 天然唯一、严格递增，不依赖任何平台特性。至于溢出？`Number.MAX_SAFE_INTEGER` 约 9 千万亿，每秒自增 1000 次也要 2.85 亿年才会用完，页面一刷新还归零。

### 异步单例：当 Promise Cache 遇上设计模式

聊完了接口层的并发，再看一个更”架构”的场景——SDK 初始化。

单例模式大家都熟悉：

```text
class SDK {
  static instance = null;
  static getInstance() {
    if (!this.instance) this.instance = new SDK();
    return this.instance;
  }
}
```

同步实例化时没问题。但前端 SDK 的初始化往往是异步的——加载远程脚本、拉取配置、建立 WebSocket 连接。这时候单例就有一个微妙的 bug：

```text
模块 A 调用 getInstance() → instance 为 null → new SDK() → 开始异步 init()...
模块 B 调用 getInstance() → instance 已经存在！→ 直接返回 → 拿到一个还没初始化完的实例 → 💥
```

问题出在哪？单例只保证了”只 new 一次”，但没保证”等初始化完再给你”。这恰好是 Promise Cache 能解决的：

```text
class SDK {
  static initPromise = null;
  static getInstance() {
    if (!this.initPromise) {
      const sdk = new SDK();
      this.initPromise = sdk.init().then(() => sdk);
    }
    return this.initPromise;
  }
}

const sdk1 = await SDK.getInstance(); // 触发初始化
const sdk2 = await SDK.getInstance(); // 挂在同一个 Promise 上等
// sdk1 === sdk2，且都是初始化完成的
```

**单例保证”只创建一个实例”，Promise Cache 保证”只执行一次异步过程，且所有人都能等到结果”。** 可以说，Promise Cache 就是异步世界的单例模式。

### 但这样有个代价：async 传染

上面的方案解决了并发问题，却带来了一个新的烦恼——初始化只需要等一次，但之后每次调用 `getInstance()` 都要写 `await`，即使 Promise 早就 resolved 了。虽然性能上没问题（只是一个 microtask），但 async 像病毒一样”传染”，逼着所有调用方都变成异步函数。

一种改进是两层缓存——初始化阶段缓存 Promise，完成后缓存实例：

```text
class SDK {
  static instance = null;
  static initPromise = null;

  static getInstance() {
    if (this.instance) return this.instance;           // 已完成，同步返回
    if (this.initPromise) return this.initPromise;     // 进行中，返回 Promise
    this.initPromise = new SDK().init().then(sdk => {
      this.instance = sdk;
      this.initPromise = null;
      return sdk;
    });
    return this.initPromise;
  }
}
```

但这带来了新的心智负担：`getInstance()` 有时返回实例，有时返回 Promise，调用方需要知道当前是哪个阶段。

更干净的做法是**把初始化和获取拆成两个方法**，各司其职：

```text
class SDK {
  static instance = null;
  static initPromise = null;

  static init() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = new SDK().setup().then(sdk => {
      this.instance = sdk;
      return sdk;
    });
    return this.initPromise;
  }

  static getInstance() {
    if (!this.instance) throw new Error('SDK 未初始化，请先调用 SDK.init()');
    return this.instance; // 永远同步
  }
}
```

使用起来职责清晰：

```text
// 应用入口，只调一次
await SDK.init();

// 之后所有地方，同步获取
const sdk = SDK.getInstance();
sdk.doSomething();
```

这也是大部分主流 SDK 的实际做法——在应用启动时 `await` 一次初始化，之后全同步访问。

当然，这意味着**调用方需要自己保证时序**——`getInstance()` 必须在 `init()` 完成之后才能调。实践中一般把 `init()` 卡在应用挂载之前来解决这个问题：

```text
async function bootstrap() {
  await SDK.init();
  app.mount('#root'); // SDK 就绪后才启动应用
}
bootstrap();
```

这也是为什么 Vue 的 `app.use()`、各种插件的 `install()` 都设计在 `mount()` 之前——用**启动流程的顺序**来隐式保证时序。

归根结底是一个取舍：Promise Cache 让框架替你管时序，调用方无脑 await 就行，但 async 会传染；init/getInstance 分离给了你同步访问的清爽，但得自己控制好初始化入口。SDK 是全局基础设施、入口明确的，分离方案更干净；初始化时机不确定、调用方散落各处的，Promise Cache 更安全。

### 总结

前端的”并发问题”大多不是真正的多线程竞争，而是多个异步流程在抢同一个资源。折腾到最后，核心解法就两个：

![](https://pic1.zhimg.com/v2-11b4139a73805273a77a5712d3fa8f90_1440w.jpg)

而 Promise Cache 的本质，就是**异步世界的单例模式**。一个变量，一个 `if` 判断，一个 `finally` 清理——三行逻辑，解决一大类问题。

下次再遇到”多个地方同时调、但只该执行一次”的需求，别急着加锁、加队列、加标志位。先想想：能不能缓存那个 Promise？
