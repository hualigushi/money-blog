[TOC]



# 1 Promise值穿透

解释：.then 或者 .catch 的参数期望是函数，传入非函数则会发生值穿透

```js
 Promise.resolve('foo')
    .then(Promise.resolve('bar'))
    .then(function(result){
      console.log(result)
    })

foo
```
```js
Promise.resolve(1)
  .then(function(){return 2})
  .then(Promise.resolve(3))
  .then(console.log)
  
  2
```

```js
Promise.resolve(1)
  .then(function(){return 2})
  .then(function(){return Promise.resolve(3)})
  .then(console.log)
  
3
```



# 2 根据条件添加对象属性

```js
const getUser = (emailIncluded) => {
  return {
    name: 'John',
    surname: 'Doe',
    ...(emailIncluded ? { email : 'john@doe.com' } : null)
  }
}

const user = getUser(true);
console.log(user); // 输出 { name: "John", surname: "Doe", email: "john@doe.com" }

const userWithoutEmail = getUser(false);
console.log(userWithoutEmail); // 输出 { name: "John", surname: "Doe" }
```



# 3 scrollIntoView
`Element.scrollIntoView()` 方法让当前的元素滚动到浏览器窗口的可视区域内。

`document.querySelector(`[data-cate='${alpha}']`).scrollIntoView()`



# 4 快速幂运算
可以使用位左移运算符<<来表示以 2 为底的幂运算

```js
// 以下表达式是等效的:
Math.pow(2, n);
2 << (n - 1);
2**n;
```



# 5 快速取整

```js
console.log(23.9 | 0);  // Result: 23
console.log(-23.9 | 0); // Result: -23
```
| 的实际行为取决于操作数是正数还是负数，所以在使用这个运算符时要确保你知道操作数是正是负。

如果 n 是正数，那么 n|0 向下取整，否则就是向上取整。它会移除小数部分，也可以使用~~ 达到同样的效果。



移除整数尾部数字
```js
console.log(1553 / 10   | 0)  // Result: 155
console.log(1553 / 100  | 0)  // Result: 15
console.log(1553 / 1000 | 0)  // Result: 1
```



# 6 可以在 indexOf(…) 函数前面加一个~ 来进行布尔检查，看看一个项是否存在于 String 或 Array 中。



# 9 意外的全局变量

#### 问题

在以下代码中，`typeof a`和`typeof b`的值分别是什么：

```js
function foo() {
  let a = b = 0;
  a++;
  return a;
}

foo();
typeof a; // => ???typeof b; // => ???
```

#### 答案

让我们仔细看看第2行：`let a = b = 0`。这个语句确实声明了一个局部变量`a`。但是，它确实声明了一个*全局*变量`b`。

在`foo()`作用域或全局作用域中都没有声明变量 `b` ”。因此JavaScript将表达式 `b = 0` 解释为 `window.b = 0`。

![image.png](https://user-gold-cdn.xitu.io/2019/11/3/16e3029e3d0539ec?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



`b`是一个偶然创建的全局变量。

在浏览器中，上述代码片段相当于:

```js
function foo() {
  let a;  window.b = 0;  a = window.b;  a++;
  return a;
}

foo();
typeof a;        // => 'undefined'
typeof window.b; // => 'number'
```

`typeof a`是 `'undefined'`。变量`a`仅在 `foo()`范围内声明，在外部范围内不可用。

`typeof b`等于`'number'`。`b`是一个值为 `0`的全局变量。



# 10 `(a, b) => a.name.localeCompare(b.name)` 

中文名排序



# 11 生成随机UID

```js
const genUid = () => {
  var length = 20
  var soupLength = genUid.soup_.length
  var id = []
  for (var i = 0; i < length; i++) {
    id[i] = genUid.soup_.charAt(Math.random() * soupLength)
  }
  return id.join('')
}
genUid.soup_ = '!#$%()*+,-./:;=?@[]^_`{|}~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
genUid() // ;l`yCPc9A8IuK}?N6,%}

```



# 12 无loop生成指定长度的数组

```js
const List = len => [...new Array(len).keys()]
const list = List(10) // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```



# 13 localStorage 监听

- localStorage.setItem监听：自定义事件 setItemEvent
- localStorage.getItem监听：自定义事件 getItemEvent
- localStorage.removeItem监听：自定义事件 removeItemEvent

```javascript
//监听自定义事件 setItemEvent
localStorage.setItem = (Orgin=>{
    return function(key,value){
        let setItemEvent = new CustomEvent('setItemEvent',{detail:{setKey:key,value}})
        window.dispatchEvent(setItemEvent)
        Orgin.call(this,key,typeof value == 'string'? value : JSON.stringify(value))
    }
})(localStorage.setItem)

//监听自定义事件 getItemEvent
localStorage.getItem = (Orgin=>{
    return function(key){
        let result = JSON.parse(Orgin.call(this,key))
        let getItemEvent = new CustomEvent('getItemEvent',{detail:{getKey:key,value:result}})
        window.dispatchEvent(getItemEvent)
        return result 
    }
})(localStorage.getItem)


//监听自定义事件 removeItemEvent
localStorage.removeItem = (Orgin=>{
    return function(key){
        let removeItemEvent = new CustomEvent('removeItemEvent',{detail:{removeKey:key}})
        window.dispatchEvent(removeItemEvent)
        Orgin.call(this,key)
    }
})(localStorage.removeItem)
```

监听：

```javascript
//localStorage.setItem监听
window.addEventListener('setItemEvent',function(e){
    console.log(e.detail)
})

//localStorage.getItem监听
window.addEventListener('getItemEvent',function(e){
    console.log(e.detail)
}) 

//localStorage.removeItem监听
window.addEventListener('removeItemEvent',function(e){
    console.log(e.detail)
})
```



# 14 a标签安全问题

使用a标签打开一个新窗口过程中的安全问题。新页面中可以使用window.opener来控制原始页面。如果新老页面同域，那么在新页面中可以任意操作原始页面。如果是不同域，新页面中依然可以通过window.opener.location，访问到原始页面的location对象

在带有target="_blank"的a标签中，加上rel="noopener"属性。如果使用window.open的方式打开页面，将opener对象置为空。

```
var newWindow = window.open();
newWindow.opener = null;
```



# 15 去除html标签

```js
export const removeHtmltag = (str) => {
    return str.replace(/<[^>]+>/g, '')
}
```



# 16 el是否包含某个class

```js
export const hasClass = (el, className) => {
    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
    return reg.test(el.className)
}
```



# 17 拦截粘贴板

```js
export const copyTextToClipboard = (value) => {
    var textArea = document.createElement("textarea");
    textArea.style.background = 'transparent';
    textArea.value = value;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        var successful = document.execCommand('copy');
    } catch (err) {
        console.log('Oops, unable to copy');
    }
    document.body.removeChild(textArea);
}
```



# 18 将阿拉伯数字翻译成中文的大写数字

```js
export const numberToChinese = (num) => {
    var AA = new Array("零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十");
    var BB = new Array("", "十", "百", "仟", "萬", "億", "点", "");
    var a = ("" + num).replace(/(^0*)/g, "").split("."),
        k = 0,
        re = "";
    for (var i = a[0].length - 1; i >= 0; i--) {
        switch (k) {
            case 0:
                re = BB[7] + re;
                break;
            case 4:
                if (!new RegExp("0{4}//d{" + (a[0].length - i - 1) + "}$")
                    .test(a[0]))
                    re = BB[4] + re;
                break;
            case 8:
                re = BB[5] + re;
                BB[7] = BB[5];
                k = 0;
                break;
        }
        if (k % 4 == 2 && a[0].charAt(i + 2) != 0 && a[0].charAt(i + 1) == 0)
            re = AA[0] + re;
        if (a[0].charAt(i) != 0)
            re = AA[a[0].charAt(i)] + BB[k % 4] + re;
        k++;
    }

    if (a.length > 1) // 加上小数部分(如果有小数部分)
    {
        re += BB[6];
        for (var i = 0; i < a[1].length; i++)
            re += AA[a[1].charAt(i)];
    }
    if (re == '一十')
        re = "十";
    if (re.match(/^一/) && re.length == 3)
        re = re.replace("一", "");
    return re;
}

```



# 19 将数字转换为大写金额

```js
export const changeToChinese = (Num) => {
    //判断如果传递进来的不是字符的话转换为字符
    if (typeof Num == "number") {
        Num = new String(Num);
    };
    Num = Num.replace(/,/g, "") //替换tomoney()中的“,”
    Num = Num.replace(/ /g, "") //替换tomoney()中的空格
    Num = Num.replace(/￥/g, "") //替换掉可能出现的￥字符
    if (isNaN(Num)) { //验证输入的字符是否为数字
        //alert("请检查小写金额是否正确");
        return "";
    };
    //字符处理完毕后开始转换，采用前后两部分分别转换
    var part = String(Num).split(".");
    var newchar = "";
    //小数点前进行转化
    for (var i = part[0].length - 1; i >= 0; i--) {
        if (part[0].length > 10) {
            return "";
            //若数量超过拾亿单位，提示
        }
        var tmpnewchar = ""
        var perchar = part[0].charAt(i);
        switch (perchar) {
            case "0":
                tmpnewchar = "零" + tmpnewchar;
                break;
            case "1":
                tmpnewchar = "壹" + tmpnewchar;
                break;
            case "2":
                tmpnewchar = "贰" + tmpnewchar;
                break;
            case "3":
                tmpnewchar = "叁" + tmpnewchar;
                break;
            case "4":
                tmpnewchar = "肆" + tmpnewchar;
                break;
            case "5":
                tmpnewchar = "伍" + tmpnewchar;
                break;
            case "6":
                tmpnewchar = "陆" + tmpnewchar;
                break;
            case "7":
                tmpnewchar = "柒" + tmpnewchar;
                break;
            case "8":
                tmpnewchar = "捌" + tmpnewchar;
                break;
            case "9":
                tmpnewchar = "玖" + tmpnewchar;
                break;
        }
        switch (part[0].length - i - 1) {
            case 0:
                tmpnewchar = tmpnewchar + "元";
                break;
            case 1:
                if (perchar != 0) tmpnewchar = tmpnewchar + "拾";
                break;
            case 2:
                if (perchar != 0) tmpnewchar = tmpnewchar + "佰";
                break;
            case 3:
                if (perchar != 0) tmpnewchar = tmpnewchar + "仟";
                break;
            case 4:
                tmpnewchar = tmpnewchar + "万";
                break;
            case 5:
                if (perchar != 0) tmpnewchar = tmpnewchar + "拾";
                break;
            case 6:
                if (perchar != 0) tmpnewchar = tmpnewchar + "佰";
                break;
            case 7:
                if (perchar != 0) tmpnewchar = tmpnewchar + "仟";
                break;
            case 8:
                tmpnewchar = tmpnewchar + "亿";
                break;
            case 9:
                tmpnewchar = tmpnewchar + "拾";
                break;
        }
        var newchar = tmpnewchar + newchar;
    }
    //小数点之后进行转化
    if (Num.indexOf(".") != -1) {
        if (part[1].length > 2) {
            // alert("小数点之后只能保留两位,系统将自动截断");
            part[1] = part[1].substr(0, 2)
        }
        for (i = 0; i < part[1].length; i++) {
            tmpnewchar = ""
            perchar = part[1].charAt(i)
            switch (perchar) {
                case "0":
                    tmpnewchar = "零" + tmpnewchar;
                    break;
                case "1":
                    tmpnewchar = "壹" + tmpnewchar;
                    break;
                case "2":
                    tmpnewchar = "贰" + tmpnewchar;
                    break;
                case "3":
                    tmpnewchar = "叁" + tmpnewchar;
                    break;
                case "4":
                    tmpnewchar = "肆" + tmpnewchar;
                    break;
                case "5":
                    tmpnewchar = "伍" + tmpnewchar;
                    break;
                case "6":
                    tmpnewchar = "陆" + tmpnewchar;
                    break;
                case "7":
                    tmpnewchar = "柒" + tmpnewchar;
                    break;
                case "8":
                    tmpnewchar = "捌" + tmpnewchar;
                    break;
                case "9":
                    tmpnewchar = "玖" + tmpnewchar;
                    break;
            }
            if (i == 0) tmpnewchar = tmpnewchar + "角";
            if (i == 1) tmpnewchar = tmpnewchar + "分";
            newchar = newchar + tmpnewchar;
        }
    }
    //替换所有无用汉字
    while (newchar.search("零零") != -1)
        newchar = newchar.replace("零零", "零");
    newchar = newchar.replace("零亿", "亿");
    newchar = newchar.replace("亿万", "亿");
    newchar = newchar.replace("零万", "万");
    newchar = newchar.replace("零元", "元");
    newchar = newchar.replace("零角", "");
    newchar = newchar.replace("零分", "");
    if (newchar.charAt(newchar.length - 1) == "元") {
        newchar = newchar + "整"
    }
    return newchar;
}
```



# 20 去除空格,`type: 1-所有空格 2-前后空格 3-前空格 4-后空格`

```
export const trim = (str, type) => {
    type = type || 1
    switch (type) {
        case 1:
            return str.replace(/\s+/g, "");
        case 2:
            return str.replace(/(^\s*)|(\s*$)/g, "");
        case 3:
            return str.replace(/(^\s*)/g, "");
        case 4:
            return str.replace(/(\s*$)/g, "");
        default:
            return str;
    }
}
```



# 21 图片串行加载优化

一次性加载所有图片会导致浏览器http线程阻塞严重。因此需要稍作优化，让图片一张一张加载。

```js
images.keys().reduce((cachePromise, path) => cachePromise.then(() => {
  return new Promise(resolve => {
    const image = new Image();
    const complete = () => {
      clearTimeout(timer);
      resolve();
    }
    const timer = setTimeout(complete, 1000);  // 单张图片最多加载1s
    image.src = images(path);
    image.onload = image.onerror = complete;
  })
}), Promise.resolve());
```

