## 介绍

**PerformanceObserver** 可用于获取性能相关的数据，例如**首帧fp**、**首屏fcp**、**首次有意义的绘制 fmp**等等。

### 构造函数

`PerformanceObserver()` 创建并返回一个新的 PerformanceObserver 对象。

### 提供的方法

```
PerformanceObserver.observe()
```

当记录的性能指标在指定的 entryTypes 之中时，将调用性能观察器的回调函数。

```
PerformanceObserver.disconnect()
```

停止性能观察者回调接收到性能指标。

```
PerformanceObserver.takeRecords()
```

返回存储在性能观察器中的性能指标的列表，并将其清空。

### 重点我们看看observer.observe(options);

**options**

一个只装了单个键值对的对象，该键值对的键名规定为 **entryTypes**。e**ntryTypes** 的取值要求如下:

entryTypes 的值：一个放字符串的数组，字符串的有效值取值在性能条目类型 中有详细列出。如果其中的某个字符串取的值无效，浏览器会自动忽略它。

另：若未传入 options 实参，或传入的 options 实参为空数组，会抛出 TypeError。

## 实例

```js
<script>
	const observer = new PerformanceObserver((list) => {
		for(const entry of list.getEntries()){
			console.groupCollapsed(entry.name);
			console.log(entry.entryType);
			console.log(entry.startTime);
			console.log(entry.duration);
			console.groupEnd();
		}
	})	
	observer.observe({entryTypes:['longtask','frame','navigation','resource','mark','measure','paint']});
</script>
```

获取结果

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/83de1e2ec0eb42158673a74b86a592c5~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp)

根据打印结果我们可以推测出来：

entryTypes里的值其实就是我们告诉PerformanceObserver，我们想要获取的某一方面的性能值。

例如传入**paint**，就是说我们想要得到fcp和fp。

所以我们看打印，它打印出来了fp和fcp

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0d5e6f36576b4cb295dc51e2921bb20b~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp)

这里有必要解释一下什么是fp，fcp，fpm

```
TTFB：Time To First Byte，首字节时间
FP：First Paint，首次绘制，绘制Body
FCP：First Contentful Paint，首次有内容的绘制，第一个dom元素绘制完成
FMP：First Meaningful Paint，首次有意义的绘制
TTI：Time To Interactive，可交互时间，整个内容渲染完成
```



![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/967ac78f03094934a9973f63c0dbbfe4~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp)

```
FP仅有一个div根节点
FCP包含页面的基本框架，但没有数据内容
FMP包含页面的所有元素及数据
```



## 实际使用

```js
  // 使用 PerformanceObserver 监听 fcp
  if (!!PerformanceObserver){
    try {
      const type = 'paint';
      if ((PerformanceObserver.supportedEntryTypes || []).includes(type)) {
        const observer = new PerformanceObserver((entryList)=>{
          for(const entry of entryList.getEntriesByName('first-contentful-paint')){
            const { startTime } = entry;
            console.log('[assets-load-monitor] PerformanceObserver fcp:', startTime);
            
            // 上报startTime操作
          }
        });
        observer.observe({
          entryTypes: [type],
        });
        return;
      }
    } catch (e) {
      // ios 不支持这种entryTypes，会报错 https://caniuse.com/?search=PerformancePaintTiming
      console.warn('[assets-load-monitor] PerformanceObserver error:', (e || {}).message ? e.message : e);
    }
  }
```


