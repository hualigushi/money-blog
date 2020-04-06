## require 重复引入问题
 Node.js 默认先从缓存中加载模块，一个模块被加载一次之后，就会在缓存中维持一个副本，如果遇到重复加载的模块会直接提取缓存中的副本，也就是说在任何时候每个模块都只在缓存中有一个实例。

 ## require 加载模块的时候是同步还是异步？
同步的
原因：
1. 一个作为公共依赖的模块，当然想一次加载出来，同步更好
2. 模块的个数往往是有限的，而且 Node.js 在 require 的时候会自动缓存已经加载的模块，再加上访问的都是本地文件，产生的IO开销几乎可以忽略。

## require() 的缓存策略
Node.js 会自动缓存经过 require 引入的文件，使得下次再引入不需要经过文件系统而是直接从缓存中读取。不过这种缓存方式是经过文件路径定位的，即使两个完全相同的文件，但是位于不同的路径下，会在缓存中维持两份。可以通过

`console.log(require.cache)`

获取目前在缓存中的所有文件。

## exports 与 module.exports 区别
#### js文件启动时
在一个 node 执行一个文件时，会给这个文件内生成一个 exports 和 module 对象，而module又有一个 exports 属性,都指向一块{}内存区域。
`exports = module.exports ={};`

#### require()加载模块
```
//koala.js
let a = '程序员成长指北';
console.log(module.exports); //能打印出结果为：{}
console.log(exports); //能打印出结果为：{}
exports.a = '程序员成长指北哦哦'; //这里辛苦劳作帮 module.exports 的内容给改成 {a : '程序员成长指北哦哦'}
exports = '指向其他内存区'; //这里把exports的指向指走

//test.js
const a = require('/koala');
console.log(a) // 打印为 {a : '程序员成长指北哦哦'}
```
require导出的内容是module.exports的指向的内存块内容，并不是exports的。简而言之，区分他们之间的区别就是 exports 只是 module.exports的引用，辅助后者添加内容用的。用内存指向的方式更好理解。

`exports = module.exports = somethings`
等价于:
```
module.exports = somethings
exports = module.exports
```
原理很简单，即 module.exports 指向新的对象时，exports 断开了与 module.exports 的引用，那么通过 exports = module.exports 让 exports 重新指向 module.exports 即可。