color-scheme CSS 属性允许元素指示它可以轻松呈现的配色方案。

操作系统配色方案的常见选择是“亮”和“暗”，或者是“白天模式”和“夜间模式”。当用户选择其中一种配色方案时，操作系统会对用户界面进行调整。这包括表单控件、滚动条和 CSS 系统颜色的使用值。

color-scheme 属性的值必须是以上关键字之一。

normal ：表示元素未指定任何配色方案，因此应使用浏览器的默认配色方案呈现。

light ：表示可以使用操作系统亮色配色方案渲染元素。

dark ：表示可以使用操作系统深色配色方案渲染元素。

要将整个页面配置为使用用户的配色方案首选项，请在 :root 元素上指定 color-scheme 。

```css
:root {
	color-theme: dark
}
```

一旦操作系统亮色配色方案发生变化，它就会自动从[样式表](https://so.csdn.net/so/search?q=样式表&spm=1001.2101.3001.7020)中应用相应的颜色方案，而无需编写其他样式或媒体查询。



通过在网页HTML中的＜head＞中添加＜meta name＝“color scheme”＞标记，我们可以获得相同的作用：

```html
<head>
	<meta name="color-theme" content="dark"/>
</head>
```

