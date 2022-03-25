## webpack 离线缓存静态资源如何实现

- 在配置webpack时，我们可以使用`html-webpack-plugin`来注入到和html一段脚本来实现将第三方或者共用资源进行 静态化存储在html中注入一段标识，例如 `<% HtmlWebpackPlugin.options.loading.html %>` ,在 `html-webpack-plugin` 中即可通过配置html属性，将script注入进去
- 利用 `webpack-manifest-plugin` 并通过配置 `webpack-manifest-plugin` ,生成 `manifestjson` 文件，用来对比js资源的差异，做到是否替换，当然，也要写缓存script
- 在我们做Cl以及CD的时候，也可以通过编辑文件流来实现静态化脚本的注入，来降低服务器的压力，提高性能
- 可以通过自定义plugin或者html-webpack-plugin等周期函数，动态注入前端静态化存储script

