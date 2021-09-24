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


 
