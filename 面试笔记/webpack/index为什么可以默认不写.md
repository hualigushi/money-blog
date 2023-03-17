写在index.js文件，那么为啥是`import router from 'src/router'`而不是`import router from 'src/router/index'`”



因为在webpack的resolve（解析）配置中有mainFiles这个选项，

作用是配置解析目录时要使用的文件名，默认是 ["index"],所以才不要写index



为什么`import Vue from 'vue';import Router from 'vue-router';`这样可以引入Vue和vue Router,它们不是在node_modules里面吗？

其实还是webpack的resolve（解析）配置中的modules这个选项起作用，告诉webpack 解析模块时应该搜索的目录，默认是`["node_modules"]`，所以才会直接去node_modules里面寻找。

而resolve.mainFields这个配置是告诉我们当从node_modules中导入模块时，此选项将决定在 package.json 中使用哪个字段导入模块，默认`["module", "main"]`。

在Vue源码中package.json，有这一段配置

```json
"main": "dist/vue.runtime.common.js",
 "module": "dist/vue.runtime.esm.js",
```

所以`import Vue from 'vue'`,实际上去加载dist/vue.runtime.esm.js这个文件，

而这个文件最后有 `export default Vue;`,这样就把Vue引入我们的项目。

