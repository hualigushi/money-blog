1. dom 事件对象中target与currentTarget区别  
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
