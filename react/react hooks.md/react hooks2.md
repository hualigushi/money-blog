React Hooks 是 React 16.8 版本推出的新特性，让函数式组件也可以和类风格组件一样拥有（类似）「生命周期」，进而更好的在函数式组件中发挥 React 的特性。

它更重要的目的是 **状态逻辑复用**。

**Hooks 的几个优点**：

- 虽然 Hooks 的目的和高阶组件、Render Props 一样，都是为了代码复用，但是 Hooks 较高阶组件和 Render Props 更为简单明了，且不会造成嵌套地狱。

- 能更容易的把 UI 和状态分离

- 一个 Hooks 中可以引用另外的 Hooks

- 解决类组件的痛点

- - `this` 指向容易错误
  - 分割在不同声明周期中的逻辑使得代码难以理解和维护
  - 代码复用成本高（高阶组件容易使代码量剧增）

## React Hooks 的应用

React 官方提供了以下几个常用的钩子：

- 基础钩子： `useState`、 `useEffect` 、 `useContext`
- 附加钩子： `useReducer`、 `useCallback`、 `useMemo`、 `useRef`、 `useImperativeHandle`、 `useLayoutEffect`、 `useDebugValue`

### useEffect

`useEffect` 钩子的作用正如其名 —— 为了处理比如 **订阅**、**数据获取**、**DOM 操作** 等等一些副作用。它的作用与 `componentDidMount`, `componentDidUpdate` 和 `componentWillUnmount` 这些生命周期函数类似。

比如我们要监听输入框 `input` 的输入，用 `useEffect` 我们可以这么实现：

```
function Input() {    
	const [text, setText] = useState('')    
	function onChange(event) {        
		setText(event.target.value)    
	}    
	useEffect(() => {        
		// 类似于 componentDidMount 和 componentDidUpdate 两个生命周期函数        
		const input = document.querySelector('input')        						    input.addEventListener('change', onChange);        
		return () => {            
			// 类似于 componentWillUnmount            		input.removeEventListener('change', onChange);        
			}    
		})    
		return (        
			<div>            
				<input onInput={onChange} />            
				<p>{text}</p>        
			</div>        
		)
}
```

`useEffect` 钩子的用法就是把函数作为第一个参数传入 `useEffect` 中，在该传入的函数中我们就可以做一些 **有副作用** 的事情了，比如操作 DOM 等等。

如果传入 `useEffect` 方法的函数返回了一个函数，该 **返回的函数** 会在组件即将卸载时调用，我们可以在这里做一些比如清除 timerID 或者取消之前发布的订阅等等一些清除操作，下面这么写可能比较直观：

```
useEffect(function didUpdate() {    
	// do something effects    
	return function unmount() {         
	// cleaning up effects    
	}
})
```

当 `useEffect` 只传入一个参数时，**每次** **`render` 之后都会执行 `useEffect` 函数**：

```
useEffect(() => {    
	// render 一次，执行一次    
	console.log('useEffect');
})
```

当 `useEffect` 传入第二个参数是数组时，**只有当数组的值（依赖）发生变化时，传入回调函数才会执行**，比如下面这种情况：

> 虽然 React 的 diff 算法在 DOM 渲染时只会更新变化的部分，但是却无法识别到 `useEffect` 内的变化，所以需要开发者通过第二个参数告诉 React 用到了哪些外部变量。

```
useEffect(() => {    
	document.title = title
}, [title])
```

因为 `useEffect` 回调内部用到了外部的 `title` 变量，所以如果需要仅当 `title` 值改变时才执行回调的话，只需在第二个参数中传入一个数组，并把内部所依赖的变量写在数组中，此时如果 `title` 值改变了的话， `useEffect` 回调内部就可以通过传入的依赖判断是否需要执行回调。

所以如果给 `useEffect` 第二个参数传入一个空数组的话， `useEffect` 的回调函数只会在首次渲染之后执行一次：

```
useEffect(() => {    
	// 只会在首次 render 之后执行一次    
	console.log('useEffect')
}, [])
```

### useContext

React 中有个 `context` 的概念，让我们可以 **跨组件共享状态，无需通过** **`props` 层层传递**，一个简单的例子：

> redux 就是利用 React 的 `context` 的特性实现跨组件数据共享的。

```
const ThemeContext = React.createContext();
function App() {    
	const theme = {        
		mode: 'dark',        
		backgroundColor: '#333',    
	}    
	return (        
		<ThemeContext.Provider value={theme}>            
			<Display />        
		</ThemeContext.Provider>    
	)
}
function Display() {    
	return (        
		<ThemeContext.Consumer>            
			{
				({backgroundColor}) => 
					<div style={{backgroundColor}}>Hello Hooks.</div>
			}        
		</ThemeContext.Consumer>   
	)
}
```

下面是 `useContext` 版本：

```
function Display() {    
	const { backgroundColor } = useContext(ThemeContext);    
	return (
		<div style={{backgroundColor}}>
			Hello Hooks.
		</div>
	)
}
```

嵌套版 `Consumer`：

```
function Header() {    
	return (        
		<CurrentUser.Consumer>            
			{user =>                
				<Notifications.Consumer>                    
				{
				 notifications =>                        
				 	<header>                            
				 		Hello {user.name}!                            
				 		You have {notifications.length} notifications.                        			</header>                    
				 }                
				 </Notifications.Consumer>            
			}        
		</CurrentUser.Consumer>    
	);
}
```

用 `useContext` 拍平：

```
function Header() {    
	const user = useContext(CurrentUser)    
	const notifications = useContext(Notifications)    
		return (        
			<header>            
				Hello {user.name}!            
				You have {notifications.length} notifications.        
			</header>    
		)
}
```

### 使用中需要注意的点

- 避免在 **循环、条件判断、嵌套函数** 中调用 **Hooks**，保证调用顺序的稳定；
- 只有 **函数定义组件** 和 **Hooks** 可以调用 **Hooks**，避免在 **类组件** 或者 **普通函数** 中调用；
- 不能在 `useEffect` 中使用 `useState`，React 会报错提示；
- 类组件不会被替换或废弃，不需要强制改造类组件，两种方式能并存