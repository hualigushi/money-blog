sort使用的是插入排序和快速排序结合的排序算法。数组长度不超过10时，使用插入排序。长度超过10使用快速排序。在数组较短时插入排序更有效率。
```
  // Insertion sort is faster for short arrays.
      if (to - from <= 10) {
        InsertionSort(a, from, to);
        return;
      }
```
[v8 array源码](https://github.com/v8/v8/blob/ad82a40509c5b5b4680d4299c8f08d6c6d31af3c/src/js/array.js)