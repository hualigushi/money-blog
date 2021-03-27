[TOC]

# 微前端对于沙箱的诉求

沙箱在微前端架构中不是必须要做的事情，因为如果规范做的足够好，是能够避免掉一些变量冲突读写，CSS 样式冲突的情况。但是如果你在一个足够大的体系中，仅仅通过规范来保证应用的可靠性面临较大的风险，还是需要技术手段去治理运行时的一些冲突问题，这个也是沙箱方案成为微前端技术体系的一部分原因。

传统的 js 沙箱主要用于执行一些不可信任的 js 脚本，其对沙箱的包装只需要一个可执行的 js 环境即可，一般会屏蔽对`location` `document`等重要全局对象的访问，同时一般为一次性执行，执行完第三方脚本后会释放沙箱环境。

微前端领域的沙箱对于提出了更高的诉求，需要可能访问几乎所有的全局对象，因为我们很难约束一个子应用在开发过程中使用的全局变量。需要同时支持多个沙箱环境存在，每个沙箱需要有加载、卸载、再次恢复的能力，其对应着微应用的运行生命周期。

在主流的微前端方案中，有一个关键点决定了沙箱如何做：同一时刻是单实例还是多实例存在宿主应用中。这决定了沙箱的复杂度和技术实现。

• **单实例**：同一个时刻只有一个微应用实例存在，此刻浏览器所有浏览器资源都是这个应用独占的，这种方案要解决的很大程度是应用切换的时候的变量污染清理与应用再次启动时的变量恢复。这种一般通过全局对象的代理来实现。

• **多实例**：资源不是应用独占，需要解决资源共享的问题，比如路由，样式，全局变量读写，DOM。这种情况下不同沙盒需要共享着一些全局变量，甚至涉及到不同微应用间的通信诉求。实现起来一般比较复杂，容易造成变量的全局冲突。

# 主流实现方案

一个 js 沙箱是一个独立的执行上下文或者叫作用域，我们把代码传入后，其执行不会影响到其他的沙盒环境。所以实现沙盒的第一步就是创建一个作用域。

这个作用域不会包含全局的属性对象。首先需要隔离掉浏览器的原生对象，但是如何隔离，建立一个沙箱环境呢？

Node 中 有 vm 模块，来实现类似的能力，在浏览器中我们可以利用了闭包的能力，利用变量作用域去模拟一个沙箱上下文环境，比如下面的代码:

```
function sandbox(global) {

 console.log(global.document);

}
foo({   document: '我是自定义属性'; });
```

上面这段代码执行 输出 我是自定义属性。而不是浏览器的`document`对象。

有了上下文环境后，我们需要实现应用运行时依赖的`window`上的全局对象，比如 location、history、document、`XMLHttpRequest`等微应用运行时需要用到的全局对象。

这些全局对象的模拟实现起来成本非常高，然而通过` new iframe`对象，把里面的原生浏览器对象通过`contentWindow`取出来，这个`iframe`的`window`天然具有所有全局属性，而且与主应用运行的`window`环境隔离。

## 基于 iframe 的沙箱环境实现

基于`iframe`方案实现上比较取巧，利用浏览器`iframe`环境隔离的特性。`iframe`标签可以创造一个独立的浏览器原生级别的运行环境，这个环境被浏览器实现了与主环境的隔离。

同时浏览器提供了`postmessage`等方式让主环境与`iframe`环境可以实现通信，这就让基于`iframe`的沙箱环境成为可能。

```
const iframe = document.createElement('iframe',{url:'about:blank'});

const sandboxGlobal = iframe.contentWindow; foo(sandboxGlobal);
// 此时的document为iframe内部对象
```

> 注意：只有同域的` iframe` 才能取出对应的的 `contentWindow`. 所以需要提供一个宿主应用空的同域 URL 来作为这个 `iframe` 初始加载的 URL. 根据 HTML 的规范 这个 URL 用了 `about:blank` 一定保证保证同域，也不会发生资源加载。

在微前端方案中，我们除了需要一个隔离的 window 环境外，其实还需要共享一些全局对象，比如`histroy`，

如果希望子应用的路由可以通过当前浏览器的返回前进按钮操作，那么微应用环境中的`histroy`需要使用当前浏览器环境的`history`对象。

而像`XMLHttpRequest`这种请求对象则可以使用`iframe`环境中的。

同时所有微应用主动创建的全局变量都在`iframe`的 window 环境中，因此，在具体运行时，我们需要把共享的全局对象传入微应用的运行环境中，这里我们使用`Proxy`代理对象访问来实现。

```javascript
class SandboxWindow {
  constructor(options, context, frameWindow) {
    return new Proxy(frameWindow, {
      set(target, name, value) {
        if (Object.keys(context).includes(name)) {
          context[name] = value;
        }
        target[name] = value;
      },
      get(target, name) {
        // 优先使用共享对象
        if (Object.keys(context).includes(name)) {
          return context[name];
        }
        if (typeof target[name] === "function" && /^[a-z]/.test(name)) {
          return target[name].bind && target[name].bind(target);
        } else {
          return target[name];
        }
      },
    });
  }
  //  ...
}
const iframe = document.createElement("iframe", { url: "about:blank" });
document.body.appendChild(iframe);
const sandboxGlobal = iframe.contentWindow;
// 需要全局共享的变量
const context = { document: window.document, history: window.histroy };
const newSandBoxWindow = new SandboxWindow({}, context, sandboxGlobal);
// newSandBoxWindow.history 全局对象
// newSandBoxWindow.abc 为 'abc' 沙箱环境全局变量
// window.abc 为 undefined
```

上面的实现`newSandBoxWindow`就是一个带有隔离运行环境的全局上下文，我们的微应用 js 代码就可以在这个上下文中运行，做到不污染全局环境的目的，

当然我们也可以对我们的运行环境进行配置，比如能否使用全局的 alert 方案，能否读取 cookie，访问全局`localStorage`对象等，

比如为了文档能够被加载在同一个 DOM 树上，对于 document, 大部分的 DOM 操作的属性和方法还是直接用的宿主浏览器中的 document 的属性和方法。

由于子应用有自己的沙箱环境，之前所有独占式的资源现在都变成了应用独享（比如 常用的 redux、fetch 等），所以子应用也能同时被加载. 并且对于一些变量的我们还能在 proxy 中设置一些访问权限的事情，从而限制子应用的能力，比如 Cookie， LocalStoage 读写。

当这个 iframe 被移除时，写在 `newSandBoxWindow` 的变量和设置的一些 timeout 时间也会一并被移除。（当然 DOM 事件需要沙箱记录，然后在宿主中移除）。当然，应用卸载时一般不会卸载 iframe，当再次进入这个微应用时，其运行环境都还在 `newSandBoxWindow` 上。

**总结，利用 iframe 沙箱可以实现以下特性：**

- 全局变量隔离，如 setTimeout、location、react 不同版本隔离
- 路由隔离，应用可以实现独立路由，也可以共享全局路由
- 多实例，可以同时存在多个独立的微应用同时运行
- 安全策略，可以配置微应用对 Cookie localStorage 资源加载的限制

有了以上的全局环境，那么通过构建一个闭包运行微应用代码，就可以让应用 run 起来了。

```javascript
const newSandBoxWindow = SandboxWindow({}, context, sandboxGlobal);

const codeStr = "var test = 1;";
const run = (code) => {
  window.eval(
    ` ;(function(global, self){with(global){;${code}}}).bind(newSandBoxWindow)(newSandBoxWindow, newSandBoxWindow); `
  );
};
run(codeStr);
console.log(newSandBoxWindow.window.test);
// 1 console.log(window.test); // undefined
// 操作沙箱环境下的全局变量
newSandBoxWindow.history.pushState(null, null, "/index");
newSandBoxWindow.locaiton.hash = "about";
```

## **基于 Proxy+window 更新的沙箱实现**

在单实例的场景中，同一时刻只有一个微应用在运行，所以其可以单独占用 window 环境，不会存在与其他微应用变量冲突的问题。但是当应用切换时，我们需要提供一个干净的 window 环境，保证下一个微应用的正常运行。

一个微应用的生命周期大概分为加载、mount、umount 等过程。那么我们可以在微应用卸载之后，删除其对 window 环境的修改，为下一个微应用的渲染准备环境。这样每次微应用切换时其都有一个干净的全局环境。

基于以上思路，我们可以通过对 window 对象的修改进行记录，在卸载时删除这些记录，在应用再次激活时恢复这些记录，来达到模拟沙箱环境的目的。

主要方案为生成一个代替 window 对象的委托，set，get 时实际操作的 window 对象属性同时记录操作行为，active，inactive 时释放操作行为使 window 对象还原。

```javascript
/** 修改全局对象window方法 */

const setWindowProp = (prop, value, isDel) => {
  if (value === undefined || isDel) {
    delete window[prop];
  } else {
    window[prop] = value;
  }
};
class Sandbox {
  name;
  proxy = null;

  /** 沙箱期间新增的全局变量 */
  addedPropsMap = new Map();

  /** 沙箱期间更新的全局变量 */
  modifiedPropsOriginalValueMap = new Map();

  /** 持续记录更新的(新增和修改的)全局变量的 map，用于在任意时刻做沙箱激活 */   
  currentUpdatedPropsValueMap = new Map();

  /** 应用沙箱被激活 */
  active() {
    // 根据之前修改的记录重新修改window的属性，即还原沙箱之前的状态
    this.currentUpdatedPropsValueMap.forEach((v, p) => setWindowProp(p, v));
  }

  /** 应用沙箱被卸载 */
  inactive() {
    // 1 将沙箱期间修改的属性还原为原先的属性
    this.modifiedPropsOriginalValueMap.forEach((v, p) => setWindowProp(p, v));
    // 2 将沙箱期间新增的全局变量消除
    this.addedPropsMap.forEach((_, p) => setWindowProp(p, undefined, true));
  }

  constructor(name) {
    this.name = name;
    const fakeWindow = Object.create(null);
    const {
      addedPropsMap,
      modifiedPropsOriginalValueMap,
      currentUpdatedPropsValueMap,
    } = this;
      
    const proxy = new Proxy(fakeWindow, {
      set(_, prop, value) {
        if (!window.hasOwnProperty(prop)) {
          // 如果window上没有的属性，记录到新增属性里
          addedPropsMap.set(prop, value);
        } else if (!modifiedPropsOriginalValueMap.has(prop)) {
          // 如果当前window对象有该属性，且未更新过，则记录该属性在window上的初始值
          const originalValue = window[prop];
          modifiedPropsOriginalValueMap.set(prop, originalValue);
        }
        // 记录修改属性以及修改后的值
        currentUpdatedPropsValueMap.set(prop, value);
        // 设置值到全局window上
        setWindowProp(prop, value);
        console.log("window.prop", window[prop]);
        return true;
      },
        
      get(target, prop) {
        return window[prop];
      },
    });
      
    this.proxy = proxy;
  }
}

// 初始化一个沙箱
const newSandBox = new Sandbox("app1");
const proxyWindow = newSandBox.proxy;
proxyWindow.test = 1;
console.log(window.test, proxyWindow.test); // 1 1;  // 关闭沙箱

newSandBox.inactive();
console.log(window.test, proxyWindow.test); // undefined undefined;

// 重启沙箱
newSandBox.active();
console.log(window.test, proxyWindow.test); // 1 1 ;
```

上面的方案中，我们实现了对全局对象的代理，通过沙箱的 `active` 和 `inactive` 方案来激活或者卸载沙箱，达到更新 window 环境的目的。

我们的 `proxyWindow` 只是一个空代理，所有的变量还是存在全局的 window 上的。

以上方式有一个明显的劣势，同一时刻只能有一个激活的沙箱，否则全局对象上的变量会有两个以上的沙箱更新，造成全局变量冲突。所有这种方案比较适合单实例的微前端场景。



## 基于 Proxy+fakeWinodw 的多实例沙箱实现

在上面的方案中，我们的 `fakeWindow` 是一个空的对象，其没有任何储存变量的功能，微应用创建的变量最终实际都是挂载在 window 上的，这就限制了同一时刻不能有两个激活的微应用。

能否实现多实例沙箱呢，答案是肯定的，

我们可以把 `fakeWindow` 使用起来，将微应用使用到的变量放到 `fakeWindow` 中，而共享的变量都从 window 中读取。

需要注意的是，这种场景下需要判断特殊属性，比如不可配置修改的属性，就直接从 window 中获取，需要建立一个共享 window 变量的配置表。

```javascript
class Sandbox {

 name;   
    constructor(name, context={}){   
        this.name = name;   
        const fakeWindow = Object.create({});   
        return new Proxy(fakeWindow,{    
            set(target, name, value){     
                if(Object.keys(context).includes(name)){       
                    context[name] = value;     
                }     
                target[name] = value;    
            },    
            
            get(target,name){     // 优先使用共享对象
                if(Object.keys(context).includes(name)){       
                    return context[name];     
                }     
                if( typeof target[ name ] === 'function' && /^[a-z]/.test(name)){ 
                    return target[ name ].bind && target[ name ].bind( target );   
                }else{      
                    return target[ name ];     
                }    
            }   
        })  
    }  
    //  ... 
}    

/*  * 注意这里的context十分关键，因为我们的fakeWindow是一个空对象，window上的属性都没有，  
* 实际项目中这里的context应该包含大量的window属性，  */    

// 初始化2个沙箱，共享doucment与一个全局变量   
const context = { document: window.document, globalData:'abc'};   
const newSandBox1 = new Sandbox('app1',context);  
const newSandBox2 = new Sandbox('app2',context);   

newSandBox1.test = 1;  
newSandBox2.test = 2;  
window.test = 3;  /*  * 每个环境的私有属性是隔离的  */  
console.log(newSandBox1.test, newSandBox2.test, window.test) // 1 2 3;   

/*  * 共享属性是沙盒共享的,这里newSandBox2环境中的globalData也被改变了  */   newSandBox1.globalData = '123';  
console.log(newSandBox1.globalData, newSandBox2.globalData) // 123  123;
```

以上是在对于多实例沙箱的简单实现，实际项目的需要考虑的问题非常多，比如说对于全局属性的可访问性配置，通过 `constroctor` 访问原型链等，都可以读取到原生的 window。



## 基于 diff 实现沙箱

以上的方案中是基于 es6 的 Proxy API 的，IE11 以下版本的浏览器不支持 Proxy API，社区也有一种降级的实现方式。

在运行的时候保存一个快照 window 对象，将当前 window 对象的全部属性都复制到快照对象上，子应用卸载的时候将 window 对象修改做个 diff，将不同的属性用个 `modifyMap` 保存起来，再次挂载的时候再加上这些修改的属性。

本质类似于 proxy 单实例的方案。这种方式也无法支持多实例，因为运行期间所有的属性都是保存在 window 上的。

以上是基于快照实现的一个简易微前端沙箱环境。通过其激活与卸载来记录与修改 window 上增加的全局变量，从而在不同微前端切换时候，能有一个干净的运行环境。而当应用二次进入时则再恢复至 mount 前的状态的，从而确保应用在 remount 时拥有跟第一次 mount 时一致的全局上下文。

此方案在实际项目中实现起来要复杂的多，其对比算法需要考虑非常多的情况，比如对于 window.a.b.c = 123 这种修改或者对于原型链的修改，这里都不能做到回滚到应用加载前端的全局状态。所以这个方案一般不作为首选方案，是对老旧浏览器的一种降级处理。

当然沙箱里做的事情还远不止这些，其他的还包括一些对全局事件监听的劫持等，以确保应用在切出之后，对全局事件的监听能得到完整的卸载，同时也会在 remount 时重新监听这些全局事件，从而模拟出与应用独立运行时一致的沙箱环境。



# 总结

传统的 js 沙箱注意是考虑的安全领域，锁定不信任脚本的执行，防止全局变量的获取与修改等。

在微前端领域，侧重点不太一样，重要的是不能有全局变量的污染，这也决定了微前端的沙箱实现重点是对于独立运行环境的构造。

由于 js 的灵活性，在微前端的沙盒里通过原型链等方式是可以拿到全局 window 变量的内容的。这个时候我们就还需要配合一定的规范来做代码隔离，而不仅仅是依靠沙箱环境。