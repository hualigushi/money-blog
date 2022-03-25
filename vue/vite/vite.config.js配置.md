```

/**
 * https://vitejs.dev/config/
 * @type {import('vite').UserConfig}
 */
export default {
    //项目根目录 
    root: process.cwd(),
    //项目部署的基础路径
    base: "/",
    //环境配置
    mode: 'development',
    //全局变量替换 Record<string, string>
    define: {
        "": "",
        "user": "users",
    },
    //插件
    plugins: [

    ],
    //静态资源服务的文件夹
    publicDir: "public",

    resolve: {
        //别名
        alias: {
            "@": path.resolve(__dirname, "/src"),
            "comps": path.resolve(__dirname, "/src/components")
        },
        dedupe: [],
        //情景导出package.json配置中的exports 字段
        conditions: [],
        //解析package.json中的字段
        mainFields: ['module', 'jsnext:main', 'jsnext'],
        //导入时想要省略的扩展名列表
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    css: {
        //配置 CSS modules 的行为。选项将被传递给 postcss-modules。
        modules: {

        },
        // PostCSS 配置（格式同 postcss.config.js）
        // postcss-load-config 的插件配置
        postcss: {

        },
        //指定传递给 CSS 预处理器的选项
        preprocessorOptions: {
            scss: {
                additionalData: `$injectedColor: orange;`
            }
        }
    },
    json: {
        //是否支持从 .json 文件中进行按名导入
        namedExports: true,
        //若设置为 true，导入的 JSON 会被转换为 export default JSON.parse("...") 会比转译成对象字面量性能更好，
        //尤其是当 JSON 文件较大的时候。
        //开启此项，则会禁用按名导入
        stringify: false
    },
    //继承自 esbuild 转换选项。最常见的用例是自定义 JSX
    esbuild: {
        jsxFactory: 'h',
        jsxFragment: 'Fragment',
        jsxInject: `import React from 'react'`
    },
    //静态资源处理  字符串|正则表达式
    assetsInclude: '',
    //调整控制台输出的级别 'info' | 'warn' | 'error' | 'silent'
    logLevel: 'info',
    //设为 false 可以避免 Vite 清屏而错过在终端中打印某些关键信息
    clearScreen: true,
    //服务
    server: {
        //服务器主机名
        host: "",
        //端口号
        port: "",
        //设为 true 时若端口已被占用则会直接退出，
        //而不是尝试下一个可用端口
        strictPort: true,
        //https.createServer()配置项
        https: "",
        //服务器启动时自动在浏览器中打开应用程序。
        //当此值为字符串时，会被用作 URL 的路径名
        open: '/docs/index.html',
        //自定义代理规则
        proxy: {
            // 字符串简写写法
            '/foo': 'http://localhost:4567/foo',
            // 选项写法
            '/api': {
                target: 'http://jsonplaceholder.typicode.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            },
            // 正则表达式写法
            '^/fallback/.*': {
                target: 'http://jsonplaceholder.typicode.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/fallback/, '')
            }
        },
        //开发服务器配置 CORS   
        //boolean | CorsOptions
        cors: {

        },
        //设置为 true 强制使依赖预构建
        force: true,
        //禁用或配置 HMR 连接
        hmr: {

        },
        //传递给 chokidar 的文件系统监视器选项
        watch: {

        }
    },
    //构建
    build: {
        //浏览器兼容性  "esnext"|"modules"
        target: "modules",
        //输出路径
        outDir: "dist",
        //生成静态资源的存放路径
        assetsDir: "assets",
        //小于此阈值的导入或引用资源将内联为 base64 编码，以避免额外的 http 请求。设置为 0 可以完全禁用此项
        assetsInlineLimit: 4096,
        //启用/禁用 CSS 代码拆分
        cssCodeSplit: true,
        //构建后是否生成 source map 文件
        sourcemap: false,
        //自定义底层的 Rollup 打包配置
        rollupOptions: {

        },
        //@rollup/plugin-commonjs 插件的选项
        commonjsOptions: {

        },
        //构建的库
        lib: {

        },
        //当设置为 true，构建后将会生成 manifest.json 文件
        manifest: false,
        //设置为 false 可以禁用最小化混淆，
        //或是用来指定使用哪种混淆器
        //boolean | 'terser' | 'esbuild'
        minify: "terser",
        //传递给 Terser 的更多 minify 选项。
        terserOptions: {

        },
        //设置为 false 来禁用将构建后的文件写入磁盘
        write: true,
        //默认情况下，若 outDir 在 root 目录下，则 Vite 会在构建时清空该目录。
        emptyOutDir: true,
        //启用/禁用 brotli 压缩大小报告
        brotliSize: true,
        //chunk 大小警告的限制
        chunkSizeWarningLimit: 500
    },
    //依赖优化选项
    optimizeDeps: {
        //检测需要预构建的依赖项
        entries: [

        ],
        //预构建中强制排除的依赖项
        exclude: [

        ],
        //默认情况下，不在 node_modules 中的，链接的包不会被预构建。使用此选项可强制预构建链接的包。
        include: [

        ]
    },
    //SSR 选项
    ssr: {
        //列出的是要为 SSR 强制外部化的依赖
        external: [

        ],
        //列出的是防止被 SSR 外部化依赖项。
        noExternal: [

        ]
    }
}

```js
