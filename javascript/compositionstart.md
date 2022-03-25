## 描述
在使用oninput监控输入框内容变化时，我们期望仅在value值变化时，才触发oninput事件，而在中文输入下，未选词时的按键也会触发oninput事件



IME问题：即中文输入时出现在输入框上方的带候选但还未选择的状态，其实这个在韩文日文等非字母文字中都会出现这个问题。



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



## Vue 实现

vue文档中有如下一段话

> 对于需要输入法编辑器的语言（中文、日文、韩文等），要注意的是，在 IME 字母组合窗口输入时 v-model 并不会更新。如果你想在此期间满足更新需求，请使用 input 事件。

```
 if (needCompositionGuard) {
    code = `if($event.target.composing)return;${code}`
  }
```

```
function onCompositionStart (e) {
	e.target.composing = true
}

function onCompositionEnd (e) {
	e.target.composing = false
	trigger(e.target, 'input')
}
```

```
el.addEventListener('compositionstart', onCompositionStart)
el.addEventListener('compositionend', onCompositionEnd)
```

