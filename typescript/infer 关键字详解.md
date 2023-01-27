[TOC]



# 作用

`infer`这个词的含义即 推断，实际作用可以用四个字概括：**类型推导**。它会在类型未推导时进行占位，等到真正推导成功后，它能准确地返回正确的类型。

在这个条件语句 `T extends (...args: infer P) => any ? P : T` 中，`infer P` 表示待推断的函数参数。

整句含义为：如果 `T` 能赋值给 `(...args: infer P) => any`，则结果是 `(...args: infer P) => any` 类型中的参数 `P`，否则返回为 `T`。

```ts
interface User {
  name: string;
  age: number;
}

type Func = (user: User) => void;

type Param = ParamType<Func>; // Param = User
type AA = ParamType<string>; // string
```

`infer`这个关键字在各种高级类型实现中出现频率很高，大部分情况下会与`extends`、`keyof`等关键字一起使用。



# 注意点

## **`infer`只能在 extends 条件语句中使用，声明变量只能在true分支中使用**

比如我想实现上文中`ParamType`类型，他接受一个函数类型，然后返回函数参数的类型。

用如下方式实现：

```ts
type ParameType<T extends (...args: infer R) => any> = R
// error: 'infer' declarations are only permitted in the 'extends' clause of a conditional type.
```

大意就是`infer`只能在`extends`条件语句中使用，在[extends详解](https://juejin.cn/post/7106038466139389959)中我们提到`extends`关键字的使用场景大概有以下几种：**接口继承、类型约束以及条件类型**。在上述`ParameType`类型实现中，很明显这是属于类型约束的用法，想要实现该类型需要使用条件类型。

```ts
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
```

- `T extends (...args: any) => infer P`：如果不看`infer R`，这段代码实际表示： `T`是不是一个函数类型。
- `(...args: any) => infer P`：这段代码实际表示一个函数类型，把它的参数使用`args`来表示，把它的返回类型用`P`来进行占位。
- 如果`T`满足是一个函数类型，那么我们返回其函数的返回类型，也就是`P`；如果不是一个函数类型，就返回`never`

此外，**要注意`infer`声明的变量只能在`true`分支中使用**。



## **对使用了函数重载的函数进行类型推断**

函数重载或⽅法重载是使⽤相同名称和不同参数数量或类型创建多个⽅法的⼀种能⼒。一些 `JavaScript` 函数在调用的时候可以传入不同数量和类型的参数。举个例子。你可以写一个函数，返回一个日期类型 `Date`，这个函数接收一个时间戳（一个参数）或者一个 月/日/年 的格式 (三个参数)。在 `TypeScript`中，我们可以通过写重载签名 (`overlaod signatures`) 说明一个函数的不同调用方法。 我们需要写一些函数签名 (通常两个或者更多)，然后再写函数体的内容：

```ts
function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
  if (d !== undefined && y !== undefined) {
    return new Date(y, mOrTimestamp, d);
  } else {
    return new Date(mOrTimestamp);
  }
}
const d1 = makeDate(12345678);
const d2 = makeDate(5, 5, 5);
const d3 = makeDate(1, 3);
```

对使用了函数重载的函数进行类型推断时，以最后一个签名为准，因为一般这个签名是用来处理所有情况的签名。

```ts
type a = Parameters<typeof makeDate>  //type a = [m: number, d: number, y: number]
```



## **infer的位置会影响到推断的结果**

这涉及到协变与逆变，具体的区别将在之后的文章中进行讲解，这里只需要知道：协变或逆变与 `infer` 参数位置有关。在 TypeScript 中，**对象、类、数组和函数的返回值类型**都是协变关系，而**函数的参数类型**是逆变关系，所以 `infer` 位置如果在函数参数上，就会遵循逆变原则。

- **当`infer`在协变的位置上时，同一类型变量的多个候选类型将会被推断为联合类型，**

- **当`infer`在逆变的位置上时，同一类型变量的多个候选类型将会被推断为交叉类型。**

看例子：

```ts
type Foo<T> = T extends { a: infer U, b: infer U } ? U : never;
type T10 = Foo<{ a: string, b: string }>;  // string
type T11 = Foo<{ a: string, b: number }>;  // string | number
```

按照上文的规则，这应该是属于协变，因此`T11`结果是`string | number`

```ts
type Bar<T> = T extends { a: (x: infer U) => void, b: (x: infer U) => void } ? U : never;
type T20 = Bar<{ a: (x: string) => void, b: (x: string) => void }>;  // string
type T21 = Bar<{ a: (x: string) => void, b: (x: number) => void }>;  // string & number
```

同样地，`x`这里既有可能是`string`,也可能是`number`,但最终却被推断为交叉类型。这就是因为`infer`所处的是逆变的位置，即这里是在推断函数的参数类型，导致最终推导为交叉类型。



# 类型体操实战

### [First of Array](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Ftype-challenges%2Ftype-challenges%2Fblob%2Fmain%2Fquestions%2F00014-easy-first%2FREADME.md)

要求：实现一个通用`First<T>`，它接受一个数组`T`并返回它的第一个元素的类型。

实现：

```ts
type First<T extends any[]> = T extends [infer L, ...infer R] ? L : never
```

利用了`infer`声明了`L`和`R`进行占位，其中：

- `infer R`： 表示数组第一个元素的占位。
- `...infer L`: 表示数组剩余元素的占位。
- 通过`extends`判断进入`true`分支时，返回类型`L`，否则返回`never`

当然，上述实现方式是通过占位实现的，也可以通过索引的方式实现。

```ts
type First<T extends any[]> = T extends [] ? never : T[0]
```



### [Capitalize](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Ftype-challenges%2Ftype-challenges%2Fblob%2Fmain%2Fquestions%2F00110-medium-capitalize%2FREADME.md)

要求：实现 `Capitalize<T>` 它将字符串的第一个字母转换为大写，其余字母保持原样。

```ts
type capitalized = Capitalize<'hello world'> // expected to be 'Hello world'
```

实现：

```ts
type Capitalize<S extends string> = S extends `${infer L}${infer R}` ? `${Uppercase<L>}${R}`: S
```

既然有首字母大写，那么相应的首字母小写`Uncapatilize`的实现也类似：

```ts
type UnCapitalize<S extends string> = S extends `${infer L}${infer R}` ? `${Lowercase<L>}${R}`: S
```

无论首字母大写还是首字母小写，核心实现还是用`infer L`去占位，然后对其调用`Uppercase`或者`Lowercase`



### [Tuple to Union](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Ftype-challenges%2Ftype-challenges%2Fblob%2Fmain%2Fquestions%2F00010-medium-tuple-to-union%2FREADME.md)

要求：

实现泛型`TupleToUnion<T>`，返回元组所有值的类型组成的联合类型

```ts
type Arr = ['1', '2', '3']

type Test = TupleToUnion<Arr> // expected to be '1' | '2' | '3'
复制代码
```

实现：

```ts
type TupleToUnion<T extends any[]> = T[number]
```

`T[number]`：**它会自动迭代元组的数字型索引，然后将所以元素组合成一个联合类型**。

这种解法应该是比较简单直接的，`T[number]`的使用比较巧妙，但如果是第一次动手实现这样的类型，比较难想到这种解法。

如果想要用`infer`实现的话，应该如何操作呢？

```ts
type TupleToUnion<T extends any[]> = T extends [infer L, ...infer R] ? L | TupleToUnion<R> : never
```

`L | TupleToUnion<args>`：L表示每一次迭代中的第一个元素，它的迭代过程可以用下面伪代码表示：

```ts
// 第一次迭代
const L = '1'
const R = ['2', '3']
const result = '1' | TupleToUnion<args>

// 第二次迭代
const L = '2'
const R = ['3']
const result = '1' | '2' | TupleToUnion<args>

// 第三次迭代
const L = '3'
const R = ['']
const result = '1' | '2' | '3'
复制代码
```

说白了就是递归的思想，想通了也不难。

在[深入理解TypeScritp](https://link.juejin.cn?target=https%3A%2F%2Fjkchao.github.io%2Ftypescript-book-chinese%2Ftips%2Finfer.html%23%E4%B8%80%E4%BA%9B%E7%94%A8%E4%BE%8B)中看到一种解法，也很巧妙：

```ts
type TupleToUnion<T extends any[]> = T extends Array<infer R> ? R : never
```

该实现的前提是：**tuple 类型在一定条件下，是可以赋值给数组类型**

```ts
type TTuple = [string, number];
type TArray = Array<string | number>;

type Res = TTuple extends TArray ? true : false; // true
type ResO = TArray extends TTuple ? true : false; // false
```

那么，之后再利用`infer`类型推导的功能，`T extends Array<infer R>`进入`true`分支，就很容易得到想要的结果了。



### [Union to Intersection](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Ftype-challenges%2Ftype-challenges%2Fblob%2Fmain%2Fquestions%2F00055-hard-union-to-intersection%2FREADME.md)

要求：将联合类型转换为交叉类型

```ts
type I = Union2Intersection<'foo' | 42 | true> // expected to be 'foo' & 42 & true
```

这个挑战的标签是`hard`, 还是很有挑战性的。主要涉及到上述注意点中的第三点，

即：**当`infer`在逆变的位置上时，同一类型变量的多个候选类型将会被推断为交叉类型。**

直接给出`stackoverflow`上的[解答](https://link.juejin.cn?target=https%3A%2F%2Fstackoverflow.com%2Fquestions%2F50374908%2Ftransform-union-type-to-intersection-type):

```ts
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
复制代码
```

具体实现可以分为以下几个步骤：

- 利用`extends`分配条件类型语句将联合类型中的每一个处理成`(x: U) => any`这样的函数类型

- 然后利用当`infer`在逆变的位置上时，同一类型变量的多个候选类型将会被推断为交叉类型，得到想要的结果。

  其中，逆变的过程类似如下：

  ```ts
  type T1 = { name: string };
  type T2 = { age: number };
  
  type Bar<T> = T extends { a: (x: infer U) => void; b: (x: infer U) => void } ? U : never;
  // 处在逆变位置时，推导出来的为交叉类型
  type T21 = Bar<{ a: (x: T1) => void; b: (x: T2) => void }>; // T1 & T2
  ```



# 总结

1. 作用：**类型推导**，在类型未推导时进行占位，等到真正推导成功后，它能准确地返回正确的类型
2. 注意点：

- `infer`只能在 extends 条件语句中使用，声明变量只能在true分支中使用
- 对使用了函数重载的函数进行类型推断时，以最后一个签名为准，因为一般这个签名是用来处理所有情况的签名。
- 当`infer`在协变的位置上时，同一类型变量的多个候选类型将会被推断为联合类型；当`infer`在逆变的位置上时，同一类型变量的多个候选类型将会被推断为交叉类型。

