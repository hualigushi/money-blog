```
class Example extends React.Component {
  constructor() {
    super();
    this.state = {
      val: 0
    };
  }
  
  componentDidMount() {
    this.setState({val: this.state.val + 1});
    console.log(this.state.val);    // 第 1 次 log

    this.setState({val: this.state.val + 1});
    console.log(this.state.val);    // 第 2 次 log

    setTimeout(() => {
      this.setState({val: this.state.val + 1});
      console.log(this.state.val);  // 第 3 次 log

      this.setState({val: this.state.val + 1});
      console.log(this.state.val);  // 第 4 次 log
    }, 0);
  }
  render() {
    return null;
  }
};

log的值 分别为 0 0 2 3
```

### setState 干了什么

![](https://upload-images.jianshu.io/upload_images/5703029-2354777c40b8c28b.jpg?imageMogr2/auto-orient/strip|imageView2/2/w/720/format/webp)



### 为什么直接修改this.state无效

> 要知道setState本质是通过一个队列机制实现state更新的。 执行setState时，会将需要更新的state合并后放入状态队列，而不会立刻更新state，队列机制可以批量更新state。
>  如果不通过setState而直接修改this.state，那么这个state不会放入状态队列中，下次调用setState时对状态队列进行合并时，会忽略之前直接被修改的state，这样我们就无法合并了，而且实际也没有把你想要的state更新上去。



#### setState之后发生的事情

- 在官方的描述中，setState操作并不保证是同步的，也可以认为是异步的。
- React在setState之后，会经对state进行diff，判断是否有改变，然后去diff dom决定是否要更新UI。如果这一系列过程立刻发生在每一个setState之后，就可能会有性能问题。
- 在短时间内频繁setState。React会将state的改变压入栈中，在合适的时机，批量更新state和视图，达到提高性能的效果。

#### 总结

1. 通过setState去更新this.state，不要直接操作this.state，请把它当成不可变的。
2. 调用setState更新this.state不是马上生效的，它是异步滴，所以不要天真以为执行完setState后this.state就是最新的值了。
3. 多个顺序执行的setState不是同步地一个一个执行滴，会一个一个加入队列，然后最后一起执行，即批处理

#### 如何知道state已经被更新

传入回调函数

```jsx
setState({
    index: 1
}}, function(){
    console.log(this.state.index);
})
```

在钩子函数中体现

```cpp
componentDidUpdate(){
    console.log(this.state.index);
}
```

#### setState的另外一种方式 （需要使用上一次的state的值）

在setState的第一个参数中传入function，该function会被压入调用栈中，在state真正改变后，按顺序回调栈里面的function。该function的第一个参数为上一次更新后的state。这样就能确保你下一次的操作拿到的是你预期的值

```kotlin
lass Com extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            index: 0
        }
        this.add = this.add.bind(this);
    }

    add(){
        this.setState(prevState => {
            return {index: prevState.index + 1};
        });
        this.setState(prevState => {
            return {index: prevState.index + 1};
        });
    }
}
```

#### 注意点

1. setState可能会引发不必要的渲染(renders)
2. setState无法完全掌控应用中所有组件的状态