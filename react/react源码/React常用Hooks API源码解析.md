# 三要点
1. `hooks`的状态更新依赖于闭包，[闭包值，闭包更新函数]
2. 并且由于函数组件更新时会重新执行函数，所以初次渲染时需要记录我们创建的`hooks`，React采用了链表的方式（数据类型大小不固定，单向遍历，符合链表使用场景）
3. 对于每个`hooks`，都需要链表记录我们对这个`hooks`更新的状态链路（插入新的更新，记录之前更新顺序）

# 从useState开始

### 闭包的使用：
我们从基础的`useState`源码看起，`useState`本质上是`useReduce`r的简化版，`useReducer`跟`redux`的使用方式基本相同

react提供了一个默认的`reducer`来进行`update`，`useState`分为两个状态：`mount`和`update`，因此对应了两个方法：

1. `mountState`判断初值是否为函数，在`workInProgress`对应的fiber节点上，挂载一个`hook`，其`baseState`和`memoizedState`均为初值，
   传入默认`reducer`，返回`dispatch`，最后将`hook.memorizedState` 和 `dispatch` 以数组的形式返回
   
2. `updateState`就是直接调用了默认的`reducer`，然后对`state`进行了替换

```js
// react-reconciler/src/ReactFiberHooks.js
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  // $FlowFixMe: Flow doesn't like mixed types
  return typeof action === 'function' ? action(state) : action;
}
function mountState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  const hook = mountWorkInProgressHook();
  if (typeof initialState === 'function') {
    // $FlowFixMe: Flow doesn't like mixed types
    initialState = initialState();
  }
  hook.memoizedState = hook.baseState = initialState;
  const queue = (hook.queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: (initialState: any),
  });
  const dispatch: Dispatch<
    BasicStateAction<S>,
  > = (queue.dispatch = (dispatchAction.bind(
    null,
    currentlyRenderingFiber,
    queue,
  ): any));
  return [hook.memoizedState, dispatch];
}
function updateState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  return updateReducer(basicStateReducer, (initialState: any));
}
```

### hooks链

我们发现每个`hooks`被`mount`时都会执行`mountWorkInProgressHooks`，这里我们看下代码，看看这个函数做了什么，

新建了一个hook，判断是否存在第一个hook，然后将hook组成链表，返回新建的hook也就是链表的最后一项，形成下图所示的hooks链!

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/153cfa6c63694a5e8e4d33359d2e3cfe~tplv-k3u1fbpfcp-zoom-1.image)

```js
// react-reconciler/src/ReactFiberHooks.js
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };
    if (workInProgressHook === null) {
    // This is the first hook in the list
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // Append to the end of the list
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}
```

### Dispatch 的update链
也就是我们每次执行dispatchAction方法，就会创建一个保存着此次更新信息的update对象，添加到更新链表queue上。

并且由于一方面我们需要从头开始更新，另一方面我们还需要在尾部插入update，所以React采用了循环链表的数据结构，

即当插入第二个节点时，会将第二个节点的next指向last的next（即头节点），然后last节点的next指向新增节点，

这样就可以形成如下图这样的结构，在进行这次更新后会清空这个链，然后将当前的值更改为最新值

更新的过程则是从当前hook指向的节点的next节点，也即第一个update开始，向前遍历直到遍历完成链表

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a2981c4bed794a8a930b2273c137ee24~tplv-k3u1fbpfcp-zoom-1.image)

```js
// react-reconciler/src/ReactFiberHooks.js
function dispatchAction(fiber,queue,action,) 
{    const update = {   
      action,
      next: null,    
    };    // 将update对象添加到循环链表中    
    const last = queue.last;    
    if (last === null) {      
        // 链表为空，将当前更新作为第一个，并保持循环      
        update.next = update;    
    } else {      
        const first = last.next;      
        if (first !== null) {        
        // 在最新的update对象后面插入新的update对象        
            update.next = first;      
        }      
        last.next = update;    
    }    
    // 将表头保持在最新的update对象上    
    queue.last = update;   
    // 进行调度工作    
    scheduleWork(); }
```

# useEffect 

`useEffect`的使用也是分为`mount`和`update`，`mount`阶段主要是将`effect`进行挂载，要挂在到两个地方，一个是`hooks`链，另一个是通过`pushEffect`把`useEffect`都收集到`updateQueue`这个链表上，

然后在刷新完成后执行`updateQueue`的函数。

在`update`阶段基本同理，只不过增加了一个`deps`的判断，如果`deps`没有变化则打上不需要更新的`tag`，然后在`updateQueue`的过程中函数不会被执行

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b707977a5e3740efbd0000a9216619ed~tplv-k3u1fbpfcp-zoom-1.image)

```js
// react-reconciler/src/ReactFiberHooks.js
function mountEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null,
): void {
  return mountEffectImpl(
    UpdateEffect | PassiveEffect | PassiveStaticEffect,
    HookPassive,
    create,
    deps,
  );
}
function mountEffectImpl(fiberEffectTag, hookEffectTag, create, deps): void {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  currentlyRenderingFiber.effectTag |= fiberEffectTag;
  hook.memoizedState = pushEffect(
    HookHasEffect | hookEffectTag,
    create,
    undefined,
    nextDeps,
  );
}
function pushEffect(tag, create, destroy, deps) {
  const effect: Effect = {
    tag,
    create,
    destroy,
    deps,
    // Circular
    next: (null: any),
  };
  let componentUpdateQueue: null | FunctionComponentUpdateQueue = (currentlyRenderingFiber.updateQueue: any);
  if (componentUpdateQueue === null) {
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue = (componentUpdateQueue: any);
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    const lastEffect = componentUpdateQueue.lastEffect;
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }
  return effect;
}
```

# useMemo 和 useCallback

这两个部分基本同理，`mount`过程获取存储了初值，`update`过程根据前后`deps`的`shallow compare`，如果发生了变化，则执行新的函数获得新值，

或者将值替换为新的值，他们的本质其实是利用了上下文的切换，存在于之前上下文环境的函数或者变量，如果deps变化，则使用或者执行当前上下文环境下的函数。

`useMemo`的值在`mount`时进行缓存，如果deps没有变化的话，就不会更新这个函数，值不会更新。

`useCallback`同理，但是相对有一点理解障碍，自己在使用时一直没有明白为什么函数内的变量不会更新。

后来想到因为`function component`是刷新都会重新执行的，所以当前`memorized`的函数只会持有对应状态的变量的值，

当function重新执行的时候，对于变量的引用不会变，deps更新之后切换上下文，下边写了一个帮助理解的小例子

```js
// useMemo相关 
function mountMemo<T>(
  nextCreate: () => T,
  deps: Array<mixed> | void | null,
): T {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}
function updateMemo<T>(
  nextCreate: () => T,
  deps: Array<mixed> | void | null,
): T {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;
  if (prevState !== null) {
    // Assume these are defined. If they're not, areHookInputsEqual will warn.
    if (nextDeps !== null) {
      const prevDeps: Array<mixed> | null = prevState[1];
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }
    }
  }
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}


// useCallback相关
function mountCallback<T>(callback: T, deps: Array<mixed> | void | null): T {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  hook.memoizedState = [callback, nextDeps];
  return callback;
}
function updateCallback<T>(callback: T, deps: Array<mixed> | void | null): T {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;
  if (prevState !== null) {
    if (nextDeps !== null) {
      const prevDeps: Array<mixed> | null = prevState[1];
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }
    }
  }
  hook.memoizedState = [callback, nextDeps];
  return callback;
}
```

```js
let obj = {} 
function area() {
  let b = 666
  const test = () => {
    console.log(b)
  }
  obj.test = test
}
area()
function area2() {
  let b = 999
  obj.test()
}
area2()
```

# useRef
通过以上的例子，不难看出`function component`在更新时会重新执行函数切换到新的上下文，所以如果想一直持有初始的值，就需要将持有的值放在`fiber`的`memorizeState`中，

使用的时候再从fiber中获取，所以就有了`useRef`这个API

```js
function mountRef<T>(initialValue: T): {|current: T|} {
  const hook = mountWorkInProgressHook();
  const ref = {current: initialValue};
  if (__DEV__) {
    Object.seal(ref);
  }
  hook.memoizedState = ref;
  return ref;
}

function updateRef<T>(initialValue: T): {|current: T|} {
  const hook = updateWorkInProgressHook();
  return hook.memoizedState;
}
```

# 整体结构图
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1b6deb928a1f4644a83416cf2413d388~tplv-k3u1fbpfcp-zoom-1.image?imageslim)

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b12517784a1e402988290769dca5b637~tplv-k3u1fbpfcp-zoom-1.image?imageslim)
