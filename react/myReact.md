[TOC]



# 1不能直接在useEffect中使用async函数

```js
useEffect(async () => {
    const result = await axios(
      'http://localhost/api/v1/search?query=redux',
    );

    setData(result.data);
  }, []);
```
  在代码中，我们使用`async / await`从第三方API获取数据。每个async函数都会默认返回一个隐式的promise。

  但是，useEffect不应该返回任何内容。这就是为什么会在控制台日志中看到以下警告

  > Warning: useEffect function must return a cleanup function or nothing. Promises and useEffect(async () => …) are not supported, but you can call an async function inside an effect

  正确使用
  ```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState({ hits: [] });

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        'http://localhost/api/v1/search?query=redux',
      );

      setData(result.data);
    };

    fetchData();
  }, []);

  return (
    <ul>
      {data.hits.map(item => (
        <li key={item.objectID}>
          <a href={item.url}>{item.title}</a>
        </li>
      ))}
    </ul>
  );
}

export default App;
  ```


# 2 尽量不要在 componentWillReviceProps 里使用 setState

如果一定要使用，那么需要判断结束条件，不然会出现无限重渲染，导致页面崩溃。

(实际不是 `componentWillReviceProps` 会无限重渲染，而是 `componentDidUpdate`)



# 3 给组件添加 ref 时候，尽量不要使用匿名函数

因为当组件更新的时候，匿名函数会被当做新的 prop 处理，让 ref 属性接受到新函数的时候，react 内部会先清空 ref，也就是会以 null 为回调参数先执行一次 ref 这个 props，

然后在以该组件的实例执行一次 ref，所以用匿名函数做 ref 的时候，有的时候去 ref 赋值后的属性会取到 null。



```jsx
class Demo {
  render() {
    return <button onClick={(e) => {
      alert('我点击了按钮')
    }}>
      按钮
    </button>
  }
}
```
由于onClick使用的是匿名函数，所有每次重渲染的时候，会把该onClick当做一个新的prop来处理，会将内部缓存的onClick事件进行重新赋值，所以相对直接使用函数来说，可能有一点的性能下降

修改
```jsx
class Demo {
  onClick = (e) => {
    alert('我点击了按钮')
  }

  render() {
    return <button onClick={this.onClick}>
      按钮
    </button>
  }
}
```



# 4 react 直接显示svg图片

```jsx
import {ReactComponent as SoftwareLogo} from "assets/software-logo.svg";

<SoftwareLogo width={"18rem"} color={"rgb(38, 132, 255)"}/>
```



# 5 useMount

```jsx
export const useMount = (callBack: () => void) => {
  useEffect(() => {
    callBack()
  }, [])
}
```



# 6 useDebounce

```jsx
export const useDebounce = <V> (value: V, delay?: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 每次在value变化以后，设置一个定时器
    const timeout = setTimeout(() => setDebouncedValue(value), delay)
    // 每次在上一个useEffect处理完以后再运行
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}
```



# 7 useDocumentTitle

```jsx
export const useDocumentTitle = (title: string, keepOnUnmount = true) => {
  const oldTitle = useRef(document.title).current;
  // 页面加载时: 旧title
  // 加载后：新title

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    return () => {
      if (!keepOnUnmount) {
        // 如果不指定依赖，读到的就是旧title
        document.title = oldTitle;
      }
    };
  }, [keepOnUnmount, oldTitle]);
};
```



# 8  React.memo本身会消耗性能

因为需要比较前后两个对象是否相同



# 9 URLSearchParams

```js
import { URLSearchParamsInit, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { cleanObject, subset } from "utils/index";

/**
 * 返回页面url中，指定键的参数值
 */

export const useUrlQueryParam = <K extends string>(keys: K[]) => {
 const [searchParams] = useSearchParams();
 const setSearchParams = useSetUrlSearchParam();
 const [stateKeys] = useState(keys);

 return [
  useMemo(
   () =>
    subset(Object.fromEntries(searchParams), stateKeys) as {
[key in K]: string;
    },
   [searchParams, stateKeys]
  ),
  (params: Partial<{ [key in K]: unknown }>) => {
   return setSearchParams(params);
   // iterator
   // iterator: https://codesandbox.io/s/upbeat-wood-bum3j?file=/src/index.js
  },
 ] as const;
};


export const useSetUrlSearchParam = () => {
 const [searchParams, setSearchParam] = useSearchParams();
 return (params: { [key in string]: unknown }) => {
  const o = cleanObject({
   ...Object.fromEntries(searchParams),
   ...params,
  }) as URLSearchParamsInit;
  return setSearchParam(o);
 };
};

const [param, setParam] = useUrlQueryParam(["name", "personId"]);
```





# 10 React.Children.toArray

```jsx
import { Children } from 'react'

function Wrap (props) {
  // 用 Children.toArray 来处理 props.children
  if (Children.toArray(props.children).length) {
    return (
     <div>
        <p>当前内容为：</p>
        <div>{props.children}</div>
      </div>
    )
  } else {
    return (
     <div>nothing</div>
    )
  }
}

function App () {
  return (
   <Wrap>
     { // 返回空数组
        [].map(item => <span>{item}</span>)
      }
    </Wrap>
  )
}
```

此时页面展示的是：

![图片](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcwH08e8Eibr8WqQn8oG2Cx98oEGnAesiczEHX2afcGknvibgoPRehowic6wStqF8XDXEkXL1Me777IyvQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

为什么会这样呢？打个断点进去看了一下 `React.Children.toArray` 大致都做了什么处理，这里简单总结一下：将 `children` 传过来的每个元素都放到一个数组中再返回，并会过滤掉空数组、Boolean、undefined

所以我们刚才的例子中，空数组直接被过滤掉了。我们再来验证一下 `React.Children.toArray` 的强大，举个例子🌰

```jsx
function App () {
  return (
   <Wrap>
      {
        false && <span>作者：零一</span>
      }
      {true}
     { // 返回空数组
        [].map(item => <span>{item}</span>)
      }
      {
        {}?.name
      }
    </Wrap>
  )
}
```

这种情况，`<Wrap/>` 组件接收到的 `children` 值应为：

```js
[
  false,
  true,
  [],
  undefined,
]
```

那么页面展示的是什么呢？

![图片](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcwH08e8Eibr8WqQn8oG2Cx98oEGnAesiczEHX2afcGknvibgoPRehowic6wStqF8XDXEkXL1Me777IyvQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

是的，还是`nothing`，因为这四种情况的值全都被 `React.Children.toArray` 给过滤掉了，最终返回的值为 `[]` ，这也十分符合我们开发时的预期

所以如果你真的需要把 `children` 作为条件判断的依据的话，我建议是用这个方法！
