# 1 为一个标签绑定事件写法

```
<button onclick="click_fn()">click</button>
   <script>
      function click_fn(){
         console.log(this);
      }
   </script>
```



# 2 DOM Document对象绑定事件

> （注：这种写法须先调用$(document).ready(fucntion(){//code…)来防止文档在未完全加载(就绪)之前就运行脚本）

上面这种简单的绑定有个局限：重复监听某一事件，后者会覆盖前者，而不会两者先后触发

# 3 addEventListener(event,function,useCapture)

- 它允许给一个事件注册多个监听器
- 它提供了一种更精细的手段控制事件监听器的触发阶段（可选择冒泡或捕获）
- 它对任何DOM元素都是有效的，而不仅仅是HTML元素
- 参数useCapture(使用捕获)为true时，使用事件捕获；为false时，使用事件冒泡(默认选项为false)
  IE浏览器只支持事件冒泡，不支持W3C标准，因此它也不支持addEventListener，但它提供了另一个函数attachEvent(event,fucntion)

```
 <script>
      $(document).ready(function(){
         document.getElementById("btn").addEventListener("click",function(){
            console.log("first click function")
         },false);
         document.getElementById("btn").addEventListener("click",function(){
            console.log("second click function")
         },false);
      });
   </script>
</head>
<body>
   <button id="btn">click</button>
   //点击一次之后会先显示first click function，然后再显示second click function
</body>
```


### 委托事件绑定
`$(selector).delegate(childSelector,event,data,function)`
它是利用冒泡的原理，把事件加到父级上，触发执行效果。

什么意思呢？
当你点击一个新增的标签时，原始加载的DOM结构是没有这个新增标签的，就也就是事件监听是与原始DOM结点进行绑定的。
而你用delegate将要绑定的元素委托给其父元素，也就是当你点击新增元素时，其实响应的是其父元素(逐一向上冒泡，看哪个元素已经被绑定监听事件)，而父元素会重新解析一下自己的DOM结构，这时候新增的元素标签就能被解析到了。

