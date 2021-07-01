思路
利用一个队列保存超出数量限制待执行的任务
利用Promise的finally方法取出队列中下一个任务执行

```
// Promise.prototype.finally = function(callback){
//     return this.then(
//         (value)=>Promise.resolve(callback()).then(()=>value),
//         (reason)=>Promise.resolve(callback()).then(()=>{throw reason;})
//     )
// }
class FetchLimit {
    constructor(maxLimit){
        this.maxLimit = maxLimit;
        this.queue = [];
        this.currFetchCount = 0;
    }

    request(promise,...args){
        return new Promise((resolve,reject)=>{
            let task = this.createTask(promise.bind(null,args),resolve,reject);
            if(this.currFetchCount>=this.maxLimit){
                console.log('超出并发限制')
                this.queue.push(task);
            }else{
                task();
            }
        })
    }

    createTask(promise,resolve,reject){
        return ()=>{
            promise()
            .then((v)=>resolve(v))
            .catch((e)=>reject(e))
            .finally(()=>{
                console.log('run next',this.currFetchCount)
                this.currFetchCount--;
                if(this.queue.length){
                    let task = this.queue.shift();
                    task();
                }
            })
            this.currFetchCount++;
        }
    }
    
}

 
function delay(time) {
  return new Promise((resolve)=>{
      setTimeout(()=>resolve(Date.now()),time);
  })
}
 
const requestInstance = new FetchLimit(5);
 
let promises = [];
function test(){
    for (let i = 0; i < 15; i++) {
        let time = Math.random()*2000;
        console.log('time',i, time)
        promises.push(requestInstance.request(delay,time).then(result => console.log('result',i, result), error => console.log(error)));
    }
}

test();
```

