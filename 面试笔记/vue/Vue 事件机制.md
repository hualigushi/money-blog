> Vue 事件机制 本质上就是 一个 发布-订阅 模式的实现。

```js
class Vue {
  constructor() {
    //  事件通道调度中心
    this._events = Object.create(null);
  }
  $on(event, fn) {
    if (Array.isArray(event)) {
      event.map(item => {
        this.$on(item, fn);
      });
    } else {
      (this._events[event] || (this._events[event] = [])).push(fn);
    }
    return this;
  }
  $once(event, fn) {
    function on() {
      this.$off(event, on);
      fn.apply(this, arguments);
    }
    on.fn = fn;
    this.$on(event, on);
    return this;
  }
  $off(event, fn) {
    if (!arguments.length) {
      this._events = Object.create(null);
      return this;
    }
    if (Array.isArray(event)) {
      event.map(item => {
        this.$off(item, fn);
      });
      return this;
    }
    const cbs = this._events[event];
    if (!cbs) {
      return this;
    }
    if (!fn) {
      this._events[event] = null;
      return this;
    }
    let cb;
    let i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break;
      }
    }
    return this;
  }
  $emit(event) {
    let cbs = this._events[event];
    if (cbs) {
      const args = [].slice.call(arguments, 1);
      cbs.map(item => {
        args ? item.apply(this, args) : item.call(this);
      });
    }
    return this;
  }
}
```
