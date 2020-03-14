concat是连接一个或多个数组,返回的是连接后数组的一个副本

```
var arr=[[1,2,3],[4,5,6],[7,8,9],[10,11,12]]

Array.prototype.concat.apply(Number,arr) // 第一个元素是 f Array ()

正确方式

Array.prototype.concat.apply([],arr)

[].concat.apply([],arr)

[].concat("123"}) // 结果：['123']  如果 concat传入的参数不是数组 就不会遍历 直接暴力添加到数组项,而参数是数组的话就会遍历
```
