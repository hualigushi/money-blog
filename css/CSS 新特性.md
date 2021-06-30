[TOC]

# CSS Gap（沟槽）

CSS 的 gap 属性是一个简写属性，分为 row-gap 和 column-gap ： 

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ba289b4eb54845cf986cb4474c31d1f3~tplv-k3u1fbpfcp-zoom-1.image)

该属性 gap 到目前为止只能运用于多列布局，Flexbox布局和网格布局的容器上： 

```
// 多列布局 
.multi__column { 
  gap: 5ch 
} 

// Flexbox布局 
.flexbox { 
  display: flex; 
  gap: 20px 
} 

// Grid布局 
.grid { 
  display: grid; 
  gap: 10vh 20% 
}

``
