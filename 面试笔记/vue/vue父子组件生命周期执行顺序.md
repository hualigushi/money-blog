组件的调用顺序都是`先父后子`,渲染完成的顺序是`先子后父`。

组件的销毁操作是`先父后子`，销毁完成的顺序是`先子后父`。





 加载渲染过程：
 父beforeCreate->父created->父beforeMount->子beforeCreate->子created->子beforeMount->子mounted->父mounted

 子组件更新过程：
 父beforeUpdate->子beforeUpdate->子updated->父updated

 父组件更新过程：
 父beforeUpdate->父updated

 销毁过程：
 父beforeDestroy->子beforeDestroy->子destroyed->父destroyed


