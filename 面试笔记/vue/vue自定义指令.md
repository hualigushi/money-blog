通过Vue.directive() 来定义全局指令

有几个可用的钩子（生命周期）, 每个钩子可以选择一些参数. 钩子如下:

bind: 一旦指令附加到元素时触发

inserted: 一旦元素被添加到父元素时触发

update: 每当元素本身更新(但是子元素还未更新)时触发

componentUpdate: 每当组件和子组件被更新时触发

unbind: 一旦指令被移除时触发。

每个钩子都有el, binding, 和vnode参数可用.

update和componentUpdated钩子还暴露了oldVnode, 以区分传递的旧值和较新的值.

el就是所绑定的元素.

binding是一个保护传入钩子的参数的对象. 有很多可用的参数, 包括name, value, oldValue, expression, arguments, arg及修饰语.

vnode有一个更不寻常的用例, 它可用于你需要直接引用到虚拟DOM中的节点.

binding和vnode都应该被视为只读.

现在，自定义一个指令，添加一些样式，表示定位的距离
```
Vue.directive('tack',{
 bind(el,binding){
  el.style.position='fixed';
  el.style.top=binding.value + 'px'
 }
})
<div class="header" v-tack="10" >我是header</div>
```
假设我们想要区分从顶部或者左侧偏移70px, 我们可以通过传递一个参数来做到这一点
```
Vue.directive('tack', {
 bind(el, binding, vnode) {
  el.style.position = 'fixed';
  const s = (binding.arg === 'left' ? 'left' : 'top');
  el.style[s] = binding.value + 'px';
 }
})
```
也可以同时传入不止一个值
```
Vue.directive('tack', {
 bind(el, binding, vnode) {
 el.style.position = 'fixed';
 el.style.top = binding.value.top + 'px';
 el.style.left = binding.value.left + 'px';
 }
})
<div class="header" v-tack="{left:’20’,top:’20’}" >我是header</div>
```
