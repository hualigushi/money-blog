1. 刷新整个页面（最low的，可以借助route机制）
2. 使用v-if标记（比较low的）
3. 使用内置的forceUpdate方法（较好的）
4. 使用key-changing优化组件（最好的）

# force update

组件内置$forceUpdate方法，使用前需要在配置中启用。
```
import Vue from 'vue'
Vue.forceUpdate()

export default {
  methods: {
    handleUpdateClick() {
      // built-in
      this.$forceUpdate()
    }
  }
}
```

# key-changing

原理很简单，vue使用key标记组件身份，当key改变时就是释放原始组件，重新加载新的组件。
```
<template>
  <div>
    <span :key="key"></span>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        key: 0
      }
    },
    methods: {
      handleUpdateClick() {
        this.key += 1 
      }
    }
  }
</script>
```
