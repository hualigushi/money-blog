```js
console.time('1')
const obj = {x:1,y:1};
const xKey = 'x'
const yKey = 'y'

function slowObjectAccess(){
    let sum = 0
    for (let i=0;i<1e8;i++){
        for(k=0;k<2;k++){
            const val = obj[k===0 ?xKey:yKey]
            sum+=val
        }
    }
}
slowObjectAccess()
console.timeEnd('1')

// 1: 1279.220947265625 ms

```



```js
console.time('2')
const obj = {x:1,y:1};
const xKey = 'x'
const yKey = 'y'

function fastObjectAccess(){
    let sum = 0
    for (let i=0;i<1e8;i++){
        for(k=0;k<2;k++){
            const val = k===0 ?obj.x:obj.y
            sum += val
        }
    }
}
fastObjectAccess()
console.timeEnd('2')

// 2: 361.241943359375 ms
```

