# TrendRadar 前端架构基准规范与开发实施计划（V1.0 终版规范）

> 📌 **架构权威声明（Architecture Baseline）**  
> 本文档是 **TrendRadar 前端工程的长期基准架构与开发规范**。后续所有新增页面、业务模块演进、二次开发及维护，**必须无条件严格遵循本规范**，不得随意更改核心选型、目录结构与代码组织模式。

---

## 一、 前端工程目录结构 (`frontend/`) 与技术体系

### 1. 核心技术栈选型（强制标准）
* **核心框架**：`React 18` + `TypeScript` + `Vite`
* **路由系统**：`react-router-dom`（基于 `meta.ts` 自动扫描驱动）
* **全局状态管理**：**`Zustand`**（配合 `zustand/middleware` 的 `persist` 实现响应式状态与本地持久化）
* **UI 与样式**：**`Tailwind CSS` + `shadcn/ui` + `Lucide React`**（🚨 **严禁引入/使用 Ant Design**）
* **视觉基调**：**高级黑白灰（Monochrome / Zinc）极简极客质感**

### 2. 完整工程目录结构
```text
frontend/
├── public/                      # 静态资源与 favicon
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 黑白灰色系原子组件 (Button, Card, Dialog, Switch, Tabs, Input, Select, Badge, Toast 等)
│   │   └── Layout/              # 布局组件 (HomeNavbar 前台导航, AdminLayout 侧边栏/面包屑/顶栏, ThemeToggle)
│   ├── pages/                   # 页面模块 (每个模块内聚 index.tsx + meta.ts + 子组件)
│   │   ├── Home/                # [前台主页面] (热搜大屏、多平台信息流)
│   │   │   ├── index.tsx
│   │   │   └── meta.ts          # layout: 'home', path: '/'
│   │   └── Admin/               # [后台管理页面]
│   │       ├── Dashboard/       # 控制台概览
│   │       │   ├── index.tsx
│   │       │   └── meta.ts
│   │       ├── Config/          # AI Key 与 Webhook 配置
│   │       │   ├── index.tsx
│   │       │   └── meta.ts
│   │       ├── Feeds/           # 平台与 RSS 订阅管理 (含详情页)
│   │       │   ├── index.tsx    # 列表页
│   │       │   ├── Detail/      # 详情页子组件 (平级内聚)
│   │       │   │   └── index.tsx
│   │       │   └── meta.ts      # 主 meta，children 挂载详情与子路由
│   │       └── Keywords/        # 关键词分类标签管理
│   │           ├── index.tsx
│   │           └── meta.ts
│   ├── router/                  # 自动化路由与菜单核心
│   │   ├── autoRoutes.ts        # 自动解析 pages/**/meta.ts 生成路由表与菜单树
│   │   └── index.tsx            # react-router-dom 根 Provider
│   ├── stores/                  # [全局状态管理 - Zustand]
│   │   ├── useConfigStore.ts    # AI Key、Webhook、运行模式等全局配置与 LocalStorage 持久化
│   │   ├── useFeedsStore.ts     # 11 平台启停状态、RSS 源列表增删改
│   │   └── useKeywordsStore.ts  # 关键词分类 Tag 状态
│   ├── mock/                    # 初始配置与 Mock 数据源
│   ├── types/                   # TypeScript 类型定义 (route.ts, config.ts, feeds.ts)
│   ├── index.css                # Tailwind CSS 变量与黑白灰设计系统令牌
│   ├── App.tsx                  # 根组件
│   └── main.tsx
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 二、 `meta.ts` 树形路由规范与 Icon 规范

每个页面模块根目录下必须维护一个 `meta.ts`，导出标准的 `RouteMeta` 对象：

### 1. `RouteMeta` 类型定义
```typescript
// types/route.ts
import React from 'react';

/**
 * 路由图标类型定义：
 * 1. 支持直接传入 React 图标组件 (如: icon: LayoutDashboard)
 * 2. 支持传入字符串名称 (必须为 lucide-react 导出的图标名称，如: 'LayoutDashboard', 'Rss', 'Settings')
 */
export type RouteIcon = React.ComponentType<{ className?: string }> | string;

export interface RouteMeta {
  title: string;                     // 菜单名称 / 页面标题 (用于菜单、标签页与面包屑)
  path: string;                      // 路由路径 (如 '/admin/feeds' 或相对子路径 ':id', 'edit/:id')
  order?: number;                    // 菜单排序权重 (数字越小越靠前)
  icon?: RouteIcon;                  // 图标定义 (React 组件 或 lucide-react 图标字符串名)
  hideInMenu?: boolean;              // 是否在侧边栏菜单中隐藏 (详情页/编辑页设为 true)
  layout?: 'home' | 'admin' | 'none';// 所属布局 (默认 'admin')
  badge?: string | number;           // 菜单右侧徽标提示 (可选，如 'NEW', 11)
  component?: React.ComponentType;   // 当前节点绑定的页面组件
  children?: RouteMeta[];            // 递归子路由列表 (支持多层级嵌套与详情页)
}
```

### 2. Icon 图标使用说明（重要）
* **方式 1（直接传入 React 图标组件，推荐）**：
  直接从 `lucide-react` 导入组件并传递，如 `import { LayoutDashboard } from 'lucide-react'; icon: LayoutDashboard`。
* **方式 2（传入字符串名称）**：
  若使用 `string` 类型，**数据源必须严格对应 `lucide-react` 官方导出的图标名称**（采用 PascalCase 大驼峰命名，例如 `'LayoutDashboard'`, `'Rss'`, `'Settings'`, `'Tag'`, `'Terminal'`, `'Sliders'`）。路由渲染引擎会自动从 `lucide-react` 图标池中动态映射加载，若未匹配到则安全降级显示通用方块图标。

---

## 三、 `meta.ts` 编写示范与工程模式

### 1. 使用 React 组件作为 Icon 示范（如 Dashboard 概览）
```typescript
// src/pages/Admin/Dashboard/meta.ts
import { RouteMeta } from '@/types/route';
import { LayoutDashboard } from 'lucide-react';
import DashboardPage from './index';

const meta: RouteMeta = {
  title: '控制台概览',
  path: '/admin/dashboard',
  order: 1,
  icon: LayoutDashboard,             // 方式 1: 直接传入 React 图标组件
  hideInMenu: false,
  layout: 'admin',
  component: DashboardPage,
};

export default meta;
```

### 2. 使用 String 字符串作为 Icon 示范（如 Feeds 订阅管理）
```typescript
// src/pages/Admin/Feeds/meta.ts
import { RouteMeta } from '@/types/route';
import FeedsListPage from './index';
import FeedDetail from './Detail';     // 平级详情组件
import FeedEdit from './Edit';         // 平级编辑组件

const meta: RouteMeta = {
  title: '平台与订阅管理',
  path: '/admin/feeds',
  order: 3,
  icon: 'Rss',                       // 方式 2: 传入 lucide-react 字符串名称
  hideInMenu: false,
  layout: 'admin',
  badge: 11,
  component: FeedsListPage,
  // 在 children 中自由嵌套任意子路由与详情页
  children: [
    {
      path: ':id',                     // 最终生成路由 /admin/feeds/:id
      title: '订阅源详情',
      hideInMenu: true,                // 不在侧边栏单独显示
      component: FeedDetail,
    },
    {
      path: 'edit/:id',                // 最终生成路由 /admin/feeds/edit/:id
      title: '编辑订阅源',
      hideInMenu: true,
      component: FeedEdit,
    },
  ],
};

export default meta;
```

---

## 四、 全局状态管理规范 (`Zustand`)

采用 **Zustand** 作为唯一全局状态管理方案，遵循以下准则：
1. **单一职责 Store**：按业务模块拆分 Store（如 `useConfigStore`, `useFeedsStore`, `useKeywordsStore`），存放在 `src/stores/`；
2. **持久化中间件**：需要持久化存储的数据（如用户填写的 Key、平台开关、自定义 RSS 源）统一使用 `persist` 中间件自动同步到 `localStorage`；
3. **强类型定义**：每个 Store 必须提供完整的 State 与 Actions TypeScript 接口定义。

---

## 五、 自动化路由与菜单引擎工作流

```
[ 扫描各模块 pages/**/meta.ts ] (Vite import.meta.glob)
                   │
                   ▼
       ┌───────────────────────────────┐
       │   自动化路由引擎 (RouterEngine)  │
       └───────────────┬───────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
【平铺生成 react-router 路由表】     【树形过滤生成 Sidebar 菜单】
 • 递归提取所有主路径与 children 路径  • 递归过滤 hideInMenu === true 的子节点
 • 自动拼接绝对路径 (/admin/feeds/:id)• 按 order 升序严谨排序
 • 绑定对应 component 组件            • 动态解析 Icon（支持 React 组件与 lucide-react 字符串名）
                                      • 当处于详情页时自动高亮所属父级菜单
                                      • 根据嵌套路径自动生成多级面包屑
```

---

## 六、 开发推进步骤与计划

- ✅ **第 1 步：初始化工程与依赖安装**
  - 创建 `frontend/`，安装 React 18, Vite, TypeScript, `react-router-dom`, `zustand`, `lucide-react`, `tailwind-merge`, `clsx`。
- ✅ **第 2 步：配置 Tailwind CSS 与黑白灰设计系统 (Zinc 体系)**
  - 配置 `tailwind.config.js`、`components.json`，集成 `shadcn/ui` 原子组件。
- ✅ **第 3 步：实现 Zustand 全局状态层 (`stores/`)**
  - 构建 `useConfigStore`, `useFeedsStore`, `useKeywordsStore` 并配置 LocalStorage 持久化。
- ✅ **第 4 步：编写 `meta.ts` 递归路由与菜单扫描引擎 (`router/autoRoutes.ts`)**
  - 自动递归展开 `children` 路由列表；
  - 兼容解析 React 组件 Icon 与 `lucide-react` 字符串 Icon，生成路由表与菜单树。
- ✅ **第 5 步：开发双层布局组件 (HomeNavbar & AdminLayout)**
  - 侧边栏自动绑定路由引擎输出的菜单树，支持展开/收起、高亮联动与深浅主题切换。
- ✅ **第 6 步：开发前台主页面 (`/` - HomePortal)**
  - 实现热搜大屏、多平台切换过滤、关键词即时搜索、新闻卡片流。
- ✅ **第 7 步：开发后台管理四大模块 (`/admin/*`)**
  - 编写 Dashboard（一键抓取与日志终端）、Config、Feeds（含详情页 `Detail/` 与 `children` 配置）、Keywords 模块及其 `meta.ts`。
- ✅ **第 8 步：全流程联调与体验打磨**
  - 验证自动路由跳转、详情页访问、Zustand 状态响应与持久化、黑白灰质感调优。
