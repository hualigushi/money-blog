1. 在 Object 中， key 必须是简单数据类型（整数，字符串或者是 symbol），而在 Map 中则可以是 JavaScript 支持的所有数据类型，也就是说可以用一个 Object 来当做一个Map元素的 key。

2. Map 元素的顺序遵循插入的顺序，而 Object 的则没有这一特性。

3. JSON 直接支持 Object，但不支持 Map

4. Map 是纯粹的 hash， 而 Object 还存在一些其他内在逻辑，所以在执行 delete 的时候会有性能问题。所以写入删除密集的情况应该使用 Map。

5. Map 在存储大量元素的时候性能表现更好，特别是在代码执行时不能确定 key 的类型的情况。



## 业务场景

##### 个人信息表

```
<template>
  <div id="app">
    <!-- <router-view></router-view> -->
    <div class="info-item" v-for="[label, value] in infoMap" :key="value">
      <span>{{label}}</span>
      <span>{{value}}</span>
    </div>
  </div>
</template>
```

```
data: () => ({
  info: {},
  infoMap: {}
}),
mounted () {
  this.info = {
    name: 'wangly',
    sex: '男',
    age: '18',
    phone: '13000000000',
    address: '中国......',
    duty: '总经理'
  }
  const mapKeys = ['姓名', '性别', '年龄', '电话', '家庭地址', '身份']
  const result = new Map()
  let i = 0
  for (const key in this.info) {
    result.set(mapKeys[i], this.info[key])
    i++
  }
  this.infoMap = result
}
```



##### 避免重复的数据

动态更新最常见的地方就是移动端的下拉加载更多。正常下是不会出错的。但是有一种极为特殊的情况。`socket`实时推送的累加的内容。我们都知道`socket`在发送消息的时候，存在通信延迟。影响这方面的地方很多。往往无法保证在`socket`接收到这个对象添加到DOM时，用户有没有手动更新这个消息内容。如果列表中存在。你在`socket.onmessage`动态添加到列表就会有值冲突的问题。虽然可以通过`filter`过滤出去。但是通过`map`的`key`无重复性。可以很好的完成这个问题。

```
// @ pushTbale function 
pushTable () {
  this.tableMap.set(9, {
    id: 9,
    label: '标签10'
  })
  this.tableMap = new Map(this.tableMap)
},

// createData @moount function
const map = new Map()
for (let index = 0; index < 10; index++) {
  map.set(index, {
    id: index,
    label: `标签${index}`,
  })
}
this.tableMap = map
```

