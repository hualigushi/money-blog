## eslint-webpack-plugin代替

```js
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  // ...
  plugins: [new ESLintPlugin(options)],
  // ...
};
```

`eslint-webpack-plugin` 的 `options` 和 `eslint-loader` 基本一致，包括我们常常配合 `eslint-loader` 友好的显示错误的 `formatter`，`eslint-friendly-formatter`等。

