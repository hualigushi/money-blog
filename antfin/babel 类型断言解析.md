
### 使用 as 断言
```js
const parser = require('@babel/parser');


const sourceCode = `
interface State {
  sex: string;
  hair: string;
}

interface People<State> {
  name: string;
  state: State;
}

export default {
  name: 'Anne',
  state: { sex:'man',hair: 'red' }
} as People<State>;
`
const options = {
    sourceType: "module",
    allowImportExportEverywhere: false,
    allowReturnOutsideFunction: false,
    createParenthesizedExpressions: false,
    ranges: false,
    tokens: false,
    plugins: [
      ["decorators", { decoratorsBeforeExport: false }], // @a class A {},
      'nullishCoalescingOperator', // a ?? b 
      "exportDefaultFrom", // export v from "mod"
      'classStaticBlock', // class A { static {} }
      'optionalChaining', // a?.b
      'objectRestSpread', // var a = { b, ...c };
      'throwExpressions', // () => throw new Error("")
      'importAssertions', // import json from "./foo.json" assert { type: "json" };
      'classProperties', // class A { b = 1; }
      'asyncGenerators', // async function*() {}, for await (let a of b) {}
      'dynamicImport', // import('./guy').then(a)
      "typescript", // var a: string = "";
      "jsx", // <b>{s}</b>
    ],
  };
const res = parser.parse(sourceCode, options);
console.log(res)
```

### 没有使用断言，jsx配置需去掉
```js
const parser = require('@babel/parser');


const sourceCode = `
interface State {
  sex: string;
  hair: string;
}

interface People<State> {
  name: string;
  state: State;
}

export default <People<State>>{
  name: 'Anne',
  state: { sex:'man',hair: 'red' }
};
`
const options = {
    sourceType: "module",
    allowImportExportEverywhere: false,
    allowReturnOutsideFunction: false,
    createParenthesizedExpressions: false,
    ranges: false,
    tokens: false,
    plugins: [
      ["decorators", { decoratorsBeforeExport: false }], // @a class A {},
      'nullishCoalescingOperator', // a ?? b 
      "exportDefaultFrom", // export v from "mod"
      'classStaticBlock', // class A { static {} }
      'optionalChaining', // a?.b
      'objectRestSpread', // var a = { b, ...c };
      'throwExpressions', // () => throw new Error("")
      'importAssertions', // import json from "./foo.json" assert { type: "json" };
      'classProperties', // class A { b = 1; }
      'asyncGenerators', // async function*() {}, for await (let a of b) {}
      'dynamicImport', // import('./guy').then(a)
      "typescript", // var a: string = "";
    ],
  };
const res = parser.parse(sourceCode, options);
console.log(res)
```
