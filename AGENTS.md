# TrendRadar-Dashboard 项目规范 (AGENTS.md)

本文件定义了 Antigravity IDE 在本工作区内的项目级规则：

- 详细规则请参阅：[.agents/rules/project_rules.md](.agents/rules/project_rules.md)
- Git 提交规范：遵循 [.agents/rules/git_rules.md](.agents/rules/git_rules.md)
- 前端通用规范：遵循 `~/.gemini/antigravity-ide/skills/frontend_common_skills.md`

### 核心约束

1. **前端技术选型与规范（禁止使用 AntD）**：全量采用 **shadcn/ui + Tailwind CSS** 作为唯一 UI 体系，严禁引入 Ant Design；遵循组件平级组织、箭头函数声明、Props 顶部解构、销毁重建弹窗等前端规范。
2. **规范化 Git Commit**：遵循 `<type>: 概述` + 空行 + 简短具体描述（精炼克制）。
3. **上游防冲突隔离**：严禁修改 `trendradar/` 源码；前端代码独立放在 `frontend/`，API 服务独立放在 `docker/server.py`。
4. **敏感凭据保护**：禁止提交真实 `docker/.env`。
5. **全流程中文沟通**。
