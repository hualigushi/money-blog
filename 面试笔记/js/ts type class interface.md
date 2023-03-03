# class interface 

在面向对象语言中，接口Interfaces是一个很重要的概念，它是对行为的抽象，而具体如何行动需要由类class去实现implements。

在TS中class和interface都可以用来约束数据的结构，但是频繁使用class约束数据结构会使程序的性能受到影响

 - interface是仅存在于TS上下文中的一种虚拟结构，TS编译器依赖接口用于类型检查，最终编译为JS后，接口将会被移除。

 - 与interface不同，class作为TS的一种变量类型存在于上下文之中，class中可以提供，变量、方法等的具体实现方式等，它的作用不仅仅是约束数据结构。

`class Person implements Account`

为何Interface需要预先定义, 而后又去实现它, 为何不可以直接实现呢?

其实主要有两方面的考虑:

规范, 接口其实是一种规范, 通常用来:定义规范(或数据结构), 必须遵守该规范

程序设计, 接口中定义了类必须实现的方法和属性, 以达到规范和具体实现分离, 增强系统的可拓展性和可维护性.



#### 什么时候使用class

- 是否需要创建多个实例
- 是否需要使用继承
- 是否需要特定的单例对象



#### 什么时候使用interface

对于从服务器端获取或者业务场景中模拟的数据，提倡使用interface去定义，这些数据通常是不会经常变化和调整的，这些数据可能仅仅只表示某些状态，或者是UI上的文本。

在实际场景中，我们可以给class的参数指定好interface类型用来初始化class中的属性



# type interface

##### 相同点

都可以用来描述一个函数或对象, 如:
```ts
// TypeAndInterface.ts
interface Person{
  name: string;
  age: number;
  getName():string;
}
type Person1 = {
  name: string;
  age: number;
  getName(): string;
}
```
可以使用extends继承
```ts
// TypeAndInterface.ts
interface Person {
  name: string
  age: number
  getName(): string
}
type Person1 = {
  name: string
  age: number
  getName(): string
}

// type继承type声明的接口
type Person2 = {
  firstName: string
  lastName: string
}
type User = Person2 & { age: number }

// interface继承type声明的接口
interface User1 extends Person2 {
  age: number
}

// type继承interface声明的接口
type User2 = User1 & { getFullName(): void }
```
##### 不同点

type可以声明特定类型, 如:

- 基本数据类型的别名
- 联合类型
- 元组等类型
- 可以使用typeof获取实例的类型并进行赋值
```
// TypeAndInterface.ts

/**
 type可以声明基本类型别名, 联合类型, 元组等类型, 也可以通过使用typeof获取实例的类型进行赋值
 */
// 基本数据类型的别名
type Str = string

// 联合类型
type StrOrNumber = string | number
type Message = string | { text: string }
type Tree<T> = T | {left: Tree<T>, right: Tree<T>}

// 元组
// 具体指定UserArr的每个位置的数据类型
type UserArr = [string, number]
let demo: UserArr = ['hello', 30] // 只可以被依次赋值为: string, number, 否则会报错

type Arr<T> = [T, T];
type Coords = Arr<number>

// 使用typeof获取实例的类型, 并进行赋值
const img = window.document.createElement('img')
type ImgElement = typeof img
```
interface可以声明合并
```
// TypeAndInterface.ts

// interfact可以声明合并
interface Man {
  name: string
  age: number
}

interface Man {
  sex: string
}

/**
 * 等价于:
 interface Man{
   name: string;
   age: number;
   sex: string;
 }
 */
```

> 注意: 在项目中并不建议大家这么使用.

何时使用type/interface

在不确定使用type/interface时, 请优先考虑使用interface, 若interface无法满足需求时, 才考虑使用type.

