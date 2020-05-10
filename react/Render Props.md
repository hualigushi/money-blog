## 什么是 Render Props

简而言之，只要一个组件中某个属性的值是函数，那么就可以说改组件使用了 Render Props 这种技术。



```
const Greeting = props => {    
	return props.render(props);
};
// how to use
<Greeting text="Hello 🌰！" emoji="😳" link="link here" render={(props) => (    
	<div>        
		<h1>{props.text}</h1>        
		<p>{props.emoji}</p>        
		<a href={props.link}></a>    
	</div>
)}>
</Greeting>
```

- `Greeting` 中通过执行回调函数 `props.render` 并把 `props` 传入其中，此时只要在 `Greeting` 组件的 `render`属性中传入一个函数即可获得 `props` 的值并返回你所需要的 UI

值得一提的是，并不是只有在 `render` 属性中传入函数才能叫 Render Props，实际上任何属性只要它的值是函数，都可称之为 Render Props，比如上面这个例子把 `render` 属性名改成 `children` 的话使用上其实更为简便：

```
const Greeting = props => {    
	return props.children(props);
};
// how to use
<Greeting text="Hello 🌰！" emoji="😳" link="link here">{(props) => (    
	<div>        
		<h1>{props.text}</h1>        
		<p>{props.emoji}</p>        
		<a href={props.link}></a>    
	</div>
)}
</Greeting>
```

这样就可以直接在 `Greeting` 标签内写函数了，比起之前在 `render` 中更为直观。

所以，**React 中的 Render Props 你可以把它理解成 JavaScript 中的回调函数**。

## Render Props 的应用

 **解决代码复用的问题**

```
class Switch extends React.Component {    
	constructor(props) {        
		super(props);        
		this.state = {            
			on: props.initialState || false,        
		};    
	}    
	toggle() {        
		this.setState({            
			on: !this.state.on,        
		});    
	}    
	render() {        
		return (            
			<div>{this.props.children({                
				on,                
				toggle: this.toggle,            
				})}
			</div>       
		);    
	}}
// how to use
const App = () => (    
	<Switch initialState={false}>{({on, toggle}) => {        
		<Button onClick={toggle}>Show Modal</Button>        
		<Modal visible={on} onSure={toggle}></Modal>    
	}}
</Switch>);
```

这是一个简单的 **复用显隐模态弹窗逻辑** 的组件，比如要显示 `OtherModal` 就直接替换 `Modal` 就行了，达到复用「开关」逻辑代码的目的。

Render Props 更像是 **控制反转（IoC）**，它只负责定义接口或数据并通过函数参数传递给你，具体怎么使用这些接口或者数据完全取决于你。