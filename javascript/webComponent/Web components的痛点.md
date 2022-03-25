## 1、组件内部事件的回调

比如，一个弹窗组件（`<my-dialog></my-dialog>`）中的确定按钮，那么它的事件是如何触发的呢？

```js
class myDialog extends HTMLElement {
  // ...
  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `
      <div class="dialog">
        <div class="dialog-content">
          <div class="dialog-body">
            弹窗内容
          </div>

          <button id="okBtn">确定</button>
        </div>
      </div>
    `;

    shadowRoot.querySelector('#okBtn').addEventListener('click', () => {
      // 组件内部定义事件
      this.dispatchEvent(new CustomEvent('okBtnFn'));
    });
  }
}

customElements.define('my-dialog', myDialog);

```

现在方案是 custom element 内部自定义事件 `new CustomEvent()`，外部用 `addEventListener`监听。这样的写法是很丑陋的，仿佛又回到了原生 JS 写应用的时代。

```html
<my-dialog></my-dialog>

<script>
  export default {
    created() {
      document.addEventListener('okBtnFn', function(){
        // 点击弹窗按钮，触发回调事件
      });
    }
  }
</script>
```

## 2、组件样式覆盖

对于开发者来说，难免会遇到需要调整组件内部样式的时候。无论你是使用`antd`、`vant`还是使用其它组件库，但 WCs 的 CSS 防污染机制导致你很难修改内部样式。

这需要你付出一些代价来变相的修改内部样式，具体方式我在上一篇文章中有写[《Web Components中引入外部CSS的 8 种方法》](https://juejin.cn/post/7026952871253901326)，其实是很繁琐，且不符合开发者直觉的。

## 3、组件内部资源相对路径问题

就目前来说，任何直接基于 Custom Element v1, Template 和 HTML Import 的组件都无法做到完全资源独立 —— 在不知道使用方环境且不给使用方增加额外限制的情况下使用内部封装的任何资源文件。比如如果你有一个自定义 icon 组件：

```js
class MyIcon extends HTMLElement {
	static get observedAttributes() { return ['name','size','color'] }
	constructor() {
		super();
		const shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.innerHTML = `
			<svg class="icon" id="icon" aria-hidden="true" viewBox="0 0 1024 1024">
				<use id="use"></use>
			</svg>
		`
	}

	attributeChangedCallback (name, oldValue, newValue) {
		if( name == 'name' && this.shadowRoot){
			// 如果使用的项目中，根目录没有 icon.svg 文件，那就 gg
			this.use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `./icon.svg#icon-${newValue}`);
		}
	}
}

customElements.define('my-icon', MyIcon);
```

如果使用的项目中，根目录没有 icon.svg 文件，那就 gg。如果你在这里使用 cdn 路径，就会出现跨域问题。

## 4、form表单类组件 value 获取问题

Shadow DOM 中包含有 `<input>`、`<textarea>` 或 `<select>` 等标签的 value 不会在 form 表单中自动关联。

示例代码：

```js
// web component
class InputAge extends HTMLElement {
  constructor() {
    super();
  }
  
  // connect component
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'closed' });
    shadow.innerHTML = `<input type="number" placeholder="age" min="18" max="120" />`;
  }
}

// register component
customElements.define( 'input-age', InputAge );
```

WC 组件被使用后

```html
<form id="myform">
  <input type="text" name="your-name" placeholder="name" />
  <input-age name="your-age"></input-age>

  <button>submit</button>
</form>

<script>
 const form = document.getElementById('myform');

  form.addEventListener('submit', e => {
    
    e.preventDefault();
    console.log('Submitted data:');

    const data = new FormData(form);
    for (let nv of data.entries()) {
      console.log(`  ${ nv[0] }: ${ nv[1] }`);
    }

  });
</script>
```

提交的时候无法获取 `input-age` 的 `value`。当然会有解决方案，但会很复杂。 [点击查看](https://link.juejin.cn?target=https%3A%2F%2Fcodepen.io%2Fcraigbuckler%2Fpen%2FJjWmxwo)

其它表单标签获取 value 解决方案： ![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6da0de55bdcd447cb4ed6b08617aaa8b~tplv-k3u1fbpfcp-watermark.awebp?) [点击查看](https://link.juejin.cn?target=https%3A%2F%2Fhtml.spec.whatwg.org%2Fmultipage%2Fcustom-elements.html)

## 5、其它

此外，缺少数据绑定和状态管理也是 WCs 存在的缺陷（笔者曾在使用过程中遇到自定义组件内部嵌套，但外部变量无法优雅传递的问题，有点脑壳疼，还在探索解决其它解决方案）。此处不再赘述。


