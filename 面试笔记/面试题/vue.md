1. Vue生命周期,各个阶段简单讲一下
2. 父子组件的生命周期触发顺序
3. Vue组件如何通信
4. Vue 中，子组件为何不可以修改父组件传递的 Prop
5. vue computed原理
6. computed和watch有什么区别
7. 请说一下computed中的getter和setter
8. Vue的响应式系统, Vue是如何实现双向绑定的
9. 为什么说 Vue 的响应式更新精确到组件级别？
10. 虚拟DOM实现原理
11. Vue中的key的作用
12. Proxy与Object.defineProperty的优劣对比
13. Vue3与Vue2的不同,做了哪些优化
14. 像vue-router，vuex他们都是作为vue插件，请说一下他们分别都是如何在vue中生效的？
15. vue的设计架构
16. vue的初始化，发生了什么？
17. vue的模板解析，是如何进行的？如何形成AST？render函数的生成？什么是依赖收集？什么是patch？
18. 在这个过程中，混入mixins、$options，vuex、router他们各自如何通过这些api，实现各自的功能？
19. vue-lazyloader的原理
22. keep-alive实现原理和缓存策略
23. 何时需要使用keep-alive?
24. v-if和v-for那个优先级高，如何优化
25. v-show元素的显示和隐藏算是重排吗?
26. v-model原理
27. 开发时，改变数组或者对象的数据，但是页面没有更新如何解决？
28. 父组件可以监听到子组件的生命周期吗？
29. 你有对 Vue 项目进行哪些优化
30. vue编译器结构图
31. delete和Vue.delete删除数组的区别
32. 页面中定义一个定时器，在哪个阶段清除
33. 自定义指令如何定义，它的生命周期是什么？
34. vue-router的原理,history和hash模式有什么区别？
35. 导航钩子有哪几种，分别如何用， 如何将数据传入下一个点击的路由页面？
36. 为什么vue中data必须是一个函数？
37. vue-loader是什么？使用它的用途有哪些？
38. vue 是如何对数组方法进行变异的
39. 谈谈 Vue 事件机制,手写$on,$off,$emit,$once
40. Vue 的渲染过程
41. vm.$set()实现原理是什么?
42. Vuex 的 Mutation 和 Action 的区别
43. Vue中v-show 和 v-if的区别
44. vue router路由模式，路由守卫
45. Vuex中模块命名空间
46. `Vue`在什么情况会重新渲染页面
47. vue 写一个自定义过滤器，将输出的单词首字母设置为大写
48. Vue: 实现一个 toast 提示插件，说明思路并写出简要的实现代码
49. 说说你项目做的Vue spa首屏优化吧（按需引入，懒加载路由，gzip压缩，关闭一些插件...
50. prerender预渲染是什么原理
51. 就是我有两个组件 A、B 同时依赖一份数据，而我在两个组件同时修改，你觉得会怎么样？

47.如何批量引入组件

48. nextTick 作用和原理

50. 如何将组件所有props传递给子组件？   `<user v-bind = "$props"/>`
51. vue 为何是异步渲染，$nextTick何用？

​      vue 是组件级更新 为了防止每次修改数据都更新视图，所以使用异步渲染

​     异步渲染（以及合并data修改）提高渲染性能
​     $nextTick在DOM更新完之后，触发回调



52. Vue.js中this.$emit()的返回值是什么 (this)
53. vue中 同名插槽是替换还是覆盖呢?
54. vuex原理, 对vuex的理解，单向数据流
55. vuex和vue的双向数据绑定有什么冲突


