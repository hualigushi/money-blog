React16.3+废弃的三个生命周期函数

- componentWillMount
- componentWillReceiveProps
- componentWillUpdate

取而代之的是两个新的生命周期函数

- static getDerivedStateFromProps(nextProps, prevState)  取代componentWillMount、componentWillReceiveProps和componentWillUpdate
- getSnapshotBeforeUpdate(prevProps, prevState) 取代componentWillUpdate



## getSnapshotBeforeUpdate

getSnapshotBeforeUpdate() 在最近一次渲染输出（提交到 DOM 节点）之前调用。它使得组件能在发生更改之前从 DOM 中捕获一些信息（例如，滚动位置）。此生命周期的任何返回值将作为参数传递给 componentDidUpdate()。

getSnapshotBeforeUpdate 返回的值会做为第三个参数传递给 componentDidUpdate。

```
getSnapshotBeforeUpdate(prevProps, prevState) {
  ...
  return snapshot;
}

componentDidUpdate(prevProps, prevState, snapshot) {
  
}
```