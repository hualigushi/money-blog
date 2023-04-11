![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHFMTibiazjk7P11OFXrh6W9WHeMicTDC4F0rRUiaiaJNhic58CaJmlqgBtlu3VhrpQAB0hkAlWtuoBKhWJA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## 1  Object.defineProperty 不能监听所有属性

`Object.defineProperty` 无法一次性监听对象所有属性，必须遍历或者递归来实现。

```js
let girl = {
     name: "marry",
     age: 22
   }
   /* Proxy 监听整个对象*/
   girl = new Proxy(girl, {
     get() {}
     set() {}
   })
   /* Object.defineProperty */
   Object.keys(girl).forEach(key => {
     Object.defineProperty(girl, key, {
       set() {},
       get() {}
     })
   })
```

## 2 Object.defineProperty 无法监听新增加的属性

`Proxy` 可以监听到新增加的属性，而 `Object.defineProperty` 不可以，需要你手动再去做一次监听。因此，在 Vue 中想动态监听属性，一般用 `Vue.set(girl, "hobby", "game")` 这种形式来添加。

```js
   let girl = {
     name: "marry",
     age: 22
   }
   /* Proxy 监听整个对象*/
   girl = new Proxy(girl, {
     get() {}
     set() {}
   })
   /* Object.defineProperty */
   Object.keys(girl).forEach(key => {
     Object.defineProperty(girl, key, {
       set() {},
       get() {}
     })
   });
   /* Proxy 生效，Object.defineProperty 不生效 */
   girl.hobby = "game"; 
```



## 3. Object.defineProperty 无法响应数组操作

`Object.defineProperty` 可以监听数组的变化，`Object.defineProperty` 无法对 push、shift、pop、unshift 等方法进行响应。

```js
const arr = [1, 2, 3];
   /* Proxy 监听数组*/
   arr = new Proxy(arr, {
     get() {},
     set() {}
   })
   /* Object.defineProperty */
   arr.forEach((item, index) => {
     Object.defineProperty(arr, `${index}`, {
       set() {},
       get() {}
     })
   })

   arr[0] = 10; // 都生效
   arr[3] = 10; // 只有 Proxy 生效
   arr.push(10); // 只有 Proxy 生效
```

对于新增加的数组项，`Object.defineProperty` 依旧无法监听到。

因此，在 Mobx 中为了监听数组的变化，默认将数组长度设置为1000，监听 0-999 的属性变化。

```js
const arr = [1, 2, 3];
   /* Object.defineProperty */
   [...Array(1000)].forEach((item, index) => {
     Object.defineProperty(arr, `${index}`, {
       set() {},
       get() {}
     })
   });
   arr[3] = 10; // 生效
   arr[4] = 10; // 生效
```

在 Vue 和 Mobx 中都是通过重写原型实现的。

在定义变量的时候，判断其是否为数组，如果是数组，那么就修改它的 `__proto__`，将其指向 `subArrProto`，从而实现重写原型链。

```js
const arrayProto = Array.prototype;
   const subArrProto = Object.create(arrayProto);
   const methods = ['pop', 'shift', 'unshift', 'sort', 'reverse', 'splice', 'push'];
   methods.forEach(method => {
     /* 重写原型方法 */
     subArrProto[method] = function() {
       arrayProto[method].call(this, ...arguments);
     };
     /* 监听这些方法 */
     Object.defineProperty(subArrProto, method, {
       set() {},
       get() {}
     })
   })
```
