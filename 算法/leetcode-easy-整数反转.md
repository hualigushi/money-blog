7. 整数反转  难度 简单

给出一个 32 位的有符号整数，你需要将这个整数中每位上的数字进行反转。

示例 1:
```
输入: 123
输出: 321
```
示例 2:
```
输入: -123
输出: -321
```
示例 3:
```
输入: 120
输出: 21
```

注意:
假设我们的环境只能存储得下 32 位的有符号整数，则其数值范围为 [−231,  231 − 1]。请根据这个假设，如果反转后整数溢出那么就返回 0。

```
/**
 * @param {number} x
 * @return {number}
 */
var reverse = function(x) {
    let strX = x<0 ? x.toString().slice(1) : x.toString()
    resverseArr = strX.split('').reverse().join('')
    numX = x < 0 ? +('-' + resverseArr) : +resverseArr
    return (numX > Math.pow(2,31) -1 || numX < Math.pow(-2,31)) ? 0 : numX
};
```
自我分析：数字反转还是使用%运算方便，不要转换成字符串再转回来

优化
```
/**
 * @param {number} x
 * @return {number}
 */
var reverse = function(x) {
    let newX = Math.abs(x)
     let res = 0
     let start = 1
     while(newX > 0){
        start = start * 10
		res = newX % 10 + res * 10
        newX = parseInt(newX / 10)
    }
     return (res > Math.pow(2,31) -1 || res < Math.pow(-2,31)) ? 0 : (x < 0 ? -res : res)
};
```
