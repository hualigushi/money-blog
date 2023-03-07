constructor方法是类的构造函数的默认方法。通过new生成对象实例时，自动调用该方法。
 constructor中定义的属性为实例属性(this对象上) 

constructor外声明的属性都是定义在原型上面，可以称为原型属性(class上) 调用super()对父类进行初始化 这个两种调用和不调用的区别：

```
1、如果不需要 在 constructor里面使用 this.props ，是可以不用给super传props的
2、如果不要在constructor写逻辑，仅仅是写一个super(props)，实际上整个constructor都没有写的必要
```


