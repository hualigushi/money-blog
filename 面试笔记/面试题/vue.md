1. Vue生命周期,各个阶段简单讲一下
2. Vue组件如何通信
3. computed和watch有什么区别
4. Vue是如何实现双向绑定的
5. Proxy与Object.defineProperty的优劣对比
6. Vue的响应式系统
7. 虚拟DOM实现原理
8. Vue中的key
9. Vue3与Vue2的不同,做了哪些优化
10. 像vue-router，vuex他们都是作为vue插件，请说一下他们分别都是如何在vue中生效的？
11. vue的设计架构
12. vue-lazyloader的原理
13. vue-router的原理,history和hash模式有什么区别？
14. 对vuex的理解，单向数据流
15. keep-alive实现原理和缓存策略
16. v-show元素的显示和隐藏算是重排吗?
17. v-model原理
18. vue的初始化，发生了什么？
19. vue的模板解析，是如何进行的？如何形成AST？render函数的生成？什么是依赖收集？什么是patch？
20. 在这个过程中，混入mixins、$options，vuex、router他们各自如何通过这些api，实现各自的功能？
21. 开发时，改变数组或者对象的数据，但是页面没有更新如何解决？
22. 父组件可以监听到子组件的生命周期吗？
23. 你有对 Vue 项目进行哪些优化
24. vuex原理
25. vue编译器结构图
26. vue computed原理
27. delete和Vue.delete删除数组的区别
28. 页面中定义一个定时器，在哪个阶段清除
29. 自定义指令如何定义，它的生命周期是什么？
30. 请说一下computed中的getter和setter
31. 导航钩子有哪几种，分别如何用， 如何将数据传入下一个点击的路由页面？
32. 为什么vue中data必须是一个函数？vue-loader是什么？使用它的用途有哪些？
33. vue 是如何对数组方法进行变异的
34. 谈谈 Vue 事件机制,手写$on,$off,$emit,$once
35. Vue 的渲染过程
36. vm.$set()实现原理是什么?
37. Vuex 的 Mutation 和 Action 的区别
38. Vue中v-show 和 v-if的区别
39. vue router路由模式，路由守卫
40. Vuex中模块命名空间
41. `Vue`在什么情况会重新渲染页面
42. vue 写一个自定义过滤器，将输出的单词首字母设置为大写
45. Vue: 实现一个 toast 提示插件，说明思路并写出简要的实现代码
44. 说说你项目做的Vue spa首屏优化吧（按需引入，懒加载路由，gzip压缩，关闭一些插件...
45. prerender预渲染是什么原理
46. 就是我有两个组件 A、B 同时依赖一份数据，而我在两个组件同时修改，你觉得会怎么样？

47.如何批量引入组件

48. nextTick 作用和原理



















#### 既然Vue通过数据劫持可以精准探测数据变化,为什么还需要虚拟DOM进行diff检测差异?

考点: Vue的变化侦测原理

前置知识: 依赖收集、虚拟DOM、响应式系统

现代前端框架有两种方式侦测变化,一种是pull一种是push

pull: 其代表为React,我们可以回忆一下React是如何侦测到变化的,我们通常会用setStateAPI显式更新,然后React会进行一层层的Virtual Dom Diff操作找出差异,然后Patch到DOM上,React从一开始就不知道到底是哪发生了变化,只是知道「有变化了」,然后再进行比较暴力的Diff操作查找「哪发生变化了」，另外一个代表就是Angular的脏检查操作。

push: Vue的响应式系统则是push的代表,当Vue程序初始化的时候就会对数据data进行依赖的收集,一但数据发生变化,响应式系统就会立刻得知,因此Vue是一开始就知道是「在哪发生变化了」,但是这又会产生一个问题,如果你熟悉Vue的响应式系统就知道,通常一个绑定一个数据就需要一个Watcher,一但我们的绑定细粒度过高就会产生大量的Watcher,这会带来内存以及依赖追踪的开销,而细粒度过低会无法精准侦测变化,因此Vue的设计是选择中等细粒度的方案,在组件级别进行push侦测的方式,也就是那套响应式系统,通常我们会第一时间侦测到发生变化的组件,然后在组件内部进行Virtual Dom Diff获取更加具体的差异,而Virtual Dom Diff则是pull操作,Vue是push+pull结合的方式进行变化侦测的.

#### Vue为什么没有类似于React中shouldComponentUpdate的生命周期？

考点: Vue的变化侦测原理

前置知识: 依赖收集、虚拟DOM、响应式系统

根本原因是Vue与React的变化侦测方式有所不同

React是pull的方式侦测变化,当React知道发生变化后,会使用Virtual Dom Diff进行差异检测,但是很多组件实际上是肯定不会发生变化的,这个时候需要用shouldComponentUpdate进行手动操作来减少diff,从而提高程序整体的性能.

Vue是pull+push的方式侦测变化的,在一开始就知道那个组件发生了变化,因此在push的阶段并不需要手动控制diff,而组件内部采用的diff方式实际上是可以引入类似于shouldComponentUpdate相关生命周期的,但是通常合理大小的组件不会有过量的diff,手动优化的价值有限,因此目前Vue并没有考虑引入shouldComponentUpdate这种手动优化的生命周期.
