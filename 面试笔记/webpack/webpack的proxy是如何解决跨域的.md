我们在使用webpack开发项目的时候，webpack的dev-server模块会启动一个服务器，这个服务器不止帮我们做了自动更新，同时也可以做到反向代理。

就是我们把请求发送给webpack-dev-server, 然后webpack-dev-server再去请求后端服务器，服务之间的请求是没有跨域问题的，只要后端返回了webpack-dev-server就能拿到，然后再返回给前端。

