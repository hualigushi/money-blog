1. 两数之和 难度 简单

给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那 两个 整数，并返回他们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素不能使用两遍。

示例:

给定 nums = [2, 7, 11, 15], target = 9

因为 nums[0] + nums[1] = 2 + 7 = 9
所以返回 [0, 1]

测试用例
```
[3,2,4] 6
[3,3] 6
[0,4,3,0] 0
[-1,-2,-3,-4,-5] -8
[-3,4,3,90] 0
```


```
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
     for(let item of nums){
        let curItemIndex = nums.indexOf(item)
        nums[curItemIndex] = undefined
        let left = target - item
        let index = nums.indexOf(left)
        if (index !== -1) {
                return [curItemIndex, nums.indexOf(left)]
        }
   }
};
```
自我分析：indexOf底层还是数组遍历，所以复杂度是O(n2)


```
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
      let map = {}
    for (let i=0;i<nums.length;i++) {
		let num = nums[i]
        let left = target - num
        if (left in map) {
		return [i, map[left]]
        } else {
		map[num] = i
        }
    }
};
```

