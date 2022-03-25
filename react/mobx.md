```
const { observable, action, computed, autorun } = mobx;

class Store {
  @observable list = []
  @computed get total() {
    return this.list.length;
  }
  @action change () {
    this.list.push(this.list.length);
  }
};

const mstore = new Store();

setInterval(() => {
  mstore.change();
}, 2000);

autorun(() => {
  console.log(mstore.total);
});
```
# 可观察状态（State）

@observable 接受任何类型的 js 值（原始类型、引用、纯对象、类实例、数组和、maps），observable 的属性值在其变化的时候 mobx 会自动追踪并作出响应。

当 value 是一个对象类型值的时候，它会默认克隆该对象并且把其中每个属性变为可观察的值，这里默认是深拷贝，也就是说其对象的后代属性都会变成可观察的，比如 @observable classProperty = { obj: { name: 'q' } } ，当 classProperty.obj.name 改变的时候，在 MobX 中也是可以观察到并响应的；

当然在这里可以加一些调节器来做一些配置：

 - @observable.deep （默认）对对象进行深拷贝；
 - @observable.shallow 它只对对象进行浅拷贝；
 - @observable.ref 禁用对象的自动转化，只转化其引用；
 
 当定义好其 observable 的对象值后，对象中后来添加的值是不会变为可观察的，这时需要使用 extendObservable 来扩展对象：
 ```
 const { observable, action, computed, autorun, extendObservable } = mobx;

class Store {
  @observable oo = {
    name: 1
  }
};

const mstore = new Store();

extendObservable(mstore, {
  oo: {
    age: 0
  }
});

var i = 1;
setInterval(() => {
  mstore.oo.age = i++;
}, 2000);

autorun(() => {
  console.log(mstore.oo.age);
});
```

# 动作（Action）
在 MobX 中，对于 store 对象中可观察的属性值，在他们改变的时候则会触发观察监听的函数，这里注意两点：

 - 该属性必须是定义的可观察属性（@observable）
 - 它的值必须发生改变（和原值是不等的）
 
 ```
 class Store {
  @observable list = []
  @observable name = '2'
  @observable oo = {
    age: 1
  }
};

const mstore = new Store();

// 触发观察监听的函数
mstore.list.push('1');

// 或者
mstore.name = 'h';

// 或者
mstore.oo.age = 12;

// 这个情况下是不会触发观察，因为 age 属性并不可观察
mstore.age = 10;

// 这个情况下也不会触发观察，因为其值没有发生变化
mstore.oo.age = 1;
```

# useStrict

在 mobx 中，可以有很多种方式去修改 state，mobx 并不对其做限制；
但是如果使用了严格模式：
```
import { useStrict } from 'mobx';

useStrict(true);
```
那么将会限制开发者只能通过 @action 来修改 state，这将会更有利于组织代码以及使数据流更清晰。

# runInAction
```
import {observable, action, useStrict, runInAction} from 'mobx';
useStrict(true);

class Store {
  @observable name = '';
  @action load = async () => {
    const data = await getData();
    runInAction(() => {
      this.name = data.name;
    });
  }
}
```
runInAction有点类似action(fn)()的语法糖，调用后，这个action方法会立刻执行

严格模式下，只能在action中修改数据，但是action只能影响到函数当前状态下的情景，也就是说在await之后发生的事情，这个action就修饰不到了，于是我们必须要使用了runInAction

# Observable Objects

如果使用observable来修饰一个Javascript的简单对象，那么其中的所有属性都将变为可观察的，如果其中某个属性是对象或者数组，那么这个属性也将被observable进行观察，说白了就是递归调用。
Tips: 简单对象是指不由构造函数创建，而是使用Object作为其原型，或是干脆没有原型的对象。
需要注意，只有对象上已经存在的属性，才能被observable所观测到。
若是当时不存在，后续添加的属性值，则需要使用extendObservable来进行添加。

```
let observableObject = observable({value: 3222});

extendObservable(observableObject, {
  newValue: 2333
});
```

如果是由构造函数创建的对象，那么必须要再它的构造函数中使用observable或extendObservable来观测对象。

```
function MyObject(name) {
  extendObservable(this, {
    name,
  });
}

var obj = new MyObject("aaa");
```

# Observable Arrays

考虑到ES5中原生数组对象中存在一定的限制，所以Mobx将会创建一个类数组对象来代替原始数组。

在实际使用中，这些类数组的表现和真正的原生数组极其类似，并且它支持原生数组的所有API，包括数组索引、长度获取等。

但是注意一点，sort和reverse方法返回的是一个新的Observable Arrays，对原本的类数组不会产生影响，这一点和原生数组不一样。

请记住，这个类数组不管和真实的数组有多么相似，它都不是一个真正的原生数组，所以毫无疑问Array.isArray(observable([]))的返回值都是false。

当你需要将这个Observable Arrays转换成真正的数组时，可以使用slice方法创建一个浅拷贝。换句话来说，Array.isArray(observable([]).slice())会返回true。

