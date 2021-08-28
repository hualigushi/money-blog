记录自己的一些学习笔记 

 第二届缤纷·滨江前端技术沙龙  https://live.dxy.cn/front/live/DC202009070077280#/





数据结构

设计模式

graphql

node kafaka

webgl

canvas

threejs

webgpu

react源码


本地调试
调试方式与 1.0 大体没有变化，只是 2.0 的架构变成了 monorepo 的形式，当然我们不需要管其他的 package，只需要调试 Vite 即可。
$ git clone git@github.com:vitejs/vite.git
$ cd vite && yarn
$ cd packages/vite && yarn build && yarn link
$ yarn dev
复制代码
然后再通过 Vite 脚手架创建一个最简单的 example 来 link Vite
$ npm init @vitejs/app my-vue-app --template vue
$ cd my-vue-app && yarn && yarn link vite
$ npx vite optimize --force
复制代码
然后就可以开始愉快的调试源码了
