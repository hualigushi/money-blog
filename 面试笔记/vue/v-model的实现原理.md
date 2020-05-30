v-model只不过是一个语法糖而已,v-model 在内部为不同的输入元素使用不同的属性并抛出不同的事件：

- text 和 textarea 元素使用 value 属性和 input 事件；
- checkbox 和 radio 使用 checked 属性和 change 事件；
- select 字段将 value 作为 prop 并将 change 作为事件。



以 input 表单元素为例, 真正的实现靠的还是

 - v-bind:绑定响应式数据
 - 触发oninput 事件并传递数据

 满足语法糖规则：属性必须为value，方法名必须为：input。缺一不可。
 ```
 <input v-model="sth" />
//  等同于
<input :value="sth" @input="sth = $event.target.value" /> 
//自html5开始,input每次输入都会触发oninput事件，所以输入时input的内容会绑定到sth中，于是sth的值就被改变;
//$event 指代当前触发的事件对象;
//$event.target 指代当前触发的事件对象的dom;
//$event.target.value 就是当前dom的value值;
//在@input方法中，value => sth;
//在:value中,sth => value;
 ```
```
<my-component v-model="price"></my-component>

<my-component :value="price" @input="price = $event.target.value"></my-component>
```



**当input且类型是`file`文件的话，则抛出一个警告**



