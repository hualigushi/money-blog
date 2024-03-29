# Object

> Object作为哈希表使用存在以下问题

1. `Object`的`key`必须是`String`或者是`Symbol`，当`key`不为字符串时，会调用`toString()`进行强制转换，将转换后的字符串作为`key`
2. `Object`含有内置属性，如`constructor`、`toString`、`valueOf`，与其同名的键值会产生冲突，可以使用`Object.create(null)`创建一个空对象继承自`null`来避免此问题
3. `Object`其属性可能是不可遍历的、有些属性可能是在原型链上，所以`Object`长度的获取比较繁琐
4. `Object`是不可迭代的，即不能使用`for...of`来遍历，`typeof obj[Symbol.iterator] === undefined`
5. `Object`是无序的，其元素顺序与添加的顺序无关


# Map

> Map更适合用来做哈希表

1. 各种类型的值（包括`object`）都可以作为`key`
2. `Map`支持迭代，直接使用`for...of`来遍历，而不需要像对象一样先获取`key`再遍历，`typeof obj[Symbol.iterator] === function`

1. `Map`在遇到频繁删除添加和键值对的场景下，有更好的性能表现
2. `Map`用迭代的方式遍历`key`时，得到的`key`的顺序与`key`添加到Map时的顺序相同



# WeakMap

`WeakMap`跟`Map`结构类似，也拥有`get`、`has`、`delete`等方法，使用法和使用途都一样。

不同

1. `WeakMap`只接受对象作为键名，但`null`不能作为键名

2. `WeakMap`不支持`clear`方法，不支持遍历，也就没有了`keys`、`values`、`entries`、`forEach`这4个方法，也没有属性`size`

3. `WeakMap` 键名中的引用类型是弱引使用，假如这个引使用类型的值被垃圾机制回收了，`WeakMap`实例中的对应键值对也会消失。`WeakMap`中的`key`不计入垃圾回收，即若只有`WeakMap`中的`key`对某个对象有引用，那么此时执行垃圾回收时就会回收该对象，而`Map`中的`key`是计入垃圾回收

   
# WeakSet

> `WeakSet` 结构与 `Set` 类似，但只有有`add`、`delete`、`has`三个方法

不同

1. `WeakSet`的成员只能是对象，并且`WeakSet`不支持`clear`方法，不支持遍历，也没有`forEach`这个方法，没有属性`size`
2. `WeakSet` 中的对象都是弱引用，即垃圾回收机制不考虑 `WeakSet` 对该对象的引用，如果只有`WeakSet`引用该对象，那么垃圾回收机制会自动回收该对象所占用的内存



## 弱引用

**引用了对象，但是不影响它的垃圾回收**

> 不会因为该（弱）引用而改变原本的垃圾回收机制，在（弱）引用前应该进垃圾场的，（弱）引用后还是得进垃圾场，不受到（弱）引用的任何影响。

```
var obj = {};
var wm = new WeakMap();
// 弱引用
wm.set(obj, 1);
console.log(wm.get(obj));    // 1

// obj为null，将会给垃圾回收机制回收。
obj = null;
console.log(wm.get(obj));    // undefined
```


