# flex

## 设置在容器上

1 flex-direction:属性决定主轴的方向；  
　　　　　　　　　　 row 水平方向，起点在左端  
　　　　　　　　　　 row-reverse  水平方向，起点右端  
　　　　　　　　　　 column 纵向方向，起点在上  
　　　　　　　　　　 column 纵向方向，起点在下  

2 flex-wrap:决定是否换行，默认都是排在一行  
　　　　　　　no-wrap;(默认)不换行  
　　　　　　　wrap; //换行，第一行在上方  
　　　　　　　wrap-reverse;//换行；第二行在上方  

3 flex-flow:flex-direction和flex-wrap的缩写，默认为row nowrap  
　flex-flow:<flex-direction> ||<flex-wrap>  

4 justify-content:定义在item在主轴上的对齐方式  
　　　　　　　　　　　flex-start 从左到右  
　　　　　　　　　　　flex-end   从右到左  
　　　　　　　　　　　center     居中  
　　　　　　　　　　  space-between 两端对齐  
　　　　　　　　　　　space-around   每个item两侧中间相等  

5 align-items:item在纵轴上的对齐方式  
                flex-start：交叉轴的起点对齐。  
                flex-end：交叉轴的终点对齐。  
                center：交叉轴的中点对齐。  
                baseline: 项目的第一行文字的基线对齐。  
                stretch（默认值）：如果项目未设置高度或设为auto，将占满整个容器的高度。  



## 设置在项目上  

1. order属性定义项目的排列顺序。数值越小，排列越靠前，默认为0。  

2. flex-grow属性定义项目的放大比例，默认为0，即如果存在剩余空间，也不放大。  
如果所有项目的flex-grow属性都为1，则它们将等分剩余空间（如果有的话）。如果一个项目的flex-grow属性为2，其他项目都为1，则前者占据的剩余空间将比其他项多一倍。

3. flex-shrink属性定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小。  
如果所有项目的flex-shrink属性都为1，当空间不足时，都将等比例缩小。如果一个项目的flex-shrink属性为0，其他项目都为1，则空间不足时，前者不缩小。

4. flex-basis属性定义了在分配多余空间之前，项目占据的主轴空间（main size）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为auto，即项目的本来大小。

5. **flex属性是flex-grow, flex-shrink 和 flex-basis的简写，默认值为0 1 auto**。后两个属性可选。

6. align-self属性允许单个项目有与其他项目不一样的对齐方式，可覆盖align-items属性。默认值为auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch。





`flex-grow`属性定义项目的放大比例，默认为0，即如果存在剩余空间，也不放大。

`flex-shrink`属性定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小。

`flex-basis`属性定义了在分配多余空间之前，项目占据的主轴空间（main size）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为auto，即项目的本来大小。

