对于同步的状态改变，是可以放在`componentWillMount`，对于异步的，最好放在`componentDidMount`。

但如果此时有若干细节需要处理，比如你的组件需要渲染子组件，而且子组件取决于父组件的某个属性，

那么在子组件的`componentDidMount`中进行处理会有问题：因为此时父组件中对应的属性可能还没有完整获取，因此就让其在子组件的`componentDidUpdate`中处理。

至于为什么，先看看react的生命周期：

`constructor() —> componentWillMount() —> render() -----> componentDidMount()`

上面这些方法的调用是有次序的，由上而下，也就是当说如果你要获取外部数据并加载到组件上，只能在组件"已经"挂载到真实的网页上才能作这事情，其它情况你是加载不到组件的。

`constructor`被调用是在组件准备要挂载的最一开始，所以此时组件尚未挂载到网页上。

`constructor()`中获取数据的话，如果时间太长，或者出错，组件就渲染不出来，你整个页面都没法渲染了。

`componentWillMount`方法的调用在constructor之后，在render之前，在这方法里的代码调用setState方法不会触发重渲染，所以它一般不会用来作加载数据之用，它也很少被使用到。

`componentDidMount`方法中的代码，是在组件已经完全挂载到网页上才会调用被执行，所以可以保证数据的加载。此外，在这方法中调用setState方法，会触发重渲染。所以，官方设计这个方法就是用来加载外部数据用的，或处理其他的副作用代码

`componentDidMount()`中能保证你的组件已经正确渲染。

一般的从后台(服务器)获取的数据，都会与组件上要用的数据加载有关，所以都在`componentDidMount`方法里面作。虽然与组件上的数据无关的加载，也可以在constructor里做，但constructor是做组件state初绐化工作，并不是设计来作加载数据这工作的，所以所有有副作用的代码都会集中在componentDidMount方法里。

总结下：

1.跟服务器端渲染（同构）有关系，如果在`componentWillMount`里面获取数据，fetch data会执行两次，一次在服务器端一次在客户端。在`componentDidMount`中可以解决这个问题。

2.在`componentWillMount`中fetch data，数据一定在render后才能到达，如果你忘记了设置初始状态，用户体验不好。

3.react16.0以后，`componentWillMount`可能会被执行多次。

**我们应当将AJAX 请求放到 componentDidMount 函数中执行**，主要原因有下：

1.React 下一代调和算法 Fiber 会通过开始或停止渲染的方式优化应用性能，其会影响到 `componenWillMount` 的触发次数。对于 `componenWillMount` 这个生命周期函数的调用次数会变得不确定，React 可能会多次频繁调用 componenТWillMount。如果我们将 AJAX 请求放到 `componenWillMount` 函数中，那么显而易见其会被触发多次，自然也就不是好的选择。

2.如果我们将 AJAX 请求放置在生命周期的其他函数中，我们并不能保证请求仅在组件挂载完毕后才会要求响应。如果我们的数据请求在组件挂载之前就完成，并且调用了setState函数将数据添加到组件状态中，对于未挂载的组件则会报错。而在 `componentDidMount` 函数中进行 AJAX 请求则能有效避免这个问题。

**在`componentDidMount()`函数中发送ajax请求，拿到数据，通过setState()保存在state中，供给组件使用。当组件要卸载时，在`componentWillUnmount()`函数中，通过`this.serverRequest.abort()`;将还没有完成的ajax请求停止。**
