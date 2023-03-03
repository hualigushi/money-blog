
# 经常li之间有看不见的间隔，造成的原因
回车和空格会被应用样式,解决方法：把字符大小设置成font-size:0



# offsetWidth/offsetHeight,clientWidth/clientHeight与scrollWidth/scrollHeight的区别

- `offsetWidth/offsetHeight`返回值包含**content + padding + border**，效果与e.getBoundingClientRect()相同
- `clientWidth/clientHeight`返回值只包含**content + padding**，如果有滚动条，也**不包含滚动条**
- `scrollWidth/scrollHeight`返回值包含**content + padding + 溢出内容的尺寸**



# 如何给一组列表首尾之外的元素添加样式

```css
// 考察了css伪类的使用

// DOM
<ul class="list">
  <li class="item">1</li>
  <li class="item">2</li>
  <li class="item">3</li>
  <li class="item">4</li>
  <li class="item">5</li>
</ul>

// Style

.list > .item:not(:first-child):not(:last-child) {
  /* ... style */
}
```



