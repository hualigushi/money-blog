在promise 中处理错误,我们通常也是去try catch,但是 只能catch 到同步的错误,如果是异步的,其实是catch不到的.

----------------------------------------------------------------------------------------------------------------

promise.catch()可以捕获promise所有状态的异常。包括：
1. 执行resolve()和reject()对应的promise.then(()=>{},()=>{}) 中的俩回调函数中的异常
2. Promise.resolve(err)触发的
3. Promise.reject(err)触发的

```
// 定义Promise
const initPromise =  (status) => {
	return new Promise((resolve, reject) => {
		// status 成功 200，失败 其它
		if (status === 200) {
			resolve(); // 由"pending"变为"fulfilled"
		} else {
			reject(); // 由"pending"变为"rejected"
		}
	});
};

// 实例化并调用promise
let testPromise = (status) => {
	const promise = initPromise(status);
	try {
		promise.then(() => {
			// resolve走这个回调
			throw new Error('error from then resolve');
		}, () => {
			// rejected走这个回调
			throw new Error('error from then reject');
		}).catch(e => {
			console.log('promise catch捕获：' + e);
		});
	} catch(e) {
		console.log('try catch捕获：' + e);
	}
}

testPromise(200) // promise catch捕获：Error: error from then resolve
testPromise(100) // promise catch捕获：Error: error from then reject
```
try…catch的抛错只有在try语句里有直接错误时才会抛出。

-------------------------------------------------------------------------------------------------------

Promise可以逐一捕获异常
```
const fetchData = (url, shouldReject = false) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      shouldReject ? reject('error') : resolve('this is data');
    }, 1000);
  });
};

fetchData('url1')
  .catch(error => console.log('error1：', error))
  .then(data => {
    console.log('data1：', data);
    return fetchData('url2', true);
  })
  .catch(error => console.log('error2：', error))
  .then(data => {
    console.log('data2：', data);
    return fetchData('url3');
  })
  .catch(error => console.log('error3：', error))
  .then(data => {
    console.log('data3：', data);
  });
// output
// data1：this is data
// error2：error
// data2：undefined
// data3：this is data
```

--------------------------------------------------------------------------------------------

封装异步异常处理方法
方法一
```
封装一个全局通用的异步Promise的try-catch方法捕捉区块链异步异常错误
    static tryCatchGlobalPromise (asyncFunc, errMsg = "区块链异步异常捕捉") {
        return new Promise((resolve, reject) => {
            // asyncFunc只能是异步方法,且必须返回一个Promise,否则会报错【Promise才有then方法】
            return asyncFunc().then((res) => {
                resolve(res);
            }).catch((error) => {
                console.log(`${errMsg}_error:${error}：`);
                resolve(null);
            });
        });
    }
```

方法二
```
/**
 * @param {string} method request method; ('get', 'post')
 * @param {string} api request url
 * @param {object} params payload
 * @memberof BaseActions
 */
request = async (method, api, params = {}) => {
  const requestFunc = async () => {
    let r = null
    try {
      r = await this[method](api, params)
    } catch (e) {
      message.error(e.message)
    }
    return r
  }
 
  return await requestFunc()
}

async getDirChain(params) {
  let r = await this.request('get', apis.API_DEPLOY_DIR_CHAIN, params)
  r && runInAction(() => this.store.dirChain = r)
}
```
