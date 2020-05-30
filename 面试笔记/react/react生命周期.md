React16.3+废弃的三个生命周期函数

- componentWillMount
- componentWillReceiveProps
- componentWillUpdate

取而代之的是两个新的生命周期函数

- static getDerivedStateFromProps(nextProps, prevState)  取代componentWillMount、componentWillReceiveProps和componentWillUpdate
- getSnapshotBeforeUpdate(prevProps, prevState) 取代componentWillUpdate

