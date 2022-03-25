何为scoped？

在vue文件中的style标签上，有一个特殊的属性：scoped。当一个style标签拥有scoped属性时，它的CSS样式就只能作用于当前的组件，也就是说，该样式只能适用于当前组件元素。

通过该属性，可以使得组件之间的样式不互相污染。如果一个项目中的所有style标签全部加上了scoped，相当于实现了样式的模块化。

scoped的实现原理

vue中的scoped属性的效果主要通过PostCSS转译实现，如下是转译前的vue代码：

```
<style scoped>
.example {
 color: red;
}
</style>
<template>
 <div class="example">hi</div>
</template>
```

转义后：

```
<style>
.example[data-v-5558831a] {
 color: red;
}
</style>
<template>
 <div class="example" data-v-5558831a>hi</div>
</template>
```

即：PostCSS给一个组件中的所有dom添加了一个独一无二的动态属性，然后，给CSS选择器额外添加一个对应的属性选择器来选择该组件中dom，这种做法使得样式只作用于含有该属性的dom——组件内部dom。

谨慎使用:

　　1. 父组件无scoped属性,子组件带有scoped,父组件是无法操作子组件的.

　　2. 父组件有scoped属性,子组件无scoped.父组件也无法设置子组件样式.因为父组件的所有标签都会带有data-v-5db9451a唯一标志，但子组件不会带有这个唯一标志属性.

　　3. 父子组建都有，同理也无法设置样式，更改起来增加代码量.