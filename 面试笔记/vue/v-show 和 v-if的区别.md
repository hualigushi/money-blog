v-if指令会在渲染View视图中，主动去忽略绑定的DOM，它不会被加载到虚拟DOM，自然在ViewDOM中也不会去显示。 

v-show指令会给绑定的DOM添加一个 `display: none` 的style样式，来达到实现隐藏和显示功能。