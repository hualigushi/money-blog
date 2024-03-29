## 简介回答

通过Object.definerProperty来劫持各个数据的属性的setter和getter，在数据变化时，发布消息给依赖收集器，通知观察者去执行回调函数，达到视图更新的效果。



## 具体回答

Vue响应系统，其核心有三点：observe、watcher、dep：

1. observe:遍历data中的属性，使用 Object.defineProperty 的get/set方法对其进行数据劫持
2. dep：每个属性拥有自己的消息订阅器dep，用于存放所有订阅了该属性的观察者对象
3. watcher：观察者（对象），通过dep实现对响应属性的监听，监听到结果后，主动触发自己的回调进行响应




vue.js 是采用数据劫持结合发布者-订阅者模式的方式，通过Object.defineProperty()来劫持各个属性的setter，getter，在数据变动时发布消息给订阅者，触发相应的监听回调。 具体实现步骤:

1. 当把一个普通 Javascript 对象传给 Vue 实例来作为它的 data 选项时，Vue 将遍历它的属性，用 Object.defineProperty 都加上 setter和getter 这样的话，给这个对象的某个值赋值，就会触发setter，那么就能监听到了数据变化

2. compile解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图，并将每个指令对应的节点绑定更新函数，添加监听数据的订阅者，一旦数据有变动，收到通知，更新视图

3. Watcher订阅者是Observer和Compile之间通信的桥梁，主要做的事情是: 

     1、在自身实例化时往属性订阅器(dep)里面添加自己 

     2、自身必须有一个update()方法 

     3、待属性变动dep.notice()通知时，能调用自身的update()方法，并触发Compile中绑定的回调，则功成身      退。

4. MVVM作为数据绑定的入口，整合Observer、Compile和Watcher三者，通过Observer来监听自己的model数据变化，通过Compile来解析编译模板指令，最终利用Watcher搭起Observer和Compile之间的通信桥梁，达到数据变化 -> 视图更新；视图交互变化(input) -> 数据model变更的双向绑定效果
```
//vue实现数据双向绑定的原理就是用Object.defineproperty()重新定义（set方法）对象设置属性值和（get方法）获取属性值的操纵来实现的。
//Object.property()方法的解释：Object.property(参数1，参数2，参数3)  返回值为该对象obj
//其中参数1为该对象（obj），参数2为要定义或修改的对象的属性名，参数3为属性描述符，属性描述符是一个对象，主要有两种形式：数据描述符和存取描述符。这两种对象只能选择一种使用，不能混合使用。而get和set属于存取描述符对象的属性。
//这个方法会直接在一个对象上定义一个新属性或者修改对象上的现有属性，并返回该对象。

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
    <div id="myapp">
        <input v-model="message" /><br>
        <span v-bind="message"></span>
    </div>
    <script type="text/javascript">
  var model = {
  message: ""
  };
  var models = myapp.querySelectorAll("[v-model=message]");
  for (var i = 0; i < models.length; i++) {
  models[i].onkeyup = function() {
  model[this.getAttribute("v-model")] = this.value;
  }
  }
  // 观察者模式 / 钩子函数
  // defineProperty 来定义一个对象的某个属性
  Object.defineProperty(model, "message", {
  set: function(newValue) {
  var binds = myapp.querySelectorAll("[v-bind=message]");
  for (var i = 0; i < binds.length; i++) {
      binds[i].innerHTML = newValue;
  };
  var models = myapp.querySelectorAll("[v-model=message]");
  for (var i = 0; i < models.length; i++) {
      models[i].value = newValue;
  };
  this.value = newValue;
  },
  get: function() {
  return this.value;
  }
  })
</script>
</body>
</html>
```