## 作用
Mutation Observer API 用来监视 DOM 变动。比如节点的增减、属性的变动、文本内容的变动。

Mutation Observer 是异步触发，DOM 的变动并不会马上触发，而是要等到当前所有 DOM 操作都结束才触发。

## 特点
Mutation Observer 有以下特点。

1. 它等待所有脚本任务完成后，才会运行（即异步触发方式）。
2. 它把 DOM 变动记录封装成一个数组进行处理，而不是一条条个别处理 DOM 变动。
3. 它既可以观察 DOM 的所有类型变动，也可以指定只观察某一类变动。

## 构造器
MutationObserver是一个构造器，接受一个callback参数，用来处理节点变化的回调函数，返回两个参数
1. **mutations**：节点变化记录列表（sequence<MutationRecord>）
2. **observer**：观察器实例
```
var observer = new MutationObserver(function (mutations, observer) {
  mutations.forEach(function(mutation) {
    console.log(mutation);
  });
});
```

## 实例方法
MutationObserver对象有三个方法，分别如下：

1. **observe**：设置观察目标，接受两个参数，target：观察目标，options：通过对象成员来设置观察选项
2. **disconnect**：阻止观察者观察任何改变
3. **takeRecords**：清空记录队列并返回里面的内容

关于observe方法中options参数有已下几个选项：

1. **childList**：设置true，表示观察目标子节点的变化，比如添加或者删除目标子节点，不包括修改子节点以及子节点后代的变化
2. **attributes**：设置true，表示观察目标属性的改变
3. **characterData**：设置true，表示观察目标数据的改变,至少必须同时指定1 2 3这三种观察的一种，若均未指定将报错
4. **subtree**：设置为true，目标以及目标的后代改变都会观察
5. **attributeOldValue**：如果属性为true或者省略，则相当于设置为true，表示需要记录改变前的目标属性值，设置了attributeOldValue可以省略attributes设置
6. **characterDataOldValue**：如果characterData为true或省略，则相当于设置为true,表示需要记录改变之前的目标数据，设置了characterDataOldValue可以省略characterData设置
7. **attributeFilter**：如果不是所有的属性改变都需要被观察，并且attributes设置为true或者被忽略，那么设置一个需要观察的属性本地名称（不需要命名空间）的列表

MutationRecord对象包含了DOM的相关信息，有如下属性：

1. **type**：观察的变动类型（attribute、characterData或者childList）。
2. **target**：发生变动的DOM节点。
3. **addedNodes**：新增的DOM节点。
4. **removedNodes**：删除的DOM节点。
5. **previousSibling**：前一个同级节点，如果没有则返回null。
6. **nextSibling**：下一个同级节点，如果没有则返回null。
7. **attributeName**：发生变动的属性。如果设置了attributeFilter，则只返回预先指定的属性。
8. **oldValue**：变动前的值。这个属性只对attribute和characterData变动有效，如果发生childList变动，则返回null。


## 例子
### 1
```
//选择一个需要观察的节点
var targetNode = document.getElementById('some-id');

// 设置observer的配置选项
var config = { attributes: true, childList: true, subtree: true };

// 当节点发生变化时的需要执行的函数
var callback = function(mutationsList, observer) {
    for(var mutation of mutationsList) {
        if (mutation.type == 'childList') {
            console.log('A child node has been added or removed.');
        }
        else if (mutation.type == 'attributes') {
            console.log('The ' + mutation.attributeName + ' attribute was modified.');
        }
    }
};

// 创建一个observer示例与回调函数相关联
var observer = new MutationObserver(callback);

//使用配置文件对目标节点进行观测
observer.observe(targetNode, config);

// 停止观测
observer.disconnect();
```

### 2 callback的回调次数
```
<div id='target' class='block' name='target'>
    target的第一个子节点
    <p>
       <span>target的后代</span>
    </p>
</div>
```

```
var target=document.getElementById('target');
var i=0
var observe=new MutationObserver(function (mutations,observe) {
    i++   
});
observe.observe(target,{ childList: true});
target.appendChild(docuemnt.createTextNode('1'));
target.appendChild(docuemnt.createTextNode('2'));
target.appendChild(docuemnt.createTextNode('3'));
console.log(i)                //1
```
MutationObserver的callback回调函数是异步的，只有在全部DOM操作完成之后才会调用callback。

### 3 当只设置{ childList: true}时,表示观察目标子节点的变化
```
var observe=new MutationObserver(function (mutations,observe) {
    debugger;
    console.log(mutations);
    //observe.discount();     
});

observe.observe(target,{ childList: true});
target.appendChild(document.createTextNode('新增Text节点'));   //增加节点，观察到变化
target.childNodes[0].remove();                                //删除节点，可以观察到
target.childNodes[0].textContent='改变子节点的后代';             //不会观察到
```
如果想要观察到子节点以及后代的变化需设置{childList: true, subtree: true}

attributes选项用来观察目标属性的变化,用法类似与childList,目标属性的删除添加以及修改都会被观察到。

### 4
我们需要注意的是characterData这个选项，它是用来观察CharacterData类型的节点的，只有在改变节点数据时才会观察到，如果你删除或者增加节点都不会进行观察，还有如果对不是CharacterData类型的节点的改变不会观察到
```
observe.observe(target,{ characterData: true, subtree: true});
target.childNodes[0].textContent='改变Text节点';              //观察到
target.childNodes[1].textContent='改变p元素内容';              //不会观察到
target.appendChild(document.createTextNode('新增Text节点'));  //不会观察到
target.childNodes[0].remove();                               //删除TEXT节点也不会观察到
```
只有对CharacterData类型的节点的数据改变才会被characterData为true的选项所观察到。

### 5 只观察目标style属性的变化
```
observe.observe(target,{ attributeFilter: ['style'], subtree: true});
target.style='color:red';                      //可以观察到
target.removeAttribute('name');                //删除name属性，无法观察到 
```

### 6 
takeRecords方法是用来取出记录队列中的记录。它的一个作用是，比如你对一个节点的操作你不想马上就做出反应，过段时间在显示改变了节点的内容
```
var observe=new MutationObserver(function(){});
observe.observe(target,{ childList: true});
target.appendChild(document.createTextNode('新增Text节点'));
var record = observe.takeRecords();              //此时record保存了改变记录列表  
//当调用takeRecords方法时，记录队列被清空因此不会触发MutationObserver中的callback回调方法。
target.appendChild(document.createElement('span'));
observe.disconnect();                            //停止对target的观察。
//MutationObserver中的回调函数只有一个记录，只记录了新增span元素

//之后可以对record进行操作
//...
```

### 7 取代 DOMContentLoaded 事件
网页加载的时候，DOM 节点的生成会产生变动记录，因此只要观察 DOM 的变动，就能在第一时间触发相关事件，也就没有必要使用DOMContentLoaded事件
```
var observer = new MutationObserver(callback);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
```
上面代码中，监听`document.documentElement`（即网页的<html>HTML 节点）的子节点的变动，subtree属性指定监听还包括后代节点。因此，任意一个网页元素一旦生成，就能立刻被监听到。