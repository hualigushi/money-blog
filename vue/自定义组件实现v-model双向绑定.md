## 自定义组件实现v-model双向绑定

```
let Child = {
      template: '<div>' +
        '<input :value="value" @input="updateValue" placeholder="edit me">' +
        '</div>',
      props: ['value'],
      methods: {
        updateValue(e) {
          this.$emit('input', e.target.value)
        }
      }
    }
    let vm = new Vue({
      el: '#app',
      template: '<div>' +
        '<child v-model="message"></child>' +
        '<p>Message is: {{ message }}</p>' +
        '</div>',
      data() {
        return {
          message: ''
        }
      },
      components: {
        Child
      }
    })
```

相当于我们在这样编写⽗组件

```
let vm = new Vue({
    el: '#app',
    template: '<div>' +
        '<child :value="message" @input="message=arguments[0]"></child>' +
        '<p>Message is: {{ message }}</p>' +
        '</div>',
    data() {
        return {
        message: ''
        }
    },
    components: {
        Child
    }
})
```

⼦组件传递的 value 绑定到当前⽗组件的 message ，同时监听⾃定义 input 事件，当⼦组件派
发 input 事件的时候，⽗组件会在事件回调函数中修改 message 的值，同时 value 也会发⽣变
化，⼦组件的 input 值被更新。

这就是典型的 Vue 的⽗⼦组件通讯模式，⽗组件通过 prop 把数据传递到⼦组件，⼦组件修改了数据
后把改变通过 $emit 事件的⽅式通知⽗组件，所以说组件上的 v-model 也是⼀种语法糖。

可以在定义⼦组件的时候通过 model 选项配置⼦组件接收的 prop 名以及派发的事件名

```
let Child = {
  template: '<div>'
            + '<input :value="msg" @input="updateValue" placeholder="edit me">' +
            '</div>',
  props: ['msg'],
  model: {
    prop: 'msg',
    event: 'change'
  },
  methods: {
      updateValue(e) {
      this.$emit('change', e.target.value)
    }
  }
}
let vm = new Vue({
  el: '#app',
  template: '<div>' +
    '<child v-model="message"></child>' +
    '<p>Message is: {{ message }}</p>' +
    '</div>',
  data() {
    return {
      message: ''
    }
  },
  components: {
    Child
  }
})
```

10. 