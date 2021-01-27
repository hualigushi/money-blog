# 一些关键字
## extends
extends 可以用来继承一个类，也可以用来继承一个 interface，但还可以用来判断有条件类型：
`T extends U ? X : Y;`
上面的类型意思是，若 T 能够赋值给 U，那么类型是 X，否则为 Y。

原理是令 T' 和 U' 分别为 T 和 U 的实例，并将所有类型参数替换为 any，如果 T' 能赋值给 U'，则将有条件的类型解析成 X，否则为Y。
```js
type Words = 'a'|'b'|"c";

type W<T> = T extends Words ? true : false;

type WA = W<'a'>; // -> true
type WD = W<'d'>; // -> false
```
a 可以赋值给 Words 类型，所以 WA 为 true，而 d 不能赋值给 Words 类型，所以 WD 为 false。

# typeof
在 JS 中 typeof 可以判断一个变量的基础数据类型，在 TS 中，它还有一个作用，就是获取一个变量的声明类型，如果不存在，则获取该类型的推论类型。
```
interface Person {
  name: string;
  age: number;
  location?: string;
}

const jack: Person = { name: 'jack', age: 100 };
type Jack = typeof jack; // -> Person

function foo(x: number): Array<number> {
  return [x];
}

type F = typeof foo; // -> (x: number) => number[]
```
Jack 这个类型别名实际上就是 jack 的类型 Person，而 F 的类型就是 TS 自己推导出来的 foo 的类型 (x: number) => number[]。

# keyof
keyof 可以用来取得一个对象接口的所有 key 值：
```js
interface Person {
    name: string;
    age: number;
    location?: string;
}

type K1 = keyof Person; // "name" | "age" | "location"
type K2 = keyof Person[];  // "length" | "push" | "pop" | "concat" | ...
type K3 = keyof { [x: string]: Person };  // string | number
```
# infer
在条件类型语句中, 可以用 infer 声明一个类型变量并且对它进行使用，
我们可以用它获取函数的返回类型， 源码如下：
```js
type ReturnType<T> = T extends (
  ...args: any[]
) => infer R
  ? R
  : any;
```
其实这里的 infer R 就是声明一个变量来承载传入函数签名的返回值类型, 简单说就是用它取到函数返回值的类型方便之后使用。


# 内置类型别名

# 自定义类型别名
