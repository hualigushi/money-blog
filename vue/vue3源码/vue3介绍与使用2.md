### 环境搭建

相关库版本

- `Vue-Cli 4.x`
- `Vue 3.0.0-beta.1`
- `Vue-Router 4.0.0-alpha.7`

具体步骤如下：

1. 使用`VueCli`创建一个`Vue`基础项目：`vue create project`

2. 在项目中，执行升级命令：`vue add vue-next`

   执行上述指令后，会自动安装 vue-cli-plugin-vue-next 插件，该插件会完成以下操作：

   - 安装 Vue 3.0 依赖
   - 更新  Vue 3.0 webpack loader 配置，使其能够支持 .vue 文件构建（这点非常重要）
   - 创建 Vue 3.0 的模板代码
   - 自动将代码中的 Vue Router 和 Vuex 升级到 4.0 版本，如果未安装则不会升级
   - 自动生成 Vue Router 和 Vuex 模板代码

项目目录结构如下：



![img](https://user-gold-cdn.xitu.io/2020/4/30/171c8df873aa7d31?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



> 进行完以上操作无误之后基本环境就已经搭建完毕。

### 配置路由

- 项目中执行`npm install vue-router@4.0.0-alpha.7 -S`

按照一般规范，在`src`目录下新建`router`文件夹，并在`router`文件夹中新建`index.js`文件。

index.js内容:

```
import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../components/home'

const routes = [
    {path: '/', redirect: '/home'},
    {path: '/home', component: Home}
]

export default createRouter({
    history: createWebHashHistory(),
    routes
})
```

基本的路由配置没有太大改变，大多数情况下你只需要关注`routes`中路由规则编写。接下来，我们需要在`main.js`中接入`router`。

main.js:

```
import { createApp } from 'vue';
import App from './App.vue'
import router from './router';

const app = createApp(App);

app.use(router);
app.mount('#app');
```

不同于我们之前采用`new Vue()`创建实例的方式，`Vue3`在这里进行了改变；不仅如此，我们不难发现，安装路由的方式也由之前的`Vue.use(Router)`变成如上方式，同理对于`Vuex`的接入也是大同小异，笔者这里就不过多赘述了。

App.js

```
<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
```

### 基础语法初探

#### setup

> setup功能是新的组件选项，它充当在组件内部使用Composition API（新特性）的入口点；创建组件实例时，在初始道具解析后立即调用。在生命周期方面，它在beforeCreate挂接之前被调用。

一般来说，按照我们之前常规的写法，我们在对需要使用变量、计算属性的时候，我们会习惯性的写上：

home/index.vue

```
<template>
    <div class='home'>
        <div>{{count}}</div>
        <div>{{foo}}</div>
    </div>
</template>

<script>

import { ref } from 'vue'

export default {
    name: 'home',
    data() {
        return {
            count: 0
        }
    },
    computed: {
        foo() {
            return this.count + 1;
        }
    }
};
</script>
```

两者是需要被分类到各自的对象中，在同等功能实现上来说，`Vue3`的实现如下:

```
<template>
    <div class='home'>
        <div>{{count}}</div>
        <div>{{foo}}</div>
    </div>
</template>

<script>

import { ref, computed } from 'vue'

export default {
    name: 'home',
    setup(props, context) {
        const count = ref(0)
        const foo = computed(() => count.value + 1)
        return {
            count,
            foo
        }
    }
};
</script>
```



`setup`接收两个重要参数：

- props：这个自然不用多提了，等同于`vue2`的`props`，在这个地方我们需要注意的地方是，我们不能对这个参数进行解构，如果使用解构会使他失去响应性。例如下面代码就会让`props`传过来的值失去响应性：

```
export default {
  props: {
    name: String
  },
  setup({ name }) {
    watchEffect(() => {
      console.log(`name is: ` + name) // 失去响应性!
    })
  }
}
```

- context：其实这个参数我们也是比较熟悉的，它提供了一个上下文对象，该对象公开了先前this在2.x API中公开的属性的选择性列表，它仅包含三个属性（`attrs`、`slots`、`emit`），举个栗子：

```
setup(props, context) {
    context.attrs // 2.x：this.attrs
    context.slots // 2.x：this.slots
    context.emit // 2.x：this.emit
}
```

看完代码，我们基本可以理解为`setup`函数就是我们整个组件各项逻辑关系以及操作的入口了，在`Vue3`中，我们使用不同`api`的方式都是采用导入的形式，这就相当于我们有了更大的操作空间，有了更大的自由性。

虽然说`Vue3`向下兼容`Vue2`，但是这里其实我们需要注意的是，我们应该尽量避免2.x和`setup`函数的混用，这将会导致一些问题。

### reactive

> 取得一个对象并返回原始对象的反应式代理。这等效于2.x的`Vue.observable()`。

对这个`api`用法，笔者用代码讲解会比较好理解：

```
<template>
    <div class='home'>
        <div>{{name}}</div>
    </div>
</template>

<script>

import { reactive } from 'vue'

export default {
    name: 'home',
    setup() {
        const obj = reactive({name: '流星啊'})
        obj.name = 'bilibili'; // 修改属性值
        return obj;
    }
};
</script>
```

相信大家已经看出来端倪，没错，这个`api`就是单纯的把一个对象变得可响应。

### ref

> 接受一个内部值并返回一个反应性且可变的ref对象。ref对象具有.value指向内部值的单个属性。

> 在这里我估计有小伙伴就要问了，这不就是2.x里的ref吗，不不不，在3.x它跟那个种在标签上的`ref`没有半点关系，也和`$refs`没有任何关系，对于新的类似于2.x的获取`dom`的方式请看模板引用部分。

同样，举个栗子：

```
<template>
    <div class='home'>
        <div>{{count}}</div>
    </div>
</template>

<script>

import { ref } from 'vue'

export default {
    name: 'home',
    setup() {
        const count = ref(0);
        count.value++; // 有疑问的往下看笔者介绍
        console.log(count.value);
        return {
            count
        };
    }
};
</script>
```

这里也有一个注意点，你如果想要修改使用ref构造出来的变量，只能对`xxx.value`进行修改，同理你想要在`js`中访问它的值必须使用`xxx.value`，直接对count进行赋值如`count++`，这种写法会报错。

在这里估计又有小伙伴要问了，那为啥在`template`模板中使用`{{count}}`访问的时候不用加`.value`，这里其实你在使用插值表达式的时候，它内部会自动展开，所以我们直接用就行了。

如果说我们把`reactive`和`ref`结合起来用会有怎样的奇淫巧计呢😱，继续举个栗子：

```
const count = ref(0)
const state = reactive({
  count
})

console.log(state.count) // 0

state.count = 1
console.log(count.value) // 1
```

当ref被访问或作为反应对象的属性进行更改时，它会自动展开为内部值，因此其行为类似于普通属性。

### computed

这个`api`也类似2.x，可以使用`getter`、`setter`，话不多说，上代码：

```
const count = ref(1)
const plusOne = computed(() => count.value + 1)

console.log(plusOne.value) // 2

plusOne.value++ // 无效
```

在这里我们不难发现，它的访问方式也等同于`ref`，也是需要采用`xxx.value`，与此同时呢，如果你想要修改一个计算属性的值，你必须为他设置`setter`，并对相应的依赖进行修改。废话少说，看码：

```
const count = ref(1)
const plusOne = computed({
  get: () => count.value + 1,
  set: val => {
    count.value = val - 1
  }
})

plusOne.value = 1
console.log(count.value) // 0
```

### readonly

意如其名，顾名思义，就是构造一个只能访问的属性，这个玩意它针对的很强，也就是无论你这个对象嵌套有多深，被他包装后的对象一定是只能读，其实就是相当于一个代理：

```
const re = reactive({count: 0})
const readonlyRe = readonly(re);
readonlyRe.count++; // 无效，并且会给出警告
```

### watchEffect

对于这个属性呢，你可以拿它跟2.x的`watch`对象相比较了，没错他就是来监听的。

```
const count = ref(0)

watchEffect(() => console.log(count.value))
// -> 打印 0

setTimeout(() => {
  count.value++
  // -> 打印 1
}, 100)
```

总而言之，他会收集传入函数的依赖，一旦依赖发生发生改变，他就会重新调用你传进来的函数，用过`react hooks`的童靴可能会说，这玩意怎么这么像`useEffect`，其实`Vue3`也的确借鉴了`react`一些不错的设计，所以，大家也不要觉得抄袭不抄袭的，框架终究是为用户服务，好的设计自然应该值得借鉴，就像`react`也有借鉴`Vue`的一些优点对自身进行优化。

接下来我们继续刨析这个`api`。调用这个`api`的同时，它会返回一个用于暂停句柄的函数，我们可以显式调用它用于的停止当前监听，并且对于传入给`watchEffect`的回调函数，这个`api`在触发调用的时候会传入一个用于注册无效回调的函数`onInvalidate`。具体例子如下：

```
const stop = watchEffect(onInvalidate => {
  const token = performAsyncOperation(id.value); // 执行一个异步操作
  onInvalidate(() => {
    // 依赖的id发生变化，但是异步操作还未完成，我们就可以在这里停止你的异步操作。
    token.cancel(); // 这里我们假设你的异步操作返回了一个包含取消操作的方法。
  })
})

stop(); // 我们可以使用这个方法去停止它
```

如果我们注册了无效回调方法，那么在这个依赖已经变化但是异步请求还未完成的时候，它内部就会帮我们调用我们注册的无效回调。

### 生命周期函数

这里给一个与2.x的对比：

- `beforeCreate (vue3弃用) -> 使用 setup()`
- `created (vue3弃用) -> 使用 setup()`
- `beforeMount -> onBeforeMount`
- `mounted -> onMounted`
- `beforeUpdate -> onBeforeUpdate`
- `updated -> onUpdated`
- `beforeDestroy -> onBeforeUnmount`
- `destroyed -> onUnmounted`
- `errorCaptured -> onErrorCaptured`

使用示例：

```
import { onMounted, onUpdated, onUnmounted } from 'vue'

const MyComponent = {
  setup() {
    onMounted(() => {
      console.log('mounted!')
    })
    onUpdated(() => {
      console.log('updated!')
    })
    onUnmounted(() => {
      console.log('unmounted!')
    })
  }
}
```

### 模板引用

在看完前面`ref`这个api的介绍之后，很对小伙伴肯定也会疑惑，那我要获取`dom`怎么办，这个`Vue3`也有的，放宽心，听笔者继续娓娓道来。

```
<template>
    <div class='home'>
        <div ref="dom"></div>
    </div>
</template>

<script>

import { ref, onMounted } from 'vue'

export default {
    name: 'home',
    setup() {
        const dom = ref(null)
        onMounted(() => {
            console.log(dom.value);
        })
        return {
            dom
        }
    }
};
</script>
```

从代码中我们可以发现，现在这种访问`dom`的方式和之前区别在于，我们需要显示设定一个响应性变量，然后再在模板中使用之前我们耳熟能详的方式`ref='xxx'`来进行设定。



## 状态和事件绑定

Vue 3.0 中初始化状态通过 setup 方法，定义状态需要调用 ref 方法。接下来我们定义一个事件，用来更新 count 状态：

```
<template>
  <div class="test">
    <h1>test count: {{count}}</h1>
    <button @click="add">add</button>
  </div>
</template>

<script>
  import { ref } from 'vue'

  export default {
    setup () {
      const count = ref(0)
      const add = () => {
        count.value++
      }
      return {
        count,
        add
      }
    }
  }
</script>
```

这里的 add 方法不再需要定义在 methods 中，但注意更新 count 值的时候不能直接使用 count++，而应使用 count.value++，更新代码后，点击按钮，count 的值就会更新了

Vue 3.0 中计算属性和监听器的实现依赖 computed 和 watch 方法：

```
<template>
  <div class="test">
    <h1>test count: {{count}}</h1>
    <div>count * 2 = {{doubleCount}}</div>
    <button @click="add">add</button>
  </div>
</template>

<script>
  import { ref, computed, watch } from 'vue'

  export default {
    setup () {
      const count = ref(0)
      const add = () => {
        count.value++
      }
      watch(() => count.value, val => {
        console.log(`count is ${val}`)
      })
      const doubleCount = computed(() => count.value * 2)
      return {
        count,
        doubleCount,
        add
      }
    }
  }
</script>
```

计算属性 computed 是一个方法，里面需要包含一个回调函数，当我们访问计算属性返回结果时，会自动获取回调函数的值：

```
const doubleCount = computed(() => count.value * 2)
```

监听器 watch 同样是一个方法，它包含 2 个参数，2 个参数都是 function：

```
watch(() => count.value, 
  val => {
    console.log(`count is ${val}`)
  })
```

第一个参数是监听的值，count.value 表示当 count.value 发生变化就会触发监听器的回调函数，即第二个参数，第二个参数可以执行监听时候的回调



## 获取路由

Vue 3.0 中通过 getCurrentInstance 方法获取当前组件的实例，然后通过 ctx 属性获得当前上下文，ctx.$router 是 Vue Router 实例，里面包含了 currentRoute 可以获取到当前的路由信息

```
<script>
  import { getCurrentInstance } from 'vue'

  export default {
    setup () {
      const { ctx } = getCurrentInstance()
      console.log(ctx.$router.currentRoute.value)
    }
  }
</script>
```



## Vuex 集成

### 定义 Vuex 状态

第一步，修改 src/store/index.js 文件：

```
import Vuex from 'vuex'

export default Vuex.createStore({
  state: {
    test: {
      a: 1
    }
  },
  mutations: {
    setTestA(state, value) {
      state.test.a = value
    }
  },
  actions: {
  },
  modules: {
  }
})
```

Vuex 的语法和 API  基本没有改变,我们在 state 中创建了一个 test.a 状态，在 mutations 中添加了修改 state.test.a 状态的方法： setTestA

### 引用 Vuex 状态

第二步，在 Test.vue 中，通过计算属性使用 Vuex 状态：

```
<template>
  <div class="test">
    <h1>test count: {{count}}</h1>
    <div>count * 2 = {{doubleCount}}</div>
    <div>state from vuex {{a}}</div>
    <button @click="add">add</button>
  </div>
</template>

<script>
  import { ref, computed, watch, getCurrentInstance } from 'vue'

  export default {
    setup () {
      const count = ref(0)
      const add = () => {
        count.value++
      }
      watch(() => count.value, val => {
        console.log(`count is ${val}`)
      })
      const doubleCount = computed(() => count.value * 2)
      const { ctx } = getCurrentInstance()
      console.log(ctx.$router.currentRoute.value)
      const a = computed(() => ctx.$store.state.test.a)
      return {
        count,
        doubleCount,
        add,
        a
      }
    }
  }
</script>
```

这里我们通过计算属性来引用 Vuex 中的状态：

```
const a = computed(() => ctx.$store.state.test.a)
```

ctx 是上节中我们提到的当前组件实例

### 更新 Vuex 状态

更新 Vuex 状态仍然使用 commit 方法，这点和 Vuex 3.0 版本一致：

```
<template>
  <div class="test">
    <h1>test count: {{count}}</h1>
    <div>count * 2 = {{doubleCount}}</div>
    <div>state from vuex {{a}}</div>
    <button @click="add">add</button>
    <button @click="update">update a</button>
  </div>
</template>

<script>
  import { ref, computed, watch, getCurrentInstance } from 'vue'

  export default {
    setup () {
      const count = ref(0)
      const add = () => {
        count.value++
      }
      watch(() => count.value, val => {
        console.log(`count is ${val}`)
      })
      const doubleCount = computed(() => count.value * 2)
      const { ctx } = getCurrentInstance()
      console.log(ctx.$router.currentRoute.value)
      const a = computed(() => ctx.$store.state.test.a)
      const update = () => {
        ctx.$store.commit('setTestA', count)
      }
      return {
        count,
        doubleCount,
        add,
        a,
        update
      }
    }
  }
</script>
```

这里我们点击 update a 按钮后，会触发 update 方法，此时会通过 ctx.$store.commit 调用 setTestA 方法，将 count 的值覆盖 state.test.a 的值