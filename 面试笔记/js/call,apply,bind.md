

## call,apply,bind的基本介绍

#### 语法：

```
fun.call(thisArg, param1, param2, ...)
fun.apply(thisArg, [param1,param2,...])
fun.bind(thisArg, param1, param2, ...)
```

#### 返回值：

call/apply： `fun`执行的结果 

bind：返回 `fun`的拷贝，并拥有指定的 `this`值和初始参数

#### 参数

`thisArg`(可选):

1. **`fun`的 `this`指向 `thisArg`对象**
2. 非严格模式下：thisArg指定为null，undefined，fun中的this指向window对象.
3. 严格模式下： `fun`的 `this`为 `undefined`
4. 值为原始值(数字，字符串，布尔值)的this会指向该原始值的自动包装对象，如 String、Number、Boolean

`param1,param2`(可选): 传给 `fun`的参数。

1. 如果param不传或为 null/undefined，则表示不需要传入任何参数.
2. apply第二个参数为数组，数组内的值为传给 `fun`的参数。

#### 调用 `call`/ `apply`/ `bind`的必须是个函数

call、apply和bind是挂在Function对象上的三个方法,只有函数才有这些方法。

只要是函数就可以，比如: `Object.prototype.toString`就是个函数，我们经常看到这样的用法： `Object.prototype.toString.call(data)`



## call/apply与bind的区别

**执行**：

- call/apply改变了函数的this上下文后马上**执行该函数**
- bind则是返回改变了上下文后的函数,**不执行该函数**

**返回值**:

- call/apply 返回 `fun`的执行结果
- bind返回fun的拷贝，并指定了fun的this指向，保存了fun的参数。



## call和apply的应用场景

> 这些应用场景，多加体会就可以发现它们的理念都是：借用方法

1. 判断数据类型：

`Object.prototype.toString`用来判断类型再合适不过，借用它我们几乎可以判断所有类型的数据：

2. 类数组借用数组的方法：

类数组因为不是真正的数组所有没有数组类型上自带的种种方法，所以我们需要去借用数组的方法。

比如借用数组的push方法：

```
var arrayLike = { 
  0: 'OB',  
  1: 'Koro1',  
  length: 2
}
Array.prototype.push.call(arrayLike, '添加元素1', '添加元素2');
console.log(arrayLike) 
// {"0":"OB","1":"Koro1","2":"添加元素1","3":"添加元素2","length":4}
```

3. apply获取数组最大值最小值：

apply直接传递数组做要调用方法的参数，也省一步展开数组，比如使用 `Math.max`、 `Math.min`来获取数组的最大值/最小值:

```
const arr = [15, 6, 12, 13, 16];
const max = Math.max.apply(Math, arr); // 16
const min = Math.min.apply(Math, arr); // 6
```

4. 继承

ES5的继承也都是通过借用父类的构造方法来实现父类方法/属性的继承：

```
// 父类
function supFather(name) {    
  this.name = name;    
  this.colors = ['red', 'blue', 'green']; // 复杂类型
}
supFather.prototype.sayName = function (age) {    
  console.log(this.name, 'age');
};
// 子类
function sub(name, age) {    
  // 借用父类的方法：修改它的this指向,赋值父类的构造函数里面方法、属性到子类上                       supFather.call(this, name);   
  this.age = age;
}
// 重写子类的prototype，修正constructor指向function 
inheritPrototype(sonFn, fatherFn) {    
  sonFn.prototype = Object.create(fatherFn.prototype); // 继承父类的属性以及方法             sonFn.prototype.constructor = sonFn; // 修正constructor指向到继承的那个函数上
} 
inheritPrototype(sub, supFather);
sub.prototype.sayAge = function () {    
    console.log(this.age, 'foo');
};
// 实例化子类，可以在实例上找到属性、方法const instance1 = new sub("OBKoro1", 24);const instance2 = new sub("小明", 18);
instance1.colors.push('black')
console.log(instance1) 
// {"name":"OBKoro1","colors":["red","blue","green","black"],"age":24}
console.log(instance2) 
// {"name":"小明","colors":["red","blue","green"],"age":18}
```

## bind的应用场景

1.保存函数参数

```
for (var i = 1; i <= 5; i++) {
  // 缓存参数
  setTimeout(function (i) {
    console.log('bind', i) // 依次输出：1 2 3 4 5
  }.bind(null, i), i * 1000);
}
```

2. 回调函数this丢失问题：

这是一个常见的问题，下面是我在开发VSCode插件处理 `webview`通信时，遇到的真实问题，一开始以为VSCode的API哪里出问题，调试了一番才发现是 `this`指向丢失的问题。

```
class Page {    
  constructor(callBack) {        
    this.className = 'Page'        
    this.MessageCallBack = callBack //        
    this.MessageCallBack('发给注册页面的信息') // 执行PageA的回调函数    
  }
}
class PageA {    
  constructor() {        
    this.className = 'PageA'        
    this.pageClass = new Page(this.handleMessage) // 注册页面 传递回调函数 问题在这里    
  }    
  // 与页面通信回调    
  handleMessage(msg) {        
    console.log('处理通信', this.className, msg) //  'Page' this指向错误    
  }
}
new PageA()
```

回调函数 `this`为何会丢失？

显然声明的时候不会出现问题，执行回调函数的时候也不可能出现问题。

问题出在传递回调函数的时候：

```
this.pageClass = new Page(this.handleMessage)
```

因为传递过去的 `this.handleMessage`是一个函数内存地址，没有上下文对象，也就是说该函数没有绑定它的 `this`指向。

那它的 `this`指向于它所应用的绑定规则：

```
class Page {    
  constructor(callBack) {        
  this.className = 'Page'        
  // callBack() // 直接执行的话 由于class 内部是严格模式，所以this 实际指向的是 undefined          this.MessageCallBack = callBack // 回调函数的this 隐式绑定到class page             this.MessageCallBack('发给注册页面的信息')    
  }
}
```

既然知道问题了，那我们只要绑定回调函数的 `this`指向为 `PageA`就解决问题了。

**回调函数this丢失的解决方案**：

1. `bind`绑定回调函数的 `this`指向：

这是典型bind的应用场景, 绑定this指向，用做回调函数。

```
this.pageClass = new Page(this.handleMessage.bind(this)) // 绑定回调函数的this指向
```

PS：这也是为什么 `react`的 `render`函数在绑定回调函数的时候，也要使用bind绑定一下 `this`的指向，也是因为同样的问题以及原理。

2. 箭头函数绑定this指向

箭头函数的this指向定义的时候外层第一个普通函数的this，在这里指的是class类： `PageA`

```
this.pageClass = new Page(() => this.handleMessage()) // 箭头函数绑定this指向
```





#### 手写实现一个 `call`

**思路**

1. 根据call的规则设置上下文对象,也就是 `this`的指向。

2. 通过设置 `context`的属性,将函数的this指向隐式绑定到context上

3. 通过隐式绑定执行函数并传递参数。

4. 删除临时属性，返回函数执行结果

   ```
   Function.prototype.myCall = function (context, ...arr) {    
     if (context === null || context === undefined) {       
       // 指定为 null 和 undefined 的 this 值会自动指向全局对象(浏览器中为window)        
       context = window    
     } else {        
       context = Object(context) // 值为原始值（数字，字符串，布尔值）的 this 会指向该原始值的实例对象    
     }   
     context.testFn = this; // 函数的this指向隐式绑定到context上    
     let result = context.testFn(...arr); // 通过隐式绑定执行函数并传递参数    
     delete context.testFn; // 删除上下文对象的属性    
     return result; // 返回函数执行结果
   };
   ```

   #### 判断函数的上下文对象：

   很多人判断函数上下文对象，只是简单的以 `context`是否为false来判断,比如：

   ```
   // 判断函数上下文绑定到`window`不够严谨
   context = context ? Object(context) : window; 
   context = context || window; 
   ```

   经过测试,以下三种为false的情况,函数的上下文对象都会绑定到 `window`上：

   ```
   // 网上的其他绑定函数上下文对象的方案: context = context || window;
   function handle(...params) {    
     this.test = 'handle'    
     console.log('params', this, ...params) 
     // do some thing
   }
   handle.elseCall('') // window
   handle.elseCall(0) // window
   handle.elseCall(false) // window
   ```

   而 `call`则将函数的上下文对象会绑定到这些原始值的实例对象上

   

#### 手写实现一个 `apply`

思路：

1. 传递给函数的参数处理，不太一样，其他部分跟 `call`一样。
2. `apply`接受第二个参数为类数组对象, 这里用了JavaScript权威指南中判断是否为类数组对象的方法。

```
Function.prototype.myApply = function (context) {    
  if (context === null || context === undefined) {        
    context = window // 指定为 null 和 undefined 的 this 值会自动指向全局对象(浏览器中为window)    
    } else {        
      context = Object(context) // 值为原始值（数字，字符串，布尔值）的 this 会指向该原始值的实例对象    
    }    
    // JavaScript权威指南判断是否为类数组对象    
    function isArrayLike(o) {        
      if (o &&                                // o不是null、undefined等                  typeof o === 'object' &&                      // o是对象            
      isFinite(o.length) &&                   // o.length是有限数值            
      o.length >= 0 &&                        // o.length为非负值            
      o.length === Math.floor(o.length) &&    // o.length是整数            
      o.length < 4294967296)                  // o.length < 2^32            
      return true        
    else            
      return false    
    }    
    context.testFn = this; // 隐式绑定this指向到context上    
    const args = arguments[1]; // 获取参数数组    
    let result    // 处理传进来的第二个参数    
    if (args) {        // 是否传递第二个参数        
      if (!Array.isArray(args) && !isArrayLike(args)) {            
        throw new TypeError('myApply 第二个参数不为数组并且不为类数组对象抛出错误');       
      } else {            
        args = Array.from(args) // 转为数组            
        result = context.testFn(...args); // 执行函数并展开数组，传递函数参数        
      }   
    } else {    
      result = context.testFn(); // 执行函数    
    }    
    delete context.testFn; // 删除上下文对象的属性   
    return result; // 返回函数执行结果
};
```



#### 手写实现一个 `bind`

**思路**

1. 拷贝源函数:

2. - 通过变量储存源函数
   - 使用 `Object.create`复制源函数的prototype给fToBind

3. 返回拷贝的函数

4. 调用拷贝的函数：

5. - new调用判断：通过 `instanceof`判断函数是否通过 `new`调用，来决定绑定的 `context`
   - 绑定this+传递参数
   - 返回源函数的执行结果

```
Function.prototype.myBind = function (objThis, ...params) {    
  const thisFn = this; // 存储源函数以及上方的params(函数参数)    
  let fToBind = function () {        
    const isNew = this instanceof fToBind // this是否是fToBind的实例 也就是返回的fToBind是否通过new调用        
    const context = isNew ? this : Object(objThis) // new调用就绑定到this上,否则就绑定到传入的objThis上        
    return thisFn.apply(context, params); // 用apply调用源函数绑定this的指向并传递参数,返回执行结果    
  };    
fToBind.prototype = Object.create(thisFn.prototype); // 复制源函数的prototype给fToBind    
  return fToBind; // 返回拷贝的函数
};
```