1. vue远程调试工具

```
npm install --save-dev @vue/devtools
```

运行 vue-devtools

public/index.html 添加 

```
<script src="http://localhost:8098"></script> 上线时需注释掉
```

2. 环境变量

根目录下创建 
.env.development  开发环境
.env.production   生产环境
必须以VUE_APP开头
例如 VUE_APP_RES_URL=http://106.15.231.180
.vue文件中引用 ${process.env.VUE_APP_RES_URL}

3. 动态切换组件

```
<keep-alive>
    <component :is="tab === 1 ? content : bookmark"></component>
</keep-alive>
```

4. vue 动态参数 2.6 新增

```
<a v-on:[eventName]="doSomething"> ... </a>

<!-- 动态参数的缩写 (2.6.0+) -->
<a :[key]="url"> ... </a>

<!-- 动态参数的缩写 (2.6.0+) -->
<a @[event]="doSomething"> ... </a>
```

5. computed 缓存

```
computed: {
    // 计算属性的 getter
    reversedMessage: function () {
      // `this` 指向 vm 实例
      return this.message.split('').reverse().join('')
    }
  }
  
  methods: {
  reversedMessage: function () {
    return this.message.split('').reverse().join('')
  }
}
计算属性是基于它们的响应式依赖进行缓存的。只在相关响应式依赖发生改变时它们才会重新求值。这就意味着只要 message 还没有发生改变，多次访问 reversedMessage 计算属性会立即返回之前的计算结果，而不必再次执行函数。
```

6. watch 当需要在数据变化时执行异步或开销较大的操作时，这个方式是最有用的。

7. input type=file 不能使用 v-model ，应使用 `v-on:change`， 原因`File inputs are read only`

8. 列表渲染相关

9. v-for循环绑定model:** input在v-for中可以像如下这么进行绑定

```
// 数据    
data() {
    return{
        obj: {
        ob: "OB",
        koro1: "Koro1"
    },
    model: {
        ob: "默认ob",
        koro1: "默认koro1"
    }   
    }
},
// html模板
<div v-for="(value,key) in obj">
	<input type="text" v-model="model[key]">
</div>
// input就跟数据绑定在一起了，那两个默认数据也会在input中显示
```

10. 这些情况下不要使用箭头函数

- 不应该使用箭头函数来定义一个生命周期方法
- 不应该使用箭头函数来定义 method 函数
- 不应该使用箭头函数来定义计算属性函数
- 不应该使用箭头函数来定义 watcher 函数
- 不应该对 data 属性使用箭头函数
- 不应该使用箭头函数来定义 watcher 函数

箭头函数绑定了父级作用域的上下文，**this 将不会按照期望指向 Vue 实例**。

也就是说，你**不能使用this来访问你组件中的data数据以及method方法了**。

this将会指向undefined。

12. 在使用`Vue`的时候，`setTimeout`和`setInterval`的this指向的是window对象，访问不到组件数据以及方法。

13. 在使用`Vue`的时候，路由跳转并不会销毁`setInterval`，但是组件已经销毁了，这会导致问题。

15. 监听组件的生命周期

比如有父组件 Parent 和子组件 Child，如果父组件监听到子组件挂载 mounted 就做一些逻辑处理

在父组件引用的时候通过@hook 来监听即可，代码如下：

```
<Child @hook:mounted="doSomething" /> 
<Child @hook:updated="doSomething" />
```

当然这里不仅仅是可以监听 mounted，其它的生命周期事件，例如：created，updated 等都可以。

15. 路由参数变化组件不更新

    同一`path`的页面跳转时路由参数变化，但是组件没有对应的更新。

    原因：主要是因为获取参数写在了`created`或者`mounted`路由钩子函数中，路由参数变化的时候，这个生命周期不会重新执行。

    解决方案1：`watch`监听路由

    ```
    watch: {
     // 方法1 //监听路由是否变化
      '$route' (to, from) { 
       if(to.query.id !== from.query.id){
    			this.id = to.query.id;
    			this.init();//重新加载数据
    		}
      }
    }
    //方法 2  设置路径变化时的处理函数
    watch: {
    '$route': {
        handler: 'init',
        immediate: true
      }
    }
    ```

    解决方案2 ：为了实现这样的效果可以给`router-view`添加一个不同的`key`，这样即使是公用组件，只要url变化了，就一定会重新创建这个组件。

    ```
    <router-view :key="$route.fullpath"></router-view>
    ```


    