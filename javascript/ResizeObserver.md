# API介绍

`ResizeObserver`

这是一个能针对某个元素实行大小、位置变化监听的API，是一个类，它提供了一个观察器，该观察器将在每个 resize 事件上调用

# 常规用法
ResizeObserver是个构造函数。在使用new关键字调用构造函数，返回实例对象时，需要传入一个回调函数，这个回调用于监听实例对象某个DOM节点的变化。
```
const myObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
          console.log('大小位置', entry.contentRect)
          console.log('监听的DOM', entry.target)
        })
      })
      myObserver.observe(document.body)
```
![](https://pic4.zhimg.com/80/v2-a352b57d60d9914386a4073b066e4127_720w.jpg)

通过实例化一个监听器，然后调用`observe`方法传入一个要执行监听的DOM元素或SVG元素，那么每次`resize`事件触发时都会执行`ResizeObserver`实例化时传入的回调函数，

该回调函数默认会返回一个数组，是一个ResizeObserverEntry对象, 数组里包含了每个被执行了监听器的元素及其可读信息，元素的拜访顺序也是监听器执行的顺序

实例化一个监听器，可多次执行`observe`方法对不同元素进行监听

# 在react+typescript中使用
- 在hook中，依然需要在useEffect里使用，因为observe方法需要传入一个有效DOM
- 该监听器其实也是副作用，理应在组件销毁时取消副作用，比如在useEffect里返回一个函数用于销毁副作用
- typescript中目前不能识别该API，至少笔者的版本(3.7.5)是这样，需要自己编写声明文件。

使用示例如下：
```
useEffect(() => {
       const resizeObserver = new ResizeObserver((entries) => {console.log(entries)});
        resizeObserver.observe(document.getElementById("test"))
        return (): void => { resizeObserver.unobserve(document.getElementById("test")) };
    }, []);
```

如果是`create-react-app`脚手架搭建的项目，还需要在`react-app-env.d.ts`中加上该`ResizeObserver`的声明，如果是其他typescript项目，则需要在全局global中声明:
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
/**
 * 元素大小、位置变化监听器
 */
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

# 注意点
`ResizeObserver`是`在resize`的过程中调用的，`resize`本身属于频繁触发的事件，在期间穿插太多逻辑其实对性能影响较大，如果只是想对某个元素变动后执行某个回调的话，建议最好搭配函数节流进行使用。
```
// throttle需要自行引入哈
const myObserver = new ResizeObserver(throttle(entries => {
  entries.forEach(entry => {
    console.log('大小位置 contentRect', entry.contentRect)
    console.log('监听的DOM target', entry.target)
  })
}), 500)
```

当一个元素使用display:none进行隐藏的时候，也是会触发尺寸变化的，于是也能够被观测到。
