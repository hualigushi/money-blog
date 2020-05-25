nodejs 的大多模块(如HTTP request、response 和 stream)都继承了 EventEmitter 模块，它们可以触发和监听事件。

## Events 模块核心实现

Events 模块的核心实现非常简单，让你可以创建一个 event pattern 的工具，是 nodejs 事件驱动的核心，但它本身跟 nodejs 的 Event Loop 没有任何关系。
```
class MyEventEmitter {
  constructor () {
    this.events = {} // 事件对象
  }

  listeners (type) {
    return this.events[type]
  }

  addListener (type, listener) {
    if (this.events[type])
      this.events[type] = [ ...this.events[type], listener ]
    else
      this.events[type] = [ listener ]
  }

  once (type, listener) {
    this.addListener(type, _onceWrap(this, type, listener))
    return this
  }

  removeListener (type, listener) {
    if (this.events[type].length > 0)
      this.events[type] = this.events[type].filter(item => item !== listener)
    return this
  }

  removeAllListener (type) {
    delete this.events[type]
  }

  emit (type, ...args) {
    if (type === 'error' && !this.events[type].length) throw new Error('emit error event !~')
    this.events[type] && this.events[type].forEach(listener => Reflect.apply(listener, this, args))
  }

  get on() {
    return this.addListener
  }

  get off() {
    return this.removeListener
  }

}

function _onceWrap(target, type, listener) {
  const wrapped = (...args)
    => target.removeListener(type, wrapped) && Reflect.apply(listener, target, args)
  return wrapped
}
```

## Events 是同步的

Events 仅仅只是简单的执行了事件的回调函数，它是同步执行的。
每一次的 emit，都是同步的执行了所绑定事件 queue 里的回调 。而 EventEmitter 本身与 nodejs 的 Event Loop 没有关系，也不存在异步执行的代码，是否异步只跟传入的回调函数有关。

## EventEmitter 需要注意的地方
下面代码会造成 Maximum call stack size exceeded 报错, 因为所有的回调都是同步的，会在一个 poll phase 阶段不停执行下去，一直到系统崩溃.
```
const EventEmitter = require("events")
const EE = new EventEmitter()
EE.on('event1', function () {
  console.log('event1 fired!');
  EE.emit('event2');
})
EE.on('event2', function () {
  console.log('event2 fired!');
  EE.emit('event3');
})
EE.on('event3', function () {
  console.log('event3 fired!');
  EE.emit('event1');
})
EE.emit('event1');
```
换成 setImmediate() 来调用 emit ，会发现这段程序不会崩溃，setImmediate 把回调放入了每次轮询的下个阶段才进行，一个真正的通过 events 模块创建的异步代码.
```
const EventEmitter = require("events")
const EE = new EventEmitter()
EE.on('event1', function () {
  console.log('event1 fired!');
  setImmediate(() => {
    EE.emit('event2');
  })
})
EE.on('event2', function () {
  console.log('event2 fired!');
  setImmediate(() => {
    EE.emit('event3');
  })
})
EE.on('event3', function () {
  console.log('event3 fired!');
  setImmediate(() => {
    EE.emit('event1');
  })
})
EE.emit('event1');
```

## EventEmitter 中使用 process.nextTick()

如果把上面的代码 setImmediate() 换成 process.nextTick() 讲会报错，因为 process.nextTick() 是在当前阶段结束时且在下个阶段前执行，而在 process.nextTick() 里触发回调会导致程序一直认为当前阶段还有任务需要执行而出错的，这个阶段将会有无法清除的 nextTick 需要执行。





```
      // 手写发布订阅模式 EventEmitter
      class EventEmitter {
        constructor() {
          this.events = {};
        }
        // 实现订阅
        on(type, callBack) {
          if (!this.events) this.events = Object.create(null);

          if (!this.events[type]) {
            this.events[type] = [callBack];
          } else {
            this.events[type].push(callBack);
          }
        }
        // 删除订阅
        off(type, callBack) {
          if (!this.events[type]) return;
          this.events[type] = this.events[type].filter(item => {
            return item !== callBack;
          });
        }
        // 只执行一次订阅事件
        once(type, callBack) {
          function fn() {
            callBack();
            this.off(type, fn);
          }
          this.on(type, fn);
        }
        // 触发事件
        emit(type, ...rest) {
          this.events[type] &&
            this.events[type].forEach(fn => fn.apply(this, rest));
        }
      }
// 使用如下
      const event = new EventEmitter();

      const handle = (...rest) => {
        console.log(rest);
      };

      event.on("click", handle);

      event.emit("click", 1, 2, 3, 4);

      event.off("click", handle);

      event.emit("click", 1, 2);

      event.once("dbClick", () => {
        console.log(123456);
      });
      event.emit("dbClick");
      event.emit("dbClick");

```

