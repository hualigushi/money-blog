breforeCreate（）：实例创建前，这个阶段实例的data和methods是读不到的。

created（）：实例创建后，这个阶段已经完成数据观测，属性和方法的运算，watch/event事件回调，mount挂载阶段还没有开始。$el属性目前不可见，数据并没有在DOM元素上进行渲染。

created完成之后，进行template编译等操作，将template编译为render函数，有了render函数后才会执行beforeMount（）

beforeMount（）：在挂载开始之前被调用：相关的 render 函数首次被调用

mounted（）：挂载之后调用，el选项的DOM节点被新创建的 vm.$el 替换，并挂载到实例上去之后调用此生命周期函数，此时实例的数据在DOM节点上进行渲染

后续的钩子函数执行的过程都是需要外部的触发才会执行

有数据的变化，会调用beforeUpdate，然后经过Virtual Dom，最后updated更新完毕，当组件被销毁的时候，会调用beforeDestory，以及destoryed。
