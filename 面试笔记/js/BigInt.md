#### 什么是BigInt?

> BigInt是一种新的数据类型，用于当整数值大于Number数据类型支持的范围时。这种数据类型允许我们安全地对`大整数`执行算术操作，表示高分辨率的时间戳，使用大整数id，等等，而不需要使用库。

#### 为什么需要BigInt?

在JS中，所有的数字都以双精度64位浮点格式表示，那这会带来什么问题呢？

这导致JS中的Number无法精确表示非常大的整数，它会将非常大的整数四舍五入，确切地说，JS中的Number类型只能安全地表示-9007199254740991(-(2^53-1))
和9007199254740991((2^53-1))，任何超出此范围的整数值都可能失去精度。

```
9007199254740992 === 9007199254740993;    // → true 居然是true!
```

#### 如何创建并使用BigInt？

要创建BigInt，只需要在数字末尾追加n即可。

```
console.log( 9007199254740995n );    // → 9007199254740995n	
console.log( 9007199254740995 );     // → 9007199254740996
```

另一种创建BigInt的方法是用BigInt()构造函数、

```
BigInt("9007199254740995");    // → 9007199254740995n
```

简单使用如下:

```
10n + 20n;    // → 30n	
10n - 20n;    // → -10n	
+10n;         // → TypeError: Cannot convert a BigInt value to a number	
-10n;         // → -10n	
10n * 20n;    // → 200n	
20n / 10n;    // → 2n	
23n % 10n;    // → 3n	
10n ** 3n;    // → 1000n	

let x = 10n;	
++x;          // → 11n	
--x;          // → 9n
console.log(typeof x);   //"bigint"
```

#### 值得警惕的点

1. BigInt不支持一元加号运算符, 这可能是某些程序可能依赖于 + 始终生成 Number 的不变量，或者抛出异常。另外，更改 + 的行为也会破坏 asm.js代码。
2. 因为隐式类型转换可能丢失信息，所以不允许在bigint和 Number 之间进行混合操作。当混合使用大整数和浮点数时，结果值可能无法由BigInt或Number精确表示。

```
10 + 10n;    
// → TypeError:Cannot mix BigInt and other types, use explicit conversions
```

1. 不能将BigInt传递给Web api和内置的 JS 函数，这些函数需要一个 Number 类型的数字。尝试这样做会报TypeError错误。

```
Math.max(2n, 4n, 6n);    // → TypeError
```

2. 当 Boolean 类型与 BigInt 类型相遇时，BigInt的处理方式与Number类似，换句话说，只要不是0n，BigInt就被视为truthy的值。

```
if(0n){//条件判断为false

}
if(3n){//条件为true

}
```

3. 元素都为BigInt的数组可以进行sort。

4. BigInt可以正常地进行位运算，如|、&、<<、>>和^