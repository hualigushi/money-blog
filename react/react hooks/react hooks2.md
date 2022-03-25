[TOC]



# hooks依赖

如果发现依赖数组依赖过多，我们就需要重新审视自己的代码。

- 依赖数组依赖的值最好不要超过 3 个，否则会导致代码会难以维护。
- 如果发现依赖数组依赖的值过多，我们应该采取一些方法来减少它。
- 去掉不必要的依赖。
- 将 Hook 拆分为更小的单元，每个 Hook 依赖于各自的依赖数组。
- 通过合并相关的 state，将多个依赖值聚合为一个。
- 通过 `setState` 回调函数获取最新的 state，以减少外部依赖。
- 通过 ref 来读取可变变量的值，不过需要注意控制修改它的途径。



# `useMemo`

`useMemo`本身也有开销。

`useMemo` 会「记住」一些值，同时在后续 render 时，将依赖数组中的值取出来和上一次记录的值进行比较，

如果不相等才会重新执行回调函数，否则直接返回「记住」的值。

这个过程本身就会消耗一定的内存和计算资源。因此，过度使用 `useMemo` 可能会影响程序的性能。

`useMemo` 适用的场景：

- 有些计算开销很大，我们就需要「记住」它的返回值，避免每次 render 都去重新计算。
- 由于值的引用发生变化，导致下游组件重新渲染，我们也需要「记住」这个值。



让我们来看个例子：

```ts
interface IExampleProps {
  page: number;
  type: string;
}

const Example = ({page, type}: IExampleProps) => {
  const resolvedValue = useMemo(() => {
    return getResolvedValue(page, type);
  }, [page, type]);

  return <ExpensiveComponent resolvedValue={resolvedValue}/>;
};
```

在上面的例子中，渲染 `ExpensiveComponent` 的开销很大。

所以，当 `resolvedValue` 的引用发生变化时，作者不想重新渲染这个组件。

因此，作者使用了 `useMemo`，避免每次 render 重新计算 `resolvedValue`，导致它的引用发生改变，从而使下游组件 re-render。

这个担忧是正确的，但是使用 `useMemo` 之前，我们应该先思考两个问题：

1. 传递给 `useMemo` 的函数开销大不大？在上面的例子中，就是考虑 `getResolvedValue` 函数的开销大不大。

   JS 中大多数方法都是优化过的，比如 `Array.map`、`Array.forEach` 等。

   如果你执行的操作开销不大，那么就不需要记住返回值。

   否则，使用 `useMemo` 本身的开销就可能超过重新计算这个值的开销。

   因此，对于一些简单的 JS 运算来说，我们不需要使用 `useMemo` 来「记住」它的返回值。

2. 当输入相同时，「记忆」值的引用是否会发生改变？

   在上面的例子中，就是当 `page` 和 `type` 相同时，`resolvedValue` 的引用是否会发生改变？

   这里我们就需要考虑 `resolvedValue` 的类型了。

   如果 `resolvedValue` 是一个对象，由于我们项目上使用「函数式编程」，每次函数调用都会产生一个新的引用。

   但是，如果 `resolvedValue` 是一个原始值（`string`, `boolean`, `null`, `undefined`, `number`, `symbol`），也就不存在「引用」的概念了，每次计算出来的这个值一定是相等的。

   也就是说，`ExpensiveComponent` 组件不会被重新渲染。

因此，如果 `getResolvedValue` 的开销不大，并且 `resolvedValue` 返回一个字符串之类的原始值，那我们完全可以去掉 `useMemo`，就像下面这样：

```ts
interface IExampleProps {
  page: number;
  type: string;
}

const Example = ({page, type}: IExampleProps) => {
  const resolvedValue = getResolvedValue(page, type);
  return <ExpensiveComponent resolvedValue={resolvedValue}/>;
};
```

还有一个误区就是对创建函数开销的评估。

有的人觉得在 render 中创建函数可能会开销比较大，为了避免函数多次创建，使用了 `useMemo` 或者 `useCallback`。

但是对于现代浏览器来说，创建函数的成本微乎其微。

因此，我们没有必要使用 `useMemo` 或者 `useCallback` 去节省这部分性能开销。

当然，如果是为了保证每次 render 时回调的引用相等，你可以放心使用 `useMemo` 或者 `useCallback`。



一、应该使用 `useMemo` 的场景

1. 保持引用相等

- 对于组件内部用到的 object、array、函数等，如果用在了其他 Hook 的依赖数组中，或者作为 props 传递给了下游组件，应该使用 `useMemo`。
- 自定义 Hook 中暴露出来的 object、array、函数等，都应该使用 `useMemo` 。以确保当值相同时，引用不发生变化。
- 使用 `Context` 时，如果 `Provider` 的 value 中定义的值（第一层）发生了变化，即便用了 Pure Component 或者 `React.memo`，仍然会导致子组件 re-render。这种情况下，仍然建议使用 `useMemo` 保持引用的一致性。

2. 成本很高的计算

- - 比如 `cloneDeep` 一个很大并且层级很深的数据

    

二、无需使用 `useMemo` 的场景

1. 如果返回的值是原始值： `string`, `boolean`, `null`, `undefined`, `number`, `symbol`（不包括动态声明的 Symbol），一般不需要使用 `useMemo`。
2. 仅在组件内部用到的 object、array、函数等（没有作为 props 传递给子组件），且没有用到其他 Hook 的依赖数组中，一般不需要使用 `useMemo`。



# Hooks 好的实践

1. 若 Hook 类型相同，且依赖数组一致时，应该合并成一个 Hook。否则会产生更多开销。

```js
const dataA = useMemo(() => {
  return getDataA();
}, [A, B]);

const dataB = useMemo(() => {
  return getDataB();
}, [A, B]);

// 应该合并为

const [dataA, dataB] = useMemo(() => {
  return [getDataA(), getDataB()]
}, [A, B]);
```

2. 参考原生 Hooks 的设计，自定义 Hooks 的返回值可以使用 Tuple 类型，更易于在外部重命名。但如果返回值的数量超过三个，还是建议返回一个对象。

```ts
export const useToggle = (defaultVisible: boolean = false) => {
  const [visible, setVisible] = useState(defaultVisible);
  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return [visible, show, hide] as [typeof visible, typeof show, typeof hide];
};

const [isOpen, open, close] = useToggle(); // 在外部可以更方便地修改名字
const [visible, show, hide] = useToggle();
```

3. `ref` 不要直接暴露给外部使用，而是提供一个修改值的方法。
4. 在使用 `useMemo` 或者 `useCallback` 时，确保返回的函数只创建一次。也就是说，函数不会根据依赖数组的变化而二次创建。举个例子：

```js
export const useCount = () => {
  const [count, setCount] = useState(0);

  const [increase, decrease] = useMemo(() => {
    const increase = () => {
      setCount(count + 1);
    };

    const decrease = () => {
      setCount(count - 1);
    };
    return [increase, decrease];
  }, [count]);

  return [count, increase, decrease];
};
```

在 `useCount` Hook 中， `count` 状态的改变会让 `useMemo` 中的 `increase` 和 `decrease` 函数被重新创建。由于闭包特性，如果这两个函数被其他 Hook 用到了，我们应该将这两个函数也添加到相应 Hook 的依赖数组中，否则就会产生 bug。比如：

```js
function Counter() {
  const [count, increase] = useCount();

  useEffect(() => {
    const handleClick = () => {
      increase(); // 执行后 count 的值永远都是 1
    };

    document.body.addEventListener("click", handleClick);
    return () => {
      document.body.removeEventListener("click", handleClick);
    };
  }, []); 

  return <h1>{count}</h1>;
}
```

在 `useCount` 中，`increase` 会随着 `count` 的变化而被重新创建。但是 `increase` 被重新创建之后， `useEffect` 并不会再次执行，所以 `useEffect` 中取到的 `increase` 永远都是首次创建时的 `increase` 。而首次创建时 `count` 的值为 0，因此无论点击多少次， `count` 的值永远都是 1。

那把 `increase` 函数放到 `useEffect` 的依赖数组中不就好了吗？事实上，这会带来更多问题：

- `increase` 的变化会导致频繁地绑定事件监听，以及解除事件监听。
- 需求是只在组件 mount 时执行一次 `useEffect`，但是 `increase` 的变化会导致 `useEffect` 多次执行，不能满足需求。

如何解决这些问题呢？

一、通过 `setState` 回调，让函数不依赖外部变量。例如：

```js
export const useCount = () => {
  const [count, setCount] = useState(0);

  const [increase, decrease] = useMemo(() => {
    const increase = () => {
      setCount((latestCount) => latestCount + 1);
    };

    const decrease = () => {
      setCount((latestCount) => latestCount - 1);
    };
    return [increase, decrease];
  }, []); // 保持依赖数组为空，这样 increase 和 decrease 方法都只会被创建一次

  return [count, increase, decrease];
};
```

二、通过 `ref` 来保存可变变量。例如：

```js
export const useCount = () => {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  useEffect(() => {
    countRef.current = count;
  });

  const [increase, decrease] = useMemo(() => {
    const increase = () => {
      setCount(countRef.current + 1);
    };

    const decrease = () => {
      setCount(countRef.current - 1);
    };
    return [increase, decrease];
  }, []); // 保持依赖数组为空，这样 increase 和 decrease 方法都只会被创建一次

  return [count, increase, decrease];
};
```