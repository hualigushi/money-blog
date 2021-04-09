[TOC]

# 1.不需要render的场景下使用useState
不推荐×
```js
function ClickButton(props){
  const [count, setCount] = setState(0)
  const onClickCount = () => {
    setCount((c) => c + 1)
  }
  const onClickRequest = () => {
    apiCall(count)
  }
  
  return (
    <div>
      <button onClick={onClickCount}>Click</button>
      <button onClick={onClickRequest}>Submit</button>
    </div>
  )
}
```
问题所在：仔细看上面的代码，乍一看其实也没什么问题，点击按钮更新 count。但是问题也就出在这里，我们的 return 部分并没有用到 count 状态，而每次 setCount 都会使组件重新渲染一次，而这个渲染并不是我们需要的，多出来的渲染会使得页面的性能变差，因此我们可以改造一下代码，如下代码：
推荐√
如果我们只是单纯的想要一个能在组件声明周期内保存的变量，但是变量的更新不需要组件的重新渲染，我们可以使用 useRef 钩子。

```js
function ClickButton(props){
  const count = useRef(0)
  const onClickCount = () => {
    count.current++
  }
  const onClickRequest = () => {
    apiCall(count.current)
  }

  return (
    <div>
      <button onClick={onClickCount}>Click</button>
      <button onClick={onClickRequest}>Submit</button>
    </div>
  )
}
```

# 2.使用了router.push而非link
不推荐×
```js
function ClickButton(props){
  const history = useHistory()
  const onClickGo = () => {
    history.push('/where-page')
  }
  return <button onClick={onClickGo}>Go to where</button>
}
```

问题所在：尽管上述代码可以正常工作，但是却不符合Accessibility（易访问性设计）的要求，此类按钮并不会被屏幕阅读器当作一个可以跳转的链接。因此我们可以改造一下代码，如下代码：

推荐√
```js
function ClickButton(props){
  return <Link to="/next-page">
    <span>Go to where</span>
  </Link>
}
```

# 3.通过useEffect来处理actions
有时候，我们只想在 React 更新 DOM 之后运行一些额外的代码。比如发送网络请求，手动变更 DOM，记录日志。

不推荐×
```js
function DataList({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = () => {
    setLoading(true);
    callApi()
      .then((res) => setData(res))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && !error && data) {
      onSuccess();
    }
  }, [loading, error, data, onSuccess]);

  return <div>Data: {data}</div>;
}
```

问题所在：上面的代码使用了两个useEffect ，第一个用来请求异步数据，第二个用来调用回调函数。在第一个异步请求数据成功，才会触发第二个 useEffect 的执行，但是，我们并不能完全保证，第二个 useEffect 的依赖项完全受控于第一个 useEffect 的成功请求数据。因此我们可以改造一下代码，如下代码：

推荐√

```js
function DataList({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = () => {
    setLoading(true);
    callApi()
      .then((res) => {
        setData(res)
        onSuccess()
       })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);
  return <div>Data: {data}</div>;
}
```

# 4.单一职责组件
什么时候该把一个组件分成几个更小的组件？如何构建组件树？在使用基于组件的框架时，所有这些问题每天都会出现。然而，设计组件时的一个常见错误是将两个用例组合成一个组件。

不推荐×

```js
function Header({ menuItems }) {
  return (
    <header>
      <HeaderInner menuItems={menuItems} />
    </header>
  );
}

function HeaderInner({ menuItems }) {
  return isMobile() ? <BurgerButton menuItems={menuItems} /> : <Tabs tabData={menuItems} />;
}
```

问题所在：上面的代码通过这种方法，组件HeaderInner试图同时成为两个不同的东西，一次做不止一件事情并不是很理想。此外，它还使得在其他地方测试或重用组件变得更加困难。因此我们可以改造一下代码，如下代码：
推荐√
将条件提升一级，可以更容易地看到组件的用途，并且它们只有一个职责，即<Tabs/>或<BurgerButton/>，而不是试图同时成为两个不同的东西。

```js
function Header(props) {
  return (
    <header>
      {isMobile() ? <BurgerButton menuItems={menuItems} /> : <Tabs tabData={menuItems} />}
    </header>
  )
}
```

# 5.单一职责useEffects
不推荐×

```js
function Example(props) {
  const location = useLocation();
  const fetchData = () => {
    /*  Calling the api */
  };

  const updateBreadcrumbs = () => {
    /* Updating the breadcrumbs*/
  };

  useEffect(() => {
    fetchData();
    updateBreadcrumbs();
  }, [location.pathname]);

  return (
    <div>
      <BreadCrumbs />
    </div>
  );
}
```

问题所在：上面的useEffect同时触发了两个副作用，但是并不都是我们需要的副作用，因此我们可以改造一下代码，如下代码：

推荐√
将两个副作用从一个useEffect中分离出来。
```js
function Example(props) {
  const location = useLocation();

  const fetchData = () => {
    /*  Calling the api */
  };

  const updateBreadcrumbs = () => {
    /* Updating the breadcrumbs*/
  };

  useEffect(() => {
    updateBreadcrumbs();
  }, [location.pathname]);

  useEffect(()=>{
    fetchData();
  },[])
  
  return (
    <div>
      <BreadCrumbs />
    </div>
  );
}
```
