## 源码分析

### **1.入口函数**

v-model本身是一个指令语法糖，来为input 和 指定的变量做一个双向绑定的过程

```
// model 函数
function model (
  el,
  dir,
  _warn
) {
  console.log(el)
  console.log(dir)
  console.log(_warn)
}
```

打印结果如下

![img](https://user-gold-cdn.xitu.io/2020/5/10/171fdea15a59bff0?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

- el 为 `ASTElement` AST语法元素
- dir 为 `ASTDirection AST指令`
- _warn 为 一个警告函数

### **2.获取v-model元素需要用到的一些属性**

下面的代码，主要是用来`v-model`绑定的元素获取一些基本信息。

- value: 绑定`data`的属性名称。
- modifiers: 修饰符对象，如`v-model.lazy="msg"`的修饰符会生成一个对象, { lazy: true }表示`lazy`修饰符存在。
- tag: `v-model` 绑定的标签名称。
- type: 元素的`attribute`中的type类型

```
// 绑定`data`的属性名称
var value = dir.value;
// 修饰符列表
var modifiers = dir.modifiers; 
//标签名称， 
var tag = el.tag; 
// 元素的类型
var type = el.attrsMap.type; // 标签类型
console.log(value, modifiers, tag, type)
```

### **3.当 input类型为file的时候**

这里做了个判断，当input且类型是`file`文件的话，则抛出一个警告。用来警示开发者。

```
{
  // 类型为file的input是只读的，设置input的值可能会导致错误
  if (tag === 'input' && type === 'file') {
    warn$1(
      // error 信息
      "<" + (el.tag) + " v-model=\"" + value + "\" type=\"file\">:\n" +
      "File inputs are read only. Use a v-on:change listener instead.",
      el.rawAttrsMap['v-model']
    );
  }
}
```

当我们做一个`file`去使用`v-model`的时候，控制台就直接打印了一条错误。

![img](https://user-gold-cdn.xitu.io/2020/5/10/171fdea167b8e56f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### **4.根据不同形式，做不同的处理**

在Vue中，`v-model`先判断，当前元素是标签还是组件，如果是组件，就调用`genComponentModel`来去处理这个问题。组件v-model额外运行时，就返回。

先对组件判断，在然后对原生标签做处理。如`input`，`select`，`checkbox`等标签的双向绑定。

- 组件： genComponentModel( el: ASTElement, value: string, modifiers: ?ASTModifiers)
- select下拉选择框：getSelect( el: ASTElement, value: string, modifiers: ?ASTModifiers)
- checkbox多选框： genCheckboxModel( el: ASTElement, value: string, modifiers: ?ASTModifiers)
- Radio单选按钮：genRadioModel( el: ASTElement, value: string, modifiers: ?ASTModifiers)
- input & textarea （默认Model处理）：genDefaultModel( el: ASTElement, value: string, modifiers: ?ASTModifiers)
- 绑定的元素不支持v-model，则会提示错误。v-model不支持该元素。如下图 ![img](https://user-gold-cdn.xitu.io/2020/5/10/171fdea15bd2a559?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

```
// 判断 el 是否是组件
if (el.component) {
  genComponentModel(el, value, modifiers);
  // component v-model doesn't need extra runtime
  return false
} else if (tag === 'select') {
  // 处理Select
  genSelect(el, value, modifiers);
} else if (tag === 'input' && type === 'checkbox') {
  // 处理checkbox
  genCheckboxModel(el, value, modifiers);
} else if (tag === 'input' && type === 'radio') {
  // 处理单选
  genRadioModel(el, value, modifiers);
} else if (tag === 'input' || tag === 'textarea') {
  // 默认的输入框 针对于 输入框 和 多行输入框
  genDefaultModel(el, value, modifiers);
} else if (!config.isReservedTag(tag)) {
  // 不需要额外去额外运行时
  genComponentModel(el, value, modifiers);
  return false
} else {
  warn$1(
    // 如果不在处理范内，提示错误。v-model不支持该元素
    "<" + (el.tag) + " v-model=\"" + value + "\">: " +
    "v-model is not supported on this element type. " +
    'If you are working with contenteditable, it\'s recommended to ' +
    'wrap a library dedicated for that purpose inside a custom component.',
    el.rawAttrsMap['v-model']
  );
}
```

### **默认处理方式genDefaultModel**

`genDefaultModel` 主要是用来处理基本文本框和多选文本框。 处理实例： ![img](https://user-gold-cdn.xitu.io/2020/5/10/171fdea15c230ae4?imageView2/0/w/1280/h/960/format/webp/ignore-error/1) 在`genDefaultModel`的第一句话，就是将`el`的`attribute`的`type`值。因为其中有一个新加入的`range`与其他的值是不一样的。需要额外做出处理

```
var type = el.attrsMap.type;
```

其次，需要判断v-bind:值与v-model是否冲突,如果冲突就会将错误添加到堆栈当中。所以我们在控制台可以看到冲突的提示

![img](https://user-gold-cdn.xitu.io/2020/5/10/171fdea15cfb7992?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

```
// 如果v-bind:值与v-model冲突，则发出警告
// 除了带有v-bind的输入:type
{
  var value$1 = el.attrsMap['v-bind:value'] || el.attrsMap[':value']
  var typeBinding = el.attrsMap['v-bind:type'] || el.attrsMap[':type']
  if (value$1 && !typeBinding) {
    var binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value'
    warn$1(
      binding +
        '="' +
        value$1 +
        '" conflicts with v-model on the same element ' +
        'because the latter already expands to a value binding internally',
      el.rawAttrsMap[binding]
    )
  }
}
```

其次，在获取当前修饰符的状态去生成表达式，下面对`modifiers` 进行获取，如果`modifiers`为`undefined`的话，那么它就是一个空对象。

```
// 获取修饰符列表
var ref = modifiers || {}
// 懒加载修饰符
var lazy = ref.lazy
// 数字修饰符
var number = ref.number
// 空格过滤修饰符
var trim = ref.trim
// 在未打包下是这样的
const { lazy, number, trim } = modifiers || {}
```

当获取到了修饰符的状态后，下一步开始生成`event`事件，因为其中有一些事件是vue自己定义的，比如：

```
// RANGE
export const RANGE_TOKEN = '__r'
// CHECK & RADIO
export const CHECKBOX_RADIO_TOKEN = '__c'
```

通过event，生成code代码模板。这里会对修饰符进行一个判定。默认的`event`为`input`，如果是`lazy`的话就使用`change`事件。不是的话对`range`做判断。如果type是range的话就使用`RANGE_TOKEN`反之则就是`input`了。当生成了事件名后，根据不同的修饰符生成对应的value表现模板，通过`genAssignmentCode`方法，获取代码字符串。

```
// 非懒加载进度条时候
const needCompositionGuard = !lazy && type !== 'range'
// event 事件名称
const event = lazy ? 'change' : type === 'range' ? RANGE_TOKEN : 'input'
// value模板。默认情况下，作为
let valueExpression = '$event.target.value'
if (trim) {
  // trim事件
  valueExpression = `$event.target.value.trim()`
}
if (number) {
  // _n($event.target.value)
  valueExpression = `_n(${valueExpression})`
}
// 获取code
let code = genAssignmentCode(value, valueExpression)
// 如果是range，那么需要对range的composing进行判断。
if (needCompositionGuard) {
  code = `if($event.target.composing)return;${code}`
}
```

给出一个默认的实例，`genAssignmentCode`默认两个参数，`value` `assignment`

```
// @ Function
export function genAssignmentCode (
  value: string,
  assignment: string
): string {
  const res = parseModel(value)

  if (res.key === null) {
     // value = xxxx
    return `${value}=${assignment}`
  } else {
    // $set()方式
    return `$set(${res.exp}, ${res.key}, ${assignment})`
  }
}
```

在`genAssignmentCode`方法中，调用了一个`parseModel`方法。它的作用主要是做一个解析的过程，这里就不去做介绍了。和JSON.parse作用相同。转换前，转换后：

- 单独msg ![img](https://user-gold-cdn.xitu.io/2020/5/10/171fdea16b69c811?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)
- 对象中的msg ![img](https://user-gold-cdn.xitu.io/2020/5/10/171fdea1859d2de5?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

它的作用是用来获取当前绑定的数据模型。对属性和对象属性的做一个区分。因为我们都知道，对象属性更改有可能会丢失响应式，为了以防万一，所以才使用`$set()`的方式。一句话总结：

> 如果是属性，就返回`value = assignment`，如果是对象属性，就使用![img](https://juejin.im/equation?tex=set()方式)set('导出模型的exp', '导出模型的key', assignment)的方式。

导出后的code，除了`range`需要经历过`needCompositionGuard`的过滤。为code添加`$event.target.composing`，这个其实是对输入法`IME问题`的解决。防止非必要的软更新问题。

当`code`生成完毕后，那就开始对el进行改造，改造的过程分为两个方法`addProp`，`addHeader`。

#### addProp

`addProp` 方法主要是对`el`的`props`的属性添加。

```
function addProp (el, name, value, range, dynamic) {
    (el.props || (el.props = [])).push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range));
    el.plain = false;
  }
```

可以看到，它主要就是给props添加一些属性。看下图可以看到，el中props中数据更换为了传递进来的参数了。 ![img](https://user-gold-cdn.xitu.io/2020/5/10/171fdea18e1823bc?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

#### addHandler

`addHandler`主要是将上面生成的code模板，添加给元素的`event`事件。如下图，可以看出，el的`event`的下面的事件值做一个处理。这样在el中就会绑定一个事件。我们可以看成如下DOM：

```
// 转换前
<input type="text" v-model="msg">
复制代码// 转换后
<input type="text" :value="msg" @input="if(event.target.value">
```

![img](https://user-gold-cdn.xitu.io/2020/5/10/171fdea1912af4b6?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### **genSelect下拉选择框**

相对于input默认的流程，`select`的话就少了`addProp`,只有一个`addHandler`的方法。在一开始有一个`selectVal`保存默认的val。可以根据下面代码，看下转换前，转换后的代码

```
// 源码
var number = modifiers && modifiers.number
// 默认数据
var selectedVal =
  'Array.prototype.filter' +
  '.call($event.target.options,function(o){return o.selected})' +
  '.map(function(o){var val = "_value" in o ? o._value : o.value;' +
  'return ' +
  (number ? '_n(val)' : 'val') +
  '})'

// 生成后的代码
Array.prototype.filter
  .call($event.target.options, function (o) {
    return o.selected
  })
  .map(function (o) {
    var val = '_value' in o ? o._value : o.value
    return val
  })
```

其次是`assignment`的代码模板，根据`$event.target.multiple`来去判断究竟是`$$selectedVal` 还是 `$$selectedVal[0]`。

```
var assignment = '$event.target.multiple ? $selectedVal : $selectedVal[0]';
```

最后就是生成code，并且将code和el的methods绑定。

```
var code = "var $$selectedVal = " + selectedVal + ";";
code = code + " " + (genAssignmentCode(value, assignment));
addHandler(el, 'change', code, null, true);
```

这是最后生成绑定的code：

```
var $selectedVal = Array.prototype.filter
  .call($event.target.options, function (o) {
    return o.selected
  })
  .map(function (o) {
    var val = '_value' in o ? o._value : o.value
    return val
  })
msg = $event.target.multiple ? $selectedVal : $selectedVal[0]
```

贴上genSelect的代码

```
function genSelect (
  el: ASTElement,
  value: string,
  modifiers: ?ASTModifiers
) {
  // 获取number指令
  const number = modifiers && modifiers.number
  // selectVal函数模板
  const selectedVal = `Array.prototype.filter` +
    `.call($event.target.options,function(o){return o.selected})` +
    `.map(function(o){var val = "_value" in o ? o._value : o.value;` +
    `return ${number ? '_n(val)' : 'val'}})`

  // assignment获取值
  const assignment = '$event.target.multiple ? $selectedVal : $selectedVal[0]'
  // 生成code
  let code = `var $selectedVal = ${selectedVal};`
  code = `${code} ${genAssignmentCode(value, assignment)}`
  // 添加事件并将code模板加入进去
  addHandler(el, 'change', code, null, true)
}
```

### **genCheckboxModel多选框**

多选框的`v-model` 有了一个新的方法`getBindingAttr` ，主要是用来处理`v-bind`的数据。通过`getAndRemoveAttr`来对val进行处理，其中主要是对`v-bind` 和 `: + msg`两种方式的数据处理，如下图： ![img](https://user-gold-cdn.xitu.io/2020/5/10/171fdea1974202f3?imageView2/0/w/1280/h/960/format/webp/ignore-error/1) `getAndRemoveAttr` 只会从数组`attrsList`中删除attr，不会被`processAttrs`处理。随后将`el.attrsMap[name]`拿出来，

![img](https://user-gold-cdn.xitu.io/2020/5/10/171fdea19c249ace?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

```
function getBindingAttr(el, name, getStatic) {
  // 获取绑定的value(动态的)
  var dynamicValue =
    getAndRemoveAttr(el, ':' + name) || getAndRemoveAttr(el, 'v-bind:' + name)
  // 根据value进行处理
  if (dynamicValue != null) {
    return parseFilters(dynamicValue)
  } else if (getStatic !== false) {
    var staticValue = getAndRemoveAttr(el, name)
    if (staticValue != null) {
      console.log(JSON.stringify(staticValue))
      return JSON.stringify(staticValue)
    }
  }
}
```

随后就是添加`Prop` `Handle`的操作，这个参考上面的处理方式，做一些处理，处理后的`event`会有一个`change`事件，作为值修改的方法:

```
var $a = msg,
  $el = $event.target,
  $c = $el.checked ? true : false
if (Array.isArray($a)) {
  var $v = '1',
    $i = _i($a, $v)
  if ($el.checked) {
    $i < 0 && (msg = $a.concat([$v]))
  } else {
    $i > -1 && (msg = $a.slice(0, $i).concat($a.slice($i + 1)))
  }
} else {
  msg = $c
}
```

添加props和handle的源码，参考上面的分析。这里就不多做赘述，只要知道，往prop添加了什么？handle的方法是什么?内容是什么?

```
addProp(
  el,
  'checked',
  'Array.isArray(' +
    value +
    ')' +
    '?_i(' +
    value +
    ',' +
    valueBinding +
    ')>-1' +
    (trueValueBinding === 'true'
      ? ':(' + value + ')'
      : ':_q(' + value + ',' + trueValueBinding + ')')
)
addHandler(
  el,
  'change',
  'var $a=' +
    value +
    ',' +
    '$el=$event.target,' +
    '$c=$el.checked?(' +
    trueValueBinding +
    '):(' +
    falseValueBinding +
    ');' +
    'if(Array.isArray($a)){' +
    'var $v=' +
    (number ? '_n(' + valueBinding + ')' : valueBinding) +
    ',' +
    '$i=_i($a,$v);' +
    'if($el.checked){$i<0&&(' +
    genAssignmentCode(value, '$a.concat([$v])') +
    ')}' +
    'else{$i>-1&&(' +
    genAssignmentCode(value, '$a.slice(0,$i).concat($a.slice($i+1))') +
    ')}' +
    '}else{' +
    genAssignmentCode(value, '$c') +
    '}',
  null,
  true
)
```

### **genRadioModel单选框**

对于`radio`,就是获取`bangding`的`value`。随后做修饰符的处理。然后按照套路一般添加`Prop`和`事件handle`。

```
function genRadioModel(el, value, modifiers) {
  // 获取修饰符
  var number = modifiers && modifiers.number
  // 绑定的value值
  var valueBinding = getBindingAttr(el, 'value') || 'null'
  // number修饰符和非number修饰符下的区别.生成value处理方式
  valueBinding = number ? '_n(' + valueBinding + ')' : valueBinding
  // 添加prop
  addProp(el, 'checked', '_q(' + value + ',' + valueBinding + ')')
  // 添加事件
  addHandler(el, 'change', genAssignmentCode(value, valueBinding), null, true)
}
```

### **genComponentModel组件**

首先，需要知道如何实现组件的`v-model`，这里给一个基本的demo。 ![img](https://user-gold-cdn.xitu.io/2020/5/10/171fdea19f6814fc?imageView2/0/w/1280/h/960/format/webp/ignore-error/1) 点击后： ![img](https://user-gold-cdn.xitu.io/2020/5/10/171fdea1bf26d162?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

```
<div id="app">
  <my-component v-model="title"></my-component>
</div>
<script src="./dist/vue.js"></script>
<script>
  Vue.component('my-component', {
    template: `<div>
                  {{value}}
                  <button @click="handleInput">提交input</button>
              </div>`,
    props: ['value'],
    methods: {
      handleInput() {
        this.$emit('input', '我触发了input emit'); //触发 input 事件，并传入新值
      }
    }
  });
  new Vue({
    el: '#app',
    data: {
      title: '我是默认'
    }
  })
</script>
```

可以看到，当在组件中定义`prop`存在`value`的时候，将修改的值通过`$emit`发布`input`事件发布。从而可以通过`v-model`来做一个双向绑定。那么我们探究下组件内的`v-model`做了一些什么吧。 ![img](https://user-gold-cdn.xitu.io/2020/5/10/171fdea1c4274e73?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

```
// 解构指令
const { number, trim } = modifiers || {}

// 基本value模板
const baseValueExpression = '$v'
let valueExpression = baseValueExpression
// trim下的模板语法
if (trim) {
  valueExpression =
    `(typeof ${baseValueExpression} === 'string'` +
    `? ${baseValueExpression}.trim()` +
    `: ${baseValueExpression})`
}
// number下的模板,执行了_n的代理方法toNumber
if (number) {
  valueExpression = `_n(${valueExpression})`
}
// 获取code模板
const assignment = genAssignmentCode(value, valueExpression)
// 对el的model进行修改
el.model = {
  value: `(${value})`,
  expression: JSON.stringify(value),
  callback: `function (${baseValueExpression}) {${assignment}}`,
}
```

其大部分都是在渲染code模板，为下面`le`的`model`的做准备。组件和元素标签不一样，所以组件的模板就没有`addProps`, `addHandler`这两个步骤。取而代之的是是对`el.model`的修改。