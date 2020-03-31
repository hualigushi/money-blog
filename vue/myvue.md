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
