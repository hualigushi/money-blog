## 无状态组件
```
import * as React from 'react'

export const Logo = props => {
    const { logo, className, alt } = props

    return (
        <img src={logo} className={className} alt={alt} />
    )
}
```

```
ts

import * as React from 'react'

interface IProps {
    logo?: string
    className?: string
    alt?: string
}

export const Logo = (props: IProps) => {
    const { logo, className, alt } = props

    return (
        <img src={logo} className={className} alt={alt} />
    )
}

export const Logo: React.SFC<IProps> = props => {
    const { logo, className, alt } = props

    return (
        <img src={logo} className={className} alt={alt} />
    )
}
```

如果我们这个组件是业务中的通用组件的话，甚至可以加上注释:
```
interface IProps {
    /**
     * logo的地址
     */
    logo?: string
    className?: string
    alt?: string
}
```
这样在其他同事调用此组件的时候，除了代码提示外甚至会有注释的说明

## 有状态组件

有状态组件除了props之外还需要state，对于class写法的组件要泛型的支持，即`Component<P, S>`，因此需要传入传入state和props的类型，这样我们就可以正常使用props和state了。
```
import * as React from 'react'

interface Props {
    handleSubmit: (value: string) => void
}

interface State {
    itemText: string
}

export class TodoInput extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            itemText: ''
        }
    }
}
```
不需要给Props和State加上Readonly，因为React的声明文件已经自动帮我们包装过上述类型了，已经标记为readonly。

- 添加组件方法,大多数情况下这个方法是本组件的私有方法，这个时候需要加入访问控制符private。
```
private updateValue(value: string) {
    this.setState({ itemText: value })
}
```

- 取某个组件的ref

首先，我们需要用`React.createRef`创建一个ref，然后在对应的组件上引入即可。
```
private inputRef = React.createRef<HTMLInputElement>()
...

<input
    ref={this.inputRef}
    className="edit"
    value={this.state.itemText}
/>
```
需要注意的是，在`createRef`这里需要一个泛型，这个泛型就是需要ref组件的类型，因为这个是input组件，所以类型是`HTMLInputElement`，当然如果是div组件的话那么这个类型就是`HTMLDivElement`。

## 受控组件
定义事件
```
private handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!this.state.itemText.trim()) {
            return
        }

        this.props.handleSubmit(this.state.itemText)
        this.setState({itemText: ''})
    }
```
在组件中输入事件对应的名称时，会有相关的定义提示，我们只要用这个提示中的类型就可以了

## 默认属性
假设我们需要通过props来给input组件传递属性，而且需要初始值，我们这个时候完全可以通过class来进行代码简化。
```
// props.type.ts

interface InputSetting {
    placeholder?: string
    maxlength?: number
}

export class TodoInputProps {
    public handleSubmit: (value: string) => void
    public inputSetting?: InputSetting = {
        maxlength: 20,
        placeholder: '请输入todo',
    }
}

export class TodoInput extends React.Compoent<TodoInputProps, State> {
    public static defaultProps = new TodoInputProps()
    
    public render () {
        const { itemText } = this.state
        const { updateValue, handleSubmit } = this
        const { inputSetting } = this.props

        return (
            <form onSubmit={handleSubmit}>
                <input maxLength={inputSetting.maxlength} type="text" value={itemText}> 
                // 注意！！！ inputSetting.maxlength 会报错，编译器认为inputSetting可能未定义
                <button type="submit">add</button>
            </form>
        )
    }
}
```
用class作为props类型以及生产默认属性实例有以下好处：

- 代码量少：一次编写，既可以作为类型也可以实例化作为值使用
- 避免错误：分开编写一旦有一方造成书写错误不易察觉

## 利用高级类型解决默认属性报错
先声明defaultProps的值:
```
const todoInputDefaultProps = {
    inputSetting: {
        maxlength: 20,
        placeholder: '请输入todo',
    }
}
```
接着定义组件的props类型
```
import * as React from 'react'

interface State {
    itemText: string
}

type Props = {
    handleSubmit: (value: string) => void
    children: React.ReactNode
} & Partial<typeof todoInputDefaultProps>

const todoInputDefaultProps = {
    inputSetting: {
        maxlength: 20,
        placeholder: '请输入todo',
    }
}

export const createPropsGetter = <DP extends object>(defaultProps: DP) => {
    return <P extends Partial<DP>>(props: P) => {
        type PropsExcludingDefaults = Omit<P, keyof DP>
        type RecomposedProps = DP & PropsExcludingDefaults

        return (props as any) as RecomposedProps
    }
}

const getProps = createPropsGetter(todoInputDefaultProps)

export class TodoInput extends React.Component<Props, State> {

    public static defaultProps = todoInputDefaultProps

    constructor(props: Props) {
        super(props)
        this.state = {
            itemText: ''
        }
    }

    public render() {
        const { itemText } = this.state
        const { updateValue, handleSubmit } = this
        const { inputSetting } = getProps(this.props)

        return (
            <form onSubmit={handleSubmit} >
                <input maxLength={inputSetting.maxlength} type='text' value={itemText} onChange={updateValue} />
                <button type='submit' >添加todo</button>
            </form>
        )
    }

    private updateValue(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ itemText: e.target.value })
    }

    private handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!this.state.itemText.trim()) {
            return
        }

        this.props.handleSubmit(this.state.itemText)
        this.setState({itemText: ''})
    }

}
```

1. `Partial`的作用就是将类型的属性全部变成可选的,也就是下面这种情况：
```
{
    inputSetting?: {
        maxlength: number;
        placeholder: string;
    } | undefined;
}
```

2. `createPropsGetter`函数，将`defaultProps`中已经声明值的属性从『可选类型』转化为『非可选类型』。

这个函数接受一个`defaultProps`对象，`<DP extends object>`这里是泛型约束，代表DP这个泛型是个对象，然后返回一个匿名函数。

再看这个匿名函数，此函数也有一个泛型P,这个泛型P也被约束过,即`<P extends Partial<DP>>`，意思就是这个泛型必须包含可选的DP类型（实际上这个泛型P就是组件传入的Props类型）。

接着我们看类型别名`PropsExcludingDefaults`，它的作用其实是剔除Props类型中关于`defaultProps`的部分，Omit其实就是一个语法糖：

`type Omit<P, keyof DP> = Pick<P, Exclude<keyof P, keyof DP>>`

而类型别名`RecomposedProps`则是将默认属性的类型DP与剔除了默认属性的Props类型结合在一起。

其实这个函数只做了一件事，把可选的`defaultProps`的类型剔除后，加入必选的`defaultProps`的类型，从而形成一个新的Props类型，这个Props类型中的`defaultProps`相关属性就变成了必选的。

## 高阶组件
用高阶组件向TodoInput注入props
```
import * as hoistNonReactStatics from 'hoist-non-react-statics'
import * as React from 'react'

type InjectedProps = Partial<typeof hocProps>

const hocProps = {
    inputSetting: {
        maxlength: 30,
        placeholder: '请输入待办事项',
    }
}

export const withTodoInput = <P extends InjectedProps>(
  UnwrappedComponent: React.ComponentType<P>,
) => {
  type Props = Omit<P, keyof InjectedProps>

  class WithToggleable extends React.Component<Props> {

    public static readonly UnwrappedComponent = UnwrappedComponent

    public render() {

      return (
        <UnwrappedComponent
        inputSetting={hocProps}
        {...this.props as P}
        />
      );
    }
  }

  return hoistNonReactStatics(WithToggleable, UnwrappedComponent)
}
```
这里我们的P表示传递到HOC的组件的props，`React.ComponentType<P> `是 `React.FunctionComponent<P> | React.ClassComponent<P>`的别名，表示传递到HOC的组件可以是类组件或者是函数组件。

`const HOC = withTodoInput<Props>(TodoInput)`