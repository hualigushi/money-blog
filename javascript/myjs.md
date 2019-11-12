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
``

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