## 方案1
```
mounted(){
 this.timer = setInterval(()=>{
    console.log(1)
 },1000)
},
beforeDestroy(){
 clearInterval(this.timer)
}
```
方案1有两点不好的地方，引用尤大的话来说就是：

1. 它需要在这个组件实例中保存这个 timer，如果可以的话最好只有生命周期钩子可以访问到它。这并不算严重的问题，但是它可以被视为杂物。

2. 我们的建立代码独立于我们的清理代码，这使得我们比较难于程序化的清理我们建立的所有东西。

## 方案2（推荐）：该方法是通过$once这个事件侦听器在定义完定时器之后的位置来清除定时器
```
mounted(){
 const timer = setInterval(()=>{
    console.log(1)
 },1000)
 this.$once('hook:beforeDestroy',()=>{
  clearInterval(timer)
 })
}
```
