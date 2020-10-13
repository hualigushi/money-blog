## 1. 如果需要通过一系列对象构造出新对象，应尽量使用spread 操作， 可以保证生成的对象类型安全
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
## 2. keyof
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

## 3. Partial & Pick
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

## 4. Exclude
```js
type Exclude<T, U> = T extends U ? never : T;

// 相当于: type A = 'a'
type A = Exclude<'x' | 'a', 'x' | 'y' | 'z'>
```

## 5. Dictionary & Many
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

## 6. 使用 const enum 维护常量表
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
