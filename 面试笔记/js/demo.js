// var lengthOfLongestSubstring = function (s) {
//     let obj = {} // 用于存储字符出现的位置
//     let res = 0 // 位置
//     let j = 0 // 不重复字符的index

//     for (let i = 0; i < s.length; i++) {
//         // 当前值是否在对象中存储过
//         const value = obj[s[i]]
//         if (value !== undefined) {
//             // 更新上一次重复值的index
//             // value + 1 跳过之前重复的字符
//             // j : 之前不重复的index重复字符 需要全部跳过
//             j = Math.max(value + 1, j)
//         }

//         // 每个字符都计算一下最长不重复值，保存最大值
//         // 不重复最长长度 = 当前index - 上一次重复值的index + index 从0开始，长度从1开始
//         res = Math.max(res, i - j + 1)
//         obj[s[i]] = i
//     }

//     return res
// }

// var lengthOfLongestSubstring = function (s) {
//     var i = 0, // 不重复字符的index
//         res = 0 // 更新无重复字符的长度
//     for (j = 0; j < s.length; j++) {
//         // 查找：不重复字符-当前index之间 有没有出现当前字符
//         let index = s.slice(i, j).indexOf(s[j])
//         if (index === -1) {
//             // 更新无重复字符 - 当前index之前 有没有出现当前字符
//             res = Math.max(res, j - i + 1)
//         } else {
//             // 更新i = 不重复字符的index    
//             // 不重复字符的index = 原不重复的字符index + i-j中出现重复字符的index + 跳过该重复字符
//             i = i + index + 1
//         }
//     }
//     return res
// }

Function.prototype.myCall = function (context, ...arr) {
    if (context === null || context === undefined) {
        context = window
    } else {
        context = Object(context)
    }

    context.testFn = this
    let result = context.testFn(...arr)
    delete context.testFn
    return result
}

Function.prototype.myApply = function (context) {
    if (context === null || context === undefined) {
        context = window
    } else {
        context = Object(context)
    }

    function isArrayLike(o) {
        if (o &&
            typeof o === 'object' &&
            isFinite(o.length) &&
            o.length >= 0 &&
            o.length === Math.floor(o.length) &&
            o.length < 4294967296)
            return true
        else
            return false
    }
    context.testFn = this
    const args = arguments[1]
    let result
    if (args) {
        if (!Array.isArray(args) && !isArrayLike(args)) {
            throw new TypeError('myApply 第二个参数不为数组并且不为类数组对象抛出错误');
        } else {
            args = Array.from(args)
            results = context.testFn(...args)
        }
    } else {
        result = context.testFn()
    }
    delete context.testFn
    return result
}

Function.prototype.myBind = function (objThis, ...params) {
    const thisFn = this
    let fToBind = function () {
        const isNew = this instanceof fToBind
        const context = isNew ? this : Object(objThis)
        return thisFn.apply(context, params)
    }
    fToBind.prototype = Object.create(thisFn.prototype)
    return fToBind
}

const fibonacci = (n) => {
    let arr = new Array(n).fill(0)
    arr[1] = 1
    for (let i = 2; i < arr.length; i++) {
        arr[i] = arr[i - 1] + arr[i - 2]
    }
    return arr[n - 1]
}

const reverseInteger = (n) => {
    if (n >= Math.pow(2, 31) - 1 || n <= Math.pow(-2, 31) + 1) {
        return 0
    }
    if (n < 0) {
        n = n.toString().split('-')[1]
        n = '-' + [...n].reverse().join('')
        n = +n
    } else {
        n = +[...n].reverse().join('')
    }
    return n
}

const reverseInteger = (n) => {
    if (n >= Math.pow(2, 31) - 1 || n <= Math.pow(-2, 31) + 1) {
        return 0
    }

    if (n === 0) {
        return 0
    }
    let res = 0
    while (n !== 0) {
        res = res * 10 + n % 10
        n = parseInt(n / 10)
    }
    return res
}
