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
