key 值是 React 用来判断 DOM 元素的唯一依据。当我们尝试向列表中添加、删除一项数据的时候会发生什么？如果 key 值和之前的相同，React 会假设这是同一个组件。

看一下下面这个例子，这段代码要实现的功能是点击 增加 按钮时在表单顶部增加一个文本框。

```

class Item extends React.Component {
  render() {
    return (
      <div className="form-group">
        <label className="col-xs-4 control-label">{this.props.name}</label>
        <div className="col-xs-8">
          <input type='text' className='form-control' />
        </div>
      </div>
    )
  }
}

class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: []
    };
  }
  
  addItem() {
    const id = +new Date;
    this.setState({
      list: [ {name: 'Baz' + id, id} , ...this.state.list]
    });
  }
  
  render() {
    return (
      <div>
        <button className='btn btn-primary' onClick={this.addItem.bind(this)}>添加</button>
        <h3>错误 <code>key=index</code></h3>
        <form className="form-horizontal">
            {this.state.list.map((todo, index) =>
              <Item {...todo} key={index} />
            )}
        </form>

        <h3>正确 <code>key=id</code></h3>
        <form className="form-horizontal">
            {this.state.list.map((todo) =>
              <Item {...todo} key={todo.id} />
            )}
        </form>
      </div>
    )
  }
}

React.render(<Example />, document.getElementById('app'))
```

我们先点击添加按钮，在文本框中输入一些测试值。然后再点击一次添加按钮，在列表顶部添加一个空的文本框，这时候你就会发现问题所在了。 由于我们错误的使用 index 作为 key 值，React 在渲染 list 列表时，会假定 key = 0 就是我们之前添加的第一个文本框，于是错误的将第一次输入的内容渲染到了我们新添加的文本框上。

## 解决方案

使用唯一 id 作为 key 值。如果你的数据项有 id 并且是唯一的，就使用 id 作为 key。如果没有，可以设置一个全局变量来保证 id 的唯一性

在实际生产环境中，一般使用第三方库来生成唯一 id

```
const shortid = require('shortid');
// ...
addItem() {
    const id = shortid.generate();
    this.setState({
        list: [ {name: 'Baz' + id, id} , ...this.state.list]
    });
}
//...
```