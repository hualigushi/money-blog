# 可分析性

目标：快速定位线上问题

预防：人工 code review （重心在业务逻辑）    lint工具

兜底：sourcemap 定位

​           在webpack中添加sourcemap相关插件就可在编译过程直接上传sourcemap到sentry的报错平台

​           在使用sentry捕获报错事，就能够直接查看对应的源码了

​           @sentry/webpack-plugin





# 可改变性

目标：代码易于扩展，业务易于迭代（划分边界，模块隔离）

设计模式：组件设计模式

架构设计：状态管理框架



# 稳定性

目标： 避免修改代码引起不必要的线上问题

核心业务覆盖单元测试



# 易测试性

目标：易于发现代码潜在问题

架构划分

纯函数





# 可维护性的依从性

遵循约定，提升代码可读性

减少人为因素

加强工具干预  eslint  stylelint  commitment editorconfig prettier 