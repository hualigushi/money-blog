# Iterator迭代器
Iterator 是一种接口，目的是为不同的数据结构提供统一的数据访问机制。也可以理解为 Iterator 接口主要为 for of 服务的，供for…of进行消费。

它是一种特殊的对象 - 迭代器对象，返回此对象的方法叫做迭代器方法。

首先他作为一个对象，此对象具有一个next方法，每次调用 next 方法都会返回一个结果值。

这个结果值是一个 object，包含两个属性，value 和 done。

value表示具体的返回值，done 是布尔类型的，表示集合是否遍历完成或者是否后续还有可用数据，没有可用数据则返回 true，否则返回 false。

另外内部会维护一个指针，用来指向当前集合的位置，每调用一次 next 方法，指针都会向后移动一个位置(可以想象成数组的索引)。
```js
function getIterator(list) {
      var i = 0;
      return {
          next: function() {
              var done = (i >= list.length);
              var value = !done ? list[i++] : undefined;
              return {
                  done: done,
                  value: value
              };
          }
      };
  }
  var it = getIterator(['a', 'b', 'c']);
  console.log(it.next()); // {value: "a", done: false}
  console.log(it.next()); // {value: "b", done: false}
  console.log(it.next()); // {value: "c", done: false}
  console.log(it.next()); // "{ value: undefined, done: true }"
  console.log(it.next()); // "{ value: undefined, done: true }"
  console.log(it.next()); // "{ value: undefined, done: true }"
```
  - getIterator方法返回一个对象 - 可迭代对象

  - 对象具有一个next 方法，next 方法内部通过闭包来保存指针 i 的值，每次调用 next 方法 i 的值都会+1.

  - 然后根据 i 的值从数组内取出数据作为 value，然后通过索引判断得到 done的值。

  - 当 i=3的时候，超过数组的最大索引，无可用数据返回，此时done 为true，遍历完成。

  # 可迭代对象
  ES6里规定，只要在对象的属性上部署了Iterator接口，具体形式为给对象添加Symbol.iterator属性，此属性指向一个迭代器方法，这个迭代器会返回一个特殊的对象 - 迭代器对象。

  而部署这个属性并且实现了迭代器方法后的对象叫做可迭代对象。

  此时，这个对象就是可迭代的，也就是可以被 for of 遍历。

  `Symbol.iterator` 它是一个表达式，返回Symbol对象的iterator属性，这是一个预定义好的、类型为 Symbol 的特殊值。
  ```js
  var iterableObj = {
    items:[100,200,300],
    [Symbol.iterator]:function(){
    var self=this;
    var i = 0;
    return {
        next: function() {
            var done = (i >= self.items.length);
            var value = !done ? self.items[i++] : undefined;
            return {
                done: done,
                value: value
            };
        }
    };
    }
}

//遍历它
for(var item of iterableObj){
    console.log(item); //100,200,300
}
  ```

# Iterator 原生应用场景
字符串、数组、map，在 ES6中有些对象已经默认部署了此接口，不需要做任何处理，就可以使用 for of 来进行遍历取值。
#### 数组
```js
var arr=[100,200,300];
var iteratorObj=  arr[Symbol.iterator]();//得到迭代器方法，返回迭代器对象

console.log(iteratorObj.next());
console.log(iteratorObj.next());
console.log(iteratorObj.next());
console.log(iteratorObj.next());
```
![](https://mmbiz.qpic.cn/mmbiz/vLKqut7Zx90mEScXIxCibzYpGwxhYWvHxF3SxCBrNxic9XQNrIBAZWv5O2icFZsZ8qpQIKoYAaMyWNqcKibhVHfgcQ/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### 字符串
```js
var str='abc';
var strIteratorObj = str[Symbol.iterator]();//得到迭代器

console.log(strIteratorObj.next());
console.log(strIteratorObj.next());
console.log(strIteratorObj.next());
console.log(strIteratorObj.next());
```
![](https://mmbiz.qpic.cn/mmbiz/vLKqut7Zx90mEScXIxCibzYpGwxhYWvHxKxm8ssXuy4qZAiaNnZ40SxiagmC2e6JhnBN5qFibn8KHCRfMRQcXbXhRw/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)
![](https://mmbiz.qpic.cn/mmbiz/vLKqut7Zx90mEScXIxCibzYpGwxhYWvHxoZnDcMwEfhWAtGezK8PU8DjUXqAZpN7AQ4sEtmFpxKP87E5j4grcbg/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### arguments 类数组
对象是默认没有部署这个接口的，所以arguments这个属性没有在原型上，而在在对象自身的属性上。
```js
function test(){
    var obj = arguments[Symbol.iterator]();
   console.log( arguments.hasOwnProperty(Symbol.iterator));
   console.log( arguments);
   console.log(obj.next());
}
test(1,2,3);
```
![](https://mmbiz.qpic.cn/mmbiz/vLKqut7Zx90mEScXIxCibzYpGwxhYWvHxoer9kUtgibQsOxS4Q2RmRThQUdRKMaRqOB1zBpZToJpfMcmlKkfgVUA/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)



# for of 中断

迭代器除了必须next 方法外，还有两个可选的方法 return和throw方法。

如果 for of 循环提前退出，则会自动调用 return 方法，需要注意的是 return 方法必须有返回值，且返回值必须是 一个object。

ps：以抛出异常的方式退出，会先执行 return 方法再抛出异常。
```js
var iterableObj = {
    items:[100,200,300],
    [Symbol.iterator]:function(){
    var self=this;
    var i = 0;
    return {
        next: function() {
            var done = (i >= self.items.length);
            var value = !done ? self.items[i++] : undefined;
            return {
                done: done,
                value: value
            };
        },
        return(){
            console.log('提前退出');
            return {//必须返回一个对象
                done:true
            }
        }
    };
    }
}

for(var item of iterableObj){
    console.log(item);
    if(item===200){
        break;
    }
}

for(var item of iterableObj){
    console.log(item);
    throw new Error();
}
```
![](https://mmbiz.qpic.cn/mmbiz/vLKqut7Zx90mEScXIxCibzYpGwxhYWvHx6HG53rbwSIt0icJ9GV4PicZUZd9wHHaYlZSeV5lrv9szcLcRPFm5ANJQ/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

# 不止 for of
#### 解构赋值

对可迭代对象进行解构赋值的时候，会默认调用`Symbol.iterator`方法。
```js
//字符串
var str='12345';
var [a,b]=str;
console.log(a,b); // 1 2

//map
var map = new Map();
map.set('我','前端');
map.set('是','技术');
map.set('谁','江湖');
map.set('作者','zz_jesse');

var [d,e]=map;
console.log(d,e);
//["我", "前端"] ["是", "技术"]
....
```

同样如果对一个普通对象进行解构，则会报错。

因为普通对象不是可迭代对象。

`var [d,e]={name:'zhang'};`

![](https://mmbiz.qpic.cn/mmbiz/vLKqut7Zx90mEScXIxCibzYpGwxhYWvHxjjLOIlAZDjYmjXySR46jdJ449AHj8jpNt77fwcYW8jcx3xmaZbWsow/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

从一个自定义的可迭代对象进行解构赋值。

```js
var iterableObj = {
    items:['红','绿','蓝'],
    [Symbol.iterator]:function(){
    var self=this;
    var i = 0;
    return {
        next: function() {
            var done = (i >= self.items.length);
            var value = !done ? self.items[i++] : undefined;
            return {
                done: done,
                value: value
            };
        }
     };
   }
}

var [d,e]=iterableObj;
console.log(d,e);//红 绿
```

解构赋值的变量的值就是迭代器对象的 next 方法的返回值，且是按顺序返回。

#### 扩展运算符

扩展运算符的执行(…)也会默认调用它的Symbol.iterator方法，可以将当前迭代对象转换为数组。
```
//字符串
var str='1234';
console.log([...str]);//[1,2,3,4]  转换为数组

//map 对象
var map=new Map([[1,2],[3,4]]);
[...map] //[[1,2],[3,4]

//set 对象
var set=new Set([1,2,3]);
[...set] //[1,2,3]
```

通用普通对象是不可以转为数组的。

`var obj={name:'zhang'};[..obj]//报错`

![](https://mmbiz.qpic.cn/mmbiz/vLKqut7Zx90mEScXIxCibzYpGwxhYWvHxJdCYsZQaqNAmB3yibRqpffn1MG4ACniccckwicBhwjPwOBe5MSHeaH13g/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### 作为数据源

作为一些数据的数据源，比如某些api 方法的参数是接收一个数组,都会默认的调用自身迭代器。

例如：Set、Map、Array.from 等
```
//为了证明，先把一个数组的默认迭代器给覆盖掉
var arr=[100,200,300];
arr[Symbol.iterator]=function(){
    var self=this;
    var i = 0;
    return {
        next: function() {
            var done = (i >= self.length);
            var value = !done ? self[i++] : undefined;
            return {
                done: done,
                value: value+'前端技术江湖' //注意这里
            };
        }
    };
}

for(var o of arr){
    console.log(o);
}

// 100前端技术江湖
// 200前端技术江湖
// 300前端技术江湖
```
已覆盖完成
```
//生成 set  对象
var set  = new Set(arr);
```
![](https://mmbiz.qpic.cn/mmbiz/vLKqut7Zx90mEScXIxCibzYpGwxhYWvHx6Hl7ibJicbXMNMdcN48afLIO1GEUmhqGLxib6zlTw7ToFdFx4grWQQBIQ/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

```
//调用 Array.from方法
Array.from(arr);
```
![](https://mmbiz.qpic.cn/mmbiz/vLKqut7Zx90mEScXIxCibzYpGwxhYWvHx5BbGMOvv871a2yHFVY5abc9GvWGKGmGrziamEKFXBoaXtCpn3wPxcrw/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

# 判断对象是否可迭代
既然可迭代对象的规则必须在对象上部署Symbol.iterator属性，那么我们基本上就可以通过此属来判断对象是否为可迭代对象，然后就可以知道是否能使用 for of 取值了。
```js
function isIterable(object) {
    return typeof object[Symbol.iterator] === "function";
}
console.log(isIterable('abcdefg')); // true
console.log(isIterable([1, 2, 3])); // true
console.log(isIterable("Hello")); // true
console.log(isIterable(new Map())); // true
console.log(isIterable(new Set())); // true
console.log(isIterable(new WeakMap())); // false
console.log(isIterable(new WeakSet())); // false
```

# 总结
ES6的出现带来了很多新的数据结构，比如 Map ,Set ，所以为了数据获取的方便，增加了一种统一获取数据的方式 for of 。而 for of 执行的时候引擎会自动调用对象的迭代器来取值。

不是所有的对象都支持这种方式，必须是实现了Iterator接口的才可以，这样的对象我们称他们为可迭代对象。

迭代器实现方式根据可迭代协议，迭代器协议实现即可。

除了统一数据访问方式，还可以自定义得到的数据内容，随便怎样，只要是你需要的。

迭代器是一个方法， 用来返回迭代器对象。

可迭代对象是部署了 Iterator 接口的对象，同时拥有正确的迭代器方法。
