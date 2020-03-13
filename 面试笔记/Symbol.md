## 每个Symbol实例都是唯一的
```
let s1 = Symbol()
let s2 = Symbol('another symbol')
let s3 = Symbol('another symbol')

s1 == s2 // false
s1 === s2 // false
s2 === s3 // false
```
如果想创造两个相等的Symbol变量，可以使用Symbol.for(key)

使用给定的key搜索现有的symbol，如果找到则返回该symbol。否则将使用给定的key在全局symbol注册表中创建一个新的symbol

```
var sym1 = Symbol.for('ConardLi');
var sym2 = Symbol.for('ConardLi');
console.log(sym1 === sym2); // true
```
Symbol.keyFor() 方法，可以获取到一个symbol 在全局注册中心中注册的唯一标识key

```
let uid1 = Symbol.for('uid');
let symbolKey = Symbol.keyFor(uid1);
console.log(symbolKey)  // 'uid'
```

## Symbol 值不能与其他类型的值进行运算

```
let uid = Symbol('uid')
uid + ''
// 报错
```

## Symbol 值可以显式转为字符串

```
let s = Symbol('s');
s.toString(); // => Symbol(s)
s.toString() + ' is a Symbol!' // => Symbol(s) is a Symbol!
```
## Symbol 值也可以转为布尔值，但是不能转为数值
```
let s = Symbol();
Boolean(s); // => true
!s // => false

Number(s); // => TypeError: Cannot convert a Symbol value to a number
Number(s) + 2; // => TypeError: Cannot convert a Symbol value to a number
```

## Symbol 的描述

ES2019 提供了一个实例属性description，直接返回 Symbol 的描述。
```
let s = Symbol('this is a Symbol');
s.description // => this is a Symbol
```

# 使用Symbol来作为对象属性名(key)
```
const PROP_NAME = Symbol()
const PROP_AGE = Symbol()

let obj = {
  [PROP_NAME]: "一斤代码"
}
obj[PROP_AGE] = 18

obj[PROP_NAME] // '一斤代码'
obj[PROP_AGE] // 18

let obj = {
   [Symbol('name')]: '一斤代码',
   age: 18,
   title: 'Engineer'
}

Object.keys(obj)   // ['age', 'title']

for (let p in obj) {
   console.log(p)   // 分别会输出：'age' 和 'title'
}

Object.getOwnPropertyNames(obj)   // ['age', 'title']

JSON.stringify(obj)  // {"age":18,"title":"Engineer"}

// 使用Object的API
Object.getOwnPropertySymbols(obj) // [Symbol(name)]

// 使用新增的反射API
Reflect.ownKeys(obj) // [Symbol(name), 'age', 'title']
```
Symbol 值作为对象属性名时，不能用点运算符

Symbol类型的key是不能通过Object.keys()或者for...in来枚举的，它未被包含在对象自身的属性名集合(property names)之中。

当使用JSON.stringify()将对象转换成JSON字符串的时候，Symbol属性也会被排除在输出内容之外

所以，利用该特性，我们可以把一些不需要对外操作和访问的属性使用Symbol来定义

# 使用Symbol来替代常量

```
const TYPE_AUDIO = 'AUDIO'
const TYPE_VIDEO = 'VIDEO'
const TYPE_IMAGE = 'IMAGE'

function handleFileResource(resource) {
  switch(resource.type) {
    case TYPE_AUDIO:
      playAudio(resource)
      break
    case TYPE_VIDEO:
      playVideo(resource)
      break
    case TYPE_IMAGE:
      previewImage(resource)
      break
    default:
      throw new Error('Unknown type of resource')
  }
}

const TYPE_AUDIO = Symbol()
const TYPE_VIDEO = Symbol()
const TYPE_IMAGE = Symbol()
```

# 使用Symbol定义类的私有属性/方法

借助Symbol类型的不可枚举，我们可以在类中模拟私有属性，控制变量读写：
```
a.js

const PASSWORD = Symbol()

class Login {
  constructor(username, password) {
    this.username = username
    this[PASSWORD] = password
  }

  checkPassword(pwd) {
      return this[PASSWORD] === pwd
  }
}

export default Login


b.js

import Login from './a'

const login = new Login('admin', '123456')

login.checkPassword('123456')  // true

login.PASSWORD  // oh!no!
login[PASSWORD] // oh!no!
login["PASSWORD"] // oh!no!
```
# 防止XSS

在React的ReactElement对象中，有一个$$typeof属性，它是一个Symbol类型的变量：
```
var REACT_ELEMENT_TYPE =
  (typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element')) ||
  0xeac7;
```
ReactElement.isValidElement函数用来判断一个React组件是否是有效的，下面是它的具体实现。
```
ReactElement.isValidElement = function (object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
};
```
可见React渲染时会把没有$$typeof标识，以及规则校验不通过的组件过滤掉。

如果你的服务器有一个漏洞，允许用户存储任意JSON对象， 而客户端代码需要一个字符串，这可能会成为一个问题：

```
// JSON
let expectedTextButGotJSON = {
  type: 'div',
  props: {
    dangerouslySetInnerHTML: {
      __html: '/* put your exploit here */'
    },
  },
};
let message = { text: expectedTextButGotJSON };
<p>
  {message.text}
</p >
```

而JSON中不能存储Symbol类型的变量，这就是防止XSS的一种手段。

# 防止属性污染

在某些情况下，我们可能要为对象添加一个属性，此时就有可能造成属性覆盖，用Symbol作为对象属性可以保证永远不会出现同名属性

# Symbol.iterator

ES6有一个Symbol.iterator，能够指定对象的默认iterator：
```
var arr = [11,12,13];
var itr = arr[Symbol.iterator]();    
itr.next(); // { value: 11, done: false }  
itr.next(); // { value: 12, done: false }  
itr.next(); // { value: 13, done: false }   
itr.next(); // { value: undefined, done: true }
```
