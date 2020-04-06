```
function foo() { 
    console.log(this.bar); 
} 
var bar = "bar1"; 
var o2 = {bar: "bar2", foo: foo}; 
var o3 = {bar: "bar3", foo: foo}; 

foo();            
o2.foo();          
foo.call(o3);   

三个函数调用分别输出：”bar1”, ”bar2”, ”bar3”。因此这三者分别是默认绑定、隐式绑定和显式绑定。
```

```
var name = 'Nicolas';
function Person(){
    this.name = 'Smiley';
    this.sayName=function(){
        console.log(this); 
        console.log(this.name); 
    };
    setTimeout(this.sayName, 0);     // 第二次输出
}

var person = new Person();
person.sayName();

第一次输出的是Person, Smiley。

第二次输出的结果是window，Nicolas。尽管setTimeout是在构造函数中定义的，但是调用的时候，是在window中调用。

SetTimeout等许多之后被触发的事件当中，一定要注意this的指向，这是基于调用点（call stack）的 。
```

```
function Person() {
  this.name = "Smiley";
  this.sayName = function(){
    console.log(this);
    console.log(this.name); 
  };
}

let person = new Person();
person.sayName.call({name: "Nicolas"});

输出是{name: "Nicolas"}和”Nicolas”，是显式绑定
```

```
function Person() {
  this.name = "Smiley";
  this.sayName = function(){
    console.log(this);
    console.log(this.name); 
  };
}

let person = new Person();
let sayNameCopy = person.sayName;
sayNameCopy();

window和undefined。因为，这个时候符合默认绑定的规则
```
```
function Person() {
  this.name = "Smiley";
  this.sayName = ()=> {
    console.log(this);
    console.log(this.name); 
  };
}

let person = new Person();
person.sayName.call({name: "Nicolas"});

只改动了一处：把sayName改为箭头函数。结果则变成了Person和"Smiley"。

这是因为箭头函数并没有自己的this，被定义在哪里，this就指向谁，且优先级比显式调用高，因此，this仍指向Person。
```

```
如果存在多次调用，对象属性引用链只有上一层或者说最后一层在调用位置中起作用

function foo() {     
  console.log( this.a ) 
}

var obj2 = {      
  a: 42,     
  foo: foo 
}

var obj1 = {     
  a: 2,     
  obj2: obj2 
}

obj1.obj2.foo(); // 42
```

```
一个最常见的this绑定问题就是被隐式绑定的函数会丢失绑定对象，也就是说他回应用默认绑定，从而把this绑定到全局对象或者undefined上，取决于是否是严格模式。

function foo() {
    console.log( this.a )
}

var obj1 = {
    a: 2,
    foo: foo
}

var bar = obj1.foo; // 函数别名！

var a = "oops, global"; // a是全局对象的属性

bar(); // "oops, global"

虽然bar是obj.foo的一个引用，但是实际上，它引用的是foo函数本身，因此此时的bar()其实是一个不带任何修饰的函数调用，因此应用了默认绑定
```

```
function foo() {
    console.log( this.a )
}

function doFoo( fn ){
    // fn 其实引用的是 foo
    fn(); // <-- 调用位置！
}

var obj = {
    a: 2,
    foo: foo
}

var a = "oops, global"; // a是全局对象的属性

doFoo( obj.foo ); // "oops, global"

参数传递其实就是一种隐式赋值，因此我们传入函数时也会被隐式赋值，所以结果和上一个例子一样，

如果把函数传入语言内置的函数而不是传入自己声明的函数（如setTimeout等），结果也是一样的
```

```
function foo( something ) {
    console.log( this.a, something)
    return this.a + something
}

var obj = {
    a: 2
}

var bar = function() {
    return foo.apply( obj, arguments)
}

var b = bar(3); // 2 3
console.log(b); // 5

在bar函数中，foo使用apply函数绑定了obj，也就是说foo中的this将指向obj，与此同时，使用arguments（不限制传入参数的数量）作为参数传入foo函数中；

所以在运行bar(3)的时候，首先输出obj.a也就是2和传入的3，然后foo返回了两者的相加值，所以b的值为5
```

```
function foo(something){
    this.a = something
}

var obj1 = {}

var bar = foo.bind(obj1);
bar(2);
console.log(obj1.a); // 2

var baz = new bar(3);
console.log(obj1.a); // 2
console.log(baz.a); // 3

new绑定修改了硬绑定中的this，所以new绑定的优先级比显式绑定更高
```
```
var length = 10;

function fn() {
    console.log(this.length);
}
var obj = {
    length: 5,
    method: function(fn) {
        fn();
        arguments[0]();
    }
}
obj.method(fn, 1)

答案是：10 2

第一个输出10，大家都知道this所在函数fn无人调用的情况下this指向window，this.length 就是全局的length；不是obj对象的length；所以第一个答案是10；

首先arguments是个类数组，也是个对象；所以arguments0的意思就是这个arguments这个对象调用fn，所有this是这个类数组对象；他的长度有两个；所以结果是2；

如果obj.method(fn, 1，,2)第二个的结果就是3；

那么如果我们想让method方法里的fn()打印obj的属性length那么就要改变this的指向；可以写fn.call(obj);这样打印出来的结果就是5了；
```

```
function sayHi(){
    console.log('Hello,', this.name);
}
var person1 = {
    name: 'YvetteLau',
    sayHi: function(){
        setTimeout(function(){
            console.log('Hello,',this.name);
        })
    }
}
var person2 = {
    name: 'Christina',
    sayHi: sayHi
}
var name='Wiliam';
person1.sayHi();
setTimeout(person2.sayHi,100);
setTimeout(function(){
    person2.sayHi();
},200);

Hello, Wiliam
Hello, Wiliam
Hello, Christina

setTimeout(fn,delay){ fn(); }, 相当于是将 person2.sayHi 赋值给了一个变量，最后执行了变量，这个时候，sayHi 中的 this 显然和 person2 就没有关系了。

第三条虽然也是在 setTimeout 的回调中，但是我们可以看出，这是执行的是 person2.sayHi() 使用的是隐式绑定，因此这是 this 指向的是 person2，跟当前的作用域没有任何关系。
```

```
function sayHi(){
    console.log('Hello,', this.name);
}
var person = {
    name: 'YvetteLau',
    sayHi: sayHi
}
var name = 'Wiliam';
var Hi = function(fn) {
    fn();
}
Hi.call(person, person.sayHi); 

结果是 Hello, Wiliam. 

原因很简单，Hi.call(person, person.sayHi) 的确是将 this 绑定到 Hi 中的 this 了。但是在执行 fn 的时候，相当于直接调用了 sayHi 方法 (记住: person.sayHi 已经被赋值给 fn 了，隐式绑定也丢了)，没有指定 this 的值，对应的是默认绑定。
```

```
function sayHi(){
    console.log('Hello,', this.name);
}
var person = {
    name: 'YvetteLau',
    sayHi: sayHi
}
var name = 'Wiliam';
var Hi = function(fn) {
    fn.call(this);
}
Hi.call(person, person.sayHi);

结果为: Hello, YvetteLau

因为 person 被绑定到 Hi 函数中的 this 上，fn 又将这个对象绑定给了 sayHi 的函数。这时，sayHi 中的 this 指向的就是 person 对象。
```

```
var obj = {
    hi: function(){
        console.log(this);
        return ()=>{
            console.log(this);
        }
    },
    sayHi: function(){
        return function() {
            console.log(this);
            return ()=>{
                console.log(this);
            }
        }
    },
    say: ()=>{
        console.log(this);
    }
}
let hi = obj.hi();  // 输出 obj 对象
hi();               // 输出 obj 对象
let sayHi = obj.sayHi();
let fun1 = sayHi(); // 输出 window
fun1();             // 输出 window
obj.say();          // 输出 window
```

```
var obj = {
    hi: function(){
        console.log(this);
        return ()=>{
            console.log(this);
        }
    },
    sayHi: function(){
        return function() {
            console.log(this);
            return ()=>{
                console.log(this);
            }
        }
    },
    say: ()=>{
        console.log(this);
    }
}
let sayHi = obj.sayHi();
let fun1 = sayHi(); // 输出 window
fun1();             // 输出 window

let fun2 = sayHi.bind(obj)();// 输出 obj
fun2();                      // 输出 obj
```

```
var number = 5;
var obj = {
    number: 3,
    fn: (function () {
        var number;
        this.number *= 2;
        number = number * 2;
        number = 3;
        return function () {
            var num = this.number;
            this.number *= 2;
            console.log(num);
            number *= 3;
            console.log(number);
        }
    })()
}
var myFun = obj.fn;
myFun.call(null);
obj.fn();
console.log(window.number);


10
9
3
27
20
```

1 . 在定义 obj 的时候，fn 对应的闭包就执行了，返回其中的函数，执行闭包中代码时，显然应用不了 new 绑定 (没有出现 new 关键字)，硬绑定也没有 (没有出现 call,apply,bind 关键字), 隐式绑定有没有？很显然没有，如果没有 XX.fn()，那么可以肯定没有应用隐式绑定，所以这里应用的就是默认绑定了，非严格模式下 this 绑定到了 window 上 (浏览器执行环境)。【这里很容易被迷惑的就是以为 this 指向的是 obj，一定要注意，除非是箭头函数，否则 this 跟词法作用域是两回事，一定要牢记在心】

```
window.number * = 2; //window.number 的值是 10(var number 定义的全局变量是挂在 window 上的)

number = number * 2; //number 的值是 NaN; 注意我们这边定义了一个 number，但是没有赋值，number 的值是 undefined;Number(undefined)->NaN

number = 3;  //number 的值为 3
```

2 .myFun.call(null); 我们前面说了，call 的第一个参数传 null，调用的是默认绑定；

```
fn: function(){    
       var num = this.number;    
       this.number *= 2;    
       console.log(num);    
       number *= 3;    
       console.log(number);
}
```

执行时:

```
var num = this.number; //num=10; 此时 this 指向的是 window
this.number * = 2;  //window.number = 20
console.log(num);  // 输出结果为 10
number *= 3;  //number=9; 这个 number 对应的闭包中的 number; 闭包中的 number 的是3
console.log(number);  // 输出的结果是 9
```

3 .obj.fn(); 应用了隐式绑定，fn 中的 this 对应的是 obj。

```
var num = this.number;//num = 3; 此时 this 指向的是 obj
this.number *= 2; //obj.number = 6;
console.log(num); // 输出结果为 3;
number *= 3; //number=27; 这个 number 对应的闭包中的 number; 闭包中的 number 的此时是 9
console.log(number);// 输出的结果是 27
```

4 . 最后一步 `console.log(window.number)`; 输出的结果是 20；