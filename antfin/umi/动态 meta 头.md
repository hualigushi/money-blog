1. umi 是 spa ，只有一个 html ，做 meta 的国际化也不会被搜索引擎爬取到的，你可能需要 nextjs 这种 ssr 的解决方案。

2. 在 umi 中要实现动态 meta 头，可以用 import { Helmet } from 'umi' ，用法与 react-helmet-async 一致，根据当前语言添加对应的 meta 头即可，注意此处添加在页面渲染是异步的，这意味着搜索引擎无法获取。
