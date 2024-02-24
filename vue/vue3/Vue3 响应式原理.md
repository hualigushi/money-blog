[TOC]

# Vue 3 响应式

## reactive和effect的实现
```js
export const reactive = <T extends object>(target:T) => {
    return new Proxy(target,{
        get (target,key,receiver) {
          const res  = Reflect.get(target,key,receiver) as object
 
 
          return res
        },
        set (target,key,value,receiver) {
           const res = Reflect.set(target,key,value,receiver)
 
 
           return res
        }
    })
}
```

 Vue3 的响应式原理依赖了 Proxy 这个核心 API，通过 Proxy 可以劫持对象的某些操作。

## effect track trigger
实现effect 副作用函数

```js
let activeEffect;
export const effect = (fn:Function) => {
     const _effect = function () {
        activeEffect = _effect;
        fn()
     }
     _effect()
}
```

使用一个全局变量 active 收集当前副作用函数，并且初始化的时候调用一下

实现track

```js
const targetMap = new WeakMap()
export const track = (target,key) =>{
   let depsMap = targetMap.get(target)
   if(!depsMap){
       depsMap = new Map()
       targetMap.set(target,depsMap)
   }
   let deps = depsMap.get(key)
   if(!deps){
      deps = new Set()
      depsMap.set(key,deps)
   }
 
   deps.add(activeEffect)
}
```

执行完成成后我们得到一个如下的数据结构 

![img](https://img-blog.csdnimg.cn/a2355ce6b8eb489d98fceaf8d2ced235.png)

实现trigger

```js
export const trigger = (target,key) => {
   const depsMap = targetMap.get(target)
   const deps = depsMap.get(key)
   deps.forEach(effect=>effect())
}
```

 当我们进行赋值的时候会调用 set 然后 触发收集的副作用函数

```js
import {track,trigger} from './effect'

export const reactive = <T extends object>(target:T) => {
    return new Proxy(target,{
        get (target,key,receiver) {
          const res  = Reflect.get(target,key,receiver) as object
 
          track(target,key)
 
          return res
        },
        set (target,key,value,receiver) {
           const res = Reflect.set(target,key,value,receiver)
 
           trigger(target,key)
 
           return res
        }
    })
}
```

 给 reactive 添加这两个方法

测试代码

```html
<!DOCTYPE html>
<html lang="en">
 
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
 
<body>
 
    <div id="app">
 
    </div>
 
    <script type="module">
        import { reactive } from './reactive.js'
        import { effect } from './effect.js'
        const user = reactive({
            name: "小满",
            age: 18
        })
        effect(() => {
            document.querySelector('#app').innerText = `${user.name} - ${user.age}`
        })
 
        setTimeout(()=>{
            user.name = '大满很吊'
            setTimeout(()=>{
                user.age = '23'
            },1000)
        },2000)
 
    </script>
</body>
 
</html>
```

### 递归实现reactive
```js
import { track, trigger } from './effect'
 
const isObject = (target) => target != null && typeof target == 'object'
 
export const reactive = <T extends object>(target: T) => {
    return new Proxy(target, {
        get(target, key, receiver) {
            const res = Reflect.get(target, key, receiver) as object
 
            track(target, key)
 
            if (isObject(res)) {
                return reactive(res)
            }
 
            return res
        },
        set(target, key, value, receiver) {
            const res = Reflect.set(target, key, value, receiver)
 
            trigger(target, key)
 
            return res
        }
    })
}
```

```html
<!DOCTYPE html>
<html lang="en">
 
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
 
<body>
 
    <div id="app">
 
    </div>
 
    <script type="module">
        import { reactive } from './reactive.js'
        import { effect } from './effect.js'
        const user = reactive({
            name: "小满",
            age: 18,
            foo:{
                bar:{
                    sss:123
                }
            }
        })
        effect(() => {
            document.querySelector('#app').innerText = `${user.name} - ${user.age}-${user.foo.bar.sss}`
        })
 
        setTimeout(()=>{
            user.name = '大满很吊'
            setTimeout(()=>{
                user.age = '23'
                setTimeout(()=>{
                    user.foo.bar.sss = 66666666
                },1000)
            },1000)
        },2000)
 
    </script>
</body>
 
</html>
```

![img](https://img-blog.csdnimg.cn/58d42bbcfba44d8db7581c01caa95b93.png)



## computed 源码实现

