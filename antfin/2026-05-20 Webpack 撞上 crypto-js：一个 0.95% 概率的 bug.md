## 背景
上周收到个诡异的问题咨询，同一份代码在主站部署后可以正常访问，但在 ATS 环境部署后，浏览器会报 `webpack load chunk failed`，加载失败的原因是 syntax error。

<img src="https://intranetproxy.alipay.com/skylark/lark/0/2026/png/185583/1778480246776-55fe43b4-e2fc-4f7b-874b-aa6cd3a597cb.png" width="919" title="" crop="0,0,1,1" id="u4c978bc8" class="ne-image">

框架代码很久没动了，用户代码仓库里虽然有不少自定义构建逻辑，但这次 diff 是干净的，嫌疑只能往构建产物本身查。

定位到非法 token：`38e10c01d4`。它甚至不是合法 JS 标识符——`38e10` 是个数字，`c01d4` 是个标识符，中间没有任何分隔。按位置反查到正常产物里同位置的值是 `3255491064`，也就是 `0xC20AD9F8`，**crypto-js Blowfish S-box 里的一个常量**。

也就是说，构建过程中，有人在不知情的情况下把这个常量改了。

| <img src="https://intranetproxy.alipay.com/skylark/lark/0/2026/png/185583/1778480459964-25a1d447-912b-4009-b7b5-9579f249db09.png" width="783" title="压缩前" crop="0,0,1,1" id="F9JkP" class="ne-image"> | <img src="https://intranetproxy.alipay.com/skylark/lark/0/2026/png/185583/1778480514471-a6413a6d-c85e-498d-9b51-75532c4efd2c.png" width="605" title="压缩后" crop="0,0,1,1" id="u22ec27b2" class="ne-image"> |
| --- | --- |


## 第一个怀疑是 minifier
产物里出现非法 token，几乎所有人的第一反应都是压缩器。Bigfish 默认用的是 esbuild 0.21.4。

为了快速验证，同时跑了两条路：

+ 关掉压缩，直接出包
+ 把 minifier 从 esbuild 换成 swc

**两条路都得出『产物正常』。**

这是整次排查里最强、也最假的信号。两个独立的修复同时生效，几乎不会有人怀疑根因不在 minifier。所以接下来几个小时都在围着 esbuild 转。

## esbuild 差点背了黑锅
如果真是 esbuild 0.21.4 的 bug，按惯例应该能做出最小复现。试了几条路：

+ 把坏掉的 crypto-js 模块单独拉出来扔进 [esbuild REPL](https://esbuild.github.io/try/)
+ 新建空项目，只装 esbuild 0.21.4 跑同样的 transform
+ 把 terser-webpack-plugin 单独跑一遍
+ 拿到 unminified 的 webpack 产物（13MB），用 0.21.4 直接压

无论怎么模拟，输出都是干净的——`3255491064` 原样在那，没有 `38e10c01d4`。

让 Claude Code 帮忙翻 esbuild 历史 issue 找类似 case。它先报了几个候选编号，但逐个对都对不上；追问的时候它主动澄清：之前那句『esbuild 出过几次类似 bug』是凭印象的泛化，没具体依据。

<img src="https://intranetproxy.alipay.com/skylark/lark/0/2026/png/185583/1778480714944-82050f0f-c9f3-494e-ba60-24df9f1f9b53.png" width="1492" title="" crop="0,0,1,1" id="u7abd6b1a" class="ne-image">

僵局形成了：模拟环境复现不出问题，**不等于真实环境里 esbuild 没问题**；但云构建跑完即销毁，没法 SSH 上去看现场，只能让 esbuild 自己在跑的时候把证据吐出来。

让 Claude Code 写了个 postinstall 脚本，去 patch terser-webpack-plugin 在调用 `esbuild.transform` 前后把关键信息做识别输出，esbuild 的嫌疑立即被洗清了：

<img src="https://intranetproxy.alipay.com/skylark/lark/0/2026/png/185583/1778480894058-b37f0ade-d25a-4b18-8b97-8cf47c570e85.png" width="1099" title="" crop="0,0,1,1" id="u10339821" class="ne-image">

## 捉拿真凶
方向从 minifier 拉出来之后，问题重新具体化。在最终坏掉的产物里 grep：

+ `38e10c01d4` 全局**只出现 1 次**（就是坏掉的位置）
+ `3255491064` 一次都没有
+ 周围邻居 S-box 常量（`0x28517711` 等）完好

『全局只此一处被换、其它位置完好』——这是按字符串做精确全局替换的特征。webpack 里干这事的就一个：`RealContentHashPlugin`。

它的工作方式有点像 Ctrl+H：编译时先用 placeholder hash 写进 chunk 文件名和引用处，编译完后再计算每个 chunk 的真实 hash，然后**全文搜索 placeholder、一并替换成真实 hash**。

问题在于 placeholder 和真实 hash 都是 `[0-9a-f]` 的 10 位串。如果某个 chunk 的 placeholder hash 恰好长成 `3255491064`（10 位全是数字），那它会把产物里所有 `3255491064` 子串——包括 S-box 那个常量——一并换成真实 hash `38e10c01d4`。

关掉 `optimization.realContentHash`，bug 消失。

### 算一笔概率账
`[contenthash:10]` 是 16 进制串。10 位全部落在 `[0-9]` 的概率是：

```plain
(10/16) ^ 10 ≈ 0.95%
```

crypto-js Blowfish S-box 有 1024 个 32-bit 常量。其中有多少十进制表示恰好是 10 位、且会被 minifier 转成十进制字面量？粗略期望约 10 个。

大型应用一次构建有几百个 chunk。chunk hash 撞上『全数字 10 位』形态的几率不可忽略；只要撞上、且这个十进制串又出现在产物某处文本里，replace 就会触发。

所以这是一个**反复出现但难复现**的偶发问题：每隔几次构建撞一次，模拟环境永远撞不上。

### 回头看那两条 workaround
回到第二节那个『最强也最假的信号』。两条 workaround 『都修好了』，因为它们都让产物里**根本不存在 **`3255491064`** 这个 token**：

+ **关压缩**：`0xC20AD9F8` 保留为 hex 字面量，产物里没有十进制形态
+ **换 swc**：swc 在这个 case 没把那个 hex 折算成十进制

只有 esbuild 把 hex 折成了 10 位全数字十进制，刚好对得上 placeholder hash 形态。

也就是说：bug 不是 minifier 制造的，但 minifier 是**把 source 形态磨到能撞上 hash 形态的那把磨子**。两条 workaround 本质上是换了把磨子——现象消失，根因没被指认。

这是这次排查最容易踩坑的地方。**两条独立 workaround 同时生效，并不等于根因就在它们的交集里**。

## 修复方式
```typescript
export default {
  chainWebpack(memo) {
    memo.merge({ optimization: { realContentHash: false } });

    return memo;
  },
}
```

如果你的项目正好遇上了这个极低概率的事件，短期解法就是配置 `optimization.realContentHash: false` 关掉这层 post-processing。代价是长缓存场景下，chunk 内容变了但文件名没变的情况会重新出现——这正是 `realContentHash` 当初被引入要解决的问题。

长期来还有几条路可以跟进：

+ 去 Webpack 上游看看能否从源头避免这个 bug，为社区做贡献
+ 内部会逐步用新一代的自研构建器 Utoopack 替换掉 Webpack 构建，目前已覆盖到 Bigfish 和 Smallfish
+ 评估能否在框架侧做产物的通用性问题校验，尽量不把问题暴露到构建后面的环节

