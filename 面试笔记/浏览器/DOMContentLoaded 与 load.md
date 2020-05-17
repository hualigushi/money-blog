## DOMContentLoaded
 - 当初始的 HTML 文档被完全加载和解析完成之后，DOMContentLoaded 事件被触发，而无需等待样式表、图像和子框架的完成加载。  
 - DOMContentLoaded是 document 对象的触发事件
 - DOMContentLoaded 事件在触发之前
   1. 有一次 readyState 的变化，从 loading 到 interacitve。
   2. 所有节点从栈里弹出。
   3. 将静态的script执行完毕，动态script不会阻塞DOMContentLoaded 事件的触发。
   4. 然后就是触发 DOMContentLoaded 事件。
```
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Event Demo</title>
</head>
<body>
  <p class="demo">hello</p>
   <script>
    console.log("script excuting, state is "+ document.readyState);
  </script>
  <script>
    setTimeout(function() {
       document.querySelector(".demo").style.color = "red";
    console.log("element painting and the state is "+document.readyState);
    },2000)
  </script>
</body>
</html>
```
```
// js file
document.addEventListener("DOMContentLoaded", function (){
  console.log("DOMContentLoaded event");
});

document.addEventListener("readystatechange", function (){
  console.log("state change: now is: "+document.readyState);
});
```
```
// output
"script excuting, state is loading"
"state change: now is: interactive"
"DOMContentLoaded event"
"state change: now is: complete"
"element painting and the state is complete"
```
可以看出：

1. 在触发DOMContentLoaded 事件之前，readystatechange 事件被触发了一次，readyState 从loading 变到 interactive，
   DOMContentLoaded 触发后有触发了一次 readystatechange，readyState 变成 complete。
2. DOMContentLoaded 在静态脚本执行完毕之后（script excuting）才会触发。而动态的脚本（element painting）并不会阻碍DOMContentLoaded 事件的触发。

## load
- 当一个资源及其依赖资源已完成加载时，将触发load事件。  
- load 是 window 对象的事件
- load事件是在readyState 为complete之后才会触发
```
window.addEventListener("load",function() {
  console.log("load event");
});
```
```
"script excuting, state is loading"
"state change: now is: interactive"
"DOMContentLoaded event"
"state change: now is: complete"
"load event"
"element painting and the state is complete"
```
`readyState:loading` -> 静态script 执行 -> `readystatechange:interacitve` -> `DOMContentLoaded` -> `readystatechange:complete` -> `load` -> `动态script`
