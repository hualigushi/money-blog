## 项目结构
![](https://upload-images.jianshu.io/upload_images/3407939-a849fa742ba8c928?imageMogr2/auto-orient/strip|imageView2/2/w/1032/format/webp)

这是一个组织成 monorepo 形式的工程（简单来说也就是把多个相关子项目放在同一个Git仓库中），使用的lerna这个工具进行管理。

下面是源码中packages下面的各个子项目模块：

- `vue` Vue项目的主入口模块

- `reactivity` 非常重要的模块，实现Vue3.0的数据响应式功能的核心

- `compiler-core` 模板核心语法编译器，包括对标签、属性、指令（如v-if、v-for、v-bind、v-model、v-on、v-once、v-slot等）模板语法的解析

- `compiler-dom` Vue模板编译器，可编译模板中其他功能性指令（如v-clock、v-html、v-text等）。依赖compiler-core

- `runtime-core` 实现虚拟DOM、组件定义、生命周期、指令定义、依赖注入、渲染等功能的核心模块

- `runtime-dom` Vue浏览器DOM环境运行时，负责实现与浏览器环境运行所需的相关特性。依赖runtime-core

- `server-renderer` 服务端渲染（SSR）

## 编译框架源代码
1. npm install
2. npm run dev / npm run build

## 示例
建一个文件夹，下面的文件结构如下图所示，有css和js目录，分别存放示例代码要用到的样式、vue的js库文件、以及编写的示例js代码文件；index.html 是这个程序的主入口

![](https://upload-images.jianshu.io/upload_images/3407939-249cf02b63d3ca09?imageMogr2/auto-orient/strip|imageView2/2/w/688/format/webp)

index.html,在里面引入css和js文件并创建了一个Vue应用所需的挂载点元素
```
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Vue3.0 Demo</title>

    <link rel="stylesheet" type="text/css" href="./css/main.css" />
</head>

<body>
    <!-- 应用挂载点元素 -->
    <div id="app"></div>

    <!-- 引入Vue3.0库文件 -->
    <script src="./js/lib/vue.global.prod.js"></script>

    <!-- 我们的应用代码 -->
    <script src="./js/main.js"></script>
</body>

</html>
```

main.js
```
const { createApp, createComponent } = Vue

// 计数器组件
const Counter = createComponent({
    template: `
        <div class="counter-display">
            <span class="counter-label">恭喜你，你已经写了</span>
            <span class="counter-text">{{ count }}</span>
            <span class="counter-label">斤代码！</span>
        </div>
        <div class="counter-btns">
            <button class="btn" @click="increase">写一斤</button>
            <button class="btn" @click="reset">删库啦</button>
        </div>
    `,

    data() {
        return {
            count: 0
        }
    },

    methods: {
        increase() {
            this.count++;
        },
        reset() {
            this.count = 0;
        }
    }
})

// 根组件
const App = createComponent({
    components: { Counter },
    template: `
        <div class="container">
            <h3>计数器示例</h3>
            <Counter />
        </div>
    `
})

// 启动
const container = document.querySelector('#app')
const app = createApp()

app.mount(App, container)
```
createComponent()函数不是必须的，完全可以去掉，它的存在是为了使用TypeScript编写代码时，利用TypeScript的类型推断机制在开发工具里（如VSCode）实现更好的参数自动提示功能。

写成下面这样也是完全可以工作的：
```
const App = {
    components: { Counter },
    template: `
        <div class="container">
            <h3>计数器示例</h3>
            <Counter />
        </div>
    `
}
```
main.css
```
.container {
    border: 1px solid #cccccc;
    border-radius: 5px;
    width: 250px;
    padding: 20px;
}

.counter-display {
    margin-bottom: 20px;
}

.counter-text {
    font-size: 18px;
    font-weight: bold;
    color: #ff9900;
    margin: 0 5px;
}

.counter-btns .btn {
    border: 1px solid #cccccc;
    border-radius: 5px;
    width: 80px;
    height: 40px;
    outline: none;
    background: #f2f2f2;
    margin-right: 10px;
}
```

## 使用Composition API
```
const { createApp, ref } = Vue

// 计数器组件
const Counter = {
    template: `
        <div class="counter-display">
            <span class="counter-label">恭喜你，你已经写了</span>
            <span class="counter-text">{{ count }}</span>
            <span class="counter-label">斤代码！</span>
        </div>
        <div class="counter-btns">
            <button class="btn" @click="increase">写一斤</button>
            <button class="btn" @click="reset">删库啦</button>
        </div>
    `,

    setup() {
        // 创建一个响应式的对象
        const count = ref(0)

        // 操作函数
        const increase = () => { count.value++ }
        const reset = () => { count.value = 0 }

        // 导出给模板访问
        return { count, increase, reset }
    }
}
```
setup方法，它是Vue3.0中新增的组件入口，专为使用Composition API而设计，调用时机是在组件生命周期的 beforeCreate 和 created 之间（所以在 setup 里面是访问不了 this 对象的，即它里面的this并不是指向当前组件，这点需要注意也尽量避免使用）。

原先在 data 里的响应式对象属性 count 在这里成为了一个使用 ref 函数创建的响应式常量；而用于递增和重置这个 count 值的函数内部，不再需要通过 this 引用任何东西（也不推荐使用），这为我们进行进一步的重构提供了机会。我们可以把对 count 操作的业务逻辑独立提取出来
```
// 计数器组件
const Counter = {
    template: `
        <div class="counter-display">
            <span class="counter-label">恭喜你，你已经写了</span>
            <span class="counter-text">{{ count }}</span>
            <span class="counter-label">斤代码！</span>
        </div>
        <div class="counter-btns">
            <button class="btn" @click="increase">写一斤</button>
            <button class="btn" @click="reset">删库啦</button>
        </div>
    `,

    setup() {
        const countOps = useCount()
        return { ...countOps }
    }
}

// 对count值的操作逻辑
function useCount() {
    const count = ref(0)    
    const increase = () => { count.value++ }
    const reset = () => { count.value = 0 }
    return { count, increase, reset }
}
```
我们将 count 值操作逻辑都分离到了 useCount() 函数中，这种做法有利于拆分复杂的业务逻辑，让代码看起来更清晰，更好维护；在我们使用模块化机制的时候，更可以进一步把这些独立逻辑函数移入模块文件中，让每一部分的代码都变得更干净。

## 响应式之Ref vs. Reactive
原先的数据响应式监听的用法发生了变化，原先通过data中声明的响应式属性，现在替换成由 ref 函数来创建
```
// Vue2.x Options API 写法
data() {
  return {
    count: 0
  }
}

// Vue3.x Composition API 写法
const count = ref(0)
```
ref 函数传入一个值作为参数，返回一个基于该值的响应式Ref对象，该对象中的值一旦被改变和访问，都会被跟踪到，通过修改 count.value 的值，可以触发模板的重新渲染，显示最新的值。

Vue3.0中还提供了另外一个可以创建响应式对象的函数，那就是 reactive 函数。如果示例程序用 reactive 函数来改写，那么会是这样子的
```
const { createApp, reactive } = Vue

// 计数器组件
const Counter = {
    template: `
        <div class="counter-display">
            <span class="counter-label">恭喜你，你已经写了</span>
            <span class="counter-text">{{ state.count }}</span>
            <span class="counter-label">斤代码！</span>
        </div>
        <div class="counter-btns">
            <button class="btn" @click="increase">写一斤</button>
            <button class="btn" @click="reset">删库啦</button>
        </div>
    `,

    setup() {
        const countOps = useCount()
        return { ...countOps }
    }
}

function useCount() {
    const state = reactive({ count: 0 })
    const increase = () => { state.count++ }
    const reset = () => { state.count = 0 }
    return { state, increase, reset }
}
```
和使用 ref 的时候变化不是很大，只是把 count 作为一个对象的属性进行包装了

## render函数
用 render 方法改写一下之前的计数器代码，看起来就会是这样的
```
const { createApp, ref, h } = Vue

// 计数器组件
const Counter = {
    setup() {
        const countOps = useCount()
        return { ...countOps }
    },

    render() {
        return [
            h('div', { class: 'counter-display' }, [
                h('span', { class: 'counter-label' }, '恭喜你，你已经写了'),
                h('span', { class: 'counter-text' }, this.count),
                h('span', { class: 'counter-label' }, '斤代码！'),
            ]),
            h('div', { class: 'counter-btns' }, [
                h('button', { class: 'btn', onClick: this.increase }, '写一斤'),
                h('button', { class: 'btn', onClick: this.reset }, '删库啦'),
            ])
        ]
    }
}

function useCount() {
    const count = ref(0)
    const increase = () => { count.value++ }
    const reset = () => { count.value = 0 }
    return { count, increase, reset }
}

// 根组件
const App = {
    render() {
        return h('div', { class: 'container' }, [
            h('h3', '计数器示例'),
            h(Counter)
        ])
    }
}

// 启动
const container = document.querySelector('#app')
const app = createApp()

app.mount(App, container)
```
变化的地方：原先的 template 不见了，取而代之的是一个 render 方法，方法中通过 h 函数创建虚拟DOM节点（这个h 函数和Vue2.0中 render 方法的参数 createElement 是类似的）。如果使用了 JSX，那 render 方法中更可以使用 JSX 的语法来编写虚拟DOM的创建，看起来会是这样：
```
const App = {
    render() {
        return (
          <div className="container">
            <h3>计数器示例</h3>
            <Counter />
          </div>
        )
    }
}
```
在 render 方法中使用到了 this 对象，当然这在实现功能上面并不存在什么问题，但是，这跟Composition API提倡的函数式做法的理念并不一致。

其实，新的框架已经考虑到了这一点，并给出了方案：在 setup 方法中返回这个 render 方法。我们的 Counter 组件如果按照上面的方案改写一下，就会是这样：
```
const Counter = {
    setup() {
        const { count, increase, reset } = useCount()

        return () => [
            h('div', { class: 'counter-display' }, [
                h('span', { class: 'counter-label' }, '恭喜你，你已经写了'),
                h('span', { class: 'counter-text' }, count.value),
                h('span', { class: 'counter-label' }, '斤代码！'),
            ]),
            h('div', { class: 'counter-btns' }, [
                h('button', { class: 'btn', onClick: increase }, '写一斤'),
                h('button', { class: 'btn', onClick: reset }, '删库啦'),
            ])
        ]
    }
}
```
如此一来，就完全摆脱对 this 的使用

## 组件属性Props
在创建计数器的时候，可以设置它初始计数值，然后后续的点击计数基于这个初始值进行累加，而不是从0开始累加。
```
const { createApp, ref, h } = Vue

// 计数器组件
const Counter = {

    // 属性定义
    props: {
        initCount: {
            type: Number,
            default: 0
        }
    },
    
    // setup的第一个参数为传入的属性值
    setup(props) {
        const { count, increase, reset } = useCount(props.initCount)

        return () => [
            h('div', { class: 'counter-display' }, [
                h('span', { class: 'counter-label' }, '恭喜你，你已经写了'),
                h('span', { class: 'counter-text' }, count.value),
                h('span', { class: 'counter-label' }, '斤代码！'),
            ]),
            h('div', { class: 'counter-btns' }, [
                h('button', { class: 'btn', onClick: increase }, '写一斤'),
                h('button', { class: 'btn', onClick: reset }, '删库啦'),
            ])
        ]
    }
}

// 使用初始计数值
function useCount(initCount) {
    const count = ref(initCount)
    const increase = () => { count.value++ }
    const reset = () => { count.value = 0 }
    return { count, increase, reset }
}

// 根组件
const App = {
    render() {
        return h('div', { class: 'container' }, [
            h('h3', '计数器示例'),
            h(Counter, { initCount: 99 })  // 传入初始值 99
        ])
    }
}

// 启动
const container = document.querySelector('#app')
const app = createApp()

app.mount(App, container)
```
![](https://upload-images.jianshu.io/upload_images/3407939-039c90645a5baf63?imageMogr2/auto-orient/strip|imageView2/2/w/606/format/webp)

## 组件生命周期
```
const { onMounted } = Vue

const MyComp = {
    
    // Options API
    mounted() {
        console.log('>>>>>> mounted 1')
    },
    
    setup() {
        // Composition API
        onMounted(() => {
            console.log('++++++ mounted 2')
        })
    }
}
```
两种形式的生命周期函数可以共存（当然实际使用的时候最好只选用一种），它们都会被执行。Composition API形式的生命周期函数都是在 setup 方法中被调用注册。

Options API形式的组件生命周期钩子和Composition API之间的实际对应关系：

- beforeCreate -> 请使用 setup()
- created -> 请使用 setup()
- beforeMount -> onBeforeMount
- mounted -> onMounted
- beforeUpdate -> onBeforeUpdate
- updated -> onUpdated
- beforeDestroy -> onBeforeUnmount
- destroyed -> onUnmounted
- errorCaptured -> onErrorCaptured

## 更多响应式API示例
响应式API主要由2大类组成：

- 针对原始的数据，将其包装成可观察数据的API （ref、reactive）
- 针对可观察数据的变动，执行监听和响应动作的API （effect、computed）

包装API和监听API这2者之间互相协同工作，组成一个完整的响应式系统。

#### 示例一：ref + effect

ref 函数可以将一个数据包装成一个响应式数据对象（Ref类型），该函数的TypeScript类型定义如下：

`function ref<T>(raw: T): Ref<T>`
effect 函数则可以接受一个监听函数，如果这个监听函数中存在对响应式数据对象的访问，则一旦这些响应式数据对象的值发生变化，该监听函数就会被执行。

```
const { ref, effect } = Vue

// 创建观察对象
const greeting = ref("Hello,World!")

// 监听数据变化
effect(() => {
    console.log(greeting.value)
})

// 再让数据改变一下吧
greeting.value = "Are you OK?"
```
以上这段代码先使用 ref 函数创建了一个名为 greeting 的可观察对象，然后通过 effect 函数创建对 greeting 值变化的监听器，对值进行打印。这段代码的执行结果是打印出：
```
Hello,World!
Are you OK?
```
这个 greeting 包含的值一共变化了2次，第一次是初始化时设置的 “Hello,World!”，第二次是后面设置的 "Are you OK?"。

#### 示例二：ref 作用于数组数据

```
const { ref, effect } = Vue

// 创建一个对数组的观察对象
const arr = ref([1, 2, 3])

effect(() => {
    console.log(arr.value[0])
})

// 改变整个数组
arr.value = [5, 6, 7]

// 改变数组中的第一个元素
arr.value[0] = 111
```
上面这段代码示例输出的结果是：
```
1
5
111
```
由此可以说明，在这段代码中，无论是对整个数组重新赋值，还是对数组中的某个元素赋值，都可以被精准的监听到。

### 示例三：ref 的嵌套

由 ref 函数创建的可观察对象可以嵌套使用。
```
const { ref, effect } = Vue

const a = ref(1)
const b = ref(2)
const c = ref({ x: a, y: b })

effect(() => {
    console.log(c.value.x + c.value.y)
})

// 从c对象上去间接改变a和b值
c.value.x = 5
c.value.y = 10

// 直接改变a和b的值
a.value = 20
b.value = 60
```
可以看到，可观察对象 c 中包含了对其他2个可观察对象 a 和 b的引用。这段代码的最终执行结果为如下：
```
3
7
15
30
80
```
由此可见，无论是通过嵌套引用来改变可观察对象值，或是直接改变可观察对象值，effect 创建的监听器都能正确响应这些变化。

#### 示例四：reactive + effect

reactive 是Composition API中的另一个可用于创建可观察对象的函数。最简单的用法如下：
```
const { reactive, effect } = Vue

const state = reactive({ a: 1, b: 'Hello' })

effect(() => {
    console.log(state.a)
})

state.a = 2
```
使用 reactive 的好处是一次性可以观察多个属性。不过，自从ES6+流行后，我们在实际的代码编写过程中，是不是经常会用到对象解构操作？比如像这样：
```
const obj = { a: 1, b: 2 }
const { a, b } = obj
```
而在对可观察对象进行操作的时候，你一定也会自然而然的想这么干：
```
const state = reactive({ a: 1, b })
let { a, b } = state

state.a = 123 //可以
a = 123 // 行不通！变成不可观察了
```
为什么将可观察对象中的属性解构出来后，变成不再可观察了呢？因为通过 reactive 函数创建的可观察对象，内部的属性本身并不是可观察类型的，对他们访问和观察其实都是通过Proxy代理访问来实现的。如果将这些属性解构，这些属性就不再通过原对象的代理来访问了，就无法再进行观察。

不过，Composition API也考虑到了这一点，提供了方法来解决这一个问题：
```
const { reactive, effect, toRefs } = Vue

const state = reactive({ a: 1, b: 2 })

// 这里的a和b都是Ref类型对象
const { a, b } = toRefs(state)

effect(() => {
    console.log(a.value)
})

a.value = 123
```
通过引入一个 toRefs 函数，它可以将 reactive 创建的可观察对象中的属性都转换成可观察的 Ref 对象，这样一来，即使解构后，也可以被独立进行观察了。

#### 示例五：computed

用过Vue的朋友，一定对计算属性不陌生，一般用于定义一个虚拟属性，这个虚拟属性的值来源于一个或多个可观察对象的变化而产生。在Composition API中也有对应的功能：
```
const { computed, ref } = Vue

// 可观察对象
const num = ref(1)

// 计算属性
const text = computed(() => {
    return `Value is ${num.value}`
})

console.log(text.value)

// 改动可观察对象的值
num.value = 2

console.log(text.value)
```
这个例子中，我们根据数字类型的 num，来生成新的字符串 text，实现了一个比较方便的数据生成转换。
