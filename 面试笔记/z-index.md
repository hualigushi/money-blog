# 一、默认创建层叠上下文

默认创建层叠上下文，只有 HTML 根元素，这里你可以理解为 body 标签。它属于根层叠上下文元素，不需要任何 CSS 属性来触发。

# 二、需要配合 z-index 触发创建层叠上下文

依赖 z-index 值创建层叠上下文的情况：

  1. position 值为 relative/absolute/fixed(部分浏览器)
  2.flex 项(父元素 display 为 flex|inline-flex)，注意是子元素，不是父元素创建层叠上下文
  
这两种情况下，需要设置具体的 z-index 值，不能设置 z-index 为 auto，这也就是 z-index: auto 和 z-index: 0 的一点细微差别。

前面我们提到，设置 position: relative 的时候 z-index 的值为 auto 会生效，但是这时候并没有创建层叠上下文，当设置 z-index 不为 auto，哪怕设置 z-index: 0 也会触发元素创建层叠上下文。

三、不需要配合 z-index 触发创建层叠上下文

这种情况下，基本上都是由 CSS3 中新增的属性来触发的，常见的有：

- 元素的透明度 opacity 小于1
- 元素的 mix-blend-mode 值不是 normal
- 元素的以下属性的值不是 none：
  - transform
  - filter
  - perspective
  - clip-path
  - mask / mask-image / mask-border
- 元素的 isolution 属性值为 isolate
- 元素的 -webkit-overflow-scrolling 属性为 touch
- 元素的 will-change 属性具备会创建层叠上下文的值
