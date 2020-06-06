# 1 koa洋葱模型怎么实现的
```
// 这样就可能更好理解了。
// simpleKoaCompose
const [fn1, fn2, fn3] = this.middleware;
const fnMiddleware = function(context){    
  return Promise.resolve(      
    fn1(context, function next(){        
      return Promise.resolve(          
        fn2(context, function next(){              
          return Promise.resolve(                  
            fn3(context, function next(){                    
              return Promise.resolve();                  
              })              
            )          
          })        
        )    
      })  
    );
  };
fnMiddleware(ctx).then(handleResponse).catch(onerror);
```
答：`app.use()` 把中间件函数存储在`middleware`数组中，最终会调用`koa-compose`导出的函数compose返回一个promise，

中间函数的第一个参数ctx是包含响应和请求的一个对象，会不断传递给下一个中间件。next是一个函数，返回的是一个promise。



# 2 如果中间件中的next()方法报错了怎么办

```
ctx.onerror = function {  
  this.app.emit('error', err, this);
};  
listen(){    
  const  fnMiddleware = compose(this.middleware);  
  
  if (!this.listenerCount('error')) 
  
  this.on('error', this.onerror);    
  const onerror = err => ctx.onerror(err);    
  fnMiddleware(ctx).then(handleResponse).catch(onerror);  
  }  
  onerror(err) {    // 代码省略    // ...  }
```
答：中间件链错误会由`ctx.onerror`捕获，该函数中会调用`this.app.emit('error', err, this)`（因为koa继承自events模块，所以有emit和on等方法），

可以使用`app.on('error', (err) => {})`，或者`app.onerror = (err) => {}`进行捕获。



# 3 Compose

```
function compose (middleware) {
  // 传入的必须是数组
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  // 数组里面必须是函数
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  return function (context, next) {
    // 这个 index 是标识上一次执行的中间件是第几个
    let index = -1
    
    // 执行第一个中间件
    return dispatch(0)
    function dispatch (i) {
      // 检查中间件是否已经执行过，
      // 举个例子，当执行第一个中间件时 dispatch(0)，
      // i = 0, index = -1, 说明没有执行过，
      // 然后 index = i, 而 index 通过闭包保存，
      // 如果执行了多次，就会报错
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      
      // 通过传入的索引从数组中获取中间件
      let fn = middleware[i]
      
      // 如果当前索引等于中间件数组的长度，
      // 说明已经中间件执行完毕，
      // fn 为 fnMiddleware(ctx) 时没有传入的第二个参数，
      // 即 fn = undefined
      if (i === middleware.length) fn = next
      // fn 为 undefined, 返回一个已经 reolved 的 promise
      if (!fn) return Promise.resolve()
      
      try {
        // 执行中间件函数并将 dispatch 作为 next 函数传入
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

可以看到，compose的执行流程是将中间件数组传入,  返回一个类型为(ctx, next) =>{}的函数fn(context, dispatch.bind(null, i + 1))，最后折回通过`if (!fn) return Promise.resolve()`一级级递归，从callback()方法中可以看到，每当有请求时：

- 首先会执行第一个中间件,并把下个中间件作为next参数传入, 执行到next()时，将控制权交给下一个中间件；直到后续中间件执行结束, 交还控制权,才能继续执行next()后面的操作；
- 在dispatch(i+1) 中，传递 `i+1`这个参数就相当于执行了下一个中间件，从而形成递归调用;
- 每个中间件都有属于自己的一个闭包作用域，同一个中间件的 i 是不变的，而 index 是在闭包作用域外面的;
- 执行到最后一个中间件, fn = next，因为next()为undefined,所以终止执行, 然后沿路折返,将控制权交换给前一个中间件，；

这样，内部通过dispatch函数就形成了一条处理请求的流水线。

当所有的中间件执行结束后，说明请求已经处理好了，然后把处理好的上下文ctx传入respond，根据其定义response的状态码和body类型返回给客户端对应的数据。



```
var index = -1;
function compose() {
    return dispatch(0)
}
function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      var fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve('fn is undefined')
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
 }
 
 function f1(context,next){
    console.log('middleware 1');
    next().then(data=>console.log(data));
    console.log('middleware 1');
    return 'middleware 1 return';
  }
  function f2(context,next){
    console.log('middleware 2');
    next().then(data=>console.log(data));
    console.log('middleware 2');
    return 'middleware 2 return';
  }
  function f3(context,next){
    console.log('middleware 3');
    next().then(data=>console.log(data));
    console.log('middleware 3');
    return 'middleware 3 return';
  }
var middleware=[
  f1,f2,f3
]

var context={};
var next=function(context,next){
    console.log('middleware 4');
    next().then(data=>console.log(data));
    console.log('middleware 4');
    return 'middleware 4 return';
};
compose().then(data=>console.log(data));
```

