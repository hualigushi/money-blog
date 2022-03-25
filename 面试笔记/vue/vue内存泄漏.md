## 1 泄漏点

1. DOM/BOM 对象泄漏；

2. script 中存在对 DOM/BOM 对象的引用导致；

3. JS 对象泄漏；

4. 通常由闭包导致，比如事件处理回调，导致 DOM 对象和脚本中对象双向引用，这个是常见的泄漏原因；



## 2 代码关注点

主要关注的就是各种事件绑定场景，比如：

1. DOM 中的 addEventLisner 函数及派生的事件监听，比如 Jquery 中的 on 函数，Vue 组件实例的 $on 函数;

2. 其它 BOM 对象的事件监听， 比如 websocket 实例的 on 函数;

3. 避免不必要的函数引用；

4. 如果使用 render 函数，避免在 HTML 标签中绑定 DOM/BOM 事件;



##  3 如何处理

1. 如果在 `mounted/created` 钩子中使用 JS 绑定了 DOM/BOM 对象中的事件，需要在 `beforeDestroy` 中做对应解绑处理；为了准确移除监听，尽量不要使用匿名函数或者已有的函数的绑定来直接作为事件监听函数。

   ```
   mounted() {	
       const box = document.getElementById('time-line')	
       this.width = box.offsetWidth	
       this.resizefun = () => {	
         this.width = box.offsetWidth	
       }	
       window.addEventListener('resize', this.resizefun)	
     },	
   beforeDestroy() {	
     window.removeEventListener('resize', this.resizefun)	
     this.resizefun = null	
   }
   ```

2. 如果在 `mounted/created` 钩子中使用了第三方库初始化，需要在 `beforeDestroy` 中做对应销毁处理（一般用不到，因为很多时候都是直接全局 Vue.use）；

3. 如果组件中使用了 `setInterval`，需要在 `beforeDestroy` 中做对应销毁处理；



造成内存泄露的可能会有以下几种情况：

（1）监听在window/body等事件没有解绑

（2）绑在EventBus的事件没有解绑

（3）Vuex的$store watch了之后没有unwatch

（4）模块形成的闭包内部变量使用完后没有置成null

（5）使用第三方库创建，没有调用正确的销毁函数

（6）echarts引起的内存泄漏

