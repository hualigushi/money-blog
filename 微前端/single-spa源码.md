[TOC]



# single-spa 源码分析

single-spa 源码阅读思维导图

![img](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL3N6X21tYml6X3BuZy9IOE01UUpEeE1IclpKVGlhWUtZZEQ0RVJnU2VJNjlCRWpialFDMlNOM1p4RVVnaEpqYzdWN09yRXp6WmtuaEl4NkVKdlIzVEZ4NnhiUUhpY2ZDblBIMGJ3LzY0MA?x-oss-process=image/format,png)



![img](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL3N6X21tYml6X3BuZy9IOE01UUpEeE1IclpKVGlhWUtZZEQ0RVJnU2VJNjlCRWpINVBpYlNUV21VRDI4MXVZMWJRQ3ZMa09JeU84Zk5ncGVmbVJzTjQwR0tKVXR4RUU0TjBJQlJBLzY0MA?x-oss-process=image/format,png)

从源码目录中可以看到，`single-spa`是使用`rollup`来打包的，从`rollup.config.js`中可以发现入口是`single-spa.js`， 打开会发现里面导出了一大堆东西，有我们非常熟悉的各个方法，我们就从`registerApplication`方法开始

## registerApplication 注册子应用

> single-spa/src/applications/apps.js

```go
 /**
 * 注册应用，两种方式
 * registerApplication('app1', loadApp(url), activeWhen('/app1'), customProps)
 * registerApplication({
 *    name: 'app1',
 *    app: loadApp(url),
 *    activeWhen: activeWhen('/app1'),
 *    customProps: {}
 * })
 * @param {*} appNameOrConfig 应用名称或者应用配置对象
 * @param {*} appOrLoadApp 应用的加载方法，是一个 promise
 * @param {*} activeWhen 判断应用是否激活的一个方法，方法返回 true or false
 * @param {*} customProps 传递给子应用的 props 对象
 */
export function registerApplication(
  appNameOrConfig,
  appOrLoadApp,
  activeWhen,
  customProps
) {
  /**
   * 格式化用户传递的应用配置参数
   * registration = {
   *    name: 'app1',
   *    loadApp: 返回promise的函数,
   *    activeWhen: 返回boolean值的函数,
   *    customProps: {},
   * }
   */
  const registration = sanitizeArguments(
    appNameOrConfig,
    appOrLoadApp,
    activeWhen,
    customProps
  );
 
  // 判断应用是否重名
  if (getAppNames().indexOf(registration.name) !== -1)
    throw Error(
      formatErrorMessage(
        21,
        __DEV__ &&
          `There is already an app registered with name ${registration.name}`,
        registration.name
      )
    );
 
  // 将各个应用的配置信息都存放到 apps 数组中
  apps.push(
    // 给每个应用增加一个内置属性
    assign(
      {
        loadErrorTime: null,
        // 最重要的，应用的状态
        status: NOT_LOADED,
        parcels: {},
        devtools: {
          overlays: {
            options: {},
            selectors: [],
          },
        },
      },
      registration
    )
  );
 
  // 浏览器环境运行
  if (isInBrowser) {
    // https://zh-hans.single-spa.js.org/docs/api#ensurejquerysupport
    // 如果页面中使用了jQuery，则给jQuery打patch
    ensureJQuerySupport();
    //这个reroute做了很多的事情。执行了用户自定义加载函数。存放了生命周期等等
    reroute();
  }
}
```

### sanitizeArguments 格式化用户传递的子应用配置参数

> single-spa/src/applications/apps.js

```go
// 返回处理后的应用配置对象
function sanitizeArguments(
  appNameOrConfig,
  appOrLoadApp,
  activeWhen,
  customProps
) {
  // 判断第一个参数是否为对象
  const usingObjectAPI = typeof appNameOrConfig === "object";
 
  // 初始化应用配置对象
  const registration = {
    name: null,
    loadApp: null,
    activeWhen: null,
    customProps: null,
  };
 
  if (usingObjectAPI) {
    // 注册应用的时候传递的参数是对象
    validateRegisterWithConfig(appNameOrConfig);
    registration.name = appNameOrConfig.name;
    registration.loadApp = appNameOrConfig.app;
    registration.activeWhen = appNameOrConfig.activeWhen;
    registration.customProps = appNameOrConfig.customProps;
  } else {
    // 参数列表
    validateRegisterWithArguments(
      appNameOrConfig,
      appOrLoadApp,
      activeWhen,
      customProps
    );
    registration.name = appNameOrConfig;
    registration.loadApp = appOrLoadApp;
    registration.activeWhen = activeWhen;
    registration.customProps = customProps;
  }
 
  // 如果第二个参数不是一个函数，比如是一个包含已经生命周期的对象，则包装成一个返回 promise 的函数
  registration.loadApp = sanitizeLoadApp(registration.loadApp);
  // 如果用户没有提供 props 对象，则给一个默认的空对象
  registration.customProps = sanitizeCustomProps(registration.customProps);
  // 保证activeWhen是一个返回boolean值的函数
  registration.activeWhen = sanitizeActiveWhen(registration.activeWhen);
 
  // 返回处理后的应用配置对象
  return registration;
}
```

阅读它的源码我们发现，里面就是一些规范化操作的细节，同时规划化完成之后会在registration对应的属性上进行赋值。最后把这个registration返回出去。

所以这段代码执行的作用就是：

1. 规范化属性，有错误的就抛出异常。

2. 最后把我们的传入的参数整理完了之后的属性值重新赋值给registration，并且返回出去。



### validateRegisterWithConfig

> single-spa/src/applications/apps.js

```go
/**
 * 验证应用配置对象的各个属性是否存在不合法的情况，存在则抛出错误
 * @param {*} config = { name: 'app1', app: function, activeWhen: function, customProps: {} }
 */
export function validateRegisterWithConfig(config) {
  // 异常判断，应用的配置对象不能是数组或者null
  if (Array.isArray(config) || config === null)
    throw Error(
      formatErrorMessage(
        39,
        __DEV__ && "Configuration object can't be an Array or null!"
      )
    );
  // 配置对象只能包括这四个key
  const validKeys = ["name", "app", "activeWhen", "customProps"];
  // 找到配置对象存在的无效的key
  const invalidKeys = Object.keys(config).reduce(
    (invalidKeys, prop) =>
      validKeys.indexOf(prop) >= 0 ? invalidKeys : invalidKeys.concat(prop),
    []
  );
  // 如果存在无效的key，则抛出一个错误
  if (invalidKeys.length !== 0)
    throw Error(
      formatErrorMessage(
        38,
        __DEV__ &&
          `The configuration object accepts only: ${validKeys.join(
            ", "
          )}. Invalid keys: ${invalidKeys.join(", ")}.`,
        validKeys.join(", "),
        invalidKeys.join(", ")
      )
    );
  // 验证应用名称，只能是字符串，且不能为空
  if (typeof config.name !== "string" || config.name.length === 0)
    throw Error(
      formatErrorMessage(
        20,
        __DEV__ &&
          "The config.name on registerApplication must be a non-empty string"
      )
    );
  // app 属性只能是一个对象或者函数
  // 对象是一个已被解析过的对象，是一个包含各个生命周期的对象；
  // 加载函数必须返回一个 promise
  // 以上信息在官方文档中有提到：https://zh-hans.single-spa.js.org/docs/configuration
  if (typeof config.app !== "object" && typeof config.app !== "function")
    throw Error(
      formatErrorMessage(
        20,
        __DEV__ &&
          "The config.app on registerApplication must be an application or a loading function"
      )
    );
  // 第三个参数，可以是一个字符串，也可以是一个函数，也可以是两者组成的一个数组，表示当前应该被激活的应用的baseURL
  const allowsStringAndFunction = (activeWhen) =>
    typeof activeWhen === "string" || typeof activeWhen === "function";
  if (
    !allowsStringAndFunction(config.activeWhen) &&
    !(
      Array.isArray(config.activeWhen) &&
      config.activeWhen.every(allowsStringAndFunction)
    )
  )
    throw Error(
      formatErrorMessage(
        24,
        __DEV__ &&
          "The config.activeWhen on registerApplication must be a string, function or an array with both"
      )
    );
  // 传递给子应用的props对象必须是一个对象
  if (!validCustomProps(config.customProps))
    throw Error(
      formatErrorMessage(
        22,
        __DEV__ && "The optional config.customProps must be an object"
      )
    );
}
```

### validateRegisterWithArguments

> single-spa/src/applications/apps.js

```go
// 同样是验证四个参数是否合法
function validateRegisterWithArguments(
  name,
  appOrLoadApp,
  activeWhen,
  customProps
) {
  if (typeof name !== "string" || name.length === 0)
    throw Error(
      formatErrorMessage(
        20,
        __DEV__ &&
          `The 1st argument to registerApplication must be a non-empty string 'appName'`
      )
    );
 
  if (!appOrLoadApp)
    throw Error(
      formatErrorMessage(
        23,
        __DEV__ &&
          "The 2nd argument to registerApplication must be an application or loading application function"
      )
    );
 
  if (typeof activeWhen !== "function")
    throw Error(
      formatErrorMessage(
        24,
        __DEV__ &&
          "The 3rd argument to registerApplication must be an activeWhen function"
      )
    );
 
  if (!validCustomProps(customProps))
    throw Error(
      formatErrorMessage(
        22,
        __DEV__ &&
          "The optional 4th argument is a customProps and must be an object"
      )
    );
}
```

### sanitizeLoadApp

> single-spa/src/applications/apps.js

```go
// 保证第二个参数一定是一个返回 promise 的函数
function sanitizeLoadApp(loadApp) {
  if (typeof loadApp !== "function") {
    return () => Promise.resolve(loadApp);
  }
 
  return loadApp;
}
```

### sanitizeCustomProps

> single-spa/src/applications/apps.js

```go

// 保证 props 不为 undefined
function sanitizeCustomProps(customProps) {
  return customProps ? customProps : {};
}
```

### sanitizeActiveWhen

> single-spa/src/applications/apps.js

```go
// 得到一个函数，函数负责判断浏览器当前地址是否和用户给定的baseURL相匹配，匹配返回true，否则返回false
function sanitizeActiveWhen(activeWhen) {
  // []
  let activeWhenArray = Array.isArray(activeWhen) ? activeWhen : [activeWhen];
  // 保证数组中每个元素都是一个函数
  activeWhenArray = activeWhenArray.map((activeWhenOrPath) =>
    typeof activeWhenOrPath === "function"
      ? activeWhenOrPath
      // activeWhen如果是一个路径，则保证成一个函数
      : pathToActiveWhen(activeWhenOrPath)
  );
 
  // 返回一个函数，函数返回一个 boolean 值
  return (location) =>
    activeWhenArray.some((activeWhen) => activeWhen(location));
}
```

### pathToActiveWhen

> single-spa/src/applications/apps.js

```go
export function pathToActiveWhen(path) {
  // 根据用户提供的baseURL，生成正则表达式
  const regex = toDynamicPathValidatorRegex(path);
 
  // 函数返回boolean值，判断当前路由是否匹配用户给定的路径
  return (location) => {
    const route = location.href
      .replace(location.origin, "")
      .replace(location.search, "")
      .split("?")[0];
    return regex.test(route);
  };
}
```

## reroute 更改app.status和执行生命周期函数

> single-spa/src/navigation/reroute.js

```go
/**
 * 每次切换路由前，将应用分为4大类，
 * 首次加载时执行loadApp
 * 后续的路由切换执行performAppChange
 * 为四大类的应用分别执行相应的操作，比如更改app.status，执行生命周期函数
 * 所以，从这里也可以看出来，single-spa就是一个维护应用的状态机
 * @param {*} pendingPromises 
 * @param {*} eventArguments 
 */
export function reroute(pendingPromises = [], eventArguments) {
  // 应用正在切换，这个状态会在执行performAppChanges之前置为true，执行结束之后再置为false
  // 如果在中间用户重新切换路由了，即走这个if分支，暂时看起来就在数组中存储了一些信息，没看到有什么用
  // 字面意思理解就是用户等待app切换
  if (appChangeUnderway) {
    return new Promise((resolve, reject) => {
      peopleWaitingOnAppChange.push({
        resolve,
        reject,
        eventArguments,
      });
    });
  }
 
  // 将应用分为4大类
  const {
    // 需要被移除的
    appsToUnload,
    // 需要被卸载的
    appsToUnmount,
    // 需要被加载的
    appsToLoad,
    // 需要被挂载的
    appsToMount,
  } = getAppChanges();
 
  let appsThatChanged;
 
  // 是否已经执行 start 方法
  if (isStarted()) {
    // 已执行
    appChangeUnderway = true;
    // 所有需要被改变的的应用
    appsThatChanged = appsToUnload.concat(
      appsToLoad,
      appsToUnmount,
      appsToMount
    );
    // 执行改变
    return performAppChanges();
  } else {
    // 未执行
    appsThatChanged = appsToLoad;
    // 加载Apps
    return loadApps();
  }
 
  // 整体返回一个立即resolved的promise，通过微任务来加载apps
  function loadApps() {
    return Promise.resolve().then(() => {
      // 加载每个子应用，并做一系列的状态变更和验证（比如结果为promise、子应用要导出生命周期函数）
      const loadPromises = appsToLoad.map(toLoadPromise);
 
      return (
        // 保证所有加载子应用的微任务执行完成
        Promise.all(loadPromises)
          .then(callAllEventListeners)
          // there are no mounted apps, before start() is called, so we always return []
          .then(() => [])
          .catch((err) => {
            callAllEventListeners();
            throw err;
          })
      );
    });
  }
 
  function performAppChanges() {
    return Promise.resolve().then(() => {
      // https://github.com/single-spa/single-spa/issues/545
      // 自定义事件，在应用状态发生改变之前可触发，给用户提供搞事情的机会
      window.dispatchEvent(
        new CustomEvent(
          appsThatChanged.length === 0
            ? "single-spa:before-no-app-change"
            : "single-spa:before-app-change",
          getCustomEventDetail(true)
        )
      );
 
      window.dispatchEvent(
        new CustomEvent(
          "single-spa:before-routing-event",
          getCustomEventDetail(true)
        )
      );
      // 移除应用 => 更改应用状态，执行unload生命周期函数，执行一些清理动作
      // 其实一般情况下这里没有真的移除应用
      const unloadPromises = appsToUnload.map(toUnloadPromise);
 
      // 卸载应用，更改状态，执行unmount生命周期函数
      const unmountUnloadPromises = appsToUnmount
        .map(toUnmountPromise)
        // 卸载完然后移除，通过注册微任务的方式实现
        .map((unmountPromise) => unmountPromise.then(toUnloadPromise));
 
      const allUnmountPromises = unmountUnloadPromises.concat(unloadPromises);
 
      const unmountAllPromise = Promise.all(allUnmountPromises);
 
      // 卸载全部完成后触发一个事件
      unmountAllPromise.then(() => {
        window.dispatchEvent(
          new CustomEvent(
            "single-spa:before-mount-routing-event",
            getCustomEventDetail(true)
          )
        );
      });
 
      /* We load and bootstrap apps while other apps are unmounting, but we
       * wait to mount the app until all apps are finishing unmounting
       * 这个原因其实是因为这些操作都是通过注册不同的微任务实现的，而JS是单线程执行，
       * 所以自然后续的只能等待前面的执行完了才能执行
       * 这里一般情况下其实不会执行，只有手动执行了unloadApplication方法才会二次加载
       */
      const loadThenMountPromises = appsToLoad.map((app) => {
        return toLoadPromise(app).then((app) =>
          tryToBootstrapAndMount(app, unmountAllPromise)
        );
      });
 
      /* These are the apps that are already bootstrapped and just need
       * to be mounted. They each wait for all unmounting apps to finish up
       * before they mount.
       * 初始化和挂载app，其实做的事情很简单，就是改变app.status，执行生命周期函数
       * 当然这里的初始化和挂载其实是前后脚一起完成的(只要中间用户没有切换路由)
       */
      const mountPromises = appsToMount
        .filter((appToMount) => appsToLoad.indexOf(appToMount) < 0)
        .map((appToMount) => {
          return tryToBootstrapAndMount(appToMount, unmountAllPromise);
        });
 
      // 后面就没啥了，可以理解为收尾工作
      return unmountAllPromise
        .catch((err) => {
          callAllEventListeners();
          throw err;
        })
        .then(() => {
          /* Now that the apps that needed to be unmounted are unmounted, their DOM navigation
           * events (like hashchange or popstate) should have been cleaned up. So it's safe
           * to let the remaining captured event listeners to handle about the DOM event.
           */
          callAllEventListeners();
 
          return Promise.all(loadThenMountPromises.concat(mountPromises))
            .catch((err) => {
              pendingPromises.forEach((promise) => promise.reject(err));
              throw err;
            })
            .then(finishUpAndReturn);
        });
    });
  }
}
```

### getAppChanges

> single-spa/src/applications/apps.js

```go
// 将应用分为四大类
export function getAppChanges() {
  // 需要被移除的应用
  const appsToUnload = [],
    // 需要被卸载的应用
    appsToUnmount = [],
    // 需要被加载的应用
    appsToLoad = [],
    // 需要被挂载的应用
    appsToMount = [];
 
  // We re-attempt to download applications in LOAD_ERROR after a timeout of 200 milliseconds
  const currentTime = new Date().getTime();
 
  //apps是我们在registerApplication方法中注册的子应用的信息的json对象会被缓存在apps数组中，apps装有我们子应用的配置信息
  apps.forEach((app) => {
    // 根据当前的location.href匹配路径 boolean，应用是否应该被激活
    const appShouldBeActive =
      app.status !== SKIP_BECAUSE_BROKEN && shouldBeActive(app);
 
    switch (app.status) {
      // 需要被加载的应用
      case LOAD_ERROR:
        if (currentTime - app.loadErrorTime >= 200) {
          appsToLoad.push(app);
        }
        break;
      // 需要被加载的应用
      case NOT_LOADED:
      case LOADING_SOURCE_CODE:
        if (appShouldBeActive) {
          appsToLoad.push(app);
        }
        break;
      // 状态为xx的应用
      case NOT_BOOTSTRAPPED:
      case NOT_MOUNTED:
        if (!appShouldBeActive && getAppUnloadInfo(toName(app))) {
          // 需要被移除的应用
          appsToUnload.push(app);
        } else if (appShouldBeActive) {
          // 需要被挂载的应用
          appsToMount.push(app);
        }
        break;
      // 需要被卸载的应用，已经处于挂载状态，但现在路由已经变了的应用需要被卸载
      case MOUNTED:
        if (!appShouldBeActive) {
          appsToUnmount.push(app);
        }
        break;
      // all other statuses are ignored
    }
  });
 
  return { appsToUnload, appsToUnmount, appsToLoad, appsToMount };
}
```

### shouldBeActive

> single-spa/src/applications/app.helpers.js

```go
/ 返回boolean值，应用是否应该被激活
export function shouldBeActive(app) {
  try {
    return app.activeWhen(window.location);
  } catch (err) {
    handleAppError(err, app, SKIP_BECAUSE_BROKEN);
    return false;
  }
}
```

### toLoadPromise

> single-spa/src/lifecycles/load.js

```go
/**
 * 通过微任务加载子应用，其实singleSpa中很多地方都用了微任务
 * 这里最终是return了一个promise出行，在注册了加载子应用的微任务
 * 概括起来就是：
 *  更改app.status为LOAD_SOURCE_CODE => NOT_BOOTSTRAP，当然还有可能是LOAD_ERROR
 *  执行加载函数，并将props传递给加载函数，给用户处理props的一个机会,因为这个props是一个完备的props
 *  验证加载函数的执行结果，必须为promise，且加载函数内部必须return一个对象
 *  这个对象是子应用的，对象中必须包括各个必须的生命周期函数
 *  然后将生命周期方法通过一个函数包裹并挂载到app对象上
 *  app加载完成，删除app.loadPromise
 * @param {*} app 
 */
export function toLoadPromise(app) {
  return Promise.resolve().then(() => {
    if (app.loadPromise) {
      // 说明app已经在被加载
      return app.loadPromise;
    }
 
    // 只有状态为NOT_LOADED和LOAD_ERROR的app才可以被加载
    if (app.status !== NOT_LOADED && app.status !== LOAD_ERROR) {
      return app;
    }
 
    // 设置App的状态
    app.status = LOADING_SOURCE_CODE;
 
    let appOpts, isUserErr;
 
    return (app.loadPromise = Promise.resolve()
      .then(() => {
        // 执行app的加载函数，并给子应用传递props => 用户自定义的customProps和内置的比如应用的名称、singleSpa实例
        // 其实这里有个疑问，这个props是怎么传递给子应用的，感觉跟后面的生命周期函数有关
        const loadPromise = app.loadApp(getProps(app));
        // 加载函数需要返回一个promise
        if (!smellsLikeAPromise(loadPromise)) {
          // The name of the app will be prepended to this error message inside of the handleAppError function
          isUserErr = true;
          throw Error(
            formatErrorMessage(
              33,
              __DEV__ &&
                `single-spa loading function did not return a promise. Check the second argument to registerApplication('${toName(
                  app
                )}', loadingFunction, activityFunction)`,
              toName(app)
            )
          );
        }
        // 这里很重要，这个val就是示例项目中加载函数中return出来的window.singleSpa，这个属性是子应用打包时设置的
        return loadPromise.then((val) => {
          app.loadErrorTime = null;
 
          // window.singleSpa
          appOpts = val;
 
          let validationErrMessage, validationErrCode;
 
          // 以下进行一系列的验证，已window.singleSpa为例说明，简称g.s
 
          // g.s必须为对象
          if (typeof appOpts !== "object") {
            validationErrCode = 34;
            if (__DEV__) {
              validationErrMessage = `does not export anything`;
            }
          }
 
          // g.s必须导出bootstrap生命周期函数
          if (!validLifecycleFn(appOpts.bootstrap)) {
            validationErrCode = 35;
            if (__DEV__) {
              validationErrMessage = `does not export a bootstrap function or array of functions`;
            }
          }
 
          // g.s必须导出mount生命周期函数
          if (!validLifecycleFn(appOpts.mount)) {
            validationErrCode = 36;
            if (__DEV__) {
              validationErrMessage = `does not export a bootstrap function or array of functions`;
            }
          }
 
          // g.s必须导出unmount生命周期函数
          if (!validLifecycleFn(appOpts.unmount)) {
            validationErrCode = 37;
            if (__DEV__) {
              validationErrMessage = `does not export a bootstrap function or array of functions`;
            }
          }
 
          const type = objectType(appOpts);
 
          // 说明上述验证失败，抛出错误提示信息
          if (validationErrCode) {
            let appOptsStr;
            try {
              appOptsStr = JSON.stringify(appOpts);
            } catch {}
            console.error(
              formatErrorMessage(
                validationErrCode,
                __DEV__ &&
                  `The loading function for single-spa ${type} '${toName(
                    app
                  )}' resolved with the following, which does not have bootstrap, mount, and unmount functions`,
                type,
                toName(app),
                appOptsStr
              ),
              appOpts
            );
            handleAppError(validationErrMessage, app, SKIP_BECAUSE_BROKEN);
            return app;
          }
 
          if (appOpts.devtools && appOpts.devtools.overlays) {
            // app.devtoolsoverlays添加子应用的devtools.overlays的属性，不知道是干嘛用的
            app.devtools.overlays = assign(
              {},
              app.devtools.overlays,
              appOpts.devtools.overlays
            );
          }
 
          // 设置app状态为未初始化，表示加载完了
          app.status = NOT_BOOTSTRAPPED;
          // 在app对象上挂载生命周期方法，每个方法都接收一个props作为参数，方法内部执行子应用导出的生命周期函数，并确保生命周期函数返回一个promise
          app.bootstrap = flattenFnArray(appOpts, "bootstrap");
          app.mount = flattenFnArray(appOpts, "mount");
          app.unmount = flattenFnArray(appOpts, "unmount");
          app.unload = flattenFnArray(appOpts, "unload");
          app.timeouts = ensureValidAppTimeouts(appOpts.timeouts);
 
          // 执行到这里说明子应用已成功加载，删除app.loadPromise属性
          delete app.loadPromise;
 
          return app;
        });
      })
      .catch((err) => {
        // 加载失败，稍后重新加载
        delete app.loadPromise;
 
        let newStatus;
        if (isUserErr) {
          newStatus = SKIP_BECAUSE_BROKEN;
        } else {
          newStatus = LOAD_ERROR;
          app.loadErrorTime = new Date().getTime();
        }
        handleAppError(err, app, newStatus);
 
        return app;
      }));
  });
}
```

###  

#### 用户自定义加载函数的执行

在上面代码的toLoadPromise中，有这么一句话app.loadApp(getProps(app))。从分析中我们知道，app.loadApp执行的函数的就是用户调用registerApplication传入的加载函数。就是下面图的东西

![img](https://img2020.cnblogs.com/blog/1962190/202011/1962190-20201112095336829-910296319.png)

 我们要明白在加载函数中需要我们写上我们对于子应用代码的加载过程，上面的例子是一种简单的写法，我们还可能会这么写(如下)，不管怎么写最终目的都是一样的。

```
const runScript = async (url) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);
    });
};

singleSpa.registerApplication({ //注册微前端服务
    name: 'singleDemo',
    app: async () => {
        await runScript('http://127.0.0.1:8081/static/js/chunk-vendors.js');
        await runScript('http://127.0.0.1:8081/static/js/app.js');
        console.log(window)
        return window['singleDemo'];
    },
    activeWhen: () => location.pathname.startsWith('/vue') // 配置微前端模块前
});
```



最终目的是什么：

1.**需要对于子应用的代码进行加载，加载的写法不限**。你可以通过插入<script>标签引用你的子应用代码，或者像qiankun一样通过window.fetch去请求子应用的文件资源。

从这里加载函数的自定义我们可以看出为什么single-spa这个可以支持不同的前端框架例如vue，react接入，**原因在于我们的前端框架最终打包都会变成app.js, vendor-chunk.js等js文件，变回原生的操作。我们从微前端的主应用去引入这些**

**js文件去渲染出我们的子应用，本质上最终都是转为原生dom操作，所以说无论你的子应用用框架东西写的，其实都一样。所以加载函数就是single-spa对应子应用资源引入的入口地方。**



2. 第二个目的就是需要在加载函数中我们要返回出子应用中导出的生命周期函数提供给主应用，那么从哪里看出需要返回子应用的生命周期函数。我们回过头来看LoadPromise的加载代码(如下)。

看看appOpts下面的if函数，可以看到传入的参数有**bootstrap, mount, unmount, unload**等等的生命周期关键词。读者可以仔细阅读一下它的校验函数你大概就能够知道，他在校验appOpts即val里是否有这些生命周期函数。说明single-spa要求我们在加载函数中需要return出子应用的生命周期函数。



### getProps

> single-spa/src/lifecycles/prop.helpers.js

```go
/**
 * 得到传递给子应用的props
 * @param {} appOrParcel => app 
 * 以下返回内容其实在官网也都有提到，比如singleSpa实例，目的是为了子应用不需要重复引入single-spa
 * return {
 *    ...customProps,
 *    name,
 *    mountParcel: mountParcel.bind(appOrParcel),
 *    singleSpa, 
 * }
 */
export function getProps(appOrParcel) {
  // app.name
  const name = toName(appOrParcel);
  // app.customProps，以下对customProps对象的判断逻辑有点多余
  // 因为前面的参数格式化已经保证customProps肯定是一个对象
  let customProps =
    typeof appOrParcel.customProps === "function"
      ? appOrParcel.customProps(name, window.location)
      : appOrParcel.customProps;
  if (
    typeof customProps !== "object" ||
    customProps === null ||
    Array.isArray(customProps)
  ) {
    customProps = {};
    console.warn(
      formatErrorMessage(
        40,
        __DEV__ &&
          `single-spa: ${name}'s customProps function must return an object. Received ${customProps}`
      ),
      name,
      customProps
    );
  }
 
  const result = assign({}, customProps, {
    name,
    mountParcel: mountParcel.bind(appOrParcel),
    singleSpa,
  });
 
  if (isParcel(appOrParcel)) {
    result.unmountSelf = appOrParcel.unmountThisParcel;
  }
 
  return result;
}
```

### smellsLikeAPromise

> single-spa/src/lifecycles/lifecycle.helpers.js

```go
// 判断一个变量是否为promise
export function smellsLikeAPromise(promise) {
  return (
    promise &&
    typeof promise.then === "function" &&
    typeof promise.catch === "function"
  );
}
```

### flattenFnArray

> single-spa/src/lifecycles/lifecycle.helpers.js

```go

/**
 * 返回一个接受props作为参数的函数，这个函数负责执行子应用中的生命周期函数，
 * 并确保生命周期函数返回的结果为promise
 * @param {*} appOrParcel => window.singleSpa，子应用打包后的对象
 * @param {*} lifecycle => 字符串，生命周期名称
 */
export function flattenFnArray(appOrParcel, lifecycle) {
  // fns = fn or []
  let fns = appOrParcel[lifecycle] || [];
  // fns = [] or [fn]
  fns = Array.isArray(fns) ? fns : [fns];
  // 有些生命周期函数子应用可能不会设置，比如unload
  if (fns.length === 0) {
    fns = [() => Promise.resolve()];
  }
 
  const type = objectType(appOrParcel);
  const name = toName(appOrParcel);
 
  return function (props) {
    // 这里最后返回了一个promise链，这个操作似乎没啥必要，因为不可能出现同名的生命周期函数，所以，这里将生命周期函数放数组，没太理解目的是啥
    return fns.reduce((resultPromise, fn, index) => {
      return resultPromise.then(() => {
        // 执行生命周期函数，传递props给函数，并验证函数的返回结果，必须为promise
        const thisPromise = fn(props);
        return smellsLikeAPromise(thisPromise)
          ? thisPromise
          : Promise.reject(
              formatErrorMessage(
                15,
                __DEV__ &&
                  `Within ${type} ${name}, the lifecycle function ${lifecycle} at array index ${index} did not return a promise`,
                type,
                name,
                lifecycle,
                index
              )
            );
      });
    }, Promise.resolve());
  };
}
```

### toUnloadPromise

> single-spa/src/lifecycles/unload.js

```go

const appsToUnload = {};
/**
 * 移除应用，就更改一下应用的状态，执行unload生命周期函数，执行清理操作
 * 
 * 其实一般情况是不会执行移除操作的，除非你手动调用unloadApplication方法
 * 单步调试会发现appsToUnload对象是个空对象，所以第一个if就return了，这里啥也没做
 * https://zh-hans.single-spa.js.org/docs/api#unloadapplication
 * */ 
export function toUnloadPromise(app) {
  return Promise.resolve().then(() => {
    // 应用信息
    const unloadInfo = appsToUnload[toName(app)];
 
    if (!unloadInfo) {
      /* No one has called unloadApplication for this app,
       * 不需要移除
       * 一般情况下都不需要移除，只有在调用unloadApplication方法手动执行移除时才会
       * 执行后面的内容
       */
      return app;
    }
 
    // 已经卸载了，执行一些清理操作
    if (app.status === NOT_LOADED) {
      /* This app is already unloaded. We just need to clean up
       * anything that still thinks we need to unload the app.
       */
      finishUnloadingApp(app, unloadInfo);
      return app;
    }
 
    // 如果应用正在执行挂载，路由突然发生改变，那么也需要应用挂载完成才可以执行移除
    if (app.status === UNLOADING) {
      /* Both unloadApplication and reroute want to unload this app.
       * It only needs to be done once, though.
       */
      return unloadInfo.promise.then(() => app);
    }
 
    if (app.status !== NOT_MOUNTED) {
      /* The app cannot be unloaded until it is unmounted.
       */
      return app;
    }
 
    // 更改状态为 UNLOADING
    app.status = UNLOADING;
    // 在合理的时间范围内执行生命周期函数
    return reasonableTime(app, "unload")
      .then(() => {
        // 一些清理操作
        finishUnloadingApp(app, unloadInfo);
        return app;
      })
      .catch((err) => {
        errorUnloadingApp(app, unloadInfo, err);
        return app;
      });
  });
}
```

### finishUnloadingApp

> single-spa/src/lifecycles/unload.js

```go
// 移除完成，执行一些清理动作，其实就是从appsToUnload数组中移除该app，移除生命周期函数，更改app.status
// 但应用不是真的被移除，后面再激活时不需要重新去下载资源,，只是做一些状态上的变更，当然load的那个过程还是需要的，这点可能需要再确认一下
function finishUnloadingApp(app, unloadInfo) {
  delete appsToUnload[toName(app)];
 
  // Unloaded apps don't have lifecycles
  delete app.bootstrap;
  delete app.mount;
  delete app.unmount;
  delete app.unload;
 
  app.status = NOT_LOADED;
 
  /* resolve the promise of whoever called unloadApplication.
   * This should be done after all other cleanup/bookkeeping
   */
  unloadInfo.resolve();
}
```

### reasonableTime

> single-spa/src/applications/timeouts.js

```go
/**
 * 合理的时间，即生命周期函数合理的执行时间
 * 在合理的时间内执行生命周期函数，并将函数的执行结果resolve出去
 * @param {*} appOrParcel => app
 * @param {*} lifecycle => 生命周期函数名
 */
export function reasonableTime(appOrParcel, lifecycle) {
  // 应用的超时配置
  const timeoutConfig = appOrParcel.timeouts[lifecycle];
  // 超时警告
  const warningPeriod = timeoutConfig.warningMillis;
  const type = objectType(appOrParcel);
 
  return new Promise((resolve, reject) => {
    let finished = false;
    let errored = false;
 
    // 这里很关键，之前一直奇怪props是怎么传递给子应用的，这里就是了，果然和之前的猜想是一样的
    // 是在执行生命周期函数时像子应用传递的props，所以之前执行loadApp传递props不会到子应用，
    // 那么设计估计是给用户自己处理props的一个机会吧，因为那个时候处理的props已经是{ ...customProps, ...内置props }
    appOrParcel[lifecycle](getProps(appOrParcel))
      .then((val) => {
        finished = true;
        resolve(val);
      })
      .catch((val) => {
        finished = true;
        reject(val);
      });
 
    // 下面就没啥了，就是超时的一些提示信息
    setTimeout(() => maybeTimingOut(1), warningPeriod);
    setTimeout(() => maybeTimingOut(true), timeoutConfig.millis);
 
    const errMsg = formatErrorMessage(
      31,
      __DEV__ &&
        `Lifecycle function ${lifecycle} for ${type} ${toName(
          appOrParcel
        )} lifecycle did not resolve or reject for ${timeoutConfig.millis} ms.`,
      lifecycle,
      type,
      toName(appOrParcel),
      timeoutConfig.millis
    );
 
    function maybeTimingOut(shouldError) {
      if (!finished) {
        if (shouldError === true) {
          errored = true;
          if (timeoutConfig.dieOnTimeout) {
            reject(Error(errMsg));
          } else {
            console.error(errMsg);
            //don't resolve or reject, we're waiting this one out
          }
        } else if (!errored) {
          const numWarnings = shouldError;
          const numMillis = numWarnings * warningPeriod;
          console.warn(errMsg);
          if (numMillis + warningPeriod < timeoutConfig.millis) {
            setTimeout(() => maybeTimingOut(numWarnings + 1), warningPeriod);
          }
        }
      }
    }
  });
}
```

### toUnmountPromise

> single-spa/src/lifecycles/unmount.js

```go
/**
 * 执行了状态上的更改
 * 执行unmount生命周期函数
 * @param {*} appOrParcel => app
 * @param {*} hardFail => 索引
 */
export function toUnmountPromise(appOrParcel, hardFail) {
  return Promise.resolve().then(() => {
    // 只卸载已挂载的应用
    if (appOrParcel.status !== MOUNTED) {
      return appOrParcel;
    }
    // 更改状态
    appOrParcel.status = UNMOUNTING;
 
    // 有关parcels的一些处理，没使用过parcels，所以unmountChildrenParcels = []
    const unmountChildrenParcels = Object.keys(
      appOrParcel.parcels
    ).map((parcelId) => appOrParcel.parcels[parcelId].unmountThisParcel());
 
    let parcelError;
 
    return Promise.all(unmountChildrenParcels)
      // 在合理的时间范围内执行unmount生命周期函数
      .then(unmountAppOrParcel, (parcelError) => {
        // There is a parcel unmount error
        return unmountAppOrParcel().then(() => {
          // Unmounting the app/parcel succeeded, but unmounting its children parcels did not
          const parentError = Error(parcelError.message);
          if (hardFail) {
            throw transformErr(parentError, appOrParcel, SKIP_BECAUSE_BROKEN);
          } else {
            handleAppError(parentError, appOrParcel, SKIP_BECAUSE_BROKEN);
          }
        });
      })
      .then(() => appOrParcel);
 
    function unmountAppOrParcel() {
      // We always try to unmount the appOrParcel, even if the children parcels failed to unmount.
      return reasonableTime(appOrParcel, "unmount")
        .then(() => {
          // The appOrParcel needs to stay in a broken status if its children parcels fail to unmount
          if (!parcelError) {
            appOrParcel.status = NOT_MOUNTED;
          }
        })
        .catch((err) => {
          if (hardFail) {
            throw transformErr(err, appOrParcel, SKIP_BECAUSE_BROKEN);
          } else {
            handleAppError(err, appOrParcel, SKIP_BECAUSE_BROKEN);
          }
        });
    }
  });
}
```

### tryToBootstrapAndMount

> single-spa/src/navigation/reroute.js

```go

/**
 * Let's imagine that some kind of delay occurred during application loading.
 * The user without waiting for the application to load switched to another route,
 * this means that we shouldn't bootstrap and mount that application, thus we check
 * twice if that application should be active before bootstrapping and mounting.
 * https://github.com/single-spa/single-spa/issues/524
 * 这里这个两次判断还是很重要的
 */
function tryToBootstrapAndMount(app, unmountAllPromise) {
  if (shouldBeActive(app)) {
    // 一次判断为true，才会执行初始化
    return toBootstrapPromise(app).then((app) =>
      unmountAllPromise.then(() =>
        // 第二次, 两次都为true才会去挂载
        shouldBeActive(app) ? toMountPromise(app) : app
      )
    );
  } else {
    // 卸载
    return unmountAllPromise.then(() => app);
  }
}
```

### toBootstrapPromise

> single-spa/src/lifecycles/bootstrap.js

```go
// 初始化app，更改app.status，在合理的时间内执行bootstrap生命周期函数
export function toBootstrapPromise(appOrParcel, hardFail) {
  return Promise.resolve().then(() => {
    if (appOrParcel.status !== NOT_BOOTSTRAPPED) {
      return appOrParcel;
    }
 
    appOrParcel.status = BOOTSTRAPPING;
 
    return reasonableTime(appOrParcel, "bootstrap")
      .then(() => {
        appOrParcel.status = NOT_MOUNTED;
        return appOrParcel;
      })
      .catch((err) => {
        if (hardFail) {
          throw transformErr(err, appOrParcel, SKIP_BECAUSE_BROKEN);
        } else {
          handleAppError(err, appOrParcel, SKIP_BECAUSE_BROKEN);
          return appOrParcel;
        }
      });
  });
}
```

### toMountPromise

> single-spa/src/lifecycles/mount.js

```go
// 挂载app，执行mount生命周期函数，并更改app.status
export function toMountPromise(appOrParcel, hardFail) {
  return Promise.resolve().then(() => {
    if (appOrParcel.status !== NOT_MOUNTED) {
      return appOrParcel;
    }
 
    if (!beforeFirstMountFired) {
      window.dispatchEvent(new CustomEvent("single-spa:before-first-mount"));
      beforeFirstMountFired = true;
    }
 
    return reasonableTime(appOrParcel, "mount")
      .then(() => {
        appOrParcel.status = MOUNTED;
 
        if (!firstMountFired) {
          // single-spa其实在不同的阶段提供了相应的自定义事件，让用户可以做一些事情
          window.dispatchEvent(new CustomEvent("single-spa:first-mount"));
          firstMountFired = true;
        }
 
        return appOrParcel;
      })
      .catch((err) => {
        // If we fail to mount the appOrParcel, we should attempt to unmount it before putting in SKIP_BECAUSE_BROKEN
        // We temporarily put the appOrParcel into MOUNTED status so that toUnmountPromise actually attempts to unmount it
        // instead of just doing a no-op.
        appOrParcel.status = MOUNTED;
        return toUnmountPromise(appOrParcel, true).then(
          setSkipBecauseBroken,
          setSkipBecauseBroken
        );
 
        function setSkipBecauseBroken() {
          if (!hardFail) {
            handleAppError(err, appOrParcel, SKIP_BECAUSE_BROKEN);
            return appOrParcel;
          } else {
            throw transformErr(err, appOrParcel, SKIP_BECAUSE_BROKEN);
          }
        }
      });
  });
}
```

## start(opts)

> single-spa/src/start.js

```go
let started = false
/**
 * https://zh-hans.single-spa.js.org/docs/api#start
 * 调用start之前，应用会被加载，但不会初始化、挂载和卸载，有了start可以更好的控制应用的性能
 * @param {*} opts 
 */
export function start(opts) {
  started = true;
  if (opts && opts.urlRerouteOnly) {
    setUrlRerouteOnly(opts.urlRerouteOnly);
  }
  if (isInBrowser) {
    reroute();
  }
}
 
export function isStarted() {
  return started;
}
 
if (isInBrowser) {
  // registerApplication之后如果一直没有调用start，则在5000ms后给出警告提示
  setTimeout(() => {
    if (!started) {
      console.warn(
        formatErrorMessage(
          1,
          __DEV__ &&
            `singleSpa.start() has not been called, 5000ms after single-spa was loaded. Before start() is called, apps can be declared and loaded, but not bootstrapped or mounted.`
        )
      );
    }
  }, 5000);
}
```

## 监听路由变化

> single-spa/src/navigation/navigation-events.js

以下代码会被打包进`bundle`的全局作用域内，`bundle`被加载以后就会自动执行。*这句提示不需要的话可自动忽略*

```go
/**
 * 监听路由变化
 */
if (isInBrowser) {
  // We will trigger an app change for any routing events，监听hashchange和popstate事件
  window.addEventListener("hashchange", urlReroute);
  window.addEventListener("popstate", urlReroute);
 
  // Monkeypatch addEventListener so that we can ensure correct timing
  /**
   * 扩展原生的addEventListener和removeEventListener方法
   * 每次注册事件和事件处理函数都会将事件和处理函数保存下来，当然移除时也会做删除
   * */ 
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;
  window.addEventListener = function (eventName, fn) {
    if (typeof fn === "function") {
      if (
        // eventName只能是hashchange或popstate && 对应事件的fn注册函数没有注册
        routingEventsListeningTo.indexOf(eventName) >= 0 &&
        !find(capturedEventListeners[eventName], (listener) => listener === fn)
      ) {
        // 注册（保存）eventName 事件的处理函数
        capturedEventListeners[eventName].push(fn);
        return;
      }
    }
 
    // 原生方法
    return originalAddEventListener.apply(this, arguments);
  };
 
  window.removeEventListener = function (eventName, listenerFn) {
    if (typeof listenerFn === "function") {
      // 从captureEventListeners数组中移除eventName事件指定的事件处理函数
      if (routingEventsListeningTo.indexOf(eventName) >= 0) {
        capturedEventListeners[eventName] = capturedEventListeners[
          eventName
        ].filter((fn) => fn !== listenerFn);
        return;
      }
    }
 
    return originalRemoveEventListener.apply(this, arguments);
  };
 
  // 增强pushstate和replacestate
  window.history.pushState = patchedUpdateState(
    window.history.pushState,
    "pushState"
  );
  window.history.replaceState = patchedUpdateState(
    window.history.replaceState,
    "replaceState"
  );
 
  if (window.singleSpaNavigate) {
    console.warn(
      formatErrorMessage(
        41,
        __DEV__ &&
          "single-spa has been loaded twice on the page. This can result in unexpected behavior."
      )
    );
  } else {
    /* For convenience in `onclick` attributes, we expose a global function for navigating to
     * whatever an <a> tag's href is.
     * singleSpa暴露出来的一个全局方法，用户也可以基于它去判断子应用是运行在基座应用上还是独立运行
     */
    window.singleSpaNavigate = navigateToUrl;
  }
}
```

### patchedUpdateState

> single-spa/src/navigation/navigation-events.js

```go
/**
 * 通过装饰器模式，增强pushstate和replacestate方法，除了原生的操作历史记录，还会调用reroute
 * @param {*} updateState window.history.pushstate/replacestate
 * @param {*} methodName 'pushstate' or 'replacestate'
 */
function patchedUpdateState(updateState, methodName) {
  return function () {
    // 当前url
    const urlBefore = window.location.href;
    // pushstate或者replacestate的执行结果
    const result = updateState.apply(this, arguments);
    // pushstate或replacestate执行后的url地址
    const urlAfter = window.location.href;
 
    // 如果调用start传递了参数urlRerouteOnly为true，则这里不会触发reroute
    // https://zh-hans.single-spa.js.org/docs/api#start
    if (!urlRerouteOnly || urlBefore !== urlAfter) {
      urlReroute(createPopStateEvent(window.history.state, methodName));
    }
 
    return result;
  };
}
```

### createPopStateEvent

> single-spa/src/navigation/navigation-events.js

```go
function createPopStateEvent(state, originalMethodName) {
  // https://github.com/single-spa/single-spa/issues/224 and https://github.com/single-spa/single-spa-angular/issues/49
  // We need a popstate event even though the browser doesn't do one by default when you call replaceState, so that
  // all the applications can reroute. We explicitly identify this extraneous event by setting singleSpa=true and
  // singleSpaTrigger=<pushState|replaceState> on the event instance.
  let evt;
  try {
    evt = new PopStateEvent("popstate", { state });
  } catch (err) {
    // IE 11 compatibility https://github.com/single-spa/single-spa/issues/299
    // https://docs.microsoft.com/en-us/openspecs/ie_standards/ms-html5e/bd560f47-b349-4d2c-baa8-f1560fb489dd
    evt = document.createEvent("PopStateEvent");
    evt.initPopStateEvent("popstate", false, false, state);
  }
  evt.singleSpa = true;
  evt.singleSpaTrigger = originalMethodName;
  return evt;
}
```

### urlReroute

> single-spa/src/navigation/navigation-events.js

```go
export function setUrlRerouteOnly(val) {
  urlRerouteOnly = val;
}
 
function urlReroute() {
  reroute([], arguments);
}
```

## 小结

`single-spa`的原理其实很简单，它就是一个子应用加载器 + 状态机的结合体，而且具体怎么加载子应用还是基座应用提供的；框架里面维护了各个子应用的状态，以及在适当的时候负责更改子应用的状态、执行相应的生命周期函数



# 手写 single-spa 框架

经过上面的阅读，相信对`single-spa`已经有一定的理解了，接下来就来实现一个自己的`single-spa`，就叫`lyn-single-spa`吧。

我们好像只需要实现`registerApplication`和`start`两个方法并导出即可。

写代码之前，必须理清框架内子应用的各个状态以及状态的变更过程，为了便于理解，代码写详细的注释，希望大家看完以后都可以实现一个自己的`single-spa`

```go
// 实现子应用的注册、挂载、切换、卸载功能
 
/**
 * 子应用状态
 */
// 子应用注册以后的初始状态
const NOT_LOADED = 'NOT_LOADED'
// 表示正在加载子应用源代码
const LOADING_SOURCE_CODE = 'LOADING_SOURCE_CODE'
// 执行完 app.loadApp，即子应用加载完以后的状态
const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED'
// 正在初始化
const BOOTSTRAPPING = 'BOOTSTRAPPING'
// 执行 app.bootstrap 之后的状态，表是初始化完成，处于未挂载的状态
const NOT_MOUNTED = 'NOT_MOUNTED'
// 正在挂载
const MOUNTING = 'MOUNTING'
// 挂载完成，app.mount 执行完毕
const MOUNTED = 'MOUNTED'
const UPDATING = 'UPDATING'
// 正在卸载
const UNMOUNTING = 'UNMOUNTING'
// 以下三种状态这里没有涉及
const UNLOADING = 'UNLOADING'
const LOAD_ERROR = 'LOAD_ERROR'
const SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN'
 
// 存放所有的子应用
const apps = []
 
/**
 * 注册子应用
 * @param {*} appConfig = {
 *    name: '',
 *    app: promise function,
 *    activeWhen: location => location.pathname.startsWith(path),
 *    customProps: {}
 * }
 */
export function registerApplication (appConfig) {
  apps.push(Object.assign({}, appConfig, { status: NOT_LOADED }))
  reroute()
}
 
// 启动
let isStarted = false
export function start () {
  isStarted = true
}
 
function reroute () {
  // 三类 app
  const { appsToLoad, appsToMount, appsToUnmount } = getAppChanges()
  if (isStarted) {
    performAppChanges()
  } else {
    loadApps()
  }
 
  function loadApps () {
    appsToLoad.map(toLoad)
  }
 
  function performAppChanges () {
    // 卸载
    appsToUnmount.map(toUnmount)
    // 初始化 + 挂载
    appsToMount.map(tryToBoostrapAndMount)
  }
}
 
/**
 * 挂载应用
 * @param {*} app 
 */
async function tryToBoostrapAndMount(app) {
  if (shouldBeActive(app)) {
    // 正在初始化
    app.status = BOOTSTRAPPING
    // 初始化
    await app.bootstrap
    // 初始化完成
    app.status = NOT_MOUNTED
    // 第二次判断是为了防止中途用户切换路由
    if (shouldBeActive(app)) {
      // 正在挂载
      app.status = MOUNTING
      // 挂载
      await app.mount()
      // 挂载完成
      app.status = MOUNTED
    }
  }
}
 
/**
 * 卸载应用
 * @param {*} app 
 */
async function toUnmount (app) {
  if (app.status !== 'MOUNTED') return app
  // 更新状态为正在卸载
  app.status = MOUNTING
  // 执行卸载
  await app.unmount()
  // 卸载完成
  app.status = NOT_MOUNTED
  return app
}
 
/**
 * 加载子应用
 * @param {*} app 
 */
async function toLoad (app) {
  if (app.status !== NOT_LOADED) return app
  // 更改状态为正在加载
  app.status = LOADING_SOURCE_CODE
  // 加载 app
  const res = await app.app()
  // 加载完成
  app.status = NOT_BOOTSTRAPPED
  // 将子应用导出的生命周期函数挂载到 app 对象上
  app.bootstrap = res.bootstrap
  app.mount = res.mount
  app.unmount = res.unmount
  app.unload = res.unload
  // 加载完以后执行 reroute 尝试挂载
  reroute()
  return app
}
 
/**
 * 将所有的子应用分为三大类，待加载、待挂载、待卸载
 */
function getAppChanges () {
  const appsToLoad = [],
    appsToMount = [],
    appsToUnmount = []
  
  apps.forEach(app => {
    switch (app.status) {
      // 待加载
      case NOT_LOADED:
        appsToLoad.push(app)
        break
      // 初始化 + 挂载
      case NOT_BOOTSTRAPPED:
      case NOT_MOUNTED:
        if (shouldBeActive(app)) {
          appsToMount.push(app)
        } 
        break
      // 待卸载
      case MOUNTED:
        if (!shouldBeActive(app)) {
          appsToUnmount.push(app)
        }
        break
    }
  })
  return { appsToLoad, appsToMount, appsToUnmount }
}
 
/**
 * 应用需要激活吗 ？
 * @param {*} app 
 * return true or false
 */
function shouldBeActive (app) {
  try {
    return app.activeWhen(window.location)
  } catch (err) {
    console.error('shouldBeActive function error', err);
    return false
  }
}
 
// 让子应用判断自己是否运行在基座应用中
window.singleSpaNavigate = true
// 监听路由
window.addEventListener('hashchange', reroute)
window.history.pushState = patchedUpdateState(window.history.pushState)
window.history.replaceState = patchedUpdateState(window.history.replaceState)
/**
 * 装饰器，增强 pushState 和 replaceState 方法
 * @param {*} updateState 
 */
function patchedUpdateState (updateState) {
  return function (...args) {
    // 当前url
    const urlBefore = window.location.href;
    // pushState or replaceState 的执行结果
    const result = Reflect.apply(updateState, this, args)
    // 执行updateState之后的url
    const urlAfter = window.location.href
    if (urlBefore !== urlAfter) {
      reroute()
    }
    return result
  }
}
```

看着是不是很简单，加注释也才`200`行而已，当然，这只是一个简版的`single-spa`框架，没什么健壮性可言，但也正因为简单，所以更能说明`single-spa`框架的本质。

# single-spa-vue 源码分析

`single-spa-vue`负责为`vue`应用生成通用的生命周期钩子，这些钩子函数负责子应用的初始化、挂载、更新（数据）、卸载。

```go
import "css.escape";
 
const defaultOpts = {
  // required opts
  Vue: null,
  appOptions: null,
  template: null
};
 
/**
 * 判断参数的合法性
 * 返回生命周期函数，其中的mount方法负责实例化子应用，update方法提供了基座应用和子应用通信的机会，unmount卸载子应用，bootstrap感觉没啥用
 * @param {*} userOpts = {
 *    Vue,
 *    appOptions: {
 *      el: '#id',
 *      store,
 *      router,
 *      render: h => h(App)
 *    } 
 * }
 * return 四个生命周期函数组成的对象
 */
export default function singleSpaVue(userOpts) {
  // object
  if (typeof userOpts !== "object") {
    throw new Error(`single-spa-vue requires a configuration object`);
  }
 
  // 合并用户选项和默认选项
  const opts = {
    ...defaultOpts,
    ...userOpts
  };
 
  // Vue构造函数
  if (!opts.Vue) {
    throw Error("single-spa-vue must be passed opts.Vue");
  }
 
  // appOptions
  if (!opts.appOptions) {
    throw Error("single-spa-vue must be passed opts.appOptions");
  }
 
  // el选择器
  if (
    opts.appOptions.el &&
    typeof opts.appOptions.el !== "string" &&
    !(opts.appOptions.el instanceof HTMLElement)
  ) {
    throw Error(
      `single-spa-vue: appOptions.el must be a string CSS selector, an HTMLElement, or not provided at all. Was given ${typeof opts
        .appOptions.el}`
    );
  }
 
  // Just a shared object to store the mounted object state
  // key - name of single-spa app, since it is unique
  let mountedInstances = {};
 
  /**
   * 返回一个对象，每个属性都是一个生命周期函数
   */
  return {
    bootstrap: bootstrap.bind(null, opts, mountedInstances),
    mount: mount.bind(null, opts, mountedInstances),
    unmount: unmount.bind(null, opts, mountedInstances),
    update: update.bind(null, opts, mountedInstances)
  };
}
 
function bootstrap(opts) {
  if (opts.loadRootComponent) {
    return opts.loadRootComponent().then(root => (opts.rootComponent = root));
  } else {
    return Promise.resolve();
  }
}
 
/**
 * 做了三件事情：
 *  大篇幅的处理el元素
 *  然后是render函数
 *  实例化子应用
 */
function mount(opts, mountedInstances, props) {
  const instance = {};
  return Promise.resolve().then(() => {
    const appOptions = { ...opts.appOptions };
    // 可以通过props.domElement属性单独设置自应用的渲染DOM容器，当然appOptions.el必须为空
    if (props.domElement && !appOptions.el) {
      appOptions.el = props.domElement;
    }
 
    let domEl;
    if (appOptions.el) {
      if (typeof appOptions.el === "string") {
        // 子应用的DOM容器
        domEl = document.querySelector(appOptions.el);
        if (!domEl) {
          throw Error(
            `If appOptions.el is provided to single-spa-vue, the dom element must exist in the dom. Was provided as ${appOptions.el}`
          );
        }
      } else {
        // 处理DOM容器是元素的情况
        domEl = appOptions.el;
        if (!domEl.id) {
          // 设置元素ID
          domEl.id = `single-spa-application:${props.name}`;
        }
        appOptions.el = `#${CSS.escape(domEl.id)}`;
      }
    } else {
      // 当然如果没有id，这里会自动生成一个id
      const htmlId = `single-spa-application:${props.name}`;
      appOptions.el = `#${CSS.escape(htmlId)}`;
      domEl = document.getElementById(htmlId);
      if (!domEl) {
        domEl = document.createElement("div");
        domEl.id = htmlId;
        document.body.appendChild(domEl);
      }
    }
 
    appOptions.el = appOptions.el + " .single-spa-container";
 
    // single-spa-vue@>=2 always REPLACES the `el` instead of appending to it.
    // We want domEl to stick around and not be replaced. So we tell Vue to mount
    // into a container div inside of the main domEl
    if (!domEl.querySelector(".single-spa-container")) {
      const singleSpaContainer = document.createElement("div");
      singleSpaContainer.className = "single-spa-container";
      domEl.appendChild(singleSpaContainer);
    }
 
    instance.domEl = domEl;
 
    // render
    if (!appOptions.render && !appOptions.template && opts.rootComponent) {
      appOptions.render = h => h(opts.rootComponent);
    }
 
    // data
    if (!appOptions.data) {
      appOptions.data = {};
    }
 
    appOptions.data = { ...appOptions.data, ...props };
 
    // 实例化子应用
    instance.vueInstance = new opts.Vue(appOptions);
    if (instance.vueInstance.bind) {
      instance.vueInstance = instance.vueInstance.bind(instance.vueInstance);
    }
 
    mountedInstances[props.name] = instance;
 
    return instance.vueInstance;
  });
}
 
// 基座应用通过update生命周期函数可以更新子应用的属性
function update(opts, mountedInstances, props) {
  return Promise.resolve().then(() => {
    // 应用实例
    const instance = mountedInstances[props.name];
    // 所有的属性
    const data = {
      ...(opts.appOptions.data || {}),
      ...props
    };
    // 更新实例对象上的属性值，vm.test = 'xxx'
    for (let prop in data) {
      instance.vueInstance[prop] = data[prop];
    }
  });
}
 
// 调用$destroy钩子函数，销毁子应用
function unmount(opts, mountedInstances, props) {
  return Promise.resolve().then(() => {
    const instance = mountedInstances[props.name];
    instance.vueInstance.$destroy();
    instance.vueInstance.$el.innerHTML = "";
    delete instance.vueInstance;
 
    if (instance.domEl) {
      instance.domEl.innerHTML = "";
      delete instance.domEl;
    }
  });
}
```