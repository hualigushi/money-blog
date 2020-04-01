1. 在 JavaScript 中，数组被限制最多只能拥有 2^32-1 项。数组索引是指该限制内的任何有效索引，即从 0 到 2^32-2 的任何整数。

2. 我们都会犯这样的一个错误：在现有方法中添加 if() 或 for() 语句来验证用户输入或检查用户是否已登录。我们其实不应该这样做。如果一定要做这些验证，应该创建自己的方法。方法长度应该在 4 到 20 行之间，如果超过 20 行，可以将其中的几行提取到另一个方法中。同样的规则也适用于类，根据单一责任原则，方法或类越小越好。

3. 树形结构转为一维数组

```
const nav = [
    {
        id: 1,
        subitems: [{
            id: 2,
            subitems: [{
                id: 3,
                subitems: [],
                parent: 2
            }, {
                id: 4,
                subitems: [],
                parent: 2
            },
            parent: 1]
        }, {
            id: 5,
            subitems: [],
            parent: 1
        }],
        parnet: undefind
    }, {
        id: 6,
        subitems: [],
        parnet: undefind
    }
]
// 树状嵌套数组转化成一维数组
export function flatten (array) {
  return [].concat(...array.map(item => [].concat(item, ...flatten(item.subitems))))
}

function find (item, v = 0) {
    const parent = navItem.filter(it => it.id === item.parent)[0]
    return !item.parent ? v : (parent ? find(parent, ++v) : v)
}

navItem.forEach(item => {
    item.level = find(item)
})
```

4. 二维数组转为一维数组

```
const c = [[1,2,3],[4,5,6]]
[].concat.apply([], c)
```

5. 删除数组中某一项数据，利用filter
```
if (this.bookmark) {
        saveBookmark(this.fileName, this.bookmark.filter(item => item.cfi !== cfi))
      }
```

6. 搜索关键筛选
```
if (keyword) {
    Object.keys(this.list).filter(key => {
    this.list[key] = this.list[key].filter(book => book.fileName.indexOf(keyword) >= 0)
    return this.list[key].length > 0
    })
}
```

7. 数组添加不重复的数据
```
Array.prototype.pushWithoutDuplicate = function () {
  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i]
    if (this.indexOf(arg) === -1) {
      this.push(arg)
    }
  }
}
```

8. axios 下载进度
```
axios.create({
    baseURL: '',
    method: 'get',
    responseType: 'blob',
    timeout: 180 * 1000,
    onDownloadProgress: progressEvent => {
      if (onProgress) onProgress(progressEvent)
    }
  })

  progressEvent => {
    const progress = Math.floor(progressEvent.loaded / progressEvent.total * 100) + '%'
}
```

9. 类型判断
```
const toString = Object.prototype.toString // 方法缓存, 不需要反复地从Object开始一层层地访问

export function isDate(val: any): val is Date { // val is Date 类型保护
    return toString.call(val) === '[object Date]'
}

export function isPlainObject(val: any): val is Object {
    return toString.call(val) === '[object Object]'
}
```

10. extend

```
// extend 方法的实现用到了交叉类型，并且用到了类型断言。extend 的最终目的是把 from 里的属性都扩展到 to 中，包括原型上的属性
export function extend<T, U>(to: T, from: U): T & U {
    for (const key in from) {
        ; (to as T & U)[key] = from[key] as any
    }
    return to as T & U
}
```

11. 普通对象的深拷贝

```
export function deepMerge(...objs: any[]): any {
    const result = Object.create(null)

    objs.forEach(obj => {
        if (obj) {
            Object.keys(obj).forEach(key => {
                const val = obj[key]
                if (isPlainObject(val)) {
                    if (isPlainObject(result[key])) {
                        result[key] = deepMerge(result[key], val)
                    } else {
                        result[key] = deepMerge(val)
                    }
                } else {
                    result[key] = val
                }
            })
        }
    })
    return result
}
```

12. 同域请求判断
```
interface URLOrigin {
  protocol: string
  host: string
}


export function isURLSameOrigin(requestURL: string): boolean {
  const parsedOrigin = resolveURL(requestURL)
  return (
    parsedOrigin.protocol === currentOrigin.protocol && parsedOrigin.host === currentOrigin.host
  )
}

const urlParsingNode = document.createElement('a')
const currentOrigin = resolveURL(window.location.href)

function resolveURL(url: string): URLOrigin {
  urlParsingNode.setAttribute('href', url)
  const { protocol, host } = urlParsingNode

  return {
    protocol,
    host
  }
}
```
同域名的判断主要利用了一个技巧，创建一个 a 标签的 DOM，然后设置 href 属性为我们传入的 url，然后可以获取该 DOM 的 protocol、host。当前页面的 url 和请求的 url 都通过这种方式获取，然后对比它们的 protocol 和 host 是否相同即可。

13. img srcset sizes

```
<img src="lighthouse-200.jpg" sizes="50vw"
    srcset="lighthouse-100.jpg 100w, lighthouse-200.jpg 200w,
            lighthouse-400.jpg 400w, lighthouse-800.jpg 800w,
            lighthouse-1000.jpg 1000w, lighthouse-1400.jpg 1400w,
            lighthouse-1800.jpg 1800w" alt="a lighthouse">
```
如果没有设置srcset属性，或者没值，那么sizes属性也将不起作用

渲染了一张宽度为视窗宽度一半（sizes="50vw"）的图像，根据浏览器的宽度及其设备像素比，允许浏览器选择正确的图像，而不考虑浏览器窗口有多大。

14. 在 HTTP/1.0 和 HTTP/1.1 协议下，由于 Chrome 只支持同域同时发送 6 个并发请求，可以进行域名切分，来提升并发的请求数量，或者使用 HTTP/2 协议

15. window属性：devicePixelRatio

该属性能够返回当前显示设备的物理像素分辨率与 CSS 像素分辨率的比率。此值也可以解释为像素大小的比率：一个 CSS 像素的大小与一个物理像素的大小的比值。简单地说，这告诉浏览器应该使用多少个屏幕的实际像素来绘制单个 CSS 像素。

window.devicePixelRatio = 物理像素 / dips

16. html5 新属性 data-dpr

17. Promise值穿透

解释：.then 或者 .catch 的参数期望是函数，传入非函数则会发生值穿透

```
 Promise.resolve('foo')
    .then(Promise.resolve('bar'))
    .then(function(result){
      console.log(result)
    })


foo

```
```
Promise.resolve(1)
  .then(function(){return 2})
  .then(Promise.resolve(3))
  .then(console.log)
  
  2
```

```
Promise.resolve(1)
  .then(function(){return 2})
  .then(function(){return Promise.resolve(3)})
  .then(console.log)
  
3
```
