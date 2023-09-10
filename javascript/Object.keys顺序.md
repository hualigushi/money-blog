在一些现代的浏览器中，keys 输出顺序是可以预测的！

## Key 都为自然数：

注意这里的自然数是指正整数或 0，如果是其他类的 Number —— 浮点数或者负数 —— 都会走到下一组类型里，像`NaN`或者`Infinity`这种也自然归到下一个类型里，但是像科学记数法这个会稍微特殊一点，感兴趣的同学可以自己试一下。

总结来说，就是当前的 key 如果是自然数就按照自然数的大小进行升序排序。

```js
const objWithIndices = {
  23: 23,
  '1': 1,
  1000: 1000
};

console.log(Reflect.ownKeys(objWithIndices)); // ["1", "23", "1000"]
console.log(Object.keys(objWithIndices)); // ["1", "23", "1000"]
console.log(Object.getOwnPropertyNames(objWithIndices)); // ["1", "23", "1000"]
```

包括在 `for-in` 循环的遍历中，keys 也是按照这个顺序执行的。

## Key 都为 String：

如果 key 是不为自然数的 String（Number 也会转为 String）处理，则按照加入的时间顺序进行排序。

```js
const objWithStrings = {
  "002": "002",
  c: 'c',
  b: "b",
  "001": "001",
}

console.log(Reflect.ownKeys(objWithStrings)); // ["002", "c", "b", "001"]
console.log(Object.keys(objWithStrings));// ["002", "c", "b", "001"]
console.log(Object.getOwnPropertyNames(objWithStrings));// ["002", "c", "b", "001"]
```

## Key 都为symbol

```js
const objWithSymbols = {
  [Symbol("first")]: "first",
  [Symbol("second")]: "second",
  [Symbol("last")]: "last",
}

console.log(Reflect.ownKeys(objWithSymbols));// [Symbol(first), Symbol(second), Symbol(last)]
console.log(Object.keys(objWithSymbols));// [Symbol(first), Symbol(second), Symbol(last)]
console.log(Object.getOwnPropertyNames(objWithSymbols));// [Symbol(first), Symbol(second), Symbol(last)]
```

如果 Key 都为 Symbol，顺序和 String 一样，也是按照添加的顺序进行排序的。

## 如果是以上类型的相互结合

```js
const objWithStrings = {
  "002": "002",
  [Symbol("first")]: "first",
  c: "c",
  b: "b",
  "100": "100",
  "001": "001",
  [Symbol("second")]: "second",
}

console.log(Reflect.ownKeys(objWithStrings));
// ["100", "002", "c", "b", "001", Symbol(first), Symbol(second)]
```

结果是先按照自然数升序进行排序，然后按照非数字的 String 的加入时间排序，然后按照 Symbol 的时间顺序进行排序，也就是说他们会先按照上述的分类进行拆分，先按照自然数、非自然数、Symbol 的顺序进行排序，然后根据上述三种类型下内部的顺序进行排序。

## Recap

1. 在 ES6 之前 Object 的键值对是无序的；
2. 在 ES6 之后 Object 的键值对按照自然数、非自然数和 Symbol 进行排序，自然数是按照大小升序进行排序，其他两种都是按照插入的时间顺序进行排序。

###  



## 当`Object.keys`被调用时背后发生了什么

当`Object.keys`函数使用参数`O`调用时，会执行以下步骤：

第一步：将参数转换成`Object`类型的对象。

第二步：通过转换后的对象获得属性列表`properties`。

> 注意：属性列表`properties`为List类型（[List类型](https://link.juejin.cn?target=https%3A%2F%2Fwww.ecma-international.org%2Fecma-262%2F%23sec-list-and-record-specification-type)是[ECMAScript规范类型](https://link.juejin.cn?target=https%3A%2F%2Fwww.ecma-international.org%2Fecma-262%2F%23sec-ecmascript-specification-types)）

第三步：将List类型的属性列表`properties`转换为Array得到最终的结果。

> 规范中是这样定义的：
>
> 1. 调用`ToObject(O)`将结果赋值给变量`obj`
> 2. 调用`EnumerableOwnPropertyNames(obj, "key")`将结果赋值给变量`nameList`
> 3. 调用`CreateArrayFromList(nameList)`得到最终的结果



### 1 将参数转换成Object（`ToObject(O)`）

`ToObject`操作根据下表将参数`O`转换为Object类型的值：

| 参数类型  | 结果                      |
| --------- | ------------------------- |
| Undefined | 抛出TypeError             |
| Null      | 抛出TypeError             |
| Boolean   | 返回一个新的 Boolean 对象 |
| Number    | 返回一个新的 Number 对象  |
| String    | 返回一个新的 String 对象  |
| Symbol    | 返回一个新的 Symbol 对象  |
| Object    | 直接将Object返回          |

因为`Object.keys`内部有`ToObject`操作，所以`Object.keys`其实还可以接收其他类型的参数。

上表详细描述了不同类型的参数将如何转换成Object类型。

我们可以简单写几个例子试一试：

先试试`null`会不会报错：

![Object.keys(null)](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/7/26/164d49a4371897e3~tplv-t2oaga2asx-watermark.awebp)图1 `Object.keys(null)`

如图1所示，果然报错了。

接下来我们试试数字的效果：

![Object.keys(123)](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/7/26/164d49a44c76c27b~tplv-t2oaga2asx-watermark.awebp)

图2 `Object.keys(123)`

如图2所示，返回空数组。

为什么会返回空数组？请看图3：

![new Number(123)](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/7/26/164d49a44950161a~tplv-t2oaga2asx-watermark.awebp)

图3 `new Number(123)`

如图3所示，返回的对象没有任何可提取的属性，所以返回空数组也是正常的。

然后我们再试一下String的效果：

![Object.keys('我是Berwin')](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/7/26/164d49a443348edc~tplv-t2oaga2asx-watermark.awebp)

图4 `Object.keys('我是Berwin')`

图4我们会发现返回了一些字符串类型的数字，这是因为String对象有可提取的属性，看如图5：

![new String('我是Berwin')](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/7/26/164d49a43be329b4~tplv-t2oaga2asx-watermark.awebp)图5 `new String('我是Berwin')`

因为String对象有可提取的属性，所以将String对象的属性名都提取出来变成了列表返回出去了。



### 2 获得属性列表（`EnumerableOwnPropertyNames(obj, "key")`）

获取属性列表的过程有很多细节，其中比较重要的是调用对象的内部方法`OwnPropertyKeys`获得对象的`ownKeys`。

> 注意：这时的`ownKeys`类型是List类型，只用于内部实现

然后声明变量`properties`，类型也是List类型，并循环`ownKeys`将每个元素添加到`properties`列表中。

最终将`properties`返回。

> 您可能会感觉到奇怪，ownKeys已经是结果了为什么还要循环一遍将列表中的元素放到`properties`中。
>
> 这是因为EnumerableOwnPropertyNames操作不只是给Object.keys这一个API用，它内部还有一些其他操作，只是Object.keys这个API没有使用到，所以看起来这一步很多余。

所以针对`Object.keys`这个API来说，获取属性列表中最重要的是调用了内部方法`OwnPropertyKeys`得到`ownKeys`。

其实也正是内部方法`OwnPropertyKeys`决定了属性的顺序。

关于`OwnPropertyKeys`方法[ECMA-262](https://link.juejin.cn?target=https%3A%2F%2Ftc39.github.io%2Fecma262%2F%23sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys)中是这样描述的：

当`O`的内部方法`OwnPropertyKeys`被调用时，执行以下步骤（其实就一步）：

1. `Return ! OrdinaryOwnPropertyKeys(O).`

而`OrdinaryOwnPropertyKeys`是这样规定的：

1. 声明变量`keys`值为一个空列表（List类型）
2. 把每个Number类型的属性，按数值大小升序排序，并依次添加到`keys`中
3. 把每个String类型的属性，按创建时间升序排序，并依次添加到`keys`中
4. 把每个Symbol类型的属性，按创建时间升序排序，并依次添加到`keys`中
5. 将`keys`返回（`return keys`）

**上面这个规则不光规定了不同类型的返回顺序，还规定了如果对象的属性类型是数字，字符与Symbol混合的，那么返回顺序永远是数字在前，然后是字符串，最后是Symbol。**

举个例子：

```js
Object.keys({
  5: '5',
  a: 'a',
  1: '1',
  c: 'c',
  3: '3',
  b: 'b'
})
// ["1", "3", "5", "a", "c", "b"]
```

属性的顺序规则中虽然规定了`Symbol`的顺序，但其实`Object.keys`最终会将`Symbol`类型的属性过滤出去。

（原因是顺序规则不只是给`Object.keys`一个API使用，它是一个通用的规则）



### 3 将List类型转换为Array得到最终结果（`CreateArrayFromList( elements )`）

现在我们已经得到了一个对象的属性列表，最后一步是将List类型的属性列表转换成Array类型。

将List类型的属性列表转换成Array类型非常简单：

1. 先声明一个变量`array`，值是一个空数组
2. 循环属性列表，将每个元素添加到`array`中
3. 将`array`返回



## 该顺序规则还适用于其他API

上面介绍的排序规则同样适用于下列API：

1. `Object.entries`
2. `Object.values`
3. `for...in`循环
4. `Object.getOwnPropertyNames`
5. `Reflect.ownKeys`

> 注意：以上API除了`Reflect.ownKeys`之外，其他API均会将`Symbol`类型的属性过滤掉。