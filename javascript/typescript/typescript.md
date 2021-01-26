# 1. TypeScript 类型推导
```
function add (a:number, b: number) {
    return a + b
}
```
如果想获取函数整体的类型那么可以借助typeof `type AddFn = typeof add`

借助类型推导和ReturnType就可以获取返回值类型 `type returnType = ReturnType<typeof add> // number`

# 2. 元组

有时候我们可能需要批量的来获取参数，并且每一个参数的类型还不一样，我们可以声明一个元组如：
```
function query(...args:[string, number, boolean]){
  const d: string = args[0];
  const n: number = args[1];
  const b: boolean = args[2];
}
```

# 3. Omit
有时候我们需要复用一个类型，但是又不需要此类型内的全部属性，因此需要剔除某些属性，这个时候Omit就派上用场了。
```
interface User {
    username: string
    id: number
    token: string
    avatar: string
    role: string
}
type UserWithoutToken = Omit<User, 'token'>
```
这个方法在React中经常用到，当父组件通过props向下传递数据的时候，通常需要复用父组件的props类型，但是又需要剔除一些无用的类型。

# 4. Record

Record允许从Union类型中创建新类型，Union类型中的值用作新类型的属性。
举个简单的例子，比如我们要实现一个简单的汽车品牌年龄表，一下写法貌似没有问题。
```
type Car = 'Audi' | 'BMW' | 'MercedesBenz'

const cars = {
    Audi: { age: 119 },
    BMW: { age: 113 },
    MercedesBenz: { age: 133 },
}
```
虽然这个写法没问题，但是有没有考虑过类型安全的问题？

比如：

- 我们忘记写了一个汽车品牌，他会报错吗？
- 我们拼写属性名错误了，它会报错吗？
- 我们添加了一个非上述三个品牌的品牌进去，他会报错吗？
- 我们更改了其中一个品牌的名字，他会有报错提醒吗？

上述这种写法统统不会，这就需要Record的帮助。
```
type Car = 'Audi' | 'BMW' | 'MercedesBenz'
type CarList = Record<Car, {age: number}>

const cars: CarList = {
    Audi: { age: 119 },
    BMW: { age: 113 },
    MercedesBenz: { age: 133 },
}
```
当拼写错误，少一个品牌，添加了一个非约定好的品牌进去，都会报错

在实战项目中尽量多用Record，它会帮助你规避很多错误，在vue或者react中有很多场景选择Record是更优解。

# 5. 类型约束
在 `.jsx` 文件里，泛型可能会被当做 `jsx` 标签
```
const toArray = <T>(element: T) => [element]; // Error in .jsx file.
```
加 `extends` 可破
```
const toArray = <T extends {}>(element: T) => [element]; // No errors.
```

# 6.交叉类型

交叉类型是将多个类型合并为一个类型。 这让我们可以把现有的多种类型叠加到一起成为一种类型，它包含了所需的所有类型的特性。

在 JavaScript 中，混入是一种非常常见的模式，在这种模式中，你可以从两个对象中创建一个新对象，新对象会拥有着两个对象所有的功能。交叉类型可以让你安全的使用此种模式：

![](https://mmbiz.qpic.cn/mmbiz_png/Fq2ZIx64zaQnKAIsmhGRe5BXGhcRsKeBWIcASjXqtwJlkEtcOqOIbX7rgXfXEpVQRkO3kicfU1UShQbj5VSZ6ibw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

# 7. 联合类型

在 JavaScript 中，你希望属性为多种类型之一，如字符串或者数组。这就是联合类型所能派上用场的地方（它使用 | 作为标记，如 string | number）。
```
function formatCommandline(command: string[] | string) {
  let line = '';
  if (typeof command === 'string') {
    line = command.trim();
  } else {
    line = command.join(' ').trim();
  }
}
```

# 8. 类型别名

类型别名会给一个类型起个新名字，类型别名有时和接口很像，但是可以作用于原始值，联合类型，元组以及其它任何你需要手写的类型。

类型别名可以是泛型
```
type Container<T> = { value: T };
```
也可以使用类型别名来在属性里引用自己：
```
type Tree<T> = {
    value: T;
    left: Tree<T>;
    right: Tree<T>;
}
```
类型别名看起来跟interface非常像，那么应该如何区分两者？

interface只能用于定义对象类型，而type的声明方式除了对象之外还可以定义交叉、联合、原始类型等，类型声明的方式适用范围显然更加广泛。

但是interface也有其特定的用处：

- interface 方式可以实现接口的 extends 和 implemenjs
- interface 可以实现接口合并声明
```
type Alias = { num: number }
interface Interface {
    num: number;
}
declare function aliased(arg: Alias): Alias;
declare function interfaced(arg: Interface): Interface;
```
此外，接口创建了一个新的名字，可以在其它任何地方使用。 

类型别名并不创建新名字—比如，错误信息就不会使用别名。 

在下面的示例代码里，在编译器中将鼠标悬停在interfaced上，显示它返回的是Interface，但悬停在aliased上时，显示的却是对象字面量类型。

![](https://mmbiz.qpic.cn/mmbiz_png/Fq2ZIx64zaQnKAIsmhGRe5BXGhcRsKeBpm7E5guNQzsWlyVU9NH2BgS7QPsyPCQNCSLFRmNNWfV0AMXdFIMQ8Q/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# 1. 如果需要通过一系列对象构造出新对象，应尽量使用spread 操作， 可以保证生成的对象类型安全
```js
const pt = { x:3, y: 4}
const id = { name: 'point'}
const namedpoint = {...pt, ...id}
namedpoint.name // 正常
```
如果是需要合并部分属性,则需要配合Partial使用
```js
const pt = { x:3, y: 4}
const id = { name: 'point'}
function merge<T extends object, U extends object>(x: T, y: U): T & Partial<U>  {
  return {...x,...y}
}
const p = merge(pt, id)
p.name // 类型为string | undefined
```
# 2. keyof
```js
interface Point {
    x: number;
    y: number;
}

// type keys = "x" | "y"
type keys = keyof Point;
```
假设有一个 object 如下所示，我们需要使用 typescript 实现一个 get 函数来获取它的属性值
```js
const data = {
  a: 3,
  hello: 'world'
}

function get(o: object, name: string) {
  return o[name]
}

// 优化
function get<T extends object, K extends keyof T>(o: T, name: K): T[K] {
  return o[name]
}
```

# 3. Partial & Pick
```js
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

interface User {
  id: number;
  age: number;
  name: string;
};

// 相当于: type PartialUser = { id?: number; age?: number; name?: string; }
type PartialUser = Partial<User>

// 相当于: type PickUser = { id: number; age: number; }
type PickUser = Pick<User, "id" | "age">
```

# 4. Exclude
```js
type Exclude<T, U> = T extends U ? never : T;

// 相当于: type A = 'a'
type A = Exclude<'x' | 'a', 'x' | 'y' | 'z'>
```

# 5. Dictionary & Many
```js
interface Dictionary<T> {
  [index: string]: T;
};

interface NumericDictionary<T> {
  [index: number]: T;
};

const data:Dictionary<number> = {
  a: 3,
  b: 4
}
```

# 6. 使用 const enum 维护常量表
相比使用字面量对象维护常量，const enum 可以提供更安全的类型检查
```js
// 使用 object 维护常量
const enum TODO_STATUS {
    TODO = 'TODO',
    DONE = 'DONE',
    DOING = 'DOING'
}

function todos (status:keyof typeof TODO_STATUS): string｛  
    return TODO_STATUS[status as keyof typeof TODO_STATUS]
｝
```
