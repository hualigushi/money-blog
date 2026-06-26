它能让出主线程，允许浏览器去处理更高优先级的任务（如用户输入），然后立即回来继续执行剩下的逻辑。

```
async function processHugeData(data) {
  for (const item of data) {
    // 执行复杂的业务逻辑
    performComplexCalculation(item);

    // 每处理 100 条数据，检查是否需要把控制权交给浏览器
    if (shouldYield()) {
      await scheduler.yield(); 
    }
  }
}
```
