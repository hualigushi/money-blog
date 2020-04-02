模块化的主要特征是:

- 可复用
- 封装了变量和函数，和全局的 namaspace 不接触，松耦合
- 只暴露可用的 public 方法，其它私有方法全部隐藏

## 1. CommonJS

Node.js 是 CommonJS 规范的主要实践者，它有四个重要的环境变量为模块化的实现提供支持：module、exports、require、global。实际使用时，通过 module.exports 导出对外的变量或接口，通过 require 导入其它模块的输出到当前的模块的作用域中。

#### 模块定义

```
//  定义模块 math.js
var basicNum = 0;
function add(a, b) {
    return a + b;
}

module.exports = { // 在这里写需要向外暴露的变量或函数
    basicNum: basicNum,
    add: add
};
```

#### 模块引用

```
// 引入自定义的模块，参数需要包含路径，可省略后缀.js
var math = require('./math);
math.add(3, 5);

// 引入核心模块，参数直接写模块名，不需要包含路径
var http = require('http');
http.createServer(...).listen(8080);
```

##### module.exports v.s. exports

很多时候，我们会看到在一个模块中有两种方式来输出变量：
方式一：对 `module.exports` 赋值

```
// hello.js
function sayHello() {
    console.log('Hello');
}
function sayGoodbye() {
    console.log('Goodbye');
}

module.exports = {
    sayHello: sayHello,
    sayGoodbye: sayGoodbye
};
```

方式二：直接使用 exports

```
// hello.js
function sayHello() {
    console.log('Hello');
}
function sayGoodbye() {
    console.log('Goodbye');
}

exports.sayHello = sayHello;
exports.sayGoodbye = sayGoodbye;
```

但是，不可以直接对 exports 赋值。

```
// 代码可以执行，但是并没有输出任何变量
exports = {
    sayHello: sayHello,
    sayGoodbye: sayGoodbye
};
```

原因是什么呢？我们来分析一下 Node.js 的加载机制。
首先，Node.js 会把待加载的文件 hello.js 放入一个包装函数 load() 中执行。在执行 load() 函数前，Node.js 准备好了 module 变量：

```
var module = {
    id: 'hello',
    exports: {}
};
```

load() 函数最终返回 `module.exports`：

```
var load = function(module) {
    // hello.js 文件的内容
    ...
    
    // load 函数返回
    return module.exports;
};

var exports = load(module);
```

也就是说，exports 实际上是 `module.exports` 的引用，或者理解为 exports 是一个指针，指向 `module.exports` ，所以在使用 exports 的时候，只能是 `exports.sayHello = function() {...}` 这样的方式，而不能使用 `exports = { sayHello: function() {}}`，这种方式相当于重新定义了 exports，`module.exports` 仍然是空对象 {}，所以给 exports 赋值是无效的。

优点：解决了依赖、全局变量污染的问题。

缺点：CommonJS 用同步的方式加载模块。在服务端，模块文件都存在本地磁盘，读取非常快，所以这样做不会有问题。但是在浏览器端，限于网络原因，更合理的方案是使用异步加载。

# 2. AMD

AMD( Asynchronous Module Definition ) 是 Require.js 在推广过程中对模块定义的规范化产出。

AMD 规范采用异步方式加载模块，所有依赖这个模块的语句都定义在一个回调函数中，等到加载完成后，这个回调函数才会执行。

实现 AMD 规范的模块化通过 define() 方法将代码定义为模块，通过 require() 方法实现模块的加载。

这里以 require.js 为例，首先将 `require.js` 引入到页面中：

```
<script src="js/require.js" data-main="js/main"></script>
```

#### 定义模块

（1）独立模块

即 不需要依赖任何其他模块

```
// math.js
define(function() {
    var basicNum = 0;
    var add = function(a, b) {
        return a + b;
    };
    return {
        basicNum: basicNum,
        add: add
    };
});
```

（2）非独立模块

即 需要依赖其他模块

```
define(['underscore'], function(_) {
    var classify = function(list) {
        _.countBy(list, function(num) {
            return num > 30 ? 'old' : 'young';
        });
    };
    return {
        classify: classify
    };
});
```

#### 引用模块

```
require(['jquery', 'math'], function($, math) {
    var sum = math.add(3, 5);
    $('#sum').html(sum);
});
```

require.js 还提供了一个 API： `require.config()` ，可以用来配置项目中用到的基础模块。

```
// 通过 config() 指定各模块路径和引用名
require.config({
    baseUrl: 'js/lib',
    paths: {
        'jquery': 'jquery.min', // 实际路径为 js/lib/jquery.min.js
        'underscore': 'underscore.min'
    }
});

// 引入模块
require(['jquery', 'underscore']， function($, _) {
    ...
});
```

优点：适合在浏览器环境中异步加载模块，可以并行加载多个模块。

缺点：不能按需加载，开发成本大。

## 3. CMD

CMD( Common Module Definition ) 是 Sea.js 在推广过程中对模块定义的规范化产出。

AMD 推崇依赖前置、提前执行，CMD 推崇依赖就近、延迟执行。

```
// AMD 写法
define(['a', 'b', 'c', 'd', 'e'], function(a, b, c, d, e) {
    // 等于在最前面声明并初始化了所有依赖的模块
    a.doSomething();
    if (false) {
        // 即使没有用到某个模块 b，但 b 还是提前执行了
        b.doSomething();
    }
});

// CMD 写法
define(function(require, exports, module) {
    var a = require('./a); // 在需要时声明
    a.doSomething();
    if (false) {
        var b = require('./b);
        b.doSomething();
    }
});
```

## 4. UMD

UMD ( Universal Module Definition )，希望提供一个前后端跨平台的解决方案(支持 AMD 与 CommonJS 模块方式)。

UMD 的实现原理：

1. 先判断是否支持 Node.js 模块格式( exports 是否存在 )，存在则使用 Node.js 模块格式。
2. 再判断是否支持 AMD（define 是否存在），存在则使用 AMD 方式加载模块。
3. 前两个都不存在，则将模块公开到全局( window 或 global )。

下面是一个示例：`eventUtil.js`

```
(function(root, factory) {
    if (typef exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.eventUtil = factory();
    }
})(this, function() {
    // module
    return {
        addEvent: function(el, type, handle) {
            // ...
        },
        removeEvent: function(el, type, handle) {
            // ...
        }
    };
});
```

## 5. ES6 Module

在 ES6 中， 我们可以通过 import 引入模块，通过 export 导出模块，功能比前几个方案更强大，也是我们推荐使用的，但是由于浏览器对 ES6 的支持程度不同，目前都是使用 babel 或 traceur 把 ES6 代码转化为 ES5 代码，然后再在浏览器环境中执行。

```
// 定义模块 math.js
var basicNum = 0;
var add = function(a, b) {
    return a + b;
};

export { basicNum, add };
```

```
// 引用模块
import { basicNum, add } from './math';

function test(element) {
    element.textContent = add(basicNum, 99);
}
test();
```

导出模块时还可以用 `export default` ，为模块指定默认输出，对应的 import 语句不需要使用大括号。

```
// 输出模块
export default {
    basicNum,
    add
}

// 引入模块
import math from './math';
```

注：一个模块只能有一个 export default。

## 6. CommonJS 与 ES6 模块化的差异

1. CommonJS 支持动态导入，也就是 require(${path}/xx.js) ，ES6 目前还不支持，但是已有提案。

2. CommonJS 是同步导入，ES6是异步导入。

- CommonJS 因为用于服务端，文件都在本地，同步导入即使卡住主线程影响也不大。
- ES6 因为用于浏览器，需要下载文件，如果也采用同步导入会对渲染有很大影响。

3. CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。

- CommonJS 模块输出的是值的拷贝，也就是说，一旦输出一个值，模块内部的变化就影响不到这个值；另一方面，如果导出的值变了，导入的值也不会变，所以如果想更新值，必须重新导入一次。
- ES6 采用实时绑定的方式，导入和导出的值都指向同一个内存地址，所以导入的值会跟随导出的值变化。

4. CommonJS 模块是运行时加载，ES6 模块是编译时加载。

- CommonJS 模块就是一个对象，在导入时先加载整个模块，生成一个对象( 这个对象只有在脚本运行完才会生成 )，然后再从这个对象上读取方法，这种加载称为“运行时加载”。
- ES6 模块不是对象，它的对外接口只是一种静态定义，在代码运行之前( 即编译时 )的静态解析阶段就完成了模块加载，比 CommonJS 模块的加载方式更高效。


## CommonJS和ES6模块化的区别

ES6 模块化
- import只会导入一次，无论你引入多少次
- 有提升效果，import会自动提升到顶部，首先执行
- import命令输入的变量都是只读的，因为它的本质是输入接口。也就是说，不允许在加载模块的脚本里面，改写接口。如果脚本加载了变量，对其重新赋值就会报错，因为变量是一个只读的接口。但是，如果是一个对象，改写对象的属性是允许的。（对象只能改变值但不能改变引用）
- 由于import是静态执行，所以不能使用表达式和变量，这些只有在运行时才能得到结果的语法结构。
- import后面的from指定模块文件的位置，可以是相对路径，也可以是绝对路径，.js后缀可以省略。如果只是模块名，不带有路径，那么必须有配置文件，告诉
JavaScript 引擎该模块的位置。
- 循环加载时，ES6模块是动态引用。只要两个模块之间存在某个引用，代码就能够执行。

CommonJs
- 所有代码都运行在模块作用域，不会污染全局作用域。
- 模块可以多次加载，但是只会在第一次加载时运行一次，然后运行结果就被缓存了，以后再加载，就直接读取缓存结果。要想让模块再次运行，必须清除缓存。
- 模块加载的顺序，按照其在代码中出现的顺序。
- CommonJs规范加载模块是同步的，即只有加载完成，才能执行后面的操作
- CommonJs模块的加载机制是，输入的是被输出的值的拷贝，即，一旦输出一个值，模块内部的变化影响不到这个值
- 对于基本数据类型，属于复制。即会被模块缓存。同时，在另一个模块可以对该模块输出的变量重新赋值。对于复杂数据类型，属于浅拷贝。由于两个模块引用的对象指向同一个内存空间，因此对该模块的值做修改时会影响另一个模块。
- 当使用require命令加载某个模块时，就会运行整个模块的代码。
- 循环加载时，属于加载时执行。即脚本代码在require的时候，就会全部执行。一旦出现某个模块被"循环加载"，就只输出已经执行的部分，还未执行的部分不会输出。
```
// lib.js
var counter = 3;
function incCounter() {
  counter++;
}
module.exports = {
  counter: counter,
  incCounter: incCounter,
};
// main.js
var mod = require('./lib');
 
console.log(mod.counter);  // 3
mod.incCounter();
console.log(mod.counter); // 3
```
lib.js模块加载以后，它的内部变化就影响不到输出的mod.counter了。这是因为mod.counter是一个原始类型的值，会被缓存。除非写成一个函数，才能得到内部变动后的值
```
var counter = 3;
function incCounter() {
    counter++;
}
module.exports = {
    get counter() {
        return counter
    },
    incCounter: incCounter,
};
```
```
// lib.js
export let counter = 3;
export function incCounter() {
  counter++;
}
 
// main.js
import { counter, incCounter } from './lib';
console.log(counter); // 3
incCounter();
console.log(counter); // 4
```
CommonJS 模块输出的是值的拷贝，也就是说，一旦输出一个值，模块内部的变化就影响不到这个值。而ES6 模块是动态地去被加载的模块取值，并且变量总是绑定其所在的模块。
