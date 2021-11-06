# 获取 React 组件的 Props 类型声明

React 的类型声明里提供了一个很便捷的泛型可以帮助我们获取一个组件的 `props` 类型声明，具体定义：

```ts
type ComponentProps<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>> =
  T extends JSXElementConstructor<infer P>
    ? P
    : T extends keyof JSX.IntrinsicElements
      ? JSX.IntrinsicElements[T]
      : {};
```

具体使用方法如下：

```ts
import * as React from 'react';
import { Button } from 'antd';

type ButtonProps = React.ComponentProps<typeof Button>;
```

相比较原来的从 `antd/lib/button` 来导出，这种方式的一个好处是获取到的是真实的类型声明，而 antd 导出的类型声明有时候是不完整的，比如 `DropDownProps` 就缺少 `children`.

## 泛型组件

处理泛型组件时上面的写法就报语法错误了，比如：

```ts
type NumberSelectProps = React.ComponentProps<typeof Select<number>>;
```

原因是 `typeof` 操作符只能应用于值，不能应用于类型(`Select<number>>`)。

因此我们需要定义另一个工具方法：

```ts
export interface Type<T> extends Function { 
  new (...args: any[]): T; 
}
```

然后可以这么应用：

```ts
type NumberSelectProps = React.ComponentProps<Type<Select<number>>>;
```