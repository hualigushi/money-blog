[TOC]

# 1. 类型约束
在 `.jsx` 文件里，泛型可能会被当做 `jsx` 标签
```
const toArray = <T>(element: T) => [element]; // Error in .jsx file.
```
加 `extends` 可破
```
const toArray = <T extends {}>(element: T) => [element]; // No errors.
```



# 2.交叉类型

交叉类型是将多个类型合并为一个类型。 这让我们可以把现有的多种类型叠加到一起成为一种类型，它包含了所需的所有类型的特性。

在 JavaScript 中，混入是一种非常常见的模式，在这种模式中，你可以从两个对象中创建一个新对象，新对象会拥有着两个对象所有的功能。交叉类型可以让你安全的使用此种模式：

![](https://mmbiz.qpic.cn/mmbiz_png/Fq2ZIx64zaQnKAIsmhGRe5BXGhcRsKeBWIcASjXqtwJlkEtcOqOIbX7rgXfXEpVQRkO3kicfU1UShQbj5VSZ6ibw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)



# 3. 联合类型

在 JavaScript 中，你希望属性为多种类型之一，如字符串或者数组。这就是联合类型所能派上用场的地方（它使用 | 作为标记，如 string | number）。
```javascript
function formatCommandline(command: string[] | string) {
  let line = '';
  if (typeof command === 'string') {
    line = command.trim();
  } else {
    line = command.join(' ').trim();
  }
}
```



# 4. 如果需要通过一系列对象构造出新对象，应尽量使用spread 操作， 可以保证生成的对象类型安全

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


# 5. 使用 const enum 维护常量表
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
# 数组方法
`type Unshift<Tuple extends any[], Added> = [Added, ...Tuple];`

`type Shift<Tuple extends any[]> = Tuple extends [first: any, ...args: infer R] ? R : never;`

`type Push<Tuple extends any[], Added> = [...Tuple, Added];`

`type Pop<Tuple extends any[]> = Tuple extends [...args: infer R, last: any] ? R : never;`
