## 概述

qiankun 提供了两种加载子应用的方式：

1.  **registerMicroApps + start 模式**：声明式，由 qiankun 自动管理子应用生命周期
2.  **loadMicroApp 模式**：命令式，由开发者手动控制子应用加载/卸载

本文将深入分析两种模式的技术区别、适用场景、可能遇到的问题及解决方案。

## 一、技术原理对比

### 1.1 registerMicroApps + start 模式

```text
import { registerMicroApps, start } from "qiankun";

// 注册子应用
registerMicroApps([
  {
    name: "sub-app-1",
    entry: "//localhost:3000",
    container: "#sub-app-container",
    activeRule: "/sub-app-1",
  },
]);

// 启动 qiankun
start();
```

**工作原理：**

+   `start()` 会启动 qiankun 的路由监听（基于 single-spa）
+   qiankun 监听 `popstate` 和 `hashchange` 事件
+   当 URL 匹配 `activeRule` 时，自动加载对应子应用
+   当 URL 不再匹配时，自动卸载子应用

### 1.2 loadMicroApp 模式

```text
import { loadMicroApp } from "qiankun";

// 在需要的时机手动加载
const microApp = loadMicroApp({
  name: "sub-app-1",
  entry: "//localhost:3000",
  container: "#sub-app-container",
});

// 在需要的时机手动卸载
microApp.unmount();
```

**工作原理：**

+   不需要调用 `start()`
+   开发者完全控制加载和卸载时机
+   通常配合主应用的路由组件生命周期使用

## 二、核心区别对比表

| 特性 | registerMicroApps + start | loadMicroApp |
| --- | --- | --- |
| 路由控制 | qiankun 自动控制 | 开发者手动控制 |
| 是否需要 start() | ✅ 必须调用 | ❌ 不需要 |
| 子应用容器 | 必须始终存在于 DOM | 可动态创建/销毁 |
| 主应用路由定义 | 通过 activeRule 匹配 | 不依赖路由，可在任意场景使用 |
| 多子应用同时加载 | ❌ 默认路由互斥，难以实现 | ✅ 天然支持，核心优势 |
| 生命周期控制 | 自动 | 手动 |
| 适合场景 | 简单的路由切换 | 复杂的动态加载需求 |
| 仪表盘/工作台 | ❌ 不适合 | ✅ 最佳选择 |
| 弹窗/Tab 中加载 | ❌ 不适合 | ✅ 天然支持 |

## 三、registerMicroApps + start 模式详解

### 3.1 优点

1.  **配置简单**：只需注册一次，qiankun 自动处理
2.  **开箱即用**：不需要额外的路由配置
3.  **统一管理**：所有子应用配置集中在一处

### 3.2 缺点与问题

### 问题 1：容器必须始终存在

```text
<!-- ❌ 错误：容器随路由销毁 -->
<template>
  <router-view />
</template>

<!-- 子应用页面组件 -->
<template>
  <div id="sub-app-container"></div>
</template>
```

当路由切换时，容器被销毁，qiankun 会报错：

```text
[qiankun]: Target container with #sub-app-container not existed
```

**解决方案：**

```text
<!-- ✅ 正确：容器始终存在，用 v-show 控制显示 -->
<template>
  <div>
    <!-- 主应用内容 -->
    <router-view v-show="!isSubApp" />

    <!-- 子应用容器始终存在 -->
    <div id="sub-app-1-container" v-show="currentApp === 'sub-app-1'"></div>
    <div id="sub-app-2-container" v-show="currentApp === 'sub-app-2'"></div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isSubApp = computed(() => route.path.startsWith("/sub-app"));
const currentApp = computed(() => {
  if (route.path.startsWith("/sub-app-1")) return "sub-app-1";
  if (route.path.startsWith("/sub-app-2")) return "sub-app-2";
  return "";
});
</script>
```

### 问题 2：主子应用路由冲突

当主应用和子应用都使用 `createWebHistory` 时，两个路由实例都会监听 `popstate` 事件，导致：

+   浏览器返回按钮行为异常
+   历史记录跳转混乱

**解决方案：**

+   子应用使用 `[createMemoryHistory](https://zhida.zhihu.com/search?content_id=269014470&content_type=Article&match_order=1&q=createMemoryHistory&zhida_source=entity)`（推荐）
+   或者在子应用卸载时销毁路由监听

### 3.3 完整示例

```text
// main.ts
import { createApp } from "vue";
import { registerMicroApps, start } from "qiankun";

const app = createApp(App);
app.mount("#app");

registerMicroApps([
  {
    name: "sub-app-1",
    entry: "//localhost:3000",
    container: "#sub-app-1-container",
    activeRule: "/sub-app-1",
    props: {
      /* 传递给子应用的数据 */
    },
  },
]);

start({
  sandbox: {
    experimentalStyleIsolation: true,
  },
});
```

## 四、loadMicroApp 模式详解

### 4.1 优点

1.  **灵活控制**：完全掌控加载/卸载时机
2.  **动态容器**：容器可以随组件动态创建销毁
3.  **多实例支持**：可以同时加载多个子应用实例
4.  **与主应用路由解耦**：不依赖 qiankun 的路由监听
5.  **多子应用并行加载**：这是 loadMicroApp 的核心优势，可以在同一页面同时加载多个子应用

### 4.2 核心优势：多子应用并行加载

**这是 loadMicroApp 相比 registerMicroApps + start 模式最重要的差异化能力。**

### 为什么 registerMicroApps + start 难以实现多子应用并行？

`registerMicroApps + start` 模式基于 single-spa 的路由监听机制，其设计理念是：

+   一个 URL 对应一个激活的子应用
+   当 URL 变化时，自动卸载当前子应用，加载新子应用
+   子应用之间是**路由互斥**的关系

虽然可以通过配置多个 `activeRule` 让多个子应用同时激活，但这需要：

1.  复杂的 `activeRule` 配置
2.  多个容器必须始终存在于 DOM
3.  难以实现灵活的布局控制

### loadMicroApp 如何实现多子应用并行？

```text
// 在同一个页面组件中，同时加载多个子应用
import { loadMicroApp } from "qiankun";
import { onMounted, onUnmounted } from "vue";

let microApp1 = null;
let microApp3 = null;

onMounted(() => {
  // 加载第一个子应用
  microApp1 = loadMicroApp({
    name: "sub-app-1",
    entry: "//localhost:3000",
    container: "#dashboard-app-1",
    props: { dashboardMode: true },
  });

  // 加载第二个子应用
  microApp3 = loadMicroApp({
    name: "sub-app-3",
    entry: "//localhost:3002",
    container: "#dashboard-app-3",
    props: { dashboardMode: true },
  });
});

onUnmounted(() => {
  microApp1?.unmount();
  microApp3?.unmount();
});
```

实际业务场景

| 场景 | 描述 | 实现方式 |
| --- | --- | --- |
| 运维仪表盘 | 同时展示多个监控子系统（日志、指标、告警） | 多个子应用并排显示 |
| 工作台页面 | 同时加载邮件、日历、任务等多个微应用 | 网格布局展示多个子应用 |
| 对比分析页 | 同时展示不同数据源的分析结果 | 左右对比布局 |
| 多租户管理 | 同时管理多个租户的配置 | Tab 或分栏布局 |

### 仪表盘模式的特殊处理

在仪表盘模式下，子应用需要运行在「小部件模式」：

```text
// 主应用传递 dashboardMode 标识
loadMicroApp({
  name: "sub-app-1",
  entry: "//localhost:3000",
  container: "#dashboard-app-1",
  props: {
    dashboardMode: true, // 关键标识
    // 其他通信方法...
  },
});
```

子应用根据 `dashboardMode` 调整行为：

| 功能 | 单实例模式 | 仪表盘模式 |
| --- | --- | --- |
| URL 同步 | ✅ 启用 | ❌ 禁用 |
| 跨应用导航 | ✅ 启用 | ❌ 禁用 |
| 内部路由 | ✅ 启用 | ✅ 启用 |
| 状态通信 | ✅ 启用 | ✅ 启用 |

```text
// 子应用中根据 dashboardMode 控制行为
router.afterEach((to) => {
  // 仪表盘模式下不同步 URL
  if (props.dashboardMode) return;
  props.syncRoute?.(to.path);
});
```

### 4.3 需要处理的问题

### 问题 1：需要手动管理生命周期

```text
<script setup>
import { loadMicroApp } from "qiankun";
import { onMounted, onUnmounted } from "vue";

let microApp = null;

onMounted(() => {
  microApp = loadMicroApp({
    name: "sub-app-1",
    entry: "//localhost:3000",
    container: "#sub-app-container",
  });
});

onUnmounted(() => {
  if (microApp) {
    microApp.unmount();
    microApp = null;
  }
});
</script>
```

### 问题 2：子应用路由与浏览器 URL 同步

使用 `createMemoryHistory` 后，子应用路由不会反映在浏览器地址栏。需要：

1.  主应用传递初始路径给子应用
2.  子应用内部路由变化时同步到浏览器 URL

**主应用传递初始路径：**

```text
// 从路由参数提取子路径
const subpath = route.params.subpath;
const initialPath = subpath
  ? `/${Array.isArray(subpath) ? subpath.join("/") : subpath}`
  : "/";

loadMicroApp({
  // ...
  props: {
    initialPath,
  },
});
```

**子应用处理初始路径并同步路由：**

```text
function render(props) {
  const { initialPath } = props;

  router = createRouter({
    history: window.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory("/"),
    routes,
  });

  // 注册路由同步（跳过初始路由避免覆盖 URL）
  if (window.__POWERED_BY_QIANKUN__) {
    let isInitialNavigation = true;
    router.afterEach((to) => {
      if (isInitialNavigation) {
        isInitialNavigation = false;
        return;
      }
      globalStore.syncRoute(to.path);
    });
  }

  // 如果有初始路径，先跳转再挂载
  if (window.__POWERED_BY_QIANKUN__ && initialPath && initialPath !== "/") {
    router.replace(initialPath).then(() => {
      instance.mount(container ? container.querySelector("#app") : "#app");
    });
  } else {
    instance.mount(container ? container.querySelector("#app") : "#app");
  }
}
```

### 问题 3：主应用路由配置（可选）

如果希望子应用有独立的 URL 路径（如 `/sub-app-1/about`），可以配置路由：

```text
// 主应用路由配置（可选，用于 URL 同步场景）
const routes = [
  {
    // 匹配子应用所有路径
    path: "/sub-app-1/:subpath(.*)*",
    component: () => import("@/views/SubApp1.vue"),
  },
];
```

**注意**：这不是 loadMicroApp 的必需配置。loadMicroApp 可以在任何场景使用，包括：

+   弹窗中嵌入子应用
+   Tab 页签中加载子应用
+   侧边栏小部件
+   任意 DOM 容器中

### 4.4 完整示例

```text
<!-- SubApp1.vue -->
<template>
  <div id="sub-app-1-container"></div>
</template>

<script setup>
import { loadMicroApp } from "qiankun";
import { onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { microAppConfigs } from "@/main";

const route = useRoute();
let microApp = null;

onMounted(() => {
  const subpath = route.params.subpath;
  const initialPath = subpath
    ? `/${Array.isArray(subpath) ? subpath.join("/") : subpath}`
    : "/";

  const config = microAppConfigs["sub-app-1"];
  microApp = loadMicroApp(
    {
      ...config,
      props: {
        ...config.props,
        initialPath,
      },
    },
    {
      sandbox: {
        experimentalStyleIsolation: true,
      },
    }
  );
});

onUnmounted(() => {
  microApp?.unmount();
  microApp = null;
});
</script>
```

## 五、如何选择？

### 5.1 选择 registerMicroApps + start 的场景

+   ✅ 子应用数量固定，不需要动态加载
+   ✅ 子应用之间互斥，同一时间只显示一个
+   ✅ 主应用布局简单，容器可以始终存在
+   ✅ 希望快速集成，减少代码量
+   ✅ 不需要精细控制子应用生命周期

### 5.2 选择 loadMicroApp 的场景

+   ✅ 子应用容器需要随路由动态创建/销毁
+   ✅ **需要同时加载多个子应用（仪表盘、工作台场景）**
+   ✅ 需要精细控制加载时机（如懒加载、条件加载）
+   ✅ 主应用有复杂的布局结构
+   ✅ 需要在非路由场景加载子应用（如弹窗、Tab）
+   ✅ 子应用可能被多次加载/卸载
+   ✅ **需要子应用运行在「小部件模式」（禁用 URL 同步）**

### 5.3 决策流程图

```text
开始
  │
  ▼
需要同时显示多个子应用？（仪表盘/工作台场景）
  │
  ├─ 是 → 推荐 loadMicroApp（唯一合理选择）
  │
  └─ 否 → 子应用容器能否始终存在于 DOM？
            │
            ├─ 是 → 子应用之间是否互斥？
            │         │
            │         ├─ 是 → 推荐 registerMicroApps + start
            │         │
            │         └─ 否 → 推荐 loadMicroApp
            │
            └─ 否 → 推荐 loadMicroApp
```

## 六、两种模式能否共存？

**答案：可以共存，但需要注意。**

### 6.1 共存场景

+   部分子应用使用 `registerMicroApps` 自动加载
+   部分子应用使用 `loadMicroApp` 手动加载（如弹窗中的子应用）

### 6.2 共存示例

```text
import { registerMicroApps, start, loadMicroApp } from "qiankun";

// 自动加载的子应用
registerMicroApps([
  {
    name: "main-sub-app",
    entry: "//localhost:3000",
    container: "#main-container",
    activeRule: "/main-sub-app",
  },
]);

start();

// 手动加载的子应用（如在弹窗中）
function openSubAppModal() {
  const microApp = loadMicroApp({
    name: "modal-sub-app",
    entry: "//localhost:3001",
    container: "#modal-container",
  });

  // 关闭弹窗时卸载
  onModalClose(() => microApp.unmount());
}
```

### 6.3 注意事项

1.  **避免同名子应用**：两种方式加载的子应用 name 不能重复
2.  **容器隔离**：确保容器 ID 不冲突
3.  **路由冲突**：`registerMicroApps` 的 `activeRule` 不要与 `loadMicroApp` 的触发路由重叠

## 七、我们项目的选择

### 7.1 为什么选择 loadMicroApp？

1.  **布局需求**：我们的子应用页面有独立的控制面板，容器随路由组件创建/销毁
2.  **路由控制**：需要精确控制子应用的加载时机
3.  **历史记录**：通过 `createMemoryHistory` 避免主子应用路由冲突
4.  **仪表盘场景**：需要在同一页面同时加载多个子应用（sub-app-1 和 sub-app-3）

### 7.2 仪表盘页面实现

我们实现了一个仪表盘页面（`/dashboard`），同时加载 sub-app-1 和 sub-app-3 两个子应用：

```text
<!-- DashboardView.vue -->
<template>
  <div class="dashboard">
    <h1>多子应用仪表盘</h1>

    <!-- 统一控制面板 -->
    <div class="control-panel">
      <button @click="broadcastToAll">向所有子应用发送数据</button>
    </div>

    <!-- 子应用并排显示 -->
    <div class="apps-container">
      <div class="app-wrapper">
        <h3>Sub-App-1</h3>
        <div id="dashboard-app-1"></div>
      </div>
      <div class="app-wrapper">
        <h3>Sub-App-3</h3>
        <div id="dashboard-app-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { loadMicroApp } from "qiankun";
import { onMounted, onUnmounted } from "vue";

let microApp1 = null;
let microApp3 = null;

onMounted(() => {
  // 同时加载两个子应用，传递 dashboardMode: true
  microApp1 = loadMicroApp({
    name: "sub-app-1",
    entry: "//localhost:3000",
    container: "#dashboard-app-1",
    props: {
      dashboardMode: true,
      // 其他通信方法...
    },
  });

  microApp3 = loadMicroApp({
    name: "sub-app-3",
    entry: "//localhost:3002",
    container: "#dashboard-app-3",
    props: {
      dashboardMode: true,
      // 其他通信方法...
    },
  });
});

onUnmounted(() => {
  microApp1?.unmount();
  microApp3?.unmount();
});
</script>
```

### 7.3 我们做的兼容处理

| 问题 | 解决方案 |
| --- | --- |
| 容器动态创建 | 在 Vue 组件 onMounted 中调用 loadMicroApp |
| 路由冲突 | 子应用使用 createMemoryHistory |
| 初始路径同步 | 主应用提取 subpath 参数传递给子应用 |
| 子应用内部路由同步 | 通过 syncRoute 使用 history.replaceState 更新浏览器 URL |
| 跨应用导航 | 统一通过 navigateTo 由主应用 router 处理 |
| 子应用返回按钮 | 微前端环境下使用 router.push("/") 而非 router.back() |
| 仪表盘模式 | 通过 dashboardMode: true 禁用 URL 同步和跨应用导航 |
| 多子应用状态同步 | 主应用 GlobalStore 统一管理，变化时通知所有子应用 |

## 八、总结

| 维度 | registerMicroApps + start | loadMicroApp |
| --- | --- | --- |
| 复杂度 | 低 | 中 |
| 灵活性 | 低 | 高 |
| 容器要求 | 必须始终存在 | 可动态创建 |
| 多实例 | ❌ 默认路由互斥 | ✅ 天然支持 |
| 仪表盘场景 | ❌ 不适合 | ✅ 最佳选择 |
| 适合场景 | 简单路由切换 | 复杂动态加载 |

**核心原则：**

+   简单场景用 `registerMicroApps + start`
+   复杂场景用 `loadMicroApp`
+   **需要多子应用并行加载时，必须使用** **`loadMicroApp`**
+   可以根据不同子应用的需求混合使用

**loadMicroApp 的核心优势：**

1.  **多子应用并行加载**：这是 `registerMicroApps + start` 难以实现的场景
2.  **灵活的运行模式**：通过 `dashboardMode` 等参数控制子应用行为
3.  **完全的生命周期控制**：主应用完全掌控子应用的加载和卸载时机
