#### 函数式组件

> 函数式组件区别于一般组件的是没有生命周期、响应式数据、计算属性等，也就是说函数式组件可以理解为它是一个没有vue实例的组件，他只接受一个`props`的传参，这个也为他带来了渲染快速的特点。



> 个人的使用场景：我会使用在多同级组件的封装。例如我这边有个展示的需求，我想要通过卡片、列表等可选择的展示方式展示同一份数据源。如果我们将这些代码都写在一个组件中`解耦度低`，如果我们将展示都写成组件，全部引入父组件这样代码又出现了`冗余`。于是我们可以提供一个组件来`分发`符合条件的组件。既可以单独使用各个展示组件，又可以使用同一封装的组件。

```
// 父组件
<template>
   <div class='father'>
        <card-component v-if="type===card"></card-component>  // 不同组件我们需要都引入到父组件中
        <list-component v-if="type===list"></list-component>
        <circle-component v-if="type===circle"></circle-component>
   </div>
</template>
<script>
export default {
  data () {
    return {
      type:'card'
    };
  },
}
</script>


//重写父组件
<template>
   <div class='father'>
        <function-component :type="type"></function-component>  // 函数组件分发
   </div>
</template>

//函数组件
<template functional>    
	// functional是标记模板语法这个组件是函数式组件，如果不使用模板就应该设置functional:true
   <div class='father'>
        <card-component v-if="prop.type===card"></card-component>  // 不同组件我们引入函数组件
        <list-component v-if="prop.type===list"></list-component>
        <circle-component v-if="prop.type===circle"></circle-component>
   </div>
</template>
```