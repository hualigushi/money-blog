1. vue远程调试工具

```
npm install --save-dev @vue/devtools
```

运行 vue-devtools

public/index.html 添加 

```
<script src="http://localhost:8098"></script> 上线时需注释掉
```

2. ...mapGetter 原理分析

对象混入
```
fn () {
    return {
        a: 1,
        b: 2
    }
}

console.log({
    ...fn(),
    c: 3,
    d: 4 
})
```

```
<script>
const getters = {
    a: () => 1,
    b: () => 2
}
function fn (keys) {
    const data = {}
    keys.forEach(key => {
        if (getters.hasOwnProperty(key)) {
            data[key] = getters[key]
        }
    })
    return data
}

export default {
    computed: {
        ...fn(['a', 'b', 'c'])
    }
}
</script>
```

3. 环境变量

根目录下创建 
.env.development  开发环境
.env.production   生产环境
必须以VUE_APP开头
例如 VUE_APP_RES_URL=http://106.15.231.180
.vue文件中引用 ${process.env.VUE_APP_RES_URL}

4. 动态切换组件

```
<keep-alive>
    <component :is="tab === 1 ? content : bookmark"></component>
</keep-alive>
```

5. vue 动态参数 2.6 新增
```
<a v-on:[eventName]="doSomething"> ... </a>

<!-- 动态参数的缩写 (2.6.0+) -->
<a :[key]="url"> ... </a>

<!-- 动态参数的缩写 (2.6.0+) -->
<a @[event]="doSomething"> ... </a>
```

6. computed 缓存
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

7. watch 当需要在数据变化时执行异步或开销较大的操作时，这个方式是最有用的。

8. input type=file 不能使用 v-model ，应使用 v-on:change 原因`File inputs are read only`

9. 自定义组件实现v-model双向绑定
```
let Child = {
      template: '<div>' +
        '<input :value="value" @input="updateValue" placeholder="edit me">' +
        '</div>',
      props: ['value'],
      methods: {
        updateValue(e) {
          this.$emit('input', e.target.value)
        }
      }
    }
    let vm = new Vue({
      el: '#app',
      template: '<div>' +
        '<child v-model="message"></child>' +
        '<p>Message is: {{ message }}</p>' +
        '</div>',
      data() {
        return {
          message: ''
        }
      },
      components: {
        Child
      }
    })
```
相当于我们在这样编写⽗组件
```
let vm = new Vue({
    el: '#app',
    template: '<div>' +
        '<child :value="message" @input="message=arguments[0]"></child>' +
        '<p>Message is: {{ message }}</p>' +
        '</div>',
    data() {
        return {
        message: ''
        }
    },
    components: {
        Child
    }
})
```
⼦组件传递的 value 绑定到当前⽗组件的 message ，同时监听⾃定义 input 事件，当⼦组件派
发 input 事件的时候，⽗组件会在事件回调函数中修改 message 的值，同时 value 也会发⽣变
化，⼦组件的 input 值被更新。

这就是典型的 Vue 的⽗⼦组件通讯模式，⽗组件通过 prop 把数据传递到⼦组件，⼦组件修改了数据
后把改变通过 $emit 事件的⽅式通知⽗组件，所以说组件上的 v-model 也是⼀种语法糖。

可以在定义⼦组件的时候通过 model 选项配置⼦组件接收的 prop 名以及派发的事件名
```
let Child = {
  template: '<div>'
            + '<input :value="msg" @input="updateValue" placeholder="edit me">' +
            '</div>',
  props: ['msg'],
  model: {
    prop: 'msg',
    event: 'change'
  },
  methods: {
      updateValue(e) {
      this.$emit('change', e.target.value)
    }
  }
}
let vm = new Vue({
  el: '#app',
  template: '<div>' +
    '<child v-model="message"></child>' +
    '<p>Message is: {{ message }}</p>' +
    '</div>',
  data() {
    return {
      message: ''
    }
  },
  components: {
    Child
  }
})
```

10. 组件style的scoped

问题：在组件中用js动态创建的dom，添加样式不生效。

**场景**:

```
    <template>
         <div class="test"></div>
    </template>
    <script>
        let a=document.querySelector('.test');
        let newDom=document.createElement("div"); // 创建dom
        newDom.setAttribute("class","testAdd" ); // 添加样式
        a.appendChild(newDom); // 插入dom
    </script>
    <style scoped>
    .test{
       background:blue;
        height:100px;
        width:100px;
    }
    .testAdd{
        background:red;
        height:100px;
        width:100px;
    }
    </style>
```

**结果**：

```
// test生效   testAdd 不生效
<div data-v-1b971ada class="test"><div class="testAdd"></div></div>
.test[data-v-1b971ada]{ // 注意data-v-1b971ada
    background:blue;
    height:100px;
    width:100px;
}
```

**原因**:

当 `<style>` 标签有 scoped 属性时，它的 CSS 只作用于当前组件中的元素。

它会**为组件中所有的标签和class样式添加一个`scoped`标识**，就像上面结果中的`data-v-1b971ada`。

所以原因就很清楚了：因为动态添加的dom没有`scoped`添加的标识，**没有跟`testAdd`的样式匹配起来**，导致样式失效。

**解决方式**

- 推荐：去掉该组件的scoped

每个组件的css并不会很多，当设计到动态添加dom，并为dom添加样式的时候，就可以去掉scoped，会比下面的方法方便很多。

- 可以动态添加style

  ```
  newDom.style.height='100px';
  newDom.style.width='100px';
  ```

11. 列表渲染相关

    **v-for循环绑定model:** input在v-for中可以像如下这么进行绑定

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

12. 这些情况下不要使用箭头函数
    - 不应该使用箭头函数来定义一个生命周期方法
    - 不应该使用箭头函数来定义 method 函数
    - 不应该使用箭头函数来定义计算属性函数
    - 不应该使用箭头函数来定义 watcher 函数
    - 不应该对 data 属性使用箭头函数
    - 不应该使用箭头函数来定义 watcher 函数

箭头函数绑定了父级作用域的上下文，**this 将不会按照期望指向 Vue 实例**。

也就是说，你**不能使用this来访问你组件中的data数据以及method方法了**。

this将会指向undefined。

13. 在使用`Vue`的时候，`setTimeout`和`setInterval`的this指向的是window对象，访问不到组件数据以及方法。
14. 在使用`Vue`的时候，路由跳转并不会销毁`setInterval`，但是组件已经销毁了，这会导致问题。