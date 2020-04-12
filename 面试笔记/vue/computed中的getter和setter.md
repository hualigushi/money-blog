① computed 中可以分成 getter（读取） 和 setter（设值）

② 一般情况下是没有 setter 的，computed 预设只有 getter ，也就是只能读取，不能改变设值。

一、默认只有 getter的写法
```
<div id="demo">{{ fullName }}</div>
var vm = new Vue({
  el: '#demo',
  data: {
    firstName: 'Foo',
    lastName: 'Bar'
  },
  computed: {
    fullName: function () {
      return this.firstName + ' ' + this.lastName
    }
  }
})
//其实fullName的完整写法应该是如下：
fullName: {
 get(){
   return this.firstName + ' ' + this.lastName
 }
}
```
注意：**不是说我们更改了getter里使用的变量，就会触发computed的更新，前提是computed里的值必须要在模板里使用才行**。

如果将{{fullName}}去掉，get（）方法是不会触发的。

二、setter的写法，可以设值
```
<template>
   <div id="demo">
       <p> {{ fullName }} </p>
       <input type="text" v-model="fullName">
       <input type="text" v-model="firstName">
       <input type="text" v-model="lastName">
   </div>
</template>

var vm = new Vue({
  el: '#demo',
  data: {
    firstName: 'zhang',
    lastName: 'san'
  },
  computed: {
    fullName: {
      //getter 方法
     get(){
       console.log('computed getter...')
        return this.firstName + ' ' + this.lastName
       }，
   //setter 方法
    set(newValue){
      console.log('computed setter...')
      var names = newValue.split(' ')
      this.firstName = names[0]
      this.lastName = names[names.length - 1]
      return this.firstName + ' ' + this.lastName
     }
      
    }
  }
})
```
在这里，我们修改fullName的值，就会触发setter，同时也会触发getter。

注意：**并不是触发了setter也就会触发getter，他们两个是相互独立的。
我们这里修改了fullName会触发getter是因为setter函数里有改变firstName 和 lastName 值的代码，
这两个值改变了，fullName依赖于这两个值，所以便会自动改变**。
