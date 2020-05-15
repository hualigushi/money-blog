- let/const 也存在变量声明提升，只是没有初始化分配内存。 一个变量有三个操作，声明(提到作用域顶部)，初始化(赋默认值)，赋值(继续赋值)。
- var  是一开始变量声明提升，然后初始化成 undefined，代码执行到那行的时候赋值。
- let  是一开始变量声明提升，然后没有初始化分配内存，代码执行到那行初始化，之后对变量继续操作是赋值。因为没有初始化分配内存，所以会报错，这是暂时性死区。
- const  是只有声明和初始化，没有赋值操作，所以不可变。
> const 只是保证了指向的内存地址不变，而不是内部数据结构不变。确保不会被其他类型的值所替代。





```
 var a='shen';
        // *************
        // const / let  声明全局变量没有挂载到window上，用this访问不到
        const c = 'yu'
        let b = 'qiang'
        //***************
        function foo () {
            console.log(this)
            console.log(this.a) //'shen'
            console.log(this.b)//undefined
            console.log(this.c)//undefined
        }
        foo();
```



**var命令和function命令声明的全局变量，依旧是顶层对象的属性；**

**let命令、const命令、class命令声明的全局变量，不属于顶层对象的属性。也就是说，从 ES6 开始，全局变量将逐步与顶层对象的属性脱钩。**

```
 const a1 = 1;
    const a2 = 12;
    var a3 = 123;
    debugger
```

![](https://img-blog.csdnimg.cn/20190826101046525.png)

在图中可以看到，在全局作用域中，用let和const声明的全局变量并没有在全局对象中，只是在一个块级作用域（Script）中。