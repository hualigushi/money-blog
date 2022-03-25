顶层Router订阅history，history变化时，Router调用setState将location向下传递，并设置到RouterContext。

Route组件匹配context中的location决定是否显示。

Switch选择最先匹配到的显示，利用props children。

Link组件阻止a标签默认事件，并调用history.push。

NavLink通过匹配context中的location决定是否为active状态。

Redirect组件匹配context里的location决定是否调用history.push(to)，

Switch组件会匹配location和from决定是否发起Redirect。

