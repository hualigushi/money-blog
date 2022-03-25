![](F:\money-blog\vue\vite\vite插件1.JPG)

![vite插件2](F:\money-blog\vue\vite\vite插件2.JPG)

![vite插件3](F:\money-blog\vue\vite\vite插件3.JPG)



vite-plugin-i18n.js

```JS
export default {
  // 将load进来的代码块进一步加工处理
  // code是快的内容
  // id是请求的url
  transform(code, id) {
    // i18n信息写入组件配置
    if (!/vue&type=i18n/.test(id)) {
      return;
    }
    return `export default Comp => {
      Comp.i18n = ${code}
    }`;
  },
};

```



vite.config.js

```
import i18n from "./plugins/vite-plugin-i18n";

plugins: [vue(), i18n]
```



App.vue

```vue
<template>
  <label>{{ t("language") }}</label>
  <select v-model="locale">
    <option value="en">en</option>
    <option value="zh">zh</option>
  </select>
  <p>{{ t("hello") }}</p>
</template>

<script setup>
import { getCurrentInstance, ref, computed } from "vue";

// 获取组件实例
const ins = getCurrentInstance();

function useI18n() {
  const locale = ref("zh");
  // 获取资源信息
  const i18n = ins.type.i18n;
  const t = (msg) => {
    return computed(() => i18n[locale.value][msg]).value;
  };
  return { locale, t };
}

const { locale, t } = useI18n();

</script>

<i18n>
{
  "en": {
    "language": "Language",
    "hello": "hello, world!"
  },
  "zh": {
    "language": "语言",
    "hello": "你好，世界！"
  }
}
</i18n>
```

