#### HOC

**缺点：**

- 由于可能会多次嵌套高阶组件，而我们又很难确保每个高阶组件中的属性名是不同的，所以 **属性容易被覆盖**。
- 当在使用高阶组件的时候，高阶组件相当于一个 **黑盒**，我们必须去看如何实现才能去使用它：

**优点：**

- 可以使用 `compose` 方法合并多个高阶组件然后在使用

```
// 不要这么使用
const EnhancedComponent = withRouter(connect(commentSelector)(WrappedComponent))；
// 可以使用一个 compose 函数组合这些高阶组件// lodash, redux, ramda 等第三方库都提供了类似 `compose` 功能的函数
const enhance = compose(withRouter, connect(commentSelector))；
const EnhancedComponent = enhance(WrappedComponent)；
```