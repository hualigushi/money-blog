- var  是一开始变量声明提升，然后**初始化成 undefined**，代码执行到那行的时候赋值。
- let  是一开始变量声明提升，然后**没有初始化分配内存**，代码执行到那行初始化，之后对变量继续操作是赋值。因为没有初始化分配内存，所以会报错，这是暂时性死区。
- const  是只有声明和初始化，没有赋值操作，所以不可变。
> const 只是保证了指向的内存地址不变，而不是内部数据结构不变。确保不会被其他类型的值所替代。

- **var命令和function命令声明的全局变量，依旧是顶层对象的属性；**

- **let命令、const命令、class命令声明的全局变量，不属于顶层对象的属性。**

```
 const a1 = 1;
 const a2 = 12;
 var a3 = 123;
 debugger
```

![](https://img-blog.csdnimg.cn/20190826101046525.png)







|                      | var        | let              | const      |
| -------------------- | ---------- | ---------------- | ---------- |
| 作用域               | 函数作用域 | 块级作用域       | 块级作用域 |
| 作用域内声明提升     | 有         | 无（暂时性死区） | 无         |
| 是否可重复声明       | 是         | 否               | 否         |
| 是否可重复赋值       | 是         | 是               | 否（常量） |
| 初始化时是否必需赋值 | 否         | 否               | 是         |
