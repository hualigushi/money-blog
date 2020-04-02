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
