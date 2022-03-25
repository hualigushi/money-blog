event.target 返回触发事件的元素  

event.currentTarget 返回绑定事件的元素,在事件处理程序内部，对象this始终等于currentTarget的值

当事件处理程序直接绑定在目标元素上，此时`e.target===e.currentTarget`，`e.target === this`

当事件处理程序绑定在目标元素的父节点上时，currentTarget会指向绑定的父元素，而target依旧指向目标元素