1. 垂直居中的方式

2. 盒子模型  

   先说明盒子的含义，弹性伸缩盒模型

   在项目中为了计算方便，一般使用border-box，在reset.css就设置好了

3. flex布局，各个属性含义

4. BFC 概念  如何触发  怎么应用

6. CSS 预处理器

7. z-index的工作原理，适用范围

9. rem em px  vw vh

8. dpr 的值会影响 rem 吗？该如何处理呢？

11. 选择器优先级(`！important > style > id > class > tag > * > 继承 > 默认`) 
12. transition和animation的区别
16. canvas svg区别
17. 为什么canvas的图片为什么有跨域问题(浏览器为了保护你的隐私会限制这样的请求)
18. canvas渲染较大画布的时候性能会较低,为什么？
19. 前端适配方案
20. 前端如何实现图片剪裁
21. 响应式背后的浏览器原理（Media Query）
22. 如何理解`getComputedStyle
24. CSS 选择器的解析顺序是从右到左，还是从左到右，为什么（从右到左）
28. 如何给一组列表首尾之外的元素添加样式
33. position设置为absolute的div和span分别是什么样子(**inline-block行级块元素**)
34. `visibility: hidden` 与 `opacity: 0` 有什么区别？
35. 如何是一个div里的文字垂直居中，且该文字的大小根据屏幕大小自适应
36. 不考虑其他因素，下面哪种的渲染性能比较高

```
.box a {
   ...
}

a {
...
}
```

31. 简要介绍⼀下, 你如何在项⽬中管理样式的? 如何避免不同⻚⾯ / 模块中, 样式的互相影响 ?

​       ⽬前项⽬中使⽤的是 BEM 规则，通过区分模块和元素来进⾏样式命名

​       通过 css modules 将css进⾏分模块管理。
