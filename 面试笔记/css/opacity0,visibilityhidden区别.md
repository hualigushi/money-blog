## display: none

1. 浏览器不会生成属性为display: none;的元素。 
2. 不占据空间，所以动态改变此属性时会引起重排。 
3. display: none;不会被子类继承，但是子类是不会显示的。 
4. transition无效

------

## visibility: hidden

1. 元素会被隐藏，但是不会消失，依然占据空间。 
2. 会被子类继承，子类也可以通过设置visibility: visible进行显示
3. 不会触发该元素已经绑定的事件。 
4. 动态修改此属性会引起重绘。 
5. transition无效。

------

## opacity:0

1. 只是透明度为100，元素隐藏，依然占据空间。 
2. 会被子元素继承，且子元素并不能通过opacity=1显示。 
3. opacity:0的元素依然能触发已经绑定的事件。 
4. transition有效

