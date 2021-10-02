方法一：`react-app-env.d.ts`添加

```js
// 关于元素的只读信息
interface DOMRectReadOnly {
    bottom:number;
    height:number;
    left:number;
    right:number;
    top:number;
    width:number;
    x:number;
    y:number;
}
//监听器回调函数中的参数类型，自带元素本身(target)与对应的只读位置、大小信息(contentRect)
interface ResizeObserverEntry {
    target: HTMLElement | null;
    contentRect: ResizeObserverEntry["target"] extends null? null : DOMRectReadOnly
}
// 监听器构造函数所需要传入的回调函数
type EntriesFuntion = (entries:Array<ResizeObserverEntry>)=>void;
/*** 元素大小、位置变化监听器*/
declare class ResizeObserver {
    /**
    * 元素大小、位置变化监听器
    * @param entriesFn 关于挂载到监听器的回调函数
    * @returns {Observer} 返回一个监听器对象
    */
    constructor(entriesFn:EntriesFuntion): ResizeObserver{};
    /**
    * 执行目标元素的监听
    * @param target 要执行监听的目标元素
    * @param options 设置元素的盒子模型，默认为content-box
    * @returns {void}
    */
    observe(target:HTMLElement|null,options?:{box:'border-box'|"content-box"}):void;

    /**
    * 取消目标元素的监听
    * @param target 要取消执行监听的目标元素
    * @returns {void}
    */
    unobserve(target:HTMLElement|null):void

    /**
    * 取消所有元素监听
    */
    disconnect():void
}
```

方法二： 
`yarn add @types/resize-observer-browser`
`tscongif.json`

```js
'compilerOptions':{
    'types':['resize-observer-browser']
}
```

```js
export const useMount = (callBack: () => void) => {
    useEffect(() => {
        callBack()
    }, [])
}

export const useDebounce = <V> (value: V, delay?: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // 每次在value变化以后，设置一个定时器
        const timeout = setTimeout(() => setDebouncedValue(value), delay)
        // 每次在上一个useEffect处理完以后再运行
        return () => clearTimeout(timeout);
    }, [value, delay]);

    return debouncedValue;
}
```