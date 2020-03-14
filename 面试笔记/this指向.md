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
