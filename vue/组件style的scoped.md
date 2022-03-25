## 组件style的scoped

问题：在组件中用js动态创建的dom，添加样式不生效。

**场景**:

```
    <template>
         <div class="test"></div>
    </template>
    <script>
        let a=document.querySelector('.test');
        let newDom=document.createElement("div"); // 创建dom
        newDom.setAttribute("class","testAdd" ); // 添加样式
        a.appendChild(newDom); // 插入dom
    </script>
    <style scoped>
    .test{
       background:blue;
        height:100px;
        width:100px;
    }
    .testAdd{
        background:red;
        height:100px;
        width:100px;
    }
    </style>
```

**结果**：

```
// test生效   testAdd 不生效
<div data-v-1b971ada class="test"><div class="testAdd"></div></div>
.test[data-v-1b971ada]{ // 注意data-v-1b971ada
    background:blue;
    height:100px;
    width:100px;
}
```

**原因**:

当 `<style>` 标签有 scoped 属性时，它的 CSS 只作用于当前组件中的元素。

它会**为组件中所有的标签和class样式添加一个`scoped`标识**，就像上面结果中的`data-v-1b971ada`。

所以原因就很清楚了：因为动态添加的dom没有`scoped`添加的标识，**没有跟`testAdd`的样式匹配起来**，导致样式失效。

**解决方式**

- 推荐：去掉该组件的scoped

每个组件的css并不会很多，当设计到动态添加dom，并为dom添加样式的时候，就可以去掉scoped，会比下面的方法方便很多。

- 可以动态添加style

  ```
  newDom.style.height='100px';
  newDom.style.width='100px';
  ```
