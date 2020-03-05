# dom 事件对象中target与currentTarget区别  
event.target 返回触发事件的元素  
event.currentTarget 返回绑定事件的元素,在事件处理程序内部，对象this始终等于currentTarget的值

当事件处理程序直接绑定在目标元素上，此时e.target===e.currentTarget，e.target ===this

当事件处理程序绑定在目标元素的父节点上时，currentTarget会指向绑定的父元素，而target依旧指向目标元素

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>


<div id="m10">
    <a href="javascript:;">1</a>
</div>


<script>
    document.getElementById('m10').addEventListener('click',function (e) {
           console.log(e.target,e.currentTarget)
    })
</script>

</body>
</html>

target: <a href="javascript:;">1</a>
currentTarget: <div id="m10"></div>

```

# 使用data-的好处

data-* 属性用于存储页面或应用程序的私有自定义数据。

data-* 属性赋予我们在所有 HTML 元素上嵌入自定义 data 属性的能力。

# <meta> 标签

提供关于 HTML 文档的元数据。它不会显示在页面上，但是对于机器是可读的。可用于浏览器（如何显示内容或重新加载页面），搜索引擎（关键词），或其他 web 服务，标签始终位于 head 元素中