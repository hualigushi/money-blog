`compiler`对象是一个全局单例，他负责把控整个`webpack`打包的构建流程。 



`compilation`对象是每一次构建的上下文对象，它包含了当次构建所需要的所有信息，每次热更新和重新构建，`compiler`都会重新生成一个新的`compilation`对象，负责此次更新的构建过程。