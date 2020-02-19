backdrop-filter CSS 属性可以让你为一个元素后面区域添加图形效果（如模糊或颜色偏移）。 

因为它适用于元素背后的所有元素，为了看到效果，必须使元素或其背景至少部分透明。

让当前元素所在区域后面的内容模糊灰度或高亮之类，要想看到效果，需要元素本身半透明或者完全透明

适用场景：为背景添加模糊效果；如果目标元素内包裹着其他内容 则应用filter属性；





filter是让当前元素自身模糊灰度或高亮之类

```
/* 关键词值 */
backdrop-filter: none;

/* SVG 过滤器 */
backdrop-filter: url(commonfilters.svg#filter);

/* <filter-function> 过滤器函数 */
backdrop-filter: blur(2px);
backdrop-filter: brightness(60%);
backdrop-filter: contrast(40%);
backdrop-filter: drop-shadow(4px 4px 10px blue);
backdrop-filter: grayscale(30%);
backdrop-filter: hue-rotate(120deg);
backdrop-filter: invert(70%);
backdrop-filter: opacity(20%);
backdrop-filter: sepia(90%);
backdrop-filter: saturate(80%);

/* 多重过滤器 */
backdrop-filter: url(filters.svg#filter) blur(4px) saturate(150%);

/* 全局值 */
backdrop-filter: inherit;
backdrop-filter: initial;
backdrop-filter: unset;
```


