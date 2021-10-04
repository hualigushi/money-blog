## 1
```js

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}
```
由于 useEffect 符合 Capture Value 的特性，拿到的 count 值永远是初始化的 0。
**相当于 setInterval 永远在 count 为 0 的 Scope 中执行，后续的 setCount 操作并不会产生任何作用。**



## 2

```js
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);
```
好消息是，代码可以正常运行了，拿到了最新的 count。

坏消息有：

 - 计时器不准了，因为每次 count 变化时都会销毁并重新计时。

 - 频繁 生成/销毁 定时器带来了一定性能负担。



 ## 3 在一个只想执行一次的 Effect 里依赖了外部变量,想办法不依赖外部变量

 ```js
 useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  return () => clearInterval(id);
}, []);
 ```
setCount 还有一种函数回调模式，不需要关心当前值是什么，只要对 “旧的值” 进行修改即可。

这样虽然代码永远运行在第一次 Render 中，但总是可以访问到最新的 state。



## 4 将更新与动作解耦

利用 useEffect 的兄弟 useReducer 函数，将更新与动作解耦就可以了
```js
const [state, dispatch] = useReducer(reducer, initialState);
const { count, step } = state;

useEffect(() => {
  const id = setInterval(() => {
    dispatch({ type: "tick" }); // Instead of setCount(c => c + step);
  }, 1000);
  return () => clearInterval(id);
}, [dispatch]);
```
这就是一个局部 “Redux”，由于更新变成了 dispatch({ type: "tick" })

**所以不管更新时需要依赖多少变量，在调用更新的动作里都不需要依赖任何变量。**



## 5 useCallback

```js
function Parent() {
  const [query, setQuery] = useState("react");

  // ✅ Preserves identity until query changes
  const fetchData = useCallback(() => {
    const url = "https://hn.algolia.com/api/v1/search?query=" + query;
    // ... Fetch data and return it ...
  }, [query]); // ✅ Callback deps are OK

  return <Child fetchData={fetchData} />;
}

function Child({ fetchData }) {
  let [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, [fetchData]); // ✅ Effect deps are OK

  // ...
}
```
由于函数也具有 Capture Value 特性，经过 useCallback 包装过的函数可以当作普通变量作为 useEffect 的依赖。

useCallback 做的事情，就是在其依赖变化时，返回一个新的函数引用，触发 useEffect 的依赖变化，并激活其重新执行。

利用 useCallback 封装的取数函数，可以直接作为依赖传入 useEffect，

**useEffect 只要关心取数函数是否变化，而取数参数的变化在 useCallback 时关心，再配合 eslint 插件的扫描，能做到 依赖不丢、逻辑内聚，从而容易维护。**



## 6 useEffect 优势

useEffect 在渲染结束时执行，所以不会阻塞浏览器渲染进程，所以使用 Function Component 写的项目一般都有用更好的性能。

自然符合 React Fiber 的理念，因为 Fiber 会根据情况暂停或插队执行不同组件的 Render，如果代码遵循了 Capture Value 的特性，

在 Fiber 环境下会保证值的安全访问，同时弱化生命周期也能解决中断执行时带来的问题。
