prefers-color-scheme是CSS 媒体特性【@media】用于检测用户是否有将操作系统的主题色设置为亮色【light】或者暗色【dark】，这俩个也是prefers-color-scheme重要属性。 

![](https://i0.hdslb.com/bfs/article/watermark/91386598a4e663845cda7e65253e0d26e4868226.png@942w_539h_progressive.webp)

当前prefers-color-scheme新特性支持各大主流电脑【window和IOS系统，Linux系统可以用第三方工具】端浏览器谷歌、火狐等，包括手机端的安卓和苹果，足以说明prefers-color-scheme属性已经稳定成熟，可以用于生产环境了。 



如何正确使用prefers-color-scheme属性呢？答：需要在全局css文件内部写入下面代码即可，用于监听系统主题变化结果

```css
:root {
    --color-background: #1b1b1b;
    --white-color-background: #fff;
    color-scheme: light dark;
}
/* 监听操作系统主题模式 */
@media (prefers-color-scheme: dark) {
    body {
        background-color: var(--color-background);
    }
}

@media (prefers-color-scheme: light) {
    body {
        background-color: var(--white-color-background);
    }
} 
```

当操作系统电脑端或者手机操作系统主题颜色变化时就能监听到主题，然后就会按照你预期设置的颜色进行渲染主题色。比如这里的body暗色主题是background-color: var(--color-background)，亮色主题是background-color: var(--white-color-background);

提示：:root表示根元素，拥有更高的优先级，这里可以设置全局样式变量，通过css的var方法来获取对应变量且获得相应的样式。



那么除了媒体监听主题变化，能不能自定义主题呢？答：能，可以通过js来操作操作，实现自由切换主题颜色，具体细节请往下看

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>系统的主题色设置为亮色或者暗色</title>
    <style lang="css">
        /* 整个页面配置为使用用户的配色方案首选项 */
        /* 根元素，优先级最高，与html选择器相同 */
        :root {
            --color-background: #1b1b1b;
            --color-border: #cacfd5;
            --color-text-default: #0b1016;
            --color-base: #f4f5f6;
            --color-accent: #ba0d37;
            --white-color-background: #fff;
            color-scheme: light dark;
        }
        * {
            margin: 0;
            padding: 0;
        }
        body {
            text-align: center;
            height: 100vh;
        }
        .light-scheme {
            background: var(--white-color-background);
            color: var(--color-text-default);
        }
        .dark-scheme {
            background: var(--color-background);
            color: white;
        }
        h2 {
            margin: 50px auto;
            color: var(--color-accent)
        }
/* 监听操作系统主题模式 */
        @media (prefers-color-scheme: dark) {
            body {
                background-color: var(--color-background);
            }
        }
        @media (prefers-color-scheme: light) {
            body {
                background-color: var(--white-color-background);
            }
        }
        .tab-type {
            display: flex;
            justify-content: center;
            padding-top: 30px;
        }
        .tab-type > li {
            cursor: pointer;
            color: #fff;
            background-color: darkred;
            border-radius: 12px;
            padding: 5px;
            margin: 0px 20px;
            max-width: 300px;
        }
</style>
</head>

<body>
    <div class="content" id="content">
        <ul class="tab-type">
            <li id="light">浅色主题</li>
            <li id="dark">暗色主题</li>
        </ul>
        <h2>微信公众号：[布依前端]，布衣前端，专注于前端知识分享的up</h2>
        <div class="scheme-tip"></div>
    </div> 
    <script>
        // 手动修改主题颜色
        const light = document.getElementById('light')
        const dark = document.getElementById('dark')
        const content = document.getElementsByTagName('body')[0]
        const tipText = document.getElementsByClassName('scheme-tip')[0]
        let lightTip = '当前自定义主题：light亮色', darkTip = '当前自定义主题：dark暗色'

        light.onclick = function (params) {
            content.setAttribute('class', 'light-scheme')
            tipText.innerHTML = lightTip
        }
        dark.onclick = function (params) {
            content.setAttribute('class', 'dark-scheme')
            tipText.innerHTML = darkTip
        }

        // js 监听系统主题模式
        const scheme = window.matchMedia('(prefers-color-scheme: dark)')
        if (scheme.matches) {
            // 深色模式业务处理代码
            console.log('深色模式');
            tipText.innerHTML = darkTip
        } else {
            // 浅色模式业务处理代码
            console.log('浅色模式');
            tipText.innerHTML = lightTip
        }
</script>
</body>
</html> 
```

把上面完整代码复制粘贴放到一个html文件内，双击打开到浏览器。此时的默认效果是【亮色】主题： 

![](https://i0.hdslb.com/bfs/article/watermark/283ce3a7cfc4c1714941f1565054f79157fcae63.png@942w_680h_progressive.webp)

作用关键代码如下 

```
/*系统亮色主题时修改body背景色*/
@media (prefers-color-scheme: light) {
    body {
        background-color: var(--white-color-background);
    }
} 
```



当设置windows系统主题为【暗】

![](https://i0.hdslb.com/bfs/article/watermark/5d8c7537b097a5209432d731ec2400d7390e3e48.png@942w_614h_progressive.webp) 

再去刷新浏览页面，此时页面效果是【暗色】主题，原因：当window10设置【暗色】主题后，css的prefers-color-scheme属性通过@media媒体监听到变化后，触发了css媒体事件，执行样式渲染，这个样式就是根据开发者设置的主题样式来渲染的。



当网站不满足系统默认主题，还想提供用户自己切换主题的功能，代码中有两个按钮，【浅色主题】和【暗色主题】就是干这件事情的。用户可以随意切换，具体切换代码可以到js部分查看。

除了css媒体能监听操作系统主题变化，js也能监听的，当监听到后可以增强js业务逻辑，比如设置某个主题下布局变化、语音播报当前模式等等和其他业务处理逻辑，需要设置页面加载后添加如下代码即可： 

```js
// js 监听系统主题模式
const scheme = window.matchMedia('(prefers-color-scheme: dark)')
if (scheme.matches) {
    // 深色模式业务处理代码
    console.log('深色模式');
    tipText.innerHTML = darkTip
} else {
    // 浅色模式业务处理代码
    console.log('浅色模式');
    tipText.innerHTML = lightTip
} 
```





总结prefers-color-scheme监听方式：

1. css里通过@media监听

2. js里面通过matchMedia监听 