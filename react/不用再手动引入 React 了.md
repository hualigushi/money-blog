## 我们的工程用什么把 TS 编译成 JS 文件？

很多同学可能会觉得既然我们用 ts 那肯定是 tsc 编译的，其实不是，目前大多数的 ts 工程都是 ts 类型检查 + babel 编译 这样的组合，我们的工程也不例外（可以去项目 node_modules 下面看一下，会发现有个 @babel 文件夹）。

用 babel 编译 ts，就可以实现这样一种效果：babel 编译一切，降低开发 / 配置成本。

我们代码中的 jsx/tsx 文件，就是用 @babel/plugin-transform-react-jsx 这个 babel 插件转换的：[插件地址](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx)



## 为什么每个组件文件开头都要引入 React?

```
import React from 'react'
```

之所以这么做的原因是，jsx 只是个语法糖，上文中的那个插件，会把 jsx 这样转换：

```jsx
import React from 'react';

function App() {
  return <h1>Hello World</h1>;
}
```

转换成：

```jsx
import React from 'react';

function App() {
  return React.createElement('h1', null, 'Hello world');
}
```

大家看到转换出来的结果是要用 `React` 变量的，所以必须要引入 `React` 以保证它在作用域中。



## 为什么又说大家不需要再引入 React 了？

因为上面说的那种转换方式是上一个版本的转换方式了。

去年年底 plugin-transform-react-jsx 发布了新版本，从 v7.9.0 开始，就不用手动引入 `React` 了，因为转换变成这样了：

```jsx
const profile = (
  <div>
    <img src="avatar.png" className="profile" />
    <h3>{[user.firstName, user.lastName].join(" ")}</h3>
  </div>
);
```

编译成：

```jsx
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";

const profile = _jsxs("div", {
  children: [
    _jsx("img", {
      src: "avatar.png",
      className: "profile",
    }),
    _jsx("h3", {
      children: [user.firstName, user.lastName].join(" "),
    }),
  ],
});
```

所以就可以摆脱手动引入 React 了。

这个功能默认是关闭的，但是从 create-react-app 4.0 开始，默认就是打开的了。

而 4.0 版本是 2020 年 10 月 24 号 (https://github.com/facebook/create-react-app/releases/tag/v4.0.0) 发布的

**总之，大家的工程不需要手动引入 React。**