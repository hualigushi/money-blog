# Proxy 相比于 defineProperty 的优势
Object.defineProperty() 的问题主要有三个：

1. 不能监听数组的变化

2. 必须遍历对象的每个属性

3. 必须深层遍历嵌套的对象

Proxy 在 ES2015 规范中被正式加入，它有以下几个特点：

1. 针对对象：针对整个对象，而不是对象的某个属性，所以也就不需要对 keys 进行遍历。这解决了上述 Object.defineProperty() 第二个问题

2. 支持数组：Proxy 不需要对数组的方法进行重载，省去了众多 hack，减少代码量等于减少了维护成本，而且标准的就是最好的。

除了上述两点之外，Proxy 还拥有以下优势：

1. Proxy 的第二个参数可以有 13 种拦截方法，这比起 Object.defineProperty() 要更加丰富

2. Proxy 作为新标准受到浏览器厂商的重点关注和性能优化，相比之下 Object.defineProperty() 是一个已有的老方法。