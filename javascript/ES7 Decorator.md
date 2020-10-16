# 何为decorator？
我们可以用修饰器来修改类的属性和方法，比如我们可以在函数执行之前改变它的行为。

因为`decorator`是在编译时执行的，使得让我们能够在设计时对类、属性等进行标注和修改成为了可能。

`decorator`不仅仅可以在类上面使用，还可以在对象上面使用，但是decorator不能修饰函数，因为函数存在变量提升。

`decorator`相当于给对象内的函数包装一层行为。

`decorator`本身就是一个函数，他有三个参数`target`（所要修饰的目标类）, `name`（所要修饰的属性名）, `descriptor`（该属性的描述对象）。

## readonly例子
```js
/**
 * @param target 目标类Dog
 * @param name 所要修饰的属性名 bark
 * @param descriptor 该属性的描述对象 bark方法
 */
function readonly(target, name, descriptor) {
  // descriptor对象原来的值如下
  // {
  //   value: specifiedFunction,
  //   enumerable: false,
  //   configurable: true,
  //   writable: true
  // };
  descriptor.writable = false;
  return descriptor
}
```
```js
import { readOnly } from "./decorators";

class Dog {
  @readonly
  bark () {
    return '汪汪汪！！'
  }
}

let dog = new Dog()
dog.bark = 'wangwang！！';
// Cannot assign to read only property 'bark' of [object Object]
// 这里readonly修饰器把Dog类的bark方法修改为只读状态
```

# 实用的`decorator`方法

## 1. `noConcurrent` 避免并发调用，在上一次操作结果返回之前，不响应重复操作
```js
import {noConcurrent} from './decorators';
methods: {
  @noConcurrent     //避免并发，点击提交后，在接口返回之前无视后续点击
  async onSubmit(){
    let submitRes = await this.$http({...});
    //...
    return;
  }
}
```

## 2. `makeMutex` 多函数互斥，具有相同互斥标识的函数不会并发执行
```js
import {makeMutex} from './decorators';
let globalStore = {};
class Navigator {
  @makeMutex({namespace:globalStore, mutexId:'navigate'}) //避免跳转相关函数并发执行
  static async navigateTo(route){...}

  @makeMutex({namespace:globalStore, mutexId:'navigate'}) //避免跳转相关函数并发执行
  static async redirectTo(route){...}
}
```

## 3. `withErrToast` 捕获async函数中的异常，并进行错误提示
```js
methods: {
  @withErrToast({defaultMsg: '网络错误', duration: 2000})
  async pullData(){
    let submitRes = await this.$http({...});
    //...
    return '其他原因'; // toast提示 其他原因
    // return 'ok';   // 正常无提示
  }
}
```

## 4. `mixinList` 用于分页加载，上拉加载时返回拼接数据及是否还有数据提示
```js
methods: {
  @mixinList({needToast: false})
  async loadGoods(params = {}){
    let goodsRes = await this.$http(params);
    return goodsRes.respData.infos;
  },
  async hasMore() {
    let result = await this.loadgoods(params);
    if(result.state === 'nomore') this.tipText = '没有更多了';
    this.goods = result.list;
  }
}
// 上拉加载调用hasMore函数，goods数组就会得到所有拼接数据
// loadGoods可传三个参数 params函数需要参数 ,startNum开始的页码,clearlist清空数组
// mixinList可传一个参数 needToast 没有数据是否需要toast提示
```

## 5. `typeCheck` 检测函数参数类型
```js
methods: {
  @typeCheck('number')
  btnClick(index){ ... },
}
// btnClick函数的参数index不为number类型 则报错
```

## 6. `Buried` 埋点处理方案，统计页面展现量和所有methods方法点击量，如果某方法不想设置埋点 可以 `return 'noBuried' `

```js
@Buried
methods: { 
  btn1Click() {
    // 埋点为 btn1Click
  },
  btn2Click() {
    return 'noBuried'; // 无埋点
  },
},
created() {
  // 埋点为 view
}
// 统计页面展现量和所有methods方法点击量
/**
 * 避免并发调用，在上一次操作结果返回之前，不响应重复操作
 * 如：用户连续多次点击同一个提交按钮，希望只响应一次，而不是同时提交多份表单
 * 说明：
 *    同步函数由于js的单线程特性没有并发问题，无需使用此decorator
 *    异步时序，为便于区分操作结束时机，此decorator只支持修饰async函数
 */
export const noConcurrent = _noConcurrentTplt.bind(null,{mutexStore:'_noConCurrentLocks'});

/**
 * 避免并发调用修饰器模板
 * @param {Object} namespace 互斥函数间共享的一个全局变量，用于存储并发信息，多函数互斥时需提供；单函数自身免并发无需提供，以本地私有变量实现
 * @param {string} mutexStore 在namespace中占据一个变量名用于状态存储
 * @param {string} mutexId   互斥标识，具有相同标识的函数不会并发执行，缺省值：函数名
 * @param target
 * @param funcName
 * @param descriptor
 * @private
 */
function _noConcurrentTplt({namespace={}, mutexStore='_noConCurrentLocks', mutexId}, target, funcName, descriptor) {
  namespace[mutexStore] = namespace[mutexStore] || {};
  mutexId = mutexId || funcName;

  let oriFunc = descriptor.value;
  descriptor.value = function () {
    if (namespace[mutexStore][mutexId]) //上一次操作尚未结束，则无视本次调用
      return;

    namespace[mutexStore][mutexId] = true; //操作开始
    let res = oriFunc.apply(this, arguments);

    if (res instanceof Promise)
      res.then(()=> {
        namespace[mutexStore][mutexId] = false;
      }).catch((e)=> {
        namespace[mutexStore][mutexId] = false;
        console.error(funcName, e);
      }); //操作结束
    else {
      console.error('noConcurrent decorator shall be used with async function, yet got sync usage:', funcName);
      namespace[mutexStore][mutexId] = false;
    }

    return res;
  }
}

/**
 * 多函数互斥，具有相同互斥标识的函数不会并发执行
 * @param namespace 互斥函数间共享的一个全局变量，用于存储并发信息
 * @param mutexId   互斥标识，具有相同标识的函数不会并发执行
 * @return {*}
 */
export function makeMutex({namespace, mutexId}) {
  if (typeof namespace !== "object") {
    console.error('[makeNoConcurrent] bad parameters, namespace shall be a global object shared by all mutex funcs, got:', namespace);
    return function () {}
  }

  return _noConcurrentTplt.bind(null, {namespace, mutexStore:'_noConCurrentLocksNS', mutexId})
}

/**
 * 捕获async函数中的异常，并进行错误提示
 * 函数正常结束时应 return 'ok'，return其它文案时将toast指定文案，无返回值或产生异常时将toast默认文案
 * @param {string} defaultMsg  默认文案
 * @param {number, optional} duration 可选，toast持续时长
 */
export function withErrToast({defaultMsg, duration=2000}) {
  return function (target, funcName, descriptor) {
    let oriFunc = descriptor.value;
    descriptor.value = async function () {
      let errMsg = '';
      let res = '';
      try {
        res = await oriFunc.apply(this, arguments);
        if (res != 'ok')
          errMsg = typeof res === 'string' ? res : defaultMsg;
      } catch (e) {
        errMsg = defaultMsg;
        console.error('caught err with func:',funcName, e);
      }

      if (errMsg) {
        this.$toast({
          title: errMsg,
          type: 'fail',
          duration: duration,
        });
      }
      return res;
    }
  }
}

/**
 * 分页加载
 * @param {[Boolean]} [是否加载为空显示toast]
 * @return {[Function]} [decrotor]
 */
export function mixinList ({needToast = false}) {
  let oldList = [],
      pageNum = 1,
  /**
  * state [string]
  *   hasmore  [还有更多]
  *   nomore   [没有更多了]
  */
  state = 'hasmore',
  current = [];
  return function (target,name,descriptor) {
    const oldFunc  = descriptor.value,
          symbol   = Symbol('freeze');
    target[symbol] = false;
    /**
     * [description]
     * @param  {[Object]}   params={}       [请求参数]
     * @param  {[Number]}   startNum=null   [手动重置加载页数]
     * @param  {[Boolean]}  clearlist=false [是否清空数组]
     * @return {[Object]}   [{所有加载页数组集合,加载完成状态}]
     */
    descriptor.value = async function(params={},startNum=null,clearlist=false) {
      try {
        if (target[symbol]) return;
        // 函数执行前赋值操作
        target[symbol] = true;
        params.data.pageNum = pageNum;
        if (startNum !== null && typeof startNum === 'number') {
          params.data.pageNum = startNum;
          pageNum = startNum;
        }
        if (clearlist) oldList = [];
        // 释放函数，取回list
        let before = current;
        current = await oldFunc.call(this,params);
        // 函数执行结束赋值操作
        (state === 'hasmore' || clearlist) && oldList.push(...current);
        if ((current.length === 0) || (params.data.pageSize > current.length)) {
          needToast && this.$toast({title: '没有更多了',type: 'fail'});
          state = 'nomore';
        } else {
          state = 'hasmore';
          pageNum++;
        }
        target[symbol] = false;
        this.$apply();
        return { list : oldList,state };
      } catch(e) {
        console.error('fail code at: ' + e)
      }
    }
  }
}

/**
 * 检测工具
 */ 
const _toString = Object.prototype.toString;
// 检测是否为纯粹的对象
const _isPlainObject = function  (obj) {
  return _toString.call(obj) === '[object Object]'
}
// 检测是否为正则
const _isRegExp = function  (v) {
  return _toString.call(v) === '[object RegExp]'
}
/**
 * @description 检测函数
 *  用于检测类型action
 * @param {Array} checked 被检测数组
 * @param {Array} checker 检测数组
 * @return {Boolean} 是否通过检测
 */ 
const _check = function (checked,checker) {
  check:
  for(let i = 0; i < checked.length; i++) {
    if(/(any)/ig.test(checker[i]))
      continue check;
    if(_isPlainObject(checked[i]) && /(object)/ig.test(checker[i]))
      continue check;
    if(_isRegExp(checked[i]) && /(regexp)/ig.test(checker[i]))
      continue check;
    if(Array.isArray(checked[i]) && /(array)/ig.test(checker[i]))
      continue check;
    let type = typeof checked[i];
    let checkReg = new RegExp(type,'ig')
    if(!checkReg.test(checker[i])) {
      console.error(checked[i] + 'is not a ' + checker[i]);
      return false;
    }
  }
  return true;
}
/**
 * @description 检测类型
 *   1.用于校检函数参数的类型，如果类型错误，会打印错误并不再执行该函数；
 *   2.类型检测忽略大小写，如string和String都可以识别为字符串类型；
 *   3.增加any类型，表示任何类型均可检测通过；
 *   4.可检测多个类型，如 "number array",两者均可检测通过。正则检测忽略连接符 ；
 */
export function typeCheck() {
  const checker =  Array.prototype.slice.apply(arguments);
  return function (target, funcName, descriptor) {
    let oriFunc = descriptor.value;
    descriptor.value =  function () {
      let checked =  Array.prototype.slice.apply(arguments);
      let result = undefined;
      if(_check(checked,checker) ){
        result = oriFunc.call(this,...arguments);
      }
      return result; 
    }
  }
};

const errorLog = (text) => {
  console.error(text);
  return true;
}
/**
 * @description 全埋点 
 *  1.在所有methods方法中埋点为函数名
 *  2.在钩子函数中'beforeCreate','created','beforeMount','mounted','beforeUpdate','activated','deactivated'依次寻找这些钩子
 *    如果存在就会增加埋点 VIEW
 * 
 * 用法： 
 *   @Buried
 *   在单文件导出对象一级子对象下;
 *   如果某方法不想设置埋点 可以 return 'noBuried' 即可
 */
export function Buried(target, funcName, descriptor) {
  let oriMethods = Object.assign({},target.methods),
      oriTarget = Object.assign({},target);
  // methods方法中
  if(target.methods) {
    for(let name in target.methods) {
      target.methods[name] = function () {
        let result = oriMethods[name].call(this,...arguments);
        // 如果方法中返回 noBuried 则不添加埋点
        if(typeof result === 'string' && result.includes('noBuried')) {
          console.log(name + '方法设置不添加埋点');
        } else if(result instanceof Promise) {
          result.then(res => {
            if(typeof res === 'string' && res.includes('noBuried')) { console.log(name + '方法设置不添加埋点'); return; };
            console.log('添加埋点在methods方法中：' , name.toUpperCase ());
            this.$log(name);
          });
        }else{
          console.log('添加埋点在methods方法中：' , name.toUpperCase ());
          this.$log(name);
        };
        return result;
      }
    }
  }
  // 钩子函数中
  const hookFun = (hookName) => {
    target[hookName] = function() {
      let result =  oriTarget[hookName].call(this,...arguments);
      console.log('添加埋点，在钩子函数' + hookName + '中：', 'VIEW');
      this.$log('VIEW');
      return result;
    }
  }

  const LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'activated',
    'deactivated',
  ];

  for(let item of LIFECYCLE_HOOKS) {
    if (target[item]) return hookFun(item);
  }
}
```
