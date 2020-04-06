在显示时，将内容写入__html对象中即可。具体如下：

`<div dangerouslySetInnerHTML = {{ __html: checkMessages.details }} />`

如果是直接调用接口中的值，则是以上的写法，如果是单纯的显示固定的内容，用如下的写法：

`<div dangerouslySetInnerHTML={{ __html: '<div>123</div>' }} />`

原理：

1. dangerouslySetInnerHTMl 是React标签的一个属性，类似于angular的ng-bind；

2. 有2个{{}}，第一{}代表jsx语法开始，第二个是代表dangerouslySetInnerHTML接收的是一个对象键值对;

3. 既可以插入DOM，又可以插入字符串；

4. 不合时宜的使用 innerHTML 可能会导致 cross-site scripting (XSS) 攻击。 

净化用户的输入来显示的时候，经常会出现错误，不合适的净化也是导致网页攻击的原因之一。

dangerouslySetInnerHTML 这个 prop 的命名是故意这么设计的，以此来警告，它的 prop 值（ 一个对象而不是字符串 ）应该被用来表明净化后的数据。
