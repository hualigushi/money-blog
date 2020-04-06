## 描述
在使用oninput监控输入框内容变化时，我们期望仅在value值变化时，才触发oninput事件，而在中文输入下，未选词时的按键也会触发oninput事件

## 方法
使用一个变量表示拼写状态，在oninput事件中判断是否在拼写状态，当拼写状态结束，继续执行下一步操作。
```
var typing = false;
$('#ipt').on('compositionstart',function(){
    typing = true;
})
$('#ipt').on('compositionend',function(){
    typing = false;
})
//oninput在oncompositionend之前执行，需加定时器
$('#ipt').on('input',function(){
    setTimeout(function() {
        if(!typing) {
            //To do something...
        }
    },0);
})

//或用keyup代替input
$('#ipt').on('input',function(){
    if(!typing) {
        //To do something...
    }
})
```