node:用于引用 node 内置模块，可选

Support for node: imports  #

Supported in Node.js starting:

v16.0.0, v14.18.0 (ESM import and CommonJS require())

v14.13.1, v12.20.0 (only ESM import)

Supported in TypeScript by the latest versions of @types/node.

```
plugins: [
  new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
    const mod = resource.request.replace(/^node:/, "");

    switch (mod) {
      case "path":
        resource.request = "path-browserify";
        break;
      default:
        throw new Error(`Not found ${mod}`);
      }
  }),
]
```
