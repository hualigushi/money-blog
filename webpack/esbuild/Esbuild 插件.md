[TOC]



## 1 认识 Esbuild 插件基础

在 Esbuild 中，插件被设计为一个函数，该函数需要返回一个对象（`Object`），对象中包含 `name` 和 `setup` 等 2 个属性：

```javascript
const myPlugin = options => {
  return {
    name: "my",
    setup(build) {
      // ....
    }
  }
}
```

其中，`name` 的值是一个字符串，它表示你的插件名称 。

 `setup` 的值是一个函数，它会被传入一个参数 `build`（对象）。

`build` 对象上会暴露整个构建过程中**非常重要**的 2 个函数：`onResolve` 和 `onLoad`，它们都需要传入 Options（选项）和 CallBack（回调）等 2 个参数。

其中，Options 是一个对象，它包含 `filter`（必须）和 `namespace` 等 2 个属性:

```typescript
interface OnResolveOptions {
  filter: RegExp;
  namespace?: string;
}
```

而 CallBack 是一个函数，即回调函数。插件实现的关键则是在 `onResolve` 和 `onLoad` 中定义的回调函数内部做一些特殊的处理。

那么，接下来我们先来认识一下 Options 的 2 个属性：`namespace` 和 `filter`（划重点，它们**非常重要** 😲）

### 1.1 namespace

默认情况下，Esbuild 是在文件系统上的文件（File Modules）相对应的 `namespace` 中运行的，即此时 `namespace` 的值为 `file`。

Esbuild 的插件可以创建 Virtual Modules，而 Virtual Modules 则会使用 `namespace` 来和 File Modules 做区分。

> 注意，每个 `namespace` 都是特定于该插件的。

并且，这个时候，我想可能有同学会问：什么是 Virtual Modules 😲？

简单地理解，Virtual Modules 是指在文件系统中不存在的模块，往往需要我们构造出 Virtual Modules 对应的模块内容。

### 1.2 filter

`filter` 作为 Options 上必须的属性，它的值是一个正则。它主要用于匹配指定规则的导入（`import`）路径的模块，避免执行不需要的回调，从而提高整体打包性能。

那么，在认识完 `namespace` 和 `filter` 后。下面我们来分别认识一下 `onResolve` 和 `onLoad` 中的回调函数。

### 1.3 onResolve 的回调函数

`onResolve` 函数的回调函数会在 Esbuild 构建每个模块的导入路径（可匹配的）时执行。

`onResolve` 函数的回调函数需要返回一个对象，其中会包含 `path`、`namespace`、`external` 等属性。

通常，该回调函数会用于自定义 Esbuild 处理 `path` 的方式，例如：

- 重写原本的路径，例如重定向到其他路径
- 将该路径所对应的模块标记为 `external`，即不会对改文件进行构建操作（原样输出）



使用 onResolve 添加的回调将在 esbuild 生成的每个模块中的每个导入路径上运行。回调可以自定义 esbuild 的路径解析方式。例如，它可以拦截导入路径并将其重定向到其他地方。它还可以将路径标记为外部路径。

用于解析 import 时调用，可以在这里给改变一个 元信息，方便后续的再处理

默认的导出是 file ，也就是 namespace: file

如果是 file 的话，那么 esbuild 会有一个自己处理 file 的逻辑，

拟人一点的话，就是说，给文件分不同的类型，如果是 file 的话，就要送去 file 的处理场了

path: 改变 path 会显示什么呢？

```js
// onResolve 回调函数第一个参数返回的结果

 build.onResolve({ filter: /^env$/ }, (args) => {
      console.log(args);
      return {
        path: args.path,
        namespace: "env-ns",
      };
 });


// result
{
  path: 'env',
  importer: '/Users/cuixiaorui/Code/learn-esbuild/plugin/app.js',
  namespace: 'file',
  resolveDir: '/Users/cuixiaorui/Code/learn-esbuild/plugin',
  kind: 'import-statement',
  pluginData: undefined
}
```



### 1.4 onLoad 的回调函数

`onLoad` 函数的回调函数会在 Esbuild 解析模块之前调用，主要是用于**处理并返回模块的内容**，并告知 Esbuild 要如何解析它们。

并且，需要注意的是 `onLoad` 的回调函数不会处理被标记为 `external` 的模块。

`onLoad` 函数的回调函数需要返回一个对象，该对象总共有 9 个属性。这里我们来认识一下较为常见 3 个属性：

- `contents` 处理过的模块内容
- `loader` 告知 Esbuild 要如何解释该内容（默认为 `js`)。例如，返回的模块内容是 CSS，则声明 `loader` 为 `css`
- `resolveDir` 是在将导入路径解析为文件系统上实际路径时，要使用的文件系统目录



### 1.5 onStart

注册一个开始回调，以便在新生成启动时得到通知。这个触发器适用于所有构建，而不仅仅是初始构建，因此对于增量构建、观察模式和服务 API 尤其有用。

```js
let examplePlugin = {
  name: "example",
  setup(build) {
    build.onStart(() => {
      console.log("build started");
    });
  },
};
```

注意，不应该在开始回调中做初始化的逻辑，因为他会在好几种情况下都进行调用。

初始化逻辑直接写在 setup 中就可以了

### 1.6 onEnd  

注册新生成结束时要通知的结束回调。这个触发器适用于所有构建，而不仅仅是初始构建，因此对于增量构建、观察模式和服务 API 尤其有用。

end 有两种情况

1. 正常结束，构建完成
2. 报错了。不正常退出。那么就需要对 error 做进一步处理了，比如说可以把 error 信息收集起来



## 2 动手实现一个 Esbuild 插件

这里我们来实现一个删除代码中 `console` 语句的 esbuild 插件。因为，这个过程需要识别和删除 `console` 对应的 AST 节点。所以，需要使用 `babel` 提供的 3 个工具包：

- `@babel/parser` 的 `parse` 函数解析代码生成 AST（抽象语法树）
- `@babel/traverse` 遍历 AST，访问需要进行操作的 AST 节点
- `@babel/core` 的 `transformFromAst` 函数将 AST 转化为代码

那么，首先是创建整个插件的整体结构，如插件名称、`setup` 函数：

```javascript
module.exports = options => {
  return {
    name: "auto-delete-console",
    setup(build) {
    }
  }
}
```

其次，由于我们这个插件主要是对代码内容进行操作。所以，需要使用 `onLoad` 函数，并且要声明 `filter` 为 `/\.js$/`，即只匹配 JavaScript 文件：

```javascript
module.exports = options => {
  return {
    name: "auto-delete-console",
    setup(build) {
      build.onLoad({ filter: /\.js$/ }, (args) => {
      }
    }
  }
}
```

而在 `onLoad` 函数的回调函数中，我们需要做这 4 件事：

**1.获取文件内容**

`onLoad` 函数的回调函数会传入一个参数 `args`，它会包含此时模块的文件路径，即 `args.path`。

所以，这里我们使用 `fs.promises.readFile` 函数来读取该模块的内容：

```javascript
build.onLoad({ filter: /\.js$/ }, async (args) => {
  const source = await fs.promises.readFile(args.path, "utf8")
}
```

**2.转化代码生成 AST**

因为，之后我们需要找到并删除 `console` 对应的 AST 节点。所以，需要使用 `@babel/parser` 的 `parse` 函数将模块的内容（代码）转为 AST：

```javascript
build.onLoad({ filter: /\.js$/ }, async (args) => {
  const ast = parser.parse(source)
}
```

**3.遍历 AST 节点，删除 console 对应的 AST 节点**

接着，我们需要使用 `@babel/traverse` 来遍历 AST 来找到 `console` 的 AST 节点。但是，需要注意的是我们并不能直接就可以找到 `console` 的 AST 节点。因为，`console` 属于普通的函数调用，并没有像 `await` 一样有特殊的 AST 节点类型（`AwaitExpression`）。

不过，我们可以先使用 `CallExpression` 来直接访问函数调用的 AST 节点。然后，判断 AST 节点的 `callee.object.name` 是否等于 `console`，是则调用 `path.remove` 函数删除该 AST 节点：

```javascript
build.onLoad({ filter: /\.js$/ }, async (args) => {
  traverse(ast, {
    CallExpression(path) {
      //...
      const memberExpression = path.node.callee
      if (memberExpression.object && memberExpression.object.name === 'console') {
        path.remove()
      }
    }
  })
}
```

**4.转化 AST 生成代码**

最后，我们需要使用 `@babel/core` 的 `transformFromAst` 函数将处理过的 AST 转为代码并返回：

```javascript
build.onLoad({ filter: /\.js$/ }, async (args) => {
  //...
  const { code } = core.transformFromAst(ast)
  return {
    contents: code,
    loader: "js"
  }
}
```

那么，到这里我们就完成了一个删除代码中 `console` 语句的 esbuild 插件，用一句话概括这个过程：“没有比这更简单的了 😃”。

整个插件实现的全部代码如下：

```javascript
const parser = require("@babel/parser")
const traverse = require("@babel/traverse").default
const core = require("@babel/core")
const esbuild = require("esbuild")
const fs = require("fs")

module.exports = options => {
  return {
    name: "auto-delete-console",
    setup(build) {
      build.onLoad({ filter: /\.js$/ }, async (args) => {
        const source = await fs.promises.readFile(args.path, "utf8")
        const ast = parser.parse(source)

        traverse(ast, {
          CallExpression(path) {
            const memberExpression = path.node.callee
            if (memberExpression.object && memberExpression.object.name === 'console') {
              path.remove()
            }
          }
        })

        const { code } = core.transformFromAst(ast)
        return {
          contents: code,
          loader: "js"
        }
      }
    }
  }
}
```



其他demo https://github.com/cuixiaorui/teach-esbuild-plugin/