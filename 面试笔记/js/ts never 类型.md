never 类型表示的是那些永不存在的值的类型。 例如， never 类型是那些总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型； 变量也可能是 never 类型，当它们被永不为真的类型保护所约束时。 never 类型是任何类型的子类型，也可以赋值给任何类型；然而，没有类型是 never 的子类型或可以赋值给 never 类型（除了 never 本身之外）。 即使 any 也不可以赋值给 never。

-----------------------------------------------------------------------------------------------------------------------------------------------------------
 当类型存在冲突的时候，成员之间会继续合并，比如：

```
interface iProps1 {
  size: string;
}
interface iProps2 {
  size: number;
}
type iProps = iProps1 & iProps2;
let props: iProps = {
  size: 'ddd',
};
```

合并后 iProps 将如下：

```
type iProps = {
  size: string & number;
};
```

显然，string & number 这种类型是不存在的，所以等价于

```
type iProps = {
  size: never;
};
```

 ----------------------------------------------------------------------------------------------------------------------------------------------------------

当你有一个联合类型:

```
type AllType = 'a' | 'b';
```

在 switch 当中判断 type，TS 是可以收窄类型的 (discriminated union)：

```
function handleValue(val: AllType) {
  switch (val) {
    case 'a':
      // val 在这里收窄为 'a'
      break;
    case 'b':
      // val 在这里收窄为 'b'
      break;
    default:
      // val 在这里收窄为 never
      const exhaustiveCheck: never = val;
      break;
  }
}
```

注意在 default 里面我们把被收窄为 never 的 val 赋值给一个显式声明为 never 的变量。如果一切逻辑正确，那么这里应该能够编译通过。 但是假如后来有一天你修改了 AllType 的类型：

```
type AllType = 'a' | 'b' | 'c';
```

如果忘记了在 handleValue 里面加上针对 'c' 的处理逻辑，这个时候在 default 里面 val 会被收窄为 'c'，导致无法赋值给 never，产生一个错误。



![img](https://user-gold-cdn.xitu.io/2020/4/27/171bc3671d62df18?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

所以通过这个办法，你可以确保 handleValue 总是穷尽了所有 AllType 的可能类型。