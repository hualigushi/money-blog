原始数组如下：

```js
var data = [
  {value: 4}, 
  {value: 2}, 
  {value: undefined}, 
  {value: undefined}, 
  {value: 1}, 
  {value: undefined}, 
  {value: undefined}, 
  {value: 7}, 
  {value: undefined}, 
  {value: 4}
];
```

data 是个数组，数组的每一项都是一个拥有 value 作为 key 的对象，值为数字或者 undefined。

```js
data
  .sort((x, y) => x.value - y.value)
  .map(x => x.value);
```

对数组的 value 进行排序，然后把排完序的数组进行 flat 处理。得到的结果如下：

```js
[2, 4, undefined, undefined, 1, undefined, undefined, 7, undefined, 4]
```

显然这没有达到我们的目的。

现在我们修改一下排序，挑战一下函数的调用顺序：先对数组进行扁平化(flat)处理，然后再排序。

```js
data
  .map(x => x.value)
  .sort((x, y) => x - y)
```

这时我们得到的结果和之前截然不同：

```text
[1, 2, 4, 4, 7, undefined, undefined, undefined, undefined, undefined]
```

遇到这种情况第一感觉肯定是要去看看 ECMA 规范，万一是 JS 引擎的 bug 呢。

在 ES6 规范 [22.1.3.24](https://link.zhihu.com/?target=http%3A//www.ecma-international.org/ecma-262/6.0/%23sec-array.prototype.sort) 节写道：

> Calling comparefn(a,b) always returns the same value v when given a specific pair of values a and b as its two arguments. Furthermore, Type(v) is Number, and v is not NaN. Note that this implies that exactly one of a < b, a = b, and a > b will be true for a given pair of a and b.

简单翻译一下就是：第二个参数 comparefn 返回一个数字，并且不是 NaN。一个注意事项是，对于参与比较的两个数 a 小于 b、a 等于 b、a 大于 b 这三种情况必须有一个为 true。

所以严格意义上来说，这段代码是有 bug 的，因为比较的结果出现了 NaN。

在 MDN 文档上还有一个细节：

> 如果 comparefn(a, b) 等于 0， a 和 b 的相对位置不变。备注：ECMAScript 标准并不保证这一行为，而且也不是所有浏览器都会遵守。

翻译成编程术语就是：sort 排序算法是不稳定排序。

其实我们最疑惑的问题上，上面两行代码为什么会输出不同的结果。我们只能通过查看 V8 源码去找答案了。

V8 对数组排序是这样进行的：

如果没有定义 comparefn 参数，则生成一个（高能预警，有坑啊）：

```js
comparefn = function (x, y) {
if (x === y) return 0;
if (%_IsSmi(x) && %_IsSmi(y)) {
return %SmiLexicographicCompare(x, y);
  }
  x = TO_STRING(x);   // <----- 坑
  y = TO_STRING(y);   // <----- 坑
if (x == y) return 0;
else return x < y ? -1 : 1;
};
```

然后定义了一个插入排序算法：

```js
function InsertionSort(a, from, to) {
  for (var i = from + 1; i < to; i++) {
    var element = a[i];
    for (var j = i - 1; j >= from; j--) {
      var tmp = a[j];
      var order = comparefn(tmp, element);
      if (order > 0) {   // <---- 注意这里
        a[j + 1] = tmp;
      } else {
        break;
      }
  }
  a[j + 1] = element;
}
```

为什么是插入排序？V8 为了性能考虑，当数组元素个数少于 10 个时，使用插入排序；大于 10 个时使用快速排序。

后面还定义了快速排序函数和其它几个函数，我就不一一列出了。

函数都定义完成后，开始正式的排序操作：

```js
// %RemoveArrayHoles returns -1 if fast removal is not supported.
var num_non_undefined = %RemoveArrayHoles(array, length);

if (num_non_undefined == -1) {
  // There were indexed accessors in the array.
  // Move array holes and undefineds to the end using a Javascript function
  // that is safe in the presence of accessors.
  num_non_undefined = SafeRemoveArrayHoles(array);
}
```

中间的注释：Move array holes and **undefined**s to the **end** using a Javascript function。排序之前会把数组里面的 undefined 移动到最后。因此第二个排序算法会把 undefined 移动到最后，然后对剩余的数据 [4,2,1,7,4] 进行排序。

而在第一种写法时，数组的每一项都是一个 Object，然后最 Object 调用 x.value - y.value 进行计算，当 undefined 参与运算时比较的结果是 NaN。当返回 NaN 时 V8 怎么处理的呢？我前面标注过，再贴一次：

```js
var order = comparefn(tmp, element);
if (order > 0) {  // <---- 这里
  a[j + 1] = tmp;
} else {
  break;
}
```

NaN > 0 为 false，执行了 else 分支代码。