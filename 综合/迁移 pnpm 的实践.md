如果从`yarn workspace`(项目基于 `lerna`，但区别其实不大)，迁移到 `pnpm workspace` 需要做的文件改动以及项目变更。大概是这样的一个流程:

- 替换掉脚本命令，与 `yarn` 相关的命令替换为: `pnpm <command>` 或者 `pnpm run <command> `
- 删除掉顶部 `package.json` 中的 `yarn workspace` 配置
- 替换掉的` workspace` 配置用 `pnpm-workspace.yaml` 文件替代
- 调整 `pipeline`、以及 `Dockfile` 或者其他 `CI/CD` 配置文件里面的依赖安装命令
- 删除掉 `yarn.lock` 文件(这里也可以使用笔者开发完善的 `pnpm import` 命令来完成 `yarn.lock` 文件转换 /笑 )
- 调整构建相关的脚本(如果有 `lerna` 相关的 `build` 脚本)
- 添加一个 `.npmrc` 文件用于自定义一些 `pnpm` 的 `CLI` 行为表现(也可以不用)

