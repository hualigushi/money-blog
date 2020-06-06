> compose函数的作用就是组合函数的，将函数串联起来执行，将多个函数组合起来，一个函数的输出结果是另一个函数的输入参数，一旦第一个函数开始执行，就会像多米诺骨牌一样推导执行了

- lodash 版本

```
var compose = function(funcs) {
    var length = funcs.length
    var index = length
    while (index--) {
        if (typeof funcs[index] !== 'function') {
            throw new TypeError('Expected a function');
        }
    }
    return function(...args) {
        var index = 0
        var result = length ? funcs.reverse()[index].apply(this, args) : args[0]
        while (++index < length) {
            result = funcs[index].call(this, result)
        }
        return result
    }
}
```

- Redux 版本

```
function compose(...funcs) {
    if (funcs.length === 0) {
        return arg => arg
    }

    if (funcs.length === 1) {
        return funcs[0]
    }

    return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```

- 测试代码

```
function composeReduce1(arg) {
  console.log('composeReduce1', arg);
  return 'composeReduce1'
}
function composeReduce2(arg) {
  console.log('composeReduce2', arg);
  return 'composeReduce2'
}
function composeReduce3(arg) {
  console.log('composeReduce3',arg);
}


// lodash版本的 compose参数是一个数组 [composeReduce1, composeReduce2, composeReduce3]
let composeChild = compose(composeReduce1, composeReduce2, composeReduce3)
composeChild('init')

// 输出
// composeReduce3 init
// composeReduce2 composeReduce3
// composeReduce1 composeReduce2
```
