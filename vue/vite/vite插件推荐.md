[TOC]



# vite-plugin-eslint

vite的eslint插件,可是一个常见的插件,让你的项目可以方便的得到eslint支持,完成eslint配置后,可以快速的将其集成进vite之中,便于在代码不符合eslint规范的第一时间看到提示.
```js
import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';

export default defineConfig({
  plugins: [eslintPlugin()],
});
```

# @nabla/vite-plugin-eslint
这是基于上面的vite-plugineslint修改的一个插件,特点是支持异步检测可以加速项目的启动速度,不过缺点也是如果有错误或者警告不会提前停止项目编译.
```js
import { defineConfig } from "vite";
import eslintPlugin from "@nabla/vite-plugin-eslint";

export default defineConfig({
  plugins: [eslintPlugin()],
})
```

# vite-plugin-components
vite-plugin-components可以实现组件库或内部组件的自动按需引入组件,而不需要手动的进行import,可以帮我们省去不少import的代码
```js
import Vue from '@vitejs/plugin-vue'
import ViteComponents from 'vite-plugin-components'

export default {
  plugins: [
    Vue(),
    ViteComponents()
  ],
};
```

# vite-plugin-pwa
```js
import { VitePWA } from 'vite-plugin-pwa'

export default {
 plugins: [
   VitePWA()
 ]
}
```

# vite-svg-loader
vite-svg-loader插件可以让你像引用组件一样引用svg文件.

可以通过三种后缀支持三种模式加载

`?raw`

`?url`

`?component`

```js
import svgLoader from 'vite-svg-loader'

export default defineConfig({
 plugins: [vue(), svgLoader()]
})
```

```
<template>
    <my-icon/>
</template>

<script setup lang="ts>
import MyIcon from './my-icon.svg?component'
</script>
```

