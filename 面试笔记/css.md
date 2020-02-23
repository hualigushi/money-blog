#  CSS

1. box-sizing

box-sizing: border-box/content 

content-box的宽高计算方法是 width/height = content
content-box的内外边距不包含在width/height当中，而是在实际渲染时附加在原有基础上

border-box的宽高计算方法是 width/height = content + padding + border

应用场景: 通过百分比设定整体盒子的宽高,子元素整个盒子撑满父元素的内容区域,
        边框和填充被计算到盒模型内，不会破坏布局



