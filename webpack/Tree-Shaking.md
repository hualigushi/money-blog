[TOC]

# Tree-shaking的原理

ES6 module 特点：
- 只能作为模块顶层的语句出现
- import 的模块名只能是字符串常量
- import binding 是 immutable的

ES6模块依赖关系是确定的，和运行时的状态无关，可以进行可靠的静态分析，这就是tree-shaking的基础。

所谓静态分析就是不执行代码，从字面量上对代码进行分析，ES6之前的模块化，比如我们可以动态require一个模块，只有执行后才知道引用的什么模块，这个就不能通过静态分析去做优化。



# Tree-shaking 实现流程

- rollup 中的 tree-shaking 使用 acorn 实现 AST 抽象语法树的遍历解析，acorn 和 babel 功能相同，但 acorn 更加轻量，在此之前 AST 工作流也是必须要了解的；
- rollup 使用 magic-string 工具操作字符串和生成 source-map。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/86918b66717d47c8b99cf5d2631d8be2~tplv-k3u1fbpfcp-zoom-1.image)

具体流程：
- rollup()阶段，解析源码，生成 AST tree，对 AST tree 上的每个节点进行遍历，判断出是否 include(标记避免重复打包)，是的话标记，然后生成 chunks，最后导出。
- generate()/write()阶段，根据 rollup()阶段做的标记，进行代码收集，最后生成真正用到的代码。

# Tree-shaking -- rollup VS Webpack

- rollup 是在编译打包过程中分析程序流，得益于于 ES6 静态模块（exports 和 imports 不能在运行时修改），我们在打包时就可以确定哪些代码时我们需要的。

- webpack 本身在打包时只能标记未使用的代码而不移除，而识别代码未使用标记并完成 tree-shaking 的 其实是 UglifyJS、babili、terser 这类压缩代码的工具。
  简单来说，就是压缩工具读取 webpack 打包结果，在压缩之前移除 bundle 中未使用的代码

# Webpack 的 Tree-shaking 流程

## Webpack 标记代码
总的来说，webpack 对代码进行标记，主要是对 import & export 语句标记为 3 类：

- 所有 import 标记为 `/* harmony import */`
- 所有被使用过的 export 标记为`/* harmony export ([type]) */`，其中` [type]` 和 webpack 内部有关，可能是 binding, immutable 等等
- 没被使用过的 export 标记为`/* unused harmony export [FuncName] */`，其中 `[FuncName]` 为 export 的方法名称

首先我们要知道，为了正常运行业务项目，Webpack 需要将开发者编写的业务代码以及支撑、调配这些业务代码的运行时一并打包到产物(bundle)中。

落到 Webpack 源码实现上，运行时的生成逻辑可以划分为打包阶段中的两个步骤：

- 依赖收集：遍历代码模块并收集模块的特性依赖，从而确定整个项目对 Webpack runtime 的依赖列表；
- 生成：合并 runtime 的依赖列表，打包到最终输出的 bundle。

显然，对代码的语句标记就发生在依赖收集的过程中。

在运行时环境标记所有 import：
```javascript
const exportsType = module.getExportsType(
	chunkGraph.moduleGraph,
	originModule.buildMeta.strictHarmonyModule
);
runtimeRequirements.add(RuntimeGlobals.require);
const importContent = `/* harmony import */ ${optDeclaration}${importVar} = __webpack_require__(${moduleId});\n`;

// 动态导入语法分析
if (exportsType === "dynamic") {
	runtimeRequirements.add(RuntimeGlobals.compatGetDefaultExport);
	return [
		importContent, // 标记/* harmony import */
		`/* harmony import */ ${optDeclaration}${importVar}_default = /*#__PURE__*/${RuntimeGlobals.compatGetDefaultExport}(${importVar});\n` // 通过 /*#__PURE__*/ 注释可以告诉 webpack 一个函数调用是无副作用的
	]; // 返回 import 语句和 compat 语句
}
```

在运行时环境标记所有被使用过的和未被使用的 export：
```js
	// 在运行时状态定义 property getters
  generate() {
		const { runtimeTemplate } = this.compilation;
		const fn = RuntimeGlobals.definePropertyGetters;
		return Template.asString([
			"// define getter functions for harmony exports",
			`${fn} = ${runtimeTemplate.basicFunction("exports, definition", [
				`for(var key in definition) {`,
				Template.indent([
					`if(${RuntimeGlobals.hasOwnProperty}(definition, key) && !${RuntimeGlobals.hasOwnProperty}(exports, key)) {`,
					Template.indent([
						"Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });"
					]),
					"}"
				]),
				"}"
			])};`
		]);
	}
  
  // 输入为 generate 上下文
  getContent({ runtimeTemplate, runtimeRequirements }) {
		runtimeRequirements.add(RuntimeGlobals.exports);
		runtimeRequirements.add(RuntimeGlobals.definePropertyGetters);

		const unusedPart =
			this.unusedExports.size > 1
				? `/* unused harmony exports ${joinIterableWithComma(
						this.unusedExports
				  )} */\n`
				: this.unusedExports.size > 0
				? `/* unused harmony export ${first(this.unusedExports)} */\n`
				: "";
		const definitions = [];
		for (const [key, value] of this.exportMap) {
			definitions.push(
				`\n/* harmony export */   ${JSON.stringify(
					key
				)}: ${runtimeTemplate.returningFunction(value)}`
			);
		}
		const definePart =
			this.exportMap.size > 0
				? `/* harmony export */ ${RuntimeGlobals.definePropertyGetters}(${
						this.exportsArgument
				  }, {${definitions.join(",")}\n/* harmony export */ });\n`
				: "";
		return `${definePart}${unusedPart}`; // 作为初始化代码包含的源代码
	}
}
```

