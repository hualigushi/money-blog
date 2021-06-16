[TOC]

# **1. delete的返回值是什么**

```js
var a = {
    p1: 1
}

console.log(delete a.p1); // true
console.log(delete a.p2); // true

console.log(delete window); // false
```

从上面可以看出delete返回的是布尔值，如果删除成功返回真，这里包括删除一个不存在的属性。 删除失败返回false。



# **2. delete删除不存在的属性返回值是什么**

从第一个demo看出，删除不存在的属性返回值也是`true`



# **3. 能不能删除原型上的属性**

```js
var a = {
    p1: 10
}

a.__proto__ = {
    p2: 20
}

console.log("a.p2:before", a.p2);  // 20
console.log(delete a.p2);   // true
console.log("a.p2:after", a.p2); // 20
```



```js
function Foo(){
    this.name = "name";
}
Foo.prototype.age = 20;

var foo = new Foo();

console.log("foo.p2:before", foo.age);  // 20
console.log(delete foo.age);   // true
console.log("foo.p2:after", foo.age); // 20

```

没法删除原型上的属性



# **4. 能否删除变量**

```js
var a = 10;
console.log(delete a);  // false
console.log("a", a); // 10
```

显然，是删除不掉，你换成函数，结果也是一样的。



# **5. 删除数组某个数据，数组长度会不会变**

```js
var arr = [10,2,16];
console.log("length:before", arr.length);  // 3
console.log("delete", delete arr[1]);   // true
console.log("length:after",arr.length);  // 3
console.log("arr", arr); //  [10, empty, 16]
```

delete删除数据的某个数据，并不会导致数组的长度变短。 对应的数据的值会变成 `empty`, 不是`undefined`或者`null`。 

是未初始化的意思，你用 `new Array(2)` 会得到 `[empty × 2]`。 都是一个意思。

这里我们接着对`empty`扩展一下。

```js
var arr = [0];
arr[10] = 10;

arr.forEach(v=>console.log(v)); // 0 ,10

for(let p in arr){
    console.log(arr[p]);  // 0, 10
}

for(let p of arr){
    console.log(arr[p]);  // 0 ,undefined x 9, 10
}
```

`forEach`和`in` 并不会对未初始化的值进行任何操作。



# **6. 哪些属性不能被删除**

#### 1. var const let等变量 , 全局变量。

```js
delete window  // false
var a;
delete a; // false

// 有意思的delete this
function a (){    
    this.a = 333;
    console.log("delete this:" , delete this);  // true
    console.log("a", this.a, this); // 333, {a:333}
}
a.call({});
```

#### 2. 数据属性configurable为false的属性

ES5严格模式中delete configuable为false的对象时会直接抛异常

```js
// 内置document, location等
Object.getOwnPropertyDescriptor(window, "document");// { configurable: false }
console.log("delete", delete window.document); // false
console.log("delete", delete window.location); // false

// 数组长度
var arr = [];
Object.getOwnPropertyDescriptor(arr, "length");// { configurable: false }
console.log("delete", delete arr.length); // false

// 函数长度
function fn(){};
Object.getOwnPropertyDescriptor(fn, "length");// { configurable: false }
console.log("delete", delete fn.length); // false


// 各种内置原型
Object.getOwnPropertyDescriptor(Object, "prototype") // { configurable: false }
console.log("delete", delete Object.prototype); // false


// 内置Math的函数
Object.getOwnPropertyDescriptor(Math, "PI")  // { configurable: false }
console.log("delete", delete Math.PI); // false


// https://www.cnblogs.com/snandy/archive/2013/03/06/2944815.html
// 有提到正则对象的属性（source、global、ignoreCase、multiline、lastIndex）delete 返回 false
// 实际测试结果，删除返回true，但是没删除掉
var reg = /.*/;
Object.getOwnPropertyDescriptor(reg, "source") // undefined
console.log("delete", delete reg.source); // true
console.log("reg.source", reg.source); // .*
console.log("reg prototype source", reg.__proto__source); // "(?:)

delete reg.lastIndex // false
delete reg.global // true
delete reg.ignoreCase // true
delete reg.multiline // true
```

#### 3. 原型上的属性

#### 4. 函数参数

```js
function delP(){
    console.log("delete", delete arguments);  // false
    console.log("arguments", arguments);  //  0: 1
}

delP(1);
```

#### 5. 一些常量（NaN、Infinity、undefined）

```js
delete NaN; // false
delete Infinity; // false
delete undefined; // false
```

#### 6. 函数声明

```js
function fn() {}
delete fn;
console.log(fn.toString()); // function fn() {}
```



## 小结一下

1. delete 返回false, 一定是没删除成功
2. delete 返回true， 不一定删除成功

所以，delete返回true，最好自己再动手检查一下。万无一失。



# 比较一下性能

我们先创建1万个对象，每个对象都有p0到p24 一共25个属性。 然后我们按照一定的规则**删除属性**和**设置属性为undefined**。

```js
function createObjects(counts = 10000) {

    var arr = [];

    for (let i = 0; i < counts; i++) {
        const obj = {};
        // for (let j = 0; j < pcounts; j++) {
        //     obj[`p${j}`] = `value-${i}-${j}`;
        // }
        arr.push({
            "p0": `value-${i}-0`,
            "p1": `value-${i}-1`,
            "p2": `value-${i}-2`,
            "p3": `value-${i}-3`,
            "p4": `value-${i}-4`,
            "p5": `value-${i}-5`,
            "p6": `value-${i}-6`,
            "p7": `value-${i}-7`,
            "p8": `value-${i}-8`,
            "p9": `value-${i}-9`,
            "p10": `value-${i}-10`,
            "p11": `value-${i}-10`,
            "p12": `value-${i}-10`,
            "p13": `value-${i}-10`,
            "p14": `value-${i}-10`,
            "p15": `value-${i}-10`,
            "p16": `value-${i}-10`,
            "p17": `value-${i}-10`,
            "p18": `value-${i}-10`,
            "p19": `value-${i}-10`,
            "p20": `value-${i}-10`,
            "p21": `value-${i}-10`,
            "p22": `value-${i}-10`,
            "p23": `value-${i}-10`,
            "p24": `value-${i}-10`
        });
    }
    return arr;
}


const arr = createObjects();
const arr2 = createObjects();


console.time("del");
for (let i = 0; i < arr.length; i++) {

    const rd = i % 25;
    delete arr[i][`p${rd}`]

}
console.timeEnd("del");


console.time("set");
for (let i = 0; i < arr2.length; i++) {

    const rd = i % 25;
    arr2[i][`p${rd}`] = undefined;

}
console.timeEnd("set");

// del: 31.68994140625 ms
// set: 6.875 ms

// del: 24.43310546875 ms 
// set: 3.7861328125 ms

// del: 79.622802734375 ms
// set: 3.876953125 ms

// del: 53.015869140625 ms
// set: 3.242919921875 ms

// del: 18.84619140625 ms
// set: 3.645751953125 ms
```

我们记录了大约五次执行事件对比。 可以看出来delete 时间不稳定，而且性能低不少。

到这里，我们还不要惊讶。看我稍微改动一下代码：

```js
function createObjects(counts = 10000) {

    var arr = [];

    for (let i = 0; i < counts; i++) {
        const obj = {};
        // for (let j = 0; j < pcounts; j++) {
        //     obj[`p${j}`] = `value-${i}-${j}`;
        // }
        arr.push({
            0: `value-${i}-0`,
            1: `value-${i}-1`,
            2: `value-${i}-2`,
            3: `value-${i}-3`,
            4: `value-${i}-4`,
            5: `value-${i}-5`,
            6: `value-${i}-6`,
            7: `value-${i}-7`,
            8: `value-${i}-8`,
            9: `value-${i}-9`,
            10: `value-${i}-10`,
            11: `value-${i}-10`,
            12: `value-${i}-10`,
            13: `value-${i}-10`,
            14: `value-${i}-10`,
            15: `value-${i}-10`,
            16: `value-${i}-10`,
            17: `value-${i}-10`,
            18: `value-${i}-10`,
            19: `value-${i}-10`,
            20: `value-${i}-10`,
            21: `value-${i}-10`,
            22: `value-${i}-10`,
            23: `value-${i}-10`,
            24: `value-${i}-10`
        });
    }
    return arr;
}

const arr = createObjects();
const arr2 = createObjects();

console.time("del");
for (let i = 0; i < arr.length; i++) {

    const rd = i % 25;
    delete arr[i][rd]

}
console.timeEnd("del");


console.time("set");
for (let i = 0; i < arr2.length; i++) {

    const rd = i % 25;
    arr2[i][rd] = undefined;

}
console.timeEnd("set");


// del: 1.44189453125 ms
// set: 2.43212890625 ms

// del: 1.737060546875 ms 
// set: 3.10400390625 ms

// del: 1.281005859375 ms
// set: 2.85107421875 ms

// del: 1.338134765625 ms
// set: 1.877197265625 ms

// del: 1.3203125 ms
// set: 2.09912109375 ms
```

到这里，画风一转。 del居然比set还快了。。。。。。  ，而set的速度实际基本没有什么变化。

 这里就要说到 `常规属性`和`排序属性` 啦， 排序属性的属性值为数字，属性值为字符串的属于常规属性。

上面第一种情况就是全部是常规属性，第二种情况全部是排序属性。



## 常规属性 (properties) 和排序属性 (element)

上面的代码变化不多，就是属性名称从`p0`格式修改为了`0`格式。 `p0`正式常规属性，`0`是排序属性。

对象中的数字属性称为排序属性，在 V8 中被称为 elements。

字符串属性就被称为常规属性，在 V8 中被称为 properties。

在 ECMAScript **规范中定义了数字属性应该按照索引值大小升序排列，字符串属性根据创建时的顺序升序排列。**

```js
function Foo() {
    this[3] = '3'        
    this["B"] = 'B'
    this[2] = '2'
    this[1] = '1'
    this["A"] = 'A'
    this["C"] = 'C'
}

var foo = new Foo()

for (key in foo) {
    console.log(`key:${key}  value:${foo[key]}`)
}

// key:1  value:1
// key:2  value:2
// key:3  value:3
// key:B  value:B
// key:A  value:A
// key:C  value:C
```

我们的数字属性设置的顺序为  3 -> 2 -> 1, 实际遍历输出的时候为 1->2->3; 我们的字符串属性设置顺序为 B->A->C, 实际输出 B->A->C。

到这里为止，我们知道我们的两个栗子，一个使用的是数字属性（排序属性），一个使用的是字符串属性（常规属性）。

暂停一下： **有一种说法，逆向删除属性，不会导致map被改变。要不要试试。**

说到这里，大家还会说，就算是这样。和速度有毛关系？

现在是还看不来，我们还要提出一个新的概念，隐藏类。



## 隐藏类

> 图解 Google V8 里面是这样描述的：

V8 在运行 JavaScript 的过程中，会假设 JavaScript 中的对象是静态的，具体地讲，V8 对每个对象做如下两点假设：

- 对象创建好了之后就不会添加新的属性；
- 对象创建好了之后也不会删除属性。



具体地讲，V8 会为每个对象创建一个隐藏类，对象的隐藏类中记录了该对象一些基础的布局信息，包括以下两点：

- 对象中所包含的所有的属性；
- 每个属性相对于对象的偏移量。



有了隐藏类之后，那么当 V8 访问某个对象中的某个属性时，就会先去隐藏类中查找该属性相对于它的对象的偏移量，有了偏移量和属性类型，V8 就可以直接去内存中取出对于的属性值，而不需要经历一系列的查找过程，那么这就大大提升了 V8 查找对象的效率。



**多个对象共用一个隐藏类**

那么，什么情况下两个对象的形状是相同的，要满足以下两点：

- 相同的属性名称；
- 相等的属性个数

在执行过程中，**对象的形状是可以被改变的，如果某个对象的形状改变了，隐藏类也会随着改变，这意味着 V8 要为新改变的对象重新构建新的隐藏类**，这对于 V8 的执行效率来说，是一笔大的开销。

看到红色部分，你就应该差不多得到答案了。

那如何查看隐藏类呢？ 使用chrome的开发者工具，Memory模块的 Heap snapshot功能： ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e8b137f75646454fb700ebfaa88bd54e~tplv-k3u1fbpfcp-zoom-1.image)



然后再搜索对应的构造函数，比如`Foo` ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3f5ca078d6a9456ab957653a6fbef1b0~tplv-k3u1fbpfcp-zoom-1.image)

这里为了方便查找，我们简单包装一下代码： 先看常规属性：

验证流程很简单：

1. 先创建好两个Foo实例， take snapshot
2. 执行删除操作，再takge snapshot

```js
function Foo() {
    this.create = (counts = 10000, prefix = "") => {
        this.arr = createObjects(counts, prefix);
    }
}


function createObjects(counts = 10000, prefix = "") {
    var arr = [];
    for (let i = 0; i < counts; i++) {
        arr.push({
            "p0": `${prefix}-value-${i}-0`,
            "p1": `${prefix}-value-${i}-1`,
            "p2": `${prefix}-value-${i}-2`                   
        });
    }
    return arr;
}


var counts = 2;

var foo1 = new Foo();
var foo2 = new Foo();

foo1.create(counts, "del");
foo2.create(counts, "set");

var propertiesCount = 3;

document.getElementById("btnDelete").addEventListener("click", () => {

    console.time("del");
    for (let i = 0; i < foo1.arr.length; i++) {

        const rd = i % propertiesCount;
        delete foo1.arr[i][`p${rd}`];

    }
    console.timeEnd("del");


    console.time("set");
    for (let i = 0; i < foo2.arr.length; i++) {

        const rd = i % propertiesCount;
        foo2.arr[i][`p${rd}`] = undefined;

    }
    console.timeEnd("set");
})
```

看看执行前后的截图：

执行删除前： ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f7e3b4e70143440f9e589f3a0cae922c~tplv-k3u1fbpfcp-zoom-1.image)

执行删除后： ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/39b35b82f24d412eac4da1a729f8b756~tplv-k3u1fbpfcp-zoom-1.image)

可以看出使用delete删除属性的对象的map发生了变化。

我们调整一下

```js
function createObjects(counts = 10000, prefix = "") {
    var arr = [];
    for (let i = 0; i < counts; i++) {
        arr.push({
            0: `${prefix}-value-${i}-0`,
            1: `${prefix}-value-${i}-1`,
            2: `${prefix}-value-${i}-2`                   
        });
    }
    return arr;
}
```

就只看删除操作后的截图吧： 执行删除后： ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b60a0e6a91fd4167a41cdbd2b80b3d4a~tplv-k3u1fbpfcp-zoom-1.image)

map没有变化。

借用

> 图解 Google V8 总结的一句话。

**尽量避免使用 delete 方法。delete 方法会破坏对象的形状，同样会导致 V8 为该对象重新生成新的隐藏类。**



# 总结

从我们测试来看，使用排序属性执行delete，并未导致对象的隐藏类被改变。 而常规属性就没那么幸运了。 所以使用delete来删除常规属性的代价是相对比较大的。

我们简单回顾一下：

1. delete 很多时候删不掉。
2. delete 返回true的时候，也不代表一定删除成功。 比如原型上的属性。
3. delete 某些场景下会导致隐藏类改变，可能导致性能问题。

这几条，就足以让我们谨慎使用delete。



## 额外的

**排序属性的结构也是会变化的。** 我们首先贴一段代码出来:

1. 在Foo的实例上面有序的数字属性
2. 一顿猛如虎的瞎操作
3. 观察变化

```js
function Foo() {
    this.create = (counts = 10, prefix = "") => {
        createPropertes.call(this, counts);
    }
}

function createPropertes(counts = 10) {
    for (let i = 0; i < counts; i++) {
        this[i] = `${i}-${Math.random()}`;
    }
}

var foo = new Foo();
foo.create();

document.getElementById("btnDelete").addEventListener("click", () => {
    actions();
    console.log("actions", " done");
})

function actions() {
    foo[100000] = `${100000}-${Math.random()}`;
    foo[100] = `${100}-${Math.random()}`;
    delete foo[9];
    foo[2] = `2-${Math.random()}`;
}
```

还是看图，比较给力： ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a2c481a8e08b4a5c91b76b16cae854ef~tplv-k3u1fbpfcp-zoom-1.image)

是不是惊喜的发现结构变化啦，那是不是`for in`的时候，顺序也会变化呢。 答案不是的，那他是怎么做到的呢？

答案： `elements默认应该采用连续的存储结构，直接下标访问，提升访问速度。但当elements的序号十分不连续时或者操作过猛，会优化成为hash表。`

