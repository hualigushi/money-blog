# null
- null表示‘无’，转为数值是0，空指针对象 
- 给全局变量赋值null，相当于将这个变量的指针对象和值清空。 
- 如果给对象属性和局部变量赋值null，给这个属性分配了空的内存，值为null 
  JS会回收值为null的对象
- null 是 保留字

# undefined
- undefined表示‘无的初始值’，变为数值为NaN 
- 给全局变量赋值undefined，相当于将这个值清空，但是对象仍旧存在。 
- 如果给对象属性和局部变量赋值undefined，说明这个值是空值。
- undefined 是 变量



## typeof null 等于 Object

```
typeof null==='object'  //true
null instanceof Object  //false
```

null 不是对象

不同的对象在底层原理的存储是用二进制表示的，在 javaScript中，如果二进制的前三位都为 0 的话，系统会判定为是 Object类型。null的存储二进制是 000，也是前三位，所以系统判定 null为 Object类型。

扩展：

这个 bug 个第一版的 javaScript留下来的。其他的几个类型标志位：

- 000：对象类型。
- 1：整型，数据是31位带符号整数。
- 010：双精度类型，数据是双精度数字。
- 100：字符串，数据是字符串。
- 110：布尔类型，数据是布尔值。



