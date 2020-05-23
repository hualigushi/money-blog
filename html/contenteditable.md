# contenteditable

contenteditable是html的一个全局属性，可以大致理解为"可以使一个元素处于可编辑状态"，像极了textarea，不过还是存在许多不足跟问题，比如没有change钩子等



#### 使一个div可以进行内容编辑

```
<div contenteditable>点击我进行编辑</div>
```

可以解决一个textarea的一个痛点，那就是可以自适应高度，textarea可不行 



#### 在页面上直接编写样式并且自带"热更新"

想要在页面上编辑style元素，必须要满足以下两点：

- style元素必须放在body元素内
- style元素要设置display: block;





一个css属性 - user-modify，可取值为以下四个：

- read-only
- read-write
- write-only
- read-write-plaintext-only 



我们取第四个值就行，定义内容只可输入纯文本，因此回车也就不会产生div

```
<body>
<style class="textarea" style="display: block; -webkit-user-modify: read-write-plaintext-only;">
  html {
    background-color: #fff;
  }
</style>
</body>
```

