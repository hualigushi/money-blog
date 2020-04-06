[Vue生命周期，及父子组件生命周期顺序](https://www.cnblogs.com/jaykoo/p/10529518.html)


# 问题描述

有一个组件有由一系列子组件组成，子组件又被分解成组件，这样下来就构成了三级组件。需求是在组件显示在页面上之后，再将数据初始化进行回显。父组件获取数据后传递到子组件，要求子组件根据这个值将内部元数据进行过滤和加工。那么在子组件中什么时机下才能获取父组件传递过来的新值呢？。

我的做法是这样的：最高层父组件的mounted中发起请求获取数据，通过vue的响应机制以props的形式传递到子组件，在子组件的mounted中拿到对应的props进行处理。这样做法要求父组件的mounted时机先于子组件的mounted,但事实是这样吗？显然不是。

这样导致的问题就是，数据无法正确的回显。

#  探究

父组件先创建，然后子组件创建；子组件先挂载，然后父组件挂载。

子组件挂载完成后，父组件还未挂载。所以组件数据回显的时候，在父组件mounted中获取api的数据，子组件的mounted是拿不到的。

仔细看看父子组件生命周期钩子的执行顺序，会发现created这个钩子是按照从外内顺序执行，所以回显场景的解决方案是：在created中发起请求获取数据，依次在子组件的created中会接收到这个数据。

![](https://image-static.segmentfault.com/379/352/3793524098-5b665dbbde824_articlex)



# 父组件监听子组件的生命周期
```
//  Parent.vue
<Child @hook:mounted="doSomething" ></Child>

doSomething() {
   console.log('父组件监听到 mounted 钩子函数 ...');
},
    
//  Child.vue
mounted(){
   console.log('子组件触发 mounted 钩子函数 ...');
},    
    
// 以上输出顺序为：
// 子组件触发 mounted 钩子函数 ...
// 父组件监听到 mounted 钩子函数 ...     
```