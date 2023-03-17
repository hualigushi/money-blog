在`qiankun`的实现中，包含了两种沙箱，分别为`基于Proxy实现的沙箱`和`快照沙箱`，当浏览器不支持`Proxy`会降级为`快照沙箱`



`Proxy沙箱的大致实现`，代码量不多，但是也有一些关键信息：

- `constructor`中会创建window对象的Proxy
- `active`会激活沙箱, 一般在`mount`时会调用该方法
- `inactive`会使沙箱失活，一般在`unmount`阶段会调用该方法
- `get`和`set`，则会对值的设置和获取做一些处理，并且不会影响到原始的window

### 





