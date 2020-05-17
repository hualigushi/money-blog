# MVVM

### 定义

MVVM(Model-View-ViewModel), 源自于经典的 Model–View–Controller（MVC）模式。

MVVM 的核心是 ViewModel 层，它就像是一个中转站（value converter），负责转换 Model 中的数据对象来让数据变得更容易管理和使用

该层向上与视图层进行双向数据绑定，向下与 Model 层通过接口请求进行数据交互，起呈上启下作用。

View 层展现的不是 Model 层的数据，而是 ViewModel 的数据，由 ViewModel 负责与 Model 层交互，这就完全解耦了 View 层和 Model 层，

MVVM 就是将其中的View 的状态和行为抽象化，让我们将视图 UI 和业务逻辑分开。

### 优点

双向绑定技术，当Model变化时，View-Model会自动更新，View也会自动变化。

### 缺点

数据绑定使得 Bug 很难被调试

数据双向绑定不利于代码重用



