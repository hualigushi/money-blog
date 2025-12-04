```
var SuperClass = class {};

var UnusedClass = class extends SuperClass {
    constructor() {
      super();
    }
  },
  unusedVariable = new UnusedClass();
  console.log("qly ~ unusedVariable:", unusedVariable)
```
 "webpack": "5.85.0" 下这段代码生产模式会被编译成 `class extends null` 
 
从而导致 页面访问时报错 `TypeError: Super constructor null of ... is not a constructor` 

解决方案: 1. 升级 webpack 
         2. 配置 
            ```
            optimization: {
        innerGraph: false,
      },
      ```
webpack issue: https://github.com/webpack/webpack/issues/17711

innerGraph 是 Webpack 5 引入的优化选项，用于 分析模块内部的导出与导入关系，以实现更精确的 Tree Shaking（移除未使用代码）。

默认值：true（启用）

启用时：Webpack 会追踪模块内部变量是否被使用，进一步优化打包体积。

禁用时：跳过此优化，可能保留更多未使用的代码。

当 Webpack 错误地移除实际被使用的代码时（如通过反射调用或全局注册的模块），禁用 innerGraph 可避免此问题。
