# TrendRadar-Dashboard 项目级开发规范 (Project Rules)

本规则专用于当前 `TrendRadar-Dashboard` 项目。在进行任何代码编写、需求实现、重构或 Bug 修复时，AI 编程助手必须严格遵循以下规则：

---

## 一、 前端通用规范与 Skill 遵循 (Frontend Conventions)

1. **UI 与技术栈（严格基准规范，禁止随意更改）**：
   - 核心技术栈固定为 **React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Lucide React + react-router-dom + Zustand**。
   - **禁止引入和使用 Ant Design (antd / @ant-design/pro-components)**！所有 UI 必须全量统一使用 `shadcn/ui` 与 Tailwind CSS。
   - **视觉基调**：全量贯彻 **极简高级黑白灰（Zinc/Monochrome）极客美学**。
   - **全局状态管理**：全量统一采用 **`Zustand`**（配合 `persist` 中间件实现本地持久化），按业务拆分独立 Store 于 `src/stores/`。
   - **路由驱动体系**：所有页面模块统一在根目录维护 `meta.ts`（支持 `children` 递归嵌套详情页），由路由引擎自动扫描注册与生成侧栏菜单。
2. **组件架构与代码布局**：
   - 所有页面或主组件拆分出的子组件一律平级并列存放在所属模块根目录下，拒绝深层嵌套。
   - 所有 React 组件统一采用 `const ComponentName: React.FC<IProps> = (props) => { ... }` 箭头函数形式，参数在组件第一行解构。
   - 组件内部排版顺序遵循：`useState` -> `ref` -> `变量` -> `useEffect` -> `函数体`，文件底部独立默认导出。
3. **弹窗与状态管理**：
   - 弹窗/抽屉（Dialog/Sheet）一律遵循条件挂载销毁重建原则（`visible && <MyDialog onClose={handleClose} />`），内部 `open={true}`，不自管显隐状态。

---

## 二、 架构隔离与上游防冲突原则 (Upstream Safety & Decoupling)

1. **核心源码零侵入**：
   - 严禁修改上游原作者的 `trendradar/` 核心爬虫、AI 分析与算法源码文件。
   - 确保未来执行 `git merge upstream/main` 同步原作者更新时实现 **100% 自动无痛合并（0 冲突）**。
2. **独立目录隔离**：
   - 前端控制台源码统一存放在独立根目录 `frontend/` 下；
   - Web API 服务独立存放在 `docker/server.py`，不侵入上游逻辑。
3. **安全与凭据保护**：
   - 严禁将包含真实 Token/Key 的 `docker/.env` 或本地私密配置提交到 Git。
   - 公共示例统一维护在 `docker/.env.example`。

---

## 三、 语言与交互规范 (Communication & Workflow)

1. **中文说明**：所有任务计划（`implementation_plan.md`）、代码注释、架构文档均统一使用中文书写。
2. **类型安全与查阅源码**：严禁臆测配置项或 API 参数，必须基于 `config/config.yaml`、`docker/.env.example` 的实际结构与 TypeScript 类型定义进行开发。
