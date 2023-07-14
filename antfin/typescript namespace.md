# namespace——命名空间
```js
// index.ts
namespace Lib {
    const _name = '小明';

    function getName() {
        return _name;
    }
}
```

使用tsc编译文件 `tsc index.ts`
编译后的js文件内容如下：
```js
var Lib;
(function (Lib) {
    var _name = '小明';
    function getName() {
        return _name;
    }
})(Lib || (Lib = {}));
```

可以看到，namespace原理是通过立即执行函数（IIFE）实现，函数执行完毕，函数内部的变量无法从外界（global scope）获得。

为了获得namespace内部的变量或者函数，可以通过export关键字将namespace中的变量暴露出来，然后通过命名空间名称访问暴露的变量。
```js
namespace Lib {
    const _name = '小明';

    // 使用export关键字导出getName
    export function getName() {
        return _name;
    }
}

// 通过命名空间名称访问内部的变量（函数）
console.log(Lib.getName());
```

使用tsc编译，编译通过，编译后的js文件内容如下：
```js
var Lib;
(function (Lib) {
    var _name = '小明';
    // 使用export关键字导出getName
    function getName() {
        return _name;
    }
    Lib.getName = getName;
})(Lib || (Lib = {}));
// 通过命名空间名称访问内部的变量（函数）
console.log(Lib.getName());
```
可以看到编译后的代码，通过将getName函数赋值给Lib.getName实现export的功能，所以在命名空间外部可以访问命名空间内部的变量。

通过编译后的js代码可以看到，**namespace本质上是一个object，我们通过object的属性访问命名空间内部的变量。**

# 模块化

Typescript提供了///，它仅在ts编译阶段起作用，用于指示ts编译器定位ts文件。

```js
/// <reference path="./b.ts" />
```

`/// <reference path="" />`与c语言中的#include类似。它必须出现在文件的最上面，本质上就是一段注释，所以它的作用也仅体现在编译阶段。

reference指定的path属性的值是另一个ts文件的路径，用来告诉编译器当前文件编译的依赖文件，有点类似import语句，但是不需要导入指定的变量。

当reference指定指定了一个文件，typescript在编译时，会自动将这个文件包含在编译过程，这个文件内所有的全局变量都会在当前文件（reference指定存在的文件）被获得。

以下面例子为例，在index.ts中，通过`/// <reference path="./math.ts" />`引入math.ts文件。
```js
// ---math.ts
namespace MyMath {
    export const add = (a: number, b: number) => {
        return a + b;
    }
}
```
```js
// ---index.ts
/// <reference path="./math.ts" />

MyMath.add(3, 4);
```
通过`tsc index.ts`编译，编译后有index.js和math.js两个文件，内容如下。
```js
// ---index.js
/// <reference path="./math.ts" />
MyMath.add(3, 4);
```
```js
// ---math.js
var MyMath;
(function (MyMath) {
    MyMath.add = function (a, b) {
        return a + b;
    };
})(MyMath || (MyMath = {}));
```
当然我们无法在Node环境中执行这些代码，因为这是两个分离的文件，并且没有require语句。

我们需要首先将它们打包成一个文件bundle.js，然后使用命令node boundle.js执行。

在浏览器环境中，我们需要使用<script>语句依次加载math.js和index.js文件。
```js
<script src="./math.js"></script>
<script src="./index.js"></script>
```
更好的做法，是使用tsc的--outFile配置选项，将输出文件打包成一个bundle，ts会自动根据reference指令，编译文件。

使用`tsc --outFile bundle.js index.ts`命令编译文件，编译后的bundle.js文件内容如下：
```js
var MyMath;
(function (MyMath) {
    MyMath.add = function (a, b) {
        return a + b;
    };
})(MyMath || (MyMath = {}));
/// <reference path="./math.ts" />
MyMath.add(3, 4);
```


