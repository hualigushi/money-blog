[TOC]

# Web Component 核心技术

- **Custom elements（自定义元素）**：一组 **JavaScript API**，允许您定义 **custom elements** 及其行为，然后可以在您的用户界面中按照需要使用它们。
- **Shadow DOM（影子DOM）**：一组 **JavaScript API**，用于将封装的 **"影子" DOM 树** 附加到元素（与主文档DOM分开呈现）并控制其关联的功能。通过这种方式，您可以保持元素的功能私有，这样它们就可以被脚本化和样式化，而不用担心与文档的其他部分发生冲突。
- **HTML templates（HTML模板）**：**< template >** 和 **< slot >** 元素使您可以编写不在呈现页面中显示的标记模板。然后它们可以作为自定义元素结构的基础被多次重用。
- **HTML Imports（HTML导入）**：一旦定义了**自定义组件**，最简单的重用它的方法就是使其定义细节保存在一个单独的文件中，然后使用导入机制将其导入到想要实际使用它的页面中。**HTML** 导入就是这样一种机制，尽管存在争议 — **Mozilla** 根本不同意这种方法，并打算在将来实现更合适的。





# 自定义元素的规则

1. 自定义元素不能是自闭和的，比如不能这样使用自定义元素：`<hello-world />`。

2. 自定义元素的名称必须是一组用短横线（dash) - 分隔、符合 DOMString 标准 的字符串，用于区分原生 HTML 元素。例如，`<my_tab>` 、`<mytab>` 这种就不符合规范。

3. 不可以多次声明同名的元素，否则浏览器会抛出 `DOMException` 错误。

   

 # Shadow DOM

 使用 Shadow DOM 我们可以创建一个具有独立作用域的 DOM 树，在这个 DOM 树内部所有元素的结构、行为、样式均不受外部的影响。



 `Element.attachShadow()` 这个方法接收一个 `shadowRootInit` 对象作为参数，该对象可以赋值两个属性：`mode` 和 `delegatesFocus`。

`mode` 属性可以赋值为 `open` 或者 `closed`。

该属性指定了 Shadow Root 的 DOM 树的封装模式，当 `mode` 为 `open` 的时候，可以在 Shadow Root 外层通过 JavaScript DOM Api 来获取内部元素，例如 `Element.shadowRoot`，

反之，当 `mode` 属性为 `closed` 的时候，我们创建了一个**看似**闭合的 shadow tree，在外层无法通过 JavaScript DOM Api 来获取内部元素。



并不是所有的 HTML 标签都 [可以添加 Shadow DOM](https://link.juejin.cn/?target=https%3A%2F%2Fdom.spec.whatwg.org%2F%23dom-element-attachshadow)，原因如下：

- 该元素已有自己内部的 shadow DOM，例如 `<textarea>` 、`<input>` 等。
- 该元素添加 shadow DOM 是无意义的，如 `<img>` 。





# HTML Template

## 特性检测
要特性检测 <template>，可以创建一个 template 元素并检查它是否拥有 content 属性
```js
function supportsTemplate() {
	return 'content' in document.createElement('template');
}

if (supportsTemplate()) {
  	// 检测通过！
} else {
  	// 使用旧的模板技术或库。
}
```
## 激活模板
激活模板，即渲染出模板里面的内容。激活模板最简单的方法就是使用 document.importNode() 对模板的 .content 进行深拷贝。 .content 为只读属性，关联一个包含模板内容的 DocumentFragment。

```js
var t = document.querySelector('#mytemplate');
// 在运行时填充 src。
t.content.querySelector('img').src = 'logo.png';

var clone = document.importNode(t.content, true);
document.body.appendChild(clone);
```

## 特点
用 <template> 来包裹内容为我们提供了几个重要属性：


1. 它的内容在激活之前一直处于惰性状态。本质上，这些标记就是隐藏的 DOM，它们不会被渲染。


2. 处于模板中的内容不会有副作用。脚本不会运行，图片不会加载，音频不会播放，...直到模板被使用。


3. 内容不在文档中。在主页面使用 `document.getElementById()` 或 `querySelector()` 不会返回模板的子节点。


4. 模板能够被放置在任何位置，包括 <head>，<body>，或 <frameset>，并且任何能够出现在以上元素中的内容都可以放到模板中。
注意，"任何位置"意味着 <template> 能够安全的出现在 HTML 解析器不允许出现的位置...
几乎可以作为任何内容模型的子节点， 它也可以作为 <table> 或 <select> 的子元素。



# HTML Imports

之前在页面引入另一个页面或片段往往是通过iframe或者ajax异步加载，而现在我们可以这样做：

在head中引入
```
<head>
	<link rel="import" href="/path/to/imports/stuff.html">
</head>
```
js中获取

```
var content = document.querySelector('link[rel="import"]').import;
```

## 特性检测
要检测浏览器是否支持导入，可验证 <link> 元素上是否存在 import：
```
function supportsImports() {
	return 'import' in document.createElement('link');
}

if (supportsImports()) {
  	// 支持导入
} else {
  	// 使用其他方法加载文件
}

```



# 生命周期函数

1. `constructor`

   一个类，如果声明的是自主定制元素，则必须继承自HTMLElement；

   如果声明的是自定义内置元素，则必须继承它将要扩展的原生元素所属的类(如要扩展div，那就必须继承HTMLDivElement)。

   并且类的构造函数中，必须执行super。

2. `connectedCallback`
   元素首次被插入文档DOM时触发

3. `attributeChangedCallback`
   元素增加、删除、修改自身属性时触发

4. `adoptedCallback `
   元素被移动到新的文档时触发

5. `disconnectedCallback`
   元素从文档DOM中删除时触发





# 监听属性变化



1. `static get observedAttributes()` 

   静态get函数，它的作用是定义那些属性需要被监听；

2. `attributeChangedCallback(name, oldVal, newVal)`

   属性变化时的回调函数，也就是说，每一个被监听的属性，只要属性值发生变化，都会调用这个函数；

3. `render()`

   渲染函数，属性更新后，如果要重新渲染组件，就要调用这个函数。



定义需要监听的属性

```js
static get observedAttributes() {
    return ['text'];
}
```

定义回调函数

```js
attributeChangedCallback(name, oldVal, newVal) {
    this[name] = newVal;
    this.render();
}
```

重新渲染

```js
render() {
    this.$button.innerText = this.text;
}
```

完整的类定义如下

```js
class MyButton extends HTMLElement {
    constructor () {
        super()
        const template = document.getElementById('mybutton');
        const content = template.content.cloneNode(true);
        const button = content.querySelector('#btn');
        const text = this.getAttribute('text');
+       this.$button = button;
        button.innerText = text;
        button.addEventListener('click', (evt) => {
            this.dispatchEvent(
                new CustomEvent('onClick', {
                    detail: 'Hello fom within the Custom Element'
                })
            )
        })
        this.attachShadow({ mode: 'open' }).appendChild(content);
    }
+   static get observedAttributes() {
+       return ['text'];
+   }
+   attributeChangedCallback(name, oldVal, newVal) {
+       this[name] = newVal;
+       this.render();
+   }
+   render() {
+       this.$button.innerText = this.text;
+   }
}
```


