1. Math.random().toString()  生成的字符串长度不统一（18 19 20）

  场景：AES加密生成随机数时，需要截取长度m,有可能生成的字符串长度小于m,需要注意长度

2. IE8  JSON.stringify方法中文会转成unicode编码, 空字符串转成null

3. 字节转换
```
function bytesToSize (bytes) {
  if （!bytes) {
    return '0 B'
  }
  let k = 1024,
      unit = ['B','KB','MB','GB','TB'],
      i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes/Math.pow(k,i)).toPrecision(3) + unit[i]
}
```

4. IE8 console.log 报错

5. 编写表格组件是需要注意：
   1. 原始数据源不能直接设置在原型上，应该拷贝后赋值
   
   2. 即绑定了单击事件，又绑定了双击事件，双击时应阻止掉两次单击事件
   
   3. 新添加的数据应渲染新添加数据的dom,而不是渲染整个dom
   
      

   
   
7. canvas 库

以前是使用控件绘制图形，现在是无插件，浏览器直接播放视频

绘制的图形很简单，就是点，线，圆，矩形，多边形，但是需要 8191坐标系转换（因为坐标点需要传给后台做算法分析），

基于业务的各种逻辑判断，比如判断点在多形性内部，边上，还是外面，还有事件处理，拖动，事件订阅等。

一开始做的时候只考虑了业务，绘制和业务夹杂在一起，其中绘制部分只占很小一部分，大量代码都是基于业务的逻辑判断。

后来进行了重构，把每一个图形的绘制封装成一个类，每个图形自己的绘制方法和对应的事件处理，自己鼠标绘制的图形通过事件回调触发绘制方法

然后封装一个通用类，可以绘制所有图形，对外暴露方法和属性设置，事件方法，多个图形的多个数据可以保存记忆

每个图形之间可以通过设置，构成父子关系

shape move resize  子shape也要跟着变

shape delete,子shape 也 delete

然后再基于业务模块封装，比如osd模块，智能模块，动检模块，每个模块有自己的业务方法，传入自己的option, 初始化，事件绑定

图形绘制基于一个容器container,每个容器绘制的图形为shape,shape里还有子shape

使用了发布订阅模式,处理服务器端事件回掉，比如 预览中跟踪框的显示，报警触发，智能规则显示

最后再封装了一个类，注册业务模块的所有方法，使得方法调用可以和原来的插件方法保持一致,使用了装饰器模式

最近进行了es6模块的重构，使用es6类的方式

eventManager类进行事件的绑定，以前是直接在图形类中进行dom事件的绑定

矩形绘制需要4个点，

规则名过长需要倾斜

判断c点是否在线段上

射线法判断点是否在多边形内部

判断2条线段是否相交，并计算出交点

大量计算，判断点 线 与 多边形的位置关系与距离

canvas  beginPath
        moveTo
        lineTo
        closePath
        fill
        arc
        fillText
        strokeText
        clearRect
        setLineDash
        stroke
        save
        restore

现在想想还有做的不好的地方，拖动，移动事件没有做节流处理

8. 0011 IE浏览器下会被识别为8进制数

9. 目录遍历安全问题

假如输入框可以让用户输入服务器目录，那么输入 `../../../`这样需要进行特殊处理，因为用户可以遍历到根目录，进行攻击操作

10. 鼠标长按 短按判断

11. POST 请求，请求体里字段值为null的话，该字段会被浏览器忽略

    headers里不能放date字段，会被浏览器忽略

14. Edge不支持textDecode方法

15. Edge MSE 不支持canplaythrough方法

16. react重构
    
    - 生产环境打包分包 splitChunks
      
    - 引入 babel-polyfill适配es6在低版本浏览器
      webpack entry:['babel-polyfill']
      
    - script-ext-html-webpack-plugin
      将runtime.js打成一个包，植入html,减少首屏加载js数量
      ```
      optimization: {
        runtimetimeChunk: 'single'
      }
      ```
      ```
      plugins:[
        new scriptExtHtmlWebpackPlugin({
          inline: /runtime.*.js/
        })
      ]
      ```
      
 - happyPack 多核打包
    
      
    
      重构思考: 
    
    ​       背景:  多产品代码分支多,页面风格样式老旧,页面交互不友好,技术更新
    
    ​       分析:  交互友好,样式扁平,换肤方便,支持国际化,公共组件库,单元测试
    
    ​      目前回过头来看做的不好地方: hooks  ts  组件单独打成npm包
    
    ​       如果是面向更多用户: 监控系统 CDN  缓存 graphql
    
17. 无插件

    worker 需要terminate
    
    video 视频播放没有接受到数据后，Edge的currentTime会不断增加

    解码

    mse 事件处理

    内存处理

    worker重复创建处理

    帧顺序

    webGL 渲染

    循环条件终止
    
    h264走MSE方案，目前浏览器不支持h265协议，走webGL方案
    
18. 输入框中文长度截断

19. jsPlumb 
    初始化 jsPlumb.getInstance
    设置事件监听
    
    instance.getConnections({source:source, target: target}).length === 1  两节点只能存在一条连线
    
    conns.source === originNode 不能形成闭合回路
