1. Mozilla/Firefox : 归并排序（jsarray.c 源码）
2. V8 ：数组长度小于等于 22 的用插入排序，其它的用快速排序（array.js 源码）见下面注释
```
// In-place QuickSort algorithm.
// For short (length <= 22) arrays, insertion sort is used for efficiency.
```

3. Webkit ：底层实现用了 C++ 库中的 qsort() 方法（JSArray.cpp 源码）

sort()函数适用于大多数数据类型，sort()方法会调用每个数组项的**toString()转型方法**，然后比较 得到的字符串。默认sort()方法按升序排列数据项。

由于sort()是调用toString()方法后再排序，所以当比较数值的时候，就会出现’3’大于’20’的情况（字符串比较的是字符编码，"3"的字符编码是51，而"2"的字符编码是50）

因此sort()方法可以接收一个比较函数作为参数，以便我们指定哪个值位于哪个值的前面。

比较函数接收两个参数，如果第一个参数应该位于第二个之前则返回一个负数，如果两个参数相等，则返回0，如果第一个参数应该位于第二个之后，则返回一个正数。
