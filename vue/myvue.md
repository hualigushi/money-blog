1. vue远程调试工具

```
npm install --save-dev @vue/devtools
```

运行 vue-devtools

public/index.html 添加 

```
<script src="http://localhost:8098"></script> 上线时需注释掉
```

2. ...mapGetter 原理分析

对象混入
```
fn () {
    return {
        a: 1,
        b: 2
    }
}

console.log({
    ...fn(),
    c: 3,
    d: 4 
})
```

```
<script>
const getters = {
    a: () => 1,
    b: () => 2
}
function fn (keys) {
    const data = {}
    keys.forEach(key => {
        if (getters.hasOwnProperty(key)) {
            data[key] = getters[key]
        }
    })
    return data
}

export default {
    computed: {
        ...fn(['a', 'b', 'c'])
    }
}
</script>
```

3. 环境变量

根目录下创建 
.env.development  开发环境
.env.production   生产环境
必须以VUE_APP开头
例如 VUE_APP_RES_URL=http://106.15.231.180
.vue文件中引用 ${process.env.VUE_APP_RES_URL}

4. 动态切换组件

```
<keep-alive>
    <component :is="tab === 1 ? content : bookmark"></component>
</keep-alive>
```