typeof 对于基本数据类型（null, undefined, string, number, boolean, symbol），除了 null 都会返回正确的类型。null 会返回 object。
typeof 对于对象类型，除了函数会返回 function，其他的都返回 object。
如果我们想获得一个变量的正确类型，可以通过 `Object.prototype.toString.call(xx)`。这样我们就可以获得类似 `[object Type]` 的字符串。

