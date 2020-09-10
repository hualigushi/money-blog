1. 不能直接在useEffect中使用async函数
```
useEffect(async () => {
    const result = await axios(
      'http://localhost/api/v1/search?query=redux',
    );

    setData(result.data);
  }, []);
  ```
  在代码中，我们使用async / await从第三方API获取数据。每个async函数都会默认返回一个隐式的promise。
  
  但是，useEffect不应该返回任何内容。这就是为什么会在控制台日志中看到以下警告
  
  > Warning: useEffect function must return a cleanup function or nothing. Promises and useEffect(async () => …) are not supported, but you can call an async function inside an effect
  
  正确使用
  ```
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
2. 尽量不要在 componentWillReviceProps 里使用 setState，如果一定要使用，那么需要判断结束条件，不然会出现无限重渲染，导致页面崩溃。(实际不是 componentWillReviceProps 会无限重渲染，而是 componentDidUpdate)

3. 给组件添加 ref 时候，尽量不要使用匿名函数，因为当组件更新的时候，匿名函数会被当做新的 prop 处理，让 ref 属性接受到新函数的时候，react 内部会先清空 ref，也就是会以 null 为回调参数先执行一次 ref 这个 props，然后在以该组件的实例执行一次 ref，所以用匿名函数做 ref 的时候，有的时候去 ref 赋值后的属性会取到 null。

4. 
```
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
```
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

5. useState(() => { return })
useState初始化的值支持回调，用于计算值，只会执行一次