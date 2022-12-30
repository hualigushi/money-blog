# 基础约束
为了适应读者可能有的不同的约束严格程度，这里将规则拆分为基础约束与严格约束部分，基础约束的规则以语法统一（包括实际代码与类型部分）为主，推荐所有人在所有项目中使用

## array-type
TypeScript 中支持使用 Array<T> 与 T[] 的形式声明数组类型，此规则约束项目中对这两种数组类型的声明。

其支持的配置：

- 仅使用 Array<T> 或 T[] 其中一种
- 对于原始类型与类型别名使用 T[]，对于对象类型、函数类型等使用 Array<T>（推荐）  
  
为什么？：对于这种效果完全一致的语法，我们需要的只是确定一个规范然后在所有地方使用这一规范。  
实际上，这一类规则（还有后面的类型断言语法）就类似于单引号/双引号，加不加分号这种基础规则，  
如果你不能接受上一行代码单引号这一行代码双引号，那么也没理由能接受这里一个 Array<number> 那里一个 number[]，另外，我个人推荐统一使用 []。

## await-thenable
只允许对异步函数、Promise、PromiseLike 使用 await 调用

为什么：避免无意义的 await 调用。

## ban-ts-comment
禁止 @ts- 指令的使用，或者允许其在提供了说明的情况下被使用，如：
```
// @ts-expect-error 这里的类型太复杂，日后补上
// @ts-nocheck 未完成迁移的文件
```
此规则推荐与 `prefer-ts-expect-error` 搭配使用，详见下方。

为什么：如果说乱写 any 叫 AnyScript，那么乱写 @ts-ignore 就可以叫 IgnoreScript 了。

## ban-types
禁止部分值被作为类型标注，此规则能够对每一种被禁用的类型提供特定的说明来在触发此规则报错时给到良好的提示，场景如禁用 {}、Function、object 这一类被作为类型标注，

为什么？使用 {} 会让你寸步难行：类型 {} 上不存在属性 'foo'，所以用了 {} 你大概率在下面还需要类型断言回去或者变 any，使用 object Function 毫无意义。

- 对于未知的对象类型，应使用 Record<string, unknown>
- 对于函数类型，应使用入参、返回值被标注出来的具体类型：`type SomeFunc = (arg1: string) => void` ，或在未知的场景下使用 `type SomeFunc = (...args: any[]) => any`。
	
## consistent-type-assertions
TypeScript 支持通过 as 与 <> 两种不同的语法进行类型断言，如：
```
const foo = {} as Foo;
const foo = <Foo>{};
// 类似的还有常量断言
const foo = <const>[1, 2];
const foo = [1, 2, 3] as const;
```
这一规则约束使用统一的类型断言语法，我个人一般在 Tsx 中使用 as ，在其他时候尽可能的使用 <>，原因则是 <> 更加简洁。

为什么：类似于 `array-type`，做语法统一，但需要注意的是在 Tsx 项目中使用 <> 断言会导致报错，因为不像泛型可以通过 `<T extends Foo>` 来显式告知编译器这里是泛型语法而非组件。

## consistent-type-definitions
TypeScript 支持通过 type 与 interface 声明对象类型，此规则可将其收束到统一的声明方式，即仅使用其中的一种。

为什么：先说我是怎么做得：在绝大部分场景下，使用 `interface` 来声明对象类型，`type` 应当用于声明联合类型、函数类型、工具类型等，如：
```
interface IFoo {}

type Partial<T> = {
    [P in keyof T]?: T[P];
};

type LiteralBool = "true" | "false";
```
原因主要有这么几点：

- 配合 `naming-convention` 规则（能够用于检查接口是否按照规范命名），我们能够在看见 IFoo 时立刻知道它是一个 接口，看见 Bar 时立刻知道它是一个类型别名，配置：
```{ "@typescript-eslint/naming-convention": [ "error", { selector: "interface", format: ["PascalCase"], custom: { regex: "^I[A-Z]", match: true, }, }, ], }```
- 接口在类型编程中的作用非常局限，仅支持 extends、泛型 等简单的能力，也应当只被用于定义确定的结构体。而 Type Alias 能够使用除 extends 以外所有常见的映射类型、条件类型等类型编程语法。同时，“类型别名”的含义也意味着你实际上是使用它来归类类型（联合类型）、抽象类型（函数类型、类类型）。
	
## explicit-module-boundary-types
函数与类方法的返回值需要被显式的指定，而不是依赖类型推导，如：

`const foo = (): Foo => {}`
	
为什么：通过显式指定来直观的区分函数的功能，如副作用等，同时显式指定的函数返回值也能在一定程度上提升 `TypeScript Compiler` 性能。

## method-signature-style
方法签名的声明方式有 method 与 property 两种，区别如下：
```
// method
interface T1 {
	func(arg: string): number;
}

// property
interface T2 {
  func: (arg: string) => number;
}
```
此规则将声明方式进行约束，推荐使用第二种的 property 方式。

为什么：首先，这两种方式被称为 method 与 property 很明显是因为其对应的写法，

	method 方式类似于在 Class 中定义方法，而 property 则是就像定义普通的接口属性，只不过它的值是函数类型。
	
	推荐使用 property 的最重要原因是，通过使用 属性 + 函数值 的方式定义，作为值的函数的类型能享受到更严格的类型校验（ strictFunctionTypes），此配置会使用逆变（contravariance）而非协变（covariance）的方式进行函数参数的检查，关于协变与逆变我后续会单独的写一篇文章，这里暂时不做展开，如果你有兴趣，可以阅读 TypeScript类型中的逆变协变。

## no-extra-non-null-assertion
不允许额外的重复非空断言：
```
// x
function foo(bar: number | undefined) {
  const bar: number = bar!!!;
}
```
为什么：额，why not？

## prefer-for-of
在你使用 for 循环遍历数组时，如果索引仅仅用来访问数组成员，则应该替换为 `for...of`。

为什么：如果不是为了兼容性场景，在这种场景下的确没有必要使用 for 循环。

## prefer-nullish-coalescing && prefer-optional-chain
使用 `??` 而不是 `||`，使用 `a?.b` 而不是 `a && a.b`。

为什么：逻辑或 `||` 会将 0 与 "" 视为 false 而导致错误的应用默认值，而可选链相比于逻辑与 && 则能够带来更简洁的语法（尤其是在属性访问嵌套多层，或值来自于一个函数时，如 `document.querySelector`），以及与 `??` 更好的协作：`const foo = a?.b?.c?.d ?? 'default'`;。

## consistent-type-imports
约束使用 import type {} 进行类型的导入，如：
```
// √
import type { CompilerOptions } from 'typescript';

// x
import { CompilerOptions } from 'typescript';
```
为什么：`import type` 能够帮助你更好的组织你的项目头部的导入结构（虽然 TypeScript 4.5 支持了类型与值的混合导入：import { foo, type Foo }，但还是推荐通过拆分值导入与类型导入语句来获得更清晰地项目结构）。 值导入与类型导入在 TypeScript 中使用不同的堆空间来存放，因此无须担心循环依赖（所以你可以父组件导入子组件，子组件导入定义在父组件中的类型这样）。

一个简单的、良好组织了导入语句的示例：

import { useEffect } from 'react';

import { Button, Dialog } from 'ui';
import { ChildComp } from './child';

import { store } from '@/store'
import { useCookie } from '@/hooks/useCookie';
import { SOME_CONSTANTS } from '@/utils/constants';

import type { Foo } from '@/typings/foo';
import type { Shared } from '@/typings/shared';

import styles from './index.module.scss';
no-empty-interface
不允许定义空的接口，可配置为允许单继承下的空接口：

// x
interface Foo {}

// √
interface Foo extends Bar {}
为什么：没有父类型的空接口实际上就等于 {}，虽然我不确定你使用它是为了什么，但我能告诉你这是不对的。而单继承的空接口场景则是较多的，如先确定下继承关系再在后续添加成员。

no-explicit-any
不允许显式的any。

实际上这条规则只被设置为 warn 等级，因为真的做到一个 any 不用或是全部替换成 unknown + 类型断言 的形式成本都非常高。
推荐配合 tsconfig 的 --noImplicitAny （检查隐式 any）来尽可能的保证类型的完整与覆盖率。

no-inferrable-types
不允许不必要的类型标注，但可配置为允许类的属性成员、函数的属性成员进行额外标注。

const foo: string = "linbudu";

class Foo {
	prop1: string = "linbudu";
}

function foo(a: number = 5, b: boolean = true) {
  // ...
}
为什么：对于普通变量来说，与实际赋值一致的类型标注确实是没有意义的，TypeScript 的控制流分析能很好地做到这一点，而对于函数参数与类属性，主要是为了确保一致性，即函数的所有参数（包括重载的各个声明）、类的所有属性都有类型标注，而不是仅为没有初始值的参数/属性进行标注。

no-non-null-asserted-nullish-coalescing
不允许非空断言与空值合并同时使用： bar! ?? tmp

为什么：冗余

no-non-null-asserted-optional-chain
不允许非空断言与可选链同时使用： foo?.bar!

为什么：和上一条规则一样属于冗余，同时意味着你对 ! ?? ?. 的理解存在着不当之处。

no-throw-literal
不允许直接 throw 一个字符串如：throw 'err'，只能抛出 Error 或基于 Error 派生类的实例，如：throw new Error('Oops!')。

为什么：抛出的 Error 实例能够自动的收集调用栈信息，同时借助 proposal-error-cause 提案还能够跨越调用栈来附加错误原因传递上下文信息，不过，真的会有人直接抛出一个字符串吗？？

no-unnecessary-boolean-literal-compare
不允许对布尔类型变量的 === 比较，如：

declare const someCondition: boolean;
if (someCondition === true) {
}
为什么：首先，记住我们是在写 TypeScript，所以不要想着你的变量值还有可能是 null 所以需要这样判断，如果真的发生了，那么说明你的 TS 类型标注不对哦。而且，此规则的配置项最多允许 boolean | null 这样的值与 true/false 进行比较，所以还是让你的类型更精确一点吧。

no-unnecessary-type-arguments
不允许与默认值一致的泛型参数，如：

function foo<T = number>() {}
foo<number>();
为什么：出于代码简洁考虑。

no-unnecessary-type-assertion
不允许与实际值一致的类型断言，如：const foo = 'foo' as string。

为什么：你懂的。

no-unnecessary-type-constraint
不允许与默认约束一致的泛型约束，如：interface FooAny<T extends any> {}。

为什么：同样是出于简化代码的考虑，在 TS 3.9 版本以后，对于未指定的泛型约束，默认使用 unknown ，在这之前则是 any，知道这一点之后你就没必要再多写 extends unknown 了。

non-nullable-type-assertion-style
此规则要求在类型断言仅起到去空值作用，如对于 string | undefined 类型断言为 string时，将其替换为非空断言 !

const foo:string | undefined = "foo";

// √
foo!;
// x
foo as string;
为什么：当然是因为简化代码了！此规则的本质是检查经过断言后的类型子集是否仅剔除了空值部分，因此无需担心对于多种有实际意义的类型分支的联合类型误判。

prefer-as-const
对于常量断言，使用 as const 而不是 <const>，这一点类似于上面的 consistent-type-assertions 规则。

prefer-literal-enum-member
对于枚举成员值，只允许使用普通字符串、数字、null、正则，而不允许变量复制、模板字符串等需要计算的操作。

为什么：虽然 TypeScript 是允许使用各种合法表达式作为枚举成员的，但由于枚举的编译结果拥有自己的作用域，因此可能导致错误的赋值，如：

const imOutside = 2;
const b = 2;
enum Foo {
  outer = imOutside,
  a = 1,
  b = a,
  c = b,
}
这里 c == Foo.b == Foo.c == 1，还是 c == b == 2 ? 观察下编译结果：

"use strict";
const imOutside = 2;
const b = 2;
var Foo;
(function (Foo) {
    Foo[Foo["outer"] = imOutside] = "outer";
    Foo[Foo["a"] = 1] = "a";
    Foo[Foo["b"] = 1] = "b";
    Foo[Foo["c"] = 1] = "c";
})(Foo || (Foo = {}));
懂伐小老弟？

prefer-ts-expect-error
使用 @ts-expect-error 而不是 @ts-ignore。

为什么： @ts-ignore 与 @ts-expect-error 二者的区别主要在于，前者是 ignore，是直接放弃了下一行的类型检查而无论下一行是否真的有错误，后者则是期望下一行确实存在一个错误，并且会在下一行实际不存在错误时抛出一个错误。

这一类干涉代码检查指令的使用本就应该慎之又慎，在任何情况下都不应该被作为逃生舱门（因为它真的比 any 还好用），如果你一定要用，也要确保用的恰当。

promise-function-async
返回 Promise 的函数必须被标记为 async，此规则能够确保函数的调用方只需要处理 try/catch 或者 rejected promise 的情况。

为什么：还用解释吗？

restrict-template-expressions
模板字符串中的计算表达式其返回值必须是字符串，此规则可以被配置为允许数字、布尔值、可能为 null 的值以及正则表达式，或者你也可以允许任意的值，但这样就没意思了...

为什么：在模板表达式中非字符串与数字以外的值很容易带来潜在的问题，如：

const arr = [1, 2, 3];
const obj = { name: 'linbudu' };

// 'arr: 1,2,3'
const str1 = `arr: ${arr}`;
// 'obj: [object Object]'
const str2 = `obj: ${obj}`;
无论哪种情况都不会是你想看到的，因为这实际上已经脱离了你的掌控。推荐在规则配置中仅开启 allowNumber 来允许数字，而禁止掉其他的类型，你所需要做得应当是在把这个变量填入模板字符串中时进行一次具有实际逻辑的转化。

switch-exhaustiveness-check
switch 的判定条件为 联合类型 时，其每一个类型分支都需要被处理。如：

type PossibleTypes = 'linbudu' | 'qiongxin' | 'developer';

let value: PossibleTypes;
let result = 0;

switch (value) {
  case 'linbudu': {
    result = 1;
    break;
  }
  case 'qiongxin': {
    result = 2;
    break;
  }
  case 'developer': {
    result = 3;
    break;
  }
}
为什么：工程项目中经常出现的，导致问题发生的原因就是有部分功能逻辑点仅通过口口相传，只看代码你完全不知道自己还漏了什么地方。如联合类型变量中每一条类型分支可能都需要特殊的处理逻辑。

你也可以通过 TypeScript 中的 never 类型来实现实际代码的检验：

const strOrNumOrBool: string | number | boolean = false;

if (typeof strOrNumOrBool === "string") {
  console.log("str!");
} else if (typeof strOrNumOrBool === "number") {
  console.log("num!");
} else if (typeof strOrNumOrBool === "boolean") {
  console.log("bool!");
} else {
  const _exhaustiveCheck: never = strOrNumOrBool;
  throw new Error(`Unknown input type: ${_exhaustiveCheck}`);
}
这里通过编译时与运行时做了两重保障，确保为联合类型新增类型分支时也需要被妥善的处理，你可以参考开头的 never 类型 文章了解更多 never 相关的使用。除了联合类型以外，你还可以通过 never 类型来确保每一个枚举成员都需要处理。

enum PossibleType {
  Foo = "Foo",
  Bar = "Bar",
  Baz = "Baz",
}

function checker(input: PossibleType) {
  switch (input) {
    case PossibleType.Foo:
      console.log("foo!");
      break;
    case PossibleType.Bar:
      console.log("bar!");
      break;
    case PossibleType.Baz:
      console.log("baz!");
      break;
    default:
      const _exhaustiveCheck: never = input;
      break;
  }
}
以上就是我们目前在使用的部分规则，还有一批规则或是涉及到高度的定制或是适用场景狭窄，这
