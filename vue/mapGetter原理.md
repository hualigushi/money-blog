## ...mapGetter 原理分析

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
