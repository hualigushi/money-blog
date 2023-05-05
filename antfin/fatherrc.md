```
export default {
  target: 'browser',
  entry: 'src/index.ts',
  esm: 'babel',
  cjs: 'babel',
  runtimeHelpers: true,
  extraBabelPlugins: [
    ['babel-plugin-import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
    }]
  ],
  autoprefixer: {
    browsers: ['ie>9', 'Safari >= 6'],
  },
  doc: {
    themeConfig: { mode: 'light' },
    base: '/',
    menu: []
  },
};
```


```
export default {
  target: 'browser',
  esm: 'babel',
  lessInBabelMode: true, // babel 模式下做 less 编译
  entry: ['src/Button/index.tsx', 'src/Dialog/index.tsx'],
  autoprefixer: {
    browsers: ['ie>9', 'Safari >= 6'],
  },
  pkgs: [
    // 组件依赖构建顺序， 例如 a组件依赖于b组件，那么需要先编译 b,在编译a,则 这里可以控制组件编译顺序
  ],
};
```
