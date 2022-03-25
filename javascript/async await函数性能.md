例1
```
function foo() {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(10)
        }, 1000)
    })
}
function bar() {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(20)
        }, 1500)
    })
}

async function test() {
    let start = new Date().getTime()
    let val1 = await foo()
    let val2 = await bar()
    
    let val  = val1 + val2
    let end  = new Date().getTime()
    let time = end - start
    console.log(val)
    console.log(time)
    
}
test()
// 30  val的结果
// 2505 test()运行时间
```

例2

```
function foo() {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(10)
        }, 1000)
    })
}
function bar() {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(20)
        }, 1500)
    })
}

async function test() {
    let start = new Date().getTime()
    let p1 = foo()
    let p2 = bar()
    let val1 = await p1
    let val2 = await p2
    
    let val  = val1 + val2
    let end  = new Date().getTime()
    let time = end - start
    console.log(val)
    console.log(time)
    
}
test()
// 30  val的结果
// 1501 test()运行时间
```

第一种写法，必须等foo()运行结束才能运行bar()，所以所用的时间是两个异步Promise等待时间的和；

而第二种写法中，因为提前定义p1和p2,提前运行了这两个Promise,程序运行到await p1的时候两个Promsie都已经开始运行，也就是它们是并行的；

这样test()的运行时间主要就取决于用时更长的那个Promise而不是两者的相加。

也可以使用Promise.all()

```
function foo() {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(10)
        }, 1000)
    })
}
function bar() {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(20)
        }, 1500)
    })
}

async function test() {
    let start = new Date().getTime()
    let vals = await Promise.all([foo(), bar()])
    
    let val  = vals[0] +&emsp;vals[1]
    let end  = new Date().getTime()
    let time = end - start
    console.log(val)
    console.log(time)
    
}
test()
// 30  val的结果
// 1501 test()运行时间
```

async/await函数不应该关心异步Promise的具体实现细节，await应该只关心最终得到的结果，这样为更加复杂的异步操作提供更加清晰的过程控制逻辑。

```
function getVal() {
    return Promise.all([foo, bar])
}

async function test() {
    let vals = await getVal()
    
    let val = vals[0] + vals[1]
    console.log(val)
}
```

应该有意识的把这种逻辑从async/await中抽离出来，避免低层次的逻辑影响了高层次的逻辑；这也应该是所有的高度抽象化代码中必要的一个环节，不同逻辑层次的代码混杂在一起最终会像回调地狱一样让自己和读自己代码的人陷入混乱。