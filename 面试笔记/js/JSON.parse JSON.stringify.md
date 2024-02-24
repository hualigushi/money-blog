[TOC]



# JSON.parse(JSON.stringify())的缺点

在JSON.stringify()阶段

1.如果obj里面有时间对象，则JSON.stringify后再JSON.parse的结果，时间将只是字符串的形式，而不是对象的形式

2.如果obj里有RegExp(正则表达式的缩写)、Error对象，则序列化的结果将只得到空对象

3.如果obj里有函数，undefined，则序列化的结果会把函数或 undefined丢失

4.如果obj里有NaN、Infinity和-Infinity，则序列化的结果会变成null

5.JSON.stringify()只能序列化对象的可枚举的自有属性，例如 如果obj中的对象是有构造函数生成的， 则使用JSON.parse(JSON.stringify(obj))深拷贝后，会丢弃对象的constructor

6.如果对象中存在循环引用的情况也无法正确实现深拷贝







# `JSON.stringify()` 九大特性

## 1

**对于 `undefined`、任意的函数以及 `symbol` 三个特殊的值分别作为对象属性的值、数组元素、单独的值时 `JSON.stringify()`将返回不同的结果。**

首先，我们来复习一下知识点，看一道非常简单的面试题目：请问下面代码会输出什么？

```js
const data = {
  a: "aaa",
  b: undefined,
  c: Symbol("dd"),
  fn: function() {
  	return true;
	}
};
JSON.stringify(data); // 输出：？

// "{"a":"aaa"}"
```

很简单这道题目面试官主要考察的知识点是：

- `undefined`、任意的函数以及 `symbol` 作为对象属性值时 `JSON.stringify()` 将跳过（忽略）对它们进行序列化

  

**面试官追问**：假设 `undefined`、任意的函数以及 `symbol` 值作为数组元素会是怎样呢？

```js
JSON.stringify(["aaa", undefined, function aa() {
  return true
 }, Symbol('dd')])  // 输出：？

// "["aaa",null,null,null]"
```

知识点是：

- `undefined`、任意的函数以及 `symbol` 作为数组元素值时，`JSON.stringify()` 会将它们序列化为 `null`



我们稍微再动下脑筋，如果单独序列化这些值会是什么样的结果呢？

```js
JSON.stringify(function a (){console.log('a')})
// undefined
JSON.stringify(undefined)
// undefined
JSON.stringify(Symbol('dd'))
// undefined
```

单独转换的结果就是：

- `undefined`、任意的函数以及 `symbol` 被 `JSON.stringify()` 作为单独的值进行序列化时都会返回 `undefined`

##### `JSON.stringify()` 第一大特性总结

- `undefined`、任意的函数以及 `symbol` 作为对象属性值时 `JSON.stringify()` 对跳过（忽略）它们进行序列化
- `undefined`、任意的函数以及 `symbol` 作为数组元素值时，`JSON.stringify()` 将会将它们序列化为 `null`
- `undefined`、任意的函数以及 `symbol` 被 `JSON.stringify()` 作为单独的值进行序列化时，都会返回 `undefined`



## 2

- 非数组对象的属性不能保证以特定的顺序出现在序列化后的字符串中。

```js
const data = {
  a: "aaa",
  b: undefined,
  c: Symbol("dd"),
  fn: function() {
  	return true;
  },
  d: "ddd"
};
JSON.stringify(data); // 输出：？
// "{"a":"aaa","d":"ddd"}"

JSON.stringify(["aaa", undefined, function aa() {
	return true
}, Symbol('dd'),"eee"])  // 输出：？

// "["aaa",null,null,null,"eee"]"
```

正如我们在第一特性所说，`JSON.stringify()` 序列化时会忽略一些特殊的值，所以不能保证序列化后的字符串还是以特定的顺序出现（数组除外）。



## 3

- 转换值如果有 `toJSON()` 函数，该函数返回什么值，序列化结果就是什么值，并且忽略其他属性的值。

```js
JSON.stringify({
  say: "hello JSON.stringify",
  toJSON: function() {
  	return "today i learn";
  }
})
// "today i learn"
```



## 4

- `JSON.stringify()` 将会正常序列化 `Date` 的值。

```js
JSON.stringify({ now: new Date() });
// "{"now":"2019-12-08T07:42:11.973Z"}"
```

实际上 `Date` 对象自己部署了 `toJSON()` 方法（同Date.toISOString()），因此 `Date` 对象会被当做字符串处理。



## 5

- `NaN` 和 `Infinity` 格式的数值及 `null` 都会被当做 `null`。

```js
JSON.stringify(NaN)
// "null"
JSON.stringify(null)
// "null"
JSON.stringify(Infinity)
// "null"
```



## 6

关于基本类型的序列化：

- 布尔值、数字、字符串的包装对象在序列化过程中会自动转换成对应的原始值。

```js
JSON.stringify([new Number(1), new String("false"), new Boolean(false)]);
// "[1,"false",false]"
```



## 7

关于对象属性的是否可枚举：

- 其他类型的对象，包括 Map/Set/WeakMap/WeakSet，仅会序列化可枚举的属性。

```js
// 不可枚举的属性默认会被忽略：
JSON.stringify(
	Object.create(
		null,
	{
    x: { value: 'json', enumerable: false },
    y: { value: 'stringify', enumerable: true }
  }
  )
);
// "{"y":"stringify"}"
```



## 8

我们都知道实现深拷贝最简单粗暴的方式就是序列化：`JSON.parse(JSON.stringify())`，这个方式实现深拷贝会因为序列化的诸多特性从而导致诸多的坑点：比如现在我们要说的循环引用问题。

```js
// 对包含循环引用的对象（对象之间相互引用，形成无限循环）执行此方法，会抛出错误。
const obj = {
	name: "loopObj"
};
const loopObj = {
	obj
};
// 对象之间形成循环引用，形成闭环
obj.loopObj = loopObj;
function deepClone(obj) {
	return JSON.parse(JSON.stringify(obj));
}
deepClone(obj)
/**
 VM44:9 Uncaught TypeError: Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    |     property 'loopObj' -> object with constructor 'Object'
    --- property 'obj' closes the circle
    at JSON.stringify (<anonymous>)
    at deepClone (<anonymous>:9:26)
    at <anonymous>:11:13
 */
```

- 对包含循环引用的对象（对象之间相互引用，形成无限循环）执行此方法，会抛出错误。

这也就是为什么用序列化去实现深拷贝时，遇到循环引用的对象会抛出错误的原因。



## 9

最后，关于 `symbol` 属性还有一点要说的就是：

- 所有以 `symbol` 为属性键的属性都会被完全忽略掉，即便 `replacer` 参数中强制指定包含了它们。

```
JSON.stringify({ [Symbol.for("json")]: "stringify" }, function(k, v) {
if (typeof k === "symbol") {
return v;
}
})

// undefined
```



## 总结: `JSON.stringify()` 九大特性

**一、对于 `undefined`、任意的函数以及 `symbol` 三个特殊的值分别作为对象属性的值、数组元素、单独的值时的不同返回结果。**

- `undefined`、任意的函数以及 `symbol` 作为对象属性值时 `JSON.stringify()` 跳过（忽略）对它们进行序列化
- `undefined`、任意的函数以及 `symbol` 作为数组元素值时，`JSON.stringify()` 将会将它们序列化为 `null`
- `undefined`、任意的函数以及 `symbol` 被 `JSON.stringify()` 作为单独的值进行序列化时都会返回 `undefined`

**二、非数组对象的属性不能保证以特定的顺序出现在序列化后的字符串中。**

**三、转换值如果有 `toJSON()` 函数，该函数返回什么值，序列化结果就是什么值，并且忽略其他属性的值。**

**四、`JSON.stringify()` 将会正常序列化 `Date` 的值。**

**五、`NaN` 和 `Infinity` 格式的数值及 `null` 都会被当做 `null`。**

**六、布尔值、数字、字符串的包装对象在序列化过程中会自动转换成对应的原始值。**

**七、其他类型的对象，包括 Map/Set/WeakMap/WeakSet，仅会序列化可枚举的属性。**

**八、对包含循环引用的对象（对象之间相互引用，形成无限循环）执行此方法，会抛出错误。**

**九、所有以 `symbol` 为属性键的属性都会被完全忽略掉，即便 `replacer` 参数中强制指定包含了它们。**

