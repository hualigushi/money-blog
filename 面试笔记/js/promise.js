// class MyPromise {
//     // 构造方法接收一个回调
//     constructor(executor) {
//       this._resolveQueue = []    // then收集的执行成功的回调队列
//       this._rejectQueue = []     // then收集的执行失败的回调队列

//       // 由于resolve/reject是在executor内部被调用, 因此需要使用箭头函数固定this指向, 否则找不到this._resolveQueue
//       let _resolve = (val) => {
//         // 从成功队列里取出回调依次执行
//         while(this._resolveQueue.length) {
//           const callback = this._resolveQueue.shift()
//           callback(val)
//         }
//       }
//       // 实现同resolve
//       let _reject = (val) => {
//         while(this._rejectQueue.length) {
//           const callback = this._rejectQueue.shift()
//           callback(val)
//         }
//       }
//       // new Promise()时立即执行executor,并传入resolve和reject
//       executor(_resolve, _reject)
//     }

//     // then方法,接收一个成功的回调和一个失败的回调，并push进对应队列
//     then(resolveFn, rejectFn) {
//       this._resolveQueue.push(resolveFn)
//       this._rejectQueue.push(rejectFn)
//     }
//   }

//   const p1 = new MyPromise((resolve, reject) => {
//     setTimeout(() => {
//       resolve('result')
//     }, 1000);
//   })
//   p1.then(res => console.log(res))
//   //一秒后输出result
//   初始版本，理解函数名当参数传递！！！！



//Promise/A+规范的三种状态
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
    constructor(executor) {
        this._status = PENDING     // Promise状态
        this._value = undefined    // 储存then回调return的值
        this._resolveQueue = [] // then收集的执行成功的回调队列
        this._rejectQueue = [] // then收集的执行失败的回调队列

        // 由于resolve/reject是在executor内部被调用, 因此需要使用箭头函数固定this指向, 否则找不到this._resolveQueue
        let _reslove = (val) => {
            const run = () => {
                if (this._status !== PENDING) return // 对应规范中的"状态只能由pending到fulfilled或rejected"
                this._status = FULFILLED // 变更状态
    
                // 这里之所以使用一个队列来储存回调,是为了实现规范要求的 "then 方法可以被同一个 promise 调用多次"
                // 如果使用一个变量而非队列来储存回调,那么即使多次p1.then()也只会执行一次回调
                while (this._resolveQueue.length) {
                    const callback = this._resolveQueue.shift()
                    callback(val)
                }
            }
            setTimeout(run)
        }

        let _reject = (val) => {
            const run = () => {
                if(this._status !== PENDING) return   // 对应规范中的"状态只能由pending到fulfilled或rejected"
                this._status = REJECTED               // 变更状态
                this._value = val                     // 储存当前value
                while(this._rejectQueue.length) {
                  const callback = this._rejectQueue.shift()
                  callback(val)
                }
              }
              setTimeout(run)
        }

        // new Promise()时立即执行executor,并传入resolve和reject
        executor(_reslove, _reject)
    }

    // then方法,接收一个成功的回调和一个失败的回调，并push进对应队列
    then(resolveFn, rejectFn) {
        // 根据规范，如果then的参数不是function，则我们需要忽略它, 让链式调用继续往下执行
        typeof resolveFn !== 'function' ? resolveFn = value => value : null
        typeof rejectFn !== 'function' ? rejectFn = reason => {
            throw new Error(reason instanceof Error ? reason.message : reason)
        } : null

        //return一个新的promise
        return new MyPromise((resolve, reject) => {
            //把resolveFn重新包装一下,再push进resolve执行队列,这是为了能够获取回调的返回值进行分类讨论
            const fulfilledFn = value => {
                try {
                    //执行第一个(当前的)Promise的成功回调,并获取返回值
                    let x = resolveFn(value)
                    //分类讨论返回值,如果是Promise,那么等待Promise状态变更,否则直接resolve
                    x instanceof MyPromise ? x.then(reslove, reject) : resolve(x)
                } catch (error) {
                    reject(error)
                }
            }



            //reject同理
            const rejectedFn = error => {
                try {
                    let x = rejectFn(error)
                    x instanceof MyPromise ? x.then(resolve, reject) : resolve(x)
                } catch (error) {
                    reject(error)
                }
            }

            switch (this._status) {
                // 当状态为pending时,把then回调push进resolve/reject执行队列,等待执行
                case PENDING:
                    //把后续then收集的依赖都push进当前Promise的成功回调队列中(_rejectQueue), 这是为了保证顺序调用
                    this._resolveQueue.push(resolveFn)
                    this._rejectQueue.push(rejectFn)
                    break
                    // 当状态已经变为resolve/reject时,直接执行then回调
                case FULFILLED:
                    fulfilledFn(this._value)
                    break;
                case REJECTED:
                    rejectedFn(this._value)
                    break;
            }

        })
    }

    catch(rejectFn) {
        return this.then(undefined, rejectFn)
    }
}

class ListNode {
    constructor(key) {
        this.prev = null
        this.next = null
        this.key = key
    }
}

