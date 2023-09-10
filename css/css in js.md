# CSS-in-JS 的优缺点

## 优点

**1.Locally-scoped styles：** 当我们在裸写 CSS 的时候，很容易就污染到其他我们意想不到的组件。比如我们写了一个列表，每一行的需要加一个内边距和边框的样式。我们可能会写这样的 CSS 代码

```css
.row {
  padding: 0.5rem;
  border: 1px solid #ddd;
}
```

几个月之后可能你已经忘记了这个列表的代码了，然后你写了 `className="row"` 在另外的组件上，那么这个新的组件有了内边距合边框样式，你甚至都不知道为什么会这样。你可以使用更长的类名或者更加明确的选择器来避免这样的情况发生，但是你还是无法完全保证不会再出现这样的样式冲突。

CSS-in-JS 就可以通过 **Locally-scoped styles** 来完全解决这个问题。如果你的列表代码这么写的话：

```css
<div className={css`
        padding: 0.5rem;
        border: 1px solid #ddd;
    `}>
	...row item...
 </div>
```

这样的话，内边距和边框的样式永远不会影响到其他组件。

> 提示：CSS Modules 也提供了 **Locally-scoped styles**

**2. Colocation：** 你的 React 组件是写在 `src/components` 目录中的，当你裸写 CSS 的时候，你的 .css 文件可能是放置在 `src/styles` 目录中。随着项目越来越大，你很难明确哪些 CSS 样式是用在哪些组件上，这样最后你会冗余很多样式代码。

一个更好的组织代码的方式可能是将相关的代码文件放在同个地方。这种做法成为「共置」，可以通过这篇[文章](https://link.juejin.cn?target=https%3A%2F%2Fkentcdodds.com%2Fblog%2Fcolocation)了解一下。

问题在于其实很难实现所谓的「共置」。如果在项目中裸写 CSS 的话，你的样式和可能会作用于全局不管你的 .css 文件被放置在哪里。另一方面，如果你使用 CSS-in-JS，你可以直接在 React 组件内部书写样式，如果组织得好，那么你的项目的可维护性将大大提升。

> 提示：CSS Modules 也提供了「共置」的能力

**3. 在样式中使用 JavaScript 变量：** CSS-in-JS 提供了让你在样式中访问 JavaScript 变量的能力

```javascript
function App(props) {
    const color = "red";
    const ErrorMessageRed = styled.div`
      color: ${props.color || color};
      font-weight: bold;
    `;
    
    return (
        <div>
            <ErrorMessageRed>
              hello ErrorMessageRed !!
            </ErrorMessageRed>
        </div>
    );
}
```

上面的例子展示了，我们可以在 CSS-in-JS 方案中使用 JavaScript 的 const 变量 或者是 React 组件的 props。

这样可以减少很多重复代码，当我们需要同时在 JavaScript 和 CSS 两侧定义相同的变量的时候。

我们通过这样的能力可以不需要使用 inline styles 这样的方式来完成高度自定义的样式。( inline styles 对性能不是特别友好，当我们有很多相同的样式写在不同的组件的时候)



## 缺点

1. **CSS-in-JS 的运行时问题**。当你的组件进行渲染的时候，CSS-in-JS 库会在运行时将你的样式代码 ”序列化” 为可以插入文档的 CSS 。这无疑会消耗浏览器更多的 CPU 性能
2. **CSS-in-JS 让你的包体积更大了。** 这是一个明显的问题。每个访问你的站点的用户都不得不加载关于 CSS-in-JS 的 JavaScript。Emotion 的包体积压缩之后是 [7.9k](https://link.juejin.cn?target=https%3A%2F%2Fbundlephobia.com%2Fpackage%2F%40emotion%2Freact%4011.10.4) ，而 styled-components 则是 [12.7 kB](https://link.juejin.cn?target=https%3A%2F%2Fbundlephobia.com%2Fpackage%2Fstyled-components%405.3.6) 。虽然这些包都不算是特别大，但是如果再加上 react & react-dom 的话，那也是不小的开销。
3. **CSS-in-JS 让 React DevTools 变得难看。** 每一个使用 `css` prop 的 react 元素， Emotion 都会渲染成 `<EmotionCssPropInternal>` 和 `<Insertion>` 组件。如果你使用很多的 `css` prop，那么你会在 React DevTools 看到下面这样的场景

![1.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3861ff3f56ac4c7cb36348ce4666bf21~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

4. **频繁的插入 CSS 样式规则会迫使浏览器做更多的工作。** React 团队核心成员&React Hooks 设计者 [Sebasian](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fsebmarkbage) 写了一篇关于 CSS-in-JS 库如何与 React 18 一起工作的文章。他特别说到

> 在 concurrent 渲染模式下，React 可以在渲染之间让出浏览器的控制权。如果你为一个组件插入一个新的 CSS 规则，然后 React 让出控制权，浏览器会检查这个新的规则是否作用到了已有的树上。所以浏览器重新计算了样式规则。然后 React 渲染下一个组件，该组件发现一个新的规则，那么又会重新触发样式规则的计算。

**实际上 React 进行渲染的每一帧，所有 DOM 元素上的 CSS 规则都会重新计算**。这会*非常非常*的慢

更坏的是，这个问题好像是无解的（针对运行时 CSS-in-JS）。运行时 CSS-in-JS 库会在组件渲染的时候插入新的样式规则，这对性能来说是一个很大的损耗。

5. **使用 CSS-in-JS ，会有更大的概率导致项目报错**，特别是在 SSR 或者组件库这样的项目中。在 Emotion 的 GitHub 仓库，我们可以看到很多向如下的 issue

> 我在我的 SSR 项目中使用了 Emotion，但是它报错了，因为…….

在这些海量的 issue 中，我们可以找到一些共同特征：

- 多个 Emotion 实例被同时加载。如果多个被同时加载的实例是相同的Emotion 版本，这将会引起很多问题（[比如说](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Femotion-js%2Femotion%2Fissues%2F2639)）
- 组件库通常无法让您完全控制插入样式的顺序（[比如说](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Femotion-js%2Femotion%2Fissues%2F2803)）
- Emotion 的 SSR 能力支持对于 React 17 和 18 两个版本是不相同的。我们需要做一些兼容性的工作来兼容 React 18 的 stream SSR（[比如说](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Femotion-js%2Femotion%2Fissues%2F2725)）

6. **CSS-in-JS对SSR不友好**，比如至今仍有许多CSS-in-JS不兼容React 18 Streaming SSR，其中包括使用最广泛的styled-component（[相关issue](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fstyled-components%2Fstyled-components%2Fissues%2F3658)）。



## 内部序列化渲染 vs. 外部序列化渲染

样式序列化指的是 Emotion 将你的 CSS 字符串或者样式对象转化成可以插入文档的纯 CSS 字符串。Emotion 同时也会在序列化的过程中根据生成的存 CSS 字符串计算出相应的哈希值——这个哈希值就是你可以看到的动态生成的类名，比如 `css-an61r6`

在测试前，我预感到这个样式序列化是在 React 组件渲染周期里面完成还是外面完成，将对 Emotion 的性能表现起到比较大的影响。

在渲染周期内完成的代码如下

```js
function MyComponent() {
  return (
    <div
      css={{
        backgroundColor: 'blue',
        width: 100,
        height: 100,
      }}
    />
  );
}
```

每次 `MyComponent` 渲染，样式对象都会被序列化一次。如果 `MyComponent` 渲染的比较频繁，重复的序列化将有很大的性能开销

一个性能更好的方案是把样式移到组件的外面，所以序列化过程只会在组件模块被载入的时候发生，而不是每次都要执行一遍。你可以使用 `@emotion/react` 的 `css` 方法

```js
const myCss = css({
  backgroundColor: 'blue',
  width: 100,
  height: 100,
});

function MyComponent() {
  return <div css={myCss} />;
}
```

当然，这样使得你无法在样式种获得组件的 props，所以你会错失 CSS-in-JS 的一个主要的卖点。

## 测试「成员检索」功能

我们接下来将使用在一个页面上实现「成员检索」的能力，就是使用一个列表展示团队成员的一个简单的功能。列表上几乎所有的样式都是通过 Emotion 来实现，特别是使用 `css` prop

![2.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aeb3fa64a56847ec87e57cbafa4af008~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

测试如下：

- 「成员检索」会在页面上显示 20 个用户
- 去除 `react.memo` 对列表的包裹
- 每秒都强制渲染  组件，记录前 10 次渲染的时间
- 关闭 React Strict 模式 （不然会触发重复渲染，时间可能是现在的 2 倍）

我使用 React DevTools 进行记录，得到前 10 次的平均渲染时间为 54.3 毫秒。

以往的经验告诉我，一个 React 组件最好的渲染时间大概是 16 毫秒（每秒 60 帧计算）。 `< BrowseMembers >` 组件的渲染时间是经验值的 3 倍左右，所以它是一个比较「重」的组件。

如果我去除 Emotion，而使用 Sass Modules 来实现页面的样式，平均的渲染时间大概是在 **27.7** 毫秒。这比原来使用 Emotion 少了将近 **48% !!!**

这就是为什么我们开始放弃使用 CSS-in-JS 的原因：运行时的性能消耗实在太严重了！！！



## 一些关于 构建时 **CSS-in-JS 方案**

本文主要关注的是 运行时 CSS-in- JS 方案，比如 Emotion 和 styled-components 。最近，我们也关注到了一些将样式转换是纯 CSS 的构建时CSS-in-JS 方案。包括

- [Compiled](https://link.juejin.cn?target=https%3A%2F%2Fcompiledcssinjs.com%2F)
- [Vanilla Extract](https://link.juejin.cn?target=https%3A%2F%2Fvanilla-extract.style%2F)
- [Linaria](https://link.juejin.cn?target=https%3A%2F%2Flinaria.dev%2F)

这些库的目标是为了提供类似于运行时 CSS-in-JS 的能力，但是没有性能损耗。

目前我还没有在真实项目中使用构建时 CSS-in-JS 方案。但我想这些方案对比 Sass Modules 大概会有以下的缺点：

- 依然会在组件 mount 的时候完成样式的第一次插入，这还是会使得浏览器重新计算每个 DOM 节点的样式
- 动态样式无法被抽取出来，所以会使用 CSS 变量加上行内样式的方法来替代。过多的行内样式依然会影响性能
- 这些库依然会插入一些特定的组件到项目的 React 树中，依然会导致 React DevTools 的可读性变得比较差







非cij方案需要在首屏一次性加载全量style文件，你的应用越庞大 这个style文件就越大，而style的加载和解析又会阻塞dom 直接影响体验。用了cij方案后 只需要加载并解析当前所需要渲染的页面和组件。