1. 隶属上的差别

　　link属于HTML标签，而@import完全是CSS提供的一种方式。

2. 加载顺序的不同

　　当页面被加载的时候，link引用的CSS会同时被加载，而@import引用的CSS 会等到页面全部被下载完再被加载。所以有时候浏览@import加载CSS的页面时开始会没有样式，然后突然样式会出现，网速慢的时候还挺明显。

3. 兼容性上的差别

　　由于@import是CSS2.1提出的，@import只有在IE5以上的才能识别，而link标签无此问题。

4. 使用DOM控制样式时的差别

　　当使用javascript控制DOM(document.styleSheets)去改变样式的时候，只能使用link标签，因为@import不是dom可以控制的。

5. @import次数

　　限制@import只能引入31次css文件。

6. link是html方式，@import是css方式