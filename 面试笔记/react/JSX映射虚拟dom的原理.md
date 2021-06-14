JSX最终会被编译为React.createElement()的函数调用，返回成为“React元素”的普通JS对象

这个对象就是虚拟DOM



1. JSX 就是React.createElement()语法糖
2. React.createElement() 对参数进行拆解
3. 发起ReactElement 调用生成虚拟DOM对象