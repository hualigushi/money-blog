记录自己的一些学习笔记 

awesome-typescript-loader

{ "compilerOptions": { "incremental": true } }

```
{
  "compilerOptions": {...},
   "exclude": [
     "node_modules"
     ""
   ]
}
```

 第二届缤纷·滨江前端技术沙龙  https://live.dxy.cn/front/live/DC202009070077280#/

 第三届缤纷·滨江前端技术沙 https://www.yuque.com/binfe/pase7s/ynvlor

[![Anurag's GitHub stats](https://github-readme-stats.vercel.app/api?username=hualigushi)](https://github.com/anuraghazra/github-readme-stats)

[![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username=hualigushi)](https://github.com/anuraghazra/github-readme-stats)







### 样式隔离

样式隔里子应用我们用的是`cssModule`,编译的时候会自动生成唯一的key。主要问题是antd,因为我们既加载了antd3，又加载了antd4，导致样式会有冲突。我在antd4的编译的时候改前缀。配置如下

```
import { ConfigProvider } from 'antd';

// 弹框的前缀配置
 ConfigProvider.config({
    prefixCls: 'my-ant',
 });

// 组件的配置
<ConfigProvider prefixCls="my-ant">
</ConfigProvider>
```



本地调试
调试方式与 1.0 大体没有变化，只是 2.0 的架构变成了 monorepo 的形式，当然我们不需要管其他的 package，只需要调试 Vite 即可。
```
$ git clone git@github.com:vitejs/vite.git
$ cd vite && yarn
$ cd packages/vite && yarn build && yarn link
$ yarn dev
```
然后再通过 Vite 脚手架创建一个最简单的 example 来 link Vite
```
$ npm init @vitejs/app my-vue-app --template vue
$ cd my-vue-app && yarn && yarn link vite
$ npx vite optimize --force
```
然后就可以开始愉快的调试源码了
