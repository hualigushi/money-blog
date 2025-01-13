在 CSS 选择器家族中，新增这样一类比较新的选择器 -- 逻辑选择器，目前共有 4 名成员：
> :is
> 
> :where
> 
> :not
>  
> :has


# `:is` 伪类选择器
`:is()` CSS伪类函数将选择器列表作为参数，并选择该列表中任意一个选择器可以选择的元素。

在之前，对于多个不同父容器的同个子元素的一些共性样式设置，可能会出现如下 CSS 代码：
```css
header p:hover,
main p:hover,
footer p:hover {
  color: red;
  cursor: pointer;
}
```
而如今有了 `:is()` 伪类，上述代码可以改写成：
```css
:is(header, main, footer) p:hover {
  color: red;
  cursor: pointer;
}
```
它并没有实现某种选择器的新功能，更像是一种语法糖，类似于 `JavaScript ES6` 中的 `Class()` 语法，只是对原有功能的重新封装设计，实现了更容易的表达一个操作的语法，简化了某些复杂代码的写法。
![https://www.dongchuanmin.com/file/202205/21f65e2038cd4785c3f7279ccbac7d19.gif](https://www.dongchuanmin.com/file/202205/21f65e2038cd4785c3f7279ccbac7d19.gif)

 

## 支持多层层叠连用
再来看看这种情况，原本的 CSS 代码如下：
```css
<div><i>div i</i></div>
<p><i>p i</i></p>
<div><span>div span</span></div>
<p><span>p span</span></p>
<h1><span>h1 span</span></h1>
<h1><i>h1 i</i></h1>
```

如果要将上述 HTML 中，`<div>` 和 `<p>` 下的 `<span>` 和 `<i>` 的 `color` 设置为 `red`，正常的 `CSS` 可能是这样：
```css
div span,
div i,
p span,
p i {
    color: red;
}
```
有了 `:is()` 后，代码可以简化为：
```css
:is(div, p) :is(span, i) {
    color: red;
}
```
结果如下：

![https://www.dongchuanmin.com/file/202205/794a74bfef48b5b196915b8a9c54251a.png](https://www.dongchuanmin.com/file/202205/794a74bfef48b5b196915b8a9c54251a.png)


这里，也支持 `:is()` 的层叠连用。通过 `:is(div, p) :is(span, i)` 的排列组合，可以组合出上述 4 行的选择器，达到同样的效果。

当然，这个例子比较简单，看不出 :is() 的威力。下面这个例子就比较明显，这么一大段 CSS 选择器代码：
```css
ol ol ul,     ol ul ul,     ol menu ul,     ol dir ul,
ol ol menu,   ol ul menu,   ol menu menu,   ol dir menu,
ol ol dir,    ol ul dir,    ol menu dir,    ol dir dir,
ul ol ul,     ul ul ul,     ul menu ul,     ul dir ul,
ul ol menu,   ul ul menu,   ul menu menu,   ul dir menu,
ul ol dir,    ul ul dir,    ul menu dir,    ul dir dir,
menu ol ul,   menu ul ul,   menu menu ul,   menu dir ul,
menu ol menu, menu ul menu, menu menu menu, menu dir menu,
menu ol dir,  menu ul dir,  menu menu dir,  menu dir dir,
dir ol ul,    dir ul ul,    dir menu ul,    dir dir ul,
dir ol menu,  dir ul menu,  dir menu menu,  dir dir menu,
dir ol dir,   dir ul dir,   dir menu dir,   dir dir dir {
  list-style-type: square;
}
```
可以利用 `:is()` 优化为：
```css
:is(ol, ul, menu, dir) :is(ol, ul, menu, dir) :is(ul, menu, dir) {
  list-style-type: square;
}
```

## 不支持伪元素
有个特例，不能用 `:is()` 来选取 `::before` 和 `::after` 两个伪元素。譬如：

> 注意，仅仅是不支持伪元素，伪类，譬如 :focus、:hover 是支持的。
```css
div p::before,
div p::after {
    content: "";
    //...
}
```
不能写成：
```css
div p:is(::before, ::after) {
    content: "";
    //...
}
```

## :is 选择器的优先级
看这样一种有意思的情况：
```css
<div>
    <p class="test-class" id="test-id">where & is test</p>
</div>
<div>
    <p class="test-class">where & is test</p>
</div>
```

我们给带有 `.test-class` 的元素，设置一个默认的颜色：
```css
div .test-class {
    color: red;
}
```
如果，这个时候，我们引入 `:is()` 进行匹配：
```css
div :is(p) {
    color: blue;
}
```
此时，由于 `div :is(p)` 可以看成 `div p`，优先级是没有 `div .test-class` 高的，因此，被选中的文本的颜色是不会发生变化的。

但是，如果，我们在 `:is()` 选择器中，加上一个 `#test-id`，情况就不一样了。
```css
div :is(p, #text-id) {
    color: blue;
}
```
按照理解，如果把上述选择器拆分，上述代码可以拆分成：
```css
div p {
    color: blue;
}
div #text-id {
    color: blue;
}
```
那么，我们有理由猜想，带有 `#text-id` 的 `<p>` 元素由于有了更高优先级的选择器，颜色将会变成 `blue`，而另外一个 `div p` 由于优先级不够高的问题，导致第一段文本依旧是 `green`。

但是，这里，神奇的是，两段文本都变成了 `blue`：

![https://www.dongchuanmin.com/file/202205/2baa253dbf26ef9d0fe090d8fb1abd7e.png](https://www.dongchuanmin.com/file/202205/2baa253dbf26ef9d0fe090d8fb1abd7e.png)
 

这是由于，`:is()` 的优先级是由它的选择器列表中优先级最高的选择器决定的。我们不能把它们割裂开来看。

对于 `div :is(p, #text-id)`，`is:()` 内部有一个 `id` 选择器，因此，被该条规则匹配中的元素，全部都会应用 `div #id` 这一级别的选择器优先级。

这里非常重要，再强调一下，对于 :is() 选择器的优先级，我们不能把它们割裂开来看，它们是一个整体，优先级取决于**选择器列表中优先级最高的选择器**。

## `:is` 的别名 `:matches()` 与 `:any()`
`:is()` 是最新的规范命名，在之前，有过有同样功能的选择，分别是：
```css
:is(div, p) span {}
// 等同于
:-webkit-any(div, p) span {}
:-moz-any(div, p) span {}
:matches(div, p) span {}
```
当然，下面 3 个都已经废弃，不建议再继续使用。而到今天（2022-04-27）:is() 的兼容性已经非常不错了，不需要兼容 IE 系列的话可以考虑开始用起来（配合 autoprefixer）

# `:where` 伪类选择器
了解了 `:is` 后，我们可以再来看看 `:where``，它们两个有着非常强的关联性。

`:where` 同样是将选择器列表作为其参数，并选择可以由该列表中的选择器之一选择的任何元素。

还是这个例子：
```css
:where(header, main, footer) p:hover {
  color: red;
  cursor: pointer;
}
```
上述的代码使用了 `:where`，可以近似的看为：
```css
header p:hover,
main p:hover,
footer p:hover {
  color: red;
  cursor: pointer;
}
```
这就有意思了，这不是和上面说的 `:is` 一样了么？

那么它们的区别在什么地方呢？

## `:is` 和 `:where` 的区别
首先，从语法上，`:is` 和 `:where` 是一模一样的。它们的核心区别点在于 **优先级**。

来看这样一个例子：
```html
<div>
    <p>where & is test</p>
</div>
```
CSS 代码如下：
```css
:is(div) p {
    color: red;
}
```
```css
:where(div) p {
    color: green;
}
```
正常按我们的理解而言，`:is(div) p` 和 `:where(div) p` 都可以转化为 `div p`，由于 `:where(div) p` 后定义，所以文字的颜色，应该是 `green` 绿色，但是，实际的颜色表现为 `color: red` 红色：

![https://www.dongchuanmin.com/file/202205/478fc7b533e5bddfb914ac1ac558ed31.png](https://www.dongchuanmin.com/file/202205/478fc7b533e5bddfb914ac1ac558ed31.png)

这是因为，`:where()` 和 `:is()` 的不同之处在于，`:where()` 的优先级总是为 0 ，但是 `:is()` 的优先级是由它的选择器列表中优先级最高的选择器决定的。

上述的例子还不是特别明显，我们再稍微改造下：
```html
<div id="container">
    <p>where & is test</p>
</div>
```
我们给 div 添加上一个 id 属性，改造上述 CSS 代码：
```css
:is(div) p {
    color: red;
}
:where(#container) p {
    color: green;
}
```
即便如此，由于 `:where(#container)` 的优先级为 0，因此文字的颜色，依旧为红色 red。`:where()` 的优先级总是为 0 这一点在使用的过程中需要牢记。

## 组合、嵌套
CSS 选择器的一个非常大的特点就在于组合嵌套。`:is` 和 `:where` 也不例外，因此，它们也可以互相组合嵌套使用，下述的 CSS 选择器都是合理的：
```css
/* 组合*/
:is(h1,h2) :where(.test-a, .test-b) {
  text-transform: uppercase;
}
/* 嵌套*/
.title:where(h1, h2, :is(.header, .footer)) {
  font-weight: bold;
}
```
这里简单总结下，`:is` 和 `:where` 都是非常好的分组逻辑选择器，唯一的区别在于`:where()` 的优先级总是为 0，而`:is()` 的优先级是由它的选择器列表中优先级最高的选择器决定的。

# `:not` 伪类选择器
下面我们介绍一下非常有用的 `:not` 伪类选择器。

`:not` 伪类选择器用来匹配不符合一组选择器的元素。由于它的作用是防止特定的元素被选中，它也被称为反选伪类（negation pseudo-class）。

举个例子，HTML 结构如下：
```html
<div class="a">div.a</div>
<div class="b">div.b</div>
<div class="c">div.c</div>
<div class="d">div.d</div>
```
```css
div:not(.b) {
    color: red;
}
```
`div:not(.b)` 它可以选择除了 class 为 .b 元素之外的所有 div 元素：

![https://www.dongchuanmin.com/file/202205/ac8dfa5122894d77db5add407cf16d3e.png](https://www.dongchuanmin.com/file/202205/ac8dfa5122894d77db5add407cf16d3e.png)

## MDN 的错误例子？一个有意思的现象
有趣的是，在 MDN 介绍 `:not` 的页面，有这样一个例子：
```css
/* Selects any element that is NOT a paragraph */
:not(p) {
  color: blue;
}
```
意思是，`:not(p)` 可以选择任何不是 `<p>` 标签的元素。然而，上面的 CSS 选择器，在如下的 HTML 结构，实测的结果不太对劲。
```
<p>p</p>
<div>div</div>
<span>span</span>
<h1>h1</h1>
```
结果如下：
![https://www.dongchuanmin.com/file/202205/357fca3175ef81e2d76eaec6efba6853.png](https://www.dongchuanmin.com/file/202205/357fca3175ef81e2d76eaec6efba6853.png)

意思是，`:not(p)` 仍然可以选中 <p> 元素。我尝试了多个浏览器，得到的效果都是一致的。

这是为什么呢？这是由于 `:not(p)` 同样能够选中 <body>，那么 <body> 的 color 即变成了 blue，由于 color 是一个可继承属性，<p> 标签继承了 <body> 的 color 属性，导致看到的 <p> 也是蓝色。

我们把它改成一个不可继承的属性，试试看：
```css
/* Selects any element that is NOT a paragraph */
:not(p) {
  border: 1px solid;
}
```
![https://www.dongchuanmin.com/file/202205/357fca3175ef81e2d76eaec6efba6853.png](https://www.dongchuanmin.com/file/202205/357fca3175ef81e2d76eaec6efba6853.png)

OK，这次 <p> 没有边框体现，没有问题！实际使用的时候，需要注意这一层继承的问题！

## `:not` 的优先级问题
下面是一些使用 `:not` 需要注意的问题。

`:not`、`:is`、`:where` 这几个伪类不像其它伪类，它不会增加选择器的优先级。它的优先级即为它参数选择器的优先级。

并且，在 CSS Selectors Level 3，`:not()` 内只支持单个选择器，而从  CSS Selectors Level 4 开始，`:not()` 内部支持多个选择器，像是这样：
```css
/* CSS Selectors Level 3，:not 内部如果有多个值需要分开 */
p:not(:first-of-type):not(.special) {
}
/* CSS Selectors Level 4 支持使用逗号分隔*/
p:not(:first-of-type, .special) {
}
```
与 `:is()` 类似，`:not()` 选择器本身不会影响选择器的优先级，它的优先级是由它的选择器列表中优先级最高的选择器决定的。

## :not(*) 问题
使用 `:not(*)` 将匹配任何非元素的元素，因此这个规则将永远不会被应用。

相当于一段没有任何意义的代码。

## `:not()` 不能嵌套 `:not()`
禁止套娃。`:not` 伪类不允许嵌套，这意味着 `:not(:not(...))` 是无效的。

## `:not()` 实战解析
那么，:not() 有什么特别有意思的应用场景呢？我这里列举一个。

在 W3 CSS selectors-4 规范中，新增了一个非常有意思的 `:focus-visible` 伪类。

`:focus-visible` 这个选择器可以有效地根据用户的输入方式(鼠标 vs 键盘)展示不同形式的焦点。

有了这个伪类，就可以做到，当用户使用鼠标操作可聚焦元素时，不展示 `:focus` 样式或者让其表现较弱，而当用户使用键盘操作焦点时，利用 `:focus-visible`，让可获焦元素获得一个较强的表现样式。

看个简单的 Demo：
```
<button>Test 1</button>
``
```css
button:active {
  background: #eee;
}
button:focus {
  outline: 2px solid red;
}
```
使用鼠标点击：

![https://www.dongchuanmin.com/file/202205/4e20bef33e1cfb002b67c3263aa60a0e.gif](https://www.dongchuanmin.com/file/202205/4e20bef33e1cfb002b67c3263aa60a0e.gif)

可以看到，使用鼠标点击的时候，触发了元素的 `:active` 伪类，也触发了 `:focus`伪类，不太美观。

但是如果设置了 `outline: none` 又会使键盘用户的体验非常糟糕。

因为当键盘用户使用 Tab 尝试切换焦点的时候，会因为 `outline: none` 而无所适从。

因此，可以使用 `:focus-visible` 伪类改造一下：
```css
button:active {
  background: #eee;
}
button:focus {
  outline: 2px solid red;
}
button:focus:not(:focus-visible) {
  outline: none;
}
```
看看效果，分别是在鼠标点击 Button 和使用键盘控制焦点点击 Button：

![https://www.dongchuanmin.com/file/202205/12878d7ef9efe5b088cc59a6dce93143.gif](https://www.dongchuanmin.com/file/202205/12878d7ef9efe5b088cc59a6dce93143.gif)

可以看到，使用鼠标点击，不会触发 :foucs，只有当键盘操作聚焦元素，使用 Tab 切换焦点时，outline: 2px solid red 这段代码才会生效。

这样，我们就既保证了正常用户的点击体验，也保证了无法使用鼠标的用户的焦点管理体验，在可访问性方面下了功夫。

值得注意的是，这里为什么使用了 `button:focus:not(:focus-visible)` 这么绕的写法而不是直接这样写呢：
```css
button:focus {
  outline: unset;
}
button:focus-visible {
  outline: 2px solid red;
}
```
解释一下，`button:focus:not(:focus-visible)` 的意思是，button 元素触发 focus 状态，并且不是通过 `focus-visible` 触发，理解过来就是在支持 `:focus-visible` 的浏览器，通过鼠标激活 :focus 的 button 元素，这种情况下，不需要设置 outline。

为的是兼容不支持 `:focus-visible` 的浏览器，当 `:focus-visible` 不兼容时，还是需要有 `:focus` 伪类的存在。

因此，这里借助 `:not()` 伪类，巧妙的实现了一个实用效果的方案降级。

# `:has` 伪类选择器
OK。最后到所有逻辑选择器里面最重磅的 :has 出场了。它之所以重要是因为它的诞生，填补了在之前 CSS 选择器中，没有核心意义上真正的父选择器的空缺。

`:has` 伪类接受一个选择器组作为参数，该参数相对于该元素的 :scope 至少匹配一个元素。

实际看个例子：
```html
<div>
    <p>div -- p</p>
</div>
<div>
    <p class="g-test-has">div -- p.has</p>
</div>
<div>
    <p>div -- p</p>
</div>
```
```css
div:has(.g-test-has) {
    border: 1px solid #000;
}
```
我们通过 `div:has(.g-test-has)` 选择器，意思是，选择 div 下存在 class 为 .g-test-has 的 div 元素。

注意，这里选择的不是 `:has()` 内包裹的选择器选中的元素，而是使用 `:has()` 伪类的宿主元素。

效果如下：
![https://www.dongchuanmin.com/file/202205/bc6fe45cf07984b66c3bf8f89b53df97.png](https://www.dongchuanmin.com/file/202205/bc6fe45cf07984b66c3bf8f89b53df97.png)

可以看到，由于第二个 div 下存在 class 为 .g-test-has 的元素，因此第二个 div 被加上了 border。

## `:has()` 父选择器 -- 嵌套结构的父元素选择
我们再通过几个 DEMO 加深下印象。:has() 内还可以写的更为复杂一点。
```html
<div>
    <span>div span</span>
</div>

<div>
    <ul>
        <li>
            <h2><span>div ul li h2 span</span></h2>
        </li>
    </ul>
</div>

<div>
    <h2><span>div h2 span</span></h2>
</div>
```
```css
div:has(>h2>span) {
    margin-left: 24px;
    border: 1px solid #000;
}
```
这里，要求准确选择 div 下直接子元素是 h2，且 h2 下直接子元素有 span 的 div 元素。注意，选择的最上层使用 :has() 的父元素 div。结果如下：
![https://www.dongchuanmin.com/file/202205/6be8646f3b63ebff3bafb958b5d24033.png](https://www.dongchuanmin.com/file/202205/6be8646f3b63ebff3bafb958b5d24033.png)

这里体现的是嵌套结构，精确寻找对应的父元素。

## `:has()` 父选择器 -- 同级结构的兄元素选择
还有一种情况，在之前也比较难处理，同级结构的兄元素选择。

看这个 DEMO：
```html
<div class="has-test">div + p</div>
<p>p</p>

<div class="has-test">div + h1</div>
<h1>h1</h1>

<div class="has-test">div + h2</div>
<h2>h2</h2>

<div class="has-test">div + ul</div>
<ul>ul</ul>
```
我们想找到兄弟层级关系中，后面接了 <h2> 元素的  `.has-test` 元素，可以这样写：
```css
.has-test:has(+ h2) {
    margin-left: 24px;
    border: 1px solid #000;
}
```
效果如下：

![https://www.dongchuanmin.com/file/202205/8591aa1f80673dc6f94d6abd4edb1c67.png](https://www.dongchuanmin.com/file/202205/8591aa1f80673dc6f94d6abd4edb1c67.png)

这里体现的是兄弟结构，精确寻找对应的前置兄元素。

这样，一直以来，CSS 没有实现的父选择器，借由 `:has()` 开始，也能够做到了。这个选择器，能够极大程度的提升开发体验，解决之前需要比较多 JavaScript 代码才能够完成的事。
