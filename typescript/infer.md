# TypeScript 条件类型的 infer 类型推断能力

### 书写格式

使用 `infer` 声明一个类型变量，**在 条件类型判定为 true 时生效**，例如：

```ts
type ExtractSelf<T> = T extends (infer U) ? U : T;

type T1 = ExtractSelf<string>;        // string
type T2 = ExtractSelf<() => void>;    // () => void
type T3 = ExtractSelf<Date[]>;        // Date[]
type T4 = ExtractSelf<{ a: string }>; // { a: string }
```

上面的 `infer U` 语句就是声明一个类型变量 U（它可以是任意字母或单词），变量 U 会解析 T 类型。

这里的解析规则很简单： U 等于 T，然后返回 U。（根据执行优先级，这里可以去掉 infer 语法两边的括号 `()` ，而有时必须加上，例如：`(infer U)[]` ）

### 推断的规则

上面的例子只是方便我们认识它，实际场景不会这么用，因为没有意义。我们升级上面的写法，用于取出数组中的类型：

```js
type ExtractArrayItemType<T> = T extends (infer U)[] ? U : T;

// 条件判断都为 false，返回 T
type T1 = ExtractArrayItemType<string>;         // string
type T2 = ExtractArrayItemType<() => number>;   // () => number
type T4 = ExtractArrayItemType<{ a: string }>;  // { a: string }

// 条件判断为 true，返回 U
type T3 = ExtractArrayItemType<Date[]>;     // Date
```

通过解析 T 的格式，判断 `(infer U)[]` 可被分配值 `Date[]` ，因此条件类型为 true 。然后根据变量 U 所在的位置，推断 U 等于 Date。

让我们再修改一下，实现获取函数返回值类型的功能（*类似于官方预置的 ReturnType 高级类型*）：

```js
type ExtractReturnType<T> = T extends () => (infer U) ? U : T;

// 条件判断为 true，返回 U
type T1 = ExtractReturnType<() => number>;   // number
```

通过上面两个例子可以看出，`infer` 声明的类型变量所在的位置，可以匹配出任何想要的值类型。

### 推断出联合类型

假设下面这种情况，同一个类型变量存在于多个位置，且每个位置上的数据类型不同，则会推断为 联合类型：

```js
type ExtractAllType<T> = T extends { x: infer U, y: infer U } ? U : T;

type T1 = ExtractAllType<{ x: string, y: number }>; // string | number
```

这里的 `ExtractAllType<T>` 中 infer 格式中的属性是固定的 x 和 y，我们可以优化一下，让它可以接收任意数量：

```js
type ExtractAllType<T> = T extends { [k: string]: infer U } ? U : T;

type T1 = ExtractAllType<{ x: string, y: number, z: boolean }>; // string | number | boolean
```

知道这个特性后，我们再看上面提取数组中的类型的功能，实际上它还可以这么用：

```js
type ExtractArrayItemType<T> = T extends (infer U)[] ? U : T;

type ItemTypes = ExtractArrayItemType<[string, number]>; // string | number
```

这里实现了将 元组类型 转换成 联合类型。

### 函数重载的规则

重载声明的函数，始终获取最后一个声明，不过需要使用 `typeof` 功能转换下重置函数的格式：

```js
declare function foo(x: string): number;
declare function foo(x: number): string;
declare function foo(x: string | number): string | number;

type 1 = ReturnType<typeof foo>;  // string | number
```

