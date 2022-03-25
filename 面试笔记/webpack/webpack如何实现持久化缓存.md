## webpack如何实现持久化缓存

- `服务端设置http缓存头`（cache-control）
- 打包依赖和运行时到不同的chunk，`即作为splitChunk,因为他们几乎是不变的`
- `延迟加载`：使用`import()方式`，可以动态加载的文件分到独立的chunk,以得到自己的chunkhash
- `保持hash值的稳定`：编译过程和文件内通的更改尽量不影响其他文件hash的计算，对于低版本webpack生成的增量数字id不稳定问题，可用`hashedModuleIdsPlugin`基于文件路径生成解决

